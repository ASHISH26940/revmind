from pathlib import Path
from os import getenv

from dotenv import load_dotenv

load_dotenv(Path(__file__).parent.parent / ".env.local", override=True)

GROQ_API_KEY = getenv("GROQ_API_KEY", "")
GROQ_MODEL = getenv("GROQ_MODEL", "llama-3.1-8b-instant")
