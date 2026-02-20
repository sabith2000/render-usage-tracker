import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const isProduction = process.env.NODE_ENV === 'production';

// File logging setup (development only)
let logFile = null;
if (!isProduction) {
    const logDir = path.join(__dirname, '..', '..', 'logs');
    if (!fs.existsSync(logDir)) {
        fs.mkdirSync(logDir, { recursive: true });
    }
    logFile = path.join(logDir, 'server.log');
}

function timestamp() {
    return new Date().toISOString();
}

function formatMessage(level, args) {
    const message = args
        .map((arg) => (typeof arg === 'object' ? JSON.stringify(arg) : String(arg)))
        .join(' ');
    return `[${timestamp()}] [${level.padEnd(6)}] ${message}\n`;
}

function writeToFile(text) {
    if (!logFile) return;
    fs.appendFile(logFile, text, (err) => {
        if (err) process.stderr.write(`Log write failed: ${err.message}\n`);
    });
}

/**
 * Logger with environment-aware output:
 * - Development: file + selective console
 * - Production: console only (Render's ephemeral FS loses log files)
 *
 * Levels:
 *   info/warn  → file only (dev) | silent (prod)
 *   system     → file + console (dev) | console (prod)
 *   error      → file + console (dev) | console (prod)
 */
export const logger = {
    // Detailed logs → file only in dev, silent in prod
    info: (...args) => {
        writeToFile(formatMessage('INFO', args));
    },

    // Warnings → file only in dev, silent in prod
    warn: (...args) => {
        writeToFile(formatMessage('WARN', args));
    },

    // System events (DB/startup) → always console + file in dev
    system: (...args) => {
        writeToFile(formatMessage('SYSTEM', args));
        console.log(...args);
    },

    // Errors → always console + file in dev
    error: (...args) => {
        writeToFile(formatMessage('ERROR', args));
        console.error(...args);
    },
};
