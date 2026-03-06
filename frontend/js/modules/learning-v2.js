import { mergedCoursesData } from './merged-investment-course.js';
/**
 * �&رْز ا�تع��& ا��&ت�د�& - ا�� سخة ا�ثا� �`ة
 * � ظا�& تع��`�&�` شا�&� �&ع �&حاْاة ح�`ة ��تفاص�`� ْا�&�ة
 * Advanced Learning Center V2 - Full Course with Live Simulation
 */

// ============================================
// حا�ة ا�� ظا�& ا�تع��`�&�` ا�شا�&�ة
// ============================================
const learningStateV2 = {
    // �&ع����&ات ا��&ستخد�&
    user: {
        level: 1,
        xp: 0,
        xpToNextLevel: 100,
        rank: '�&بتدئ',
        badges: [],
        achievements: [],
        totalStudyTime: 0,
        joinedAt: null
    },
    
    // ت�د�& ا�در��س
    progress: {
        completedLessons: [],
        currentCourse: null,
        currentModule: null,
        lessonProgress: {}, // { lessonId: { progress: 0-100, timeSpent: 0, attempts: 0 } }
        lastAccessedAt: null
    },
    
    // ا��&حاْاة ا�ح�`ة
    simulation: {
        balance: 100000,
        initialBalance: 100000,
        portfolio: [],
        transactions: [],
        watchlist: ['ETEL', 'COMI', 'AMOC', 'SWDY'],
        openOrders: [],
        history: [],
        performance: {
            daily: [],
            weekly: [],
            monthly: []
        },
        settings: {
            riskLevel: 'moderate',
            autoTrade: false,
            notifications: true
        }
    },
    
    // ا�اختبارات
    quiz: {
        currentQuiz: null,
        history: [],
        bestScores: {},
        totalQuizzesTaken: 0,
        averageScore: 0
    },
    
    // ا�إحصائ�`ات
    stats: {
        streakDays: 0,
        longestStreak: 0,
        lastActiveDate: null,
        totalTrades: 0,
        winRate: 0,
        bestTrade: null,
        worstTrade: null
    },
    
    // إعدادات ا�عرض
    ui: {
        theme: 'light',
        language: 'ar',
        soundEnabled: true,
        animationsEnabled: true,
        autoPlayLessons: false
    }
};

// ============================================
// �!�`ْ� ا�د��رات ا�تع��`�&�`ة ا�شا�&�ة
// ============================================
const coursesData = {
    beginner: {
        id: 'beginner',
        title: 'أساس�`ات ا�استث�&ار',
        titleEn: 'Investment Basics',
        description: 'تع��& أساس�`ات ا�استث�&ار �&�  ا�صفر',
        level: 1,
        xpReward: 500,
        estimatedHours: 10,
        modules: [
            {
                id: 'intro-investing',
                title: '�&�د�&ة ف�` ا�استث�&ار',
                lessons: [
                    {
                        id: 'what-is-investing',
                        title: '�&ا �!�� ا�استث�&ار�x',
                        duration: 15,
                        xp: 50,
                        type: 'video',
                        content: {
                            videoUrl: '',
                            slides: [
                                {
                                    title: '�&ا �!�� ا�استث�&ار�x',
                                    content: `
                                        <div class="space-y-4">
                                            <p class="text-lg">ا�استث�&ار �!�� ع�&��`ة تخص�`ص ا��&��ارد ا��&ا��`ة ب�!دف تح��`� عائد �&ست�ب��`.</p>
                                            <div class="bg-blue-50 p-4 rounded-lg">
                                                <h4 class="font-bold mb-2">�x}� ا��!دف ا�رئ�`س�`</h4>
                                                <p>ت� �&�`ة ا�ثر��ة ع��0 ا��&د�0 ا�ط���`� �&�  خ�ا� ��ضع ا�أ�&��ا� ف�` أص��� تز�`د ��`�&ت�!ا �&ع ا����ت.</p>
                                            </div>
                                        </div>
                                    `,
                                    interactive: true
                                },
                                {
                                    title: '��&اذا � ستث�&ر�x',
                                    content: `
                                        <div class="grid grid-cols-2 gap-4">
                                            <div class="bg-green-50 p-4 rounded-lg text-center">
                                                <div class="text-3xl mb-2">�x:�️</div>
                                                <h4 class="font-bold">ح�&ا�`ة �&�  ا�تضخ�&</h4>
                                                <p class="text-sm">ا�حفاظ ع��0 ��`�&ة أ�&��ا�ْ</p>
                                            </div>
                                            <div class="bg-purple-50 p-4 rounded-lg text-center">
                                                <div class="text-3xl mb-2">�x�</div>
                                                <h4 class="font-bold">ب� اء ا�ثر��ة</h4>
                                                <p class="text-sm">تح��`� ا�است��ا� ا��&ا��`</p>
                                            </div>
                                            <div class="bg-orange-50 p-4 rounded-lg text-center">
                                                <div class="text-3xl mb-2">�x}�</div>
                                                <h4 class="font-bold">تح��`� ا�أ�!داف</h4>
                                                <p class="text-sm">ا�تع��`�&�R ا�ت�اعد�R ا��&� ز�</p>
                                            </div>
                                            <div class="bg-red-50 p-4 rounded-lg text-center">
                                                <div class="text-3xl mb-2">�x�</div>
                                                <h4 class="font-bold">ا�دخ� ا�س�ب�`</h4>
                                                <p class="text-sm">ع��ائد �&� تظ�&ة بد���  ع�&�</p>
                                            </div>
                                        </div>
                                    `
                                },
                                {
                                    title: 'أ� ��اع ا��&ستث�&ر�`� ',
                                    content: `
                                        <div class="space-y-4">
                                            <div class="flex items-center gap-4 p-4 bg-green-50 rounded-lg">
                                                <div class="text-4xl">�x��</div>
                                                <div>
                                                    <h4 class="font-bold text-green-700">ا��&ستث�&ر ا��&حافظ</h4>
                                                    <p class="text-sm">�`فض� ا�أ�&ا�  ��ا�ع��ائد ا��&ست�رة - ا�س� دات ��ا�أس�!�& ا��&��زعة</p>
                                                </div>
                                            </div>
                                            <div class="flex items-center gap-4 p-4 bg-blue-50 rounded-lg">
                                                <div class="text-4xl">�xa�</div>
                                                <div>
                                                    <h4 class="font-bold text-blue-700">ا��&ستث�&ر ا��&ت��از� </h4>
                                                    <p class="text-sm">�`��از�  ب�`�  ا�أ�&ا�  ��ا�� �&�� - �&حفظة �&ت� ��عة</p>
                                                </div>
                                            </div>
                                            <div class="flex items-center gap-4 p-4 bg-red-50 rounded-lg">
                                                <div class="text-4xl">�xa�</div>
                                                <div>
                                                    <h4 class="font-bold text-red-700">ا��&ستث�&ر ا�عد��ا� �`</h4>
                                                    <p class="text-sm">�`�ب� ا��&خاطر ا�عا��`ة ��ع��ائد ا�ْب�`رة - أس�!�& ا�� �&��</p>
                                                </div>
                                            </div>
                                        </div>
                                    `,
                                    quiz: {
                                        question: '�&ا � ��ع ا��&ستث�&ر ا�ذ�` �`فض� ا�أ�&ا�  ��ا�ع��ائد ا��&ست�رة�x',
                                        options: ['ا�عد��ا� �`', 'ا��&حافظ', 'ا��&ت��از� ', 'ا��&ضارب'],
                                        correct: 1
                                    }
                                }
                            ],
                            summary: `
                                <div class="bg-gray-50 p-4 rounded-lg">
                                    <h4 class="font-bold mb-2">�x9 �&�خص ا�درس</h4>
                                    <ul class="space-y-2">
                                        <li>�S& ا�استث�&ار �`�!دف �ت� �&�`ة ا�ثر��ة ع��0 ا��&د�0 ا�ط���`�</li>
                                        <li>�S& �`ح�&�` أ�&��ا�ْ �&�  ا�تضخ�& ���`ب� �` ثر��تْ</li>
                                        <li>�S& اختر � ��ع ا�استث�&ار ا��&� اسب �شخص�`تْ</li>
                                    </ul>
                                </div>
                            `
                        }
                    },
                    {
                        id: 'investment-types',
                        title: 'أ� ��اع ا�استث�&ارات',
                        duration: 20,
                        xp: 60,
                        type: 'interactive',
                        content: {
                            interactiveDemo: true,
                            assetTypes: [
                                {
                                    name: 'ا�أس�!�&',
                                    icon: '�x�',
                                    risk: '�&ت��سط-عا��`',
                                    return: '5-15% س� ���`ا�9',
                                    description: 'حصص �&�ْ�`ة ف�` ا�شرْات',
                                    color: 'blue'
                                },
                                {
                                    name: 'ا�س� دات',
                                    icon: '�xS',
                                    risk: '�&� خفض',
                                    return: '3-6% س� ���`ا�9',
                                    description: '�ر��ض ��حْ���&ات أ�� ا�شرْات',
                                    color: 'green'
                                },
                                {
                                    name: 'ا�ص� اد�`� ا�استث�&ار�`ة',
                                    icon: '�x��',
                                    risk: '�&ت��سط',
                                    return: '4-12% س� ���`ا�9',
                                    description: '�&حافظ �&دارة احتراف�`ا�9',
                                    color: 'purple'
                                },
                                {
                                    name: 'ا�ع�ارات',
                                    icon: '�x��',
                                    risk: '�&ت��سط',
                                    return: '5-10% س� ���`ا�9',
                                    description: 'استث�&ار ف�` ا�ع�ارات ا��&اد�`ة',
                                    color: 'orange'
                                }
                            ]
                        }
                    }
                ]
            },
            {
                id: 'stock-basics',
                title: 'أساس�`ات ا�أس�!�&',
                lessons: [
                    {
                        id: 'what-are-stocks',
                        title: '�&ا �!�` ا�أس�!�&�x',
                        duration: 18,
                        xp: 55,
                        type: 'video',
                        content: {
                            animation: 'stock-ownership-demo'
                        }
                    },
                    {
                        id: 'how-stocks-work',
                        title: 'ْ�`ف تع�&� ا�أس�!�&�x',
                        duration: 22,
                        xp: 65,
                        type: 'simulation',
                        content: {
                            liveDemo: true,
                            simulationType: 'ipo-simulation'
                        }
                    }
                ]
            }
        ],
        finalExam: {
            questions: 20,
            passingScore: 70,
            xpReward: 200
        }
    },
    
    intermediate: {
        id: 'intermediate',
        title: 'ا�تح��`� ا�ف� �`',
        titleEn: 'Technical Analysis',
        description: 'إت�ا�  �راءة ا�رس���& ا�ب�`ا� �`ة ��ا�ت� بؤ با�أسعار',
        level: 2,
        xpReward: 1000,
        estimatedHours: 20,
        modules: [
            {
                id: 'chart-reading',
                title: '�راءة ا�رس���& ا�ب�`ا� �`ة',
                lessons: [
                    {
                        id: 'chart-types',
                        title: 'أ� ��اع ا�رس���& ا�ب�`ا� �`ة',
                        duration: 25,
                        xp: 70,
                        type: 'interactive',
                        content: {
                            liveCharts: true,
                            chartTypes: ['line', 'bar', 'candlestick', 'heikin-ashi']
                        }
                    },
                    {
                        id: 'candlestick-anatomy',
                        title: 'تشر�`ح ا�ش�&عة ا��`ابا� �`ة',
                        duration: 30,
                        xp: 80,
                        type: 'interactive',
                        content: {
                            interactiveCandle: true,
                            animations: true
                        }
                    }
                ]
            },
            {
                id: 'candlestick-patterns',
                title: 'أ� �&اط ا�ش�&��ع ا��`ابا� �`ة',
                lessons: [
                    {
                        id: 'single-candle-patterns',
                        title: 'أ� �&اط ا�ش�&��ع ا��&فردة',
                        duration: 35,
                        xp: 90,
                        type: 'interactive',
                        content: {
                            patterns: ['doji', 'hammer', 'shooting-star', 'marubozu', 'spinning-top']
                        }
                    },
                    {
                        id: 'double-candle-patterns',
                        title: 'أ� �&اط ا�ش�&��ع ا��&زد��جة',
                        duration: 40,
                        xp: 100,
                        type: 'interactive',
                        content: {
                            patterns: ['engulfing', 'harami', 'piercing', 'dark-cloud', 'tweezer']
                        }
                    },
                    {
                        id: 'triple-candle-patterns',
                        title: 'أ� �&اط ا�ش�&��ع ا�ث�اث�`ة',
                        duration: 45,
                        xp: 110,
                        type: 'interactive',
                        content: {
                            patterns: ['morning-star', 'evening-star', 'three-white-soldiers', 'three-black-crows']
                        }
                    }
                ]
            },
            {
                id: 'technical-indicators',
                title: 'ا��&ؤشرات ا�ف� �`ة',
                lessons: [
                    {
                        id: 'moving-averages',
                        title: 'ا��&ت��سطات ا��&تحرْة',
                        duration: 40,
                        xp: 100,
                        type: 'interactive',
                        content: {
                            indicators: ['SMA', 'EMA', 'WMA'],
                            liveDemo: true
                        }
                    },
                    {
                        id: 'rsi-indicator',
                        title: '�&ؤشر ا����ة ا�� سب�`ة RSI',
                        duration: 35,
                        xp: 95,
                        type: 'interactive',
                        content: {
                            indicatorConfig: { period: 14, overbought: 70, oversold: 30 }
                        }
                    },
                    {
                        id: 'macd-indicator',
                        title: '�&ؤشر MACD',
                        duration: 40,
                        xp: 100,
                        type: 'interactive',
                        content: {
                            indicatorConfig: { fast: 12, slow: 26, signal: 9 }
                        }
                    },
                    {
                        id: 'bollinger-bands',
                        title: '� طا�ات ب����`� جر',
                        duration: 35,
                        xp: 95,
                        type: 'interactive',
                        content: {
                            indicatorConfig: { period: 20, stdDev: 2 }
                        }
                    }
                ]
            }
        ]
    },
    
    advanced: {
        id: 'advanced',
        title: 'استرات�`ج�`ات �&ت�د�&ة',
        titleEn: 'Advanced Strategies',
        description: 'استرات�`ج�`ات ا�استث�&ار ا�احتراف�`ة ��إدارة ا��&حافظ',
        level: 3,
        xpReward: 2000,
        estimatedHours: 30,
        modules: [
            {
                id: 'portfolio-management',
                title: 'إدارة ا��&حافظ ا�استث�&ار�`ة',
                lessons: [
                    {
                        id: 'portfolio-theory',
                        title: '� ظر�`ة ا��&حفظة ا�حد�`ثة',
                        duration: 45,
                        xp: 120,
                        type: 'video'
                    },
                    {
                        id: 'asset-allocation',
                        title: 'ت��ز�`ع ا�أص���',
                        duration: 50,
                        xp: 130,
                        type: 'interactive',
                        content: {
                            allocationSimulator: true
                        }
                    },
                    {
                        id: 'risk-management',
                        title: 'إدارة ا��&خاطر',
                        duration: 55,
                        xp: 140,
                        type: 'interactive',
                        content: {
                            riskSimulator: true
                        }
                    }
                ]
            },
            {
                id: 'trading-strategies',
                title: 'استرات�`ج�`ات ا�تدا���',
                lessons: [
                    {
                        id: 'swing-trading',
                        title: 'تدا��� ا�تأرجح',
                        duration: 40,
                        xp: 110,
                        type: 'simulation'
                    },
                    {
                        id: 'position-trading',
                        title: 'ا�تدا��� ا��&رْز�`',
                        duration: 45,
                        xp: 120,
                        type: 'simulation'
                    }
                ]
            }
        ]
    }
};

// ============================================
// أ� �&اط ا�ش�&��ع ا��`ابا� �`ة ا�تفص�`��`ة
// ============================================
// Merge external curriculum into the native learning paths.
Object.assign(coursesData, mergedCoursesData);

const candlestickPatterns = {
    // ا�أ� �&اط ا�صع��د�`ة (ا� عْاس �!ب��ط�` إ��0 صع��د�`)
    bullish: {
        hammer: {
            name: 'ا��&طر�ة',
            nameEn: 'Hammer',
            description: 'ش�&عة بجس�& صغ�`ر ف�` ا�أع��0 ��ظ� سف��` ط���`� (ضعف�` ا�جس�& ع��0 ا�أ��)',
            psychology: 'ا�ب�`ع �`س�`طر ف�` ا�بدا�`ة �ْ�  ا��&شتر�`�  �`ستع�`د���  ا�س�`طرة ���`غ�����  �رب ا�افتتاح',
            appearance: '�اع ا�اتجا�! ا��!ابط',
            reliability: 70,
            svgPath: 'M100,30 L100,60 L100,180 L100,220',
            color: '#10b981'
        },
        invertedHammer: {
            name: 'ا��&طر�ة ا��&����بة',
            nameEn: 'Inverted Hammer',
            description: 'جس�& صغ�`ر ف�` ا�أسف� �&ع ظ� ع����` ط���`�',
            psychology: 'ا��&شتر�`�  �`حا������  ا�دفع �ْ�  �`��اج�!���  �&�ا���&ة�R إشارة �احت�&ا� ا�صع��د',
            appearance: '�اع ا�اتجا�! ا��!ابط',
            reliability: 65,
            color: '#10b981'
        },
        bullishEngulfing: {
            name: 'ا�ابت�اع ا�صع��د�`',
            nameEn: 'Bullish Engulfing',
            description: 'ش�&عة خضراء تبت�ع ا�ش�&عة ا�ح�&راء ا�ساب�ة با�ْا�&�',
            psychology: 'تح��� ����` ف�` ا����ة �&�  ا�بائع�`�  ���&شتر�`� ',
            appearance: '�اع ا�اتجا�! ا��!ابط',
            reliability: 85,
            color: '#10b981'
        },
        morningStar: {
            name: '� ج�&ة ا�صبح',
            nameEn: 'Morning Star',
            description: 'ث�اث ش�&��ع: ح�&راء ط���`�ة�R صغ�`رة (فج��ة)�R خضراء ط���`�ة',
            psychology: 'تردد ث�& ا� عْاس ����` ��صع��د',
            appearance: '�اع ا�اتجا�! ا��!ابط',
            reliability: 90,
            color: '#10b981'
        },
        threeWhiteSoldiers: {
            name: 'ث�اثة ج� ��د ب�`ض',
            nameEn: 'Three White Soldiers',
            description: 'ث�اث ش�&��ع خضراء �&تتا��`ة�R ْ� ��احدة تغ�� أع��0',
            psychology: 'ضغط شرائ�` �&ست�&ر ������`',
            appearance: 'بعد �اع أ�� خ�ا� تراجع',
            reliability: 85,
            color: '#10b981'
        },
        piercingLine: {
            name: 'ا�خط ا��&ختر�',
            nameEn: 'Piercing Line',
            description: 'ش�&عة ح�&راء ت��`�!ا خضراء تفتح أ�� ��تغ�� ف��� �&� تصف ا�ح�&راء',
            psychology: 'ا��&شتر�`�  �`ستع�`د���  ا�س�`طرة �&�  ا�بائع�`� ',
            appearance: '�اع ا�اتجا�! ا��!ابط',
            reliability: 75,
            color: '#10b981'
        }
    },
    
    // ا�أ� �&اط ا��!ب��ط�`ة (ا� عْاس صع��د�` إ��0 �!ب��ط�`)
    bearish: {
        shootingStar: {
            name: 'ا�� ج�& ا�سا�ط',
            nameEn: 'Shooting Star',
            description: 'جس�& صغ�`ر ف�` ا�أسف� �&ع ظ� ع����` ط���`�',
            psychology: 'ا��&شتر�`�  �`دفع���  ا�سعر ��أع��0 �ْ�  ا�بائع�`�  �`ستع�`د���  ا�س�`طرة',
            appearance: '��&ة ا�اتجا�! ا�صاعد',
            reliability: 70,
            color: '#ef4444'
        },
        hangingMan: {
            name: 'ا�رج� ا��&ش� ���',
            nameEn: 'Hanging Man',
            description: '�&شاب�! ���&طر�ة �ْ�  �`ظ�!ر ف�` ��&ة ا�اتجا�! ا�صاعد',
            psychology: 'إشارة �احت�&ا� ا��!ب��ط بعد ضغط شرائ�`',
            appearance: '��&ة ا�اتجا�! ا�صاعد',
            reliability: 65,
            color: '#ef4444'
        },
        bearishEngulfing: {
            name: 'ا�ابت�اع ا��!ب��ط�`',
            nameEn: 'Bearish Engulfing',
            description: 'ش�&عة ح�&راء تبت�ع ا�ش�&عة ا�خضراء ا�ساب�ة با�ْا�&�',
            psychology: 'تح��� ����` ف�` ا����ة �&�  ا��&شتر�`�  ��بائع�`� ',
            appearance: '��&ة ا�اتجا�! ا�صاعد',
            reliability: 85,
            color: '#ef4444'
        },
        eveningStar: {
            name: '� ج�&ة ا��&ساء',
            nameEn: 'Evening Star',
            description: 'ث�اث ش�&��ع: خضراء ط���`�ة�R صغ�`رة (فج��ة)�R ح�&راء ط���`�ة',
            psychology: 'تردد ث�& ا� عْاس ����` ���!ب��ط',
            appearance: '��&ة ا�اتجا�! ا�صاعد',
            reliability: 90,
            color: '#ef4444'
        },
        threeBlackCrows: {
            name: 'ث�اثة غربا�  س��د',
            nameEn: 'Three Black Crows',
            description: 'ث�اث ش�&��ع ح�&راء �&تتا��`ة�R ْ� ��احدة تغ�� أ��',
            psychology: 'ضغط ب�`ع�` �&ست�&ر ������`',
            appearance: 'بعد ��&ة أ�� خ�ا� صع��د',
            reliability: 85,
            color: '#ef4444'
        },
        darkCloudCover: {
            name: 'غطاء ا�سحابة ا�داْ� ة',
            nameEn: 'Dark Cloud Cover',
            description: 'ش�&عة خضراء ت��`�!ا ح�&راء تفتح أع��0 ��تغ�� تحت �&� تصف ا�خضراء',
            psychology: 'ا�بائع�`�  �`ستع�`د���  ا�س�`طرة �&�  ا��&شتر�`� ',
            appearance: '��&ة ا�اتجا�! ا�صاعد',
            reliability: 75,
            color: '#ef4444'
        }
    },
    
    // أ� �&اط ا�است�&رار
    continuation: {
        doji: {
            name: 'ا�د��ج�`',
            nameEn: 'Doji',
            description: 'ا�افتتاح ��ا�إغ�ا� �&تسا���`ا�  ت�ر�`با�9',
            psychology: 'ت��از�  ب�`�  ا��&شتر�`�  ��ا�بائع�`� �R تردد ف�` ا�س���',
            appearance: 'ف�` أ�` �&ْا� ',
            reliability: 50,
            color: '#6b7280'
        },
        spinningTop: {
            name: 'ا���&�&ة ا�د��ارة',
            nameEn: 'Spinning Top',
            description: 'جس�& صغ�`ر �&ع ظ�ا� ط���`�ة ف�` ا�ج�!ت�`� ',
            psychology: 'صراع ب�`�  ا��&شتر�`�  ��ا�بائع�`�  بد���  حس�&',
            appearance: 'ف�` أ�` �&ْا� ',
            reliability: 45,
            color: '#6b7280'
        },
        marubozu: {
            name: 'ا��&ار��ب��ز��',
            nameEn: 'Marubozu',
            description: 'ش�&عة بد���  ظ�ا��R جس�& ف�ط',
            psychology: 'س�`طرة ْا�&�ة �&�  ج�!ة ��احدة',
            appearance: 'ف�` أ�` �&ْا� ',
            reliability: 70,
            color: '#6b7280'
        }
    }
};

// ============================================
// س�`� ار�`���!ات ا�س��� ا�ح�`ة
// ============================================
const marketScenarios = {
    bullMarket: {
        name: 'ا�س��� ا�صاعد',
        description: 'س��� ف�` حا�ة صع��د �&ست�&ر',
        characteristics: ['أسعار ترتفع', 'ث�ة ا��&ستث�&ر�`�  عا��`ة', 'حج�& تدا��� ْب�`ر'],
        simulation: {
            trendBias: 0.7, // �&�`� ��صع��د
            volatility: 0.015,
            volumeMultiplier: 1.5
        }
    },
    bearMarket: {
        name: 'ا�س��� ا��!ابط',
        description: 'س��� ف�` حا�ة �!ب��ط �&ست�&ر',
        characteristics: ['أسعار ت� خفض', 'خ��ف ا��&ستث�&ر�`� ', 'حج�& تدا��� �&� خفض'],
        simulation: {
            trendBias: -0.7,
            volatility: 0.02,
            volumeMultiplier: 0.8
        }
    },
    sideways: {
        name: 'ا�س��� ا�عرض�`',
        description: 'س��� �&تح�`ر ب�`�  ا�صع��د ��ا��!ب��ط',
        characteristics: ['أسعار �&تذبذبة', 'عد�& �`��`� ', 'حج�& تدا��� �&ت��سط'],
        simulation: {
            trendBias: 0,
            volatility: 0.01,
            volumeMultiplier: 1.0
        }
    },
    crash: {
        name: 'ا� �!�`ار ا�س���',
        description: 'ا� �!�`ار حاد ف�` ا�أسعار',
        characteristics: ['ب�`ع ذعر', 'ا� خفاض حاد', 'حج�& تدا��� ضخ�&'],
        simulation: {
            trendBias: -0.95,
            volatility: 0.05,
            volumeMultiplier: 3.0
        }
    },
    recovery: {
        name: 'ا�تعاف�`',
        description: 'تعاف�` ا�س��� بعد ا� خفاض',
        characteristics: ['ع��دة ا�ث�ة', 'صع��د تدر�`ج�`', 'حج�& تدا��� �&تزا�`د'],
        simulation: {
            trendBias: 0.5,
            volatility: 0.02,
            volumeMultiplier: 1.3
        }
    }
};

// ============================================
// � ظا�& ا�شارات ��ا�إ� جازات
// ============================================
const achievementsData = {
    badges: {
        firstTrade: {
            id: 'firstTrade',
            name: 'ا�صف�ة ا�أ����0',
            icon: '�x}�',
            description: 'أْ�&� أ��� صف�ة �ْ ف�` ا��&حاْاة',
            xp: 50,
            condition: (state) => state.simulation.transactions.length >= 1
        },
        profitableTrade: {
            id: 'profitableTrade',
            name: 'ربح أ���',
            icon: '�x�',
            description: 'ح�� ربحا�9 ف�` صف�ة',
            xp: 100,
            condition: (state) => state.stats.winRate > 0
        },
        diversified: {
            id: 'diversified',
            name: '�&ت� ��ع',
            icon: '�x}�',
            description: 'ا�&ت�ْ 5 أس�!�& �&خت�فة ف�` ا��&حفظة',
            xp: 150,
            condition: (state) => state.simulation.portfolio.length >= 5
        },
        quizMaster: {
            id: 'quizMaster',
            name: 'خب�`ر ا�اختبارات',
            icon: '�x�',
            description: 'احص� ع��0 100% ف�` اختبار',
            xp: 200,
            condition: (state) => Object.values(state.quiz.bestScores).includes(100)
        },
        weekStreak: {
            id: 'weekStreak',
            name: 'أسب��ع �&ت��اص�',
            icon: '�x�',
            description: 'حافظ ع��0 � شاطْ ��&دة 7 أ�`ا�& �&تتا��`ة',
            xp: 250,
            condition: (state) => state.stats.streakDays >= 7
        },
        monthStreak: {
            id: 'monthStreak',
            name: 'ش�!ر �&ت��اص�',
            icon: '�x� ',
            description: 'حافظ ع��0 � شاطْ ��&دة 30 �`���& �&تتا��`ة',
            xp: 500,
            condition: (state) => state.stats.streakDays >= 30
        },
        courseComplete: {
            id: 'courseComplete',
            name: 'خر�`ج',
            icon: '�x}',
            description: 'أْ�&� د��رة ْا�&�ة',
            xp: 300,
            condition: (state) => state.progress.completedLessons.length >= 10
        },
        portfolio100k: {
            id: 'portfolio100k',
            name: '�&حفظة 100 أ�ف',
            icon: '�x}',
            description: 'اجع� ��`�&ة �&حفظتْ 100,000 ج� �`�!',
            xp: 400,
            condition: (state) => calculatePortfolioValue(state) >= 100000
        },
        portfolio200k: {
            id: 'portfolio200k',
            name: '�&حفظة 200 أ�ف',
            icon: '�x',
            description: 'اجع� ��`�&ة �&حفظتْ 200,000 ج� �`�!',
            xp: 800,
            condition: (state) => calculatePortfolioValue(state) >= 200000
        },
        patternExpert: {
            id: 'patternExpert',
            name: 'خب�`ر ا�أ� �&اط',
            icon: '�x`',
            description: 'تعرف ع��0 20 � �&ط ش�&عدا�  بشْ� صح�`ح',
            xp: 300,
            condition: (state) => (state.progress.patternRecognitions || 0) >= 20
        }
    },
    
    ranks: [
        { name: '�&بتدئ', minXP: 0, icon: '�xR�' },
        { name: '�&تع��&', minXP: 500, icon: '�xa' },
        { name: '�&�&ارس', minXP: 1500, icon: '�x�' },
        { name: '�&ت�د�&', minXP: 3000, icon: '�xa�' },
        { name: 'خب�`ر', minXP: 5000, icon: '⭐' },
        { name: '�&حترف', minXP: 8000, icon: '�x� ' },
        { name: 'س�`د', minXP: 12000, icon: '�x' },
        { name: 'أسط��رة', minXP: 20000, icon: '�x}' }
    ]
};

// ============================================
// ب�`ا� ات ا�أس�!�& ���&حاْاة ا�ح�`ة
// ============================================
const simulationStocks = {
    ETEL: {
        name: 'ا�اتصا�ات ا��&صر�`ة',
        sector: 'اتصا�ات',
        basePrice: 25.50,
        volatility: 0.02,
        beta: 0.8
    },
    COMI: {
        name: 'ا�ب� ْ ا�تجار�` ا�د����`',
        sector: 'ب� ��ْ',
        basePrice: 85.20,
        volatility: 0.018,
        beta: 1.1
    },
    AMOC: {
        name: 'ا�إسْ� در�`ة ���&��ا� ئ',
        sector: '� ��',
        basePrice: 18.75,
        volatility: 0.025,
        beta: 1.3
    },
    SWDY: {
        name: 'ا�س���`د�` ��ْاب�ات',
        sector: 'ص� اعة',
        basePrice: 42.30,
        volatility: 0.022,
        beta: 1.0
    },
    EAST: {
        name: 'أ��راسْ���&',
        sector: 'تش�`�`د',
        basePrice: 520.00,
        volatility: 0.03,
        beta: 1.5
    },
    HRHO: {
        name: '�!�`ر�&�`س',
        sector: '�&ا��`ة',
        basePrice: 15.80,
        volatility: 0.028,
        beta: 1.4
    }
};

// ============================================
// ا�أسئ�ة ا�اختبار�`ة ا��&ت�د�&ة
// ============================================
const quizBank = {
    basics: [
        {
            id: 'basics-1',
            question: '�&ا �!�� ا��!دف ا�رئ�`س�` �&�  ا�استث�&ار�x',
            options: [
                'إ� فا� ا�أ�&��ا� بسرعة',
                'ت� �&�`ة ا�ثر��ة ع��0 ا��&د�0 ا�ط���`�',
                'تخز�`�  ا�أ�&��ا� بد���  عائد',
                'ا��&ضاربة ا��`���&�`ة ف�ط'
            ],
            correct: 1,
            explanation: 'ا�استث�&ار �`�!دف إ��0 ت� �&�`ة ا�ثر��ة ع��0 ا��&د�0 ا�ط���`� �&�  خ�ا� ��ضع ا�أ�&��ا� ف�` أص��� تز�`د ��`�&ت�!ا �&ع ا����ت.',
            difficulty: 'easy',
            xp: 10
        },
        {
            id: 'basics-2',
            question: '�&اذا �`ع� �` �&صط�ح "ا�ت� ���`ع" ف�` ا�استث�&ار�x',
            options: [
                'شراء س�!�& ��احد ف�ط',
                'ت��ز�`ع ا�استث�&ار ع��0 أص��� �&خت�فة',
                'ب�`ع ج�&�`ع ا�أس�!�&',
                'ا�استث�&ار ف�` ب� ْ ��احد ف�ط'
            ],
            correct: 1,
            explanation: 'ا�ت� ���`ع �`ع� �` ت��ز�`ع ا�استث�&ارات ع��0 أص��� ���طاعات �&خت�فة �ت���`� ا��&خاطر ا�إج�&ا��`ة.',
            difficulty: 'easy',
            xp: 10
        },
        {
            id: 'basics-3',
            question: '�&ا �!�� ا�عائد ع��0 ا�استث�&ار (ROI)�x',
            options: [
                'ا�ربح ا��&ح�� �&�  ا�استث�&ار',
                '� سبة ا�ربح إ��0 تْ�فة ا�استث�&ار',
                '��`�&ة ا�استث�&ار ا�أ����`',
                '�&ج�&��ع ا�أرباح ا�س� ���`ة'
            ],
            correct: 1,
            explanation: 'ROI = (ا�ربح ÷ ا�تْ�فة) � 100�R ���`��`س ْفاءة ا�استث�&ار.',
            difficulty: 'easy',
            xp: 10
        }
    ],
    
    technical: [
        {
            id: 'tech-1',
            question: '�&اذا تع� �` ا�ش�&عة ا�خضراء ف�` ا�رس�& ا�ب�`ا� �`�x',
            options: [
                'ا� خفاض ا�سعر',
                'ا�سعر أغ�� أع��0 �&�  ا�افتتاح',
                '�ا �`��جد تدا���',
                'ا�سعر ثابت'
            ],
            correct: 1,
            explanation: 'ا�ش�&عة ا�خضراء تع� �` أ�  سعر ا�إغ�ا� أع��0 �&�  سعر ا�افتتاح�R �&�&ا �`د� ع��0 صع��د ا�سعر.',
            difficulty: 'easy',
            xp: 15
        },
        {
            id: 'tech-2',
            question: '�&ا �!�� � �&ط "ا�ابت�اع ا�صع��د�`"�x',
            options: [
                'ش�&عة ح�&راء تبت�ع خضراء',
                'ش�&عة خضراء تبت�ع ح�&راء با�ْا�&�',
                'ش�&عة صغ�`رة داخ� ش�&عة ْب�`رة',
                'ث�اث ش�&��ع �&تتا��`ة'
            ],
            correct: 1,
            explanation: 'ا�ابت�اع ا�صع��د�` �`حدث ع� د�&ا تبت�ع ش�&عة خضراء ا�ش�&عة ا�ح�&راء ا�ساب�ة با�ْا�&��R إشارة ����`ة ��صع��د.',
            difficulty: 'medium',
            xp: 20
        },
        {
            id: 'tech-3',
            question: '�&اذا �`ش�`ر �&ؤشر RSI ع� د�&ا �`ْ���  ف��� 70�x',
            options: [
                'ا�س�!�& ف�` �&� ط�ة تشبع ب�`ع�`',
                'ا�س�!�& ف�` �&� ط�ة تشبع شرائ�`',
                'ا�س�!�& ف�` اتجا�! صاعد',
                'ا�س�!�& ف�` اتجا�! �!ابط'
            ],
            correct: 1,
            explanation: 'RSI ف��� 70 �`ش�`ر إ��0 تشبع شرائ�` (Overbought)�R �&�&ا �د �`ع� �` احت�&ا� تصح�`ح أ�� ا� عْاس.',
            difficulty: 'medium',
            xp: 20
        },
        {
            id: 'tech-4',
            question: '�&ا �!�� ا�فر� ب�`�  ا��&ت��سط ا��&تحرْ ا�بس�`ط (SMA) ��ا�أس�` (EMA)�x',
            options: [
                '�ا �`��جد فر�',
                'EMA �`عط�` ��ز� ا�9 أْبر ��أسعار ا�حد�`ثة',
                'SMA أسرع ف�` ا�استجابة',
                'EMA �`ستخد�& ف�ط ��أس�!�&'
            ],
            correct: 1,
            explanation: 'EMA �`عط�` ��ز� ا�9 أْبر ��أسعار ا�أخ�`رة �&�&ا �`جع��! أسرع ف�` ا�استجابة ��تغ�`رات ا�حد�`ثة.',
            difficulty: 'hard',
            xp: 25
        }
    ],
    
    risk: [
        {
            id: 'risk-1',
            question: '�&ا �!�` �اعدة 5% ف�` إدارة ا��&خاطر�x',
            options: [
                'استث�&ار 5% �&�  راتبْ',
                'عد�& ا��&خاطرة بأْثر �&�  5% �&�  ا��&حفظة ف�` صف�ة ��احدة',
                'شراء 5 أس�!�& ف�ط',
                'ا�احتفاظ ب٬ 5% � �دا�9'
            ],
            correct: 1,
            explanation: '�اعدة 5% ت� ص بعد�& ا��&خاطرة بأْثر �&�  5% �&�  ��`�&ة ا��&حفظة ف�` صف�ة ��احدة ��ح�&ا�`ة �&�  ا�خسائر ا�ْب�`رة.',
            difficulty: 'medium',
            xp: 20
        },
        {
            id: 'risk-2',
            question: '�&ا �!�� ���ف ا�خسارة (Stop Loss)�x',
            options: [
                'أ�&ر �تح��`� ا�ربح',
                'أ�&ر �ب�`ع ا�س�!�& ت��ائ�`ا�9 ع� د سعر �&حدد �ت���`� ا�خسارة',
                '� ��ع �&�  أ� ��اع ا�تح��`�',
                'استرات�`ج�`ة شراء'
            ],
            correct: 1,
            explanation: '���ف ا�خسارة �!�� أ�&ر ت��ائ�` �ب�`ع ا�س�!�& ع� د ��ص����! �سعر �&ع�`�  �ت���`� ا�خسائر ا��&حت�&�ة.',
            difficulty: 'easy',
            xp: 15
        }
    ]
};

// ============================================
// د��ا� ا��&ساعدة
// ============================================

/**
 * حساب ��`�&ة ا��&حفظة
 */
function calculatePortfolioValue(state) {
    const portfolioValue = state.simulation.portfolio.reduce((sum, holding) => {
        const currentPrice = getSimulatedPrice(holding.ticker);
        return sum + (holding.shares * currentPrice);
    }, 0);
    return portfolioValue + state.simulation.balance;
}

/**
 * ا�حص��� ع��0 ا�سعر ا��&حاْ�0
 */
function getSimulatedPrice(ticker) {
    const stock = simulationStocks[ticker];
    if (!stock) return 0;
    
    // ت����`د سعر عش��ائ�` ب� اء�9 ع��0 ا�ت��ب
    const change = (Math.random() - 0.5) * 2 * stock.volatility * stock.basePrice;
    return stock.basePrice + change;
}

/**
 * حساب ا��&ست���0 ب� اء�9 ع��0 XP
 */
function calculateLevel(xp) {
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
 * ا�حص��� ع��0 ا�رتبة ب� اء�9 ع��0 XP
 */
function getRank(xp) {
    const ranks = achievementsData.ranks;
    let currentRank = ranks[0];
    
    for (const rank of ranks) {
        if (xp >= rank.minXP) {
            currentRank = rank;
        }
    }
    
    return currentRank;
}

/**
 * ا�تح�� �&�  ا�إ� جازات
 */
function checkAchievements(state) {
    const newAchievements = [];
    
    for (const [key, badge] of Object.entries(achievementsData.badges)) {
        if (!state.user.badges.includes(key) && badge.condition(state)) {
            state.user.badges.push(key);
            state.user.xp += badge.xp;
            newAchievements.push(badge);
        }
    }
    
    return newAchievements;
}

// ============================================
// تصد�`ر ا���حدة
// ============================================
export {
    learningStateV2,
    coursesData,
    candlestickPatterns,
    marketScenarios,
    achievementsData,
    simulationStocks,
    quizBank,
    calculatePortfolioValue,
    getSimulatedPrice,
    calculateLevel,
    getRank,
    checkAchievements
};

console.log('�xa Learning Module V2 Loaded - Full Course with Live Simulation');

