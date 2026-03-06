import { mergedCoursesData } from './merged-investment-course.js';
/**
 * وحدة مركز التعلم
 * تحتوي على جميع وظائف التعلم التفاعلي
 */

// حالة مركز التعلم
const learningState = {
    completedLessons: [],
    quizScore: 0,
    simulationCount: 0,
    streakDays: 0,
    currentQuiz: {
        questions: [],
        currentIndex: 0,
        score: 0,
        answers: []
    },
    simulation: {
        balance: 100000,
        portfolio: [],
        transactions: []
    }
};

// أسئلة الاختبار
const quizQuestions = [
    {
        question: "ما هو الهدف الرئيسي من الاستثمار؟",
        options: [
            "إنفاق الأموال بسرعة",
            "تنمية الثروة على المدى الطويل",
            "تخزين الأموال بدون عائد",
            "المضاربة اليومية فقط"
        ],
        correct: 1,
        explanation: "الاستثمار يهدف إلى تنمية الثروة على المدى الطويل من خلال وضع الأموال في أصول تزيد قيمتها مع الوقت."
    },
    {
        question: "ماذا تعني الشمعة الخضراء في الرسم البياني؟",
        options: [
            "انخفاض السعر",
            "السعر أغلق أعلى من الافتتاح",
            "لا يوجد تداول",
            "السعر ثابت"
        ],
        correct: 1,
        explanation: "الشمعة الخضراء تعني أن سعر الإغلاق أعلى من سعر الافتتاح، مما يدل على صعود السعر."
    },
    {
        question: "ما هو التنويع في الاستثمار؟",
        options: [
            "شراء سهم واحد فقط",
            "توزيع الاستثمار على أصول مختلفة",
            "بيع جميع الأسهم",
            "الاستثمار في بنك واحد فقط"
        ],
        correct: 1,
        explanation: "التنويع يعني توزيع الاستثمارات على أصول وقطاعات مختلفة لتقليل المخاطر الإجمالية."
    },
    {
        question: "ما هو مضاعف الربحية (P/E Ratio)؟",
        options: [
            "نسبة الربح إلى الخسارة",
            "سعر السهم مقسوماً على ربحية السهم",
            "عدد الأسهم المتداولة",
            "قيمة الشركة السوقية"
        ],
        correct: 1,
        explanation: "مضاعف الربحية = سعر السهم ÷ ربحية السهم (EPS)، ويستخدم لتقييم ما إذا كان السهم مبالغاً في سعره أم لا."
    },
    {
        question: "ما هو الفرق بين الاستثمار والمضاربة؟",
        options: [
            "لا يوجد فرق",
            "الاستثمار طويل المدى والمضاربة قصيرة المدى",
            "المضاربة آمنة أكثر",
            "الاستثمار للمحترفين فقط"
        ],
        correct: 1,
        explanation: "الاستثمار يركز على المدى الطويل والتحليل الأساسي، بينما المضاربة تركز على تحركات السعر قصيرة المدى."
    },
    {
        question: "ماذا يعني مصطلح 'محفظة استثمارية'؟",
        options: [
            "محفظة جلدية للنقود",
            "مجموعة الأصول المستثمرة",
            "حساب بنكي",
            "قرض استثماري"
        ],
        correct: 1,
        explanation: "المحفظة الاستثمارية هي مجموعة الأصول المالية التي يمتلكها المستثمر (أسهم، سندات، صناديق، إلخ)."
    },
    {
        question: "ما هو الخط الأزرق في الشمعة اليابانية؟",
        options: [
            "سعر الافتتاح دائماً",
            "الظل العلوي أو السفلي (الذيل)",
            "جسم الشمعة",
            "حجم التداول"
        ],
        correct: 1,
        explanation: "الظل أو الذيل في الشمعة اليابانية يوضح أعلى وأدنى سعر تم الوصول إليه خلال الفترة."
    },
    {
        question: "لماذا يعتبر التحليل الفني مهماً؟",
        options: [
            "للتنبؤ بأسعار المستقبل بناءً على البيانات السابقة",
            "لدراسة أرباح الشركة فقط",
            "لقراءة التقارير المالية",
            "لمعرفة عدد الموظفين"
        ],
        correct: 0,
        explanation: "التحليل الفني يستخدم الرسوم البيانية والأنماط السابقة لتحديد الاتجاهات المحتملة للأسعار."
    },
    {
        question: "ما هي أفضل استراتيجية للمستثمر المبتدئ؟",
        options: [
            "المضاربة اليومية",
            "الاستثمار تدريجياً مع التنويع",
            "بيع جميع الأسهم عند أول انخفاض",
            "الاستثمار في سهم واحد فقط"
        ],
        correct: 1,
        explanation: "الاستثمار التدريجي مع التنويع يقلل المخاطر ويعطي فرصة للتعلم مع الوقت."
    },
    {
        question: "ما هو العائد على الاستثمار (ROI)؟",
        options: [
            "الربح المحقق من الاستثمار",
            "نسبة الربح إلى تكلفة الاستثمار",
            "قيمة الاستثمار الأولي",
            "مجموع الأرباح السنوية"
        ],
        correct: 1,
        explanation: "ROI = (الربح ÷ التكلفة) × 100، ويقيس كفاءة الاستثمار."
    }
];

// بيانات الدروس
const lessonsData = {
    basics: {
        title: "أساسيات الاستثمار",
        content: `
            <h3>ما هو الاستثمار؟</h3>
            <p>الاستثمار هو عملية وضع الأموال في أصول معينة بهدف تحقيق عائد مالي على المدى الطويل.</p>
            
            <h4 class="mt-4">لماذا الاستثمار مهم؟</h4>
            <ul class="list-disc mr-4 mt-2">
                <li>حماية الأموال من التضخم</li>
                <li>بناء ثروة للمستقبل</li>
                <li>تحقيق الأهداف المالية</li>
                <li>تأمين التقاعد</li>
            </ul>
            
            <h4 class="mt-4">أنواع الاستثمارات</h4>
            <div class="grid grid-cols-2 gap-4 mt-2">
                <div class="bg-blue-50 p-3 rounded-lg">
                    <strong>الأسهم</strong>
                    <p class="text-sm">حصص ملكية في الشركات</p>
                </div>
                <div class="bg-green-50 p-3 rounded-lg">
                    <strong>السندات</strong>
                    <p class="text-sm">قروض للشركات أو الحكومات</p>
                </div>
                <div class="bg-purple-50 p-3 rounded-lg">
                    <strong>العقارات</strong>
                    <p class="text-sm">استثمار في العقارات</p>
                </div>
                <div class="bg-orange-50 p-3 rounded-lg">
                    <strong>الصناديق</strong>
                    <p class="text-sm">محافظ مدارة احترافياً</p>
                </div>
            </div>
        `
    },
    'stock-types': {
        title: "أنواع الأسهم",
        content: `
            <h3>تصنيفات الأسهم</h3>
            
            <h4 class="mt-4">حسب الحجم</h4>
            <ul class="list-disc mr-4 mt-2">
                <li><strong>أسهم كبيرة:</strong> شركات بقيمة سوقية عالية (أكثر من 10 مليار)</li>
                <li><strong>أسهم متوسطة:</strong> قيمة سوقية بين 2-10 مليار</li>
                <li><strong>أسهم صغيرة:</strong> قيمة سوقية أقل من 2 مليار</li>
            </ul>
            
            <h4 class="mt-4">حسب القطاع</h4>
            <ul class="list-disc mr-4 mt-2">
                <li>البنوك والمالية</li>
                <li>التكنولوجيا</li>
                <li>الرعاية الصحية</li>
                <li>الطاقة</li>
                <li>العقارات</li>
            </ul>
            
            <h4 class="mt-4">حسب العائد</h4>
            <div class="bg-green-50 p-4 rounded-lg mt-2">
                <strong>أسهم النمو:</strong> شركات تنمو بسرعة، عادة لا توزع أرباحاً
            </div>
            <div class="bg-blue-50 p-4 rounded-lg mt-2">
                <strong>أسهم العائد:</strong> توزع أرباحاً منتظمة للمساهمين
            </div>
        `
    },
    charts: {
        title: "قراءة الرسوم البيانية",
        content: `
            <h3>أنواع الرسوم البيانية</h3>
            
            <h4 class="mt-4">الرسم الخطي</h4>
            <p>أبسط أنواع الرسوم، يربط أسعار الإغلاق بخط متصل.</p>
            
            <h4 class="mt-4">الرسم الشريطي</h4>
            <p>يعرض الافتتاح والإغلاق وأعلى وأدنى سعر لكل فترة.</p>
            
            <h4 class="mt-4">الشموع اليابانية</h4>
            <div class="bg-yellow-50 p-4 rounded-lg mt-2">
                <p>الأكثر شيوعاً، تعرض نفس البيانات لكن بشكل مرئي أوضح:</p>
                <ul class="list-disc mr-4 mt-2">
                    <li>الجسم: المسافة بين الافتتاح والإغلاق</li>
                    <li>الظل العلوي: أعلى سعر</li>
                    <li>الظل السفلي: أدنى سعر</li>
                </ul>
            </div>
            
            <h4 class="mt-4">نصائح لقراءة الرسوم</h4>
            <ul class="list-disc mr-4 mt-2">
                <li>لاحظ الاتجاه العام (صعود/هبوط/عرضي)</li>
                <li>انظر إلى حجم التداول</li>
                <li>حدد مستويات الدعم والمقاومة</li>
            </ul>
        `
    },
    candlesticks: {
        title: "الشموع اليابانية",
        content: `
            <h3>فهم الشموع اليابانية</h3>
            
            <h4 class="mt-4">مكونات الشمعة</h4>
            <div class="bg-gray-50 p-4 rounded-lg">
                <ul class="space-y-2">
                    <li><strong>الجسم:</strong> المستطيل بين سعر الافتتاح والإغلاق</li>
                    <li><strong>الظل العلوي:</strong> الخط من الجسم إلى أعلى سعر</li>
                    <li><strong>الظل السفلي:</strong> الخط من الجسم إلى أدنى سعر</li>
                </ul>
            </div>
            
            <h4 class="mt-4">ألوان الشموع</h4>
            <div class="grid grid-cols-2 gap-4 mt-2">
                <div class="bg-green-100 p-3 rounded-lg text-center">
                    <div class="text-2xl mb-2">🟢</div>
                    <strong>خضراء (صاعدة)</strong>
                    <p class="text-sm">الإغلاق > الافتتاح</p>
                </div>
                <div class="bg-red-100 p-3 rounded-lg text-center">
                    <div class="text-2xl mb-2">🔴</div>
                    <strong>حمراء (هابطة)</strong>
                    <p class="text-sm">الإغلاق < الافتتاح</p>
                </div>
            </div>
            
            <h4 class="mt-4">أنماط مهمة</h4>
            <ul class="list-disc mr-4 mt-2">
                <li><strong>المطرقة:</strong> جسم صغير مع ظل سفلي طويل (انعكاس صعودي)</li>
                <li><strong>الابتلاع:</strong> شمعة تبتلع الشمعة السابقة (انعكاس قوي)</li>
                <li><strong>الدوجي:</strong> الافتتاح = الإغلاق (تردد في السوق)</li>
            </ul>
        `
    },
    risk: {
        title: "إدارة المخاطر",
        content: `
            <h3>أساسيات إدارة المخاطر</h3>
            
            <h4 class="mt-4">أنواع المخاطر</h4>
            <ul class="list-disc mr-4 mt-2">
                <li><strong>مخاطر السوق:</strong> تقلبات الأسعار العامة</li>
                <li><strong>مخاطر الشركة:</strong> مشاكل خاصة بالشركة</li>
                <li><strong>مخاطر السيولة:</strong> صعوبة البيع بسرعة</li>
                <li><strong>مخاطر العملة:</strong> تقلبات سعر الصرف</li>
            </ul>
            
            <h4 class="mt-4">استراتيجيات إدارة المخاطر</h4>
            <div class="bg-blue-50 p-4 rounded-lg mt-2">
                <strong>1. التنويع</strong>
                <p class="text-sm">لا تضع كل بيضك في سلة واحدة</p>
            </div>
            <div class="bg-green-50 p-4 rounded-lg mt-2">
                <strong>2. تحديد وقف الخسارة</strong>
                <p class="text-sm">حدد مستوى الخسارة الأقصى مسبقاً</p>
            </div>
            <div class="bg-purple-50 p-4 rounded-lg mt-2">
                <strong>3. حجم المركز</strong>
                <p class="text-sm">لا تستثمر أكثر من نسبة محددة في سهم واحد</p>
            </div>
            
            <h4 class="mt-4">قاعدة 5%</h4>
            <div class="bg-yellow-50 p-4 rounded-lg mt-2">
                <p>لا تخاطر بأكثر من 5% من محفظتك في صفقة واحدة</p>
            </div>
        `
    },
    diversification: {
        title: "التنويع الاستثماري",
        content: `
            <h3>مفهوم التنويع</h3>
            <p>التنويع هو توزيع الاستثمارات على أصول مختلفة لتقليل المخاطر الإجمالية.</p>
            
            <h4 class="mt-4">كيف تنوع محفظتك؟</h4>
            <ul class="list-disc mr-4 mt-2">
                <li>بين القطاعات المختلفة</li>
                <li>بين أنواع الأصول (أسهم، سندات، عقارات)</li>
                <li>بين الأسواق الجغرافية</li>
                <li>بين أحجام الشركات</li>
            </ul>
            
            <h4 class="mt-4">مثال على محفظة متنوعة</h4>
            <div class="bg-gray-50 p-4 rounded-lg mt-2">
                <div class="flex items-center gap-2 mb-2">
                    <div class="w-4 h-4 bg-blue-500 rounded"></div>
                    <span>40% أسهم محلية</span>
                </div>
                <div class="flex items-center gap-2 mb-2">
                    <div class="w-4 h-4 bg-green-500 rounded"></div>
                    <span>20% أسهم دولية</span>
                </div>
                <div class="flex items-center gap-2 mb-2">
                    <div class="w-4 h-4 bg-purple-500 rounded"></div>
                    <span>20% سندات</span>
                </div>
                <div class="flex items-center gap-2">
                    <div class="w-4 h-4 bg-orange-500 rounded"></div>
                    <span>20% عقارات/نقدية</span>
                </div>
            </div>
            
            <h4 class="mt-4">فوائد التنويع</h4>
            <ul class="list-disc mr-4 mt-2">
                <li>تقليل التقلبات</li>
                <li>حماية من انهيار قطاع معين</li>
                <li>تحقيق عوائد أكثر استقراراً</li>
            </ul>
        `
    }
};

/**
 * تهيئة مركز التعلم
 */
export function initializeLearningCenter() {
    loadLearningProgress();
    initializeTabs();
    initializeLessons();
    initializeCandlestickDemo();
    initializeSimulation();
    initializeCalculators();
    initializeQuiz();
    initializeCoursesTab();
    initializeGamification();
}

/**
 * تهيئة نظام الألعاب
 */
function initializeGamification() {
    // تحديث عرض XP والرتبة
    updateXPDisplay();
    
    // تحديث عرض الشارات
    updateBadgesDisplay();
}

/**
 * تحديث عرض XP
 */
function updateXPDisplay() {
    const xp = calculateTotalXP();
    const rank = getRankFromXP(xp);
    const level = getLevelFromXP(xp);
    
    const xpEl = document.getElementById('userXP');
    const rankIconEl = document.getElementById('userRankIcon');
    const rankNameEl = document.getElementById('userRankName');
    const progressEl = document.getElementById('xpProgressBar');
    
    if (xpEl) xpEl.textContent = `${xp} XP`;
    if (rankIconEl) rankIconEl.textContent = rank.icon;
    if (rankNameEl) rankNameEl.textContent = rank.name;
    if (progressEl) progressEl.style.width = `${level.progress}%`;
}

/**
 * حساب إجمالي XP
 */
function calculateTotalXP() {
    let xp = 0;
    xp += learningState.completedLessons.length * 50;
    xp += learningState.quizScore * 5;
    xp += learningState.simulationCount * 10;
    xp += learningState.streakDays * 20;
    xp += (learningState.userBadges || []).reduce((sum, badge) => {
        const badgeXP = { firstTrade: 50, profitableTrade: 100, diversified: 150, quizMaster: 200, weekStreak: 250, monthStreak: 500, courseComplete: 300, portfolio100k: 400, portfolio200k: 800, patternExpert: 300 };
        return sum + (badgeXP[badge] || 0);
    }, 0);
    return xp;
}

/**
 * الحصول على الرتبة من XP
 */
function getRankFromXP(xp) {
    const ranks = [
        { name: 'مبتدئ', icon: '🌱', minXP: 0 },
        { name: 'متعلم', icon: '📚', minXP: 500 },
        { name: 'ممارس', icon: '💪', minXP: 1500 },
        { name: 'متقدم', icon: '🚀', minXP: 3000 },
        { name: 'خبير', icon: '⭐', minXP: 5000 },
        { name: 'محترف', icon: '🏆', minXP: 8000 },
        { name: 'سيد', icon: '👑', minXP: 12000 },
        { name: 'أسطورة', icon: '💎', minXP: 20000 }
    ];
    
    let currentRank = ranks[0];
    for (let i = ranks.length - 1; i >= 0; i--) {
        if (xp >= ranks[i].minXP) {
            currentRank = ranks[i];
            break;
        }
    }
    return currentRank;
}

/**
 * الحصول على المستوى من XP
 */
function getLevelFromXP(xp) {
    let level = 1;
    let xpRequired = 100;
    let totalXp = 0;
    
    while (totalXp + xpRequired <= xp) {
        totalXp += xpRequired;
        level++;
        xpRequired = Math.floor(xpRequired * 1.5);
    }
    
    return {
        level,
        currentXp: xp - totalXp,
        xpToNextLevel: xpRequired,
        progress: ((xp - totalXp) / xpRequired) * 100
    };
}

/**
 * تحديث عرض الشارات
 */
function updateBadgesDisplay() {
    const badges = learningState.userBadges || [];
    const recentBadgesEl = document.getElementById('recentBadges');
    const badgesCountEl = document.getElementById('badgesCount');
    
    if (badgesCountEl) {
        badgesCountEl.textContent = badges.length;
    }
    
    if (recentBadgesEl) {
        const badgeIcons = {
            firstTrade: '🎯',
            profitableTrade: '💰',
            diversified: '🎨',
            quizMaster: '📝',
            weekStreak: '🔥',
            monthStreak: '🏆',
            courseComplete: '🎓',
            portfolio100k: '💎',
            portfolio200k: '👑',
            patternExpert: '📊'
        };
        
        const recentFive = badges.slice(-5);
        let html = '';
        
        for (let i = 0; i < 5; i++) {
            if (i < recentFive.length) {
                html += `<div class="w-10 h-10 bg-yellow-100 rounded-full flex items-center justify-center text-lg" title="${recentFive[i]}">${badgeIcons[recentFive[i]] || '🏅'}</div>`;
            } else {
                html += `<div class="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center text-gray-400 text-lg">?</div>`;
            }
        }
        
        recentBadgesEl.innerHTML = html;
    }
    
    // تحديث الشارات في صفحة الإنجازات
    badges.forEach(badgeId => {
        const badgeCard = document.querySelector(`[data-badge="${badgeId}"]`);
        if (badgeCard) {
            badgeCard.classList.remove('opacity-50', 'bg-gray-50');
            badgeCard.classList.add('bg-yellow-50');
            const icon = badgeCard.querySelector('.text-4xl');
            if (icon) icon.classList.remove('grayscale');
        }
    });
}

/**
 * عرض جميع الإنجازات
 */
window.showAllAchievements = function() {
    // التبديل إلى تبويب الإنجازات
    const achievementsTab = document.querySelector('[data-tab="achievements"]');
    if (achievementsTab) {
        achievementsTab.click();
    }
};

/**
 * تحميل تقدم التعلم من التخزين المحلي
 */
function loadLearningProgress() {
    const saved = localStorage.getItem('learningProgress');
    if (saved) {
        const data = JSON.parse(saved);
        learningState.completedLessons = data.completedLessons || [];
        learningState.quizScore = data.quizScore || 0;
        learningState.simulationCount = data.simulationCount || 0;
        learningState.streakDays = data.streakDays || 0;
    }
    updateProgressUI();
}

/**
 * حفظ تقدم التعلم
 */
function saveLearningProgress() {
    localStorage.setItem('learningProgress', JSON.stringify({
        completedLessons: learningState.completedLessons,
        quizScore: learningState.quizScore,
        simulationCount: learningState.simulationCount,
        streakDays: learningState.streakDays
    }));
    updateProgressUI();
}

/**
 * تحديث واجهة التقدم
 */
function updateProgressUI() {
    const totalLessons = Object.keys(lessonsData).length;
    const completed = learningState.completedLessons.length;
    const progress = Math.round((completed / totalLessons) * 100);
    
    document.getElementById('learningProgressBar').style.width = `${progress}%`;
    document.getElementById('learningProgressText').textContent = `${progress}% مكتمل`;
    document.getElementById('completedLessons').textContent = completed;
    document.getElementById('quizScore').textContent = `${learningState.quizScore}%`;
    document.getElementById('simulationCount').textContent = learningState.simulationCount;
    document.getElementById('streakDays').textContent = learningState.streakDays;
    
    // تحديث شريط التقدم في بطاقات الدروس
    document.querySelectorAll('.lesson-card').forEach(card => {
        const lesson = card.dataset.lesson;
        const progressBar = card.querySelector('.lesson-progress');
        if (progressBar) {
            if (learningState.completedLessons.includes(lesson)) {
                progressBar.style.width = '100%';
            }
        }
    });
}

/**
 * تهيئة التبويبات
 */
function initializeTabs() {
    document.querySelectorAll('.learning-tab').forEach(tab => {
        tab.addEventListener('click', () => {
            // إزالة الحالة النشطة من جميع التبويبات
            document.querySelectorAll('.learning-tab').forEach(t => {
                t.classList.remove('active', 'border-blue-600', 'text-blue-600');
                t.classList.add('border-transparent', 'text-gray-500');
            });
            
            // تفعيل التبويب المحدد
            tab.classList.add('active', 'border-blue-600', 'text-blue-600');
            tab.classList.remove('border-transparent', 'text-gray-500');
            
            // إخفاء جميع المحتويات
            const allContentIds = [
                '#lessonsContent', '#chartsContent', '#simulationsContent',
                '#calculatorsContent', '#quizContent', '#coursesContent',
                '#liveSimulationContent', '#patternsContent', '#achievementsContent'
            ];
            document.querySelectorAll(allContentIds.join(', ')).forEach(content => {
                content.classList.add('hidden');
            });
            
            // إظهار المحتوى المحدد
            const tabName = tab.dataset.tab;
            const contentEl = document.getElementById(`${tabName}Content`);
            if (contentEl) {
                contentEl.classList.remove('hidden');
            }
            
            // تهيئة المحتوى الخاص بكل تبويب
            initializeTabContent(tabName);
        });
    });
}

/**
 * تهيئة محتوى التبويب
 */
function initializeTabContent(tabName) {
    switch(tabName) {
        case 'courses':
            initializeCoursesTab();
            break;
        case 'live-simulation':
            initializeLiveSimulation();
            break;
        case 'patterns':
            initializePatternTrainer();
            break;
        case 'achievements':
            updateAchievementsDisplay();
            break;
    }
}

/**
 * تهيئة تبويب الدورات
 */
function initializeCoursesTab() {
    ensureMergedCourseCard();

    document.querySelectorAll('.course-card').forEach(card => {
        card.addEventListener('click', () => {
            const courseId = card.dataset.course;
            openCourseModal(courseId);
        });
    });
}

function ensureMergedCourseCard() {
    const mergedCourse = mergedCoursesData?.integratedMaster;
    if (!mergedCourse) return;

    const coursesGrid = document.querySelector('#coursesContent .course-card')?.parentElement;
    if (!coursesGrid) return;
    if (coursesGrid.querySelector('[data-course="integratedMaster"]')) return;

    const lessonsCount = (mergedCourse.modules || []).reduce((sum, module) => {
        return sum + ((module.lessons || []).length);
    }, 0);

    const previewItems = (mergedCourse.modules || [])
        .slice(0, 3)
        .map(module => `
            <div class="flex items-center gap-2 text-sm">
                <i class="fas fa-check-circle text-purple-500"></i>
                <span>${module.title}</span>
            </div>
        `)
        .join('');

    const card = document.createElement('div');
    card.className = 'bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl overflow-hidden border border-purple-200 hover:shadow-lg transition-shadow cursor-pointer course-card';
    card.dataset.course = 'integratedMaster';
    card.innerHTML = `
        <div class="bg-purple-700 text-white p-4">
            <div class="flex items-center justify-between">
                <span class="text-3xl">📚</span>
                <span class="bg-white/20 px-2 py-1 rounded text-sm">${mergedCourse.xpReward || 3500} XP</span>
            </div>
            <h4 class="text-xl font-bold mt-2">المسار المتكامل للاستثمار</h4>
            <p class="text-purple-100 text-sm mt-1">دمج كامل من investment-course + المحتوى الحالي</p>
        </div>
        <div class="p-4">
            <div class="flex items-center gap-2 text-sm text-gray-600 mb-3">
                <i class="fas fa-clock"></i>
                <span>${mergedCourse.estimatedHours || 0} ساعة</span>
                <span class="mx-2">•</span>
                <i class="fas fa-book"></i>
                <span>${lessonsCount} درس</span>
            </div>
            <div class="space-y-2 mb-4">${previewItems}</div>
            <div class="flex items-center justify-between">
                <div class="text-sm text-gray-500">
                    <span class="font-bold text-purple-600">0%</span> مكتمل
                </div>
                <button class="px-4 py-2 bg-purple-700 text-white rounded-lg text-sm hover:bg-purple-800">
                    ابدأ الدورة
                </button>
            </div>
        </div>
    `;

    coursesGrid.appendChild(card);
}

/**
 * فتح نافذة الدورة
 */
function openCourseModal(courseId) {
    // إنشاء نافذة الدورة
    const modal = document.createElement('div');
    modal.className = 'fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4';
    modal.id = 'courseModal';
    
    const courses = {
        beginner: {
            title: 'أساسيات الاستثمار',
            color: 'green',
            modules: [
                { title: 'مقدمة في الاستثمار', lessons: ['ما هو الاستثمار؟', 'لماذا نستثمر؟', 'أنواع المستثمرين'] },
                { title: 'أساسيات الأسهم', lessons: ['ما هي الأسهم؟', 'كيف تعمل الأسهم؟', 'قراءة الأسعار'] }
            ]
        },
        intermediate: {
            title: 'التحليل الفني',
            color: 'blue',
            modules: [
                { title: 'قراءة الرسوم البيانية', lessons: ['أنواع الرسوم', 'الشموع اليابانية', 'مكونات الشمعة'] },
                { title: 'أنماط الشموع', lessons: ['الأنماط الصعودية', 'الأنماط الهبوطية', 'أنماط الاستمرار'] }
            ]
        },
        advanced: {
            title: 'استراتيجيات متقدمة',
            color: 'purple',
            modules: [
                { title: 'إدارة المحافظ', lessons: ['نظرية المحفظة', 'توزيع الأصول', 'إدارة المخاطر'] }
            ]
        }
    };
    
    const mergedCourse = mergedCoursesData?.integratedMaster;
    if (mergedCourse) {
        courses.integratedMaster = {
            title: 'المسار المتكامل للاستثمار',
            color: 'purple',
            modules: (mergedCourse.modules || []).map(module => ({
                title: module.title,
                lessons: (module.lessons || []).map(lesson => lesson.title)
            }))
        };
    }

    const course = courses[courseId];
    if (!course) return;
    
    modal.innerHTML = `
        <div class="bg-white rounded-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden">
            <div class="bg-${course.color}-600 text-white p-6">
                <div class="flex items-center justify-between">
                    <h2 class="text-2xl font-bold">${course.title}</h2>
                    <button class="text-white/80 hover:text-white text-2xl" onclick="this.closest('#courseModal').remove()">
                        <i class="fas fa-times"></i>
                    </button>
                </div>
            </div>
            <div class="p-6 overflow-y-auto max-h-[60vh]">
                ${course.modules.map((module, i) => `
                    <div class="mb-6">
                        <h3 class="font-bold text-lg mb-3">${i + 1}. ${module.title}</h3>
                        <div class="space-y-2">
                            ${module.lessons.map((lesson, j) => `
                                <div class="flex items-center gap-3 p-3 bg-gray-50 rounded-lg hover:bg-gray-100 cursor-pointer">
                                    <div class="w-8 h-8 bg-${course.color}-100 text-${course.color}-600 rounded-full flex items-center justify-center text-sm font-bold">
                                        ${i + 1}.${j + 1}
                                    </div>
                                    <span>${lesson}</span>
                                    <i class="fas fa-lock text-gray-300 mr-auto"></i>
                                </div>
                            `).join('')}
                        </div>
                    </div>
                `).join('')}
            </div>
            <div class="p-4 border-t flex justify-end gap-3">
                <button class="px-4 py-2 border rounded-lg hover:bg-gray-50" onclick="this.closest('#courseModal').remove()">
                    إغلاق
                </button>
                <button class="px-4 py-2 bg-${course.color}-600 text-white rounded-lg hover:bg-${course.color}-700">
                    ابدأ التعلم
                </button>
            </div>
        </div>
    `;
    
    document.body.appendChild(modal);
    modal.addEventListener('click', (e) => {
        if (e.target === modal) modal.remove();
    });
}

// متغيرات المحاكاة الحية
let liveSimulationRunning = false;
let liveSimulationInterval = null;
let livePrices = {
    ETEL: 25.50,
    COMI: 85.20,
    AMOC: 18.75,
    SWDY: 42.30
};

/**
 * تهيئة المحاكاة الحية
 */
function initializeLiveSimulation() {
    const startBtn = document.getElementById('startLiveSimBtn');
    if (!startBtn) return;
    
    startBtn.addEventListener('click', toggleLiveSimulation);
    
    // تحديث السعر عند تغيير السهم
    document.getElementById('liveSimStock')?.addEventListener('change', (e) => {
        updateLivePriceDisplay(e.target.value);
    });
    
    // تحديث إجمالي الصفقة
    document.getElementById('liveShares')?.addEventListener('input', updateLiveTotalCost);
    
    // تنفيذ الصفقة
    document.getElementById('executeLiveTradeBtn')?.addEventListener('click', executeLiveTrade);
}

/**
 * تبديل حالة المحاكاة الحية
 */
function toggleLiveSimulation() {
    const btn = document.getElementById('startLiveSimBtn');
    
    if (liveSimulationRunning) {
        clearInterval(liveSimulationInterval);
        liveSimulationRunning = false;
        btn.innerHTML = '<i class="fas fa-play ml-1"></i>ابدأ المحاكاة';
        btn.classList.remove('bg-red-600', 'hover:bg-red-700');
        btn.classList.add('bg-green-600', 'hover:bg-green-700');
    } else {
        liveSimulationRunning = true;
        btn.innerHTML = '<i class="fas fa-stop ml-1"></i>إيقاف المحاكاة';
        btn.classList.remove('bg-green-600', 'hover:bg-green-700');
        btn.classList.add('bg-red-600', 'hover:bg-red-700');
        
        liveSimulationInterval = setInterval(() => {
            updateLivePrices();
        }, 2000);
    }
}

/**
 * تحديث الأسعار الحية
 */
function updateLivePrices() {
    const scenario = document.getElementById('marketScenario')?.value || 'sideways';
    const trendBias = {
        'bullMarket': 0.7,
        'bearMarket': -0.7,
        'sideways': 0,
        'crash': -0.95,
        'recovery': 0.5
    }[scenario] || 0;
    
    Object.keys(livePrices).forEach(ticker => {
        const baseChange = (Math.random() - 0.5) * 2;
        const trendChange = trendBias * 0.5;
        const change = (baseChange + trendChange) * 0.02 * livePrices[ticker];
        livePrices[ticker] = Math.max(0.01, livePrices[ticker] + change);
    });
    
    const selectedStock = document.getElementById('liveSimStock')?.value || 'ETEL';
    updateLivePriceDisplay(selectedStock);
}

/**
 * تحديث عرض السعر الحي
 */
function updateLivePriceDisplay(ticker) {
    const price = livePrices[ticker];
    const priceEl = document.getElementById('livePrice');
    const changeEl = document.getElementById('liveChange');
    
    if (priceEl) {
        const oldPrice = parseFloat(priceEl.textContent);
        const change = price - oldPrice;
        const changePercent = (change / oldPrice) * 100;
        
        priceEl.textContent = price.toFixed(2);
        changeEl.textContent = `${changePercent >= 0 ? '+' : ''}${changePercent.toFixed(2)}%`;
        changeEl.className = `text-sm ${changePercent >= 0 ? 'text-green-400' : 'text-red-400'}`;
    }
    
    updateLiveTotalCost();
}

/**
 * تحديث إجمالي الصفقة
 */
function updateLiveTotalCost() {
    const stock = document.getElementById('liveSimStock')?.value || 'ETEL';
    const shares = parseInt(document.getElementById('liveShares')?.value) || 0;
    const price = livePrices[stock] || 0;
    const total = shares * price;
    
    const totalEl = document.getElementById('liveTotalCost');
    if (totalEl) {
        totalEl.textContent = `${total.toLocaleString('ar-EG')} ج.م`;
    }
}

/**
 * تنفيذ صفقة حية
 */
function executeLiveTrade() {
    const stock = document.getElementById('liveSimStock')?.value || 'ETEL';
    const shares = parseInt(document.getElementById('liveShares')?.value) || 0;
    const price = livePrices[stock] || 0;
    const total = shares * price;
    
    if (shares <= 0) {
        showNotification('الرجاء إدخال عدد أسهم صحيح', 'warning');
        return;
    }
    
    // تحديث الرصيد
    const balanceEl = document.getElementById('liveBalance');
    let balance = parseInt(balanceEl?.textContent.replace(/[^0-9]/g, '') || '100000');
    
    if (total > balance) {
        showNotification('رصيد غير كافي', 'danger');
        return;
    }
    
    balance -= total;
    if (balanceEl) {
        balanceEl.textContent = `${balance.toLocaleString('ar-EG')} ج.م`;
    }
    
    // إضافة XP
    addXP(10);
    
    showNotification(`تم شراء ${shares} سهم من ${stock} بسعر ${price.toFixed(2)}`, 'success');
    
    // تحديث الإنجازات
    checkAchievements();
}

// متغيرات مدرب الأنماط
let patternTrainerActive = false;
let currentPattern = null;
let patternScore = 0;
let patternStreak = 0;

/**
 * تهيئة مدرب الأنماط
 */
function initializePatternTrainer() {
    const startBtn = document.getElementById('startPatternTrainingBtn');
    if (!startBtn) return;
    
    startBtn.addEventListener('click', startPatternTraining);
    
    document.getElementById('hintBtn')?.addEventListener('click', showPatternHint);
}

/**
 * بدء تدريب الأنماط
 */
function startPatternTraining() {
    patternTrainerActive = true;
    showNextPattern();
}

/**
 * عرض النمط التالي
 */
function showNextPattern() {
    const patterns = [
        { name: 'المطرقة', nameEn: 'Hammer', type: 'bullish' },
        { name: 'الابتلاع الصعودي', nameEn: 'Bullish Engulfing', type: 'bullish' },
        { name: 'نجمة الصبح', nameEn: 'Morning Star', type: 'bullish' },
        { name: 'النجم الساقط', nameEn: 'Shooting Star', type: 'bearish' },
        { name: 'الابتلاع الهبوطي', nameEn: 'Bearish Engulfing', type: 'bearish' },
        { name: 'الدوجي', nameEn: 'Doji', type: 'continuation' }
    ];
    
    currentPattern = patterns[Math.floor(Math.random() * patterns.length)];
    
    const displayArea = document.getElementById('patternDisplayArea');
    if (displayArea) {
        displayArea.innerHTML = `
            <div class="text-center">
                <div class="mb-4">
                    <svg viewBox="0 0 200 150" class="w-64 h-48 mx-auto">
                        ${generatePatternSVG(currentPattern.type)}
                    </svg>
                </div>
                <p class="text-gray-600">ما هو هذا النمط؟</p>
            </div>
        `;
    }
    
    // عرض الخيارات
    const optionsContainer = document.getElementById('patternOptions');
    if (optionsContainer) {
        const shuffled = [...patterns].sort(() => Math.random() - 0.5).slice(0, 4);
        if (!shuffled.includes(currentPattern)) {
            shuffled[0] = currentPattern;
        }
        
        optionsContainer.innerHTML = shuffled.map(p => `
            <button class="w-full p-3 text-right border rounded-lg hover:bg-blue-50 hover:border-blue-300 transition-colors pattern-option" data-pattern="${p.name}" data-correct="${p.name === currentPattern.name}">
                <span class="font-medium">${p.name}</span>
                <span class="text-xs text-gray-400 mr-2">${p.nameEn}</span>
            </button>
        `).join('');
        
        optionsContainer.querySelectorAll('.pattern-option').forEach(btn => {
            btn.addEventListener('click', () => checkPatternAnswer(btn.dataset.correct === 'true'));
        });
    }
}

/**
 * توليد SVG للنمط
 */
function generatePatternSVG(type) {
    const color = type === 'bullish' ? '#10b981' : type === 'bearish' ? '#ef4444' : '#6b7280';
    return `
        <rect x="80" y="40" width="40" height="60" fill="${color}" rx="2"/>
        <line x1="100" y1="20" x2="100" y2="40" stroke="${color}" stroke-width="2"/>
        <line x1="100" y1="100" x2="100" y2="130" stroke="${color}" stroke-width="2"/>
    `;
}

/**
 * التحقق من إجابة النمط
 */
function checkPatternAnswer(isCorrect) {
    if (isCorrect) {
        patternScore += 10;
        patternStreak++;
        showNotification(`صحيح! 🎉 +10 نقاط`, 'success');
        addXP(10);
    } else {
        patternStreak = 0;
        showNotification('خطأ! حاول مرة أخرى', 'danger');
    }
    
    // تحديث الإحصائيات
    const scoreEl = document.getElementById('patternScore');
    const streakEl = document.getElementById('patternStreak');
    if (scoreEl) scoreEl.textContent = patternScore;
    if (streakEl) streakEl.textContent = `${patternStreak} 🔥`;
    
    setTimeout(showNextPattern, 1500);
}

/**
 * عرض تلميح النمط
 */
function showPatternHint() {
    if (currentPattern) {
        showNotification(`نوع النمط: ${currentPattern.type === 'bullish' ? 'صعودي' : currentPattern.type === 'bearish' ? 'هبوطي' : 'استمرار'}`, 'info');
        patternScore = Math.max(0, patternScore - 5);
        const scoreEl = document.getElementById('patternScore');
        if (scoreEl) scoreEl.textContent = patternScore;
    }
}

/**
 * تحديث عرض الإنجازات
 */
function updateAchievementsDisplay() {
    // تحديث الرتبة الحالية
    const xp = learningState.quizScore * 10 + learningState.simulationCount * 5;
    
    const ranks = [
        { name: 'مبتدئ', icon: '🌱', minXP: 0 },
        { name: 'متعلم', icon: '📚', minXP: 500 },
        { name: 'ممارس', icon: '💪', minXP: 1500 },
        { name: 'متقدم', icon: '🚀', minXP: 3000 },
        { name: 'خبير', icon: '⭐', minXP: 5000 },
        { name: 'محترف', icon: '🏆', minXP: 8000 },
        { name: 'سيد', icon: '👑', minXP: 12000 },
        { name: 'أسطورة', icon: '💎', minXP: 20000 }
    ];
    
    let currentRank = ranks[0];
    let nextRank = ranks[1];
    
    for (let i = ranks.length - 1; i >= 0; i--) {
        if (xp >= ranks[i].minXP) {
            currentRank = ranks[i];
            nextRank = ranks[i + 1] || ranks[i];
            break;
        }
    }
    
    const rankIconEl = document.getElementById('currentRankIcon');
    const rankNameEl = document.getElementById('currentRankName');
    const rankXPEl = document.getElementById('currentRankXP');
    const nextRankEl = document.getElementById('nextRankName');
    const nextXPEl = document.getElementById('nextRankXP');
    
    if (rankIconEl) rankIconEl.textContent = currentRank.icon;
    if (rankNameEl) rankNameEl.textContent = currentRank.name;
    if (rankXPEl) rankXPEl.textContent = `${xp} نقطة خبرة`;
    if (nextRankEl) nextRankEl.textContent = nextRank.name;
    if (nextXPEl) nextXPEl.textContent = `${nextRank.minXP} XP مطلوب`;
}

/**
 * إضافة نقاط الخبرة
 */
function addXP(amount) {
    learningState.quizScore = Math.min(100, (learningState.quizScore || 0) + amount / 10);
    saveLearningProgress();
    updateProgressUI();
}

/**
 * التحقق من الإنجازات
 */
function checkAchievements() {
    // التحقق من شارة الصفقة الأولى
    if (learningState.simulation.transactions.length >= 1) {
        unlockBadge('firstTrade');
    }
    
    // تحديث عدد الشارات
    const badgesCount = document.getElementById('badgesCount');
    if (badgesCount) {
        badgesCount.textContent = learningState.userBadges?.length || 0;
    }
}

/**
 * فتح شارة
 */
function unlockBadge(badgeId) {
    if (!learningState.userBadges) {
        learningState.userBadges = [];
    }
    
    if (!learningState.userBadges.includes(badgeId)) {
        learningState.userBadges.push(badgeId);
        
        // تحديث عرض الشارة
        const badgeCard = document.querySelector(`[data-badge="${badgeId}"]`);
        if (badgeCard) {
            badgeCard.classList.remove('opacity-50', 'bg-gray-50');
            badgeCard.classList.add('bg-yellow-50');
            badgeCard.querySelector('.text-4xl').classList.remove('grayscale');
        }
        
        showNotification(`🎉 فتحت شارة جديدة!`, 'success');
        saveLearningProgress();
    }
}

// تهيئة الإنجازات عند التحميل
if (!learningState.userBadges) {
    learningState.userBadges = [];
}

/**
 * تهيئة الدروس
 */
function initializeLessons() {
    document.querySelectorAll('.lesson-card').forEach(card => {
        card.addEventListener('click', () => {
            const lessonId = card.dataset.lesson;
            openLessonModal(lessonId);
        });
    });
}

/**
 * فتح نافذة الدرس
 */
function openLessonModal(lessonId) {
    const lesson = lessonsData[lessonId];
    if (!lesson) return;
    
    // إنشاء نافذة الدرس
    const modal = document.createElement('div');
    modal.className = 'fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4';
    modal.innerHTML = `
        <div class="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-hidden">
            <div class="p-6 border-b border-gray-200 flex items-center justify-between">
                <h3 class="text-xl font-semibold text-gray-900">${lesson.title}</h3>
                <button class="text-gray-400 hover:text-gray-600 text-2xl close-lesson">&times;</button>
            </div>
            <div class="p-6 overflow-y-auto max-h-[60vh] lesson-content">
                ${lesson.content}
            </div>
            <div class="p-4 border-t border-gray-200 flex justify-between">
                <button class="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 close-lesson">
                    إغلاق
                </button>
                <button class="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 complete-lesson" data-lesson="${lessonId}">
                    <i class="fas fa-check ml-2"></i>إكمال الدرس
                </button>
            </div>
        </div>
    `;
    
    document.body.appendChild(modal);
    document.body.classList.add('overflow-hidden');
    
    // إغلاق النافذة
    modal.querySelectorAll('.close-lesson').forEach(btn => {
        btn.addEventListener('click', () => {
            modal.remove();
            document.body.classList.remove('overflow-hidden');
        });
    });
    
    // إكمال الدرس
    modal.querySelector('.complete-lesson').addEventListener('click', () => {
        if (!learningState.completedLessons.includes(lessonId)) {
            learningState.completedLessons.push(lessonId);
            saveLearningProgress();
            showNotification('تم إكمال الدرس بنجاح! 🎉', 'success');
        }
        modal.remove();
        document.body.classList.remove('overflow-hidden');
    });
    
    // إغلاق عند النقر خارج النافذة
    modal.addEventListener('click', (e) => {
        if (e.target === modal) {
            modal.remove();
            document.body.classList.remove('overflow-hidden');
        }
    });
}

/**
 * تهيئة عرض الشموع التفاعلي
 */
function initializeCandlestickDemo() {
    const container = document.getElementById('candlestickDemo');
    if (!container) return;
    
    // إنشاء رسم شموع بسيط
    renderCandlestick('bullish');
    
    document.getElementById('candleBullishBtn')?.addEventListener('click', () => renderCandlestick('bullish'));
    document.getElementById('candleBearishBtn')?.addEventListener('click', () => renderCandlestick('bearish'));
    document.getElementById('candleDojiBtn')?.addEventListener('click', () => renderCandlestick('doji'));
    
    // أنماط الشموع
    document.querySelectorAll('.pattern-card').forEach(card => {
        card.addEventListener('click', () => {
            const pattern = card.dataset.pattern;
            showPatternExplanation(pattern);
        });
    });
}

/**
 * رسم الشمعة
 */
function renderCandlestick(type) {
    const container = document.getElementById('candlestickDemo');
    const title = document.getElementById('candleTitle');
    const explanation = document.getElementById('candleExplanation');
    
    let candleHtml = '';
    let candleTitle = '';
    let candleExp = '';
    
    switch(type) {
        case 'bullish':
            candleHtml = `
                <svg viewBox="0 0 200 250" class="w-full h-full">
                    <!-- الظل العلوي -->
                    <line x1="100" y1="30" x2="100" y2="80" stroke="#059669" stroke-width="3"/>
                    <!-- الجسم -->
                    <rect x="60" y="80" width="80" height="100" fill="#10b981" rx="4"/>
                    <!-- الظل السفلي -->
                    <line x1="100" y1="180" x2="100" y2="220" stroke="#059669" stroke-width="3"/>
                    <!-- التسميات -->
                    <text x="150" y="35" class="text-xs fill-gray-500">أعلى سعر</text>
                    <text x="150" y="85" class="text-xs fill-gray-500">الإغلاق</text>
                    <text x="150" y="135" class="text-xs fill-gray-500">الافتتاح</text>
                    <text x="150" y="225" class="text-xs fill-gray-500">أدنى سعر</text>
                </svg>
            `;
            candleTitle = 'الشمعة الصاعدة (الخضراء)';
            candleExp = `
                <p><strong>المعنى:</strong> السعر أغلق أعلى من الافتتاح</p>
                <p><strong>الدلالة:</strong> سيطرة المشترين على السوق</p>
                <p><strong>الجسم:</strong> كلما كان أكبر، كان الضغط الشرائي أقوى</p>
                <p class="mt-4 p-3 bg-green-50 rounded-lg"><i class="fas fa-arrow-up text-green-500 ml-2"></i>إشارة إيجابية للسهم</p>
            `;
            break;
        case 'bearish':
            candleHtml = `
                <svg viewBox="0 0 200 250" class="w-full h-full">
                    <!-- الظل العلوي -->
                    <line x1="100" y1="30" x2="100" y2="80" stroke="#dc2626" stroke-width="3"/>
                    <!-- الجسم -->
                    <rect x="60" y="80" width="80" height="100" fill="#ef4444" rx="4"/>
                    <!-- الظل السفلي -->
                    <line x1="100" y1="180" x2="100" y2="220" stroke="#dc2626" stroke-width="3"/>
                    <!-- التسميات -->
                    <text x="150" y="35" class="text-xs fill-gray-500">أعلى سعر</text>
                    <text x="150" y="85" class="text-xs fill-gray-500">الافتتاح</text>
                    <text x="150" y="135" class="text-xs fill-gray-500">الإغلاق</text>
                    <text x="150" y="225" class="text-xs fill-gray-500">أدنى سعر</text>
                </svg>
            `;
            candleTitle = 'الشمعة الهابطة (الحمراء)';
            candleExp = `
                <p><strong>المعنى:</strong> السعر أغلق أقل من الافتتاح</p>
                <p><strong>الدلالة:</strong> سيطرة البائعين على السوق</p>
                <p><strong>الجسم:</strong> كلما كان أكبر، كان الضغط البيعي أقوى</p>
                <p class="mt-4 p-3 bg-red-50 rounded-lg"><i class="fas fa-arrow-down text-red-500 ml-2"></i>إشارة سلبية للسهم</p>
            `;
            break;
        case 'doji':
            candleHtml = `
                <svg viewBox="0 0 200 250" class="w-full h-full">
                    <!-- الظل العلوي -->
                    <line x1="100" y1="30" x2="100" y2="120" stroke="#6b7280" stroke-width="3"/>
                    <!-- الجسم (خط رفيع) -->
                    <line x1="60" y1="120" x2="140" y2="120" stroke="#374151" stroke-width="4"/>
                    <!-- الظل السفلي -->
                    <line x1="100" y1="120" x2="100" y2="220" stroke="#6b7280" stroke-width="3"/>
                    <!-- التسميات -->
                    <text x="150" y="35" class="text-xs fill-gray-500">أعلى سعر</text>
                    <text x="150" y="125" class="text-xs fill-gray-500">الافتتاح = الإغلاق</text>
                    <text x="150" y="225" class="text-xs fill-gray-500">أدنى سعر</text>
                </svg>
            `;
            candleTitle = 'شمعة الدوجي';
            candleExp = `
                <p><strong>المعنى:</strong> سعر الافتتاح يساوي الإغلاق تقريباً</p>
                <p><strong>الدلالة:</strong> توازن بين المشترين والبائعين</p>
                <p><strong>الأهمية:</strong> قد تشير إلى انعكاس قريب</p>
                <p class="mt-4 p-3 bg-yellow-50 rounded-lg"><i class="fas fa-exclamation-triangle text-yellow-500 ml-2"></i>تتطلب تأكيداً من الشموع التالية</p>
            `;
            break;
    }
    
    container.innerHTML = candleHtml;
    title.textContent = candleTitle;
    explanation.innerHTML = candleExp;
}

/**
 * عرض شرح النمط
 */
function showPatternExplanation(pattern) {
    const patterns = {
        hammer: {
            title: 'نمط المطرقة',
            explanation: 'شمعة بجسم صغير وظل سفلي طويل (ضعف الجسم على الأقل). تظهر في قاع الاتجاه الهابط وتشير إلى انعكاس صعودي محتمل.'
        },
        engulfing: {
            title: 'نمط الابتلاع',
            explanation: 'شمعة تبتلع الشمعة السابقة بالكامل. الابتلاع الصعودي (شمعة خضراء تبتلع حمراء) إشارة شرائية قوية.'
        },
        morningstar: {
            title: 'نمط نجمة الصبح',
            explanation: 'نمط من ثلاث شموع: شمعة حمراء طويلة، ثم شمعة صغيرة (فجوة)، ثم شمعة خضراء طويلة. إشارة انعكاس صعودي قوية.'
        },
        threewhite: {
            title: 'نمط ثلاثة جنود بيض',
            explanation: 'ثلاث شموع خضراء متتالية، كل واحدة تفتح داخل جسم السابقة وتغلق أعلى. تأكيد قوي للاتجاه الصاعد.'
        }
    };
    
    const p = patterns[pattern];
    if (p) {
        showNotification(`${p.title}: ${p.explanation}`, 'info', 5000);
    }
}

/**
 * تهيئة المحاكاة
 */
function initializeSimulation() {
    // تحديث السعر عشوائياً
    setInterval(() => {
        const priceEl = document.getElementById('simStockPrice');
        const changeEl = document.getElementById('simStockChange');
        if (priceEl && changeEl) {
            const currentPrice = parseFloat(priceEl.textContent);
            const change = (Math.random() - 0.5) * 2;
            const newPrice = currentPrice + change;
            const percentChange = ((change / currentPrice) * 100);
            
            priceEl.textContent = newPrice.toFixed(2);
            changeEl.textContent = `${percentChange >= 0 ? '+' : ''}${percentChange.toFixed(2)}%`;
            changeEl.className = `text-xl font-bold ${percentChange >= 0 ? 'text-green-600' : 'text-red-600'}`;
        }
    }, 3000);
    
    // أزرار الشراء والبيع
    document.getElementById('simBuyBtn')?.addEventListener('click', () => executeTrade('buy'));
    document.getElementById('simSellBtn')?.addEventListener('click', () => executeTrade('sell'));
}

/**
 * تنفيذ صفقة محاكاة
 */
function executeTrade(type) {
    const stockSelect = document.getElementById('simStockSelect');
    const sharesInput = document.getElementById('simShares');
    const priceEl = document.getElementById('simStockPrice');
    
    const ticker = stockSelect.value;
    const shares = parseInt(sharesInput.value) || 0;
    const price = parseFloat(priceEl.textContent);
    const total = shares * price;
    
    if (shares <= 0) {
        showNotification('الرجاء إدخال عدد أسهم صحيح', 'warning');
        return;
    }
    
    if (type === 'buy') {
        if (total > learningState.simulation.balance) {
            showNotification('رصيد غير كافي', 'danger');
            return;
        }
        
        learningState.simulation.balance -= total;
        
        // إضافة للمحفظة
        const existing = learningState.simulation.portfolio.find(p => p.ticker === ticker);
        if (existing) {
            existing.shares += shares;
            existing.avgPrice = ((existing.avgPrice * (existing.shares - shares)) + total) / existing.shares;
        } else {
            learningState.simulation.portfolio.push({
                ticker,
                shares,
                avgPrice: price
            });
        }
        
        addTransaction('شراء', ticker, shares, price, total);
        showNotification(`تم شراء ${shares} سهم من ${ticker}`, 'success');
        
    } else {
        const holding = learningState.simulation.portfolio.find(p => p.ticker === ticker);
        if (!holding || holding.shares < shares) {
            showNotification('لا تملك هذا القدر من الأسهم', 'danger');
            return;
        }
        
        holding.shares -= shares;
        learningState.simulation.balance += total;
        
        if (holding.shares === 0) {
            learningState.simulation.portfolio = learningState.simulation.portfolio.filter(p => p.ticker !== ticker);
        }
        
        addTransaction('بيع', ticker, shares, price, total);
        showNotification(`تم بيع ${shares} سهم من ${ticker}`, 'success');
    }
    
    learningState.simulationCount++;
    saveLearningProgress();
    updateSimulationUI();
}

/**
 * إضافة معاملة للسجل
 */
function addTransaction(type, ticker, shares, price, total) {
    learningState.simulation.transactions.unshift({
        type,
        ticker,
        shares,
        price,
        total,
        time: new Date().toLocaleTimeString('ar-EG')
    });
}

/**
 * تحديث واجهة المحاكاة
 */
function updateSimulationUI() {
    document.getElementById('simBalance').textContent = learningState.simulation.balance.toLocaleString();
    
    // تحديث المحفظة
    const portfolioEl = document.getElementById('simPortfolio');
    if (learningState.simulation.portfolio.length === 0) {
        portfolioEl.innerHTML = `
            <div class="text-center py-8 text-gray-400">
                <i class="fas fa-briefcase text-4xl mb-2"></i>
                <p>محفظتك فارغة</p>
                <p class="text-sm">ابدأ بالشراء لبناء محفظتك</p>
            </div>
        `;
    } else {
        const currentPrice = parseFloat(document.getElementById('simStockPrice').textContent);
        portfolioEl.innerHTML = learningState.simulation.portfolio.map(p => `
            <div class="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div>
                    <div class="font-semibold">${p.ticker}</div>
                    <div class="text-sm text-gray-500">${p.shares} سهم @ ${p.avgPrice.toFixed(2)}</div>
                </div>
                <div class="text-left">
                    <div class="font-semibold">${(p.shares * currentPrice).toLocaleString()}</div>
                    <div class="text-sm ${currentPrice >= p.avgPrice ? 'text-green-600' : 'text-red-600'}">
                        ${((currentPrice - p.avgPrice) / p.avgPrice * 100).toFixed(2)}%
                    </div>
                </div>
            </div>
        `).join('');
    }
    
    // تحديث سجل المعاملات
    const transEl = document.getElementById('simTransactions');
    if (learningState.simulation.transactions.length === 0) {
        transEl.innerHTML = '<div class="text-center py-4 text-gray-400 text-sm">لا توجد معاملات بعد</div>';
    } else {
        transEl.innerHTML = learningState.simulation.transactions.slice(0, 10).map(t => `
            <div class="flex items-center justify-between py-2 border-b border-gray-100">
                <div class="flex items-center gap-2">
                    <span class="px-2 py-1 text-xs rounded ${t.type === 'شراء' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}">${t.type}</span>
                    <span class="font-medium">${t.ticker}</span>
                    <span class="text-sm text-gray-500">${t.shares} @ ${t.price.toFixed(2)}</span>
                </div>
                <div class="text-sm text-gray-500">${t.time}</div>
            </div>
        `).join('');
    }
    
    // حساب القيمة الإجمالية
    const currentPrice = parseFloat(document.getElementById('simStockPrice').textContent);
    const portfolioValue = learningState.simulation.portfolio.reduce((sum, p) => sum + (p.shares * currentPrice), 0);
    const totalValue = learningState.simulation.balance + portfolioValue;
    const profitLoss = totalValue - 100000;
    
    document.getElementById('simTotalValue').textContent = `${totalValue.toLocaleString()} ج.م`;
    document.getElementById('simProfitLoss').textContent = `${profitLoss >= 0 ? '+' : ''}${profitLoss.toLocaleString()} ج.م`;
    document.getElementById('simProfitLoss').className = `font-semibold ${profitLoss >= 0 ? 'text-green-600' : 'text-red-600'}`;
}

/**
 * تهيئة الحاسبات
 */
function initializeCalculators() {
    // حاسبة العائد
    document.getElementById('calcROI')?.addEventListener('click', () => {
        const cost = parseFloat(document.getElementById('calcCost').value) || 0;
        const current = parseFloat(document.getElementById('calcCurrentValue').value) || 0;
        const profit = current - cost;
        const roi = (profit / cost) * 100;
        document.getElementById('calcROIResult').textContent = `${roi.toFixed(2)}%`;
    });
    
    // حاسبة الفائدة المركبة
    document.getElementById('calcCompound')?.addEventListener('click', () => {
        const principal = parseFloat(document.getElementById('calcPrincipal').value) || 0;
        const rate = parseFloat(document.getElementById('calcRate').value) / 100 || 0;
        const years = parseInt(document.getElementById('calcYears').value) || 0;
        const n = 12; // شهرياً
        const amount = principal * Math.pow(1 + rate/n, n * years);
        document.getElementById('calcCompoundResult').textContent = amount.toLocaleString('en-US', {minimumFractionDigits: 2, maximumFractionDigits: 2});
    });
    
    // حاسبة P/E
    document.getElementById('calcPE')?.addEventListener('click', () => {
        const price = parseFloat(document.getElementById('calcStockPrice').value) || 0;
        const eps = parseFloat(document.getElementById('calcEPS').value) || 0;
        const pe = price / eps;
        document.getElementById('calcPEResult').textContent = pe.toFixed(2);
        
        let interpretation = '';
        if (pe < 15) interpretation = 'السهم قد يكون مقوّلاً (رخيص)';
        else if (pe < 25) interpretation = 'السهم بتقييم معتدل';
        else interpretation = 'السهم قد يكون مبالغاً في سعره';
        
        document.getElementById('calcPEInterpretation').textContent = interpretation;
    });
    
    // حاسبة المتوسط المتحرك
    document.getElementById('calcSMA')?.addEventListener('click', () => {
        const pricesStr = document.getElementById('calcPrices').value;
        const prices = pricesStr.split(',').map(p => parseFloat(p.trim())).filter(p => !isNaN(p));
        const period = parseInt(document.getElementById('calcPeriod').value) || prices.length;
        
        const relevantPrices = prices.slice(-period);
        const sma = relevantPrices.reduce((a, b) => a + b, 0) / relevantPrices.length;
        
        document.getElementById('calcSMAResult').textContent = sma.toFixed(2);
    });
}

/**
 * تهيئة الاختبار
 */
function initializeQuiz() {
    document.getElementById('startQuizBtn')?.addEventListener('click', startQuiz);
    document.getElementById('prevQuestionBtn')?.addEventListener('click', prevQuestion);
    document.getElementById('nextQuestionBtn')?.addEventListener('click', nextQuestion);
    document.getElementById('retakeQuizBtn')?.addEventListener('click', startQuiz);
    document.getElementById('reviewAnswersBtn')?.addEventListener('click', reviewAnswers);
}

/**
 * بدء الاختبار
 */
function startQuiz() {
    learningState.currentQuiz = {
        questions: [...quizQuestions].sort(() => Math.random() - 0.5).slice(0, 10),
        currentIndex: 0,
        score: 0,
        answers: []
    };
    
    document.getElementById('quizStart').classList.add('hidden');
    document.getElementById('quizResults').classList.add('hidden');
    document.getElementById('quizQuestions').classList.remove('hidden');
    
    showQuestion(0);
    startTimer();
}

/**
 * عرض سؤال
 */
function showQuestion(index) {
    const quiz = learningState.currentQuiz;
    const question = quiz.questions[index];
    
    document.getElementById('currentQuestion').textContent = index + 1;
    document.getElementById('quizProgress').style.width = `${((index + 1) / 10) * 100}%`;
    document.getElementById('questionText').textContent = question.question;
    
    const optionsEl = document.getElementById('answerOptions');
    optionsEl.innerHTML = question.options.map((option, i) => `
        <label class="flex items-center gap-3 p-4 border border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50 transition-colors ${quiz.answers[index] === i ? 'bg-blue-50 border-blue-500' : ''}">
            <input type="radio" name="answer" value="${i}" class="w-4 h-4 text-blue-600" ${quiz.answers[index] === i ? 'checked' : ''}>
            <span>${option}</span>
        </label>
    `).join('');
    
    // إضافة مستمع للتغيير
    optionsEl.querySelectorAll('input').forEach(input => {
        input.addEventListener('change', () => {
            quiz.answers[index] = parseInt(input.value);
            optionsEl.querySelectorAll('label').forEach(label => {
                label.classList.remove('bg-blue-50', 'border-blue-500');
            });
            input.closest('label').classList.add('bg-blue-50', 'border-blue-500');
        });
    });
    
    // تحديث الأزرار
    document.getElementById('prevQuestionBtn').disabled = index === 0;
    document.getElementById('nextQuestionBtn').textContent = index === 9 ? 'إنهاء' : 'التالي';
}

/**
 * السؤال السابق
 */
function prevQuestion() {
    if (learningState.currentQuiz.currentIndex > 0) {
        learningState.currentQuiz.currentIndex--;
        showQuestion(learningState.currentQuiz.currentIndex);
    }
}

/**
 * السؤال التالي
 */
function nextQuestion() {
    const quiz = learningState.currentQuiz;
    
    if (quiz.currentIndex === 9) {
        finishQuiz();
        return;
    }
    
    quiz.currentIndex++;
    showQuestion(quiz.currentIndex);
}

/**
 * إنهاء الاختبار
 */
function finishQuiz() {
    const quiz = learningState.currentQuiz;
    let correct = 0;
    
    quiz.questions.forEach((q, i) => {
        if (quiz.answers[i] === q.correct) correct++;
    });
    
    const score = Math.round((correct / 10) * 100);
    quiz.score = score;
    learningState.quizScore = score;
    saveLearningProgress();
    
    document.getElementById('quizQuestions').classList.add('hidden');
    document.getElementById('quizResults').classList.remove('hidden');
    document.getElementById('finalScore').textContent = `${score}%`;
    
    let message = '';
    if (score >= 90) message = 'ممتاز! أنت مستثمر محترف! 🏆';
    else if (score >= 70) message = 'أحسنت! أداء جيد جداً! 👏';
    else if (score >= 50) message = 'جيد! استمر في التعلم 📚';
    else message = 'تحتاج لمزيد من الدراسة 💪';
    
    document.getElementById('scoreMessage').textContent = message;
}

/**
 * مراجعة الإجابات
 */
function reviewAnswers() {
    const quiz = learningState.currentQuiz;
    let reviewHtml = '<div class="space-y-4 max-h-96 overflow-y-auto">';
    
    quiz.questions.forEach((q, i) => {
        const isCorrect = quiz.answers[i] === q.correct;
        reviewHtml += `
            <div class="p-4 rounded-lg ${isCorrect ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'}">
                <div class="font-medium mb-2">${i + 1}. ${q.question}</div>
                <div class="text-sm ${isCorrect ? 'text-green-700' : 'text-red-700'}">
                    إجابتك: ${q.options[quiz.answers[i]] || 'لم تجب'}
                </div>
                ${!isCorrect ? `<div class="text-sm text-green-700">الإجابة الصحيحة: ${q.options[q.correct]}</div>` : ''}
                <div class="text-sm text-gray-600 mt-2">${q.explanation}</div>
            </div>
        `;
    });
    
    reviewHtml += '</div>';
    
    // عرض في نافذة
    const modal = document.createElement('div');
    modal.className = 'fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4';
    modal.innerHTML = `
        <div class="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-hidden">
            <div class="p-6 border-b border-gray-200 flex items-center justify-between">
                <h3 class="text-xl font-semibold text-gray-900">مراجعة الإجابات</h3>
                <button class="text-gray-400 hover:text-gray-600 text-2xl close-review">&times;</button>
            </div>
            <div class="p-6 overflow-y-auto">
                ${reviewHtml}
            </div>
        </div>
    `;
    
    document.body.appendChild(modal);
    modal.querySelector('.close-review').addEventListener('click', () => modal.remove());
    modal.addEventListener('click', (e) => { if (e.target === modal) modal.remove(); });
}

let timerInterval;
/**
 * بدء المؤقت
 */
function startTimer() {
    let timeLeft = 300; // 5 دقائق
    const timerEl = document.getElementById('quizTimer');
    
    clearInterval(timerInterval);
    timerInterval = setInterval(() => {
        const minutes = Math.floor(timeLeft / 60);
        const seconds = timeLeft % 60;
        timerEl.textContent = `${minutes}:${seconds.toString().padStart(2, '0')}`;
        
        if (timeLeft <= 0) {
            clearInterval(timerInterval);
            finishQuiz();
        }
        timeLeft--;
    }, 1000);
}

/**
 * عرض إشعار
 */
function showNotification(message, type = 'info', duration = 3000) {
    const colors = {
        success: 'bg-green-500',
        danger: 'bg-red-500',
        warning: 'bg-yellow-500',
        info: 'bg-blue-500'
    };
    
    const notification = document.createElement('div');
    notification.className = `fixed top-4 left-4 ${colors[type]} text-white px-6 py-3 rounded-lg shadow-lg z-50 animate-fade-in`;
    notification.textContent = message;
    
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.remove();
    }, duration);
}

// تصدير الدوال
export { learningState };
