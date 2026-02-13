import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Ensure logs directory exists
const logDir = path.join(__dirname, '..', '..', 'logs');
if (!fs.existsSync(logDir)) {
    fs.mkdirSync(logDir, { recursive: true });
}

const logFile = path.join(logDir, 'server.log');

function formatMessage(level, args) {
    const timestamp = new Date().toISOString();
    const message = args.map(arg =>
        typeof arg === 'object' ? JSON.stringify(arg) : String(arg)
    ).join(' ');
    return `[${timestamp}] [${level}] ${message}\n`;
}

function writeToFile(text) {
    fs.appendFile(logFile, text, (err) => {
        if (err) process.stderr.write(`Failed to write to log file: ${err.message}\n`);
    });
}

function logToConsole(fn, args) {
    fn.apply(console, args);
}

/**
 * Custom logger to separate console output from file logs.
 * - info/warn: File only (to reduce clutter)
 * - system: File + Console (for DB/Port status)
 * - error: File + Console (for critical errors)
 */
export const logger = {
    // Detailed logs -> File only
    info: (...args) => {
        writeToFile(formatMessage('INFO', args));
    },

    // Warnings -> File only
    warn: (...args) => {
        writeToFile(formatMessage('WARN', args));
    },

    // Critical systems (DB/Port) -> Console + File
    system: (...args) => {
        writeToFile(formatMessage('SYSTEM', args));
        logToConsole(console.log, args);
    },

    // Errors -> Console + File
    error: (...args) => {
        writeToFile(formatMessage('ERROR', args));
        logToConsole(console.error, args);
    }
};
