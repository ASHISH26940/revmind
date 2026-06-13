from pathlib import Path
from os import getenv

from dotenv import load_dotenv

load_dotenv(Path(__file__).parent.parent / ".env.local")

LLM_PROVIDER = getenv("LLM_PROVIDER", "groq")
GROQ_API_KEY = getenv("GROQ_API_KEY", "")
GROQ_MODEL = getenv("GROQ_MODEL", "llama-3.1-8b-instant")
GOOGLE_API_KEY = getenv("GOOGLE_API_KEY", "")
GOOGLE_MODEL = getenv("GOOGLE_MODEL", "gemma-4-26b-it")
