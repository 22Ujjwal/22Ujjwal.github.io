(function () {
  var API_URL = (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1')
    ? 'http://localhost:3000/api/chat'
    : '/api/chat';

  // Safely render markdown bold/italic/newlines to HTML (HTML-escaped first to prevent XSS)
  function renderMarkdown(text) {
    var escaped = text
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
    // Bold: **text**
    escaped = escaped.replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>');
    // Italic: *text* (single asterisk, not part of **)
    escaped = escaped.replace(/(?<!\*)\*(?!\*)([^*]+)(?<!\*)\*(?!\*)/g, '<em>$1</em>');
    // Newlines to <br>
    escaped = escaped.replace(/\n/g, '<br>');
    return escaped;
  }

  var sessionId = sessionStorage.getItem('chatSessionId');
  if (!sessionId) {
    sessionId = crypto.randomUUID();
    sessionStorage.setItem('chatSessionId', sessionId);
  }

  var history = [];

  var chatMessages = document.getElementById('chat-messages');
  var userInput = document.getElementById('user-input');
  var sendButton = document.getElementById('send-button');

  function scrollToBottom() {
    chatMessages.scrollTop = chatMessages.scrollHeight;
  }

  function addMessage(content, isUser) {
    var messageDiv = document.createElement('div');
    messageDiv.className = 'message ' + (isUser ? 'user' : 'assistant');

    var messageContent = document.createElement('div');
    messageContent.className = 'message-content';

    var text = document.createElement('p');
    if (isUser) {
      text.textContent = content;
    } else {
      text.innerHTML = renderMarkdown(content);
    }
    messageContent.appendChild(text);

    messageDiv.appendChild(messageContent);
    chatMessages.appendChild(messageDiv);
    scrollToBottom();

    return text;
  }

  function createStreamingBubble() {
    var messageDiv = document.createElement('div');
    messageDiv.className = 'message assistant';

    var messageContent = document.createElement('div');
    messageContent.className = 'message-content';

    var text = document.createElement('p');
    messageContent.appendChild(text);
    messageDiv.appendChild(messageContent);
    chatMessages.appendChild(messageDiv);
    scrollToBottom();

    return text;
  }

  function addTypingIndicator() {
    var typingDiv = document.createElement('div');
    typingDiv.className = 'message assistant typing-indicator';
    typingDiv.id = 'typing-indicator';

    var typingContent = document.createElement('div');
    typingContent.className = 'message-content';

    var dots = document.createElement('div');
    dots.className = 'typing-dots';
    dots.innerHTML = '<span></span><span></span><span></span>';

    typingContent.appendChild(dots);
    typingDiv.appendChild(typingContent);
    chatMessages.appendChild(typingDiv);
    scrollToBottom();
  }

  function removeTypingIndicator() {
    var indicator = document.getElementById('typing-indicator');
    if (indicator) indicator.remove();
  }

  function setInputEnabled(enabled) {
    userInput.disabled = !enabled;
    sendButton.disabled = !enabled;
    if (enabled) userInput.focus();
  }

  function getLastMessages(count) {
    return history.slice(-count);
  }

  async function handleSend() {
    var message = userInput.value.trim();
    if (!message) return;

    addMessage(message, true);
    userInput.value = '';
    history.push({ role: 'user', content: message });

    setInputEnabled(false);
    addTypingIndicator();

    try {
      var response = await fetch(API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sessionId: sessionId,
          message: message,
          history: getLastMessages(8)
        })
      });

      if (response.status === 429) {
        removeTypingIndicator();
        addMessage("I'm getting a lot of questions right now. Please wait a moment and try again.", false);
        setInputEnabled(true);
        return;
      }

      if (!response.ok) {
        removeTypingIndicator();
        addMessage("Sorry, something went wrong. Please try again later.", false);
        setInputEnabled(true);
        return;
      }

      var contentType = response.headers.get('content-type') || '';

      if (contentType.includes('text/event-stream')) {
        var reader = response.body.getReader();
        var decoder = new TextDecoder();
        var bubble = null;
        var fullText = '';
        var buffer = '';

        while (true) {
          var result = await reader.read();
          if (result.done) break;

          buffer += decoder.decode(result.value, { stream: true });
          var lines = buffer.split('\n');
          buffer = lines.pop();

          for (var i = 0; i < lines.length; i++) {
            var line = lines[i].trim();
            if (!line.startsWith('data: ')) continue;

            var payload = line.slice(6);
            if (payload === '[DONE]') break;

            try {
              var parsed = JSON.parse(payload);
              if (parsed.text) {
                if (!bubble) {
                  removeTypingIndicator();
                  bubble = createStreamingBubble();
                }
                fullText += parsed.text;
                bubble.innerHTML = renderMarkdown(fullText);
                scrollToBottom();
              }
            } catch (e) {
              // Skip malformed SSE chunks
            }
          }
        }

        if (!bubble) {
          removeTypingIndicator();
          addMessage("Sorry, I couldn't generate a response. Please try again.", false);
        } else {
          history.push({ role: 'assistant', content: fullText });
        }
      } else {
        var data = await response.json();
        removeTypingIndicator();
        var responseText = data.text || "Sorry, I couldn't generate a response.";
        addMessage(responseText, false);
        history.push({ role: 'assistant', content: responseText });
      }
    } catch (error) {
      console.error('Chat error:', error);
      removeTypingIndicator();
      addMessage("Sorry, I'm having trouble connecting. Please try again later.", false);
    } finally {
      setInputEnabled(true);
    }
  }

  sendButton.addEventListener('click', handleSend);

  userInput.addEventListener('keydown', function (e) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  });

  window.addEventListener('load', function () {
    setTimeout(function () {
      addMessage("Hi! I'm Ujjwal's AI assistant. Ask me about his projects, skills, experience, or anything else!", false);
    }, 1000);
  });
})();
