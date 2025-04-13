// Gemini AI Chat Configuration
const GEMINI_API_KEY = 'YOUR_GEMINI_API_KEY'; // Replace with your actual API key

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
function addMessage(content, isUser = false, isEmoji = false) {
    const messageDiv = document.createElement('div');
    messageDiv.className = `message ${isUser ? 'user' : 'assistant'}`;
    
    const messageContent = document.createElement('div');
    messageContent.className = 'message-content';
    
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

// Handle user input
async function handleUserInput() {
    const message = userInput.value.trim();
    if (!message) return;
    
    // Add user message to chat
    addMessage(message, true);
    userInput.value = '';
    
    try {
        // Call our secure endpoint
        const response = await fetch('/api/gemini', {
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
        
        const data = await response.json();
        const aiResponse = data.candidates[0].content.parts[0].text;
        
        // Add AI response to chat
        addMessage(aiResponse);
    } catch (error) {
        console.error('Error:', error);
        addMessage("I apologize, but I'm having trouble connecting right now. Please try again later.");
    }
}

// Event listeners
sendButton.addEventListener('click', handleUserInput);
userInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
        handleUserInput();
    }
});

// Focus input on load
window.addEventListener('load', () => {
    userInput.focus();
}); 