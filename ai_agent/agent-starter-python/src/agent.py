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
    room_io,
)
from livekit.plugins import noise_cancellation, silero
from livekit.plugins.turn_detector.multilingual import MultilingualModel

# --------------------------------------------------
# Logging
# --------------------------------------------------
logger = logging.getLogger("medical-agent")
logging.basicConfig(level=logging.INFO)

# --------------------------------------------------
# Env
# --------------------------------------------------
load_dotenv(".env.local")

# --------------------------------------------------
# Medical Assistant
# --------------------------------------------------
class MedicalAssistant(Agent):
    def __init__(self) -> None:
        super().__init__(
            instructions=(
                "You are a medical voice assistant.\n"
                "You answer ONLY health and medical-related questions.\n\n"

                "Rules:\n"
                "- Do NOT provide a diagnosis\n"
                "- Do NOT prescribe medicines\n"
                "- Provide general medical information only\n"
                "- Be calm, short, and clear\n"
                "- If symptoms are serious, advise seeing a doctor\n"
                "- If emergency symptoms appear, escalate immediately\n"
            ),
        )

    async def on_message(self, message: str) -> str:
        text = message.lower().strip()
        logger.info(f"User said: {text}")

        if not text:
            return "I am listening. Please tell me your health concern."

        emergency_keywords = [
            "chest pain",
            "breathing problem",
            "shortness of breath",
            "heart attack",
            "stroke",
            "unconscious",
            "severe bleeding",
        ]

        if any(word in text for word in emergency_keywords):
            return (
                "This sounds like a medical emergency. "
                "Please seek immediate medical help or contact emergency services."
            )

        # Let OpenAI LLM respond safely
        return (
            "Here is some general medical information. "
            "This is not a diagnosis. "
            "If symptoms continue, please consult a qualified doctor."
        )

# --------------------------------------------------
# Server
# --------------------------------------------------
server = AgentServer()

def prewarm(proc: JobProcess):
    proc.userdata["vad"] = silero.VAD.load()

server.setup_fnc = prewarm

# --------------------------------------------------
# Agent Entrypoint
# --------------------------------------------------
@server.rtc_session()
async def medical_agent(ctx: JobContext):
    ctx.log_context_fields = {"room": ctx.room.name}

    session = AgentSession(
        stt=inference.STT(
            model="assemblyai/universal-streaming",
            language="en",
        ),
        llm=inference.LLM(
            model="openai/gpt-4.1-mini",
        ),
        tts=inference.TTS(
            model="cartesia/sonic-3",
            voice="9626c31c-bec5-4cca-baa8-f8ba9e84c8bc",
        ),
        turn_detection=MultilingualModel(),
        vad=ctx.proc.userdata["vad"],
        preemptive_generation=True,
    )

    await session.start(
        agent=MedicalAssistant(),
        room=ctx.room,
        room_options=room_io.RoomOptions(
            audio_input=room_io.AudioInputOptions(
                noise_cancellation=lambda params: (
                    noise_cancellation.BVCTelephony()
                    if params.participant.kind
                    == rtc.ParticipantKind.PARTICIPANT_KIND_SIP
                    else noise_cancellation.BVC()
                ),
            ),
        ),
    )

    await ctx.connect()

    # ✅ Greeting on start
    await session.say(
        "Hello. I am your medical assistant. "
        "You can ask me general health or medical questions."
    )

# --------------------------------------------------
# Run
# --------------------------------------------------
if __name__ == "__main__":
    cli.run_app(server)
