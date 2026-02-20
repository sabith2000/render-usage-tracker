import dotenv from 'dotenv';
import express from 'express';
import cors from 'cors';
import mongoose from 'mongoose';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import entriesRouter from './routes/entries.js';
import { logger } from './utils/logger.js';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 5000;
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/render-usage-monitor';
const isProduction = process.env.NODE_ENV === 'production';

// Middleware
app.use(express.json());

// CORS — only needed in development (separate Vite dev server)
if (!isProduction) {
    app.use(cors());
    logger.info('CORS enabled (development mode)');
}

// Request logging middleware
app.use((req, res, next) => {
    logger.info(`${req.method} ${req.url}`);
    next();
});

// API routes
app.use('/api/entries', entriesRouter);

// Serve static frontend
const clientDistPath = path.resolve(__dirname, '..', 'client', 'dist');
const distExists = fs.existsSync(clientDistPath);
logger.system(`📂 Static files path: ${clientDistPath}`);
logger.system(`   Directory exists: ${distExists}`);

if (distExists) {
    app.use(express.static(clientDistPath));

    // SPA fallback — serve index.html for any non-API route
    app.get('*', (req, res) => {
        if (!req.url.includes('.')) {
            logger.info(`[Frontend] Serving SPA for route: ${req.url}`);
        }
        res.sendFile(path.join(clientDistPath, 'index.html'));
    });
} else {
    logger.warn('⚠️ client/dist not found — frontend will not be served.');
    logger.warn('   Run "npm run build" in the client directory first.');
    app.get('*', (req, res) => {
        if (!req.url.startsWith('/api')) {
            res.status(503).json({
                message: 'Frontend not built. The client/dist directory was not found.',
                hint: 'Ensure the build command runs before the start command.',
            });
        }
    });
}

// Connect to MongoDB and start server
async function startServer() {
    logger.system('⏳ Connecting to MongoDB...');
    const maskedURI = MONGODB_URI.replace(/:([^:@]{1,})@/, ':****@');
    logger.info(`   URI: ${maskedURI}`);

    try {
        await mongoose.connect(MONGODB_URI);
        logger.system('✅ Connected to MongoDB successfully!');

        app.listen(PORT, () => {
            logger.system('---------------------------------------------------------');
            logger.system(`🚀 Server is running!`);
            logger.system(`   URL: http://localhost:${PORT}`);
            logger.system(`   Environment: ${isProduction ? 'production' : 'development'}`);
            logger.system('---------------------------------------------------------');
        });
    } catch (error) {
        logger.error('❌ Failed to connect to MongoDB.');
        logger.error(`   Error: ${error.message}`);
        logger.error('   Check your .env file and MongoDB Atlas network access settings.');
        process.exit(1);
    }
}

startServer();
