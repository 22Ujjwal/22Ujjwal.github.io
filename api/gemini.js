// Simple in-memory rate limiting
const RATE_LIMIT_WINDOW = 60 * 1000; // 1 minute
const MAX_REQUESTS_PER_WINDOW = 10;
const ipRequests = new Map();

export default async function handler(req, res) {
    // Basic rate limiting by IP
    const clientIp = req.headers['x-forwarded-for'] || req.socket.remoteAddress;
    
    if (!ipRequests.has(clientIp)) {
        ipRequests.set(clientIp, {
            count: 0,
            resetTime: Date.now() + RATE_LIMIT_WINDOW
        });
    }
    
    const clientData = ipRequests.get(clientIp);
    
    // Reset counter if time window expired
    if (Date.now() > clientData.resetTime) {
        clientData.count = 0;
        clientData.resetTime = Date.now() + RATE_LIMIT_WINDOW;
    }
    
    // Check if rate limit exceeded
    if (clientData.count >= MAX_REQUESTS_PER_WINDOW) {
        return res.status(429).json({
            error: 'Rate limit exceeded',
            message: 'Please try again later'
        });
    }
    
    // Increment request counter
    clientData.count++;

    // Check if method is valid
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    // Check if API key is set
    if (!process.env.GEMINI_API_KEY) {
        console.error('GEMINI_API_KEY is not set in environment variables');
        return res.status(500).json({ 
            error: 'Server configuration error', 
            message: 'API key not configured'
        });
    }

    try {
        if (!req.body || !req.body.contents) {
            return res.status(400).json({
                error: 'Invalid request',
                message: 'Missing required fields'
            });
        }
        
        // Make a direct fetch to the Gemini API
        const response = await fetch(
            `https://generativelanguage.googleapis.com/v1/models/gemini-1.5-flash:generateContent?key=${process.env.GEMINI_API_KEY}`,
            {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(req.body)
            }
        );

        // Check if the Gemini API request was successful
        if (!response.ok) {
            const errorData = await response.json();
            console.error('Gemini API error:', errorData);
            return res.status(response.status).json({ 
                error: 'Error from Gemini API', 
                details: errorData 
            });
        }

        const data = await response.json();
        
        // Check if we have a valid response with candidates
        if (!data.candidates || data.candidates.length === 0) {
            return res.status(200).json({
                candidates: [{
                    content: {
                        parts: [{
                            text: "I'm sorry, but I couldn't generate a response. Please try again with a different question."
                        }]
                    }
                }]
            });
        }
        
        res.status(200).json(data);
    } catch (error) {
        console.error('Error:', error);
        res.status(500).json({ 
            error: 'Internal server error',
            message: error.message 
        });
    }
} 