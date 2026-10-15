const express = require('express');
const app = express();
const PORT = 3000;

// Middleware: Add staging headers & track response time
app.use((req, res, next) => {
    const startTime = Date.now();
    res.setHeader('X-Environment', 'staging');
    res.on('finish', () => {
        const duration = Date.now() - startTime;
        console.log(`[STAGING] ${req.method} ${req.url} completed in ${duration}ms`);
    });
    next();
});

// Health check endpoint for staging
app.get('/api/health', (req, res) => {
    res.json({
        status: 'UP',
        environment: 'staging',
        branch: 'staging',
        uptime: process.uptime(),
        timestamp: new Date().toISOString()
    });
});

app.get('/api/combine-data', async (req, res) => {
    try {
        // 1. Define the 3 APIs you want to call
        const api1 = 'https://jsonplaceholder.typicode.com/users/1';
        const api2 = 'https://jsonplaceholder.typicode.com/posts/1';
        const api3 = 'https://jsonplaceholder.typicode.com/todos/1';

        // 2. Fetch data from all 3 APIs concurrently
        const [response1, response2, response3] = await Promise.all([
            fetch(api1),
            fetch(api2),
            fetch(api3)
        ]);

        // 3. Parse the JSON responses
        const data1 = await response1.json();
        const data2 = await response2.json();
        const data3 = await response3.json();

        // 4. Send the combined result back to the client
        res.json({
            environment: 'staging',
            branch: 'staging',
            user: data1,
            post: data2,
            todo: data3
        });
    } catch (error) {
        console.error("Error fetching APIs:", error);
        res.status(500).json({ error: 'Failed to fetch data' });
    }
});

app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});