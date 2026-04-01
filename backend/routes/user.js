/**
 * User Data Routes
 * Handles user watchlist, assets, income/expense, and portfolio sharing.
 */

const express = require('express');
const router = express.Router();
const { Op } = require('sequelize');
const crypto = require('crypto');
const logger = require('../logger');
const {
    Stock, UserStockWatchlist, UserAsset, UserPortfolioSnapshot,
    UserPortfolioSummary, UserIncomeExpense, SharedPortfolio
} = require('../models');
const { authenticateApiKey, requireUser } = require('../middleware/auth');
const { hashPassword, verifyPassword } = require('../middleware/auth');

const toNumber = (value, fallback = 0) => {
    const n = Number(value);
    return Number.isFinite(n) ? n : fallback;
};

// ==================== WATCHLIST ====================

/**
 * @route GET /api/user/watchlist
 * @desc Get user's watchlist
 */
router.get('/watchlist', authenticateApiKey, requireUser, async (req, res) => {
    try {
        const watchlist = await UserStockWatchlist.findAll({
            where: { user_id: req.user.id },
            include: [{
                model: Stock,
                as: 'stock',
                where: { is_active: true },
                required: false
            }],
            order: [['added_at', 'DESC']]
        });

        res.json(watchlist);
    } catch (error) {
        logger.error('Get watchlist error:', error);
        res.status(500).json({ detail: 'Failed to get watchlist' });
    }
});

/**
 * @route POST /api/user/watchlist
 * @desc Add stock to watchlist
 */
router.post('/watchlist', authenticateApiKey, requireUser, async (req, res) => {
    try {
        const { ticker, alert_price_above, alert_price_below, alert_change_percent, notes } = req.body;

        if (!ticker) {
            return res.status(400).json({ detail: 'Ticker is required' });
        }

        // Find stock
        const stock = await Stock.findOne({
            where: { ticker: ticker.toUpperCase(), is_active: true }
        });

        if (!stock) {
            return res.status(404).json({ detail: `Stock '${ticker}' not found` });
        }

        // Check if already in watchlist
        const existing = await UserStockWatchlist.findOne({
            where: { user_id: req.user.id, stock_id: stock.id }
        });

        if (existing) {
            return res.status(400).json({ detail: 'Stock already in watchlist' });
        }

        // Add to watchlist
        const watchlistItem = await UserStockWatchlist.create({
            user_id: req.user.id,
            stock_id: stock.id,
            alert_price_above,
            alert_price_below,
            alert_change_percent,
            notes
        });

        res.status(201).json(watchlistItem);
    } catch (error) {
        logger.error('Add to watchlist error:', error);
        res.status(500).json({ detail: 'Failed to add to watchlist' });
    }
});

/**
 * @route PUT /api/user/watchlist/:itemId
 * @desc Update watchlist item
 */
router.put('/watchlist/:itemId', authenticateApiKey, requireUser, async (req, res) => {
    try {
        const { itemId } = req.params;
        const { alert_price_above, alert_price_below, alert_change_percent, notes } = req.body;

        const item = await UserStockWatchlist.findOne({
            where: { id: itemId, user_id: req.user.id }
        });

        if (!item) {
            return res.status(404).json({ detail: 'Watchlist item not found' });
        }

        await item.update({
            alert_price_above,
            alert_price_below,
            alert_change_percent,
            notes
        });

        res.json(item);
    } catch (error) {
        logger.error('Update watchlist error:', error);
        res.status(500).json({ detail: 'Failed to update watchlist' });
    }
});

/**
 * @route DELETE /api/user/watchlist/:itemId
 * @desc Remove from watchlist
 */
router.delete('/watchlist/:itemId', authenticateApiKey, requireUser, async (req, res) => {
    try {
        const { itemId } = req.params;

        const item = await UserStockWatchlist.findOne({
            where: { id: itemId, user_id: req.user.id }
        });

        if (!item) {
            return res.status(404).json({ detail: 'Watchlist item not found' });
        }

        await item.destroy();

        res.json({ message: 'Removed from watchlist' });
    } catch (error) {
        logger.error('Remove from watchlist error:', error);
        res.status(500).json({ detail: 'Failed to remove from watchlist' });
    }
});

// ==================== ASSETS ====================

/**
 * @route GET /api/user/assets
 * @desc Get user's assets
 */
router.get('/assets', authenticateApiKey, requireUser, async (req, res) => {
    try {
        const { asset_type } = req.query;

        const whereClause = { user_id: req.user.id, is_active: true };

        if (asset_type) {
            whereClause.asset_type = asset_type;
        }

        const assets = await UserAsset.findAll({
            where: whereClause,
            include: [{
                model: Stock,
                as: 'stock',
                required: false
            }],
            order: [['created_at', 'DESC']]
        });

        res.json(assets);
    } catch (error) {
        logger.error('Get assets error:', error);
        res.status(500).json({ detail: 'Failed to get assets' });
    }
});

/**
 * @route POST /api/user/assets
 * @desc Create new asset
 */
router.post('/assets', authenticateApiKey, requireUser, async (req, res) => {
    try {
        const {
            asset_type, asset_name, asset_ticker, stock_id,
            quantity, purchase_price, purchase_date,
            target_price, stop_loss_price, currency, notes
        } = req.body;

        if (!asset_type || !asset_name || quantity === undefined || purchase_price === undefined) {
            return res.status(400).json({
                detail: 'Asset type, name, quantity, and purchase price are required'
            });
        }

        // Calculate current value
        const current_value = quantity * purchase_price;

        const asset = await UserAsset.create({
            user_id: req.user.id,
            asset_type,
            asset_name,
            asset_ticker,
            stock_id,
            quantity,
            purchase_price,
            current_price: purchase_price,
            current_value,
            purchase_date: purchase_date || new Date(),
            target_price,
            stop_loss_price,
            currency: currency || 'EGP',
            notes
        });

        res.status(201).json(asset);
    } catch (error) {
        logger.error('Create asset error:', error);
        res.status(500).json({ detail: 'Failed to create asset' });
    }
});

/**
 * @route PUT /api/user/assets/:assetId
 * @desc Update asset
 */
router.put('/assets/:assetId', authenticateApiKey, requireUser, async (req, res) => {
    try {
        const { assetId } = req.params;
        const updateData = req.body;

        const asset = await UserAsset.findOne({
            where: { id: assetId, user_id: req.user.id }
        });

        if (!asset) {
            return res.status(404).json({ detail: 'Asset not found' });
        }

        // Recalculate values if quantity or price changed
        if (updateData.quantity !== undefined || updateData.current_price !== undefined) {
            const quantity = updateData.quantity !== undefined ? updateData.quantity : asset.quantity;
            const currentPrice = updateData.current_price !== undefined ? updateData.current_price : asset.current_price;

            updateData.current_value = quantity * currentPrice;
            updateData.gain_loss = updateData.current_value - (quantity * asset.purchase_price);
            updateData.gain_loss_percent = asset.purchase_price > 0
                ? ((currentPrice - asset.purchase_price) / asset.purchase_price) * 100
                : 0;
        }

        await asset.update(updateData);

        res.json(asset);
    } catch (error) {
        logger.error('Update asset error:', error);
        res.status(500).json({ detail: 'Failed to update asset' });
    }
});

/**
 * @route DELETE /api/user/assets/:assetId
 * @desc Delete asset
 */
router.delete('/assets/:assetId', authenticateApiKey, requireUser, async (req, res) => {
    try {
        const { assetId } = req.params;

        const asset = await UserAsset.findOne({
            where: { id: assetId, user_id: req.user.id }
        });

        if (!asset) {
            return res.status(404).json({ detail: 'Asset not found' });
        }

        await asset.destroy();

        res.json({ message: 'Asset deleted' });
    } catch (error) {
        logger.error('Delete asset error:', error);
        res.status(500).json({ detail: 'Failed to delete asset' });
    }
});

/**
 * @route POST /api/user/assets/sync-prices
 * @desc Sync asset prices with current stock prices
 */
router.post('/assets/sync-prices', authenticateApiKey, requireUser, async (req, res) => {
    try {
        // Get all user's stock assets with auto_sync enabled
        const assets = await UserAsset.findAll({
            where: { user_id: req.user.id, is_active: true, auto_sync: true },
            include: [{
                model: Stock,
                as: 'stock',
                required: true
            }]
        });

        let updatedCount = 0;

        for (const asset of assets) {
            if (asset.stock && asset.stock.current_price) {
                const newPrice = asset.stock.current_price;
                const newValue = asset.quantity * newPrice;
                const gainLoss = newValue - (asset.quantity * asset.purchase_price);
                const gainLossPercent = asset.purchase_price > 0
                    ? ((newPrice - asset.purchase_price) / asset.purchase_price) * 100
                    : 0;

                await asset.update({
                    current_price: newPrice,
                    current_value: newValue,
                    gain_loss: gainLoss,
                    gain_loss_percent: gainLossPercent
                });

                updatedCount++;
            }
        }

        res.json({
            message: 'Prices synced',
            updated_count: updatedCount,
            total_assets: assets.length
        });
    } catch (error) {
        logger.error('Sync prices error:', error);
        res.status(500).json({ detail: 'Failed to sync prices' });
    }
});

/**
 * @route GET /api/user/portfolio-impact
 * @desc Get daily portfolio impact feed based on current market prices
 */
router.get('/portfolio-impact', authenticateApiKey, requireUser, async (req, res) => {
    try {
        const dayLossAlertPercent = Math.max(0.5, toNumber(req.query.day_loss_alert_percent, 3));
        const concentrationAlertPercent = Math.max(5, toNumber(req.query.concentration_alert_percent, 35));

        const assets = await UserAsset.findAll({
            where: {
                user_id: req.user.id,
                is_active: true,
                [Op.or]: [
                    { stock_id: { [Op.ne]: null } },
                    { asset_ticker: { [Op.ne]: null } }
                ]
            },
            include: [{
                model: Stock,
                as: 'stock',
                required: false,
                where: { is_active: true }
            }]
        });

        const items = assets
            .map((asset) => {
                const stock = asset.stock;
                if (!stock) {
                    return null;
                }

                const quantity = toNumber(asset.quantity);
                const currentPrice = toNumber(stock.current_price, toNumber(asset.current_price));
                const previousClose = toNumber(stock.previous_close, currentPrice);
                const purchasePrice = toNumber(asset.purchase_price);

                if (quantity <= 0 || currentPrice <= 0) {
                    return null;
                }

                const investedValue = quantity * purchasePrice;
                const marketValue = quantity * currentPrice;
                const dayImpactValue = quantity * (currentPrice - previousClose);
                const dayImpactPercent = previousClose > 0
                    ? ((currentPrice - previousClose) / previousClose) * 100
                    : 0;
                const totalGainLossValue = marketValue - investedValue;
                const totalGainLossPercent = investedValue > 0
                    ? (totalGainLossValue / investedValue) * 100
                    : 0;

                return {
                    asset_id: asset.id,
                    ticker: stock.ticker || asset.asset_ticker,
                    name_ar: stock.name_ar || stock.name || asset.asset_name,
                    quantity,
                    current_price: currentPrice,
                    previous_close: previousClose,
                    market_value: Number(marketValue.toFixed(2)),
                    day_impact_value: Number(dayImpactValue.toFixed(2)),
                    day_impact_percent: Number(dayImpactPercent.toFixed(2)),
                    total_gain_loss_value: Number(totalGainLossValue.toFixed(2)),
                    total_gain_loss_percent: Number(totalGainLossPercent.toFixed(2)),
                    sector: stock.sector || null,
                    weight_percent: 0,
                    alerts: [],
                    is_day_loss_alert: false,
                    is_concentration_alert: false
                };
            })
            .filter(Boolean)
            .sort((a, b) => Math.abs(b.day_impact_value) - Math.abs(a.day_impact_value));

        const totalMarketValue = items.reduce((sum, item) => sum + item.market_value, 0);
        const totalDayImpact = items.reduce((sum, item) => sum + item.day_impact_value, 0);
        const totalInvested = items.reduce((sum, item) => sum + (item.market_value - item.total_gain_loss_value), 0);
        const totalGainLoss = items.reduce((sum, item) => sum + item.total_gain_loss_value, 0);

        for (const item of items) {
            const weightPercent = totalMarketValue > 0 ? (item.market_value / totalMarketValue) * 100 : 0;
            const isDayLossAlert = item.day_impact_percent <= -dayLossAlertPercent;
            const isConcentrationAlert = weightPercent >= concentrationAlertPercent;
            const alerts = [];

            if (isDayLossAlert) {
                alerts.push(`هبوط يومي قوي (${Math.abs(item.day_impact_percent).toFixed(2)}%)`);
            }
            if (isConcentrationAlert) {
                alerts.push(`تركيز مرتفع بالمحفظة (${weightPercent.toFixed(1)}%)`);
            }

            item.weight_percent = Number(weightPercent.toFixed(2));
            item.is_day_loss_alert = isDayLossAlert;
            item.is_concentration_alert = isConcentrationAlert;
            item.alerts = alerts;
        }

        const alertItems = items.filter((item) => item.alerts.length > 0);

        const topPositive = items
            .filter((item) => item.day_impact_value > 0)
            .sort((a, b) => b.day_impact_value - a.day_impact_value)
            .slice(0, 3);

        const topNegative = items
            .filter((item) => item.day_impact_value < 0)
            .sort((a, b) => a.day_impact_value - b.day_impact_value)
            .slice(0, 3);

        const losersCount = items.filter((item) => item.day_impact_value < 0).length;
        const winnersCount = items.filter((item) => item.day_impact_value > 0).length;

        let action = 'hold';
        let action_label_ar = 'ثبّت المراكز';
        let reason_ar = 'لا يوجد ضغط خطر واضح يستدعي تعديل قوي الآن.';
        let confidence = 0.62;

        const totalDayImpactPercent = totalMarketValue > 0 ? (totalDayImpact / totalMarketValue) * 100 : 0;

        if (totalDayImpactPercent <= -2 || alertItems.length >= 2 || losersCount > winnersCount + 2) {
            action = 'decrease_risk';
            action_label_ar = 'خفّف المخاطر';
            reason_ar = 'الأداء اليومي سلبي أو يوجد تركّز/هبوط مرتفع في مراكز أساسية، يفضل تقليل الانكشاف تدريجيًا.';
            confidence = 0.78;
        } else if (totalDayImpactPercent >= 1.2 && winnersCount >= losersCount && alertItems.length === 0) {
            action = 'increase_gradually';
            action_label_ar = 'زوّد تدريجيًا';
            reason_ar = 'الزخم اليومي إيجابي مع توازن مخاطرة مقبول، يمكن زيادة المراكز على دفعات.';
            confidence = 0.71;
        }

        res.json({
            summary: {
                assets_count: items.length,
                total_market_value: Number(totalMarketValue.toFixed(2)),
                total_invested: Number(totalInvested.toFixed(2)),
                total_gain_loss: Number(totalGainLoss.toFixed(2)),
                total_gain_loss_percent: totalInvested > 0
                    ? Number(((totalGainLoss / totalInvested) * 100).toFixed(2))
                    : 0,
                day_impact_value: Number(totalDayImpact.toFixed(2)),
                day_impact_percent: totalMarketValue > 0
                    ? Number(((totalDayImpact / totalMarketValue) * 100).toFixed(2))
                    : 0
            },
            thresholds: {
                day_loss_alert_percent: dayLossAlertPercent,
                concentration_alert_percent: concentrationAlertPercent
            },
            recommendation: {
                action,
                action_label_ar,
                reason_ar,
                confidence: Number(confidence.toFixed(2))
            },
            risk_alerts: alertItems.slice(0, 8),
            top_positive: topPositive,
            top_negative: topNegative,
            items
        });
    } catch (error) {
        logger.error('Get portfolio impact error:', error);
        res.status(500).json({ detail: 'Failed to get portfolio impact feed' });
    }
});

/**
 * @route GET /api/user/financial-summary
 * @desc Get financial summary
 */
router.get('/financial-summary', authenticateApiKey, requireUser, async (req, res) => {
    try {
        const assets = await UserAsset.findAll({
            where: { user_id: req.user.id, is_active: true }
        });

        const summary = {
            total_value: 0,
            total_cost: 0,
            total_gain_loss: 0,
            by_type: {},
            by_currency: {}
        };

        for (const asset of assets) {
            const value = asset.current_value || 0;
            const cost = asset.quantity * asset.purchase_price;

            summary.total_value += value;
            summary.total_cost += cost;

            // By type
            if (!summary.by_type[asset.asset_type]) {
                summary.by_type[asset.asset_type] = { value: 0, count: 0 };
            }
            summary.by_type[asset.asset_type].value += value;
            summary.by_type[asset.asset_type].count++;

            // By currency
            if (!summary.by_currency[asset.currency]) {
                summary.by_currency[asset.currency] = 0;
            }
            summary.by_currency[asset.currency] += value;
        }

        summary.total_gain_loss = summary.total_value - summary.total_cost;
        summary.total_gain_loss_percent = summary.total_cost > 0
            ? (summary.total_gain_loss / summary.total_cost) * 100
            : 0;

        res.json(summary);
    } catch (error) {
        logger.error('Get financial summary error:', error);
        res.status(500).json({ detail: 'Failed to get financial summary' });
    }
});

// ==================== INCOME/EXPENSE ====================

/**
 * @route GET /api/user/income-expense
 * @desc Get income/expense transactions
 */
router.get('/income-expense', authenticateApiKey, requireUser, async (req, res) => {
    try {
        const { transaction_type, category, start_date, end_date } = req.query;

        const whereClause = { user_id: req.user.id };

        if (transaction_type) {
            whereClause.transaction_type = transaction_type;
        }

        if (category) {
            whereClause.category = category;
        }

        if (start_date || end_date) {
            whereClause.transaction_date = {};
            if (start_date) {
                whereClause.transaction_date[Op.gte] = new Date(start_date);
            }
            if (end_date) {
                whereClause.transaction_date[Op.lte] = new Date(end_date);
            }
        }

        const transactions = await UserIncomeExpense.findAll({
            where: whereClause,
            order: [['transaction_date', 'DESC']]
        });

        res.json(transactions);
    } catch (error) {
        logger.error('Get income/expense error:', error);
        res.status(500).json({ detail: 'Failed to get transactions' });
    }
});

/**
 * @route POST /api/user/income-expense
 * @desc Create income/expense transaction
 */
router.post('/income-expense', authenticateApiKey, requireUser, async (req, res) => {
    try {
        const {
            transaction_type, category, amount, currency,
            description, related_asset_id, related_stock_id,
            transaction_date, is_recurring, recurrence_period
        } = req.body;

        if (!transaction_type || !category || !amount) {
            return res.status(400).json({
                detail: 'Transaction type, category, and amount are required'
            });
        }

        const transaction = await UserIncomeExpense.create({
            user_id: req.user.id,
            transaction_type,
            category,
            amount,
            currency: currency || 'EGP',
            description,
            related_asset_id,
            related_stock_id,
            transaction_date: transaction_date ? new Date(transaction_date) : new Date(),
            is_recurring: is_recurring || false,
            recurrence_period
        });

        res.status(201).json(transaction);
    } catch (error) {
        logger.error('Create transaction error:', error);
        res.status(500).json({ detail: 'Failed to create transaction' });
    }
});

/**
 * @route PUT /api/user/income-expense/:transactionId
 * @desc Update transaction
 */
router.put('/income-expense/:transactionId', authenticateApiKey, requireUser, async (req, res) => {
    try {
        const { transactionId } = req.params;

        const transaction = await UserIncomeExpense.findOne({
            where: { id: transactionId, user_id: req.user.id }
        });

        if (!transaction) {
            return res.status(404).json({ detail: 'Transaction not found' });
        }

        await transaction.update(req.body);

        res.json(transaction);
    } catch (error) {
        logger.error('Update transaction error:', error);
        res.status(500).json({ detail: 'Failed to update transaction' });
    }
});

/**
 * @route DELETE /api/user/income-expense/:transactionId
 * @desc Delete transaction
 */
router.delete('/income-expense/:transactionId', authenticateApiKey, requireUser, async (req, res) => {
    try {
        const { transactionId } = req.params;

        const transaction = await UserIncomeExpense.findOne({
            where: { id: transactionId, user_id: req.user.id }
        });

        if (!transaction) {
            return res.status(404).json({ detail: 'Transaction not found' });
        }

        await transaction.destroy();

        res.json({ message: 'Transaction deleted' });
    } catch (error) {
        logger.error('Delete transaction error:', error);
        res.status(500).json({ detail: 'Failed to delete transaction' });
    }
});

// ==================== PORTFOLIO SHARING ====================

/**
 * @route POST /api/user/share-portfolio
 * @desc Share portfolio
 */
router.post('/share-portfolio', authenticateApiKey, requireUser, async (req, res) => {
    try {
        const {
            is_public, allow_copy, show_values, show_gain_loss,
            password, max_views, expires_in_days
        } = req.body;

        // Generate share code
        const shareCode = crypto.randomBytes(6).toString('hex').toUpperCase();

        // Hash password if provided
        let passwordHash = null;
        if (password) {
            passwordHash = await hashPassword(password);
        }

        // Calculate expiration
        let expiresAt = null;
        if (expires_in_days) {
            expiresAt = new Date(Date.now() + expires_in_days * 24 * 60 * 60 * 1000);
        }

        const sharedPortfolio = await SharedPortfolio.create({
            owner_id: req.user.id,
            share_code: shareCode,
            is_public: is_public || false,
            allow_copy: allow_copy || false,
            show_values: show_values !== false,
            show_gain_loss: show_gain_loss !== false,
            password_hash: passwordHash,
            max_views,
            expires_at: expiresAt
        });

        res.status(201).json({
            share_code: shareCode,
            share_url: `/shared/${shareCode}`,
            expires_at: expiresAt,
            is_public: sharedPortfolio.is_public
        });
    } catch (error) {
        logger.error('Share portfolio error:', error);
        res.status(500).json({ detail: 'Failed to share portfolio' });
    }
});

/**
 * @route GET /api/user/shared-portfolio/:shareCode
 * @desc Get shared portfolio by code
 */
router.get('/shared-portfolio/:shareCode', async (req, res) => {
    try {
        const { shareCode } = req.params;
        const password = req.headers['x-share-password'];

        const shared = await SharedPortfolio.findOne({
            where: { share_code: shareCode.toUpperCase() }
        });

        if (!shared) {
            return res.status(404).json({ detail: 'Shared portfolio not found' });
        }

        // Check expiration
        if (shared.expires_at && new Date(shared.expires_at) < new Date()) {
            return res.status(410).json({ detail: 'Shared portfolio has expired' });
        }

        // Check max views
        if (shared.max_views && shared.current_views >= shared.max_views) {
            return res.status(410).json({ detail: 'View limit reached' });
        }

        // Check password
        if (shared.password_hash) {
            if (!password) {
                return res.status(401).json({ detail: 'Password required' });
            }

            const validPassword = await verifyPassword(password, shared.password_hash);
            if (!validPassword) {
                return res.status(401).json({ detail: 'Invalid password' });
            }
        }

        // Get user's assets
        const assets = await UserAsset.findAll({
            where: { user_id: shared.owner_id, is_active: true }
        });

        // Update view count
        await shared.update({
            current_views: shared.current_views + 1,
            last_accessed: new Date()
        });

        // Prepare response based on settings
        const responseData = {
            share_code: shared.share_code,
            is_public: shared.is_public,
            allow_copy: shared.allow_copy,
            show_values: shared.show_values,
            show_gain_loss: shared.show_gain_loss,
            assets: assets.map(asset => {
                const data = {
                    asset_type: asset.asset_type,
                    asset_name: asset.asset_name,
                    asset_ticker: asset.asset_ticker
                };

                if (shared.show_values) {
                    data.quantity = asset.quantity;
                    data.current_value = asset.current_value;
                }

                if (shared.show_gain_loss) {
                    data.gain_loss = asset.gain_loss;
                    data.gain_loss_percent = asset.gain_loss_percent;
                }

                return data;
            })
        };

        res.json(responseData);
    } catch (error) {
        logger.error('Get shared portfolio error:', error);
        res.status(500).json({ detail: 'Failed to get shared portfolio' });
    }
});

/**
 * @route GET /api/user/my-shares
 * @desc Get user's shared portfolios
 */
router.get('/my-shares', authenticateApiKey, requireUser, async (req, res) => {
    try {
        const shares = await SharedPortfolio.findAll({
            where: { owner_id: req.user.id },
            order: [['created_at', 'DESC']]
        });

        res.json(shares);
    } catch (error) {
        logger.error('Get my shares error:', error);
        res.status(500).json({ detail: 'Failed to get shares' });
    }
});

/**
 * @route DELETE /api/user/share/:shareId
 * @desc Revoke shared portfolio
 */
router.delete('/share/:shareId', authenticateApiKey, requireUser, async (req, res) => {
    try {
        const { shareId } = req.params;

        const share = await SharedPortfolio.findOne({
            where: { id: shareId, owner_id: req.user.id }
        });

        if (!share) {
            return res.status(404).json({ detail: 'Share not found' });
        }

        await share.destroy();

        res.json({ message: 'Share revoked' });
    } catch (error) {
        logger.error('Revoke share error:', error);
        res.status(500).json({ detail: 'Failed to revoke share' });
    }
});

module.exports = router;