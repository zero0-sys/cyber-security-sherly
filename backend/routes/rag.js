import express from 'express';

const router = express.Router();

// External RAG API endpoint (from ai_sherly_llmindex_rag)
const RAG_API_URL = process.env.RAG_API_URL || 'http://localhost:8000';

// Chat dengan AI RAG System
router.post('/chat', async (req, res) => {
    try {
        const { query } = req.body;

        if (!query) {
            return res.status(400).json({ error: 'Query is required' });
        }

        // Call RAG API server
        const response = await fetch(`${RAG_API_URL}/chat`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ query })
        });

        if (!response.ok) {
            throw new Error(`RAG API Error: ${response.statusText}`);
        }

        const data = await response.json();

        res.json({
            success: true,
            answer: data.answer,
            source: data.source || 'LlamaIndex RAG',
            timestamp: new Date().toISOString()
        });

    } catch (error) {
        console.error('RAG Error:', error);
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

// Health check
router.get('/status', async (req, res) => {
    try {
        const response = await fetch(`${RAG_API_URL}/`);
        const data = await response.json();
        res.json({
            status: 'online',
            rag_service: data.status || 'unknown',
            api_url: RAG_API_URL
        });
    } catch (error) {
        res.json({
            status: 'offline',
            rag_service: 'disconnected',
            error: error.message
        });
    }
});

export default router;
