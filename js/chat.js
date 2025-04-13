// Gemini AI Chat Configuration
// No API key here - it's handled securely by the server

// Chat messages container
const chatMessages = document.getElementById('chat-messages');
const userInput = document.getElementById('user-input');
const sendButton = document.getElementById('send-button');

// System prompt for Gemini
const SYSTEM_PROMPT = `You are Ujjwal's AI assistant. Your role is to:
1. Focus on Ujjwal's professional background, projects, and education
2. Politely decline to answer adult or political questions
3. Keep responses professional and welcoming, polite and natural
4. Help recruiters and STEM students learn about Ujjwal excellence
5. Take messages for Ujjwal if someone wants to leave one
6. Use a friendly and professional tone
7. Redirect off-topic questions back to Ujjwal's professional background`;

// Add message to chat
function addMessage(content, isUser = false, isEmoji = false, isError = false) {
    const messageDiv = document.createElement('div');
    messageDiv.className = `message ${isUser ? 'user' : 'assistant'}`;
    
    const messageContent = document.createElement('div');
    messageContent.className = 'message-content';
    
    if (isError) {
        messageContent.style.color = '#ff4c4c';
    }
    
    if (isEmoji) {
        const emoji = document.createElement('img');
        emoji.src = 'images/Hi_sticker.png';
        emoji.alt = 'Hi';
        emoji.className = 'message-emoji';
        messageContent.appendChild(emoji);
    } else {
        const text = document.createElement('p');
        text.textContent = content;
        messageContent.appendChild(text);
    }
    
    messageDiv.appendChild(messageContent);
    chatMessages.appendChild(messageDiv);
    chatMessages.scrollTop = chatMessages.scrollHeight;
}

// Add typing indicator
function addTypingIndicator() {
    const typingDiv = document.createElement('div');
    typingDiv.className = 'message assistant typing-indicator';
    typingDiv.id = 'typing-indicator';
    
    const typingContent = document.createElement('div');
    typingContent.className = 'message-content';
    
    const dots = document.createElement('div');
    dots.className = 'typing-dots';
    dots.innerHTML = '<span></span><span></span><span></span>';
    
    typingContent.appendChild(dots);
    typingDiv.appendChild(typingContent);
    chatMessages.appendChild(typingDiv);
    chatMessages.scrollTop = chatMessages.scrollHeight;
}

// Remove typing indicator
function removeTypingIndicator() {
    const typingIndicator = document.getElementById('typing-indicator');
    if (typingIndicator) {
        typingIndicator.remove();
    }
}

// Handle user input
async function handleUserInput() {
    const message = userInput.value.trim();
    if (!message) return;
    
    // Add user message to chat
    addMessage(message, true);
    userInput.value = '';
    
    // Disable input while processing
    userInput.disabled = true;
    sendButton.disabled = true;
    
    // Show typing indicator
    addTypingIndicator();
    
    try {
        // Get the current URL to determine if we're using localhost or production
        const isLocalhost = window.location.hostname === 'localhost' || 
                            window.location.hostname === '127.0.0.1';
        
        // Use the appropriate API endpoint based on environment
        const apiUrl = isLocalhost 
            ? 'http://localhost:3000/api/gemini'  // Local development server
            : '/api/gemini';                     // Production/Vercel
        
        // Call our secure endpoint
        const response = await fetch(apiUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                contents: [{
                    parts: [{
                        text: `${SYSTEM_PROMPT}\n\nUser: ${message}`
                    }]
                }]
            })
        });
        
        // Remove typing indicator
        removeTypingIndicator();
        
        if (!response.ok) {
            let errorMessage = "I apologize, but I'm having trouble connecting right now. Please try again later.";
            try {
                const errorData = await response.json();
                console.error('API error:', errorData);
                
                if (errorData.error === 'Error from Gemini API') {
                    errorMessage = "I apologize, but there was an issue with the AI service. Please try again later.";
                } else if (errorData.error === 'Rate limit exceeded') {
                    errorMessage = "I'm receiving too many messages right now. Please try again in a minute.";
                }
            } catch (e) {
                console.error('Error parsing error response:', e);
            }
            
            addMessage(errorMessage, false, false, true);
            return;
        }
        
        const data = await response.json();
        
        if (!data.candidates || data.candidates.length === 0 || !data.candidates[0].content || !data.candidates[0].content.parts) {
            addMessage("I apologize, but I couldn't generate a response. Please try again with a different question.", false, false, true);
            return;
        }
        
        const aiResponse = data.candidates[0].content.parts[0].text;
        
        // Add AI response to chat
        addMessage(aiResponse);
    } catch (error) {
        console.error('Error:', error);
        // Remove typing indicator if it exists
        removeTypingIndicator();
        addMessage("I apologize, but I'm having trouble connecting right now. Please try again later.", false, false, true);
    } finally {
        // Re-enable input
        userInput.disabled = false;
        sendButton.disabled = false;
        userInput.focus();
    }
}

// Event listeners
sendButton.addEventListener('click', handleUserInput);
userInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        handleUserInput();
    }
});

// Focus input on load
window.addEventListener('load', () => {
    userInput.focus();
}); 