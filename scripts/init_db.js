/**
 * Database Initialization Script
 * Creates tables and seeds initial data with complete financial metrics.
 */

require('dotenv').config();
const path = require('path');

// Set database path for SQLite
process.env.DATABASE_URL = process.env.DATABASE_URL || 'sqlite://./egx_investment.db';

const { sequelize } = require('../backend/database');
const { Stock, StockPriceHistory, MarketIndex, User, APIKey } = require('../backend/models');
const { HALAL_STOCKS, HARAM_STOCKS } = require('../backend/config');
const { hashApiKey, generateApiKey } = require('../backend/middleware/auth');
const logger = require('../backend/logger');
const { COMPREHENSIVE_EGX_STOCKS } = require('./egx_stock_data');

/**
 * Generate realistic price history for a stock
 * @param {number} basePrice - Starting price
 * @param {number} days - Number of days of history
 * @returns {Array} Array of price history objects
 */
function generatePriceHistory(basePrice, days = 60) {
    const history = [];
    let currentPrice = basePrice;
    const now = new Date();

    for (let i = days - 1; i >= 0; i--) {
        const date = new Date(now);
        date.setDate(date.getDate() - i);
        
        // Random walk for realistic price movement
        const change = (Math.random() - 0.5) * basePrice * 0.05;
        currentPrice = Math.max(basePrice * 0.5, currentPrice + change);

        history.push({
            date: date.toISOString().split('T')[0],
            open: currentPrice * (1 + (Math.random() - 0.5) * 0.02),
            high: currentPrice * (1 + Math.random() * 0.03),
            low: currentPrice * (1 - Math.random() * 0.03),
            close: currentPrice,
            volume: Math.floor(Math.random() * 2000000 + 500000)
        });
    }

    return history;
}

/**
 * Calculate simple moving averages and RSI
 * @param {Array} prices - Array of close prices
 * @returns {Object} Technical indicators
 */
function calculateTechnicalIndicators(prices) {
    const ma50 = prices.slice(-50).reduce((a, b) => a + b) / 50;
    const ma200 = prices.slice(-200).reduce((a, b) => a + b) / Math.min(prices.length, 200);
    
    // Calculate RSI
    const changes = prices.slice(-14);
    const gains = changes.filter(c => c > 0).reduce((a, b) => a + b, 0) / 14;
    const losses = Math.abs(changes.filter(c => c < 0).reduce((a, b) => a + b, 0) / 14);
    const rsi = 100 - (100 / (1 + (gains / (losses || 1))));

    return {
        ma_50: ma50,
        ma_200: ma200,
        rsi: isNaN(rsi) ? 50 : Math.min(100, Math.max(0, rsi))
    };
}

// Map comprehensive stocks to include EGX index membership
const SAMPLE_STOCKS = COMPREHENSIVE_EGX_STOCKS.map(stock => ({
    ticker: stock.ticker,
    name: stock.name,
    name_ar: stock.name_ar,
    sector: stock.sector,
    is_halal: stock.is_halal,
    compliance_status: stock.compliance_status,
    egx30_member: stock.egx30 || false,
    egx70_member: stock.egx70 || false,
    egx100_member: stock.egx100 || false
}));

// Sample market indices
const SAMPLE_INDICES = [
    { symbol: 'EGX30', name: 'EGX 30 Index', is_shariah: false },
    { symbol: 'EGX50', name: 'EGX 50 Index', is_shariah: false },
    { symbol: 'EGX70', name: 'EGX 70 Index', is_shariah: false },
    { symbol: 'EGX100', name: 'EGX 100 Index', is_shariah: false },
    { symbol: 'EGX33', name: 'EGX 33 Shariah Index', is_shariah: true }
];

async function initDatabase() {
    try {
        logger.info('Starting database initialization...');

        // Sync database (create tables)
        await sequelize.sync({ force: true });
        logger.info('Database tables created');

        // Seed stocks with complete financial data
        logger.info('Seeding stocks with complete financial metrics...');
        
        for (const stockData of SAMPLE_STOCKS) {
            try {
                const basePrice = Math.random() * 100 + 15;
                const priceHistory = generatePriceHistory(basePrice, 100);
                const closePrices = priceHistory.map(p => p.close);
                const indicators = calculateTechnicalIndicators(closePrices);

                const currentPrice = priceHistory[priceHistory.length - 1].close;
                const previousClose = priceHistory[priceHistory.length - 2]?.close || currentPrice;

                // Create stock with complete financial data
                const stock = await Stock.create({
                    ...stockData,
                    // Price data
                    current_price: currentPrice,
                    previous_close: previousClose,
                    open_price: priceHistory[priceHistory.length - 1].open,
                    high_price: priceHistory[priceHistory.length - 1].high,
                    low_price: priceHistory[priceHistory.length - 1].low,
                    
                    // Volume and market cap
                    volume: priceHistory[priceHistory.length - 1].volume,
                    market_cap: basePrice * (50000000 + Math.random() * 9950000000),
                    
                    // Financial metrics
                    pe_ratio: parseFloat((10 + Math.random() * 20).toFixed(2)),
                    pb_ratio: parseFloat((0.8 + Math.random() * 2).toFixed(2)),
                    dividend_yield: parseFloat((Math.random() * 7).toFixed(2)),
                    eps: parseFloat((basePrice / (12 + Math.random() * 8)).toFixed(2)),
                    roe: parseFloat((5 + Math.random() * 20).toFixed(2)),
                    debt_to_equity: parseFloat((Math.random() * 1.5).toFixed(2)),
                    
                    // Technical levels and indicators
                    support_level: parseFloat(Math.min(...priceHistory.slice(-30).map(p => p.low)).toFixed(2)),
                    resistance_level: parseFloat(Math.max(...priceHistory.slice(-30).map(p => p.high)).toFixed(2)),
                    ma_50: parseFloat(indicators.ma_50.toFixed(2)),
                    ma_200: parseFloat(indicators.ma_200.toFixed(2)),
                    rsi: parseFloat(indicators.rsi.toFixed(2)),
                    
                    is_active: true,
                    is_egx: true
                });

                const historyRecords = priceHistory.map((point) => ({
                    stock_id: stock.id,
                    date: point.date,
                    open_price: parseFloat(point.open.toFixed(2)),
                    high_price: parseFloat(point.high.toFixed(2)),
                    low_price: parseFloat(point.low.toFixed(2)),
                    close_price: parseFloat(point.close.toFixed(2)),
                    volume: point.volume,
                    adjusted_close: parseFloat(point.close.toFixed(2))
                }));

                await StockPriceHistory.bulkCreate(historyRecords);

                logger.info(`Created stock: ${stockData.ticker}`);
            } catch (err) {
                logger.error(`Error creating stock ${stockData.ticker}:`, err.message);
            }
        }
        
        logger.info(`Seeded ${SAMPLE_STOCKS.length} stocks with complete financial metrics`);

        // Seed market indices
        logger.info('Seeding market indices...');
        for (const indexData of SAMPLE_INDICES) {
            await MarketIndex.create({
                ...indexData,
                current_value: Math.random() * 10000 + 5000,
                previous_close: Math.random() * 10000 + 5000,
                change: (Math.random() - 0.5) * 500,
                change_percent: (Math.random() - 0.5) * 5
            });
        }
        logger.info(`Seeded ${SAMPLE_INDICES.length} market indices`);

        // Create default admin user
        logger.info('Creating default admin user...');
        const adminUser = await User.create({
            email: 'admin@egx-investment.com',
            username: 'admin',
            hashed_password: '$2a$10$YourHashedPasswordHere',
            is_active: true,
            is_superuser: true,
            halal_only_preference: false,
            default_risk_tolerance: 'medium'
        });

        // Create API key for admin
        const rawKey = generateApiKey();
        await APIKey.create({
            user_id: adminUser.id,
            key_hash: hashApiKey(rawKey),
            name: 'Admin API Key'
        });

        logger.info('Default admin user created');
        logger.info(`Admin API Key: ${rawKey}`);
        logger.info('IMPORTANT: Save this API key securely!');

        logger.info('Database initialization completed successfully!');

        // Close connection
        await sequelize.close();

        process.exit(0);
    } catch (error) {
        logger.error('Database initialization failed:', error.message);
        console.error(error);
        process.exit(1);
    }
}

// Run initialization
initDatabase();