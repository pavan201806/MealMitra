"""
Matching & Assignment Agent
Matches donations to best volunteer + NGO using geospatial computation and LLM reasoning
"""
import logging
import requests
from typing import Dict, Any, List, Optional
from geopy.distance import geodesic
from geopy.geocoders import Nominatim

from services.huggingface_client import HuggingFaceClient
from config import NODE_BACKEND_URL, LLM_MODEL, DEFAULT_MAX_DISTANCE_KM

logger = logging.getLogger(__name__)


class MatchingAgent:
    """
    Matches donations to volunteers and NGOs
    Uses geospatial distance, availability, capacity, and urgency
    """

    def __init__(self, hf_client: HuggingFaceClient = None):
        self.hf_client = hf_client or HuggingFaceClient()
        self.llm_model = LLM_MODEL
        self.geocoder = Nominatim(user_agent="feedilink_ai_service")
        self.backend_url = NODE_BACKEND_URL

    def match(
        self,
        ticket: Dict[str, Any],
        donation_data: Dict[str, Any],
        food_safety_result: Dict[str, Any],
    ) -> Dict[str, Any]:

        logger.info("Matching Agent: Starting matching process")

        # Fetch data
        volunteers = self._fetch_volunteers()
        ngos = self._fetch_ngos()

        logger.info(f"Matching Agent: Fetched {len(volunteers)} volunteers, {len(ngos)} NGOs")

        # If backend returns nothing, treat as NO MATCH (not error)
        if not volunteers or not ngos:
            logger.warning("Matching Agent: Volunteers or NGOs unavailable from backend")
            return self._no_match_response("No volunteers or NGOs available from backend")

        # Geocode pickup
        pickup_address = donation_data.get("pickup_address")
        pickup_coords = self._geocode_address(pickup_address)

        if not pickup_coords:
            logger.warning(f"Matching Agent: Failed to geocode pickup address: {pickup_address}")
            return self._no_match_response("Invalid pickup address")

        logger.info(f"Matching Agent: Pickup coordinates: {pickup_coords}")

        # Rank candidates
        volunteer_rankings = self._rank_volunteers(volunteers, pickup_coords, ticket, donation_data)
        ngo_rankings = self._rank_ngos(ngos, pickup_coords, ticket, donation_data, food_safety_result)

        if not volunteer_rankings or not ngo_rankings:
            max_distance = ticket.get("constraints", {}).get("max_distance_km", DEFAULT_MAX_DISTANCE_KM)
            logger.warning(
                f"Matching Agent: No suitable matches within {max_distance} km of pickup location"
            )
            return self._no_match_response(
                "No volunteers or NGOs available within distance constraints"
            )

        best_volunteer = volunteer_rankings[0]
        best_ngo = ngo_rankings[0]

        decision_reason = self._generate_decision_reason(
            best_volunteer, best_ngo, volunteer_rankings[:3], ngo_rankings[:3]
        )

        logger.info(
            f"Matching Agent: Assigned Volunteer {best_volunteer['id']} "
            f"and NGO {best_ngo['id']}"
        )

        return {
            "status": "matched",
            "assigned_volunteer_id": str(best_volunteer["id"]),
            "assigned_ngo_id": str(best_ngo["id"]),
            "ranking": {
                "volunteers": volunteer_rankings[:5],
                "ngos": ngo_rankings[:5],
            },
            "decision_reason": decision_reason,
            "pickup_coords": pickup_coords,
            "volunteer_distance_km": best_volunteer.get("distance_km"),
            "ngo_distance_km": best_ngo.get("distance_km"),
        }

    # ---------------- Helper responses ---------------- #

    def _no_match_response(self, reason: str) -> Dict[str, Any]:
        return {
            "status": "no_match",
            "reason": reason,
            "volunteers": [],
            "ngos": [],
        }

    # ---------------- Backend calls ---------------- #

    def _fetch_volunteers(self) -> List[Dict[str, Any]]:
        try:
            response = requests.get(f"{self.backend_url}/api/users/volunteers", timeout=10)
            response.raise_for_status()
            return response.json().get("volunteers", [])
        except Exception as e:
            logger.error(f"Error fetching volunteers: {e}")
            return []

    def _fetch_ngos(self) -> List[Dict[str, Any]]:
        try:
            response = requests.get(f"{self.backend_url}/api/users/ngos", timeout=10)
            response.raise_for_status()
            return response.json().get("ngos", [])
        except Exception as e:
            logger.error(f"Error fetching NGOs: {e}")
            return []

    # ---------------- Geospatial helpers ---------------- #

    def _geocode_address(self, address: str) -> Optional[tuple]:
        try:
            location = self.geocoder.geocode(address, timeout=10)
            if location:
                return (location.latitude, location.longitude)
            return None
        except Exception as e:
            logger.warning(f"Geocoding failed for {address}: {e}")
            return None

    def _calculate_distance(self, coords1: tuple, coords2: tuple) -> float:
        try:
            return geodesic(coords1, coords2).kilometers
        except:
            return float("inf")

    # ---------------- Ranking logic ---------------- #

    def _rank_volunteers(self, volunteers, pickup_coords, ticket, donation_data):
        max_distance = ticket.get("constraints", {}).get(
            "max_distance_km", DEFAULT_MAX_DISTANCE_KM
        )
        scored = []

        for v in volunteers:
            lat, lon = v.get("latitude"), v.get("longitude")
            if lat is None or lon is None:
                continue

            dist = self._calculate_distance(pickup_coords, (float(lat), float(lon)))
            if dist > max_distance:
                continue

            score = self._calculate_volunteer_score(v, dist, ticket, donation_data)
            scored.append({**v, "distance_km": round(dist, 2), "score": score})

        scored.sort(key=lambda x: x["score"], reverse=True)
        return scored

    def _rank_ngos(self, ngos, pickup_coords, ticket, donation_data, food_safety_result):
        max_distance = ticket.get("constraints", {}).get(
            "max_distance_km", DEFAULT_MAX_DISTANCE_KM
        )
        scored = []

        for ngo in ngos:
            lat, lon = ngo.get("latitude"), ngo.get("longitude")
            if lat is None or lon is None or ngo.get("capacity", 0) <= 0:
                continue

            dist = self._calculate_distance(pickup_coords, (float(lat), float(lon)))
            if dist > max_distance:
                continue

            score = self._calculate_ngo_score(ngo, dist, ticket, donation_data, food_safety_result)
            scored.append({**ngo, "distance_km": round(dist, 2), "score": score})

        scored.sort(key=lambda x: x["score"], reverse=True)
        return scored

    # ---------------- Scoring ---------------- #

    def _calculate_volunteer_score(self, volunteer, distance_km, ticket, donation_data):
        max_distance = ticket.get("constraints", {}).get(
            "max_distance_km", DEFAULT_MAX_DISTANCE_KM
        )
        score = 0.5
        score += (1 - distance_km / max_distance) * 0.4
        score += volunteer.get("reliability_score", 0.5) * 0.3
        score += volunteer.get("availability_score", 0.5) * 0.2
        return min(1.0, score)

    def _calculate_ngo_score(self, ngo, distance_km, ticket, donation_data, food_safety_result):
        max_distance = ticket.get("constraints", {}).get(
            "max_distance_km", DEFAULT_MAX_DISTANCE_KM
        )
        score = 0.5
        score += (1 - distance_km / max_distance) * 0.3
        score += min(1.0, ngo.get("capacity", 0) / 100.0) * 0.3
        score += ngo.get("trust_score", 0.5) * 0.2
        return min(1.0, score)

    # ---------------- LLM reasoning ---------------- #

    def _generate_decision_reason(self, volunteer, ngo, volunteer_rankings, ngo_rankings):
        try:
            prompt = f"Volunteer {volunteer['id']} and NGO {ngo['id']} were selected due to proximity and capacity."
            response = self.hf_client.text_generation(self.llm_model, prompt, max_length=120)
            return response.get("generated_text", "").strip()
        except Exception:
            return "Selected based on proximity, availability, and capacity."
