"""
Main FastAPI Application
Provides REST endpoints for profile data and RAG-driven chatbot queries,
and serves the conversational portfolio web frontend.
"""

import json
from pathlib import Path
from fastapi import FastAPI, HTTPException
from fastapi.staticfiles import StaticFiles
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from dotenv import load_dotenv

from backend.rag.engine import RAGEngine

load_dotenv()

BASE_DIR = Path(__file__).resolve().parent
DATA_DIR = BASE_DIR / "data"
FRONTEND_DIR = BASE_DIR.parent / "frontend"

app = FastAPI(
    title="Conversational Portfolio AI",
    description="Interactive website powered by RAG to explore career experience, skills, and projects.",
    version="1.0.0"
)

# Enable CORS for local development
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Initialize RAG Engine
rag_engine = RAGEngine(data_dir=DATA_DIR)

class ChatRequest(BaseModel):
    message: str

class ChatResponse(BaseModel):
    answer: str
    sources: list[str]
    type: str = "text"

@app.get("/api/profile")
def get_profile():
    """Returns structured profile information for rendering interactive UI cards."""
    profile_path = DATA_DIR / "profile.json"
    if not profile_path.exists():
        raise HTTPException(status_code=404, detail="Profile data not found")
    with open(profile_path, "r", encoding="utf-8") as f:
        return json.load(f)

@app.post("/api/chat", response_model=ChatResponse)
def chat_endpoint(request: ChatRequest):
    """Processes user queries via RAG and returns accurate context-grounded responses."""
    if not request.message.strip():
        raise HTTPException(status_code=400, detail="Query cannot be empty")
    
    result = rag_engine.answer_query(request.message)
    return ChatResponse(
        answer=result["answer"],
        sources=result["retrieved_sources"],
        type=result.get("type", "text")
    )

# Mount frontend static files if directory exists
if FRONTEND_DIR.exists():
    app.mount("/", StaticFiles(directory=str(FRONTEND_DIR), html=True), name="static")

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("backend.app:app", host="127.0.0.1", port=8000, reload=True)
