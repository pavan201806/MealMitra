"""
AI Service Flask Application
Main entry point for the AI orchestration service
"""
import logging
import os
from flask import Flask, request, jsonify
from flask_cors import CORS
from datetime import datetime

from orchestrator.donation_flow import DonationFlowOrchestrator
from config import AI_SERVICE_HOST, AI_SERVICE_PORT, LOG_LEVEL

# Configure logging
logging.basicConfig(
    level=getattr(logging, LOG_LEVEL),
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
    handlers=[
        logging.FileHandler('ai_service.log'),
        logging.StreamHandler()
    ]
)

logger = logging.getLogger(__name__)

app = Flask(__name__)
CORS(app)  # Enable CORS for Node.js backend

# Initialize orchestrator
orchestrator = DonationFlowOrchestrator()


@app.route('/health', methods=['GET'])
def health_check():
    """Health check endpoint"""
    return jsonify({
        "status": "healthy",
        "service": "ai-orchestration-service",
        "timestamp": datetime.now().isoformat()
    })


@app.route('/ai/orchestrate/donation', methods=['POST'])
def orchestrate_donation():
    """
    Main orchestration endpoint
    
    Expected Request Body:
    {
        "donor_id": int,
        "food_name": str,
        "food_type": str,
        "quantity": str,
        "pickup_address": str,
        "expiry_time": str (ISO format),
        "image_url": str (publicly accessible HTTP/HTTPS URL)
    }
    
    Response (Success):
    {
        "success": true,
        "rejected": false,
        "error": false,
        "state": "complete",
        "results": {
            "food_safety": {...},
            "ticket": {...},
            "assignment": {...},
            "monitoring": {...},
            "rewards": {...}
        },
        "summary": {
            "ticket_id": "TKT-...",
            "volunteer_id": "...",
            "ngo_id": "...",
            "safe": true,
            "priority_score": 0.85
        }
    }
    
    Response (Rejected - Unsafe Food):
    {
        "success": false,
        "rejected": true,
        "error": false,
        "state": "rejected",
        "results": {
            "food_safety": {
                "safe": false,
                "confidence": 0.45,
                "reason": "..."
            }
        },
        "summary": {
            "reason": "...",
            "confidence": 0.45
        }
    }
    
    Response (Error):
    {
        "success": false,
        "rejected": false,
        "error": true,
        "state": "error",
        "results": {},
        "errors": [...]
    }
    """
    try:
        # Validate request
        if not request.is_json:
            return jsonify({
                "success": False,
                "error": True,
                "message": "Request must be JSON"
            }), 400
        
        donation_data = request.get_json()
        
        # Validate required fields
        required_fields = ["donor_id", "food_name", "food_type", "quantity", 
                          "pickup_address", "expiry_time", "image_url"]
        missing_fields = [field for field in required_fields if field not in donation_data]
        
        if missing_fields:
            return jsonify({
                "success": False,
                "error": True,
                "message": f"Missing required fields: {', '.join(missing_fields)}"
            }), 400
        
        # Validate image_url format
        image_url = donation_data.get("image_url")
        if image_url and not isinstance(image_url, str):
            return jsonify({
                "success": False,
                "error": True,
                "message": "image_url must be a string"
            }), 400
        
        if image_url and not (image_url.startswith('http://') or image_url.startswith('https://')):
            return jsonify({
                "success": False,
                "error": True,
                "message": "image_url must start with http:// or https://"
            }), 400
        
        logger.info(f"Orchestrating donation for donor {donation_data.get('donor_id')}")
        
        # Execute orchestration
        result = orchestrator.orchestrate(donation_data)
        
        # Determine HTTP status code
        if result.get("rejected"):
            status_code = 200  # Still 200, but rejected flag indicates rejection
        elif result.get("error"):
            status_code = 500
        else:
            status_code = 200
        
        return jsonify(result), status_code
        
    except Exception as e:
        logger.error(f"Orchestration endpoint error: {e}", exc_info=True)
        return jsonify({
            "success": False,
            "error": True,
            "message": str(e),
            "state": "error"
        }), 500


@app.route('/ai/monitor/<ticket_id>', methods=['GET'])
def get_monitoring_status(ticket_id: str):
    """
    Get monitoring status for a donation ticket
    
    Response:
    {
        "ticket_id": "...",
        "status": "pending_acceptance|accepted|picked_up|delivered|failed",
        "checkpoints": {...},
        "flags_count": 0,
        "delays_count": 0
    }
    """
    try:
        monitoring_summary = orchestrator.monitor_agent.get_monitoring_summary(ticket_id)
        
        if not monitoring_summary:
            return jsonify({
                "error": True,
                "message": f"Ticket {ticket_id} not found"
            }), 404
        
        return jsonify(monitoring_summary), 200
        
    except Exception as e:
        logger.error(f"Monitoring status error: {e}", exc_info=True)
        return jsonify({
            "error": True,
            "message": str(e)
        }), 500


@app.route('/ai/monitor/<ticket_id>/update', methods=['POST'])
def update_monitoring_status(ticket_id: str):
    """
    Update monitoring status
    
    Request Body:
    {
        "status": "accepted|picked_up|delivered|failed",
        "checkpoint": "acceptance|pickup|delivery" (optional)
    }
    """
    try:
        data = request.get_json()
        status = data.get("status")
        checkpoint = data.get("checkpoint")
        
        if not status:
            return jsonify({
                "error": True,
                "message": "status field required"
            }), 400
        
        updated = orchestrator.monitor_agent.update_status(ticket_id, status, checkpoint)
        
        if not updated:
            return jsonify({
                "error": True,
                "message": f"Ticket {ticket_id} not found"
            }), 404
        
        return jsonify(updated), 200
        
    except Exception as e:
        logger.error(f"Update monitoring error: {e}", exc_info=True)
        return jsonify({
            "error": True,
            "message": str(e)
        }), 500


if __name__ == '__main__':
    logger.info(f"Starting AI Service on {AI_SERVICE_HOST}:{AI_SERVICE_PORT}")
    app.run(host=AI_SERVICE_HOST, port=AI_SERVICE_PORT, debug=False)

