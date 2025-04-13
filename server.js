const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const path = require('path');

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// Check if API key is set
if (!process.env.GEMINI_API_KEY) {
  console.error('GEMINI_API_KEY is not set in environment variables');
  process.exit(1);
}

// Middleware
app.use(cors());
app.use(express.json());

// Serve static files with proper MIME types for ES modules
app.use(express.static('./', {
  setHeaders: (res, path) => {
    if (path.endsWith('.js')) {
      res.setHeader('Content-Type', 'application/javascript; charset=UTF-8');
    }
  }
}));

// API Endpoint
app.post('/api/gemini', async (req, res) => {
  try {
    if (!req.body || !req.body.contents) {
      return res.status(400).json({
        error: 'Invalid request',
        message: 'Missing required fields'
      });
    }
    
    const userContent = req.body.contents[0]?.parts[0]?.text;
    
    if (!userContent) {
      return res.status(400).json({
        error: 'Invalid request',
        message: 'Missing text content'
      });
    }
    
    // Make a direct fetch to the Gemini API instead of using the SDK
    // which seems to be using the wrong version
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1/models/gemini-1.5-flash:generateContent?key=${process.env.GEMINI_API_KEY}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contents: [{
            parts: [{
              text: userContent
            }]
          }]
        })
      }
    );
    
    if (!response.ok) {
      const errorData = await response.json();
      console.error('Gemini API error:', errorData);
      return res.status(response.status).json({
        error: 'Error from Gemini API',
        details: errorData
      });
    }
    
    const data = await response.json();
    
    return res.status(200).json({
      candidates: [{
        content: {
          parts: [{
            text: data.candidates[0]?.content?.parts[0]?.text || "I'm sorry, I couldn't generate a response."
          }]
        }
      }]
    });
  } catch (error) {
    console.error('Error:', error);
    return res.status(500).json({
      error: 'Internal server error',
      message: error.message
    });
  }
});

// Start server
app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
}); 