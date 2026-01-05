from fastapi import FastAPI
from livekit.api import AccessToken, VideoGrants
from dotenv import load_dotenv
from pathlib import Path
import os

from fastapi.middleware.cors import CORSMiddleware

# Load .env.local from project root
BASE_DIR = Path(__file__).resolve().parents[1]
load_dotenv(dotenv_path=BASE_DIR / ".env.local")

app = FastAPI()

# ✅ ENABLE CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/token")
def generate_token():
    token = (
        AccessToken(
            os.environ["LIVEKIT_API_KEY"],
            os.environ["LIVEKIT_API_SECRET"],
        )
        .with_identity("pavan-user")
        .with_grants(
            VideoGrants(
                room_join=True,
                room="munchly-room",
            )
        )
        .to_jwt()
    )

    return {"token": token}
