const toNumber = (value, fallback = 0) => {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : fallback;
};

const normalizeHistory = (historyRows = []) => historyRows
    .map((row) => (row.toJSON ? row.toJSON() : row))
    .map((item) => ({
        date: item.date,
        open: toNumber(item.open_price ?? item.open),
        high: toNumber(item.high_price ?? item.high),
        low: toNumber(item.low_price ?? item.low),
        close: toNumber(item.close_price ?? item.close),
        volume: toNumber(item.volume)
    }))
    .filter((item) => item.close > 0);

const calculateHistorySummary = (history = []) => {
    if (!history.length) {
        return {
            high_price: null,
            low_price: null,
            avg_price: null,
            price_change_percent: null,
            avg_volume: null,
            volatility_percent: null
        };
    }

    const closes = history.map((item) => item.close);
    const highs = history.map((item) => item.high || item.close);
    const lows = history.map((item) => item.low || item.close);
    const avgPrice = closes.reduce((sum, value) => sum + value, 0) / closes.length;
    const avgVolume = history.reduce((sum, item) => sum + (item.volume || 0), 0) / history.length;

    const firstClose = closes[0];
    const lastClose = closes[closes.length - 1];
    const priceChangePercent = firstClose ? ((lastClose - firstClose) / firstClose) * 100 : 0;

    const variance = closes.reduce((sum, value) => sum + ((value - avgPrice) ** 2), 0) / closes.length;
    const volatilityPercent = avgPrice ? (Math.sqrt(variance) / avgPrice) * 100 : 0;

    return {
        high_price: Math.max(...highs),
        low_price: Math.min(...lows),
        avg_price: avgPrice,
        price_change_percent: priceChangePercent,
        avg_volume: avgVolume,
        volatility_percent: volatilityPercent
    };
};

const calculateTrend = (stock, history = []) => {
    if (!history.length) {
        return {
            direction: 'sideways',
            direction_ar: 'عرضي',
            momentum_percent: 0
        };
    }

    const firstClose = history[0].close;
    const lastClose = history[history.length - 1].close;
    const momentumPercent = firstClose ? ((lastClose - firstClose) / firstClose) * 100 : 0;

    const ma50 = toNumber(stock.ma_50, lastClose);
    const ma200 = toNumber(stock.ma_200, lastClose);

    let direction = 'sideways';
    let directionAr = 'عرضي';

    if (lastClose > ma50 && ma50 >= ma200) {
        direction = 'bullish';
        directionAr = 'صاعد';
    } else if (lastClose < ma50 && ma50 <= ma200) {
        direction = 'bearish';
        directionAr = 'هابط';
    }

    return {
        direction,
        direction_ar: directionAr,
        momentum_percent: momentumPercent
    };
};

const calculateScores = (stock, historySummary, trend) => {
    const pe = toNumber(stock.pe_ratio, 18);
    const pb = toNumber(stock.pb_ratio, 1.8);
    const roe = toNumber(stock.roe, 10);
    const debt = toNumber(stock.debt_to_equity, 0.7);
    const rsi = toNumber(stock.rsi, 50);

    const technical = Math.max(0, Math.min(100,
        50
        + (trend.direction === 'bullish' ? 15 : trend.direction === 'bearish' ? -15 : 0)
        + (trend.momentum_percent * 0.6)
        + (rsi >= 45 && rsi <= 65 ? 10 : 0)
        - (rsi > 75 ? 12 : 0)
        + (rsi < 30 ? 8 : 0)
    ));

    const fundamental = Math.max(0, Math.min(100,
        55
        + (roe * 1.2)
        - (Math.max(pe - 18, 0) * 1.1)
        - (Math.max(pb - 2.2, 0) * 6)
        - (Math.max(debt - 1.0, 0) * 10)
    ));

    const risk = Math.max(0, Math.min(100,
        45
        + (toNumber(historySummary.volatility_percent, 5) * 2.2)
        + (debt * 12)
        + (rsi > 80 || rsi < 20 ? 10 : 0)
    ));

    const total = Math.max(0, Math.min(100,
        (technical * 0.50)
        + (fundamental * 0.30)
        + ((100 - risk) * 0.20)
    ));

    return {
        total_score: total,
        technical_score: technical,
        fundamental_score: fundamental,
        risk_score: risk
    };
};

const resolveAction = (scores, stock) => {
    const total = toNumber(scores.total_score);

    if (total >= 78) return { action: 'strong_buy', action_ar: 'شراء قوي', confidence_label: 'high' };
    if (total >= 65) return { action: 'buy', action_ar: 'شراء', confidence_label: 'medium' };
    if (total >= 45) return { action: 'hold', action_ar: 'احتفاظ', confidence_label: 'medium' };
    if (total >= 30) return { action: 'sell', action_ar: 'بيع', confidence_label: 'medium' };
    return { action: 'strong_sell', action_ar: 'بيع قوي', confidence_label: 'high' };
};

const buildStrengthsAndRisks = (stock, trend, scores) => {
    const strengths = [];
    const risks = [];

    if (trend.direction === 'bullish') strengths.push({ title: 'Bullish trend', title_ar: 'اتجاه سعري صاعد' });
    if (toNumber(stock.roe) >= 12) strengths.push({ title: 'Strong profitability', title_ar: 'ربحية قوية' });
    if (toNumber(stock.debt_to_equity) <= 0.8) strengths.push({ title: 'Low leverage', title_ar: 'مستوى مديونية منخفض' });

    if (toNumber(stock.rsi) > 75) risks.push({ title: 'Overbought RSI', title_ar: 'تشبع شرائي مرتفع (RSI)' });
    if (toNumber(stock.debt_to_equity) > 1.2) risks.push({ title: 'High debt ratio', title_ar: 'نسبة مديونية مرتفعة' });
    if (trend.direction === 'bearish') risks.push({ title: 'Bearish trend', title_ar: 'اتجاه سعري هابط' });
    if (scores.risk_score > 65) risks.push({ title: 'Elevated volatility risk', title_ar: 'مخاطر تذبذب مرتفعة' });

    if (!strengths.length) strengths.push({ title: 'Balanced valuation profile', title_ar: 'تقييم متوازن نسبيًا' });
    if (!risks.length) risks.push({ title: 'Market sentiment uncertainty', title_ar: 'عدم يقين في معنويات السوق' });

    return { strengths: strengths.slice(0, 4), risks: risks.slice(0, 4) };
};

const buildDeepAnalysisPayload = ({ stock, history, latestInsight }) => {
    const historySummary = calculateHistorySummary(history);
    const trend = calculateTrend(stock, history);
    const scores = calculateScores(stock, historySummary, trend);
    const actionMeta = resolveAction(scores, stock);

    const support = toNumber(stock.support_level, historySummary.low_price || stock.current_price);
    const resistance = toNumber(stock.resistance_level, historySummary.high_price || stock.current_price);
    const currentPrice = toNumber(stock.current_price);
    const targetPrice = currentPrice + ((resistance - support) * 0.35);
    const upsidePercent = currentPrice ? ((targetPrice - currentPrice) / currentPrice) * 100 : 0;

    const confidenceScore = Math.max(0.35, Math.min(0.95, toNumber(scores.total_score) / 100));
    const riskLevel = scores.risk_score > 70 ? 'high' : scores.risk_score > 45 ? 'medium' : 'low';
    const riskLevelAr = riskLevel === 'high' ? 'مرتفع' : riskLevel === 'medium' ? 'متوسط' : 'منخفض';

    const { strengths, risks } = buildStrengthsAndRisks(stock, trend, scores);

    let insights = null;
    if (latestInsight?.insights_payload) {
        try {
            insights = JSON.parse(latestInsight.insights_payload);
        } catch (error) {
            insights = null;
        }
    }

    const recommendation = {
        action: actionMeta.action,
        action_ar: actionMeta.action_ar,
        confidence: confidenceScore,
        confidence_score: confidenceScore,
        confidence_label: actionMeta.confidence_label,
        confidence_label_ar: actionMeta.confidence_label === 'high' ? 'عالية' : 'متوسطة',
        target_price: targetPrice,
        upside_potential: upsidePercent,
        risk_level: riskLevel,
        summary_ar: `التقييم الفني والمالي يشير إلى ${actionMeta.action_ar} مع درجة ثقة ${Math.round(confidenceScore * 100)}%.`,
        key_strengths: strengths,
        key_risks: risks,
        score_breakdown: scores
    };

    return {
        success: true,
        ticker: stock.ticker,
        recommendation,
        scores,
        trend,
        data_quality: {
            history_points: history.length,
            has_technical_indicators: Boolean(stock.ma_50 || stock.ma_200 || stock.rsi),
            has_fundamental_metrics: Boolean(stock.pe_ratio || stock.pb_ratio || stock.roe),
            quality: history.length >= 30 ? 'high' : history.length >= 10 ? 'medium' : 'low'
        },
        target_price: targetPrice,
        upside_percent: upsidePercent,
        downside_percent: currentPrice ? ((support - currentPrice) / currentPrice) * 100 : 0,
        price_range: {
            support,
            resistance
        },
        key_strengths: strengths,
        key_risks: risks,
        risk_level: riskLevel,
        risk_level_ar: riskLevelAr,
        insights,
        generated_at: new Date().toISOString()
    };
};

module.exports = {
    normalizeHistory,
    calculateHistorySummary,
    buildDeepAnalysisPayload
};
