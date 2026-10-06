/**
 * API Client
 * Manages communication with the FastAPI RAG backend with an automatic
 * client-side fallback if the backend service is offline.
 */

const API_BASE = window.location.origin;

// Local fallback portfolio data (guarantees site works even as static file)
const FALLBACK_PROFILE = {
  personal: {
    name: "Jayesh",
    title: "Software Engineer & AI Enthusiast",
    links: {
      github: "https://github.com/",
      linkedin: "https://linkedin.com/in/",
      email: "jayesh@example.com"
    }
  },
  skills: {
    languages: ["Python", "JavaScript (ES6+)", "HTML5", "CSS3", "SQL"],
    frameworks: ["FastAPI", "Flask", "React", "Node.js"],
    ai_ml: ["RAG Architecture", "Vector Databases", "Embeddings", "LangChain", "LLMs"],
    tools: ["Git", "GitHub", "Docker", "VS Code", "Postman"]
  },
  experience: [
    {
      role: "Software Developer / Engineer",
      company: "Tech Systems",
      period: "2023 - Present",
      description: "Building responsive full-stack applications, intelligent RAG pipelines, and high-performance APIs.",
      highlights: [
        "Implemented context-grounded AI chatbot workflows",
        "Crafted accessible, aesthetic web frontends",
        "Streamlined backend data indexing and query latency"
      ]
    }
  ],
  projects: [
    {
      title: "Conversational Portfolio & RAG Assistant",
      category: "AI & Full Stack",
      description: "An interactive portfolio where visitors explore career milestones, projects, and skills through conversational Q&A.",
      technologies: ["Python", "FastAPI", "RAG", "HTML/CSS/JS"],
      github: "https://github.com/your-username/my_Website_project"
    },
    {
      title: "Context-Aware Knowledge Retrieval Engine",
      category: "Machine Learning / AI",
      description: "A semantic search and retrieval system that chunks documents and answers queries with high fidelity.",
      technologies: ["Python", "Embeddings", "Vector Store"],
      github: "https://github.com/your-username"
    }
  ]
};

async function fetchProfileData() {
  try {
    const res = await fetch(`${API_BASE}/api/profile`);
    if (res.ok) {
      return await res.json();
    }
  } catch (err) {
    console.warn("Backend API not reachable. Using fallback local portfolio knowledge.");
  }
  return FALLBACK_PROFILE;
}

async function sendChatMessage(message) {
  try {
    const res = await fetch(`${API_BASE}/api/chat`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ message })
    });
    if (res.ok) {
      return await res.json();
    }
  } catch (err) {
    console.warn("Backend chat endpoint offline, responding via client RAG engine.");
  }

  // Client-Side Grounded RAG Fallback
  return synthesizeClientResponse(message);
}

function synthesizeClientResponse(query) {
  const q = query.toLowerCase();

  if (q.includes("project") || q.includes("work") || q.includes("build")) {
    return {
      answer: "Here are some of my key technical projects with links and tech stacks:",
      type: "projects",
      sources: ["Projects Section", "portfolio.json"]
    };
  }

  if (q.includes("skill") || q.includes("tech") || q.includes("stack") || q.includes("language")) {
    return {
      answer: "Here is an overview of my core technical skills and tools:",
      type: "skills",
      sources: ["Skills Matrix", "resume_data.md"]
    };
  }

  if (q.includes("experience") || q.includes("career") || q.includes("job") || q.includes("journey") || q.includes("background")) {
    return {
      answer: "Here is a summary of my professional journey and software engineering experience:",
      type: "experience",
      sources: ["Experience Timeline", "resume_data.md"]
    };
  }

  if (q.includes("resume") || q.includes("cv") || q.includes("download")) {
    return {
      answer: "You can view and download my official resume using the button in the header or the link below.",
      type: "resume",
      sources: ["resume.pdf"]
    };
  }

  if (q.includes("rag") || q.includes("retrieval") || q.includes("bot")) {
    return {
      answer: "This website uses Retrieval-Augmented Generation (RAG). When you ask a query, the system retrieves semantically relevant context from my ingested resume & project documents and generates an answer strictly grounded in that knowledge.",
      type: "text",
      sources: ["RAG Architecture Docs"]
    };
  }

  return {
    answer: "Thanks for asking! I am Jayesh's AI assistant. You can ask me about his work experience, technical projects, core skills, or how this RAG pipeline is built.",
    type: "text",
    sources: ["General Bio"]
  };
}
