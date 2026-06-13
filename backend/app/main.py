import uvicorn
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.routes import chat, products, summary, trends

app = FastAPI(title="NovaBite BI")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(products.router)
app.include_router(summary.router)
app.include_router(trends.router)
app.include_router(chat.router)


def run_dev() -> None:
    uvicorn.run("app.main:app", host="0.0.0.0", port=8000, reload=True)
