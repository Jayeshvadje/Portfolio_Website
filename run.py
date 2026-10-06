"""
Unified Runner Script
Starts the FastAPI RAG backend + Frontend server, or falls back to Python's built-in HTTP server.
"""

import sys
import os
import webbrowser

# Ensure utf-8 encoding for Windows terminals
if sys.platform == "win32":
    try:
        if hasattr(sys.stdout, "reconfigure"):
            sys.stdout.reconfigure(encoding="utf-8")
        if hasattr(sys.stderr, "reconfigure"):
            sys.stderr.reconfigure(encoding="utf-8")
    except Exception:
        pass

def main():
    print("=" * 60)
    print("🚀 Starting Jayesh's AI Conversational Portfolio Website")
    print("=" * 60)

    try:
        import uvicorn
        print("✓ FastAPI & Uvicorn detected. Launching full RAG backend + static frontend...")
        print("📍 Serving at: http://127.0.0.1:8000")
        webbrowser.open("http://127.0.0.1:8000")
        uvicorn.run("backend.app:app", host="127.0.0.1", port=8000, reload=True)
    except ImportError:
        import http.server
        import socketserver

        PORT = 8000
        DIRECTORY = os.path.join(os.path.dirname(__file__), "frontend")
        print("⚠️  FastAPI/Uvicorn not installed yet.")
        print(f"✓ Serving static frontend via Python HTTP Server from: {DIRECTORY}")
        print(f"📍 Serving at: http://127.0.0.1:{PORT}")
        print("💡 To enable full AI backend & RAG API, run: pip install -r backend/requirements.txt")

        class Handler(http.server.SimpleHTTPRequestHandler):
            def __init__(self, *args, **kwargs):
                super().__init__(*args, directory=DIRECTORY, **kwargs)

        webbrowser.open(f"http://127.0.0.1:{PORT}")
        with socketserver.TCPServer(("", PORT), Handler) as httpd:
            try:
                httpd.serve_forever()
            except KeyboardInterrupt:
                print("\nServer stopped.")

if __name__ == "__main__":
    main()



