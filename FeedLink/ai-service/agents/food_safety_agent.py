"""
Food Safety & Quality Agent
Deterministic rule-based food safety analysis
No external API calls - operates fully locally
"""

import logging
from datetime import datetime
from typing import Dict, Any, Optional

from config import (
    URGENCY_THRESHOLD_HIGH,
    URGENCY_THRESHOLD_MEDIUM
)

logger = logging.getLogger(__name__)


class FoodSafetyAgent:
    """
    Validates food safety using deterministic rules.
    Analyzes food metadata to determine safety and urgency.
    No external network calls - fully local operation.
    """

    def __init__(self):
        """Initialize agent - no external dependencies"""
        pass

    def analyze(self, image_url: str, metadata: Dict[str, Any]) -> Dict[str, Any]:
        """
        Analyze food metadata for safety using deterministic rules
        
        Args:
            image_url: Image URL (stored only, not processed)
            metadata: Dict with keys: food_name, food_type, quantity, expiry_time, pickup_address
        
        Returns:
            {
                "safe": bool,
                "confidence": float,
                "food_type": str,
                "urgency_level": "low|medium|high",
                "reason": str
            }
        """
        try:
            logger.info(
                f"Food Safety Agent: Analyzing food - "
                f"{metadata.get('food_name', 'Unknown')}"
            )

            # Extract metadata
            food_type = metadata.get("food_type", "unknown")
            expiry_time = metadata.get("expiry_time")
            
            # Calculate urgency first (needed for rules)
            urgency_level = self._calculate_urgency(expiry_time)
            
            # Apply deterministic safety rules
            safety_result = self._apply_safety_rules(food_type, expiry_time)
            
            result = {
                "safe": safety_result["safe"],
                "confidence": safety_result["confidence"],
                "food_type": food_type,
                "urgency_level": urgency_level,
                "reason": safety_result["reason"]
            }
            
            logger.info(
                f"Food Safety Agent result -> safe={result['safe']}, "
                f"confidence={result['confidence']:.2f}, "
                f"urgency={urgency_level}"
            )

            return result

        except Exception as e:
            logger.error(f"Food Safety Agent error: {e}", exc_info=True)
            
            # Fail-safe: reject on error
            return {
                "safe": False,
                "confidence": 0.3,
                "food_type": metadata.get("food_type", "unknown"),
                "urgency_level": "medium",
                "reason": f"Analysis error: {str(e)}"
            }

    def _apply_safety_rules(self, food_type: str, expiry_time: Optional[str]) -> Dict[str, Any]:
        """
        Apply deterministic safety rules
        
        Rules:
        - If expiry_time < current_time → unsafe
        - If food_type == "raw" → unsafe
        - If food_type == "cooked" and expiry < 6 hours → unsafe
        - If food_type == "packaged" → safe
        - If food_type in ["fruits", "vegetables"] and not expired → safe
        
        Confidence:
        - 0.9 for clear safe
        - 0.3 for unsafe
        - 0.6 for borderline
        """
        food_type_lower = str(food_type).lower()
        hours_until_expiry = self._get_hours_until_expiry(expiry_time)
        
        # Rule 1: Expired food is unsafe
        if hours_until_expiry is not None and hours_until_expiry < 0:
            return {
                "safe": False,
                "confidence": 0.3,
                "reason": f"Food has expired ({abs(hours_until_expiry):.1f} hours ago)"
            }
        
        # Rule 2: Raw food is unsafe
        if food_type_lower == "raw":
            return {
                "safe": False,
                "confidence": 0.3,
                "reason": "Raw food requires special handling and cannot be safely donated"
            }
        
        # Rule 3: Cooked food with < 6 hours expiry is unsafe
        if food_type_lower == "cooked":
            if hours_until_expiry is not None and hours_until_expiry < 6:
                return {
                    "safe": False,
                    "confidence": 0.3,
                    "reason": f"Cooked food expires in {hours_until_expiry:.1f} hours (minimum 6 hours required)"
                }
            else:
                # Cooked food with sufficient time is safe
                return {
                    "safe": True,
                    "confidence": 0.9,
                    "reason": f"Cooked food is safe (expires in {hours_until_expiry:.1f} hours)" if hours_until_expiry else "Cooked food is safe"
                }
        
        # Rule 4: Packaged food is safe
        if food_type_lower == "packaged" or "packaged" in food_type_lower:
            return {
                "safe": True,
                "confidence": 0.9,
                "reason": "Packaged food is safe for donation"
            }
        
        # Rule 5: Fruits and vegetables (not expired) are safe
        if food_type_lower in ["fruits", "vegetables", "fruit", "vegetable"]:
            if hours_until_expiry is not None and hours_until_expiry < 0:
                return {
                    "safe": False,
                    "confidence": 0.3,
                    "reason": "Fruits/vegetables have expired"
                }
            else:
                return {
                    "safe": True,
                    "confidence": 0.9,
                    "reason": f"Fresh {food_type_lower} are safe for donation"
                }
        
        # Default: Borderline case - check expiry
        if hours_until_expiry is not None:
            if hours_until_expiry < 2:
                return {
                    "safe": False,
                    "confidence": 0.3,
                    "reason": f"Food expires in {hours_until_expiry:.1f} hours - too short for safe donation"
                }
            elif hours_until_expiry < 6:
                return {
                    "safe": True,
                    "confidence": 0.6,
                    "reason": f"Borderline case: expires in {hours_until_expiry:.1f} hours"
                }
            else:
                return {
                    "safe": True,
                    "confidence": 0.9,
                    "reason": f"Food is safe (expires in {hours_until_expiry:.1f} hours)"
                }
        
        # No expiry time provided - default to safe but lower confidence
        return {
            "safe": True,
            "confidence": 0.6,
            "reason": f"Food type '{food_type}' - no expiry time provided, assuming safe"
        }

    def _get_hours_until_expiry(self, expiry_time: Optional[str]) -> Optional[float]:
        """Calculate hours until expiry. Returns None if expiry_time is invalid."""
        if not expiry_time:
            return None
        
        try:
            expiry_dt = datetime.fromisoformat(expiry_time.replace("Z", "+00:00"))
            now = datetime.now(expiry_dt.tzinfo) if expiry_dt.tzinfo else datetime.now()
            hours_left = (expiry_dt - now).total_seconds() / 3600
            return hours_left
        except Exception as e:
            logger.warning(f"Error parsing expiry_time '{expiry_time}': {e}")
            return None

    def _calculate_urgency(self, expiry_time: Optional[str]) -> str:
        """
        Calculate urgency level based on expiry time
        
        Rules:
        - expiry < 2 hours → high
        - expiry < 6 hours → medium
        - else → low
        """
        if not expiry_time:
            return "medium"

        hours_until_expiry = self._get_hours_until_expiry(expiry_time)
        
        if hours_until_expiry is None:
            return "medium"
        
        if hours_until_expiry <= 0:
            return "high"
        elif hours_until_expiry <= URGENCY_THRESHOLD_HIGH:  # 2 hours
            return "high"
        elif hours_until_expiry <= URGENCY_THRESHOLD_MEDIUM:  # 6 hours
            return "medium"
        else:
            return "low"
