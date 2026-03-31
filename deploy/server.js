/**
 * EGX Investment API - Main Application
 * A fullstack backend for Egyptian Stock Exchange investment data with Shariah compliance.
 */

const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const path = require('path');

const { settings } = require('./backend/config');
const logger = require('./backend/logger');
const { initDb, sequelize } = require('./backend/database');
const { latencyMonitoring, errorHandler, notFoundHandler } = require('./backend/middleware/monitoring');

// Import routes
const authRoutes = require('./backend/routes/auth');
const stocksRoutes = require('./backend/routes/stocks');
const marketRoutes = require('./backend/routes/market');
const portfolioRoutes = require('./backend/routes/portfolio');
const userRoutes = require('./backend/routes/user');
const paymentRoutes = require('./backend/routes/payment');

// Create Express app
const app = express();

// Trust proxy
app.set('trust proxy', 1);

// Security middleware
app.use(helmet({
    contentSecurityPolicy: false,
    crossOriginEmbedderPolicy: false
}));

// CORS middleware
app.use(cors({
    origin: settings.CORS_ORIGINS,
    credentials: settings.CORS_ALLOW_CREDENTIALS,
    methods: settings.CORS_ALLOW_METHODS,
    allowedHeaders: settings.CORS_ALLOW_HEADERS
}));

// Body parsing
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Request logging
if (settings.DEBUG) {
    app.use(morgan('dev'));
}

// Latency monitoring
app.use(latencyMonitoring);

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/stocks', stocksRoutes);
app.use('/api/market', marketRoutes);
app.use('/api/portfolio', portfolioRoutes);
app.use('/api/user', userRoutes);
app.use('/api/payment', paymentRoutes);

// Health check endpoint
app.get('/health', async (req, res) => {
    try {
        await sequelize.authenticate();
        res.json({
            status: 'healthy',
            version: settings.APP_VERSION,
            timestamp: new Date().toISOString(),
            database: 'connected'
        });
    } catch (error) {
        res.status(503).json({
            status: 'unhealthy',
            version: settings.APP_VERSION,
            timestamp: new Date().toISOString(),
            database: 'disconnected',
            error: error.message
        });
    }
});

// API info endpoint
app.get('/api', (req, res) => {
    res.json({
        name: settings.APP_NAME,
        version: settings.APP_VERSION,
        endpoints: {
            stocks: '/api/stocks',
            portfolio: '/api/portfolio',
            market: '/api/market',
            auth: '/api/auth',
            user: '/api/user',
            health: '/health'
        }
    });
});

// Serve static frontend files with proper MIME types and UTF-8 charset
const FRONTEND_DIR = path.join(__dirname, 'frontend');

const getMimeType = (filePath) => {
    const ext = path.extname(filePath).toLowerCase();
    const mimeTypes = {
        '.js': 'application/javascript',
        '.css': 'text/css',
        '.html': 'text/html',
        '.json': 'application/json',
        '.svg': 'image/svg+xml',
        '.png': 'image/png',
        '.jpg': 'image/jpeg',
        '.gif': 'image/gif',
        '.ico': 'image/x-icon'
    };
    return mimeTypes[ext] || 'application/octet-stream';
};

const staticOptions = {
    etag: true,
    lastModified: true,
    setHeaders: (res, filePath) => {
        const ext = path.extname(filePath).toLowerCase();
        const mimeType = getMimeType(filePath);
        
        // Add charset=utf-8 for text-based files
        if (['.js', '.html', '.css', '.json', '.xml', '.txt', '.svg'].includes(ext)) {
            res.setHeader('Content-Type', mimeType + '; charset=utf-8');
        } else {
            res.setHeader('Content-Type', mimeType);
        }
        
        // Prevent aggressive caching for JS modules
        if (ext === '.js') {
            res.setHeader('Cache-Control', 'no-cache, must-revalidate, max-age=0');
        }
    }
};

app.use('/static', express.static(FRONTEND_DIR, staticOptions));
app.use('/js', express.static(path.join(FRONTEND_DIR, 'js'), staticOptions));
app.use('/css', express.static(path.join(FRONTEND_DIR, 'css'), staticOptions));
app.use('/images', express.static(path.join(FRONTEND_DIR, 'images')));

// Root endpoint - serve frontend
app.get('/', (req, res) => {
    const indexPath = path.join(FRONTEND_DIR, 'index.html');
    if (require('fs').existsSync(indexPath)) {
        res.setHeader('Content-Type', 'text/html; charset=utf-8');
        return res.sendFile(indexPath);
    }
    res.json({
        name: settings.APP_NAME,
        version: settings.APP_VERSION,
        docs: '/api',
        health: '/health'
    });
});

// SPA fallback - serve frontend for non-API routes
app.get('*', (req, res, next) => {
    // Skip API routes and static files
    if (req.path.startsWith('/api/') ||
        req.path.startsWith('/js/') ||
        req.path.startsWith('/css/') ||
        req.path.startsWith('/images/') ||
        req.path.startsWith('/static/') ||
        req.path === '/health') {
        return next();
    }

    const indexPath = path.join(FRONTEND_DIR, 'index.html');
    if (require('fs').existsSync(indexPath)) {
        return res.sendFile(indexPath);
    }

    next();
});

// Error handlers
app.use(notFoundHandler);
app.use(errorHandler);

// Start server
const PORT = process.env.PORT || 8100;

const startServer = async () => {
    try {
        console.log('Starting EGX Investment API...');
        console.log('Initializing database connection...');

        // Initialize database
        await initDb();
        console.log('Database connection established');

        // Start listening
        app.listen(PORT, '0.0.0.0', () => {
            console.log(`\n========================================`);
            console.log(`EGX Investment API is RUNNING!`);
            console.log(`========================================`);
            console.log(`Server: http://127.0.0.1:${PORT}`);
            console.log(`API: http://127.0.0.1:${PORT}/api`);
            console.log(`Health: http://127.0.0.1:${PORT}/health`);
            console.log(`========================================\n`);
        });
    } catch (error) {
        console.error('Failed to start server:', error);
        process.exit(1);
    }
};

// Handle graceful shutdown
process.on('SIGTERM', async () => {
    logger.info('SIGTERM received, shutting down gracefully...');
    await sequelize.close();
    process.exit(0);
});

process.on('SIGINT', async () => {
    logger.info('SIGINT received, shutting down gracefully...');
    await sequelize.close();
    process.exit(0);
});

// Start the server
startServer();

module.exports = app;