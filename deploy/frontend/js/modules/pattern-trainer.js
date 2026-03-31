/**
 * مدرب أنماط الشموع اليابانية
 * Candlestick Pattern Recognition Trainer
 * نظام تدريب تفاعلي للتعرف على أنماط الشموع
 */

import { 
    candlestickPatterns,
    learningStateV2,
    addXP
} from './learning-v2.js';

// ============================================
// حالة المدرب
// ============================================
const trainerState = {
    currentPattern: null,
    score: 0,
    streak: 0,
    bestStreak: 0,
    totalAttempts: 0,
    correctAnswers: 0,
    difficulty: 'beginner', // beginner, intermediate, advanced
    category: 'all', // all, bullish, bearish, continuation
    patternsSeen: [],
    hintsUsed: 0,
    timeLimit: 30,
    timeRemaining: 30,
    timerInterval: null
};

// ============================================
// واجهة المدرب
// ============================================

/**
 * عرض واجهة المدرب
 */
function renderPatternTrainer() {
    return `
        <div class="pattern-trainer bg-gray-50 min-h-screen p-6" dir="rtl">
            <!-- Header -->
            <div class="bg-white rounded-xl p-6 shadow-sm mb-6">
                <div class="flex items-center justify-between">
                    <div>
                        <h2 class="text-2xl font-bold">مدرب أنماط الشموع</h2>
                        <p class="text-gray-500">تدرب على التعرف على أنماط الشموع اليابانية</p>
                    </div>
                    <div class="flex items-center gap-6">
                        <div class="text-center">
                            <div class="text-3xl font-bold text-green-600">${trainerState.score}</div>
                            <div class="text-sm text-gray-500">النقاط</div>
                        </div>
                        <div class="text-center">
                            <div class="text-3xl font-bold text-orange-500">${trainerState.streak}🔥</div>
                            <div class="text-sm text-gray-500">السلسلة</div>
                        </div>
                        <div class="text-center">
                            <div class="text-3xl font-bold text-blue-600">${Math.round((trainerState.correctAnswers / Math.max(trainerState.totalAttempts, 1)) * 100)}%</div>
                            <div class="text-sm text-gray-500">الدقة</div>
                        </div>
                    </div>
                </div>
            </div>
            
            <!-- Settings -->
            <div class="bg-white rounded-xl p-4 shadow-sm mb-6">
                <div class="flex flex-wrap items-center gap-4">
                    <div>
                        <label class="text-sm text-gray-500">المستوى:</label>
                        <select id="trainerDifficulty" class="border rounded-lg px-3 py-1 mr-2">
                            <option value="beginner" ${trainerState.difficulty === 'beginner' ? 'selected' : ''}>مبتدئ</option>
                            <option value="intermediate" ${trainerState.difficulty === 'intermediate' ? 'selected' : ''}>متوسط</option>
                            <option value="advanced" ${trainerState.difficulty === 'advanced' ? 'selected' : ''}>متقدم</option>
                        </select>
                    </div>
                    <div>
                        <label class="text-sm text-gray-500">الفئة:</label>
                        <select id="trainerCategory" class="border rounded-lg px-3 py-1 mr-2">
                            <option value="all" ${trainerState.category === 'all' ? 'selected' : ''}>الكل</option>
                            <option value="bullish" ${trainerState.category === 'bullish' ? 'selected' : ''}>صعودية</option>
                            <option value="bearish" ${trainerState.category === 'bearish' ? 'selected' : ''}>هبوطية</option>
                            <option value="continuation" ${trainerState.category === 'continuation' ? 'selected' : ''}>استمرار</option>
                        </select>
                    </div>
                    <button id="startTrainingBtn" class="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
                        <i class="fas fa-play ml-1"></i>ابدأ التدريب
                    </button>
                </div>
            </div>
            
            <!-- Training Area -->
            <div class="grid lg:grid-cols-3 gap-6">
                <!-- Pattern Display -->
                <div class="lg:col-span-2">
                    <div class="bg-white rounded-xl shadow-sm overflow-hidden">
                        <div class="p-4 border-b flex items-center justify-between">
                            <h3 class="font-bold">النمط الحالي</h3>
                            <div id="timerDisplay" class="text-lg font-bold text-gray-400">
                                <i class="fas fa-clock ml-1"></i>
                                <span id="timeRemaining">${trainerState.timeLimit}</span>s
                            </div>
                        </div>
                        
                        <div id="patternDisplayArea" class="p-8 min-h-96 bg-gray-50 flex items-center justify-center">
                            <div class="text-center text-gray-400">
                                <i class="fas fa-candlestick-chart text-6xl mb-4"></i>
                                <p class="text-lg">اضغط "ابدأ التدريب" للبدء</p>
                            </div>
                        </div>
                        
                        <!-- Hint -->
                        <div id="hintArea" class="p-4 bg-yellow-50 border-t hidden">
                            <div class="flex items-center gap-2 text-yellow-700">
                                <i class="fas fa-lightbulb"></i>
                                <span id="hintText"></span>
                            </div>
                        </div>
                    </div>
                </div>
                
                <!-- Answer Panel -->
                <div class="space-y-4">
                    <!-- Pattern Options -->
                    <div class="bg-white rounded-xl p-4 shadow-sm">
                        <h4 class="font-bold mb-4">اختر النمط الصحيح</h4>
                        <div id="patternOptions" class="space-y-2">
                            <!-- Options will be rendered here -->
                        </div>
                        
                        <div class="mt-4 flex gap-2">
                            <button id="hintBtn" class="flex-1 py-2 border rounded-lg hover:bg-gray-50 text-gray-600">
                                <i class="fas fa-lightbulb ml-1"></i>تلميح (-5 نقاط)
                            </button>
                            <button id="skipBtn" class="flex-1 py-2 border rounded-lg hover:bg-gray-50 text-gray-600">
                                <i class="fas fa-forward ml-1"></i>تخطي
                            </button>
                        </div>
                    </div>
                    
                    <!-- Pattern Info (shown after answer) -->
                    <div id="patternInfo" class="bg-white rounded-xl p-4 shadow-sm hidden">
                        <h4 class="font-bold mb-2">معلومات النمط</h4>
                        <div id="patternInfoContent"></div>
                    </div>
                    
                    <!-- Progress -->
                    <div class="bg-white rounded-xl p-4 shadow-sm">
                        <h4 class="font-bold mb-4">التقدم</h4>
                        <div class="space-y-3">
                            <div class="flex justify-between text-sm">
                                <span class="text-gray-500">الأنماط المتعلمة</span>
                                <span class="font-medium">${trainerState.patternsSeen.length} / ${getTotalPatterns()}</span>
                            </div>
                            <div class="h-2 bg-gray-200 rounded-full overflow-hidden">
                                <div class="h-full bg-green-500 rounded-full" style="width: ${(trainerState.patternsSeen.length / getTotalPatterns()) * 100}%"></div>
                            </div>
                            
                            <div class="flex justify-between text-sm">
                                <span class="text-gray-500">أفضل سلسلة</span>
                                <span class="font-medium">${trainerState.bestStreak}🔥</span>
                            </div>
                            
                            <div class="flex justify-between text-sm">
                                <span class="text-gray-500">التلميحات المستخدمة</span>
                                <span class="font-medium">${trainerState.hintsUsed}</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            
            <!-- Pattern Library -->
            <div class="mt-6 bg-white rounded-xl p-6 shadow-sm">
                <h3 class="font-bold mb-4">مكتبة الأنماط</h3>
                <div class="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
                    ${getAllPatterns().map(pattern => `
                        <div class="pattern-library-item p-3 rounded-lg border ${trainerState.patternsSeen.includes(pattern.key) ? 'bg-green-50 border-green-200' : 'bg-gray-50 border-gray-200'}">
                            <div class="h-16 flex items-center justify-center mb-2">
                                ${renderPatternSVG(pattern.key, pattern.type, 60, 48)}
                            </div>
                            <div class="text-center">
                                <div class="text-sm font-medium">${pattern.name}</div>
                                <div class="text-xs text-gray-500">${pattern.type === 'bullish' ? 'صعودي' : pattern.type === 'bearish' ? 'هبوطي' : 'استمرار'}</div>
                            </div>
                        </div>
                    `).join('')}
                </div>
            </div>
        </div>
    `;
}

/**
 * الحصول على جميع الأنماط
 */
function getAllPatterns() {
    const patterns = [];
    
    Object.entries(candlestickPatterns).forEach(([type, typePatterns]) => {
        Object.entries(typePatterns).forEach(([key, pattern]) => {
            patterns.push({
                key,
                type,
                ...pattern
            });
        });
    });
    
    return patterns;
}

/**
 * الحصول على عدد الأنماط الكلي
 */
function getTotalPatterns() {
    let count = 0;
    Object.values(candlestickPatterns).forEach(typePatterns => {
        count += Object.keys(typePatterns).length;
    });
    return count;
}

/**
 * الحصول على نمط عشوائي
 */
function getRandomPattern() {
    const patterns = [];
    
    if (trainerState.category === 'all') {
        Object.entries(candlestickPatterns).forEach(([type, typePatterns]) => {
            Object.entries(typePatterns).forEach(([key, pattern]) => {
                patterns.push({ key, type, ...pattern });
            });
        });
    } else {
        const categoryPatterns = candlestickPatterns[trainerState.category];
        if (categoryPatterns) {
            Object.entries(categoryPatterns).forEach(([key, pattern]) => {
                patterns.push({ key, type: trainerState.category, ...pattern });
            });
        }
    }
    
    // فلترة حسب المستوى
    let filteredPatterns = patterns;
    if (trainerState.difficulty === 'beginner') {
        filteredPatterns = patterns.filter(p => p.reliability >= 70);
    } else if (trainerState.difficulty === 'intermediate') {
        filteredPatterns = patterns.filter(p => p.reliability >= 50);
    }
    
    // اختيار نمط عشوائي
    const randomIndex = Math.floor(Math.random() * filteredPatterns.length);
    return filteredPatterns[randomIndex];
}

/**
 * توليد خيارات الإجابة
 */
function generateOptions(correctPattern) {
    const allPatterns = getAllPatterns();
    const options = [correctPattern];
    
    // إضافة 3 خيارات خاطئة
    while (options.length < 4) {
        const randomPattern = allPatterns[Math.floor(Math.random() * allPatterns.length)];
        if (!options.find(o => o.key === randomPattern.key)) {
            options.push(randomPattern);
        }
    }
    
    // خلط الخيارات
    return options.sort(() => Math.random() - 0.5);
}

/**
 * عرض نمط للتعرف عليه
 */
function displayPatternForRecognition() {
    const pattern = getRandomPattern();
    trainerState.currentPattern = pattern;
    
    const displayArea = document.getElementById('patternDisplayArea');
    const optionsContainer = document.getElementById('patternOptions');
    
    // عرض النمط
    displayArea.innerHTML = `
        <div class="text-center">
            <div class="mb-6">
                ${renderPatternChart(pattern.key, pattern.type)}
            </div>
            <div class="text-sm text-gray-500">
                <i class="fas fa-chart-line ml-1"></i>
                ما هو هذا النمط؟
            </div>
        </div>
    `;
    
    // عرض الخيارات
    const options = generateOptions(pattern);
    optionsContainer.innerHTML = options.map((opt, i) => `
        <button class="pattern-option w-full p-3 text-right border rounded-lg hover:bg-blue-50 hover:border-blue-300 transition-colors" data-key="${opt.key}" data-correct="${opt.key === pattern.key}">
            <div class="flex items-center gap-3">
                <div class="w-8 h-8 bg-gray-100 rounded flex items-center justify-center">
                    ${opt.type === 'bullish' ? '📈' : opt.type === 'bearish' ? '📉' : '➡️'}
                </div>
                <div>
                    <div class="font-medium">${opt.name}</div>
                    <div class="text-xs text-gray-500">${opt.nameEn}</div>
                </div>
            </div>
        </button>
    `).join('');
    
    // إضافة أحداث الخيارات
    optionsContainer.querySelectorAll('.pattern-option').forEach(btn => {
        btn.addEventListener('click', () => {
            checkAnswer(btn.dataset.key, btn.dataset.correct === 'true');
        });
    });
    
    // إخفاء المعلومات السابقة
    document.getElementById('patternInfo').classList.add('hidden');
    document.getElementById('hintArea').classList.add('hidden');
    
    // بدء المؤقت
    startTimer();
}

/**
 * عرض رسم النمط
 */
function renderPatternChart(patternKey, type) {
    // إنشاء رسم بياني محاكى مع النمط
    const candles = generatePatternCandles(patternKey, type);
    
    return `
        <div class="relative">
            <svg viewBox="0 0 400 200" class="w-full max-w-lg">
                <!-- Grid -->
                <defs>
                    <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
                        <path d="M 40 0 L 0 0 0 40" fill="none" stroke="#e5e7eb" stroke-width="0.5"/>
                    </pattern>
                </defs>
                <rect width="100%" height="100%" fill="url(#grid)"/>
                
                <!-- Candles -->
                ${candles.map((candle, i) => {
                    const x = 40 + i * 35;
                    const color = candle.close >= candle.open ? '#10b981' : '#ef4444';
                    const bodyTop = Math.min(candle.open, candle.close);
                    const bodyBottom = Math.max(candle.open, candle.close);
                    const bodyHeight = Math.max(bodyBottom - bodyTop, 2);
                    
                    return `
                        <!-- Wick -->
                        <line x1="${x}" y1="${candle.high}" x2="${x}" y2="${candle.low}" stroke="${color}" stroke-width="1"/>
                        <!-- Body -->
                        <rect x="${x - 8}" y="${bodyTop}" width="16" height="${bodyHeight}" fill="${color}" rx="1"/>
                    `;
                }).join('')}
                
                <!-- Pattern Highlight -->
                <rect x="${40 + (candles.length - 3) * 35 - 20}" y="20" width="100" height="160" fill="${type === 'bullish' ? 'rgba(16, 185, 129, 0.1)' : type === 'bearish' ? 'rgba(239, 68, 68, 0.1)' : 'rgba(107, 114, 128, 0.1)'}" rx="4" stroke-dasharray="4"/>
            </svg>
        </div>
    `;
}

/**
 * توليد شموع للنمط
 */
function generatePatternCandles(patternKey, type) {
    const candles = [];
    let basePrice = 100;
    
    // توليد شموع قبل النمط
    for (let i = 0; i < 5; i++) {
        const change = (Math.random() - 0.5) * 10;
        const open = basePrice;
        const close = basePrice + change;
        const high = Math.max(open, close) + Math.random() * 5;
        const low = Math.min(open, close) - Math.random() * 5;
        
        candles.push({ open, high, low, close });
        basePrice = close;
    }
    
    // إضافة شموع النمط
    const patternCandles = getPatternCandles(patternKey, type, basePrice);
    candles.push(...patternCandles);
    
    return candles;
}

/**
 * الحصول على شموع النمط
 */
function getPatternCandles(patternKey, type, basePrice) {
    const patterns = {
        // الأنماط الصعودية
        hammer: [
            { open: basePrice, high: basePrice + 2, low: basePrice - 15, close: basePrice + 1 }
        ],
        bullishEngulfing: [
            { open: basePrice + 5, high: basePrice + 8, low: basePrice - 5, close: basePrice - 3 },
            { open: basePrice - 5, high: basePrice + 10, low: basePrice - 8, close: basePrice + 8 }
        ],
        morningStar: [
            { open: basePrice, high: basePrice + 3, low: basePrice - 10, close: basePrice - 8 },
            { open: basePrice - 10, high: basePrice - 5, low: basePrice - 15, close: basePrice - 12 },
            { open: basePrice - 10, high: basePrice + 8, low: basePrice - 12, close: basePrice + 6 }
        ],
        threeWhiteSoldiers: [
            { open: basePrice, high: basePrice + 10, low: basePrice - 2, close: basePrice + 8 },
            { open: basePrice + 6, high: basePrice + 18, low: basePrice + 4, close: basePrice + 15 },
            { open: basePrice + 13, high: basePrice + 25, low: basePrice + 11, close: basePrice + 22 }
        ],
        
        // الأنماط الهبوطية
        shootingStar: [
            { open: basePrice, high: basePrice + 15, low: basePrice - 2, close: basePrice + 1 }
        ],
        bearishEngulfing: [
            { open: basePrice - 5, high: basePrice + 8, low: basePrice - 8, close: basePrice + 5 },
            { open: basePrice + 8, high: basePrice + 10, low: basePrice - 10, close: basePrice - 8 }
        ],
        eveningStar: [
            { open: basePrice, high: basePrice + 10, low: basePrice - 3, close: basePrice + 8 },
            { open: basePrice + 10, high: basePrice + 15, low: basePrice + 5, close: basePrice + 12 },
            { open: basePrice + 10, high: basePrice + 8, low: basePrice - 8, close: basePrice - 6 }
        ],
        threeBlackCrows: [
            { open: basePrice, high: basePrice + 2, low: basePrice - 10, close: basePrice - 8 },
            { open: basePrice - 6, high: basePrice - 4, low: basePrice - 18, close: basePrice - 15 },
            { open: basePrice - 13, high: basePrice - 11, low: basePrice - 25, close: basePrice - 22 }
        ],
        
        // أنماط الاستمرار
        doji: [
            { open: basePrice, high: basePrice + 8, low: basePrice - 8, close: basePrice }
        ],
        spinningTop: [
            { open: basePrice, high: basePrice + 10, low: basePrice - 10, close: basePrice + 1 }
        ],
        marubozu: type === 'bullish' ? [
            { open: basePrice, high: basePrice + 15, low: basePrice, close: basePrice + 15 }
        ] : [
            { open: basePrice, high: basePrice, low: basePrice - 15, close: basePrice - 15 }
        ]
    };
    
    return patterns[patternKey] || [
        { open: basePrice, high: basePrice + 5, low: basePrice - 5, close: basePrice + 2 }
    ];
}

/**
 * عرض SVG للنمط (مصغر)
 */
function renderPatternSVG(patternKey, type, width = 40, height = 50) {
    const color = type === 'bullish' ? '#10b981' : type === 'bearish' ? '#ef4444' : '#6b7280';
    
    // رسم مبسط للنمط
    return `
        <svg viewBox="0 0 40 50" width="${width}" height="${height}">
            <rect x="12" y="15" width="16" height="20" fill="${color}" rx="2"/>
            <line x1="20" y1="5" x2="20" y2="15" stroke="${color}" stroke-width="2"/>
            <line x1="20" y1="35" x2="20" y2="45" stroke="${color}" stroke-width="2"/>
        </svg>
    `;
}

/**
 * التحقق من الإجابة
 */
function checkAnswer(selectedKey, isCorrect) {
    trainerState.totalAttempts++;
    
    // إيقاف المؤقت
    stopTimer();
    
    const options = document.querySelectorAll('.pattern-option');
    options.forEach(opt => {
        opt.disabled = true;
        if (opt.dataset.key === trainerState.currentPattern.key) {
            opt.classList.add('bg-green-100', 'border-green-500');
        } else if (opt.dataset.key === selectedKey && !isCorrect) {
            opt.classList.add('bg-red-100', 'border-red-500');
        }
    });
    
    if (isCorrect) {
        trainerState.correctAnswers++;
        trainerState.streak++;
        trainerState.bestStreak = Math.max(trainerState.bestStreak, trainerState.streak);
        
        // حساب النقاط
        let points = 10;
        if (trainerState.difficulty === 'intermediate') points = 15;
        if (trainerState.difficulty === 'advanced') points = 25;
        points += trainerState.streak * 2; // مكافأة السلسلة
        
        trainerState.score += points;
        
        // إضافة النمط للأنماط المتعلمة
        if (!trainerState.patternsSeen.includes(trainerState.currentPattern.key)) {
            trainerState.patternsSeen.push(trainerState.currentPattern.key);
        }
        
        // منح XP
        if (typeof addXP === 'function') {
            addXP(points);
        }
        
        showFeedback(true, `صحيح! 🎉 +${points} نقاط`);
    } else {
        trainerState.streak = 0;
        showFeedback(false, `خطأ! النمط الصحيح هو: ${trainerState.currentPattern.name}`);
    }
    
    // عرض معلومات النمط
    showPatternInfo(trainerState.currentPattern);
    
    // تحديث الإحصائيات
    updateStats();
}

/**
 * عرض التغذية الراجعة
 */
function showFeedback(isCorrect, message) {
    const displayArea = document.getElementById('patternDisplayArea');
    const feedbackDiv = document.createElement('div');
    feedbackDiv.className = `mt-4 p-4 rounded-lg ${isCorrect ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`;
    feedbackDiv.innerHTML = `
        <div class="flex items-center gap-2">
            <i class="fas ${isCorrect ? 'fa-check-circle' : 'fa-times-circle'}"></i>
            <span>${message}</span>
        </div>
    `;
    
    displayArea.querySelector('.text-center').appendChild(feedbackDiv);
}

/**
 * عرض معلومات النمط
 */
function showPatternInfo(pattern) {
    const infoContainer = document.getElementById('patternInfo');
    const infoContent = document.getElementById('patternInfoContent');
    
    infoContainer.classList.remove('hidden');
    infoContent.innerHTML = `
        <div class="space-y-3">
            <div class="flex items-center gap-2">
                <span class="px-2 py-1 rounded text-sm ${pattern.type === 'bullish' ? 'bg-green-100 text-green-700' : pattern.type === 'bearish' ? 'bg-red-100 text-red-700' : 'bg-gray-100 text-gray-700'}">
                    ${pattern.type === 'bullish' ? 'صعودي' : pattern.type === 'bearish' ? 'هبوطي' : 'استمرار'}
                </span>
                <span class="text-sm text-gray-500">موثوقية: ${pattern.reliability}%</span>
            </div>
            
            <p class="text-gray-600">${pattern.description}</p>
            
            <div class="bg-blue-50 p-3 rounded-lg">
                <div class="font-medium text-blue-800 mb-1">心理学:</div>
                <p class="text-sm text-blue-700">${pattern.psychology}</p>
            </div>
            
            <div class="text-sm text-gray-500">
                <i class="fas fa-map-marker-alt ml-1"></i>
                يظهر: ${pattern.appearance}
            </div>
        </div>
    `;
}

/**
 * عرض تلميح
 */
function showHint() {
    if (!trainerState.currentPattern) return;
    
    trainerState.hintsUsed++;
    trainerState.score = Math.max(0, trainerState.score - 5);
    
    const hintArea = document.getElementById('hintArea');
    const hintText = document.getElementById('hintText');
    
    const hints = [
        `نوع النمط: ${trainerState.currentPattern.type === 'bullish' ? 'صعودي' : trainerState.currentPattern.type === 'bearish' ? 'هبوطي' : 'استمرار'}`,
        `يظهر في: ${trainerState.currentPattern.appearance}`,
        `موثوقيته: ${trainerState.currentPattern.reliability}%`
    ];
    
    hintText.textContent = hints[Math.floor(Math.random() * hints.length)];
    hintArea.classList.remove('hidden');
    
    updateStats();
}

/**
 * بدء المؤقت
 */
function startTimer() {
    trainerState.timeRemaining = trainerState.timeLimit;
    updateTimerDisplay();
    
    trainerState.timerInterval = setInterval(() => {
        trainerState.timeRemaining--;
        updateTimerDisplay();
        
        if (trainerState.timeRemaining <= 0) {
            stopTimer();
            // اعتبارها إجابة خاطئة
            checkAnswer('', false);
        }
    }, 1000);
}

/**
 * إيقاف المؤقت
 */
function stopTimer() {
    if (trainerState.timerInterval) {
        clearInterval(trainerState.timerInterval);
        trainerState.timerInterval = null;
    }
}

/**
 * تحديث عرض المؤقت
 */
function updateTimerDisplay() {
    const timerEl = document.getElementById('timeRemaining');
    if (timerEl) {
        timerEl.textContent = trainerState.timeRemaining;
        timerEl.parentElement.classList.toggle('text-red-500', trainerState.timeRemaining <= 10);
    }
}

/**
 * تحديث الإحصائيات
 */
function updateStats() {
    const scoreEl = document.querySelector('.text-green-600');
    const streakEl = document.querySelector('.text-orange-500');
    const accuracyEl = document.querySelector('.text-blue-600');
    
    if (scoreEl) scoreEl.textContent = trainerState.score;
    if (streakEl) streakEl.textContent = `${trainerState.streak}🔥`;
    if (accuracyEl) accuracyEl.textContent = `${Math.round((trainerState.correctAnswers / Math.max(trainerState.totalAttempts, 1)) * 100)}%`;
}

/**
 * تخطي النمط الحالي
 */
function skipPattern() {
    stopTimer();
    trainerState.streak = 0;
    displayPatternForRecognition();
}

/**
 * تهيئة المدرب
 */
function initializePatternTrainer() {
    // زر البدء
    document.getElementById('startTrainingBtn')?.addEventListener('click', () => {
        displayPatternForRecognition();
    });
    
    // إعدادات المستوى
    document.getElementById('trainerDifficulty')?.addEventListener('change', (e) => {
        trainerState.difficulty = e.target.value;
    });
    
    // إعدادات الفئة
    document.getElementById('trainerCategory')?.addEventListener('change', (e) => {
        trainerState.category = e.target.value;
    });
    
    // زر التلميح
    document.getElementById('hintBtn')?.addEventListener('click', showHint);
    
    // زر التخطي
    document.getElementById('skipBtn')?.addEventListener('click', skipPattern);
    
    console.log('📊 Pattern Trainer Initialized');
}

// تصدير الدوال
export {
    renderPatternTrainer,
    displayPatternForRecognition,
    initializePatternTrainer,
    trainerState,
    getAllPatterns,
    renderPatternSVG
};
