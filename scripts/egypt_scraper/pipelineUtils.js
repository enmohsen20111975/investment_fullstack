const fs = require('fs');
const path = require('path');

function ensureDir(dirPath) {
    if (!fs.existsSync(dirPath)) {
        fs.mkdirSync(dirPath, { recursive: true });
    }
}

function writeJson(filePath, data) {
    ensureDir(path.dirname(filePath));
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf8');
}

function toNumber(value, fallback = null) {
    const num = Number(value);
    return Number.isFinite(num) ? num : fallback;
}

function safePercentChange(currentPrice, previousClose) {
    const current = toNumber(currentPrice, 0);
    const previous = toNumber(previousClose, 0);

    if (!previous) {
        return 0;
    }

    return ((current - previous) / previous) * 100;
}

function nowIso() {
    return new Date().toISOString();
}

module.exports = {
    ensureDir,
    writeJson,
    toNumber,
    safePercentChange,
    nowIso
};
