import json
from typing import Generator

import httpx

from app import config

GROQ_URL = "https://api.groq.com/openai/v1/chat/completions"

# Models confirmed available on Groq free tier
FALLBACK_MODELS = ["llama-3.1-8b-instant", "llama3-8b-8192", "gemma2-9b-it"]


def _build_prompt(question: str, context: str) -> list[dict]:
    return [
        {
            "role": "system",
            "content": (
                "You are a BI assistant for NovaBite Consumer Goods. "
                "Answer questions using ONLY the provided data context. "
                "Be concise and specific. Use numbers and dollar amounts. "
                "If the data doesn't contain the answer, say so.\n\n"
                f"DATA CONTEXT:\n{context}"
            ),
        },
        {
            "role": "user",
            "content": question,
        },
    ]


def _request(model: str, question: str, context: str) -> Generator[str, None, None]:
    payload = {
        "model": model,
        "messages": _build_prompt(question, context),
        "stream": True,
        "temperature": 0.1,
    }
    headers = {
        "Authorization": f"Bearer {config.GROQ_API_KEY}",
        "Content-Type": "application/json",
    }

    with httpx.Client(timeout=60) as client:
        with client.stream("POST", GROQ_URL, json=payload, headers=headers) as resp:
            if resp.status_code == 400:
                body = resp.read()
                raise RuntimeError(f"Groq 400: {body.decode()}")
            resp.raise_for_status()
            for line in resp.iter_lines():
                if not line.startswith("data: "):
                    continue
                chunk = line.removeprefix("data: ")
                if chunk.strip() == "[DONE]":
                    break
                try:
                    delta = json.loads(chunk)
                    token = delta["choices"][0]["delta"].get("content", "")
                    if token:
                        yield token
                except (json.JSONDecodeError, KeyError, IndexError):
                    continue


def stream_answer(question: str, context: str) -> Generator[str, None, None]:
    models = [config.GROQ_MODEL] + [m for m in FALLBACK_MODELS if m != config.GROQ_MODEL]
    last_error = None
    for model in models:
        try:
            yield from _request(model, question, context)
            return
        except RuntimeError as e:
            last_error = e
            continue
    raise RuntimeError(f"All Groq models failed. Last error: {last_error}")
