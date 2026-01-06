"""
Rewards & Reputation Agent
Assigns donor rewards and updates volunteer/NGO trust scores
"""
import logging
from typing import Dict, Any, Optional
from datetime import datetime

logger = logging.getLogger(__name__)


class RewardsAgent:
    """
    Manages rewards and reputation system
    Calculates rewards for donors and updates trust scores
    """
    
    def __init__(self):
        self.rewards_history = {}  # In production, use database
    
    def calculate_donor_rewards(self, donation_data: Dict[str, Any],
                               food_safety_result: Dict[str, Any],
                               ticket: Dict[str, Any],
                               execution_result: Optional[Dict[str, Any]] = None) -> Dict[str, Any]:
        """
        Calculate rewards for donor
        
        Args:
            donation_data: Original donation data
            food_safety_result: Food safety analysis
            ticket: Donation ticket
            execution_result: Execution monitoring result (if available)
        
        Returns:
            Rewards breakdown
        """
        try:
            logger.info("Rewards Agent: Calculating donor rewards")
            
            base_points = 10  # Base points for donation
            
            # Quality bonus (safe food)
            if food_safety_result.get("safe", False):
                quality_bonus = int(food_safety_result.get("confidence", 0.5) * 20)
                base_points += quality_bonus
            
            # Quantity bonus
            quantity_str = str(donation_data.get("quantity", "")).lower()
            try:
                if "kg" in quantity_str:
                    qty_num = float(''.join(filter(str.isdigit, quantity_str.split()[0])))
                    if qty_num >= 10:
                        base_points += 15
                    elif qty_num >= 5:
                        base_points += 10
                    elif qty_num >= 2:
                        base_points += 5
            except:
                pass
            
            # Urgency bonus (donating high-urgency food)
            urgency = food_safety_result.get("urgency_level", "medium")
            urgency_bonus = {"high": 20, "medium": 10, "low": 5}
            base_points += urgency_bonus.get(urgency, 10)
            
            # Priority bonus
            priority_score = ticket.get("priority_score", 0.5)
            priority_bonus = int(priority_score * 15)
            base_points += priority_bonus
            
            # Execution bonus (if donation was successfully delivered)
            execution_bonus = 0
            if execution_result and execution_result.get("status") == "delivered":
                execution_bonus = 25
                base_points += execution_bonus
            
            rewards = {
                "donor_id": donation_data.get("donor_id"),
                "points": base_points,
                "breakdown": {
                    "base_points": 10,
                    "quality_bonus": quality_bonus if food_safety_result.get("safe") else 0,
                    "quantity_bonus": base_points - 10 - quality_bonus - urgency_bonus.get(urgency, 10) - priority_bonus - execution_bonus,
                    "urgency_bonus": urgency_bonus.get(urgency, 10),
                    "priority_bonus": priority_bonus,
                    "execution_bonus": execution_bonus
                },
                "tier": self._calculate_tier(base_points),
                "timestamp": datetime.now().isoformat()
            }
            
            logger.info(f"Rewards Agent: Donor {donation_data.get('donor_id')} earned {base_points} points")
            return rewards
            
        except Exception as e:
            logger.error(f"Rewards Agent error: {e}", exc_info=True)
            return {
                "donor_id": donation_data.get("donor_id"),
                "points": 10,
                "breakdown": {},
                "tier": "bronze",
                "error": str(e)
            }
    
    def calculate_trust_updates(self, volunteer_id: str, ngo_id: str,
                               execution_result: Dict[str, Any]) -> Dict[str, Any]:
        """
        Calculate trust score updates for volunteer and NGO
        
        Args:
            volunteer_id: Volunteer ID
            ngo_id: NGO ID
            execution_result: Execution monitoring result
        
        Returns:
            Trust score updates
        """
        reliability_delta = execution_result.get("reliability_delta", 0.0)
        
        # Trust score is similar to reliability but with different scaling
        trust_delta = reliability_delta * 1.5  # Trust changes faster than reliability
        
        return {
            "volunteer_id": volunteer_id,
            "ngo_id": ngo_id,
            "volunteer_trust_delta": round(trust_delta, 3),
            "ngo_trust_delta": round(trust_delta, 3),
            "reason": self._generate_trust_reason(execution_result)
        }
    
    def _calculate_tier(self, points: int) -> str:
        """Calculate donor tier based on points"""
        if points >= 100:
            return "platinum"
        elif points >= 50:
            return "gold"
        elif points >= 25:
            return "silver"
        else:
            return "bronze"
    
    def _generate_trust_reason(self, execution_result: Dict[str, Any]) -> str:
        """Generate reason for trust score change"""
        status = execution_result.get("status", "unknown")
        reliability_delta = execution_result.get("reliability_delta", 0.0)
        
        if reliability_delta > 0:
            return f"Trust increased due to successful delivery (status: {status})"
        elif reliability_delta < 0:
            flags = execution_result.get("flags_count", 0)
            delays = execution_result.get("delays_count", 0)
            return f"Trust decreased due to execution issues (flags: {flags}, delays: {delays})"
        else:
            return "No trust change"

