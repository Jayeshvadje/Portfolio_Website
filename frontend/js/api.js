/**
 * API Client
 * Manages communication with the FastAPI RAG backend.
 */

const API_BASE = window.location.origin;

async function fetchProfileData() {
    try {
      const res = await fetch(`${API_BASE}/api/profile`);
      if (res.ok) {
        return await res.json();
      }
    } catch (err) {
      console.warn("Backend API not reachable.");
    }
    return null;
}

async function sendChatMessage(message, history = []) {
    try {
      const res = await fetch(`${API_BASE}/api/chat`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message, history })
      });
      if (res.ok) {
        return await res.json();
      }
    } catch (err) {
      console.warn("Backend chat endpoint offline.");
    }

    return {
      answer: "I'm sorry, my LLM service is currently unavailable. Please configure a valid Gemini API Key in your .env file and ensure the backend is running.",
      type: "text",
      sources: []
    };
}
