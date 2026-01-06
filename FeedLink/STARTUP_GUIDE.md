# MealMitra Startup Guide

This guide provides step-by-step instructions to run the complete MealMitra application.

## Architecture Overview

```
Frontend (React) → Java Server (Spring Boot) → AI Service (Python/Flask)
     Port 3000          Port 5000                    Port 8000
```

## Prerequisites

1. **Java 17+** - Required for Spring Boot server
2. **Maven 3.6+** - Required for building Java server
3. **Node.js 18+** - Required for React frontend
4. **Python 3.8+** - Required for AI service
5. **HuggingFace API Key** - Required for AI service (get from https://huggingface.co/settings/tokens)

## Startup Steps

### Step 1: Start the AI Service (Python)

1. Navigate to the AI service directory:
   ```bash
   cd ai-service
   ```

2. Create a virtual environment (if not already created):
   ```bash
   python -m venv venv
   ```

3. Activate the virtual environment:
   - **Windows:**
     ```bash
     venv\Scripts\activate
     ```
   - **Linux/Mac:**
     ```bash
     source venv/bin/activate
     ```

4. Install dependencies:
   ```bash
   pip install -r requirements.txt
   ```

5. Create `.env` file in `ai-service/` directory:
   ```env
   HF_API_KEY=your_huggingface_api_key_here
   AI_SERVICE_HOST=0.0.0.0
   AI_SERVICE_PORT=8000
   NODE_BACKEND_URL=http://localhost:5000
   LOG_LEVEL=INFO
   ```

6. Start the AI service:
   ```bash
   python app.py
   ```

   The AI service should start on `http://localhost:8000`
   
   Verify it's running:
   ```bash
   curl http://localhost:8000/health
   ```

### Step 2: Start the Java Server (Spring Boot)

1. Navigate to the server directory:
   ```bash
   cd server
   ```

2. (Optional) Set environment variables:
   - **Windows (PowerShell):**
     ```powershell
     $env:JWT_SECRET="your_secret_key_here"
     $env:AI_SERVICE_URL="http://localhost:8000"
     ```
   - **Windows (CMD):**
     ```cmd
     set JWT_SECRET=your_secret_key_here
     set AI_SERVICE_URL=http://localhost:8000
     ```
   - **Linux/Mac:**
     ```bash
     export JWT_SECRET="your_secret_key_here"
     export AI_SERVICE_URL="http://localhost:8000"
     ```

   **Note:** If not set, defaults will be used:
   - `JWT_SECRET`: `feedilink_secret_key_change_in_production`
   - `AI_SERVICE_URL`: `http://localhost:8000`

3. Build the project:
   ```bash
   mvn clean install
   ```

4. Start the server:
   ```bash
   mvn spring-boot:run
   ```

   The server should start on `http://localhost:5000`
   
   Verify it's running:
   ```bash
   curl http://localhost:5000/api/health
   ```

### Step 3: Start the Frontend (React)

1. Navigate to the frontend directory:
   ```bash
   cd frontend
   ```

2. Install dependencies (if not already installed):
   ```bash
   npm install
   ```

3. Start the development server:
   ```bash
   npm run dev
   ```

   The frontend should start on `http://localhost:3000`

## Verification

After all three services are running:

1. **Frontend**: Open `http://localhost:3000` in your browser
2. **Backend Health**: `http://localhost:5000/api/health`
3. **AI Service Health**: `http://localhost:8000/health`

## Troubleshooting

### AI Service Issues

- **Error: "HF_API_KEY environment variable must be set"**
  - Solution: Create `.env` file in `ai-service/` directory with your HuggingFace API key

- **Error: "Connection refused" when calling AI service**
  - Solution: Ensure AI service is running on port 8000

### Java Server Issues

- **Port 5000 already in use**
  - Solution: Change port in `server/src/main/resources/application.yml` or stop the process using port 5000

- **Error connecting to AI service**
  - Solution: Verify AI service is running and `AI_SERVICE_URL` environment variable is correct

### Frontend Issues

- **Cannot connect to backend**
  - Solution: Verify Java server is running on port 5000
  - Check `frontend/vite.config.js` proxy configuration

- **CORS errors**
  - Solution: Java server CORS is configured to allow all origins. If issues persist, check `server/src/main/java/com/mealmitra/server/config/CorsConfig.java`

## Data Flow Example

1. User creates donation in frontend with image URL
2. Frontend sends `POST /api/donations/create` to Java server
3. Java server calls `POST /ai/orchestrate/donation` to AI service
4. AI service:
   - Validates food safety
   - Creates donation ticket
   - Matches volunteer/NGO (calls Java server for volunteer/NGO list)
   - Initializes monitoring
   - Calculates rewards
5. AI service returns result to Java server
6. Java server creates donation in database
7. Java server returns response to frontend
8. Frontend displays success/rejection message

## Default Ports

- **Frontend**: 3000
- **Java Server**: 5000
- **AI Service**: 8000
- **H2 Database Console**: http://localhost:5000/h2-console

## Environment Variables Summary

### AI Service (`ai-service/.env`)
- `HF_API_KEY` (REQUIRED) - HuggingFace API key
- `AI_SERVICE_HOST` (default: 0.0.0.0)
- `AI_SERVICE_PORT` (default: 8000)
- `NODE_BACKEND_URL` (default: http://localhost:5000) - Points to Java server
- `LOG_LEVEL` (default: INFO)

### Java Server (Environment variables or `application.yml`)
- `JWT_SECRET` (default: feedilink_secret_key_change_in_production)
- `AI_SERVICE_URL` (default: http://localhost:8000)

### Frontend
- `VITE_API_URL` (optional, defaults to http://localhost:5000/api)

## Production Considerations

1. **Security**:
   - Change `JWT_SECRET` to a strong random value
   - Use HTTPS in production
   - Restrict CORS origins in production

2. **Performance**:
   - AI service processing can take 10-30 seconds
   - Consider async processing for production
   - Add request queuing if needed

3. **Database**:
   - Current setup uses H2 file database
   - For production, migrate to PostgreSQL or MySQL

4. **Monitoring**:
   - Enable logging and monitoring
   - Track AI service response times
   - Monitor error rates
