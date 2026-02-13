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

/**
 * Intercepts console methods to write to file as well as stdout/stderr.
 */
export function setupLogging() {
    const originalLog = console.log;
    const originalError = console.error;
    const originalWarn = console.warn;

    console.log = (...args) => {
        originalLog.apply(console, args);
        writeToFile(formatMessage('INFO', args));
    };

    console.error = (...args) => {
        originalError.apply(console, args);
        writeToFile(formatMessage('ERROR', args));
    };

    console.warn = (...args) => {
        originalWarn.apply(console, args);
        writeToFile(formatMessage('WARN', args));
    };

    console.log('📝 Logging initialized. Writing to:', logFile);
}
