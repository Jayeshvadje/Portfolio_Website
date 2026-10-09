/**
 * Application Entry & Event Listeners
 * Wires together UI buttons, form submission, chip clicks, and modal handlers.
 */

document.addEventListener("DOMContentLoaded", async () => {
  // Safely initialize chat data cache
  try {
    if (typeof initChat === "function") {
      await initChat();
    }
  } catch (err) {
    console.warn("Failed to initialize chat cache:", err);
  }

  const chatForm = document.getElementById("chat-form");
  const userInput = document.getElementById("user-input");
  const resumeModal = document.getElementById("resume-modal");
  const btnViewResume = document.getElementById("btn-view-resume");
  const btnCloseModal = document.getElementById("modal-close-btn");
  const btnCancelModal = document.getElementById("modal-cancel-btn");
  const btnClearChat = document.getElementById("btn-clear-chat");
  const mobileToggleBtn = document.getElementById("mobile-toggle-btn");
  const sidebar = document.getElementById("sidebar");

  let chatHistory = [];

  async function handleUserQuery(query) {
    if (!query || !query.trim()) return;
    if (userInput) userInput.value = "";
    appendUserMessage(query.trim());
    showTypingIndicator();

    try {
      const response = await sendChatMessage(query.trim(), chatHistory);
      
      chatHistory.push({ role: "user", content: query.trim() });
      chatHistory.push({ role: "assistant", content: response.answer });
      
      appendBotResponse(response);
    } catch (err) {
      console.error("Error processing query:", err);
      removeTypingIndicator();
      appendBotResponse({
        answer: "Sorry, I encountered an issue processing your question. Please try again.",
        sources: []
      });
    }
  }

  // Handle Chat Form Submit
  if (chatForm) {
    chatForm.addEventListener("submit", (e) => {
      e.preventDefault();
      if (userInput) {
        handleUserQuery(userInput.value);
      }
    });
  }

  // Handle Suggestion Chip Clicks
  document.addEventListener("click", (e) => {
    const chip = e.target.closest(".chip");
    if (chip && chip.dataset.prompt) {
      handleUserQuery(chip.dataset.prompt);
    }
  });

  // Handle Quick Sidebar Navigation buttons
  document.querySelectorAll(".nav-btn").forEach((btn) => {
    btn.addEventListener("click", () => {
      const intent = btn.dataset.intent;
      if (intent === "experience") {
        handleUserQuery("Tell me about your AI engineering work experience");
      } else if (intent === "projects") {
        handleUserQuery("Showcase your top projects and github links");
      } else if (intent === "skills") {
        handleUserQuery("What technical skills and tools do you use?");
      } else if (intent === "resume") {
        openResumeModal();
      }

      // Close mobile sidebar if open
      if (window.innerWidth <= 868 && sidebar) {
        sidebar.classList.remove("open");
      }
    });
  });

  // Modal Controls
  function openResumeModal() {
    if (!resumeModal) return;
    resumeModal.removeAttribute("hidden");
    resumeModal.classList.add("active");
    resumeModal.style.display = "flex";
  }

  function closeResumeModal() {
    if (!resumeModal) return;
    resumeModal.setAttribute("hidden", "true");
    resumeModal.classList.remove("active");
    resumeModal.style.display = "none";
  }

  // Expose globally for inline onclick triggers
  window.openResumeModal = openResumeModal;
  window.closeResumeModal = closeResumeModal;

  if (btnViewResume) {
    btnViewResume.addEventListener("click", openResumeModal);
  }

  if (btnCloseModal) {
    btnCloseModal.addEventListener("click", (e) => {
      e.stopPropagation();
      closeResumeModal();
    });
  }

  if (btnCancelModal) {
    btnCancelModal.addEventListener("click", (e) => {
      e.stopPropagation();
      closeResumeModal();
    });
  }

  if (resumeModal) {
    resumeModal.addEventListener("click", (e) => {
      if (e.target === resumeModal) {
        closeResumeModal();
      }
    });
  }

  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && resumeModal && resumeModal.style.display !== "none") {
      closeResumeModal();
    }
  });

  // Clear Chat History
  if (btnClearChat) {
    btnClearChat.addEventListener("click", () => {
      chatHistory = [];
      const messagesViewport = document.getElementById("messages-viewport");
      if (!messagesViewport) return;
      messagesViewport.innerHTML = `
        <div class="message-row bot-row">
          <div class="message-avatar">AI</div>
          <div class="message-bubble bot-bubble">
            <p>Conversation reset. How can I help you explore Jayesh's background?</p>
            <div class="quick-suggestions-container">
              <div class="suggestion-chips">
                <button class="chip" data-prompt="What is your professional background?">💼 Experience</button>
                <button class="chip" data-prompt="Show me your projects">🚀 Projects</button>
                <button class="chip" data-prompt="What are your skills?">🛠️ Skills</button>
              </div>
            </div>
          </div>
        </div>
      `;
    });
  }

  // Mobile Sidebar Toggle
  if (mobileToggleBtn && sidebar) {
    mobileToggleBtn.addEventListener("click", () => {
      sidebar.classList.toggle("open");
    });
  }
});
