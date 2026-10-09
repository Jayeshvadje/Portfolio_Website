"""
RAG (Retrieval-Augmented Generation) Engine
Handles document chunking, BM25 similarity retrieval, and grounded response synthesis 
using Google Gemini API and structured career knowledge base.
"""

import os
import re
import math
import json
from pathlib import Path
from typing import List, Dict, Any, Tuple

from backend.rag.prompts import RAG_SYSTEM_PROMPT

class BM25Retriever:
    """
    Lightweight BM25 Search Engine for term-frequency & inverse document frequency ranking.
    """
    def __init__(self, k1: float = 1.5, b: float = 0.75):
        self.k1 = k1
        self.b = b
        self.chunks: List[Dict[str, Any]] = []
        self.doc_tokens: List[List[str]] = []
        self.doc_len: List[int] = []
        self.avg_doc_len: float = 0.0
        self.df: Dict[str, int] = {}
        self.idf: Dict[str, float] = {}

    def index(self, chunks: List[Dict[str, Any]]):
        self.chunks = chunks
        self.doc_tokens = []
        self.doc_len = []
        self.df = {}

        for chunk in chunks:
            text = f"{chunk.get('topic', '')} {chunk.get('content', '')}".lower()
            tokens = re.findall(r'\w+', text)
            self.doc_tokens.append(tokens)
            self.doc_len.append(len(tokens))

            unique_tokens = set(tokens)
            for token in unique_tokens:
                self.df[token] = self.df.get(token, 0) + 1

        num_docs = len(chunks)
        self.avg_doc_len = sum(self.doc_len) / num_docs if num_docs > 0 else 1.0

        for token, doc_freq in self.df.items():
            # BM25 IDF formula with smoothing
            self.idf[token] = math.log((num_docs - doc_freq + 0.5) / (doc_freq + 0.5) + 1.0)

    def score(self, query: str, top_k: int = 3) -> List[Tuple[float, Dict[str, Any]]]:
        query_tokens = re.findall(r'\w+', query.lower())
        if not query_tokens or not self.chunks:
            return [(1.0, chunk) for chunk in self.chunks[:top_k]]

        scored: List[Tuple[float, Dict[str, Any]]] = []

        for idx, chunk in enumerate(self.chunks):
            tokens = self.doc_tokens[idx]
            doc_l = self.doc_len[idx]
            token_counts: Dict[str, int] = {}
            for t in tokens:
                token_counts[t] = token_counts.get(t, 0) + 1

            score = 0.0
            topic_lower = chunk.get('topic', '').lower()

            for q_token in query_tokens:
                if q_token in token_counts:
                    tf = token_counts[q_token]
                    idf_val = self.idf.get(q_token, 0.1)
                    denom = tf + self.k1 * (1.0 - self.b + self.b * (doc_l / self.avg_doc_len))
                    score += idf_val * (tf * (self.k1 + 1.0)) / denom

                # Topic header match boost
                if q_token in topic_lower:
                    score += 2.0

            if score > 0:
                scored.append((score, chunk))

        scored.sort(key=lambda x: x[0], reverse=True)
        
        # If no score match found, fallback to top initial chunks
        if not scored:
            return [(0.5, chunk) for chunk in self.chunks[:top_k]]

        return scored[:top_k]


class RAGEngine:
    def __init__(self, data_dir: Path):
        self.data_dir = data_dir
        self.chunks: List[Dict[str, Any]] = []
        self.retriever = BM25Retriever()
        self._load_and_index_documents()

    def _load_and_index_documents(self):
        """Loads and chunks resume_data.md and profile.json into searchable knowledge chunks."""
        self.chunks = []

        # 1. Load resume_data.md
        resume_md_path = self.data_dir / "resume_data.md"
        if resume_md_path.exists():
            try:
                text = resume_md_path.read_text(encoding="utf-8")
                # Split by markdown ## headers
                sections = re.split(r'\n(?=## )', text)
                for section in sections:
                    clean = section.strip()
                    if clean:
                        lines = clean.split("\n")
                        header = lines[0].replace("#", "").strip()
                        self.chunks.append({
                            "source": "resume_data.md",
                            "topic": header,
                            "content": clean
                        })
            except Exception as e:
                print(f"Error loading resume_data.md: {e}")

        # 2. Load profile.json
        profile_path = self.data_dir / "profile.json"
        if profile_path.exists():
            try:
                with open(profile_path, "r", encoding="utf-8") as f:
                    profile_data = json.load(f)

                if "experience" in profile_data:
                    for exp in profile_data["experience"]:
                        self.chunks.append({
                            "source": "profile.json",
                            "topic": f"Experience - {exp.get('role')} at {exp.get('company')}",
                            "content": f"Role: {exp.get('role')}\nCompany: {exp.get('company')} ({exp.get('period')})\nDescription: {exp.get('description')}\nHighlights: {', '.join(exp.get('highlights', []))}"
                        })

                if "projects" in profile_data:
                    for proj in profile_data["projects"]:
                        self.chunks.append({
                            "source": "profile.json",
                            "topic": f"Project - {proj.get('title')}",
                            "content": f"Project: {proj.get('title')}\nCategory: {proj.get('category')}\nDescription: {proj.get('description')}\nTech Stack: {', '.join(proj.get('technologies', []))}\nGitHub: {proj.get('github')}"
                        })

                if "skills" in profile_data:
                    skills_str = json.dumps(profile_data["skills"], indent=2)
                    self.chunks.append({
                        "source": "profile.json",
                        "topic": "Skills & Technologies Matrix",
                        "content": f"Technical Skills:\n{skills_str}"
                    })

            except Exception as e:
                print(f"Error loading profile.json: {e}")

        # Build BM25 Index
        if self.chunks:
            self.retriever.index(self.chunks)

    def retrieve(self, query: str, top_k: int = 3) -> List[Dict[str, Any]]:
        """Retrieves top-k relevant knowledge chunks using BM25 ranking."""
        scored_results = self.retriever.score(query, top_k=top_k)
        return [chunk for _, chunk in scored_results]

    def _generate_with_gemini(self, query: str, context_str: str, history: List[Dict[str, str]] = None) -> str:
        """Invokes Google Gemini API to synthesize a grounded RAG response."""
        api_key = os.getenv("GEMINI_API_KEY", "").strip()
        if not api_key or api_key == "your_gemini_api_key_here":
            return None

        try:
            import google.generativeai as genai
            genai.configure(api_key=api_key)

            hist_str = ""
            if history:
                hist_str = "Previous Conversation History:\n" + "\n".join([f"{msg['role'].capitalize()}: {msg['content']}" for msg in history]) + "\n\n"

            prompt = hist_str + RAG_SYSTEM_PROMPT.format(context=context_str, query=query)

            # Try candidate Gemini models
            for model_name in ["gemini-3.5-flash", "gemini-2.5-flash", "gemini-flash-latest"]:
                try:
                    model = genai.GenerativeModel(model_name)
                    res = model.generate_content(prompt)
                    if res and res.text:
                        return res.text.strip()
                except Exception as e:
                    print(f"Model {model_name} failed: {e}")
                    continue

        except Exception as err:
            print(f"Gemini API call failed: {err}")

        return None

    def answer_query(self, query: str, history: List[Dict[str, str]] = None) -> Dict[str, Any]:
        """
        Executes full RAG workflow:
        1. Context Retrieval via BM25
        2. LLM Synthesis (Gemini API)
        """
        relevant_chunks = self.retrieve(query, top_k=3)
        context_str = "\n\n---\n\n".join([f"Source ({c['topic']}):\n{c['content']}" for c in relevant_chunks])

        # Attempt Gemini API Generation
        answer = self._generate_with_gemini(query, context_str, history)

        # Fallback to error message if Gemini API key isn't provided/valid
        if not answer:
            answer = "I'm sorry, my LLM service is currently unavailable. Please configure a valid Gemini API Key in the backend to enable AI answers."

        # Classify intent for UI card rendering
        q_lower = query.lower()
        res_type = "text"
        if any(w in q_lower for w in ["project", "github", "build", "workload"]):
            res_type = "projects"
        elif any(w in q_lower for w in ["skill", "tech", "stack", "tool", "language", "framework"]):
            res_type = "skills"
        elif any(w in q_lower for w in ["experience", "career", "job", "accenture", "company", "role", "background"]):
            res_type = "experience"
        elif any(w in q_lower for w in ["resume", "cv", "download"]):
            res_type = "resume"

        retrieved_sources = list(dict.fromkeys([c["topic"] for c in relevant_chunks]))

        return {
            "answer": answer,
            "retrieved_sources": retrieved_sources,
            "type": res_type
        }
