"""
Execution Monitor Agent
Tracks donation execution lifecycle: acceptance, pickup, delivery
Flags failures and delays, updates reliability metrics
"""
import logging
from datetime import datetime, timedelta
from typing import Dict, Any, Optional

logger = logging.getLogger(__name__)


class ExecutionMonitorAgent:
    """
    Monitors donation execution and tracks metrics
    Updates reliability scores for volunteers and NGOs
    """
    
    def __init__(self):
        self.monitoring_data = {}  # In production, use database
    
    def initialize_monitoring(self, ticket_id: str, assignment: Dict[str, Any],
                            ticket: Dict[str, Any]) -> Dict[str, Any]:
        """
        Initialize monitoring for a donation
        
        Args:
            ticket_id: Donation ticket ID
            assignment: Assignment result from MatchingAgent
            ticket: Donation ticket
        
        Returns:
            Monitoring configuration
        """
        expiry_window = ticket.get("expiry_window_minutes", 180)
        deadline = datetime.now() + timedelta(minutes=expiry_window)
        
        monitoring_config = {
            "ticket_id": ticket_id,
            "volunteer_id": assignment.get("assigned_volunteer_id"),
            "ngo_id": assignment.get("assigned_ngo_id"),
            "status": "pending_acceptance",
            "created_at": datetime.now().isoformat(),
            "deadline": deadline.isoformat(),
            "expiry_window_minutes": expiry_window,
            "checkpoints": {
                "acceptance": None,
                "pickup": None,
                "delivery": None
            },
            "delays": [],
            "flags": []
        }
        
        self.monitoring_data[ticket_id] = monitoring_config
        logger.info(f"Execution Monitor: Initialized monitoring for {ticket_id}")
        
        return monitoring_config
    
    def update_status(self, ticket_id: str, status: str, 
                     checkpoint: Optional[str] = None) -> Dict[str, Any]:
        """
        Update donation status
        
        Args:
            ticket_id: Donation ticket ID
            status: New status (pending_acceptance, accepted, picked_up, delivered, failed)
            checkpoint: Checkpoint name (acceptance, pickup, delivery)
        
        Returns:
            Updated monitoring data
        """
        if ticket_id not in self.monitoring_data:
            logger.warning(f"Execution Monitor: Ticket {ticket_id} not found")
            return {}
        
        monitoring = self.monitoring_data[ticket_id]
        monitoring["status"] = status
        
        if checkpoint:
            monitoring["checkpoints"][checkpoint] = datetime.now().isoformat()
        
        # Check for delays
        self._check_delays(ticket_id, monitoring)
        
        logger.info(f"Execution Monitor: {ticket_id} -> {status}")
        return monitoring
    
    def _check_delays(self, ticket_id: str, monitoring: Dict[str, Any]):
        """Check for delays and flag issues"""
        deadline = datetime.fromisoformat(monitoring["deadline"])
        now = datetime.now()
        
        if now > deadline and monitoring["status"] != "delivered":
            delay_minutes = (now - deadline).total_seconds() / 60
            
            delay_flag = {
                "type": "deadline_exceeded",
                "severity": "high" if delay_minutes > 60 else "medium",
                "delay_minutes": delay_minutes,
                "timestamp": now.isoformat()
            }
            
            monitoring["delays"].append(delay_flag)
            monitoring["flags"].append(delay_flag)
            
            logger.warning(f"Execution Monitor: {ticket_id} exceeded deadline by {delay_minutes:.1f} minutes")
        
        # Check checkpoint delays
        if monitoring["status"] == "accepted":
            acceptance_time = monitoring["checkpoints"].get("acceptance")
            if acceptance_time:
                acceptance_dt = datetime.fromisoformat(acceptance_time)
                time_since_acceptance = (now - acceptance_dt).total_seconds() / 60
                
                # Flag if accepted but not picked up within reasonable time
                if time_since_acceptance > 30:  # 30 minutes
                    monitoring["flags"].append({
                        "type": "pickup_delay",
                        "severity": "medium",
                        "delay_minutes": time_since_acceptance,
                        "timestamp": now.isoformat()
                    })
    
    def flag_issue(self, ticket_id: str, issue_type: str, severity: str,
                   description: str) -> Dict[str, Any]:
        """
        Flag an issue with the donation execution
        
        Args:
            ticket_id: Donation ticket ID
            issue_type: Type of issue (volunteer_unavailable, ngo_rejected, etc.)
            severity: Severity level (low, medium, high)
            description: Description of the issue
        
        Returns:
            Updated monitoring data
        """
        if ticket_id not in self.monitoring_data:
            return {}
        
        monitoring = self.monitoring_data[ticket_id]
        
        flag = {
            "type": issue_type,
            "severity": severity,
            "description": description,
            "timestamp": datetime.now().isoformat()
        }
        
        monitoring["flags"].append(flag)
        
        if severity == "high":
            monitoring["status"] = "failed"
        
        logger.warning(f"Execution Monitor: Flagged {issue_type} for {ticket_id}: {description}")
        return monitoring
    
    def get_reliability_update(self, ticket_id: str) -> Dict[str, Any]:
        """
        Calculate reliability score updates based on execution
        
        Args:
            ticket_id: Donation ticket ID
        
        Returns:
            Reliability updates for volunteer and NGO
        """
        if ticket_id not in self.monitoring_data:
            return {}
        
        monitoring = self.monitoring_data[ticket_id]
        
        # Calculate reliability delta
        reliability_delta = 0.0
        
        if monitoring["status"] == "delivered":
            # Successful delivery increases reliability
            reliability_delta = 0.05
            
            # Check for on-time delivery
            deadline = datetime.fromisoformat(monitoring["deadline"])
            delivery_time = monitoring["checkpoints"].get("delivery")
            if delivery_time:
                delivery_dt = datetime.fromisoformat(delivery_time)
                if delivery_dt <= deadline:
                    reliability_delta += 0.02  # Bonus for on-time
        
        elif monitoring["status"] == "failed":
            # Failed delivery decreases reliability
            reliability_delta = -0.1
        
        # Penalty for delays
        if monitoring["delays"]:
            reliability_delta -= len(monitoring["delays"]) * 0.02
        
        # Penalty for flags
        high_severity_flags = [f for f in monitoring["flags"] if f.get("severity") == "high"]
        reliability_delta -= len(high_severity_flags) * 0.05
        
        return {
            "volunteer_id": monitoring.get("volunteer_id"),
            "ngo_id": monitoring.get("ngo_id"),
            "reliability_delta": round(reliability_delta, 3),
            "status": monitoring["status"],
            "flags_count": len(monitoring["flags"]),
            "delays_count": len(monitoring["delays"])
        }
    
    def get_monitoring_summary(self, ticket_id: str) -> Dict[str, Any]:
        """Get current monitoring summary"""
        if ticket_id not in self.monitoring_data:
            return {}
        
        monitoring = self.monitoring_data[ticket_id]
        
        return {
            "ticket_id": ticket_id,
            "status": monitoring["status"],
            "checkpoints": monitoring["checkpoints"],
            "flags_count": len(monitoring["flags"]),
            "delays_count": len(monitoring["delays"]),
            "active_flags": [f for f in monitoring["flags"] if f.get("severity") in ["high", "medium"]]
        }

