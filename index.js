(function () {
  // Default configuration - can be overridden by window.aiChatConfig
  const defaultConfig = {
    chatUrl:
      "https://cyrene.us01.erebrus.io/b450db11-332b-0fc2-a144-92824a34f699/message",
    agentName: "Assistant",
    primaryColor: "#1366d9",
    position: "bottom-right",
    greeting: null,
    placeholder: "Type your message...",
    buttonIcon: "💬",
    theme: "light",
  };

  // Merge user config with defaults
  const config = Object.assign({}, defaultConfig, window.aiChatConfig || {});

  // Position styles
  const positions = {
    "bottom-right": "bottom: 20px; right: 20px;",
    "bottom-left": "bottom: 20px; left: 20px;",
    "top-right": "top: 20px; right: 20px;",
    "top-left": "top: 20px; left: 20px;",
  };

  // Here we fetch the chat with agent api
  const agentChatUrl = config.chatUrl;

  // Here we fetch the agnet information api
  const agentInfoUrl = config.agentInfoUrl;
  let agentInfo;
  async function loadAgentInfo() {
    try {
      const response = await fetch(agentInfoUrl);
      agentInfo = await response.json();
    } catch (error) {
      console.error("Error fetching agent info:", error);
    }
  }
  loadAgentInfo();

  // Inject CSS
  const style = document.createElement("style");
  style.textContent = `
        /* Widget Container */
        #agent-widget {
            position: fixed;
            ${positions[config.position]}
            z-index: 10000;
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
        }

        /* Chat Button */
        #agent-button {
            width: 60px;
            height: 60px;
            border-radius: 50%;
            background: ${config.primaryColor};
            border: none;
            cursor: pointer;
            display: flex;
            align-items: center;
            justify-content: center;
            color: white;
            font-size: 24px;
            box-shadow: 0 4px 20px rgba(0,0,0,0.15);
            transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
            position: relative;
            overflow: hidden;
        }

        #agent-button:hover {
            transform: scale(1.05);
            box-shadow: 0 6px 25px rgba(0,0,0,0.25);
        }

        #agent-button:active {
            transform: scale(0.98);
        }

        /* Button pulse animation when closed */
        #agent-button.pulse::before {
            content: '';
            position: absolute;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            border-radius: 50%;
            background: ${config.primaryColor};
            animation: pulse 2s infinite;
            z-index: -1;
        }

        @keyframes pulse {
            0% { transform: scale(1); opacity: 1; }
            100% { transform: scale(1.3); opacity: 0; }
        }

        /* Chat Panel */
        #agent-panel {
            position: absolute;
            bottom: 80px;
            right: 0;
            width: 380px;
            height: 550px;
            background: white;
            border-radius: 16px;
            box-shadow: 0 20px 60px rgba(0,0,0,0.2);
            transform: translateY(20px) scale(0.95);
            opacity: 0;
            visibility: hidden;
            transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
            display: flex;
            flex-direction: column;
            overflow: hidden;
            border: 1px solid #e2e8f0;
        }

        #agent-panel.open {
            transform: translateY(0) scale(1);
            opacity: 1;
            visibility: visible;
        }

        #agent-panel.minimized {
            height: 60px;
        }

        /* Position adjustments for different corners */
        #agent-widget[data-position="bottom-left"] #agent-panel {
            right: auto;
            left: 0;
        }

        #agent-widget[data-position="top-right"] #agent-panel {
            bottom: auto;
            top: 80px;
        }

        #agent-widget[data-position="top-left"] #agent-panel {
            bottom: auto;
            top: 80px;
            right: auto;
            left: 0;
        }

        /* Header */
        #agent-header {
            padding: 20px;
            background: linear-gradient(135deg, ${
              config.primaryColor
            }, #1e40af);
            color: white;
            display: flex;
            align-items: center;
            justify-content: space-between;
            cursor: pointer;
            flex-shrink: 0;
        }

        #agent-header:hover {
            background: linear-gradient(135deg, #1e40af, ${
              config.primaryColor
            });
        }

        .agent-agent-info {
            display: flex;
            align-items: center;
            gap: 12px;
        }

        .agent-avatar {
            width: 36px;
            height: 36px;
            border-radius: 50%;
            background: rgba(255,255,255,0.2);
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 16px;
            font-weight: 600;
            flex-shrink: 0;
        }

        .agent-agent-details h3 {
            margin: 0;
            font-size: 16px;
            font-weight: 600;
        }

        .agent-status {
            margin: 0;
            font-size: 12px;
            opacity: 0.9;
            display: flex;
            align-items: center;
            gap: 4px;
        }

        .agent-status::before {
            content: '';
            width: 8px;
            height: 8px;
            background: #10b981;
            border-radius: 50%;
            display: inline-block;
        }

        .agent-controls {
            display: flex;
            gap: 8px;
        }

        .agent-control-btn {
            background: none;
            border: none;
            color: white;
            cursor: pointer;
            padding: 4px;
            border-radius: 4px;
            width: 28px;
            height: 28px;
            display: flex;
            align-items: center;
            justify-content: center;
            transition: background 0.2s;
        }

        #agent-close:hover {
            background: rgba(255,255,255,0.2);
        }

        /* Messages */
        #agent-messages {
            flex: 1;
            padding: 20px;
            overflow-y: auto;
            background: #f8fafc;
            display: flex;
            flex-direction: column;
            gap: 16px;
        }

        #agent-panel.minimized #agent-messages {
            display: none;
        }

        .agent-message {
            display: flex;
            gap: 12px;
            align-items: flex-start;
        }

        .agent-message.user {
            flex-direction: row-reverse;
        }

        .agent-message-avatar {
            width: 32px;
            height: 32px;
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 12px;
            font-weight: 600;
            flex-shrink: 0;
        }

        .agent-message.user .agent-message-avatar {
            background: ${config.primaryColor};
            color: white;
        }

        .agent-message.bot .agent-message-avatar {
            background: #e5e7eb;
            color: #6b7280;
        }

        .agent-message-content {
            max-width: 75%;
            padding: 12px 16px;
            border-radius: 18px;
            line-height: 1.4;
            word-wrap: break-word;
            position: relative;
        }

        .agent-message.user .agent-message-content {
            background: ${config.primaryColor};
            color: white;
            border-bottom-right-radius: 4px;
        }

        .agent-message.bot .agent-message-content {
            background: white;
            color: #374151;
            border: 1px solid #e5e7eb;
            border-bottom-left-radius: 4px;
            box-shadow: 0 1px 3px rgba(0,0,0,0.05);
        }

        .agent-timestamp {
            font-size: 11px;
            color: #9ca3af;
            text-align: center;
            margin-top: 4px;
        }

        /* Input Area */
        #agent-input-area {
            padding: 16px 20px 20px;
            background: white;
            border-top: 1px solid #e5e7eb;
            flex-shrink: 0;
        }

        #agent-panel.minimized #agent-input-area {
            display: none;
        }

        .agent-input-container {
            position: relative;
            display: flex;
            align-items: flex-end;
            gap: 8px;
        }

        #agent-input {
            flex: 1;
            padding: 12px 16px;
            border: 1px solid #e5e7eb;
            border-radius: 20px;
            font-size: 14px;
            outline: none;
            resize: none;
            font-family: inherit;
            max-height: 100px;
            min-height: 44px;
            transition: border-color 0.2s;
            background: #f9fafb;
        }

        #agent-input:focus {
            border-color: ${config.primaryColor};
            background: white;
        }

        #agent-input::placeholder {
            color: #9ca3af;
        }

        #agent-send {
            background: ${config.primaryColor};
            border: none;
            border-radius: 50%;
            width: 44px;
            height: 44px;
            color: white;
            cursor: pointer;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 18px;
            transition: all 0.2s;
            flex-shrink: 0;
        }

        #agent-send:hover:not(:disabled) {
            background: #1e40af;
            transform: scale(1.05);
        }

        #agent-send:disabled {
            background: #d1d5db;
            cursor: not-allowed;
            transform: none;
        }

        /* Typing Indicator */
        .agent-typing {
            display: flex;
            gap: 4px;
            padding: 12px 16px;
            background: white;
            border: 1px solid #e5e7eb;
            border-radius: 18px;
            border-bottom-left-radius: 4px;
            box-shadow: 0 1px 3px rgba(0,0,0,0.05);
            width: fit-content;
        }

        .agent-typing-dot {
            width: 6px;
            height: 6px;
            border-radius: 50%;
            background: #9ca3af;
            animation: agent-typing 1.4s infinite ease-in-out;
        }

        .agent-typing-dot:nth-child(1) { animation-delay: -0.32s; }
        .agent-typing-dot:nth-child(2) { animation-delay: -0.16s; }
        .agent-typing-dot:nth-child(3) { animation-delay: 0s; }

        @keyframes agent-typing {
            0%, 80%, 100% { opacity: 0.3; transform: scale(0.8); }
            40% { opacity: 1; transform: scale(1); }
        }

        /* Notification Badge */
        .agent-notification {
            position: absolute;
            top: -8px;
            right: -8px;
            background: #ef4444;
            color: white;
            border-radius: 50%;
            width: 20px;
            height: 20px;
            font-size: 11px;
            display: flex;
            align-items: center;
            justify-content: center;
            font-weight: 600;
            animation: notification-bounce 0.5s ease-out;
        }

        @keyframes notification-bounce {
            0% { transform: scale(0); }
            50% { transform: scale(1.2); }
            100% { transform: scale(1); }
        }

        /* Mobile Responsive */
        @media (max-width: 640px) {
            #agent-panel {
                width: calc(100vw - 40px);
                right: 20px;
                left: 20px;
                max-width: 380px;
            }

            #agent-widget[data-position="bottom-left"] #agent-panel {
                left: 20px;
                right: 20px;
            }

            #agent-panel {
                height: 500px;
            }

            #agent-header {
                padding: 16px;
            }

            .agent-avatar {
                width: 32px;
                height: 32px;
                font-size: 14px;
            }

            .agent-agent-details h3 {
                font-size: 14px;
            }

            #agent-messages {
                padding: 16px;
            }

            #agent-input-area {
                padding: 12px 16px 16px;
            }
        }

        /* High contrast mode support */
        @media (prefers-contrast: high) {
            #agent-panel {
                border: 2px solid #000;
            }
            
            .agent-message.bot .agent-message-content {
                border: 2px solid #374151;
            }
        }

        /* Scrollbar styling */
        #agent-messages::-webkit-scrollbar {
            width: 6px;
        }

        #agent-messages::-webkit-scrollbar-track {
            background: transparent;
        }

        #agent-messages::-webkit-scrollbar-thumb {
            background: #d1d5db;
            border-radius: 3px;
        }

        #agent-messages::-webkit-scrollbar-thumb:hover {
            background: #9ca3af;
        }
    `;
  document.head.appendChild(style);

  // Create widget HTML
  const widget = document.createElement("div");
  widget.id = "agent-widget";
  widget.setAttribute("data-position", config.position);
  widget.innerHTML = `
        <button id="agent-button" class="pulse">
            ${config.buttonIcon}
        </button>
        
        <div id="agent-panel">
            <div id="agent-header">
                <div class="agent-agent-info">
                    <div class="agent-avatar">
                    AI
                    </div>
                    <div class="agent-agent-details">
                        <h3>${config.agentName}</h3>
                        <p class="agent-status">Online</p>
                    </div>
                </div>
                <div class="agent-controls">
                    <button id="agent-minimize" class="agent-control-btn"></button>
                    <button id="agent-close" class="agent-control-btn" title="Close">-</button>
                </div>
            </div>
            
            <div id="agent-messages">
                <div class="agent-message bot">
                    <div class="agent-message-avatar">AI</div>
                    <div class="agent-message-content">
                        ${
                          config.greeting ||
                          `Hi! I'm ${config.agentName}. How can I help you today?`
                        }
                        <div class="agent-timestamp">${new Date().toLocaleTimeString(
                          [],
                          { hour: "2-digit", minute: "2-digit" }
                        )}</div>
                    </div>
                </div>
            </div>
            
            <div id="agent-input-area">
                <div class="agent-input-container">
                    <textarea id="agent-input" placeholder="${
                      config.placeholder
                    }" rows="1"></textarea>
                    <button id="agent-send">→</button>
                </div>
            </div>
        </div>
    `;

  document.body.appendChild(widget);

  // Widget functionality
  const button = document.getElementById("agent-button");
  const panel = document.getElementById("agent-panel");
  const closeBtn = document.getElementById("agent-close");
  const minimizeBtn = document.getElementById("agent-minimize");
  const header = document.getElementById("agent-header");
  const input = document.getElementById("agent-input");
  const sendBtn = document.getElementById("agent-send");
  const messagesContainer = document.getElementById("agent-messages");

  let isOpen = false;
  let isMinimized = false;
  let isLoading = false;
  let unreadCount = 0;

  // Event listeners
  button.addEventListener("click", togglePanel);
  closeBtn.addEventListener("click", closePanel);
  minimizeBtn.addEventListener("click", toggleMinimize);
  header.addEventListener("click", () => {
    if (isMinimized) toggleMinimize();
  });
  sendBtn.addEventListener("click", sendMessage);
  input.addEventListener("keypress", (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  });

  // Auto-resize textarea
  input.addEventListener("input", function () {
    this.style.height = "auto";
    this.style.height = Math.min(this.scrollHeight, 100) + "px";
  });

  function togglePanel() {
    if (isOpen) {
      closePanel();
    } else {
      openPanel();
    }
  }

  function openPanel() {
    isOpen = true;
    panel.classList.add("open");
    button.classList.remove("pulse");
    input.focus();
    clearNotifications();

    // Hide the demo indicator
    const indicator = document.querySelector(".chat-indicator");
    if (indicator) {
      indicator.style.display = "none";
    }
  }

  function closePanel() {
    isOpen = false;
    isMinimized = false;
    panel.classList.remove("open", "minimized");
    button.classList.add("pulse");
  }

  function toggleMinimize() {
    isMinimized = !isMinimized;
    panel.classList.toggle("minimized", isMinimized);
    if (!isMinimized) {
      input.focus();
    }
  }

  function addMessage(content, isUser = false) {
    const messageDiv = document.createElement("div");
    messageDiv.className = `agent-message ${isUser ? "user" : "bot"}`;

    const timestamp = new Date().toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    });

    if (isUser) {
      messageDiv.innerHTML = `
                <div class="agent-message-avatar">You</div>
                <div class="agent-message-content">
                    ${escapeHtml(content)}
                    <div class="agent-timestamp">${timestamp}</div>
                </div>
            `;
    } else {
      messageDiv.innerHTML = `
                <div class="agent-message-avatar">AI</div>
                <div class="agent-message-content">
                    ${escapeHtml(content)}
                    <div class="agent-timestamp">${timestamp}</div>
                </div>
            `;
    }

    messagesContainer.appendChild(messageDiv);
    messagesContainer.scrollTop = messagesContainer.scrollHeight;

    // Add notification if panel is closed or minimized
    if (!isOpen || isMinimized) {
      if (!isUser) {
        showNotification();
      }
    }
  }

  function showTypingIndicator() {
    const typingDiv = document.createElement("div");
    typingDiv.className = "agent-message bot agent-typing-message";
    typingDiv.innerHTML = `
            <div class="agent-message-avatar">AI</div>
            <div class="agent-typing">
                <div class="agent-typing-dot"></div>
                <div class="agent-typing-dot"></div>
                <div class="agent-typing-dot"></div>
            </div>
        `;
    messagesContainer.appendChild(typingDiv);
    messagesContainer.scrollTop = messagesContainer.scrollHeight;
    return typingDiv;
  }

  function removeTypingIndicator(typingElement) {
    if (typingElement && typingElement.parentNode) {
      typingElement.parentNode.removeChild(typingElement);
    }
  }

  function showNotification() {
    unreadCount++;
    let notificationBadge = button.querySelector(".agent-notification");

    if (!notificationBadge) {
      notificationBadge = document.createElement("div");
      notificationBadge.className = "agent-notification";
      button.appendChild(notificationBadge);
    }

    notificationBadge.textContent = unreadCount > 9 ? "9+" : unreadCount;
  }

  function clearNotifications() {
    unreadCount = 0;
    const notificationBadge = button.querySelector(".agent-notification");
    if (notificationBadge) {
      notificationBadge.remove();
    }
  }

  function escapeHtml(text) {
    const div = document.createElement("div");
    div.textContent = text;
    return div.innerHTML;
  }

  async function sendMessage() {
    const message = input.value.trim();
    if (!message || isLoading) return;

    // Add user message
    addMessage(message, true);
    input.value = "";
    input.style.height = "auto";

    // Show typing indicator
    const typingIndicator = showTypingIndicator();
    isLoading = true;
    sendBtn.disabled = true;

    try {
      // Create FormData for the API call
      const formData = new FormData();
      formData.append("text", message);
      formData.append("userId", "widget-user-" + Date.now());
      formData.append("voice_mode", "false");

      const response = await fetch(agentChatUrl, {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      const botResponse =
        data[0]?.text || "I'm sorry, I couldn't process your request.";

      // Remove typing indicator and add bot response
      removeTypingIndicator(typingIndicator);
      addMessage(botResponse);
    } catch (error) {
      console.error("agent Widget Error:", error);
      removeTypingIndicator(typingIndicator);
      addMessage(
        "I'm sorry, there was an error processing your request. Please try again."
      );
    } finally {
      isLoading = false;
      sendBtn.disabled = false;
      if (isOpen && !isMinimized) {
        input.focus();
      }
    }
  }

  // Helper function to update agent info in the widget
  function updateAgentInfoUI() {
    if (!agentInfo) return;

    // Update agent name
    const nameEl = document.querySelector(
      "#agent-header .agent-agent-details h3"
    );
    if (nameEl && agentInfo.agent.name) {
      nameEl.textContent = agentInfo.agent.name;
    }

    // Update Header Avatar image if available
    const HeaderAvatarEl = document.querySelector(
      "#agent-header .agent-avatar"
    );
    if (HeaderAvatarEl && agentInfo.agent.avatar_img) {
      // If avatar_img is a URL or IPFS hash
      let avatarUrl = agentInfo.agent.avatar_img;
      if (!avatarUrl.startsWith("http")) {
        avatarUrl = `https://ipfs.erebrus.io/ipfs/${avatarUrl}`;
      }
      const img = document.createElement("img");
      img.src = avatarUrl;
      img.alt = agentInfo.agent.name || "AI";
      img.style.cssText = `
        width: 100%;
        height: 100%;
        object-fit: cover;
        border-radius: 50%;
      `;
      img.onerror = function () {
        HeaderAvatarEl.textContent = "AI";
      };
      HeaderAvatarEl.innerHTML = "";
      HeaderAvatarEl.appendChild(img);
    }

    // Update Messages Avatar image if available
    const messageAvatars = document.querySelectorAll(
      "#agent-messages .agent-message-avatar"
    );
    messageAvatars.forEach((messageAvatar) => {
      if (messageAvatar && agentInfo.agent.avatar_img) {
        // If avatar_img is a URL or IPFS hash
        let avatarUrl = agentInfo.agent.avatar_img;
        if (!avatarUrl.startsWith("http")) {
          avatarUrl = `https://ipfs.erebrus.io/ipfs/${avatarUrl}`;
        }
        const img = document.createElement("img");
        img.src = avatarUrl;
        img.alt = agentInfo.agent.name || "AI";
        img.style.cssText = `
          width: 100%;
          height: 100%;
          object-fit: cover;
          border-radius: 50%;
        `;
        img.onerror = function () {
          messageAvatar.textContent = "AI";
        };
        messageAvatar.innerHTML = "";
        messageAvatar.appendChild(img);
      }
    });
  }

  // Make widget globally accessible for customization
  window.agentWidget = {
    open: openPanel,
    close: closePanel,
    minimize: toggleMinimize,
    addMessage: addMessage,
    config: config,
  };

  // Wait for agentInfo to load, then update UI
  (async () => {
    await loadAgentInfo();
    updateAgentInfoUI();
  })();

  // Auto-pulse the button initially
  setTimeout(() => {
    button.classList.add("pulse");
  }, 2000);
})();
