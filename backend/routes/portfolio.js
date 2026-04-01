/**
 * Portfolio Routes
 * Handles portfolio recommendations and management.
 */

const express = require('express');
const router = express.Router();
const { Op } = require('sequelize');
const logger = require('../logger');
const { Stock, Portfolio, PortfolioHolding, User } = require('../models');
const { authenticateApiKey, requireUser, optionalAuth } = require('../middleware/auth');

/**
 * @route GET /api/portfolio/recommend
 * @desc Get portfolio recommendations
 */
router.get('/recommend', authenticateApiKey, async (req, res) => {
    try {
        const { capital, risk = 'medium', max_stocks, sectors } = req.query;

        if (!capital || parseFloat(capital) <= 0) {
            return res.status(400).json({
                detail: 'Valid capital amount is required'
            });
        }

        const capitalAmount = parseFloat(capital);
        const riskLevel = risk.toLowerCase();
        const maxStocksCount = max_stocks ? parseInt(max_stocks) : 10;

        // Build where clause
        const whereClause = { is_active: true };

        if (sectors) {
            whereClause.sector = { [Op.in]: sectors.split(',') };
        }

        // Get available stocks
        const stocks = await Stock.findAll({
            where: whereClause,
            limit: 50
        });

        // Filter and score stocks
        const scoredStocks = stocks.map(stock => {
            let score = 50; // Base score

            // Adjust for risk
            if (riskLevel === 'low') {
                // Prefer stable stocks with dividends
                if (stock.dividend_yield && stock.dividend_yield > 3) score += 15;
                if (stock.debt_to_equity && stock.debt_to_equity < 0.5) score += 10;
            } else if (riskLevel === 'high') {
                // Prefer growth potential
                if (stock.pe_ratio && stock.pe_ratio > 20) score += 10;
                if (stock.getPriceChange && stock.getPriceChange() > 5) score += 15;
            }

            return { stock, score };
        });

        // Sort by score and take top stocks
        scoredStocks.sort((a, b) => b.score - a.score);
        const selectedStocks = scoredStocks.slice(0, maxStocksCount);

        // Calculate allocation
        const totalScore = selectedStocks.reduce((sum, s) => sum + s.score, 0);
        const recommendations = selectedStocks.map(({ stock, score }) => {
            const allocation = (score / totalScore) * capitalAmount;
            const shares = stock.current_price ? Math.floor(allocation / stock.current_price) : 0;

            return {
                ticker: stock.ticker,
                name: stock.name,
                current_price: stock.current_price,
                allocation_amount: Math.round(allocation * 100) / 100,
                allocation_percent: Math.round((score / totalScore) * 100 * 100) / 100,
                recommended_shares: shares,
                score,
                sector: stock.sector
            };
        });

        res.json({
            capital: capitalAmount,
            risk_level: riskLevel,
            recommendations,
            total_stocks: recommendations.length,
            generated_at: new Date().toISOString()
        });
    } catch (error) {
        logger.error('Get recommendations error:', error);
        res.status(500).json({ detail: 'Failed to get recommendations' });
    }
});

/**
 * @route POST /api/portfolio/recommend/advanced
 * @desc Get advanced portfolio recommendations
 */
router.post('/recommend/advanced', authenticateApiKey, async (req, res) => {
    try {
        const {
            capital,
            risk = 'medium',
            max_stocks = 10,
            sectors = [],
            exclude_tickers = [],
            min_price,
            max_price,
            investment_horizon = 'medium'
        } = req.body;

        if (!capital || capital <= 0) {
            return res.status(400).json({
                detail: 'Valid capital amount is required'
            });
        }

        // Build where clause
        const whereClause = { is_active: true };

        if (sectors.length > 0) {
            whereClause.sector = { [Op.in]: sectors };
        }

        if (exclude_tickers.length > 0) {
            whereClause.ticker = { [Op.notIn]: exclude_tickers };
        }

        if (min_price) {
            whereClause.current_price = { ...whereClause.current_price, [Op.gte]: min_price };
        }

        if (max_price) {
            whereClause.current_price = { ...whereClause.current_price, [Op.lte]: max_price };
        }

        // Get available stocks
        const stocks = await Stock.findAll({
            where: whereClause,
            limit: 100
        });

        // Advanced scoring
        const scoredStocks = stocks.map(stock => {
            let score = 50;

            // Risk-based scoring
            if (risk === 'low') {
                if (stock.dividend_yield && stock.dividend_yield > 3) score += 15;
                if (stock.debt_to_equity && stock.debt_to_equity < 0.5) score += 10;
                if (stock.pe_ratio && stock.pe_ratio < 15) score += 10;
            } else if (risk === 'high') {
                if (stock.pe_ratio && stock.pe_ratio > 20) score += 10;
                if (stock.getPriceChange && stock.getPriceChange() > 5) score += 15;
                if (stock.roe && stock.roe > 15) score += 10;
            } else {
                // Medium risk - balanced approach
                if (stock.dividend_yield && stock.dividend_yield > 2) score += 8;
                if (stock.pe_ratio && stock.pe_ratio >= 10 && stock.pe_ratio <= 25) score += 8;
            }

            // Investment horizon scoring
            if (investment_horizon === 'long') {
                if (stock.roe && stock.roe > 12) score += 10;
                if (stock.dividend_yield && stock.dividend_yield > 2) score += 10;
            } else if (investment_horizon === 'short') {
                if (stock.getPriceChange && Math.abs(stock.getPriceChange()) < 3) score += 10;
            }

            return { stock, score };
        });

        // Sort and select
        scoredStocks.sort((a, b) => b.score - a.score);
        const selectedStocks = scoredStocks.slice(0, max_stocks);

        // Calculate allocation
        const totalScore = selectedStocks.reduce((sum, s) => sum + s.score, 0);
        const recommendations = selectedStocks.map(({ stock, score }) => {
            const allocation = (score / totalScore) * capital;
            const shares = stock.current_price ? Math.floor(allocation / stock.current_price) : 0;

            return {
                ticker: stock.ticker,
                name: stock.name,
                current_price: stock.current_price,
                allocation_amount: Math.round(allocation * 100) / 100,
                allocation_percent: Math.round((score / totalScore) * 100 * 100) / 100,
                recommended_shares: shares,
                score,
                sector: stock.sector,
                pe_ratio: stock.pe_ratio,
                dividend_yield: stock.dividend_yield
            };
        });

        // Calculate portfolio metrics
        const avgPERatio = recommendations.reduce((sum, r) => sum + (r.pe_ratio || 0), 0) / recommendations.length;
        const avgDividendYield = recommendations.reduce((sum, r) => sum + (r.dividend_yield || 0), 0) / recommendations.length;

        res.json({
            capital,
            risk_level: risk,
            investment_horizon,
            recommendations,
            portfolio_metrics: {
                average_pe_ratio: Math.round(avgPERatio * 100) / 100,
                average_dividend_yield: Math.round(avgDividendYield * 100) / 100,
                total_stocks: recommendations.length
            },
            generated_at: new Date().toISOString()
        });
    } catch (error) {
        logger.error('Get advanced recommendations error:', error);
        res.status(500).json({ detail: 'Failed to get recommendations' });
    }
});

module.exports = router;