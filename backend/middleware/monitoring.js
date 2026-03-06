/**
 * Latency Monitoring Middleware
 * Tracks request latency and logs slow requests.
 */

const logger = require('../logger');

/**
 * Middleware to track request latency
 */
const latencyMonitoring = (req, res, next) => {
    const startTime = Date.now();

    // Set latency header before headers are flushed
    const originalWriteHead = res.writeHead;
    res.writeHead = function (...args) {
        if (!res.headersSent) {
            const latency = Date.now() - startTime;
            res.setHeader('X-Response-Time', `${latency}ms`);
        }
        return originalWriteHead.apply(this, args);
    };

    // Log after response is fully sent
    res.on('finish', () => {
        const latency = Date.now() - startTime;

        if (latency > 1000) {
            logger.warn(`Slow request: ${req.method} ${req.originalUrl} took ${latency}ms`);
        }

        logger.debug(`${req.method} ${req.originalUrl} - ${res.statusCode} - ${latency}ms`);
    });

    next();
};

/**
 * Error handling middleware
 */
const errorHandler = (err, req, res, next) => {
    logger.error('Unhandled error:', err);

    const statusCode = err.statusCode || 500;
    const message = err.message || 'Internal server error';

    res.status(statusCode).json({
        detail: message,
        error: err.code || 'internal_error',
        ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
    });
};

/**
 * Not found middleware
 */
const notFoundHandler = (req, res) => {
    res.status(404).json({
        detail: 'Not found',
        error: 'not_found'
    });
};

module.exports = {
    latencyMonitoring,
    errorHandler,
    notFoundHandler
};