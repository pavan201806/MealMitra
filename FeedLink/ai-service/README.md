# AI Orchestration Service

Multi-agent AI orchestration service for FEEDILINK donation platform.

## Overview

This service provides intelligent donation processing using multiple AI agents:
1. **Food Safety Agent**: Validates food safety using vision models
2. **Donation Ticket Agent**: Creates structured donation tickets with priority scoring
3. **Matching Agent**: Matches donations to volunteers and NGOs using geospatial computation
4. **Execution Monitor Agent**: Tracks donation lifecycle and flags issues
5. **Rewards Agent**: Calculates donor rewards and updates reputation scores

## Architecture

- **Orchestrator**: LangGraph-style graph orchestration with conditional branching
- **Agents**: Independent agents that return structured JSON
- **Services**: HuggingFace client for AI model access

## Setup

1. **Install Dependencies**
```bash
cd ai-service
pip install -r requirements.txt
```

2. **Configure Environment**
```bash
cp .env.example .env
# Edit .env and add your HF_API_KEY
```

3. **Run Service**
```bash
python app.py
```

The service will start on `http://localhost:8000`

## API Endpoints

### POST /ai/orchestrate/donation

Main orchestration endpoint for processing donations.

**Request:**
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

**Response (Success):**
```json
{
  "success": true,
  "rejected": false,
  "state": "complete",
  "summary": {
    "ticket_id": "TKT-ABC12345",
    "volunteer_id": "2",
    "ngo_id": "3",
    "safe": true,
    "priority_score": 0.85
  },
  "results": {
    "food_safety": {...},
    "ticket": {...},
    "assignment": {...},
    "monitoring": {...},
    "rewards": {...}
  }
}
```

**Response (Rejected):**
```json
{
  "success": false,
  "rejected": true,
  "state": "rejected",
  "summary": {
    "reason": "Food safety validation failed",
    "confidence": 0.45
  }
}
```

### GET /ai/monitor/<ticket_id>

Get monitoring status for a donation ticket.

### POST /ai/monitor/<ticket_id>/update

Update monitoring status (for Node.js backend to call when status changes).

## Integration with Node.js Backend

The Node.js backend should:
1. Call `/ai/orchestrate/donation` when a donation is created
2. Only persist donation if `success: true` and `rejected: false`
3. Store AI-assigned `volunteer_id` and `ngo_id` if available
4. Call monitoring endpoints to update status

Set `AI_SERVICE_URL` environment variable in Node.js backend:
```bash
AI_SERVICE_URL=http://localhost:8000
```

## Security

- **NEVER** hardcode API keys
- Always use environment variables (`HF_API_KEY`)
- Service runs independently of Cursor/MCP
- All secrets loaded from `.env` file

## Logging

All agent decisions and orchestration steps are logged to:
- Console (stdout)
- `ai_service.log` file

Logs include:
- Agent outputs
- Confidence scores
- Decision reasons
- Errors and warnings

## Development Notes

- Agents never call each other directly
- Orchestrator controls all flow
- Conditional branching based on food safety results
- All AI decisions are logged for analytics
- Designed for future learning model integration

