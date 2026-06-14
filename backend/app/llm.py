import sys
from groq import Groq

from app import config

client = Groq(api_key=config.GROQ_API_KEY, timeout=60)


def _build_prompt(question: str, context: str, history: list[dict]) -> list[dict]:
    messages: list[dict] = [
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
    ]
    for h in history:
        messages.append({"role": h["role"], "content": h["content"]})
    messages.append({"role": "user", "content": question})
    return messages


def stream_answer(question: str, context: str, history: list[dict] | None = None):
    try:
        stream = client.chat.completions.create(
            model=config.GROQ_MODEL,
            messages=_build_prompt(question, context, history or []),
            temperature=0.1,
            max_completion_tokens=1024,
            top_p=1,
            stream=True,
            stop=None,
        )
        for chunk in stream:
            content = chunk.choices[0].delta.content
            if content:
                yield content
    except Exception as e:
        print(f"[llm] groq/{config.GROQ_MODEL} failed: {e}", file=sys.stderr)
        yield f"Error: Groq API error - {e}"
