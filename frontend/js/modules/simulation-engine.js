/**
 * محرك المحاكاة الحية
 * Live Simulation Engine for Learning Center
 * يوفر محاكاة حية للسوق مع بيانات واقعية
 */

import { learningStateV2, simulationStocks, marketScenarios } from './learning-v2.js';

// ============================================
// حالة المحاكاة الحية
// ============================================
class LiveSimulationEngine {
    constructor() {
        this.isRunning = false;
        this.speed = 1; // 1x, 2x, 5x, 10x
        this.currentScenario = 'sideways';
        this.prices = {};
        this.priceHistory = {};
        this.volumes = {};
        this.orderBook = {};
        this.news = [];
        this.events = [];
        this.updateInterval = null;
        this.tickCounter = 0;
        
        // تهيئة الأسعار
        this.initializePrices();
    }
    
    /**
     * تهيئة الأسعار الأولية
     */
    initializePrices() {
        Object.keys(simulationStocks).forEach(ticker => {
            const stock = simulationStocks[ticker];
            this.prices[ticker] = {
                current: stock.basePrice,
                open: stock.basePrice,
                high: stock.basePrice,
                low: stock.basePrice,
                previousClose: stock.basePrice,
                bid: stock.basePrice * 0.998,
                ask: stock.basePrice * 1.002,
                change: 0,
                changePercent: 0
            };
            
            this.priceHistory[ticker] = this.generateInitialHistory(ticker);
            this.volumes[ticker] = {
                today: Math.floor(Math.random() * 1000000) + 100000,
                average: Math.floor(Math.random() * 800000) + 200000
            };
            
            this.orderBook[ticker] = this.generateOrderBook(ticker);
        });
    }
    
    /**
     * توليد تاريخ أسعار أولي
     */
    generateInitialHistory(ticker) {
        const stock = simulationStocks[ticker];
        const history = [];
        let price = stock.basePrice * 0.9; // ابدأ من 90% من السعر الأساسي
        
        // توليد 100 شمعة سابقة
        for (let i = 0; i < 100; i++) {
            const volatility = stock.volatility;
            const change = (Math.random() - 0.48) * volatility * price; // ميل بسيط للصعود
            
            const open = price;
            const close = price + change;
            const high = Math.max(open, close) + Math.random() * volatility * price * 0.5;
            const low = Math.min(open, close) - Math.random() * volatility * price * 0.5;
            const volume = Math.floor(Math.random() * 1000000) + 100000;
            
            history.push({
                time: new Date(Date.now() - (100 - i) * 60000 * 5), // كل شمعة 5 دقائق
                open: parseFloat(open.toFixed(2)),
                high: parseFloat(high.toFixed(2)),
                low: parseFloat(low.toFixed(2)),
                close: parseFloat(close.toFixed(2)),
                volume
            });
            
            price = close;
        }
        
        return history;
    }
    
    /**
     * توليد دفتر الأوامر
     */
    generateOrderBook(ticker) {
        const price = this.prices[ticker]?.current || simulationStocks[ticker].basePrice;
        const book = {
            bids: [], // أوامر الشراء
            asks: []  // أوامر البيع
        };
        
        // توليد 5 مستويات للشراء
        for (let i = 0; i < 5; i++) {
            book.bids.push({
                price: parseFloat((price * (1 - 0.001 * (i + 1))).toFixed(2)),
                quantity: Math.floor(Math.random() * 10000) + 100,
                orders: Math.floor(Math.random() * 20) + 1
            });
        }
        
        // توليد 5 مستويات للبيع
        for (let i = 0; i < 5; i++) {
            book.asks.push({
                price: parseFloat((price * (1 + 0.001 * (i + 1))).toFixed(2)),
                quantity: Math.floor(Math.random() * 10000) + 100,
                orders: Math.floor(Math.random() * 20) + 1
            });
        }
        
        return book;
    }
    
    /**
     * بدء المحاكاة
     */
    start(scenario = 'sideways', speed = 1) {
        if (this.isRunning) return;
        
        this.isRunning = true;
        this.currentScenario = scenario;
        this.speed = speed;
        
        const scenarioConfig = marketScenarios[scenario];
        const intervalMs = 1000 / speed; // تحديث كل ثانية
        
        this.updateInterval = setInterval(() => {
            this.tick(scenarioConfig);
        }, intervalMs);
        
        this.addEvent('بدء المحاكاة', `تم بدء المحاكاة بسيناريو: ${scenarioConfig.name}`);
        
        return {
            status: 'running',
            scenario: scenarioConfig.name,
            speed
        };
    }
    
    /**
     * إيقاف المحاكاة
     */
    stop() {
        if (!this.isRunning) return;
        
        clearInterval(this.updateInterval);
        this.isRunning = false;
        
        this.addEvent('إيقاف المحاكاة', 'تم إيقاف المحاكاة');
        
        return { status: 'stopped' };
    }
    
    /**
     * تغيير السيناريو
     */
    changeScenario(scenario) {
        if (!marketScenarios[scenario]) {
            throw new Error(`سيناريو غير معروف: ${scenario}`);
        }
        
        this.currentScenario = scenario;
        this.addEvent('تغيير السيناريو', `تم تغيير السيناريو إلى: ${marketScenarios[scenario].name}`);
        
        return marketScenarios[scenario];
    }
    
    /**
     * تغيير السرعة
     */
    changeSpeed(speed) {
        this.speed = speed;
        
        if (this.isRunning) {
            clearInterval(this.updateInterval);
            const intervalMs = 1000 / speed;
            this.updateInterval = setInterval(() => {
                this.tick(marketScenarios[this.currentScenario]);
            }, intervalMs);
        }
        
        return { speed };
    }
    
    /**
     * التحديث الرئيسي (Tick)
     */
    tick(scenarioConfig) {
        this.tickCounter++;
        
        const simConfig = scenarioConfig.simulation;
        
        Object.keys(simulationStocks).forEach(ticker => {
            const stock = simulationStocks[ticker];
            const currentPrice = this.prices[ticker].current;
            
            // حساب التغير الجديد
            const trendComponent = simConfig.trendBias * 0.001 * stock.beta;
            const randomComponent = (Math.random() - 0.5) * 2 * simConfig.volatility * stock.beta;
            const change = currentPrice * (trendComponent + randomComponent);
            
            const newPrice = Math.max(currentPrice + change, 0.01);
            
            // تحديث السعر
            this.updatePrice(ticker, newPrice, simConfig.volumeMultiplier);
        });
        
        // إضافة شمعة جديدة كل 12 تحديث (دقيقة واحدة في السرعة العادية)
        if (this.tickCounter % Math.floor(12 / this.speed) === 0) {
            this.addNewCandle();
        }
        
        // توليد أخبار عشوائية
        if (this.tickCounter % 60 === 0) {
            this.generateNews();
        }
        
        // تحديث دفتر الأوامر
        if (this.tickCounter % 5 === 0) {
            Object.keys(simulationStocks).forEach(ticker => {
                this.orderBook[ticker] = this.generateOrderBook(ticker);
            });
        }
    }
    
    /**
     * تحديث السعر
     */
    updatePrice(ticker, newPrice, volumeMultiplier) {
        const priceData = this.prices[ticker];
        const oldPrice = priceData.current;
        
        priceData.previousClose = priceData.open;
        priceData.current = parseFloat(newPrice.toFixed(2));
        priceData.high = Math.max(priceData.high, priceData.current);
        priceData.low = Math.min(priceData.low, priceData.current);
        priceData.change = priceData.current - priceData.open;
        priceData.changePercent = ((priceData.change / priceData.open) * 100);
        priceData.bid = priceData.current * 0.998;
        priceData.ask = priceData.current * 1.002;
        
        // تحديث الحجم
        this.volumes[ticker].today += Math.floor(Math.random() * 1000 * volumeMultiplier);
    }
    
    /**
     * إضافة شمعة جديدة
     */
    addNewCandle() {
        Object.keys(simulationStocks).forEach(ticker => {
            const priceData = this.prices[ticker];
            const lastCandle = this.priceHistory[ticker][this.priceHistory[ticker].length - 1];
            
            const newCandle = {
                time: new Date(),
                open: lastCandle ? lastCandle.close : priceData.open,
                high: priceData.high,
                low: priceData.low,
                close: priceData.current,
                volume: this.volumes[ticker].today - (lastCandle ? lastCandle.volume : 0)
            };
            
            this.priceHistory[ticker].push(newCandle);
            
            // الاحتفاظ بآخر 500 شمعة فقط
            if (this.priceHistory[ticker].length > 500) {
                this.priceHistory[ticker].shift();
            }
            
            // إعادة تعيين High/Low للشمعة الجديدة
            priceData.open = priceData.current;
            priceData.high = priceData.current;
            priceData.low = priceData.current;
        });
    }
    
    /**
     * توليد أخبار عشوائية
     */
    generateNews() {
        const newsTemplates = [
            { text: 'تقارير تشير إلى نمو قطاع {sector}', impact: 'positive' },
            { text: 'تحذيرات من تباطؤ الاقتصاد العالمي', impact: 'negative' },
            { text: 'البنك المركزي يقرر ثبات أسعار الفائدة', impact: 'neutral' },
            { text: 'شركة {company} تعلن عن نتائج ربع سنوية أفضل من المتوقع', impact: 'positive' },
            { text: 'تراجع الطلب على قطاع {sector}', impact: 'negative' },
            { text: 'استثمارات أجنبية جديدة في البورصة المصرية', impact: 'positive' },
            { text: 'تقلبات في أسعار الصرف تؤثر على السوق', impact: 'neutral' },
            { text: 'توقعات بتحسن الأداء الاقتصادي في الربع القادم', impact: 'positive' }
        ];
        
        const sectors = ['البنوك', 'الاتصالات', 'الصناعة', 'العقارات', 'الطاقة'];
        const companies = Object.keys(simulationStocks);
        
        const template = newsTemplates[Math.floor(Math.random() * newsTemplates.length)];
        let text = template.text
            .replace('{sector}', sectors[Math.floor(Math.random() * sectors.length)])
            .replace('{company}', companies[Math.floor(Math.random() * companies.length)]);
        
        this.news.unshift({
            id: Date.now(),
            text,
            impact: template.impact,
            time: new Date()
        });
        
        // الاحتفاظ بآخر 20 خبر فقط
        if (this.news.length > 20) {
            this.news.pop();
        }
    }
    
    /**
     * إضافة حدث
     */
    addEvent(type, description) {
        this.events.unshift({
            id: Date.now(),
            type,
            description,
            time: new Date()
        });
        
        if (this.events.length > 50) {
            this.events.pop();
        }
    }
    
    /**
     * الحصول على بيانات السهم
     */
    getStockData(ticker) {
        if (!simulationStocks[ticker]) return null;
        
        return {
            info: simulationStocks[ticker],
            price: this.prices[ticker],
            history: this.priceHistory[ticker],
            volume: this.volumes[ticker],
            orderBook: this.orderBook[ticker]
        };
    }
    
    /**
     * الحصول على جميع الأسعار
     */
    getAllPrices() {
        const result = {};
        Object.keys(this.prices).forEach(ticker => {
            result[ticker] = {
                ...this.prices[ticker],
                name: simulationStocks[ticker].name,
                sector: simulationStocks[ticker].sector
            };
        });
        return result;
    }
    
    /**
     * تنفيذ أمر تداول (للمحاكاة)
     */
    executeOrder(order) {
        const { ticker, type, quantity, price, orderType } = order;
        
        if (!simulationStocks[ticker]) {
            return { success: false, error: 'سهم غير موجود' };
        }
        
        const currentPrice = this.prices[ticker].current;
        const executionPrice = orderType === 'market' ? currentPrice : price;
        
        if (type === 'buy') {
            const totalCost = executionPrice * quantity;
            
            if (totalCost > learningStateV2.simulation.balance) {
                return { success: false, error: 'رصيد غير كافي' };
            }
            
            // تنفيذ الشراء
            learningStateV2.simulation.balance -= totalCost;
            
            const existing = learningStateV2.simulation.portfolio.find(p => p.ticker === ticker);
            if (existing) {
                const totalShares = existing.shares + quantity;
                existing.avgPrice = ((existing.avgPrice * existing.shares) + totalCost) / totalShares;
                existing.shares = totalShares;
            } else {
                learningStateV2.simulation.portfolio.push({
                    ticker,
                    shares: quantity,
                    avgPrice: executionPrice
                });
            }
            
            this.addTransaction('شراء', ticker, quantity, executionPrice, totalCost);
            
            return {
                success: true,
                order: {
                    type: 'buy',
                    ticker,
                    quantity,
                    price: executionPrice,
                    total: totalCost,
                    time: new Date()
                }
            };
        } else {
            // بيع
            const holding = learningStateV2.simulation.portfolio.find(p => p.ticker === ticker);
            
            if (!holding || holding.shares < quantity) {
                return { success: false, error: 'لا تملك هذا القدر من الأسهم' };
            }
            
            const totalValue = executionPrice * quantity;
            
            holding.shares -= quantity;
            learningStateV2.simulation.balance += totalValue;
            
            if (holding.shares === 0) {
                learningStateV2.simulation.portfolio = learningStateV2.simulation.portfolio.filter(p => p.ticker !== ticker);
            }
            
            this.addTransaction('بيع', ticker, quantity, executionPrice, totalValue);
            
            return {
                success: true,
                order: {
                    type: 'sell',
                    ticker,
                    quantity,
                    price: executionPrice,
                    total: totalValue,
                    time: new Date()
                }
            };
        }
    }
    
    /**
     * إضافة معاملة للسجل
     */
    addTransaction(type, ticker, shares, price, total) {
        learningStateV2.simulation.transactions.unshift({
            id: Date.now(),
            type,
            ticker,
            shares,
            price,
            total,
            time: new Date()
        });
        
        learningStateV2.stats.totalTrades++;
    }
    
    /**
     * حساب قيمة المحفظة
     */
    calculatePortfolioValue() {
        const portfolioValue = learningStateV2.simulation.portfolio.reduce((sum, holding) => {
            const currentPrice = this.prices[holding.ticker]?.current || 0;
            return sum + (holding.shares * currentPrice);
        }, 0);
        
        return {
            cash: learningStateV2.simulation.balance,
            portfolio: portfolioValue,
            total: learningStateV2.simulation.balance + portfolioValue,
            profitLoss: (learningStateV2.simulation.balance + portfolioValue) - learningStateV2.simulation.initialBalance,
            profitLossPercent: (((learningStateV2.simulation.balance + portfolioValue) - learningStateV2.simulation.initialBalance) / learningStateV2.simulation.initialBalance) * 100
        };
    }
    
    /**
     * الحصول على تاريخ الأسعار بتنسيق الرسم البياني
     */
    getChartData(ticker, timeframe = '1H') {
        const history = this.priceHistory[ticker];
        if (!history) return [];
        
        // تحديد عدد الشموع حسب الإطار الزمني
        const candleCounts = {
            '5M': 60,
            '15M': 60,
            '1H': 48,
            '4H': 30,
            '1D': 30,
            '1W': 20
        };
        
        const count = candleCounts[timeframe] || 60;
        return history.slice(-count);
    }
    
    /**
     * حساب المؤشرات الفنية
     */
    calculateIndicators(ticker) {
        const history = this.priceHistory[ticker];
        if (!history || history.length < 20) return null;
        
        const closes = history.map(c => c.close);
        const currentPrice = closes[closes.length - 1];
        
        // SMA
        const sma20 = this.calculateSMA(closes, 20);
        const sma50 = this.calculateSMA(closes, Math.min(50, closes.length));
        
        // EMA
        const ema12 = this.calculateEMA(closes, 12);
        const ema26 = this.calculateEMA(closes, 26);
        
        // RSI
        const rsi = this.calculateRSI(closes, 14);
        
        // MACD
        const macd = ema12 - ema26;
        const signal = this.calculateEMA([macd], 9); // مبسط
        
        // Bollinger Bands
        const bb = this.calculateBollingerBands(closes, 20, 2);
        
        // تحديد الاتجاه
        let trend = 'neutral';
        if (currentPrice > sma20 && sma20 > sma50) trend = 'bullish';
        else if (currentPrice < sma20 && sma20 < sma50) trend = 'bearish';
        
        return {
            price: currentPrice,
            sma: { sma20, sma50 },
            ema: { ema12, ema26 },
            rsi,
            macd: { macd, signal, histogram: macd - signal },
            bollingerBands: bb,
            trend,
            signals: {
                smaCross: sma20 > sma50 ? 'bullish' : 'bearish',
                rsiOverbought: rsi > 70,
                rsiOversold: rsi < 30,
                macdCross: macd > signal ? 'bullish' : 'bearish'
            }
        };
    }
    
    /**
     * حساب المتوسط المتحرك البسيط
     */
    calculateSMA(data, period) {
        if (data.length < period) return null;
        const slice = data.slice(-period);
        return slice.reduce((a, b) => a + b, 0) / period;
    }
    
    /**
     * حساب المتوسط المتحرك الأسي
     */
    calculateEMA(data, period) {
        if (data.length < period) return null;
        
        const multiplier = 2 / (period + 1);
        let ema = data.slice(0, period).reduce((a, b) => a + b, 0) / period;
        
        for (let i = period; i < data.length; i++) {
            ema = (data[i] * multiplier) + (ema * (1 - multiplier));
        }
        
        return ema;
    }
    
    /**
     * حساب مؤشر القوة النسبية
     */
    calculateRSI(data, period = 14) {
        if (data.length < period + 1) return null;
        
        let gains = 0;
        let losses = 0;
        
        for (let i = data.length - period; i < data.length; i++) {
            const change = data[i] - data[i - 1];
            if (change > 0) gains += change;
            else losses -= change;
        }
        
        const avgGain = gains / period;
        const avgLoss = losses / period;
        
        if (avgLoss === 0) return 100;
        
        const rs = avgGain / avgLoss;
        return 100 - (100 / (1 + rs));
    }
    
    /**
     * حساب نطاقات بولينجر
     */
    calculateBollingerBands(data, period = 20, stdDev = 2) {
        if (data.length < period) return null;
        
        const slice = data.slice(-period);
        const sma = slice.reduce((a, b) => a + b, 0) / period;
        
        const squaredDiffs = slice.map(value => Math.pow(value - sma, 2));
        const variance = squaredDiffs.reduce((a, b) => a + b, 0) / period;
        const std = Math.sqrt(variance);
        
        return {
            middle: sma,
            upper: sma + (stdDev * std),
            lower: sma - (stdDev * std),
            bandwidth: ((sma + (stdDev * std)) - (sma - (stdDev * std))) / sma * 100
        };
    }
    
    /**
     * اكتشاف أنماط الشموع
     */
    detectCandlePatterns(ticker) {
        const history = this.priceHistory[ticker];
        if (!history || history.length < 5) return [];
        
        const patterns = [];
        const last5 = history.slice(-5);
        
        // فحص آخر شمعة للأنماط المفردة
        const last = last5[last5.length - 1];
        const bodySize = Math.abs(last.close - last.open);
        const upperShadow = last.high - Math.max(last.open, last.close);
        const lowerShadow = Math.min(last.open, last.close) - last.low;
        const totalRange = last.high - last.low;
        
        // Doji
        if (bodySize < totalRange * 0.1) {
            patterns.push({ name: 'Doji', type: 'continuation', strength: 50 });
        }
        
        // Hammer
        if (lowerShadow > bodySize * 2 && upperShadow < bodySize * 0.5) {
            patterns.push({ name: 'Hammer', type: 'bullish', strength: 70 });
        }
        
        // Shooting Star
        if (upperShadow > bodySize * 2 && lowerShadow < bodySize * 0.5) {
            patterns.push({ name: 'Shooting Star', type: 'bearish', strength: 70 });
        }
        
        // فحص أنماط الشمعتين
        if (last5.length >= 2) {
            const prev = last5[last5.length - 2];
            
            // Bullish Engulfing
            if (prev.close < prev.open && last.close > last.open &&
                last.open < prev.close && last.close > prev.open) {
                patterns.push({ name: 'Bullish Engulfing', type: 'bullish', strength: 85 });
            }
            
            // Bearish Engulfing
            if (prev.close > prev.open && last.close < last.open &&
                last.open > prev.close && last.close < prev.open) {
                patterns.push({ name: 'Bearish Engulfing', type: 'bearish', strength: 85 });
            }
        }
        
        // فحص أنماط الثلاث شموع
        if (last5.length >= 3) {
            const candle1 = last5[last5.length - 3];
            const candle2 = last5[last5.length - 2];
            const candle3 = last5[last5.length - 1];
            
            // Three White Soldiers
            if (candle1.close > candle1.open &&
                candle2.close > candle2.open &&
                candle3.close > candle3.open &&
                candle2.close > candle1.close &&
                candle3.close > candle2.close) {
                patterns.push({ name: 'Three White Soldiers', type: 'bullish', strength: 85 });
            }
            
            // Three Black Crows
            if (candle1.close < candle1.open &&
                candle2.close < candle2.open &&
                candle3.close < candle3.open &&
                candle2.close < candle1.close &&
                candle3.close < candle2.close) {
                patterns.push({ name: 'Three Black Crows', type: 'bearish', strength: 85 });
            }
        }
        
        return patterns;
    }
}

// إنشاء مثيل واحد للمحرك
const simulationEngine = new LiveSimulationEngine();

export { LiveSimulationEngine, simulationEngine };
