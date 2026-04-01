/**
 * Stock Routes
 * Handles stock data retrieval, search, listing, history, and AI recommendations.
 */

const express = require('express');
const router = express.Router();
const { Op } = require('sequelize');
const logger = require('../logger');
const { Stock, StockPriceHistory, StockDeepInsightSnapshot } = require('../models');
const { authenticateApiKey, optionalAuth } = require('../middleware/auth');
const { normalizeHistory, calculateHistorySummary, buildDeepAnalysisPayload } = require('../services/deepAnalysisService');

/**
 * Build stock response object
 */
const buildStockResponse = (stock) => {
    if (!stock) return null;

    const stockJson = stock.toJSON ? stock.toJSON() : stock;

    return {
        ...stockJson,
        price_change: stock.getPriceChange ? stock.getPriceChange() : null
    };
};

/**
 * @route GET /api/stocks
 * @desc Get all stocks with optional filters
 */
router.get('/', optionalAuth, async (req, res) => {
    try {
        const { query, search_field = 'all', sector, index, page = 1, page_size = 50 } = req.query;

        const whereClause = { is_active: true };

        if (query) {
            const q = `%${query}%`;
            switch ((search_field || 'all').toLowerCase()) {
                case 'symbol':
                    whereClause.ticker = { [Op.iLike]: q };
                    break;
                case 'name':
                    whereClause[Op.or] = [
                        { name: { [Op.iLike]: q } },
                        { name_ar: { [Op.iLike]: q } }
                    ];
                    break;
                case 'sector':
                    whereClause.sector = { [Op.iLike]: q };
                    break;
                case 'index': {
                    const idx = query.toLowerCase();
                    if (idx.includes('30')) whereClause.egx30_member = true;
                    else if (idx.includes('70')) whereClause.egx70_member = true;
                    else if (idx.includes('100')) whereClause.egx100_member = true;
                    break;
                }
                default:
                    whereClause[Op.or] = [
                        { ticker: { [Op.iLike]: q } },
                        { name: { [Op.iLike]: q } },
                        { name_ar: { [Op.iLike]: q } },
                        { sector: { [Op.iLike]: q } }
                    ];
            }
        }

        if (sector) {
            whereClause.sector = sector;
        }

        // EGX Index filtering
        if (index) {
            switch (index.toLowerCase()) {
                case 'egx30':
                    whereClause.egx30_member = true;
                    break;
                case 'egx70':
                    whereClause.egx70_member = true;
                    break;
                case 'egx100':
                    whereClause.egx100_member = true;
                    break;
            }
        }

        const offset = (parseInt(page) - 1) * parseInt(page_size);
        const limit = parseInt(page_size);

        const { count, rows: stocks } = await Stock.findAndCountAll({
            where: whereClause,
            offset,
            limit,
            order: [['ticker', 'ASC']]
        });

        res.json({
            stocks: stocks.map(buildStockResponse),
            total: count,
            page: parseInt(page),
            page_size: parseInt(page_size),
            total_pages: Math.ceil(count / parseInt(page_size))
        });
    } catch (error) {
        logger.error('Get stocks error:', error);
        res.status(500).json({ detail: 'Failed to get stocks' });
    }
});

/**
 * @route GET /api/stocks/:ticker
 * @desc Get stock by ticker
 */
router.get('/:ticker', optionalAuth, async (req, res) => {
    try {
        const ticker = req.params.ticker.toUpperCase().replace('.CA', '');

        const stock = await Stock.findOne({
            where: { ticker, is_active: true }
        });

        if (!stock) {
            return res.status(404).json({
                detail: {
                    error: 'stock_not_found',
                    message: `Stock with ticker '${ticker}' not found in EGX database.`
                }
            });
        }

        res.json({ data: buildStockResponse(stock) });
    } catch (error) {
        logger.error('Get stock error:', error);
        res.status(500).json({ detail: 'Failed to get stock' });
    }
});

/**
 * @route GET /api/stocks/:ticker/history
 * @desc Get stock price history
 */
router.get('/:ticker/history', optionalAuth, async (req, res) => {
    try {
        const ticker = req.params.ticker.toUpperCase().replace('.CA', '');
        const { days = 30 } = req.query;

        const stock = await Stock.findOne({
            where: { ticker, is_active: true }
        });

        if (!stock) {
            return res.status(404).json({
                detail: `Stock with ticker '${ticker}' not found`
            });
        }

        const startDate = new Date();
        startDate.setDate(startDate.getDate() - parseInt(days));

        const historyRows = await StockPriceHistory.findAll({
            where: {
                stock_id: stock.id,
                date: { [Op.gte]: startDate }
            },
            order: [['date', 'ASC']]
        });

        const history = normalizeHistory(historyRows);
        const summary = calculateHistorySummary(history);

        res.json({
            success: true,
            ticker,
            data: history,
            summary,
            days: parseInt(days)
        });
    } catch (error) {
        logger.error('Get stock history error:', error);
        res.status(500).json({ detail: 'Failed to get stock history' });
    }
});

/**
 * @route GET /api/stocks/:ticker/recommendation
 * @desc Get AI-powered stock recommendation
 */
router.get('/:ticker/recommendation', optionalAuth, async (req, res) => {
    try {
        const ticker = req.params.ticker.toUpperCase().replace('.CA', '');

        const stock = await Stock.findOne({
            where: { ticker, is_active: true }
        });

        if (!stock) {
            return res.status(404).json({
                detail: `Stock with ticker '${ticker}' not found`
            });
        }

        // Get latest deep insight snapshot if available
        const latestInsight = await StockDeepInsightSnapshot.findOne({
            where: { ticker },
            order: [['fetched_at', 'DESC']]
        });

        const historyRows = await StockPriceHistory.findAll({
            where: { stock_id: stock.id },
            order: [['date', 'ASC']],
            limit: 180
        });

        const history = normalizeHistory(historyRows);
        const analysisPayload = buildDeepAnalysisPayload({
            stock,
            history,
            latestInsight
        });

        res.json(analysisPayload);
    } catch (error) {
        logger.error('Get recommendation error:', error);
        res.status(500).json({ detail: 'Failed to get recommendation' });
    }
});

/**
 * @route GET /api/stocks/search/:query
 * @desc Search stocks
 */
router.get('/search/:query', optionalAuth, async (req, res) => {
    try {
        const query = req.params.query;
        const { sector, min_price, max_price } = req.query;

        const whereClause = {
            is_active: true,
            [Op.or]: [
                { ticker: { [Op.iLike]: `%${query}%` } },
                { name: { [Op.iLike]: `%${query}%` } },
                { name_ar: { [Op.iLike]: `%${query}%` } }
            ]
        };

        if (sector) {
            whereClause.sector = sector;
        }

        if (min_price) {
            whereClause.current_price = { ...whereClause.current_price, [Op.gte]: parseFloat(min_price) };
        }

        if (max_price) {
            whereClause.current_price = { ...whereClause.current_price, [Op.lte]: parseFloat(max_price) };
        }

        const stocks = await Stock.findAll({
            where: whereClause,
            limit: 20,
            order: [['ticker', 'ASC']]
        });

        res.json({
            query,
            results: stocks.map(buildStockResponse),
            total: stocks.length
        });
    } catch (error) {
        logger.error('Search stocks error:', error);
        res.status(500).json({ detail: 'Failed to search stocks' });
    }
});

module.exports = router;