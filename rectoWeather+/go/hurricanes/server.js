// server.mjs

import express from 'express';
import fetch from 'node-fetch';

const app = express();
const PORT = 3000;

// Middleware to handle CORS
app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*'); // Allow all origins, or specify a particular origin
    res.header('Access-Control-Allow-Headers', 'Content-Type');
    next();
});

app.get('/proxy', async (req, res) => {
    const targetUrl = req.query.url;

    try {
        const response = await fetch(targetUrl, {
            method: 'GET',
            headers: {
                // Add headers to mimic a browser request
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
                'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
                'Accept-Language': 'en-US,en;q=0.5',
                'Connection': 'keep-alive',
            },
        });

        // Check if the response is ok (status 200)
        if (!response.ok) {
            return res.status(response.status).send('Error fetching the URL');
        }

        const data = await response.text();
        res.send(data);
    } catch (error) {
        console.error("Error fetching the URL:", error);
        res.status(500).send('Error fetching the URL');
    }
});

app.listen(PORT, () => {
    console.log(`Proxy server is running at http://localhost:${PORT}`);
});
