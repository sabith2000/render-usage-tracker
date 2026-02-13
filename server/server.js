import dotenv from 'dotenv';
import express from 'express';
import cors from 'cors';
import mongoose from 'mongoose';
import path from 'path';
import { fileURLToPath } from 'url';
import entriesRouter from './routes/entries.js';
import { logger } from './utils/logger.js';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 5000;
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/render-usage-monitor';

// Middleware
app.use(cors());
app.use(express.json());

// Request logging middleware (FILE ONLY to prevent clutter)
app.use((req, res, next) => {
    logger.info(`${req.method} request received at ${req.url}`);
    next();
});

// API routes
app.use('/api/entries', entriesRouter);

// Serve static frontend in production
const clientDistPath = path.join(__dirname, '..', 'client', 'dist');
app.use(express.static(clientDistPath));

app.get('*', (req, res) => {
    logger.info(`[Frontend] Serving index.html for route: ${req.url}`);
    res.sendFile(path.join(clientDistPath, 'index.html'));
});

// Connect to MongoDB and start server
async function startServer() {
    logger.system('⏳ Connecting to MongoDB...');
    // Mask password for logs
    const maskedURI = MONGODB_URI.replace(/:([^:@]{1,})@/, ':****@');
    logger.info(`   URI: ${maskedURI}`); // Log full URI to file only for debug

    try {
        await mongoose.connect(MONGODB_URI);
        logger.system('✅ Connected to MongoDB successfully!');
        logger.system('   Database is ready to accept connections.');

        app.listen(PORT, () => {
            logger.system('---------------------------------------------------------');
            logger.system(`🚀 Server is running!`);
            logger.system(`   URL: http://localhost:${PORT}`);
            logger.system(`   Environment: ${process.env.NODE_ENV || 'development'}`);
            logger.system('---------------------------------------------------------');
        });
    } catch (error) {
        logger.error('❌ Failed to connect to MongoDB.');
        logger.error(`   Error Name: ${error.name}`);
        logger.error(`   Error Message: ${error.message}`);
        logger.error('   Please check your .env file and MongoDB Atlas network access settings.');
        process.exit(1);
    }
}

startServer();
