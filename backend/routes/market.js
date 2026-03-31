/**
 * Market Routes
 * Handles market overview, indices, and status endpoints.
 */

const express = require('express');
const router = express.Router();
const { Op } = require('sequelize');
const logger = require('../logger');
const { Stock, MarketIndex, MarketUpdateStatus } = require('../models');
const { authenticateApiKey, optionalAuth } = require('../middleware/auth');
const { getMarketStatus: getScheduleStatus, shouldAllowUpdate, getCairoTime } = require('../services/marketScheduleService');
const { updateStockData, getLastUpdate, getUpdateHistory, checkDataNeedsRefresh } = require('../services/dataUpdateService');

const toNumber = (value, fallback = 0) => {
    const num = Number(value);
    return Number.isFinite(num) ? num : fallback;
};

function mapIndexResponse(indexModel) {
    const idx = indexModel.toJSON ? indexModel.toJSON() : indexModel;
    return {
        symbol: idx.symbol,
        name: idx.name,
        name_ar: idx.name_ar,
        value: toNumber(idx.current_value, 0),
        previous_close: toNumber(idx.previous_close, 0),
        change: toNumber(idx.change, 0),
        change_percent: toNumber(idx.change_percent, 0),
        is_shariah: Boolean(idx.is_shariah),
        last_updated: idx.last_update
    };
}

/**
 * @route GET /api/market/overview
 * @desc Get market overview
 */
router.get('/overview', optionalAuth, async (req, res) => {
    try {
        // Get all active stocks
        const stocks = await Stock.findAll({
            where: { is_active: true, is_egx: true }
        });

        // Get market indices
        const indices = await MarketIndex.findAll({
            order: [['symbol', 'ASC']]
        });

        // Calculate market stats
        const totalStocks = stocks.length;
        const gainers = stocks.filter(s => s.getPriceChange && s.getPriceChange() > 0).length;
        const losers = stocks.filter(s => s.getPriceChange && s.getPriceChange() < 0).length;
        const unchanged = totalStocks - gainers - losers;
        const egx30Count = stocks.filter((s) => s.egx30_member).length;
        const egx70Count = stocks.filter((s) => s.egx70_member).length;
        const egx100Count = stocks.filter((s) => s.egx100_member).length;

        // Get top movers
        const sortedByChange = [...stocks].sort((a, b) => {
            const changeA = a.getPriceChange ? a.getPriceChange() : 0;
            const changeB = b.getPriceChange ? b.getPriceChange() : 0;
            return changeB - changeA;
        });

        const topGainers = sortedByChange.slice(0, 5).map(s => ({
            ticker: s.ticker,
            name: s.name,
            name_ar: s.name_ar,
            current_price: s.current_price,
            price_change: s.getPriceChange ? s.getPriceChange() : null,
            compliance_status: s.compliance_status
        }));

        const topLosers = sortedByChange.slice(-5).reverse().map(s => ({
            ticker: s.ticker,
            name: s.name,
            name_ar: s.name_ar,
            current_price: s.current_price,
            price_change: s.getPriceChange ? s.getPriceChange() : null,
            compliance_status: s.compliance_status
        }));

        // Get most active by volume
        const sortedByVolume = [...stocks].sort((a, b) => (b.volume || 0) - (a.volume || 0));
        const mostActive = sortedByVolume.slice(0, 5).map(s => ({
            ticker: s.ticker,
            name: s.name,
            name_ar: s.name_ar,
            current_price: s.current_price,
            volume: s.volume,
            compliance_status: s.compliance_status
        }));

        // Get halal stocks count
        const halalStocks = stocks.filter(s => s.is_halal || s.compliance_status === 'halal').length;

        const mappedIndices = indices.map(mapIndexResponse);
        const egx30FromTable = mappedIndices.find((idx) => idx.symbol === 'EGX30');

        const egx30MemberPrices = stocks
            .filter((stock) => stock.egx30_member && Number.isFinite(Number(stock.current_price)))
            .map((stock) => Number(stock.current_price));

        const egx30FallbackValue = egx30MemberPrices.length
            ? egx30MemberPrices.reduce((sum, val) => sum + val, 0) / egx30MemberPrices.length
            : 0;

        const egx30Value = egx30FromTable && egx30FromTable.value > 0
            ? egx30FromTable.value
            : Number(egx30FallbackValue.toFixed(4));

        res.json({
            market_status: getScheduleStatus(),
            summary: {
                total_stocks: totalStocks,
                gainers,
                losers,
                unchanged,
                halal_stocks: halalStocks,
                egx30_stocks: egx30Count,
                egx70_stocks: egx70Count,
                egx100_stocks: egx100Count,
                egx30_value: egx30Value
            },
            indices: mappedIndices,
            top_gainers: topGainers,
            top_losers: topLosers,
            most_active: mostActive,
            last_updated: new Date().toISOString()
        });
    } catch (error) {
        logger.error('Get market overview error:', error);
        res.status(500).json({ detail: 'Failed to get market overview' });
    }
});

/**
 * @route GET /api/market/indices
 * @desc Get market indices
 */
router.get('/indices', optionalAuth, async (req, res) => {
    try {
        const indices = await MarketIndex.findAll({
            order: [['symbol', 'ASC']]
        });

        res.json({
            indices: indices.map(mapIndexResponse),
            total: indices.length
        });
    } catch (error) {
        logger.error('Get market indices error:', error);
        res.status(500).json({ detail: 'Failed to get market indices' });
    }
});

/**
 * @route GET /api/market/indices/:symbol
 * @desc Get specific market index
 */
router.get('/indices/:symbol', optionalAuth, async (req, res) => {
    try {
        const symbol = req.params.symbol.toUpperCase();

        const index = await MarketIndex.findOne({
            where: { symbol }
        });

        if (!index) {
            return res.status(404).json({
                detail: `Index with symbol '${symbol}' not found`
            });
        }

        res.json(index);
    } catch (error) {
        logger.error('Get market index error:', error);
        res.status(500).json({ detail: 'Failed to get market index' });
    }
});

/**
 * @route GET /api/market/status
 * @desc Get market status with detailed trading schedule info
 */
router.get('/status', optionalAuth, (req, res) => {
    res.json(getScheduleStatus());
});

/**
 * @route GET /api/market/update-status
 * @desc Get last data update status from database
 */
router.get('/update-status', optionalAuth, async (req, res) => {
    try {
        const { update_type = 'stocks', days = 7 } = req.query;
        
        // Get last successful update
        const lastUpdate = await MarketUpdateStatus.getLastSuccessfulUpdate(update_type);
        
        // Get recent update history
        const startDate = new Date();
        startDate.setDate(startDate.getDate() - parseInt(days));
        const history = await MarketUpdateStatus.getHistory(startDate, new Date(), update_type);
        
        // Get current market schedule status
        const scheduleStatus = getScheduleStatus();
        
        // Check if update is allowed now
        const updateCheck = shouldAllowUpdate(false);
        
        res.json({
            last_update: lastUpdate ? {
                id: lastUpdate.id,
                update_type: lastUpdate.update_type,
                status: lastUpdate.status,
                completed_at: lastUpdate.completed_at,
                records_updated: lastUpdate.records_updated,
                trading_date: lastUpdate.trading_date,
                source: lastUpdate.source
            } : null,
            can_update_now: updateCheck.allowed,
            update_reason: updateCheck.reason,
            market_schedule: scheduleStatus,
            recent_history: history.slice(0, 10).map(h => ({
                id: h.id,
                trading_date: h.trading_date,
                status: h.status,
                completed_at: h.completed_at,
                records_updated: h.records_updated,
                error_message: h.error_message
            }))
        });
    } catch (error) {
        logger.error('Get update status error:', error);
        res.status(500).json({ detail: 'Failed to get update status' });
    }
});

/**
 * @route GET /api/market/update-history
 * @desc Get update history from database
 */
router.get('/update-history', optionalAuth, async (req, res) => {
    try {
        const { update_type = 'stocks', days = 30 } = req.query;
        
        const startDate = new Date();
        startDate.setDate(startDate.getDate() - parseInt(days));
        
        const history = await MarketUpdateStatus.getHistory(startDate, new Date(), update_type);
        
        res.json({
            update_type,
            days: parseInt(days),
            total_updates: history.length,
            history: history.map(h => ({
                id: h.id,
                trading_date: h.trading_date,
                status: h.status,
                started_at: h.started_at,
                completed_at: h.completed_at,
                records_updated: h.records_updated,
                source: h.source,
                error_message: h.error_message,
                metadata: h.metadata
            }))
        });
    } catch (error) {
        logger.error('Get update history error:', error);
        res.status(500).json({ detail: 'Failed to get update history' });
    }
});

/**
 * @route POST /api/market/check-update-allowed
 * @desc Check if data update is allowed based on market schedule
 */
router.post('/check-update-allowed', optionalAuth, (req, res) => {
    try {
        const { force = false } = req.body;
        const result = shouldAllowUpdate(force === true);
        res.json(result);
    } catch (error) {
        logger.error('Check update allowed error:', error);
        res.status(500).json({ detail: 'Failed to check update status' });
    }
});

/**
 * @route POST /api/market/update-data
 * @desc Update stock data (only allowed during market hours)
 */
router.post('/update-data', authenticateApiKey, async (req, res) => {
    try {
        const { stocks, force = false, source = 'api' } = req.body;
        
        if (!stocks || !Array.isArray(stocks)) {
            return res.status(400).json({
                detail: 'Invalid request. Expected "stocks" array in request body.'
            });
        }
        
        const result = await updateStockData(stocks, { force, source });
        
        if (result.success) {
            res.json({
                success: true,
                message: `Updated ${result.records_updated} stocks`,
                ...result
            });
        } else {
            res.status(403).json({
                success: false,
                detail: result.reason || 'Update not allowed at this time',
                market_status: result.market_status
            });
        }
    } catch (error) {
        logger.error('Update data error:', error);
        res.status(500).json({ detail: 'Failed to update data' });
    }
});

/**
 * @route GET /api/market/refresh-check
 * @desc Check if data needs refresh based on last update
 */
router.get('/refresh-check', optionalAuth, async (req, res) => {
    try {
        const { max_age_minutes } = req.query;
        const maxAge = max_age_minutes ? parseInt(max_age_minutes) : null;
        
        const result = await checkDataNeedsRefresh(maxAge);
        res.json(result);
    } catch (error) {
        logger.error('Refresh check error:', error);
        res.status(500).json({ detail: 'Failed to check refresh status' });
    }
});

/**
 * @route GET /api/market/recommendations/trusted-sources
 * @desc Get trusted sources recommendations
 */
router.get('/recommendations/trusted-sources', authenticateApiKey, async (req, res) => {
    try {
        // Get stocks with positive indicators
        const stocks = await Stock.findAll({
            where: {
                is_active: true,
                [Op.or]: [
                    { is_halal: true },
                    { compliance_status: 'halal' }
                ]
            },
            limit: 10
        });

        const recommendations = stocks.map(stock => ({
            ticker: stock.ticker,
            name: stock.name,
            current_price: stock.current_price,
            pe_ratio: stock.pe_ratio,
            dividend_yield: stock.dividend_yield,
            compliance_status: stock.compliance_status,
            recommendation: 'hold',
            source: 'internal_analysis'
        }));

        res.json({
            recommendations,
            source: 'EGX Investment Platform',
            generated_at: new Date().toISOString()
        });
    } catch (error) {
        logger.error('Get trusted sources recommendations error:', error);
        res.status(500).json({ detail: 'Failed to get recommendations' });
    }
});

/**
 * @route GET /api/market/recommendations/ai-insights
 * @desc Get AI market insights
 */
router.get('/recommendations/ai-insights', authenticateApiKey, async (req, res) => {
    try {
        // Get market overview for AI analysis
        const stocks = await Stock.findAll({
            where: { is_active: true, is_egx: true }
        });

        // Generate basic insights
        const insights = {
            market_sentiment: 'neutral',
            top_sectors: [],
            recommendations: [],
            risk_assessment: 'medium',
            generated_at: new Date().toISOString()
        };

        // Calculate market sentiment
        const gainers = stocks.filter(s => s.getPriceChange && s.getPriceChange() > 0).length;
        const losers = stocks.filter(s => s.getPriceChange && s.getPriceChange() < 0).length;

        if (gainers > losers * 1.5) {
            insights.market_sentiment = 'bullish';
        } else if (losers > gainers * 1.5) {
            insights.market_sentiment = 'bearish';
        }

        // Get sector breakdown
        const sectors = {};
        stocks.forEach(s => {
            if (s.sector) {
                sectors[s.sector] = (sectors[s.sector] || 0) + 1;
            }
        });

        insights.top_sectors = Object.entries(sectors)
            .sort((a, b) => b[1] - a[1])
            .slice(0, 5)
            .map(([name, count]) => ({ name, count }));

        res.json(insights);
    } catch (error) {
        logger.error('Get AI insights error:', error);
        res.status(500).json({ detail: 'Failed to get AI insights' });
    }
});

module.exports = router;