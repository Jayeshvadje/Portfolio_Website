/**
 * Chat Rendering & UI Logic
 * Formats message bubbles, interactive project cards, skill badges, and timeline items.
 */

const viewport = document.getElementById("messages-viewport");
let profileCache = null;

async function initChat() {
  profileCache = await fetchProfileData();
}

function appendUserMessage(text) {
  const row = document.createElement("div");
  row.className = "message-row user-row";
  row.innerHTML = `
    <div class="message-avatar">You</div>
    <div class="message-bubble user-bubble">
      <p>${escapeHTML(text)}</p>
    </div>
  `;
  viewport.appendChild(row);
  scrollToBottom();
}

function showTypingIndicator() {
  const row = document.createElement("div");
  row.className = "message-row bot-row";
  row.id = "typing-row";
  row.innerHTML = `
    <div class="message-avatar">AI</div>
    <div class="typing-indicator">
      <div class="typing-dot"></div>
      <div class="typing-dot"></div>
      <div class="typing-dot"></div>
    </div>
  `;
  viewport.appendChild(row);
  scrollToBottom();
}

function removeTypingIndicator() {
  const typing = document.getElementById("typing-row");
  if (typing) typing.remove();
}

function appendBotResponse(responseObj) {
  removeTypingIndicator();

  const row = document.createElement("div");
  row.className = "message-row bot-row";

  let extraContentHTML = "";

  // Render Rich UI Components based on response type
  if (responseObj.type === "projects" && profileCache?.projects) {
    extraContentHTML = renderProjectsHTML(profileCache.projects);
  } else if (responseObj.type === "skills" && profileCache?.skills) {
    extraContentHTML = renderSkillsHTML(profileCache.skills);
  } else if (responseObj.type === "experience" && profileCache?.experience) {
    extraContentHTML = renderExperienceHTML(profileCache.experience);
  } else if (responseObj.type === "resume") {
    extraContentHTML = `
      <div class="resume-chat-preview" style="margin-top: 14px; background: rgba(255,255,255,0.03); border: 1px solid var(--border-color, #333); border-radius: 10px; padding: 14px;">
        <h4 style="margin:0 0 4px 0; color: #fff;">Jayesh Vadje</h4>
        <p style="margin:0 0 10px 0; font-size: 0.88rem; color: var(--accent-primary, #6366f1); font-weight: 500;">AI/ML Engineer</p>
        <hr style="border:0; border-top: 1px solid rgba(255,255,255,0.1); margin: 8px 0;">
        <p style="margin: 6px 0; font-size: 0.85rem; line-height: 1.4;"><strong>Core Competencies:</strong> RAG Architecture, Agentic AI, LangGraph, CrewAI, Python, FastAPI, Vector DBs (Pinecone, ChromaDB), LLMs (GPT-4o, Claude)</p>
        <p style="margin: 6px 0; font-size: 0.85rem; line-height: 1.4;"><strong>Experience Summary:</strong> AI/ML Engineer at Accenture (2023 - Present) building multi-agent RAG engines and LLM microservices; Former Quality Assurance Engineer (2022 - 2023).</p>
        <div style="margin-top: 12px; display: flex; gap: 10px; flex-wrap: wrap; align-items: center;">
          <button class="chip" onclick="if(typeof openResumeModal === 'function') openResumeModal();" style="cursor: pointer;">👁️ Open Full Resume Modal</button>
          <a href="/assets/docs/resume.pdf" download="Jayesh_Resume.pdf" target="_blank" class="chip" style="background: var(--accent-primary, #6366f1); color: #fff; text-decoration: none; font-weight: 500;">📥 Download Full PDF Resume</a>
        </div>
      </div>
    `;
    setTimeout(() => {
      if (typeof openResumeModal === 'function') openResumeModal();
    }, 300);
  }

  row.innerHTML = `
    <div class="message-avatar">AI</div>
    <div class="message-bubble bot-bubble">
      <p>${parseMarkdown(responseObj.answer)}</p>
      ${extraContentHTML}
    </div>
  `;

  viewport.appendChild(row);
  scrollToBottom();
}

function renderProjectsHTML(projects) {
  const cards = projects.map(p => `
    <div class="project-card">
      <h4 class="card-title">${escapeHTML(p.title)}</h4>
      <p class="card-desc">${escapeHTML(p.description)}</p>
      <div class="card-tags">
        ${p.technologies.map(t => `<span class="card-tag">${escapeHTML(t)}</span>`).join("")}
      </div>
      <div class="card-links">
        ${p.github ? `<a href="${p.github}" target="_blank" rel="noopener">GitHub Repo &rarr;</a>` : ""}
      </div>
    </div>
  `).join("");

  return `<div class="cards-grid">${cards}</div>`;
}

function renderSkillsHTML(skills) {
  const webBackend = skills["Web & Backend"] || skills.frameworks || [];
  const aiRag = skills["AI & RAG"] || skills.ai_ml || [];
  const languages = skills.languages || [];
  const tools = skills.tools || [];

  return `
    <div style="margin-top: 12px; display: flex; flex-direction: column; gap: 8px;">
      ${languages.length ? `<div><strong>Languages:</strong> ${languages.join(", ")}</div>` : ""}
      ${webBackend.length ? `<div><strong>Web & Backend:</strong> ${webBackend.join(", ")}</div>` : ""}
      ${aiRag.length ? `<div><strong>AI & RAG:</strong> ${aiRag.join(", ")}</div>` : ""}
      ${tools.length ? `<div><strong>Tools & DevOps:</strong> ${tools.join(", ")}</div>` : ""}
    </div>
  `;
}

function renderExperienceHTML(expList) {
  const cards = expList.map(e => `
    <div class="exp-card">
      <h4 class="card-title">${escapeHTML(e.role)} &bull; ${escapeHTML(e.company)}</h4>
      <small style="color: var(--accent-secondary); display:block; margin-bottom: 6px;">${escapeHTML(e.period)}</small>
      <p class="card-desc">${escapeHTML(e.description)}</p>
      ${e.highlights ? `
        <ul style="padding-left: 18px; font-size: 0.85rem; color: var(--text-secondary);">
          ${e.highlights.map(h => `<li>${escapeHTML(h)}</li>`).join("")}
        </ul>
      ` : ""}
    </div>
  `).join("");

  return `<div class="cards-grid">${cards}</div>`;
}

function scrollToBottom() {
  viewport.scrollTo({
    top: viewport.scrollHeight,
    behavior: 'smooth'
  });
}

function escapeHTML(str) {
  if (!str) return "";
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

function parseMarkdown(str) {
  if (!str) return "";
  let text = escapeHTML(str);
  // Bold
  text = text.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
  // Italic
  text = text.replace(/\*(.*?)\*/g, '<em>$1</em>');
  // Newlines
  text = text.replace(/\n/g, '<br>');
  // Bullet points
  text = text.replace(/(<br>)- /g, '$1&bull; ');
  return text;
}
