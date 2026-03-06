const toNumber = (value, fallback = 0) => {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : fallback;
};

const normalizeHistoryPoint = (item) => ({
    date: item.date || item.datetime,
    open: toNumber(item.open ?? item.open_price),
    high: toNumber(item.high ?? item.high_price),
    low: toNumber(item.low ?? item.low_price),
    close: toNumber(item.close ?? item.close_price),
    volume: toNumber(item.volume)
});

export function normalizeHistoryPayload(payload) {
    if (!payload) {
        return { success: false, data: [], summary: {} };
    }

    const rawData = Array.isArray(payload.data)
        ? payload.data
        : Array.isArray(payload.history)
            ? payload.history
            : [];

    const data = rawData
        .map(normalizeHistoryPoint)
        .filter((point) => point.date && point.close > 0);

    const closes = data.map((point) => point.close);
    const highs = data.map((point) => point.high || point.close);
    const lows = data.map((point) => point.low || point.close);

    const derivedSummary = data.length ? {
        high_price: Math.max(...highs),
        low_price: Math.min(...lows),
        avg_price: closes.reduce((sum, value) => sum + value, 0) / closes.length,
        price_change_percent: closes[0] ? ((closes[closes.length - 1] - closes[0]) / closes[0]) * 100 : 0
    } : {};

    return {
        success: payload.success !== false,
        data,
        summary: payload.summary || derivedSummary
    };
}

export function normalizeRecommendationPayload(payload) {
    if (!payload) {
        return { success: false };
    }

    if (payload.success) {
        return payload;
    }

    const action = (payload.recommendation || 'hold').toLowerCase();
    const actionMap = {
        buy: 'شراء',
        strong_buy: 'شراء قوي',
        hold: 'احتفاظ',
        sell: 'بيع',
        strong_sell: 'بيع قوي',
        avoid: 'تجنب'
    };

    const reasons = Array.isArray(payload.reasons) ? payload.reasons : [];

    return {
        success: true,
        recommendation: {
            action,
            action_ar: actionMap[action] || 'احتفاظ',
            confidence_score: toNumber(payload.confidence, 0.5),
            confidence_label: 'medium',
            confidence_label_ar: 'متوسطة',
            risk_level: payload.risk_level || 'medium',
            summary_ar: reasons[0] || 'تحليل مبدئي بناءً على البيانات المتاحة.',
            key_strengths: reasons.slice(0, 2).map((text) => ({ title: text, title_ar: text })),
            key_risks: reasons.slice(2, 4).map((text) => ({ title: text, title_ar: text })),
            score_breakdown: {
                total_score: toNumber(payload.confidence, 0.5) * 100,
                technical_score: 50,
                fundamental_score: 50,
                compliance_score: payload.compliance_status === 'halal' ? 100 : payload.compliance_status === 'haram' ? 10 : 60,
                risk_score: payload.risk_level === 'high' ? 75 : payload.risk_level === 'low' ? 35 : 55
            }
        },
        scores: {
            total_score: toNumber(payload.confidence, 0.5) * 100,
            technical_score: 50,
            fundamental_score: 50,
            compliance_score: payload.compliance_status === 'halal' ? 100 : payload.compliance_status === 'haram' ? 10 : 60,
            risk_score: payload.risk_level === 'high' ? 75 : payload.risk_level === 'low' ? 35 : 55
        },
        trend: { direction: 'sideways', direction_ar: 'عرضي', momentum_percent: 0 },
        data_quality: { quality: 'medium', history_points: 0 },
        key_strengths: reasons.slice(0, 2).map((text) => ({ title: text, title_ar: text })),
        key_risks: reasons.slice(2, 4).map((text) => ({ title: text, title_ar: text })),
        risk_level: payload.risk_level || 'medium',
        risk_level_ar: payload.risk_level === 'high' ? 'مرتفع' : payload.risk_level === 'low' ? 'منخفض' : 'متوسط'
    };
}
