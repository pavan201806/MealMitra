import os
import asyncio
import logging
from dotenv import load_dotenv

from livekit import rtc
from livekit.agents import (
    Agent,
    AgentServer,
    AgentSession,
    JobContext,
    JobProcess,
    cli,
    inference,
)
from livekit.plugins import silero

# --------------------------------------------------
# Setup
# --------------------------------------------------
load_dotenv(".env.local")
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("medical-agent")

# --------------------------------------------------
# Agent logic
# --------------------------------------------------
class MedicalAssistant(Agent):
    def __init__(self):
        super().__init__(
            instructions="""
You are a medical voice assistant.
Provide general health information only.
Do not diagnose diseases.
Do not prescribe medications.
If symptoms sound serious, advise seeing a doctor.
If it sounds like an emergency, advise immediate medical help.
"""
        )

# --------------------------------------------------
# Agent server (REQUIRED in 1.1.x)
# --------------------------------------------------
server = AgentServer()

def prewarm(proc: JobProcess):
    # Load VAD once per worker
    proc.userdata["vad"] = silero.VAD.load()

server.setup_fnc = prewarm

# --------------------------------------------------
# RTC Session
# --------------------------------------------------
@server.rtc_session()
async def medical_agent(ctx: JobContext):
    ctx.log_context_fields = {"room": ctx.room.name}
    logger.info("Agent started for room: %s", ctx.room.name)

    # --------------------------------------------------
    # Agent Session (STT + LLM + TTS)
    # --------------------------------------------------
    session = AgentSession(
        stt=inference.STT(
            model="assemblyai/universal-streaming",
            language="en",
        ),
        llm=inference.LLM(
            model="openai/gpt-4o-mini",
        ),
        tts=inference.TTS(
            model="cartesia/sonic-3",
            voice="9626c31c-bec5-4cca-baa8-f8ba9e84c8bc",
        ),
        vad=ctx.proc.userdata["vad"],
        preemptive_generation=True,
    )

    # --------------------------------------------------
    # Start agent session
    # --------------------------------------------------
    await session.start(
        agent=MedicalAssistant(),
        room=ctx.room,
    )

    # --------------------------------------------------
    # Connect to room
    # --------------------------------------------------
    await ctx.connect()
    await asyncio.sleep(1.5)

    # --------------------------------------------------
    # Initial greeting
    # --------------------------------------------------
    await session.say(
        "Hello. I am your medical assistant. How can I help you today?"
    )

# --------------------------------------------------
# Run (ONLY THIS in LiveKit Agents 1.1.x)
# --------------------------------------------------
if __name__ == "__main__":
    cli.run_app(server)
