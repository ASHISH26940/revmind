from fastapi import APIRouter, HTTPException
from fastapi.responses import StreamingResponse
from pydantic import BaseModel

from app.context import build_context
from app.llm import stream_answer

router = APIRouter()

_context_cache: str | None = None


def _get_context() -> str:
    global _context_cache
    if _context_cache is None:
        _context_cache = build_context()
    return _context_cache


class ChatRequest(BaseModel):
    question: str


@router.post("/api/chat")
def chat(req: ChatRequest):
    if not req.question.strip():
        raise HTTPException(400, "question is required")

    context = _get_context()

    return StreamingResponse(
        stream_answer(req.question, context),
        media_type="text/event-stream",
        headers={
            "Cache-Control": "no-cache",
            "X-Accel-Buffering": "no",
        },
    )
