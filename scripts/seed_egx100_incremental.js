/**
 * Incremental EGX seeder.
 * Ensures we have at least 100 active EGX stocks without dropping existing data.
 */

require('dotenv').config();

const { sequelize } = require('../backend/database');
const { Stock, StockPriceHistory } = require('../backend/models');
const logger = require('../backend/logger');
const { COMPREHENSIVE_EGX_STOCKS } = require('./egx_stock_data');

const TARGET_STOCKS = 100;

function randomBetween(min, max) {
    return min + Math.random() * (max - min);
}

function generatePriceHistory(basePrice, days = 120) {
    const history = [];
    let currentPrice = basePrice;
    const now = new Date();

    for (let i = days - 1; i >= 0; i -= 1) {
        const date = new Date(now);
        date.setDate(date.getDate() - i);

        const dailyDrift = (Math.random() - 0.5) * basePrice * 0.04;
        currentPrice = Math.max(basePrice * 0.45, currentPrice + dailyDrift);

        const open = currentPrice * (1 + (Math.random() - 0.5) * 0.02);
        const high = Math.max(open, currentPrice) * (1 + Math.random() * 0.025);
        const low = Math.min(open, currentPrice) * (1 - Math.random() * 0.025);
        const close = currentPrice;

        history.push({
            date,
            open_price: Number(open.toFixed(2)),
            high_price: Number(high.toFixed(2)),
            low_price: Number(low.toFixed(2)),
            close_price: Number(close.toFixed(2)),
            adjusted_close: Number(close.toFixed(2)),
            volume: Math.floor(randomBetween(150000, 3000000))
        });
    }

    return history;
}

function buildSyntheticStocks(existingTickers, requiredCount) {
    const sectors = [
        { en: 'Financials', ar: 'الخدمات المالية' },
        { en: 'Industrials', ar: 'الصناعة' },
        { en: 'Consumer Goods', ar: 'السلع الاستهلاكية' },
        { en: 'Real Estate', ar: 'العقارات' },
        { en: 'Healthcare', ar: 'الرعاية الصحية' },
        { en: 'Basic Materials', ar: 'المواد الأساسية' },
        { en: 'Technology', ar: 'التكنولوجيا' },
        { en: 'Energy', ar: 'الطاقة' }
    ];

    const generated = [];
    let idx = 1;

    while (generated.length < requiredCount) {
        const ticker = `EG${String(idx).padStart(2, '0')}X`;
        idx += 1;

        if (existingTickers.has(ticker)) {
            continue;
        }

        const sector = sectors[generated.length % sectors.length];
        const companyNumber = generated.length + 1;

        generated.push({
            ticker,
            name: `Egypt Growth Company ${companyNumber}`,
            name_ar: `شركة النمو المصرية ${companyNumber}`,
            sector: sector.en,
            egx30: false,
            egx70: false,
            egx100: true,
            is_halal: null,
            compliance_status: 'unknown'
        });

        existingTickers.add(ticker);
    }

    return generated;
}

function mapStockSeed(stock) {
    return {
        ticker: stock.ticker,
        name: stock.name,
        name_ar: stock.name_ar,
        sector: stock.sector,
        is_halal: stock.is_halal,
        compliance_status: stock.compliance_status || 'unknown',
        egx30_member: Boolean(stock.egx30),
        egx70_member: Boolean(stock.egx70),
        egx100_member: Boolean(stock.egx100),
        is_active: true,
        is_egx: true
    };
}

async function upsertStockWithHistory(stockData, transaction) {
    const basePrice = randomBetween(8, 180);
    const history = generatePriceHistory(basePrice, 120);
    const latest = history[history.length - 1];
    const previous = history[history.length - 2] || latest;

    const payload = {
        ...mapStockSeed(stockData),
        current_price: latest.close_price,
        previous_close: previous.close_price,
        open_price: latest.open_price,
        high_price: latest.high_price,
        low_price: latest.low_price,
        volume: latest.volume,
        market_cap: Number((latest.close_price * randomBetween(40000000, 4000000000)).toFixed(2)),
        pe_ratio: Number(randomBetween(6, 28).toFixed(2)),
        pb_ratio: Number(randomBetween(0.6, 3.2).toFixed(2)),
        dividend_yield: Number(randomBetween(0, 8).toFixed(2)),
        eps: Number(randomBetween(0.5, 12).toFixed(2)),
        roe: Number(randomBetween(3, 28).toFixed(2)),
        debt_to_equity: Number(randomBetween(0, 1.8).toFixed(2)),
        support_level: Number(Math.min(...history.slice(-30).map((p) => p.low_price)).toFixed(2)),
        resistance_level: Number(Math.max(...history.slice(-30).map((p) => p.high_price)).toFixed(2)),
        ma_50: Number((history.slice(-50).reduce((acc, p) => acc + p.close_price, 0) / 50).toFixed(2)),
        ma_200: Number((history.reduce((acc, p) => acc + p.close_price, 0) / history.length).toFixed(2)),
        rsi: Number(randomBetween(28, 72).toFixed(2)),
        last_update: new Date()
    };

    const [stock, created] = await Stock.findOrCreate({
        where: { ticker: stockData.ticker },
        defaults: payload,
        transaction
    });

    if (!created) {
        await stock.update(payload, { transaction });
    }

    const existingHistoryCount = await StockPriceHistory.count({
        where: { stock_id: stock.id },
        transaction
    });

    if (existingHistoryCount < 60) {
        const rows = history.map((point) => ({
            stock_id: stock.id,
            ...point
        }));
        await StockPriceHistory.bulkCreate(rows, { transaction });
    }

    return { ticker: stockData.ticker, created };
}

async function run() {
    const tx = await sequelize.transaction();
    try {
        const existingStocks = await Stock.findAll({
            where: { is_active: true, is_egx: true },
            attributes: ['ticker'],
            transaction: tx
        });

        const existingTickers = new Set(existingStocks.map((s) => s.ticker));

        const masterSeeds = COMPREHENSIVE_EGX_STOCKS.filter((s) => !existingTickers.has(s.ticker));

        const currentCount = existingTickers.size;
        const remainingToTarget = Math.max(0, TARGET_STOCKS - (currentCount + masterSeeds.length));
        const syntheticSeeds = buildSyntheticStocks(existingTickers, remainingToTarget);

        const allSeeds = [...masterSeeds, ...syntheticSeeds];

        let createdCount = 0;
        for (const seed of allSeeds) {
            const result = await upsertStockWithHistory(seed, tx);
            if (result.created) {
                createdCount += 1;
            }
        }

        const egx100Count = await Stock.count({
            where: { is_active: true, is_egx: true, egx100_member: true },
            transaction: tx
        });

        if (egx100Count < TARGET_STOCKS) {
            const toPromote = await Stock.findAll({
                where: { is_active: true, is_egx: true, egx100_member: false },
                order: [['ticker', 'ASC']],
                limit: TARGET_STOCKS - egx100Count,
                transaction: tx
            });

            for (const stock of toPromote) {
                await stock.update({ egx100_member: true }, { transaction: tx });
            }
        }

        const finalCount = await Stock.count({
            where: { is_active: true, is_egx: true },
            transaction: tx
        });

        const finalEgx100Count = await Stock.count({
            where: { is_active: true, is_egx: true, egx100_member: true },
            transaction: tx
        });

        await tx.commit();

        logger.info(`[EGX100 Seed] Current: ${currentCount}, Added: ${createdCount}, Final: ${finalCount}`);
        console.log(JSON.stringify({
            ok: true,
            target: TARGET_STOCKS,
            before: currentCount,
            added: createdCount,
            final: finalCount,
            egx100_members: finalEgx100Count
        }, null, 2));
    } catch (error) {
        await tx.rollback();
        logger.error('[EGX100 Seed] Failed:', error);
        console.error(error);
        process.exitCode = 1;
    } finally {
        await sequelize.close();
    }
}

run();
