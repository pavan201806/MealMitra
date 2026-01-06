# FEEDILINK - Phase 1

A full-stack web application connecting food donors with volunteers to reduce food waste.

## Tech Stack

- **Frontend**: React (Vite), Plain CSS
- **Backend**: Node.js + Express
- **AI Service**: Python + Flask (Multi-agent orchestration)
- **Database**: SQLite
- **Authentication**: JWT
- **AI Models**: HuggingFace (Vision + LLM)

## Project Structure

```
feediLink/
├── frontend/
│   ├── src/
│   │   ├── pages/
│   │   ├── components/
│   │   ├── services/
│   │   ├── styles/
│   │   └── App.jsx
│   ├── package.json
│   └── vite.config.js
├── backend/
│   ├── controllers/
│   ├── routes/
│   ├── models/
│   ├── middleware/
│   ├── config/
│   ├── server.js
│   └── package.json
├── ai-service/
│   ├── agents/
│   ├── orchestrator/
│   ├── services/
│   ├── app.py
│   ├── config.py
│   └── requirements.txt
└── README.md
```

## System Roles

- **donor**: Create food donations
- **volunteer**: Assign and complete donations
- **ngo**: View delivered donations
- **admin**: Manage users and donations

## Setup Instructions

### Backend Setup

1. Navigate to backend directory:
```bash
cd backend
```

2. Install dependencies:
```bash
npm install
```

3. Create `.env` file (optional):
```
PORT=5000
JWT_SECRET=your_secret_key_here
```

4. Start the server:
```bash
npm start
# or for development with auto-reload:
npm run dev
```

The backend will run on `http://localhost:5000`

### Frontend Setup

1. Navigate to frontend directory:
```bash
cd frontend
```

2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npm run dev
```

The frontend will run on `http://localhost:3000`

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/me` - Get current user (protected)

### Donations
- `POST /api/donations/create` - Create donation (donor only)
- `GET /api/donations/donor/:id` - Get donor's donations (donor only)
- `GET /api/donations/available` - Get available donations (volunteer only)
- `POST /api/donations/assign` - Assign donation (volunteer only)
- `POST /api/donations/complete` - Complete donation (volunteer only)
- `GET /api/donations/nearby-donations` - Get nearby donations (NGO only)

### Admin
- `GET /api/admin/users` - Get all users (admin only)
- `GET /api/admin/donations` - Get all donations (admin only)

## Default Admin Account

You can register an admin account through the registration page by selecting "Admin" as the role.

## Features

- User authentication with JWT
- Role-based access control
- Donation management
- Volunteer assignment system
- NGO donation viewing
- Admin dashboard for user and donation management

## AI Service Setup

The platform now includes an AI orchestration service for intelligent donation processing:

1. **Navigate to AI service:**
```bash
cd ai-service
```

2. **Install Python dependencies:**
```bash
pip install -r requirements.txt
```

3. **Configure environment:**
Create `.env` file with your HuggingFace API key:
```
HF_API_KEY=your_key_here
NODE_BACKEND_URL=http://localhost:5000
```

4. **Start AI service:**
```bash
python app.py
```

See `ai-service/README.md` and `INTEGRATION_GUIDE.md` for detailed documentation.

## Notes

- Database (SQLite) is automatically created on first run
- JWT tokens are stored in localStorage
- All routes are protected based on user roles
- AI service provides food safety validation and intelligent assignment
- Donations require image upload for AI validation

