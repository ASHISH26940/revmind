from groq import Groq

from app import config

client = Groq(api_key=config.GROQ_API_KEY)

FALLBACK_MODELS = [
    "llama-3.1-8b-instant",
    "llama-3.3-70b-versatile",
]


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


def _stream_model(model: str, question: str, context: str):
    return client.chat.completions.create(
        model=model,
        messages=_build_prompt(question, context),
        temperature=0.1,
        max_completion_tokens=1024,
        top_p=1,
        stream=True,
        stop=None,
    )


def stream_answer(question: str, context: str):
    models = [config.GROQ_MODEL] + [m for m in FALLBACK_MODELS if m != config.GROQ_MODEL]
    last_error = None
    for model in models:
        try:
            for chunk in _stream_model(model, question, context):
                content = chunk.choices[0].delta.content
                if content:
                    yield content
            return
        except Exception as e:
            last_error = e
            continue
    raise RuntimeError(f"All Groq models failed. Last error: {last_error}")
