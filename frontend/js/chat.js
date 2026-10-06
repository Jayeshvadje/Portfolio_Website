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
      <div style="margin-top: 12px;">
        <button class="chip" onclick="document.getElementById('btn-view-resume').click()">📄 Open Resume Preview</button>
      </div>
    `;
  }

  const sourcesTag = responseObj.sources && responseObj.sources.length > 0
    ? `<div class="rag-sources-tag">📍 Sources Grounded: ${responseObj.sources.join(", ")}</div>`
    : "";

  row.innerHTML = `
    <div class="message-avatar">AI</div>
    <div class="message-bubble bot-bubble">
      <p>${escapeHTML(responseObj.answer).replace(/\n/g, '<br>')}</p>
      ${extraContentHTML}
      ${sourcesTag}
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
  return `
    <div style="margin-top: 12px; display: flex; flex-direction: column; gap: 8px;">
      <div><strong>Languages:</strong> ${skills.languages?.join(", ")}</div>
      <div><strong>Frameworks:</strong> ${skills.frameworks?.join(", ")}</div>
      <div><strong>AI & RAG:</strong> ${skills.ai_ml?.join(", ")}</div>
      <div><strong>Tools & DevOps:</strong> ${skills.tools?.join(", ")}</div>
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
  viewport.scrollTop = viewport.scrollHeight;
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
