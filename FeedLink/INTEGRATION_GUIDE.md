# AI Service Integration Guide

This guide explains how the Python AI orchestration service integrates with the existing Node.js backend and React frontend.

## Architecture Overview

```
Frontend (React) 
    ↓ POST /api/donations/create (with image)
Node.js Backend
    ↓ POST /ai/orchestrate/donation (with image)
Python AI Service
    ↓ Multi-agent orchestration
    ↓ Returns assignment decision
Node.js Backend
    ↓ Persists donation with AI-assigned volunteer/NGO
Frontend
    ↓ Shows success/rejection message
```

## Setup Instructions

### 1. Python AI Service Setup

```bash
cd ai-service
pip install -r requirements.txt
cp .env.example .env
# Edit .env and add your HF_API_KEY
python app.py
```

The AI service runs on `http://localhost:8000` by default.

### 2. Node.js Backend Setup

Add environment variable:
```bash
AI_SERVICE_URL=http://localhost:8000
```

Install new dependency:
```bash
cd backend
npm install axios
```

### 3. Frontend Changes

The frontend donation form now:
- Requires image upload (for AI validation)
- Uses structured location dropdown (instead of free text)
- Shows AI processing status
- Handles AI rejection responses

## Integration Points

### Node.js → AI Service

**Endpoint:** `POST /ai/orchestrate/donation`

**Request Format:**
```json
{
  "donor_id": 1,
  "food_name": "Vegetable Curry",
  "food_type": "Cooked",
  "quantity": "5 kg",
  "pickup_address": "Downtown Area",
  "expiry_time": "2024-01-15T18:00:00",
  "image": "data:image/jpeg;base64,..."
}
```

**Response Format (Success):**
```json
{
  "success": true,
  "rejected": false,
  "summary": {
    "ticket_id": "TKT-ABC12345",
    "volunteer_id": "2",
    "ngo_id": "3",
    "safe": true,
    "priority_score": 0.85
  }
}
```

**Response Format (Rejected):**
```json
{
  "success": false,
  "rejected": true,
  "summary": {
    "reason": "Food safety validation failed",
    "confidence": 0.45
  }
}
```

### AI Service → Node.js

The AI service calls back to Node.js to fetch volunteers and NGOs:

- `GET /api/users/volunteers` - Returns list of volunteers
- `GET /api/users/ngos` - Returns list of NGOs

These endpoints were added to support the matching agent.

## Flow Diagram

```
1. User submits donation form with image
   ↓
2. Frontend sends POST /api/donations/create
   ↓
3. Node.js validates request, calls AI service
   ↓
4. AI Food Safety Agent validates image
   ├─→ Unsafe? → Return rejection (donation NOT created)
   └─→ Safe? → Continue
   ↓
5. AI Donation Ticket Agent creates ticket
   ↓
6. AI Matching Agent fetches volunteers/NGOs from Node.js
   ↓
7. AI Matching Agent assigns best match
   ↓
8. AI Execution Monitor initializes tracking
   ↓
9. AI Rewards Agent calculates donor points
   ↓
10. AI service returns complete result
   ↓
11. Node.js persists donation with assigned volunteer/NGO
   ↓
12. Frontend shows success message
```

## Key Features

### Food Safety Validation
- Uses HuggingFace vision models
- Blocks unsafe food donations
- Returns confidence scores and reasons

### Intelligent Assignment
- Geospatial distance calculation
- Volunteer availability matching
- NGO capacity and compatibility
- Explainable decisions

### Monitoring & Rewards
- Tracks donation lifecycle
- Calculates donor rewards
- Updates reputation scores

## Error Handling

### AI Service Unavailable
- Node.js returns 500 error
- Frontend shows error message
- Donation is NOT created

### Food Rejected by AI
- Node.js returns 200 with `rejected: true`
- Frontend shows rejection reason
- Donation is NOT created

### Matching Failure
- AI service returns error
- Node.js returns 500 error
- Donation is NOT created

## Environment Variables

### Python AI Service (.env)
```
HF_API_KEY=your_key_here
AI_SERVICE_HOST=0.0.0.0
AI_SERVICE_PORT=8000
NODE_BACKEND_URL=http://localhost:5000
```

### Node.js Backend (.env)
```
AI_SERVICE_URL=http://localhost:8000
```

## Testing

1. **Test Food Safety Rejection:**
   - Upload image of clearly unsafe food
   - Should receive rejection response

2. **Test Successful Donation:**
   - Upload image of safe food
   - Should receive assignment with volunteer/NGO IDs

3. **Test AI Service Down:**
   - Stop Python service
   - Should receive error message
   - Donation should NOT be created

## Production Considerations

1. **API Key Security:**
   - Never commit `.env` files
   - Use secure secret management
   - Rotate API keys regularly

2. **Performance:**
   - AI processing can take 10-30 seconds
   - Consider async processing for production
   - Add request queuing if needed

3. **Monitoring:**
   - Log all AI decisions
   - Track rejection rates
   - Monitor API latency

4. **Scalability:**
   - AI service can be scaled horizontally
   - Use load balancer for multiple instances
   - Consider caching for volunteer/NGO data

## Troubleshooting

### AI Service Not Responding
- Check if service is running: `curl http://localhost:8000/health`
- Check logs: `tail -f ai-service/ai_service.log`
- Verify HF_API_KEY is set correctly

### Matching Returns Empty Results
- Verify volunteers/NGOs exist in database
- Check `/api/users/volunteers` and `/api/users/ngos` endpoints
- Ensure addresses are geocodable

### Image Upload Fails
- Check image size (max 5MB)
- Verify base64 encoding
- Check CORS settings




