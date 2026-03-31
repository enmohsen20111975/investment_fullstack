require('dotenv').config();

const path = require('path');
const { Op } = require('sequelize');
const { sequelize, Stock, StockPriceHistory, MarketIndex } = require('../../backend/models');
const { ensureDir, writeJson, safePercentChange, toNumber, nowIso } = require('./pipelineUtils');

const OUTPUT_DIR = process.env.EGYPT_PIPELINE_OUTPUT_DIR
    ? path.resolve(process.env.EGYPT_PIPELINE_OUTPUT_DIR)
    : path.resolve(__dirname, '../../logs/egypt_pipeline');

function buildRunId() {
    return new Date().toISOString().replace(/[.:]/g, '-');
}

async function loadStocks() {
    const stocks = await Stock.findAll({
        where: {
            is_active: true,
            is_egx: true
        },
        order: [['ticker', 'ASC']]
    });

    return stocks.map((stock) => {
        const row = stock.toJSON();
        const changePercent = safePercentChange(row.current_price, row.previous_close);

        return {
            id: row.id,
            ticker: row.ticker,
            name: row.name,
            name_ar: row.name_ar,
            sector: row.sector,
            current_price: toNumber(row.current_price, 0),
            previous_close: toNumber(row.previous_close, 0),
            open_price: toNumber(row.open_price, 0),
            high_price: toNumber(row.high_price, 0),
            low_price: toNumber(row.low_price, 0),
            volume: toNumber(row.volume, 0),
            compliance_status: row.compliance_status,
            last_update: row.last_update,
            change_percent: Number(changePercent.toFixed(4))
        };
    });
}

async function loadChartSeries(stockIds, maxPoints = 180) {
    if (!stockIds.length) {
        return {};
    }

    const rows = await StockPriceHistory.findAll({
        where: {
            stock_id: {
                [Op.in]: stockIds
            }
        },
        order: [['date', 'ASC']]
    });

    const byStock = {};

    for (const row of rows) {
        const data = row.toJSON();
        if (!byStock[data.stock_id]) {
            byStock[data.stock_id] = [];
        }

        byStock[data.stock_id].push({
            timestamp: data.date,
            open: toNumber(data.open_price, 0),
            high: toNumber(data.high_price, 0),
            low: toNumber(data.low_price, 0),
            close: toNumber(data.close_price, 0),
            volume: toNumber(data.volume, 0)
        });
    }

    const limited = {};
    for (const stockId of Object.keys(byStock)) {
        const points = byStock[stockId];
        limited[stockId] = points.slice(Math.max(0, points.length - maxPoints));
    }

    return limited;
}

async function loadIndices() {
    const rows = await MarketIndex.findAll({ order: [['symbol', 'ASC']] });
    return rows.map((row) => row.toJSON());
}

function formatForDisplay(stocks, chartSeries, indices, runId) {
    const sortedByChange = [...stocks].sort((a, b) => b.change_percent - a.change_percent);
    const sortedByVolume = [...stocks].sort((a, b) => b.volume - a.volume);

    const topGainers = sortedByChange.slice(0, 10);
    const topLosers = [...sortedByChange].reverse().slice(0, 10);
    const mostActive = sortedByVolume.slice(0, 10);

    const totalVolume = stocks.reduce((sum, stock) => sum + (stock.volume || 0), 0);

    return {
        run_id: runId,
        generated_at: nowIso(),
        market: 'EGX',
        scope: 'EGYPT_ONLY',
        summary: {
            stocks_count: stocks.length,
            indices_count: indices.length,
            total_volume: totalVolume,
            avg_change_percent: stocks.length
                ? Number((stocks.reduce((sum, stock) => sum + stock.change_percent, 0) / stocks.length).toFixed(4))
                : 0
        },
        tables: {
            stocks,
            top_gainers: topGainers,
            top_losers: topLosers,
            most_active: mostActive,
            indices
        },
        charts: {
            stock_ohlcv: chartSeries
        }
    };
}

async function runCollectionAndFormatting() {
    const runId = buildRunId();

    const stocks = await loadStocks();
    const stockIds = stocks.map((stock) => stock.id);
    const chartSeries = await loadChartSeries(stockIds);
    const indices = await loadIndices();

    const rawPayload = {
        run_id: runId,
        generated_at: nowIso(),
        market: 'EGX',
        scope: 'EGYPT_ONLY',
        stocks,
        chart_series: chartSeries,
        indices,
        gold: [],
        news: []
    };

    const displayPayload = formatForDisplay(stocks, chartSeries, indices, runId);

    const rawDir = path.join(OUTPUT_DIR, 'raw');
    const displayDir = path.join(OUTPUT_DIR, 'display');
    ensureDir(rawDir);
    ensureDir(displayDir);

    writeJson(path.join(rawDir, `market_raw_${runId}.json`), rawPayload);
    writeJson(path.join(rawDir, 'market_raw_latest.json'), rawPayload);
    writeJson(path.join(displayDir, `market_display_${runId}.json`), displayPayload);
    writeJson(path.join(displayDir, 'market_display_latest.json'), displayPayload);

    return {
        run_id: runId,
        output_dir: OUTPUT_DIR,
        stocks_count: stocks.length,
        chart_series_count: Object.keys(chartSeries).length,
        generated_at: displayPayload.generated_at
    };
}

if (require.main === module) {
    runCollectionAndFormatting()
        .then(async (result) => {
            console.log(JSON.stringify({ success: true, ...result }, null, 2));
            await sequelize.close();
            process.exit(0);
        })
        .catch(async (error) => {
            console.error(JSON.stringify({ success: false, error: error.message }, null, 2));
            await sequelize.close();
            process.exit(1);
        });
}

module.exports = {
    runCollectionAndFormatting
};
