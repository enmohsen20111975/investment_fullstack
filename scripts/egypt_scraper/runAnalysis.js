require('dotenv').config();

const path = require('path');
const { sequelize, Stock, StockPriceHistory } = require('../../backend/models');
const { normalizeHistory, buildDeepAnalysisPayload } = require('../../backend/services/deepAnalysisService');
const { ensureDir, writeJson, nowIso } = require('./pipelineUtils');

const OUTPUT_DIR = process.env.EGYPT_PIPELINE_OUTPUT_DIR
    ? path.resolve(process.env.EGYPT_PIPELINE_OUTPUT_DIR)
    : path.resolve(__dirname, '../../logs/egypt_pipeline');

function buildRunId() {
    return new Date().toISOString().replace(/[.:]/g, '-');
}

async function loadStockHistory(stockId, days = 120) {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    const historyRows = await StockPriceHistory.findAll({
        where: {
            stock_id: stockId,
            date: {
                [require('sequelize').Op.gte]: startDate
            }
        },
        order: [['date', 'ASC']]
    });

    return normalizeHistory(historyRows);
}

async function runAnalysis() {
    const runId = buildRunId();

    const stocks = await Stock.findAll({
        where: {
            is_active: true,
            is_egx: true
        },
        order: [['ticker', 'ASC']]
    });

    const analyses = [];

    for (const stock of stocks) {
        const history = await loadStockHistory(stock.id, 180);
        const payload = buildDeepAnalysisPayload({
            stock: stock.toJSON(),
            history,
            latestInsight: null
        });

        analyses.push(payload);
    }

    analyses.sort((a, b) => (b?.scores?.total_score || 0) - (a?.scores?.total_score || 0));

    const analysisPayload = {
        run_id: runId,
        generated_at: nowIso(),
        market: 'EGX',
        scope: 'EGYPT_ONLY',
        summary: {
            stocks_analyzed: analyses.length,
            avg_total_score: analyses.length
                ? Number((analyses.reduce((sum, item) => sum + (item?.scores?.total_score || 0), 0) / analyses.length).toFixed(4))
                : 0,
            strong_buy_count: analyses.filter((item) => item?.recommendation?.action === 'strong_buy').length,
            buy_count: analyses.filter((item) => item?.recommendation?.action === 'buy').length,
            hold_count: analyses.filter((item) => item?.recommendation?.action === 'hold').length,
            sell_count: analyses.filter((item) => item?.recommendation?.action === 'sell').length,
            strong_sell_count: analyses.filter((item) => item?.recommendation?.action === 'strong_sell').length
        },
        leaderboard: {
            top_opportunities: analyses.slice(0, 20),
            highest_risk: [...analyses]
                .sort((a, b) => (b?.scores?.risk_score || 0) - (a?.scores?.risk_score || 0))
                .slice(0, 20)
        },
        items: analyses
    };

    const analysisDir = path.join(OUTPUT_DIR, 'analysis');
    ensureDir(analysisDir);

    writeJson(path.join(analysisDir, `analysis_${runId}.json`), analysisPayload);
    writeJson(path.join(analysisDir, 'analysis_latest.json'), analysisPayload);

    return {
        run_id: runId,
        output_dir: OUTPUT_DIR,
        analyzed_count: analyses.length,
        generated_at: analysisPayload.generated_at
    };
}

if (require.main === module) {
    runAnalysis()
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
    runAnalysis
};
