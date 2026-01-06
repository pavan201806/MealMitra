# AI Service Quick Start

## Prerequisites

1. Python 3.8+
2. Hugging Face API Key ([Get one here](https://huggingface.co/settings/tokens))

## Setup (5 minutes)

1. **Install dependencies:**
```bash
cd ai-service
pip install -r requirements.txt
```

2. **Configure environment:**
```bash
# Create .env file
cat > .env << EOF
HF_API_KEY=your_huggingface_api_key_here
AI_SERVICE_HOST=0.0.0.0
AI_SERVICE_PORT=8000
NODE_BACKEND_URL=http://localhost:5000
EOF
```

3. **Start the service:**
```bash
python app.py
```

You should see:
```
Starting AI Service on 0.0.0.0:8000
```

## Verify Installation

Test the health endpoint:
```bash
curl http://localhost:8000/health
```

Expected response:
```json
{
  "status": "healthy",
  "service": "ai-orchestration-service",
  "timestamp": "2024-01-15T10:00:00"
}
```

## Test Donation Orchestration

```bash
curl -X POST http://localhost:8000/ai/orchestrate/donation \
  -H "Content-Type: application/json" \
  -d '{
    "donor_id": 1,
    "food_name": "Vegetable Curry",
    "food_type": "Cooked",
    "quantity": "5 kg",
    "pickup_address": "Downtown Area",
    "expiry_time": "2024-01-15T18:00:00",
    "image": "data:image/jpeg;base64,/9j/4AAQSkZJRg..."
  }'
```

## Troubleshooting

### "HF_API_KEY environment variable must be set"
- Make sure `.env` file exists in `ai-service/` directory
- Verify `HF_API_KEY` is set correctly
- Restart the service after changing `.env`

### "Connection refused" when calling Node.js backend
- Make sure Node.js backend is running on port 5000
- Check `NODE_BACKEND_URL` in `.env`

### Model loading errors
- First API call may take 30-60 seconds (model loading)
- Subsequent calls will be faster
- Check HuggingFace API status if persistent

## Next Steps

1. Start Node.js backend with `AI_SERVICE_URL=http://localhost:8000`
2. Test donation creation from frontend
3. Check logs: `tail -f ai-service/ai_service.log`

