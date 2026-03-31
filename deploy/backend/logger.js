/**
 * Logger module for EGX Investment API
 * Handles logging configuration and initialization.
 */

const winston = require('winston');
const { settings } = require('./config');
const fs = require('fs');
const path = require('path');

// Ensure log directory exists
const logDir = path.dirname(settings.LOG_FILE);
if (!fs.existsSync(logDir)) {
    fs.mkdirSync(logDir, { recursive: true });
}

// Create logger
const logger = winston.createLogger({
    level: settings.LOG_LEVEL.toLowerCase(),
    format: winston.format.combine(
        winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
        winston.format.errors({ stack: true }),
        winston.format.splat(),
        winston.format.json()
    ),
    defaultMeta: { service: 'egx-investment-api' },
    transports: [
        // Write to all logs with level `info` and below to `app.log`
        new winston.transports.File({ filename: settings.LOG_FILE, level: 'info' }),
        // Write all logs error (and below) to `error.log`
        new winston.transports.File({ filename: 'logs/error.log', level: 'error' })
    ]
});

// Always log to console
logger.add(new winston.transports.Console({
    format: winston.format.combine(
        winston.format.colorize(),
        winston.format.simple()
    )
}));

module.exports = logger;