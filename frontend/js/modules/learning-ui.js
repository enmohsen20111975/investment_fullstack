/**
 * واجهة مركز التعلم المتقدم
 * Advanced Learning Center UI Components
 * مكونات واجهة المستخدم للنظام التعليمي الشامل
 */

import { 
    learningStateV2, 
    coursesData, 
    candlestickPatterns, 
    achievementsData,
    quizBank,
    calculateLevel,
    getRank,
    checkAchievements
} from './learning-v2.js';

import { simulationEngine } from './simulation-engine.js';

// ============================================
// مكونات واجهة المستخدم
// ============================================

/**
 * إنشاء واجهة مركز التعلم الرئيسية
 */
function renderLearningCenter() {
    return `
        <div class="learning-center-v2 bg-gray-50 min-h-screen" dir="rtl">
            <!-- Header with User Stats -->
            ${renderUserHeader()}
            
            <!-- Main Navigation Tabs -->
            <div class="bg-white border-b sticky top-0 z-40">
                <div class="container mx-auto px-4">
                    <nav class="flex space-x-8 space-x-reverse overflow-x-auto">
                        <button class="learning-tab-btn active py-4 px-2 border-b-2 border-blue-600 text-blue-600 font-medium" data-tab="courses">
                            <i class="fas fa-graduation-cap ml-2"></i>الدورات
                        </button>
                        <button class="learning-tab-btn py-4 px-2 border-b-2 border-transparent text-gray-500 hover:text-gray-700" data-tab="simulation">
                            <i class="fas fa-chart-line ml-2"></i>المحاكاة الحية
                        </button>
                        <button class="learning-tab-btn py-4 px-2 border-b-2 border-transparent text-gray-500 hover:text-gray-700" data-tab="patterns">
                            <i class="fas fa-candlestick-chart ml-2"></i>أنماط الشموع
                        </button>
                        <button class="learning-tab-btn py-4 px-2 border-b-2 border-transparent text-gray-500 hover:text-gray-700" data-tab="lab">
                            <i class="fas fa-flask ml-2"></i>مختبر التحليل
                        </button>
                        <button class="learning-tab-btn py-4 px-2 border-b-2 border-transparent text-gray-500 hover:text-gray-700" data-tab="quiz">
                            <i class="fas fa-question-circle ml-2"></i>الاختبارات
                        </button>
                        <button class="learning-tab-btn py-4 px-2 border-b-2 border-transparent text-gray-500 hover:text-gray-700" data-tab="achievements">
                            <i class="fas fa-trophy ml-2"></i>الإنجازات
                        </button>
                    </nav>
                </div>
            </div>
            
            <!-- Tab Contents -->
            <div class="container mx-auto px-4 py-6">
                <!-- Courses Tab -->
                <div id="coursesTab" class="tab-content">
                    ${renderCoursesTab()}
                </div>
                
                <!-- Simulation Tab -->
                <div id="simulationTab" class="tab-content hidden">
                    ${renderSimulationTab()}
                </div>
                
                <!-- Patterns Tab -->
                <div id="patternsTab" class="tab-content hidden">
                    ${renderPatternsTab()}
                </div>
                
                <!-- Lab Tab -->
                <div id="labTab" class="tab-content hidden">
                    ${renderLabTab()}
                </div>
                
                <!-- Quiz Tab -->
                <div id="quizTab" class="tab-content hidden">
                    ${renderQuizTab()}
                </div>
                
                <!-- Achievements Tab -->
                <div id="achievementsTab" class="tab-content hidden">
                    ${renderAchievementsTab()}
                </div>
            </div>
        </div>
    `;
}

/**
 * رأس الصفحة مع إحصائيات المستخدم
 */
function renderUserHeader() {
    const level = calculateLevel(learningStateV2.user.xp);
    const rank = getRank(learningStateV2.user.xp);
    
    return `
        <div class="bg-gradient-to-l from-blue-600 to-purple-600 text-white">
            <div class="container mx-auto px-4 py-6">
                <div class="flex flex-wrap items-center justify-between gap-4">
                    <!-- User Info -->
                    <div class="flex items-center gap-4">
                        <div class="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center text-3xl">
                            ${rank.icon}
                        </div>
                        <div>
                            <div class="flex items-center gap-2">
                                <h2 class="text-xl font-bold">مرحباً، المستثمر</h2>
                                <span class="bg-white/20 px-2 py-1 rounded-full text-sm">${rank.name}</span>
                            </div>
                            <div class="text-white/80 text-sm">المستوى ${level.level}</div>
                        </div>
                    </div>
                    
                    <!-- XP Progress -->
                    <div class="flex-1 max-w-md">
                        <div class="flex justify-between text-sm mb-1">
                            <span>نقاط الخبرة</span>
                            <span>${learningStateV2.user.xp} XP</span>
                        </div>
                        <div class="h-3 bg-white/20 rounded-full overflow-hidden">
                            <div class="h-full bg-yellow-400 rounded-full transition-all duration-500" 
                                 style="width: ${level.progress}%"></div>
                        </div>
                        <div class="text-xs text-white/60 mt-1">
                            ${level.currentXp} / ${level.xpToNextLevel} للمستوى التالي
                        </div>
                    </div>
                    
                    <!-- Quick Stats -->
                    <div class="flex gap-6">
                        <div class="text-center">
                            <div class="text-2xl font-bold">${learningStateV2.stats.streakDays}</div>
                            <div class="text-xs text-white/80">أيام متتالية 🔥</div>
                        </div>
                        <div class="text-center">
                            <div class="text-2xl font-bold">${learningStateV2.progress.completedLessons.length}</div>
                            <div class="text-xs text-white/80">درس مكتمل</div>
                        </div>
                        <div class="text-center">
                            <div class="text-2xl font-bold">${learningStateV2.user.badges.length}</div>
                            <div class="text-xs text-white/80">شارة</div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    `;
}

/**
 * تبويب الدورات
 */
function renderCoursesTab() {
    return `
        <div class="space-y-8">
            <!-- Course Path -->
            <div class="bg-white rounded-xl p-6 shadow-sm">
                <h3 class="text-lg font-bold mb-4">مسار التعلم</h3>
                <div class="flex items-center gap-4 overflow-x-auto pb-4">
                    ${Object.values(coursesData).map((course, index) => `
                        <div class="flex items-center">
                            <div class="course-path-node flex-shrink-0 w-32 text-center">
                                <div class="w-16 h-16 mx-auto rounded-full flex items-center justify-center text-2xl
                                    ${index === 0 ? 'bg-green-100 text-green-600' : 
                                      index === 1 ? 'bg-blue-100 text-blue-600' : 
                                      'bg-purple-100 text-purple-600'}">
                                    ${index === 0 ? '🌱' : index === 1 ? '📈' : '🎓'}
                                </div>
                                <div class="mt-2 font-medium text-sm">${course.title}</div>
                                <div class="text-xs text-gray-500">${course.estimatedHours} ساعات</div>
                            </div>
                            ${index < Object.keys(coursesData).length - 1 ? `
                                <div class="w-12 h-1 bg-gray-200 mx-2"></div>
                            ` : ''}
                        </div>
                    `).join('')}
                </div>
            </div>
            
            <!-- Course Cards -->
            <div class="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                ${Object.values(coursesData).map(course => renderCourseCard(course)).join('')}
            </div>
        </div>
    `;
}

/**
 * بطاقة الدورة
 */
function renderCourseCard(course) {
    const completedLessons = learningStateV2.progress.completedLessons.filter(l => 
        course.modules.some(m => m.lessons.some(lesson => lesson.id === l))
    ).length;
    
    const totalLessons = course.modules.reduce((sum, m) => sum + m.lessons.length, 0);
    const progress = Math.round((completedLessons / totalLessons) * 100);
    
    return `
        <div class="bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow overflow-hidden course-card" data-course="${course.id}">
            <div class="h-32 bg-gradient-to-l ${course.level === 1 ? 'from-green-500 to-green-600' : 
                course.level === 2 ? 'from-blue-500 to-blue-600' : 
                'from-purple-500 to-purple-600'} p-6 text-white">
                <div class="flex justify-between items-start">
                    <div>
                        <h3 class="text-xl font-bold">${course.title}</h3>
                        <p class="text-white/80 text-sm mt-1">${course.description}</p>
                    </div>
                    <span class="bg-white/20 px-2 py-1 rounded text-sm">${course.estimatedHours}h</span>
                </div>
            </div>
            
            <div class="p-6">
                <!-- Progress -->
                <div class="mb-4">
                    <div class="flex justify-between text-sm mb-1">
                        <span class="text-gray-600">التقدم</span>
                        <span class="font-medium">${progress}%</span>
                    </div>
                    <div class="h-2 bg-gray-100 rounded-full overflow-hidden">
                        <div class="h-full bg-blue-500 rounded-full transition-all" style="width: ${progress}%"></div>
                    </div>
                </div>
                
                <!-- Stats -->
                <div class="flex justify-between text-sm text-gray-500 mb-4">
                    <span><i class="fas fa-book-open ml-1"></i>${totalLessons} درس</span>
                    <span><i class="fas fa-star ml-1"></i>${course.xpReward} XP</span>
                </div>
                
                <!-- Modules Preview -->
                <div class="space-y-2 mb-4">
                    ${course.modules.slice(0, 2).map(module => `
                        <div class="flex items-center gap-2 text-sm">
                            <i class="fas fa-check-circle text-green-500"></i>
                            <span>${module.title}</span>
                        </div>
                    `).join('')}
                    ${course.modules.length > 2 ? `
                        <div class="text-sm text-gray-400">+${course.modules.length - 2} وحدات أخرى</div>
                    ` : ''}
                </div>
                
                <!-- Action Button -->
                <button class="w-full py-3 rounded-lg font-medium transition-colors
                    ${progress === 0 ? 'bg-blue-600 text-white hover:bg-blue-700' :
                      progress === 100 ? 'bg-green-100 text-green-700' :
                      'bg-blue-100 text-blue-700 hover:bg-blue-200'}"
                    onclick="window.openCourse('${course.id}')">
                    ${progress === 0 ? 'ابدأ الدورة' : progress === 100 ? 'أكملت الدورة ✓' : 'استمر في التعلم'}
                </button>
            </div>
        </div>
    `;
}

/**
 * تبويب المحاكاة الحية
 */
function renderSimulationTab() {
    return `
        <div class="grid lg:grid-cols-3 gap-6">
            <!-- Chart Section -->
            <div class="lg:col-span-2 space-y-6">
                <!-- Stock Selector & Controls -->
                <div class="bg-white rounded-xl p-4 shadow-sm">
                    <div class="flex flex-wrap items-center justify-between gap-4">
                        <div class="flex items-center gap-4">
                            <select id="simStockSelect" class="border rounded-lg px-4 py-2 font-medium">
                                <option value="ETEL">ETEL - الاتصالات المصرية</option>
                                <option value="COMI">COMI - البنك التجاري الدولي</option>
                                <option value="AMOC">AMOC - الإسكندرية للموانئ</option>
                                <option value="SWDY">SWDY - السويدي للكابلات</option>
                                <option value="EAST">EAST - أوراسكوم</option>
                            </select>
                            
                            <select id="simTimeframe" class="border rounded-lg px-3 py-2 text-sm">
                                <option value="5M">5 دقائق</option>
                                <option value="15M">15 دقيقة</option>
                                <option value="1H" selected>ساعة</option>
                                <option value="4H">4 ساعات</option>
                                <option value="1D">يوم</option>
                            </select>
                        </div>
                        
                        <div class="flex items-center gap-2">
                            <select id="simScenario" class="border rounded-lg px-3 py-2 text-sm">
                                <option value="sideways">سوق عرضي</option>
                                <option value="bullMarket">سوق صاعد</option>
                                <option value="bearMarket">سوق هابط</option>
                                <option value="crash">انهيار</option>
                                <option value="recovery">تعافي</option>
                            </select>
                            
                            <button id="simStartBtn" class="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700">
                                <i class="fas fa-play ml-1"></i>ابدأ
                            </button>
                            <button id="simStopBtn" class="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 hidden">
                                <i class="fas fa-stop ml-1"></i>إيقاف
                            </button>
                        </div>
                    </div>
                </div>
                
                <!-- Live Chart -->
                <div class="bg-white rounded-xl shadow-sm overflow-hidden">
                    <div class="p-4 border-b flex items-center justify-between">
                        <div>
                            <h3 class="font-bold text-lg" id="simStockName">ETEL - الاتصالات المصرية</h3>
                            <div class="flex items-center gap-4 mt-1">
                                <span class="text-2xl font-bold" id="simStockPrice">25.50</span>
                                <span class="text-lg font-medium text-green-600" id="simStockChange">+0.75 (+3.03%)</span>
                            </div>
                        </div>
                        <div class="text-left text-sm text-gray-500">
                            <div>الافتتاح: <span id="simOpen">25.00</span></div>
                            <div>الأعلى: <span id="simHigh">26.00</span></div>
                            <div>الأدنى: <span id="simLow">24.80</span></div>
                            <div>الحجم: <span id="simVolume">1.2M</span></div>
                        </div>
                    </div>
                    <div id="simChartContainer" class="h-80 bg-gray-50">
                        <!-- Chart will be rendered here -->
                        <canvas id="simChart"></canvas>
                    </div>
                </div>
                
                <!-- Technical Indicators -->
                <div class="bg-white rounded-xl p-4 shadow-sm">
                    <h4 class="font-bold mb-4">المؤشرات الفنية</h4>
                    <div class="grid grid-cols-4 gap-4">
                        <div class="text-center p-3 bg-gray-50 rounded-lg">
                            <div class="text-sm text-gray-500">SMA 20</div>
                            <div class="font-bold" id="indSMA20">25.30</div>
                        </div>
                        <div class="text-center p-3 bg-gray-50 rounded-lg">
                            <div class="text-sm text-gray-500">RSI</div>
                            <div class="font-bold text-green-600" id="indRSI">65.4</div>
                        </div>
                        <div class="text-center p-3 bg-gray-50 rounded-lg">
                            <div class="text-sm text-gray-500">MACD</div>
                            <div class="font-bold text-green-600" id="indMACD">0.15</div>
                        </div>
                        <div class="text-center p-3 bg-gray-50 rounded-lg">
                            <div class="text-sm text-gray-500">الاتجاه</div>
                            <div class="font-bold text-green-600" id="indTrend">صعودي ↑</div>
                        </div>
                    </div>
                </div>
                
                <!-- Detected Patterns -->
                <div class="bg-white rounded-xl p-4 shadow-sm">
                    <h4 class="font-bold mb-4">الأنماط المكتشفة</h4>
                    <div id="detectedPatterns" class="flex flex-wrap gap-2">
                        <span class="px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm">
                            <i class="fas fa-arrow-up ml-1"></i>ابتلاع صعودي
                        </span>
                    </div>
                </div>
            </div>
            
            <!-- Trading Panel -->
            <div class="space-y-6">
                <!-- Portfolio Summary -->
                <div class="bg-white rounded-xl p-4 shadow-sm">
                    <h4 class="font-bold mb-4">ملخص المحفظة</h4>
                    <div class="space-y-4">
                        <div class="flex justify-between items-center">
                            <span class="text-gray-500">الرصيد النقدي</span>
                            <span class="font-bold" id="simBalance">100,000 ج.م</span>
                        </div>
                        <div class="flex justify-between items-center">
                            <span class="text-gray-500">قيمة الأسهم</span>
                            <span class="font-bold" id="simPortfolioValue">0 ج.م</span>
                        </div>
                        <hr>
                        <div class="flex justify-between items-center">
                            <span class="text-gray-500">القيمة الإجمالية</span>
                            <span class="font-bold text-lg" id="simTotalValue">100,000 ج.م</span>
                        </div>
                        <div class="flex justify-between items-center">
                            <span class="text-gray-500">الربح/الخسارة</span>
                            <span class="font-bold text-green-600" id="simProfitLoss">+0 ج.م</span>
                        </div>
                    </div>
                </div>
                
                <!-- Trading Form -->
                <div class="bg-white rounded-xl p-4 shadow-sm">
                    <h4 class="font-bold mb-4">تنفيذ صفقة</h4>
                    <div class="space-y-4">
                        <div>
                            <label class="block text-sm text-gray-500 mb-1">نوع الصفقة</label>
                            <div class="grid grid-cols-2 gap-2">
                                <button class="trade-type-btn py-2 rounded-lg border-2 border-green-500 bg-green-50 text-green-700 font-medium" data-type="buy">
                                    شراء
                                </button>
                                <button class="trade-type-btn py-2 rounded-lg border-2 border-gray-200 text-gray-500" data-type="sell">
                                    بيع
                                </button>
                            </div>
                        </div>
                        
                        <div>
                            <label class="block text-sm text-gray-500 mb-1">عدد الأسهم</label>
                            <input type="number" id="simShares" class="w-full border rounded-lg px-4 py-2" value="100" min="1">
                        </div>
                        
                        <div>
                            <label class="block text-sm text-gray-500 mb-1">نوع الأمر</label>
                            <select id="simOrderType" class="w-full border rounded-lg px-4 py-2">
                                <option value="market">أمر سوقي</option>
                                <option value="limit">أمر محدد</option>
                                <option value="stop">أمر وقف</option>
                            </select>
                        </div>
                        
                        <div id="limitPriceContainer" class="hidden">
                            <label class="block text-sm text-gray-500 mb-1">السعر المحدد</label>
                            <input type="number" id="simLimitPrice" class="w-full border rounded-lg px-4 py-2" step="0.01">
                        </div>
                        
                        <div class="bg-gray-50 p-3 rounded-lg">
                            <div class="flex justify-between text-sm">
                                <span>السعر الحالي:</span>
                                <span id="simCurrentPrice">25.50 ج.م</span>
                            </div>
                            <div class="flex justify-between text-sm mt-1">
                                <span>إجمالي الصفقة:</span>
                                <span id="simTotalCost" class="font-bold">2,550 ج.م</span>
                            </div>
                        </div>
                        
                        <button id="simExecuteBtn" class="w-full py-3 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700">
                            تنفيذ الشراء
                        </button>
                    </div>
                </div>
                
                <!-- Holdings -->
                <div class="bg-white rounded-xl p-4 shadow-sm">
                    <h4 class="font-bold mb-4">ممتلكاتي</h4>
                    <div id="simHoldings" class="space-y-2">
                        <div class="text-center py-8 text-gray-400">
                            <i class="fas fa-briefcase text-4xl mb-2"></i>
                            <p>محفظتك فارغة</p>
                            <p class="text-sm">ابدأ بالشراء لبناء محفظتك</p>
                        </div>
                    </div>
                </div>
                
                <!-- Recent Transactions -->
                <div class="bg-white rounded-xl p-4 shadow-sm">
                    <h4 class="font-bold mb-4">آخر المعاملات</h4>
                    <div id="simTransactions" class="space-y-2 max-h-48 overflow-y-auto">
                        <div class="text-center py-4 text-gray-400 text-sm">
                            لا توجد معاملات بعد
                        </div>
                    </div>
                </div>
            </div>
        </div>
    `;
}

/**
 * تبويب أنماط الشموع
 */
function renderPatternsTab() {
    return `
        <div class="space-y-6">
            <!-- Pattern Categories -->
            <div class="flex gap-4">
                <button class="pattern-cat-btn px-4 py-2 bg-green-100 text-green-700 rounded-lg font-medium" data-category="bullish">
                    أنماط صعودية 📈
                </button>
                <button class="pattern-cat-btn px-4 py-2 bg-gray-100 text-gray-600 rounded-lg" data-category="bearish">
                    أنماط هبوطية 📉
                </button>
                <button class="pattern-cat-btn px-4 py-2 bg-gray-100 text-gray-600 rounded-lg" data-category="continuation">
                    أنماط استمرار ➡️
                </button>
            </div>
            
            <!-- Interactive Candle Demo -->
            <div class="bg-white rounded-xl p-6 shadow-sm">
                <h3 class="text-lg font-bold mb-4">عرض الشمعة التفاعلي</h3>
                <div class="grid md:grid-cols-2 gap-6">
                    <div>
                        <div id="interactiveCandle" class="h-64 bg-gray-50 rounded-lg flex items-center justify-center">
                            <svg viewBox="0 0 200 250" class="w-48 h-56">
                                <!-- Candle SVG will be rendered dynamically -->
                            </svg>
                        </div>
                        <div class="flex gap-2 mt-4">
                            <button class="candle-demo-btn flex-1 py-2 bg-green-100 text-green-700 rounded-lg" data-type="bullish">
                                صاعدة
                            </button>
                            <button class="candle-demo-btn flex-1 py-2 bg-red-100 text-red-700 rounded-lg" data-type="bearish">
                                هابطة
                            </button>
                            <button class="candle-demo-btn flex-1 py-2 bg-gray-100 text-gray-700 rounded-lg" data-type="doji">
                                دوجي
                            </button>
                        </div>
                    </div>
                    <div>
                        <h4 class="font-bold mb-2" id="candleTitle">الشمعة الصاعدة</h4>
                        <div id="candleExplanation" class="space-y-3 text-gray-600">
                            <p><strong>المعنى:</strong> السعر أغلق أعلى من الافتتاح</p>
                            <p><strong>الدلالة:</strong> سيطرة المشترين على السوق</p>
                            <p><strong>الجسم:</strong> كلما كان أكبر، كان الضغط الشرائي أقوى</p>
                        </div>
                    </div>
                </div>
            </div>
            
            <!-- Patterns Grid -->
            <div id="patternsGrid" class="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                ${Object.entries(candlestickPatterns.bullish).map(([key, pattern]) => `
                    <div class="pattern-card bg-white rounded-xl p-4 shadow-sm hover:shadow-md cursor-pointer transition-shadow" data-pattern="${key}">
                        <div class="flex items-center gap-3 mb-3">
                            <div class="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                                <svg viewBox="0 0 40 50" class="w-8 h-10">
                                    <rect x="12" y="15" width="16" height="20" fill="#10b981" rx="2"/>
                                    <line x1="20" y1="5" x2="20" y2="15" stroke="#10b981" stroke-width="2"/>
                                    <line x1="20" y1="35" x2="20" y2="45" stroke="#10b981" stroke-width="2"/>
                                </svg>
                            </div>
                            <div>
                                <h4 class="font-bold">${pattern.name}</h4>
                                <p class="text-xs text-gray-500">${pattern.nameEn}</p>
                            </div>
                        </div>
                        <p class="text-sm text-gray-600 mb-2">${pattern.description}</p>
                        <div class="flex items-center justify-between text-xs">
                            <span class="text-gray-500">الموثوقية:</span>
                            <div class="flex items-center gap-1">
                                <div class="w-20 h-2 bg-gray-200 rounded-full overflow-hidden">
                                    <div class="h-full bg-green-500" style="width: ${pattern.reliability}%"></div>
                                </div>
                                <span class="font-medium">${pattern.reliability}%</span>
                            </div>
                        </div>
                    </div>
                `).join('')}
            </div>
            
            <!-- Pattern Recognition Quiz -->
            <div class="bg-white rounded-xl p-6 shadow-sm">
                <h3 class="text-lg font-bold mb-4">اختبر معرفتك بالأنماط</h3>
                <div id="patternQuiz">
                    <p class="text-gray-600 mb-4">تعرف على الأنماط من خلال الاختبار التفاعلي</p>
                    <button id="startPatternQuiz" class="px-6 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700">
                        ابدأ الاختبار
                    </button>
                </div>
            </div>
        </div>
    `;
}

/**
 * تبويب مختبر التحليل
 */
function renderLabTab() {
    return `
        <div class="space-y-6">
            <div class="bg-white rounded-xl p-6 shadow-sm">
                <h3 class="text-lg font-bold mb-4">مختبر التحليل الفني</h3>
                <p class="text-gray-600 mb-6">تجربة تفاعلية للتحليل الفني مع أدوات متقدمة</p>
                
                <div class="grid lg:grid-cols-4 gap-6">
                    <!-- Tools Panel -->
                    <div class="space-y-4">
                        <h4 class="font-bold">أدوات الرسم</h4>
                        <div class="space-y-2">
                            <button class="lab-tool-btn w-full text-right px-4 py-2 rounded-lg border hover:bg-gray-50 flex items-center gap-2" data-tool="cursor">
                                <i class="fas fa-mouse-pointer"></i> مؤشر
                            </button>
                            <button class="lab-tool-btn w-full text-right px-4 py-2 rounded-lg border hover:bg-gray-50 flex items-center gap-2" data-tool="trendline">
                                <i class="fas fa-chart-line"></i> خط الاتجاه
                            </button>
                            <button class="lab-tool-btn w-full text-right px-4 py-2 rounded-lg border hover:bg-gray-50 flex items-center gap-2" data-tool="horizontal">
                                <i class="fas fa-arrows-alt-h"></i> خط أفقي
                            </button>
                            <button class="lab-tool-btn w-full text-right px-4 py-2 rounded-lg border hover:bg-gray-50 flex items-center gap-2" data-tool="rectangle">
                                <i class="fas fa-vector-square"></i> مستطيل
                            </button>
                            <button class="lab-tool-btn w-full text-right px-4 py-2 rounded-lg border hover:bg-gray-50 flex items-center gap-2" data-tool="fibonacci">
                                <i class="fas fa-percentage"></i> فيبوناتشي
                            </button>
                            <button class="lab-tool-btn w-full text-right px-4 py-2 rounded-lg border hover:bg-gray-50 flex items-center gap-2" data-tool="text">
                                <i class="fas fa-font"></i> نص
                            </button>
                        </div>
                        
                        <hr>
                        
                        <h4 class="font-bold">المؤشرات</h4>
                        <div class="space-y-2">
                            <label class="flex items-center gap-2 cursor-pointer">
                                <input type="checkbox" class="indicator-toggle" data-indicator="sma" checked>
                                <span>SMA</span>
                            </label>
                            <label class="flex items-center gap-2 cursor-pointer">
                                <input type="checkbox" class="indicator-toggle" data-indicator="ema">
                                <span>EMA</span>
                            </label>
                            <label class="flex items-center gap-2 cursor-pointer">
                                <input type="checkbox" class="indicator-toggle" data-indicator="bb">
                                <span>Bollinger Bands</span>
                            </label>
                            <label class="flex items-center gap-2 cursor-pointer">
                                <input type="checkbox" class="indicator-toggle" data-indicator="volume">
                                <span>Volume</span>
                            </label>
                        </div>
                        
                        <button class="w-full py-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200">
                            <i class="fas fa-trash ml-1"></i>مسح الرسومات
                        </button>
                    </div>
                    
                    <!-- Chart Area -->
                    <div class="lg:col-span-3">
                        <div class="bg-gray-50 rounded-lg h-96 flex items-center justify-center border-2 border-dashed border-gray-300">
                            <div class="text-center text-gray-400">
                                <i class="fas fa-chart-area text-4xl mb-2"></i>
                                <p>منطقة الرسم البياني</p>
                                <p class="text-sm">اختر سهم وابدأ التحليل</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    `;
}

/**
 * تبويب الاختبارات
 */
function renderQuizTab() {
    return `
        <div class="space-y-6">
            <!-- Quiz Categories -->
            <div class="grid md:grid-cols-3 gap-4">
                <div class="bg-white rounded-xl p-6 shadow-sm text-center cursor-pointer hover:shadow-md transition-shadow quiz-category" data-category="basics">
                    <div class="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <i class="fas fa-seedling text-2xl text-green-600"></i>
                    </div>
                    <h3 class="font-bold mb-2">أساسيات الاستثمار</h3>
                    <p class="text-sm text-gray-500 mb-4">اختبر معرفتك بالأساسيات</p>
                    <div class="text-sm">
                        <span class="text-gray-500">أفضل نتيجة:</span>
                        <span class="font-bold text-green-600">${learningStateV2.quiz.bestScores.basics || 0}%</span>
                    </div>
                </div>
                
                <div class="bg-white rounded-xl p-6 shadow-sm text-center cursor-pointer hover:shadow-md transition-shadow quiz-category" data-category="technical">
                    <div class="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <i class="fas fa-chart-candlestick text-2xl text-blue-600"></i>
                    </div>
                    <h3 class="font-bold mb-2">التحليل الفني</h3>
                    <p class="text-sm text-gray-500 mb-4">الرسوم البيانية والأنماط</p>
                    <div class="text-sm">
                        <span class="text-gray-500">أفضل نتيجة:</span>
                        <span class="font-bold text-blue-600">${learningStateV2.quiz.bestScores.technical || 0}%</span>
                    </div>
                </div>
                
                <div class="bg-white rounded-xl p-6 shadow-sm text-center cursor-pointer hover:shadow-md transition-shadow quiz-category" data-category="risk">
                    <div class="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <i class="fas fa-shield-alt text-2xl text-purple-600"></i>
                    </div>
                    <h3 class="font-bold mb-2">إدارة المخاطر</h3>
                    <p class="text-sm text-gray-500 mb-4">استراتيجيات الحماية</p>
                    <div class="text-sm">
                        <span class="text-gray-500">أفضل نتيجة:</span>
                        <span class="font-bold text-purple-600">${learningStateV2.quiz.bestScores.risk || 0}%</span>
                    </div>
                </div>
            </div>
            
            <!-- Quiz Container -->
            <div id="quizContainer" class="bg-white rounded-xl p-6 shadow-sm">
                <div id="quizStart" class="text-center py-8">
                    <h3 class="text-xl font-bold mb-2">اختبار المعرفة</h3>
                    <p class="text-gray-600 mb-6">اختر فئة لبدء الاختبار</p>
                    <div class="flex justify-center gap-4">
                        <div class="text-center">
                            <div class="text-3xl font-bold text-blue-600">${learningStateV2.quiz.totalQuizzesTaken}</div>
                            <div class="text-sm text-gray-500">اختبارات مكتملة</div>
                        </div>
                        <div class="w-px bg-gray-200"></div>
                        <div class="text-center">
                            <div class="text-3xl font-bold text-green-600">${learningStateV2.quiz.averageScore}%</div>
                            <div class="text-sm text-gray-500">متوسط النتائج</div>
                        </div>
                    </div>
                </div>
                
                <div id="quizQuestions" class="hidden">
                    <!-- Quiz questions will be rendered here -->
                </div>
                
                <div id="quizResults" class="hidden">
                    <!-- Quiz results will be rendered here -->
                </div>
            </div>
        </div>
    `;
}

/**
 * تبويب الإنجازات
 */
function renderAchievementsTab() {
    const rank = getRank(learningStateV2.user.xp);
    
    return `
        <div class="space-y-6">
            <!-- Current Rank -->
            <div class="bg-gradient-to-l from-yellow-500 to-orange-500 rounded-xl p-6 text-white">
                <div class="flex items-center justify-between">
                    <div class="flex items-center gap-4">
                        <div class="w-20 h-20 bg-white/20 rounded-full flex items-center justify-center text-4xl">
                            ${rank.icon}
                        </div>
                        <div>
                            <div class="text-white/80 text-sm">رتبتك الحالية</div>
                            <div class="text-2xl font-bold">${rank.name}</div>
                            <div class="text-white/80">${learningStateV2.user.xp} نقطة خبرة</div>
                        </div>
                    </div>
                    <div class="text-left">
                        <div class="text-white/80 text-sm">الرتبة التالية</div>
                        <div class="text-xl font-bold">${achievementsData.ranks.find(r => r.minXP > learningStateV2.user.xp)?.name || 'الرتبة العظمى!'}</div>
                    </div>
                </div>
            </div>
            
            <!-- Badges Grid -->
            <div class="bg-white rounded-xl p-6 shadow-sm">
                <h3 class="text-lg font-bold mb-4">الشارات</h3>
                <div class="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
                    ${Object.entries(achievementsData.badges).map(([key, badge]) => {
                        const earned = learningStateV2.user.badges.includes(key);
                        return `
                            <div class="badge-card p-4 rounded-xl text-center ${earned ? 'bg-gradient-to-b from-yellow-50 to-orange-50' : 'bg-gray-50 opacity-50'}">
                                <div class="text-4xl mb-2 ${earned ? '' : 'grayscale'}">${badge.icon}</div>
                                <div class="font-medium text-sm">${badge.name}</div>
                                <div class="text-xs text-gray-500 mt-1">${badge.description}</div>
                                ${earned ? '<div class="text-xs text-green-600 mt-2">✓ مكتسبة</div>' : ''}
                            </div>
                        `;
                    }).join('')}
                </div>
            </div>
            
            <!-- Stats -->
            <div class="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div class="bg-white rounded-xl p-4 shadow-sm text-center">
                    <div class="text-3xl font-bold text-blue-600">${learningStateV2.stats.totalTrades}</div>
                    <div class="text-sm text-gray-500">إجمالي الصفقات</div>
                </div>
                <div class="bg-white rounded-xl p-4 shadow-sm text-center">
                    <div class="text-3xl font-bold text-green-600">${learningStateV2.stats.winRate}%</div>
                    <div class="text-sm text-gray-500">نسبة النجاح</div>
                </div>
                <div class="bg-white rounded-xl p-4 shadow-sm text-center">
                    <div class="text-3xl font-bold text-purple-600">${learningStateV2.stats.longestStreak}</div>
                    <div class="text-sm text-gray-500">أطول سلسلة</div>
                </div>
                <div class="bg-white rounded-xl p-4 shadow-sm text-center">
                    <div class="text-3xl font-bold text-orange-600">${learningStateV2.progress.completedLessons.length}</div>
                    <div class="text-sm text-gray-500">دروس مكتملة</div>
                </div>
            </div>
        </div>
    `;
}

// ============================================
// تهيئة النظام
// ============================================

/**
 * تهيئة مركز التعلم المتقدم
 */
function initializeLearningCenterV2() {
    // تحميل التقدم المحفوظ
    loadProgress();
    
    // تهيئة التبويبات
    initializeTabs();
    
    // تهيئة المحاكاة
    initializeSimulation();
    
    // تهيئة الاختبارات
    initializeQuiz();
    
    // تهيئة أنماط الشموع
    initializePatterns();
    
    // التحقق من الإنجازات
    checkAndAwardAchievements();
    
    // تحديث الواجهة
    updateUI();
    
    console.log('📚 Learning Center V2 Initialized');
}

/**
 * تحميل التقدم المحفوظ
 */
function loadProgress() {
    const saved = localStorage.getItem('learningProgressV2');
    if (saved) {
        const data = JSON.parse(saved);
        Object.assign(learningStateV2, data);
    }
    
    // تحديث السلسلة
    updateStreak();
}

/**
 * حفظ التقدم
 */
function saveProgress() {
    localStorage.setItem('learningProgressV2', JSON.stringify(learningStateV2));
}

/**
 * تحديث السلسلة
 */
function updateStreak() {
    const today = new Date().toDateString();
    const lastActive = learningStateV2.stats.lastActiveDate;
    
    if (lastActive) {
        const lastDate = new Date(lastActive);
        const diffDays = Math.floor((new Date(today) - lastDate) / (1000 * 60 * 60 * 24));
        
        if (diffDays === 1) {
            learningStateV2.stats.streakDays++;
        } else if (diffDays > 1) {
            learningStateV2.stats.streakDays = 1;
        }
        
        learningStateV2.stats.longestStreak = Math.max(learningStateV2.stats.longestStreak, learningStateV2.stats.streakDays);
    } else {
        learningStateV2.stats.streakDays = 1;
    }
    
    learningStateV2.stats.lastActiveDate = today;
    saveProgress();
}

/**
 * تهيئة التبويبات
 */
function initializeTabs() {
    document.querySelectorAll('.learning-tab-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            const tab = btn.dataset.tab;
            
            // تحديث الأزرار
            document.querySelectorAll('.learning-tab-btn').forEach(b => {
                b.classList.remove('active', 'border-blue-600', 'text-blue-600');
                b.classList.add('border-transparent', 'text-gray-500');
            });
            btn.classList.add('active', 'border-blue-600', 'text-blue-600');
            btn.classList.remove('border-transparent', 'text-gray-500');
            
            // إظهار المحتوى
            document.querySelectorAll('.tab-content').forEach(content => {
                content.classList.add('hidden');
            });
            document.getElementById(`${tab}Tab`).classList.remove('hidden');
        });
    });
}

/**
 * التحقق من الإنجازات ومنحها
 */
function checkAndAwardAchievements() {
    const newAchievements = checkAchievements(learningStateV2);
    
    if (newAchievements.length > 0) {
        newAchievements.forEach(badge => {
            showAchievementNotification(badge);
        });
        saveProgress();
    }
}

/**
 * عرض إشعار الإنجاز
 */
function showAchievementNotification(badge) {
    const notification = document.createElement('div');
    notification.className = 'fixed top-4 left-1/2 transform -translate-x-1/2 bg-gradient-to-r from-yellow-500 to-orange-500 text-white px-6 py-4 rounded-xl shadow-lg z-50 animate-bounce';
    notification.innerHTML = `
        <div class="flex items-center gap-3">
            <div class="text-3xl">${badge.icon}</div>
            <div>
                <div class="font-bold">إنجاز جديد! 🎉</div>
                <div>${badge.name}</div>
                <div class="text-sm opacity-80">+${badge.xp} XP</div>
            </div>
        </div>
    `;
    
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.remove();
    }, 5000);
}

/**
 * تحديث الواجهة
 */
function updateUI() {
    // سيتم تنفيذها عند الحاجة
}

// تصدير الدوال
export {
    renderLearningCenter,
    renderUserHeader,
    renderCoursesTab,
    renderSimulationTab,
    renderPatternsTab,
    renderLabTab,
    renderQuizTab,
    renderAchievementsTab,
    initializeLearningCenterV2,
    saveProgress,
    loadProgress
};
