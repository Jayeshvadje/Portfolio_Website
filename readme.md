# 🤖 Interactive AI Portfolio & Career Chatbot

An intelligent, interactive portfolio website featuring a **RAG-powered (Retrieval-Augmented Generation)** chatbot. This platform showcases my professional journey, career milestones, technical skills, and work experience, while enabling visitors and recruiters to ask custom questions and receive accurate, context-grounded answers in real-time.

---

## 🌟 Key Features

- **💬 RAG-Powered AI Chatbot**:
  - Ask any question regarding my background, projects, skill set, or work history.
  - Retrieves factual context from ingested documents (resume, project logs, credentials) to minimize hallucinations.
- **🚀 Professional Journey & Milestones**:
  - Interactive timeline highlighting career progression, key achievements, and educational background.
- **🛠️ Skills & Competencies**:
  - Categorized breakdown of programming languages, frameworks, developer tools, and domain expertise.
- **📄 Resume Viewer & Download**:
  - Built-in resume preview with one-click download access.
- **🎨 Modern & Responsive Design**:
  - Sleek, intuitive UI optimized for both desktop and mobile devices.
  - Interactive moving AI background powered by Particles.js.
  - Futuristic floating AI avatar with pulsing animations.

---

## 🧠 How the RAG Pipeline Works

```mermaid
flowchart LR
    A[Visitor Question] --> B[Embedding Model]
    B --> C[Vector Search / Similarity]
    D[(Resume & Career Data)] --> C
    C --> E[Relevant Context Chunks]
    E --> F[LLM Generation Engine]
    A --> F
    F --> G[Accurate & Tailored Answer]
```

1. **Document Ingestion**: Resume, detailed project writeups, and career history are processed, chunked, and embedded into a vector store.
2. **Context Retrieval**: When a visitor enters a prompt, the most semantically relevant chunks are retrieved.
3. **Generation**: The language model synthesizes an accurate, professional response using the retrieved knowledge.

---

## 💻 Tech Stack

| Layer | Technologies |
| :--- | :--- |
| **Frontend** | HTML5, CSS3 (Vanilla), JavaScript, Particles.js |
| **Backend & API** | Python, FastAPI, Uvicorn |
| **RAG / AI Orchestration** | Google Generative AI (Gemini), BM25 Retriever |
| **Data Storage** | Local JSON & Markdown files |

---

## 📁 Project Structure

```text
my_Website_project/
├── backend/                  # FastAPI & RAG Backend
│   ├── app.py                # Main server (API endpoints + static server)
│   ├── requirements.txt      # Python dependencies
│   ├── data/                 # Ground truth knowledge base
│   │   ├── profile.json      # Structured profile, projects, and skills
│   │   └── resume_data.md    # Markdown knowledge document for RAG chunking
│   └── rag/                  # RAG pipeline logic
│       ├── __init__.py
│       └── engine.py         # Retrieval & semantic response synthesizer
├── frontend/                 # Conversational Portfolio Web Client
│   ├── index.html            # Main website entry point (Chatbot UI)
│   ├── css/
│   │   ├── style.css         # Theme tokens, layout, typography, sidebar
│   │   └── chat.css          # Message bubbles, interactive cards, input area
│   ├── js/
│   │   ├── app.js            # App lifecycle, navigation, event listeners
│   │   ├── chat.js           # Message stream, typing indicator, rich cards
│   │   └── api.js            # API client + client-side RAG fallback
│   └── assets/               # Static assets & docs
│       └── docs/             # Resume PDF directory (resume.pdf)
├── .env.example              # Environment variable template
├── .gitignore                # Git exclusions
├── readme.md                 # Project documentation
└── run.py                    # Unified one-command runner script
```

---

## 🚀 Getting Started

### 1. Quick Run (Instant View)
You can launch the portfolio website immediately using Python:
```bash
python run.py
```
*If FastAPI is not installed yet, it automatically serves the frontend via Python's built-in HTTP server on `http://127.0.0.1:8000`.*

### 2. Full AI Backend Setup
To enable the full Python RAG backend and API endpoints:
```bash
# Install dependencies
pip install -r backend/requirements.txt

# (Optional) Copy environment variables and add your Gemini API Key
cp .env.example .env

# Run server (Automatically detects and runs FastAPI)
python run.py
```

---

## 📬 Contact & Connect

- **Portfolio**: [jayeshvadje.github.io](https://jayeshvadje.github.io)
- **LinkedIn**: [Jayesh Vadje](https://www.linkedin.com/in/jayesh-vadje-31348b1b3)
- **GitHub**: [Jayeshvadje](https://github.com/Jayeshvadje)
- **Email**: [jayeshananda17@gmail.com](mailto:jayeshananda17@gmail.com)
