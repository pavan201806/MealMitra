"""
Donation Ticket Agent
Creates intelligent, normalized donation tickets using LLM reasoning
Applies food safety rules and NGO requirements
"""
import logging
import uuid
from datetime import datetime, timedelta
from typing import Dict, Any
import json

from services.huggingface_client import HuggingFaceClient
from config import LLM_MODEL

logger = logging.getLogger(__name__)


class DonationTicketAgent:
    """
    Creates structured donation tickets with priority scoring
    Uses LLM reasoning to apply business rules
    """
    
    def __init__(self, hf_client: HuggingFaceClient = None):
        self.hf_client = hf_client or HuggingFaceClient()
        self.llm_model = LLM_MODEL
    
    def create_ticket(self, donation_data: Dict[str, Any], 
                     food_safety_result: Dict[str, Any]) -> Dict[str, Any]:
        """
        Create intelligent donation ticket
        
        Args:
            donation_data: Original donation data
            food_safety_result: Result from FoodSafetyAgent
        
        Returns:
            {
                "ticket_id": str,
                "priority_score": float,
                "expiry_window_minutes": int,
                "constraints": dict
            }
        """
        try:
            logger.info("Donation Ticket Agent: Creating ticket")
            
            # Generate unique ticket ID
            ticket_id = f"TKT-{uuid.uuid4().hex[:8].upper()}"
            
            # Calculate priority score
            priority_score = self._calculate_priority_score(donation_data, food_safety_result)
            
            # Determine expiry window
            expiry_window_minutes = self._calculate_expiry_window(
                donation_data.get("expiry_time"),
                food_safety_result.get("urgency_level", "medium")
            )
            
            # Generate constraints using LLM reasoning
            constraints = self._generate_constraints(donation_data, food_safety_result)
            
            ticket = {
                "ticket_id": ticket_id,
                "priority_score": round(priority_score, 3),
                "expiry_window_minutes": expiry_window_minutes,
                "constraints": constraints,
                "created_at": datetime.now().isoformat()
            }
            
            logger.info(f"Donation Ticket Agent: Ticket created - {ticket_id}, Priority: {priority_score:.2f}")
            return ticket
            
        except Exception as e:
            logger.error(f"Donation Ticket Agent error: {e}", exc_info=True)
            # Fallback ticket
            return {
                "ticket_id": f"TKT-{uuid.uuid4().hex[:8].upper()}",
                "priority_score": 0.5,
                "expiry_window_minutes": 120,
                "constraints": {},
                "error": str(e)
            }
    
    def _calculate_priority_score(self, donation_data: Dict[str, Any],
                                 food_safety_result: Dict[str, Any]) -> float:
        """
        Calculate priority score (0.0 to 1.0)
        Higher = more urgent/important
        """
        score = 0.5  # Base score
        
        # Urgency level contribution
        urgency = food_safety_result.get("urgency_level", "medium")
        urgency_weights = {"high": 0.4, "medium": 0.2, "low": 0.0}
        score += urgency_weights.get(urgency, 0.2)
        
        # Quantity contribution (more food = higher priority)
        quantity_str = str(donation_data.get("quantity", "")).lower()
        if "kg" in quantity_str or "kg" in quantity_str:
            try:
                qty_num = float(''.join(filter(str.isdigit, quantity_str.split()[0])))
                if qty_num > 10:
                    score += 0.1
                elif qty_num > 5:
                    score += 0.05
            except:
                pass
        
        # Food type contribution (perishable = higher priority)
        food_type = food_safety_result.get("food_type", "").lower()
        if "cooked" in food_type or "perishable" in food_type:
            score += 0.1
        
        # Safety confidence contribution (safe food = higher priority)
        confidence = food_safety_result.get("confidence", 0.5)
        score += confidence * 0.1
        
        return min(1.0, max(0.0, score))
    
    def _calculate_expiry_window(self, expiry_time: str, urgency_level: str) -> int:
        """
        Calculate expiry window in minutes
        """
        urgency_windows = {
            "high": 60,      # 1 hour
            "medium": 180,   # 3 hours
            "low": 360       # 6 hours
        }
        
        base_window = urgency_windows.get(urgency_level, 180)
        
        # Adjust based on actual expiry time if available
        if expiry_time:
            try:
                expiry_dt = datetime.fromisoformat(expiry_time.replace('Z', '+00:00'))
                now = datetime.now(expiry_dt.tzinfo) if expiry_dt.tzinfo else datetime.now()
                time_until_expiry = expiry_dt - now
                minutes_until_expiry = int(time_until_expiry.total_seconds() / 60)
                
                # Use actual expiry time if shorter than base window
                if minutes_until_expiry > 0:
                    return min(base_window, minutes_until_expiry)
            except:
                pass
        
        return base_window
    
    def _generate_constraints(self, donation_data: Dict[str, Any],
                            food_safety_result: Dict[str, Any]) -> Dict[str, Any]:
        """
        Generate constraints for matching using LLM reasoning
        Falls back to rule-based if LLM fails
        """
        try:
            # Use LLM to generate constraints
            prompt = self._build_constraints_prompt(donation_data, food_safety_result)
            
            response = self.hf_client.text_generation(
                self.llm_model,
                prompt,
                max_length=200,
                temperature=0.3
            )
            
            generated_text = response.get("generated_text", "")
            
            # Try to parse JSON from response
            try:
                # Extract JSON if present
                import re
                json_match = re.search(r'\{[^}]+\}', generated_text)
                if json_match:
                    constraints = json.loads(json_match.group())
                    return constraints
            except:
                pass
            
            # Fallback to rule-based constraints
            return self._rule_based_constraints(donation_data, food_safety_result)
            
        except Exception as e:
            logger.warning(f"LLM constraint generation failed: {e}, using rule-based")
            return self._rule_based_constraints(donation_data, food_safety_result)
    
    def _build_constraints_prompt(self, donation_data: Dict[str, Any],
                                 food_safety_result: Dict[str, Any]) -> str:
        """Build prompt for LLM constraint generation"""
        return f"""Given this donation:
Food: {donation_data.get('food_name')}
Type: {food_safety_result.get('food_type')}
Quantity: {donation_data.get('quantity')}
Urgency: {food_safety_result.get('urgency_level')}
Location: {donation_data.get('pickup_address')}

Generate JSON constraints for volunteer and NGO matching:
{{
  "max_distance_km": number,
  "required_equipment": ["list"],
  "special_requirements": "string",
  "preferred_ngo_types": ["list"]
}}

Respond with JSON only:"""
    
    def _rule_based_constraints(self, donation_data: Dict[str, Any],
                               food_safety_result: Dict[str, Any]) -> Dict[str, Any]:
        """Rule-based constraint generation (fallback)"""
        urgency = food_safety_result.get("urgency_level", "medium")
        food_type = food_safety_result.get("food_type", "").lower()
        
        constraints = {
            "max_distance_km": 50.0 if urgency == "low" else (30.0 if urgency == "medium" else 15.0),
            "required_equipment": [],
            "special_requirements": "",
            "preferred_ngo_types": []
        }
        
        # Add equipment requirements based on food type
        if "hot" in food_type or "cooked" in food_type:
            constraints["required_equipment"].append("insulated_container")
        
        if "frozen" in food_type:
            constraints["required_equipment"].append("cooler")
        
        # Add special requirements
        if urgency == "high":
            constraints["special_requirements"] = "Immediate pickup required"
        
        return constraints

