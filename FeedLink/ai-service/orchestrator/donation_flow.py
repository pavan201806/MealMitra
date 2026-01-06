"""
Donation Flow Orchestrator
LangGraph-style graph orchestration for multi-agent donation processing
"""
import logging
from typing import Dict, Any, Optional
from enum import Enum

from agents.food_safety_agent import FoodSafetyAgent
from agents.donation_ticket_agent import DonationTicketAgent
from agents.matching_agent import MatchingAgent
from agents.execution_monitor_agent import ExecutionMonitorAgent
from agents.rewards_agent import RewardsAgent

logger = logging.getLogger(__name__)


class FlowState(Enum):
    """Flow state enumeration"""
    INIT = "init"
    FOOD_SAFETY_CHECK = "food_safety_check"
    TICKET_CREATION = "ticket_creation"
    MATCHING = "matching"
    MONITORING_INIT = "monitoring_init"
    REWARDS_CALCULATION = "rewards_calculation"
    COMPLETE = "complete"
    REJECTED = "rejected"
    ERROR = "error"


class DonationFlowOrchestrator:
    """
    Orchestrates multi-agent donation processing flow
    Implements LangGraph-style graph with conditional branching
    """
    
    def __init__(self):
        self.food_safety_agent = FoodSafetyAgent()
        self.ticket_agent = DonationTicketAgent()
        self.matching_agent = MatchingAgent()
        self.monitor_agent = ExecutionMonitorAgent()
        self.rewards_agent = RewardsAgent()
        
        # Flow state tracking
        self.flow_log = []
    
    def orchestrate(self, donation_data: Dict[str, Any]) -> Dict[str, Any]:
        """
        Main orchestration method
        Executes the complete donation flow
        
        Args:
            donation_data: {
                "donor_id": int,
                "food_name": str,
                "food_type": str,
                "quantity": str,
                "pickup_address": str,
                "expiry_time": str,
                "image_url": str (publicly accessible HTTP/HTTPS URL)
            }
        
        Returns:
            Complete orchestration result with all agent outputs
        """
        try:
            logger.info("Orchestrator: Starting donation flow")
            
            # Initialize flow state
            flow_state = {
                "state": FlowState.INIT,
                "donation_data": donation_data,
                "results": {},
                "errors": []
            }
            
            # Step 1: Food Safety Check
            flow_state = self._execute_food_safety_check(flow_state)
            
            # Branch: If unsafe, reject and exit
            if flow_state["state"] == FlowState.REJECTED:
                return self._build_response(flow_state, rejected=True)
            
            # Step 2: Create Donation Ticket
            flow_state = self._execute_ticket_creation(flow_state)
            
            if flow_state["state"] == FlowState.ERROR:
                return self._build_response(flow_state, error=True)
            
            # Step 3: Matching & Assignment
            flow_state = self._execute_matching(flow_state)
            
            if flow_state["state"] == FlowState.ERROR:
                return self._build_response(flow_state, error=True)
            
            # Step 4: Initialize Monitoring
            flow_state = self._execute_monitoring_init(flow_state)
            
            # Step 5: Calculate Rewards
            flow_state = self._execute_rewards_calculation(flow_state)
            
            # Complete
            flow_state["state"] = FlowState.COMPLETE
            return self._build_response(flow_state, success=True)
            
        except Exception as e:
            error_msg = str(e)
            logger.error(f"Orchestrator error: {error_msg}", exc_info=True)
            
            # Return structured error response (never throw unhandled exceptions)
            return {
                "success": False,
                "error": True,
                "error_message": f"Orchestration failed: {error_msg}",
                "state": FlowState.ERROR.value,
                "results": {},
                "errors": [{"step": "orchestration", "error": error_msg}]
            }
    
    def _execute_food_safety_check(self, flow_state: Dict[str, Any]) -> Dict[str, Any]:
        """Execute food safety check agent"""
        try:
            logger.info("Orchestrator: Executing Food Safety Check")
            flow_state["state"] = FlowState.FOOD_SAFETY_CHECK
            
            donation_data = flow_state["donation_data"]
            image_url = donation_data.get("image_url")
            
            # Validate image URL is present
            if not image_url:
                raise ValueError("Food image URL is required")
            
            # Validate image URL format
            if not isinstance(image_url, str) or not (image_url.startswith('http://') or image_url.startswith('https://')):
                raise ValueError("Image URL must be a valid HTTP/HTTPS URL")
            
            metadata = {
                "food_name": donation_data.get("food_name"),
                "food_type": donation_data.get("food_type"),
                "quantity": donation_data.get("quantity"),
                "expiry_time": donation_data.get("expiry_time"),
                "pickup_address": donation_data.get("pickup_address")
            }
            
            food_safety_result = self.food_safety_agent.analyze(image_url, metadata)
            flow_state["results"]["food_safety"] = food_safety_result
            
            # Branch: Reject if unsafe
            if not food_safety_result.get("safe", False):
                flow_state["state"] = FlowState.REJECTED
                logger.warning("Orchestrator: Food rejected - unsafe")
            else:
                logger.info("Orchestrator: Food safety check passed")
            
            return flow_state
            
        except Exception as e:
            logger.error(f"Food safety check error: {e}")
            flow_state["state"] = FlowState.ERROR
            flow_state["errors"].append({"step": "food_safety_check", "error": str(e)})
            return flow_state
    
    def _execute_ticket_creation(self, flow_state: Dict[str, Any]) -> Dict[str, Any]:
        """Execute donation ticket creation agent"""
        try:
            logger.info("Orchestrator: Executing Ticket Creation")
            flow_state["state"] = FlowState.TICKET_CREATION
            
            donation_data = flow_state["donation_data"]
            food_safety_result = flow_state["results"]["food_safety"]
            
            ticket = self.ticket_agent.create_ticket(donation_data, food_safety_result)
            flow_state["results"]["ticket"] = ticket
            
            logger.info(f"Orchestrator: Ticket created - {ticket.get('ticket_id')}")
            return flow_state
            
        except Exception as e:
            logger.error(f"Ticket creation error: {e}")
            flow_state["state"] = FlowState.ERROR
            flow_state["errors"].append({"step": "ticket_creation", "error": str(e)})
            return flow_state
    
    def _execute_matching(self, flow_state: Dict[str, Any]) -> Dict[str, Any]:
        """Execute matching and assignment agent"""
        try:
            logger.info("Orchestrator: Executing Matching")
            flow_state["state"] = FlowState.MATCHING
            
            donation_data = flow_state["donation_data"]
            food_safety_result = flow_state["results"]["food_safety"]
            ticket = flow_state["results"]["ticket"]
            
            # Validate that donation has pickup address (required for geocoding)
            pickup_address = donation_data.get("pickup_address")
            if not pickup_address:
                error_msg = "Donation missing pickup address - cannot perform matching"
                logger.error(f"Orchestrator: {error_msg}")
                flow_state["state"] = FlowState.ERROR
                flow_state["errors"].append({"step": "matching", "error": error_msg})
                return flow_state
            
            assignment = self.matching_agent.match(ticket, donation_data, food_safety_result)
            flow_state["results"]["assignment"] = assignment
            
            logger.info(f"Orchestrator: Matched Volunteer {assignment.get('assigned_volunteer_id')}, "
                       f"NGO {assignment.get('assigned_ngo_id')}")
            return flow_state
            
        except Exception as e:
            error_msg = str(e)
            logger.error(f"Orchestrator: Matching error - {error_msg}")
            
            # Provide clear error message based on error type
            if "No available volunteers" in error_msg or "No available NGOs" in error_msg:
                user_friendly_error = "No volunteers or NGOs are currently available for matching. Please try again later."
            elif "Could not geocode" in error_msg or "pickup address" in error_msg.lower():
                user_friendly_error = f"Could not process pickup location: {error_msg}"
            elif "Could not find suitable matches" in error_msg:
                user_friendly_error = "No suitable matches found within distance constraints. Please try a different pickup location."
            else:
                user_friendly_error = f"Matching failed: {error_msg}"
            
            flow_state["state"] = FlowState.ERROR
            flow_state["errors"].append({
                "step": "matching", 
                "error": user_friendly_error,
                "technical_error": error_msg
            })
            return flow_state
    
    def _execute_monitoring_init(self, flow_state: Dict[str, Any]) -> Dict[str, Any]:
        """Initialize execution monitoring"""
        try:
            logger.info("Orchestrator: Initializing Monitoring")
            flow_state["state"] = FlowState.MONITORING_INIT
            
            ticket = flow_state["results"]["ticket"]
            assignment = flow_state["results"]["assignment"]
            
            monitoring_config = self.monitor_agent.initialize_monitoring(
                ticket.get("ticket_id"),
                assignment,
                ticket
            )
            flow_state["results"]["monitoring"] = monitoring_config
            
            return flow_state
            
        except Exception as e:
            logger.error(f"Monitoring init error: {e}")
            # Non-critical, continue flow
            flow_state["results"]["monitoring"] = {"error": str(e)}
            return flow_state
    
    def _execute_rewards_calculation(self, flow_state: Dict[str, Any]) -> Dict[str, Any]:
        """Calculate donor rewards"""
        try:
            logger.info("Orchestrator: Calculating Rewards")
            flow_state["state"] = FlowState.REWARDS_CALCULATION
            
            donation_data = flow_state["donation_data"]
            food_safety_result = flow_state["results"]["food_safety"]
            ticket = flow_state["results"]["ticket"]
            
            rewards = self.rewards_agent.calculate_donor_rewards(
                donation_data,
                food_safety_result,
                ticket
            )
            flow_state["results"]["rewards"] = rewards
            
            return flow_state
            
        except Exception as e:
            logger.error(f"Rewards calculation error: {e}")
            # Non-critical, continue flow
            flow_state["results"]["rewards"] = {"error": str(e)}
            return flow_state
    
    def _build_response(self, flow_state: Dict[str, Any], success: bool = False,
                       rejected: bool = False, error: bool = False) -> Dict[str, Any]:
        """Build final response"""
        response = {
            "success": success and not rejected and not error,
            "rejected": rejected,
            "error": error,
            "state": flow_state["state"].value if isinstance(flow_state["state"], FlowState) else str(flow_state["state"]),
            "results": flow_state["results"],
            "errors": flow_state.get("errors", [])
        }
        
        # Add summary for easy access
        if success:
            response["summary"] = {
                "ticket_id": flow_state["results"].get("ticket", {}).get("ticket_id"),
                "volunteer_id": flow_state["results"].get("assignment", {}).get("assigned_volunteer_id"),
                "ngo_id": flow_state["results"].get("assignment", {}).get("assigned_ngo_id"),
                "safe": flow_state["results"].get("food_safety", {}).get("safe"),
                "priority_score": flow_state["results"].get("ticket", {}).get("priority_score")
            }
        elif rejected:
            response["summary"] = {
                "reason": flow_state["results"].get("food_safety", {}).get("reason", "Food safety validation failed"),
                "confidence": flow_state["results"].get("food_safety", {}).get("confidence", 0.0)
            }
        
        return response

