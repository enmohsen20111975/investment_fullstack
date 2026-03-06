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

// Serve static frontend files
const FRONTEND_DIR = path.join(__dirname, 'frontend');
app.use('/static', express.static(FRONTEND_DIR));
app.use('/js', express.static(path.join(FRONTEND_DIR, 'js')));
app.use('/css', express.static(path.join(FRONTEND_DIR, 'css')));
app.use('/images', express.static(path.join(FRONTEND_DIR, 'images')));

// Root endpoint - serve frontend
app.get('/', (req, res) => {
    const indexPath = path.join(FRONTEND_DIR, 'index.html');
    if (require('fs').existsSync(indexPath)) {
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