require('dotenv').config();

const path = require('path');
const { sequelize } = require('../../backend/models');
const { writeJson, ensureDir, nowIso } = require('./pipelineUtils');
const { runCollectionAndFormatting } = require('./collectAndFormat');
const { runAnalysis } = require('./runAnalysis');

const OUTPUT_DIR = process.env.EGYPT_PIPELINE_OUTPUT_DIR
    ? path.resolve(process.env.EGYPT_PIPELINE_OUTPUT_DIR)
    : path.resolve(__dirname, '../../logs/egypt_pipeline');

const INTERVAL_SECONDS = Number(process.env.EGYPT_PIPELINE_INTERVAL_SECONDS || 900);
const RUN_ONCE = String(process.env.EGYPT_PIPELINE_RUN_ONCE || 'false').toLowerCase() === 'true';

let cycleCounter = 0;

async function executeCycle() {
    cycleCounter += 1;
    const startedAt = nowIso();

    try {
        const collectResult = await runCollectionAndFormatting();
        const analysisResult = await runAnalysis();

        const manifest = {
            cycle_number: cycleCounter,
            status: 'success',
            started_at: startedAt,
            completed_at: nowIso(),
            collect: collectResult,
            analysis: analysisResult
        };

        const stateDir = path.join(OUTPUT_DIR, 'state');
        ensureDir(stateDir);
        writeJson(path.join(stateDir, 'last_cycle.json'), manifest);

        console.log(JSON.stringify(manifest, null, 2));
    } catch (error) {
        const failure = {
            cycle_number: cycleCounter,
            status: 'failed',
            started_at: startedAt,
            completed_at: nowIso(),
            error: error.message
        };

        const stateDir = path.join(OUTPUT_DIR, 'state');
        ensureDir(stateDir);
        writeJson(path.join(stateDir, 'last_cycle.json'), failure);

        console.error(JSON.stringify(failure, null, 2));
    }
}

async function startLoop() {
    await executeCycle();

    if (RUN_ONCE) {
        await sequelize.close();
        process.exit(0);
    }

    const timerMs = Math.max(30, INTERVAL_SECONDS) * 1000;

    setInterval(() => {
        executeCycle().catch((error) => {
            console.error(JSON.stringify({ status: 'loop_error', error: error.message }, null, 2));
        });
    }, timerMs);
}

startLoop().catch(async (error) => {
    console.error(JSON.stringify({ status: 'startup_failed', error: error.message }, null, 2));
    await sequelize.close();
    process.exit(1);
});
