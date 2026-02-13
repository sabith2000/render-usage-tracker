import dotenv from 'dotenv';
import express from 'express';
import cors from 'cors';
import mongoose from 'mongoose';
import path from 'path';
import { fileURLToPath } from 'url';
import entriesRouter from './routes/entries.js';
import { setupLogging } from './utils/logger.js';

dotenv.config();
setupLogging();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 5000;
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/render-usage-monitor';

// Middleware
app.use(cors());
app.use(express.json());

// Request Logger (for user visibility)
app.use((req, res, next) => {
    const timestamp = new Date().toISOString();
    console.log(`[${timestamp}] ${req.method} request received at ${req.url}`);
    next();
});

// API routes
app.use('/api/entries', entriesRouter);

// Serve static frontend in production
const clientDistPath = path.join(__dirname, '..', 'client', 'dist');
app.use(express.static(clientDistPath));

app.get('*', (req, res) => {
    console.log(`[Frontend] Serving index.html for route: ${req.url}`);
    res.sendFile(path.join(clientDistPath, 'index.html'));
});

// Connect to MongoDB and start server
async function startServer() {
    console.log('⏳ Connecting to MongoDB...');
    console.log(`   URI: ${MONGODB_URI.replace(/:([^:@]{1,})@/, ':****@')}`); // Hide password in logs

    try {
        await mongoose.connect(MONGODB_URI);
        console.log('✅ Connected to MongoDB successfully!');
        console.log('   Database is ready to accept connections.');

        app.listen(PORT, () => {
            console.log('---------------------------------------------------------');
            console.log(`🚀 Server is running!`);
            console.log(`   URL: http://localhost:${PORT}`);
            console.log(`   Environment: ${process.env.NODE_ENV || 'development'}`);
            console.log('---------------------------------------------------------');
        });
    } catch (error) {
        console.error('❌ Failed to connect to MongoDB.');
        console.error(`   Error Name: ${error.name}`);
        console.error(`   Error Message: ${error.message}`);
        console.error('   Please check your .env file and MongoDB Atlas network access settings.');
        process.exit(1);
    }
}

startServer();
