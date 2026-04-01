/**
 * منصة استثمار EGX - التطبيق الرئيسي
 * واجهة أمامية معيارية باستخدام Tailwind CSS
 */

import apiService from '/static/js/api.js?v=2026033107';
import {
    createStatCard,
    createBadge,
    createLoadingSpinner,
    createEmptyState,
    createAlert,
    createStockTableRow,
    createRecommendationCard,
    createIndexCard,
    formatNumber,
    formatCurrency,
    formatDate
} from '/static/js/modules/utils.js?v=2026033107';
import {
    createCandlestickChart,
    createCombinedChart,
    createAreaChart,
    destroyChart
} from '/static/js/modules/charts.js?v=2026033107';
import { normalizeHistoryPayload, normalizeRecommendationPayload } from '/static/js/modules/deep-analysis.js?v=2026033107';
import { initializeLearningCenter } from '/static/js/modules/learning.js?v=2026033107';
import {
    initializeUserModule,
    userState,
    loadWatchlist,
    loadAssets,
    loadIncomeExpenses,
    loadFinancialSummary,
    loadScheduledAdvices,
    loadUserSettings,
    addToWatchlist,
    removeFromWatchlist,
    createAsset,
    updateAsset,
    deleteAsset,
    createIncomeExpense,
    updateIncomeExpense,
    deleteIncomeExpense,
    createScheduledAdvice,
    deleteScheduledAdvice,
    updateUserSettings,
    showNotification
} from '/static/js/modules/user.js?v=2026033107';

// Global chart instance for cleanup
let currentChart = null;
let globalLoadingCount = 0;
let globalLoadingTimer = null;
let liveRefreshTimer = null;
let liveRefreshInFlight = false;

const LIVE_REFRESH_INTERVALS_MS = {
    dashboard: 15000,
    market: 15000,
    stocks: 20000,
    news: 45000
};

// ==================== حا�ة ا�تطب�`� ====================
const state = {
    currentPage: 'dashboard',
    stocks: [],
    page: 1,
    pageSize: 20,
    totalStocks: 0,
    sectors: [],
    marketStatus: null,
};

const portfolioUiState = {
    stocksLoaded: false,
    stockOptions: []
};

function getComparableValue(item, field) {
    if (!item) return '';

    const valueMap = {
        name: item.name_ar || item.name || item.stock_name || item.asset_name || item.title || '',
        symbol: item.ticker || item.asset_ticker || '',
        index: item.egx30_member ? 'egx30' : (item.egx70_member ? 'egx70' : (item.egx100_member ? 'egx100' : '')),
    };

    const raw = valueMap[field] ?? item[field] ?? '';
    if (raw === null || raw === undefined) return '';

    if (field === 'transaction_date' || field === 'scheduled_time' || field === 'created_at' || field === 'updated_at') {
        const ts = Date.parse(raw);
        return Number.isNaN(ts) ? 0 : ts;
    }

    const asNumber = Number(raw);
    if (typeof raw === 'number' || (!Number.isNaN(asNumber) && String(raw).trim() !== '')) {
        return asNumber;
    }

    return String(raw).toLowerCase();
}

function sortItems(items, field, direction = 'asc') {
    if (!Array.isArray(items)) return [];
    const dir = direction === 'desc' ? -1 : 1;
    return [...items].sort((a, b) => {
        const aVal = getComparableValue(a, field);
        const bVal = getComparableValue(b, field);
        if (aVal < bVal) return -1 * dir;
        if (aVal > bVal) return 1 * dir;
        return 0;
    });
}

async function addTickerToWatchlist(ticker) {
    if (!ticker) return;

    if (!userState.isAuthenticated) {
        showNotification('سجل الدخول أولاً لإضافة السهم إلى قائمة المراقبة', 'warning');
        if (typeof window.openAuthModal === 'function') {
            window.openAuthModal('login');
        }
        return;
    }

    try {
        await addToWatchlist(ticker);
        if (state.currentPage === 'watchlist') {
            await loadWatchlistPage();
        }
    } catch (error) {
        console.error('Add to watchlist failed:', error);
    }
}

window.addTickerToWatchlist = addTickerToWatchlist;

// ==================== ع� اصر DOM ====================
const elements = {
    sidebar: document.getElementById('sidebar'),
    sidebarBackdrop: document.getElementById('sidebarBackdrop'),
    mobileMenuBtn: document.getElementById('mobileMenuBtn'),
    themeToggle: document.getElementById('themeToggle'),
    pageTitle: document.getElementById('pageTitle'),
    contentArea: document.getElementById('contentArea'),
    marketStatus: document.getElementById('marketStatus'),
    stockModal: document.getElementById('stockModal'),
    modalBody: document.getElementById('modalBody'),
    modalStockName: document.getElementById('modalStockName'),
};

// ==================== ا�ت�!�`ئة ====================
document.addEventListener('DOMContentLoaded', async () => {
    console.log('DOMContentLoaded event fired');
    console.log('Initializing application...');

    try {
        initializeThemeToggle();
        console.log('Theme toggle initialized');
    } catch (e) {
        console.error('Error initializing theme toggle:', e);
    }

    try {
        initializeNavigation();
        console.log('Navigation initialized');
    } catch (e) {
        console.error('Error initializing navigation:', e);
    }

    try {
        initializeEventListeners();
        console.log('Event listeners initialized');
    } catch (e) {
        console.error('Error initializing event listeners:', e);
    }

    try {
        initializePortfolioAssetForm();
        console.log('Portfolio asset form initialized');
    } catch (e) {
        console.error('Error initializing portfolio asset form:', e);
    }

    try {
        initializeGlobalLoadingIndicator();
        console.log('Global loading indicator initialized');
    } catch (e) {
        console.error('Error initializing global loading indicator:', e);
    }

    try {
        loadDashboard();
        console.log('Dashboard loading initiated');
    } catch (e) {
        console.error('Error loading dashboard:', e);
    }

    try {
        updateMarketStatus();
        console.log('Market status update initiated');
    } catch (e) {
        console.error('Error updating market status:', e);
    }

    // ت�!�`ئة ��حدة ا��&ستخد�&
    try {
        await initializeUserModule();
        console.log('User module initialized');
    } catch (e) {
        console.error('Error initializing user module:', e);
    }

    // تحد�`ث حا�ة ا�س��� ْ� د��`�ة
    setInterval(updateMarketStatus, 60000);
    restartAutoRefreshLoop();
});

function getLiveRefreshInterval(page = state.currentPage) {
    return LIVE_REFRESH_INTERVALS_MS[page] || 0;
}

async function refreshActivePage({ silent = true } = {}) {
    if (liveRefreshInFlight) return;

    liveRefreshInFlight = true;
    try {
        switch (state.currentPage) {
            case 'dashboard':
                await loadDashboard({ silent });
                break;
            case 'market':
                await loadMarketOverview({ silent });
                break;
            case 'stocks':
                await loadStocks(state.page || 1, { silent });
                break;
            case 'news':
                await loadNewsPage({ silent });
                break;
            default:
                break;
        }
    } catch (error) {
        console.error('Live refresh failed:', error);
    } finally {
        liveRefreshInFlight = false;
    }
}

function restartAutoRefreshLoop() {
    if (liveRefreshTimer) {
        clearInterval(liveRefreshTimer);
        liveRefreshTimer = null;
    }

    const interval = getLiveRefreshInterval();
    if (!interval) return;

    liveRefreshTimer = setInterval(() => {
        refreshActivePage({ silent: true });
    }, interval);
}

// ==================== ا�ت� �� ====================
function initializeNavigation() {
    const navItems = document.querySelectorAll('.nav-item');
    console.log('Initializing navigation, found', navItems.length, 'nav items');

    navItems.forEach((item, index) => {
        const page = item.dataset.page;
        console.log(`Nav item ${index}: data-page="${page}"`);

        item.addEventListener('click', (e) => {
            e.preventDefault();
            const page = item.dataset.page;
            console.log('Nav item clicked, navigating to:', page);
            navigateTo(page);
        });
    });
}

function navigateTo(page) {
    console.log('navigateTo called with page:', page);

    // تحد�`ث ع� صر ا�ت� �� ا�� شط
    document.querySelectorAll('.nav-item').forEach(item => {
        item.classList.remove('active', 'bg-blue-600', 'text-white');
        item.classList.add('text-gray-600');
    });

    const activeItem = document.querySelector(`[data-page="${page}"]`);
    if (activeItem) {
        activeItem.classList.add('active', 'bg-blue-600', 'text-white');
        activeItem.classList.remove('text-gray-600');
    }

    // إخفاء ج�&�`ع ا�صفحات
    const allPages = document.querySelectorAll('.page');
    console.log('Found', allPages.length, 'page elements to hide');
    allPages.forEach(p => {
        console.log('Hiding page:', p.id);
        p.classList.add('hidden');
    });

    // إظ�!ار ا�صفحة ا��&حددة
    const pageElement = document.getElementById(`${page}Page`);
    console.log('Looking for page element:', `${page}Page`, 'found:', !!pageElement);
    if (pageElement) {
        console.log('Showing page:', pageElement.id);
        console.log('Before - has hidden class:', pageElement.classList.contains('hidden'));
        pageElement.classList.remove('hidden');
        console.log('After - has hidden class:', pageElement.classList.contains('hidden'));
        console.log('Display style:', window.getComputedStyle(pageElement).display);
    }

    // تحد�`ث ع� ��ا�  ا�صفحة
    const titles = {
            dashboard: 'لوحة التحكم',
            market: 'نظرة عامة على السوق',
            stocks: 'جميع الأسهم',
            search: 'البحث عن الأسهم',
            recommendations: 'توصيات الاستثمار',
            learning: 'مركز التعلم',
            news: 'أخبار الاستثمار',
            watchlist: 'قائمة المراقبة',
            portfolio: 'محفظتي',
            'income-expense': 'الدخل والمصروفات',
            alerts: 'التنبيهات المجدولة',
            settings: 'الإعدادات',
            subscription: 'الاشتراك',
    };
        elements.pageTitle.textContent = titles[page] || 'لوحة التحكم';

    state.currentPage = page;
    restartAutoRefreshLoop();

    // Close mobile sidebar after navigation
    if (window.innerWidth <= 768) {
        closeMobileSidebar();
    }

    // تح�&�`� ب�`ا� ات ا�صفحة
    switch (page) {
        case 'dashboard':
            loadDashboard();
            break;
        case 'market':
            loadMarketOverview();
            break;
        case 'stocks':
            loadStocks();
            break;
        case 'recommendations':
            // ا�صفحة ثابتة�R �ا حاجة ��تح�&�`� ا�أ����`
            break;
        case 'learning':
            // ت�!�`ئة �&رْز ا�تع��& ع� د ا�ا� ت�ا� إ��`�!
            initializeLearningCenter();
            break;
        case 'news':
            loadNewsPage();
            break;
        case 'watchlist':
            loadWatchlistPage();
            break;
        case 'portfolio':
            loadPortfolioPage();
            break;
        case 'income-expense':
            loadIncomeExpensePage();
            break;
        case 'alerts':
            loadAlertsPage();
            break;
        case 'settings':
            loadSettingsPage();
            break;
        case 'subscription':
            loadSubscriptionPage();
            break;
    }
}

// جع� navigateTo �&تاحا�9 عا��&�`ا�9 ��استخدا�& �&�  user.js
window.navigateToPage = navigateTo;

// ==================== �&ست�&ع�` ا�أحداث ====================
function initializeEventListeners() {
    // Mobile sidebar controls
    elements.mobileMenuBtn?.addEventListener('click', openMobileSidebar);
    elements.sidebarBackdrop?.addEventListener('click', closeMobileSidebar);
    elements.themeToggle?.addEventListener('click', toggleTheme);

    // �&فتاح API �&�  صفحة ا�إعدادات
    document.getElementById('saveSettingsApiKey')?.addEventListener('click', () => {
        const key = document.getElementById('currentApiKey')?.value?.trim();
        if (!key) {
            showNotification('يرجى إدخال مفتاح API صالح', 'danger');
            return;
        }
        apiService.setApiKey(key);
        showNotification('تم حفظ مفتاح API', 'success');
    });

    // ف�اتر صفحة ا�أس�!�&
    document.getElementById('indexFilter')?.addEventListener('change', () => loadStocks(1));
    document.getElementById('sectorFilter')?.addEventListener('change', () => loadStocks(1));
    document.getElementById('stockSearchField')?.addEventListener('change', () => loadStocks(1));
    document.getElementById('stockQuickSearch')?.addEventListener('input', () => loadStocks(1));
    document.getElementById('stockQuickSearch')?.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') loadStocks(1);
    });
    document.getElementById('stockSortField')?.addEventListener('change', () => loadStocks(1));
    document.getElementById('stockSortDir')?.addEventListener('change', () => loadStocks(1));
    document.getElementById('prevPage')?.addEventListener('click', () => loadStocks(state.page - 1));
    document.getElementById('nextPage')?.addEventListener('click', () => loadStocks(state.page + 1));

    // ا�بحث
    document.getElementById('searchBtn')?.addEventListener('click', performSearch);
    document.getElementById('searchQuery')?.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') performSearch();
    });
    document.getElementById('searchSortField')?.addEventListener('change', performSearch);
    document.getElementById('searchSortDir')?.addEventListener('change', performSearch);

    // ا�ت��ص�`ات
    document.getElementById('getRecommendationsBtn')?.addEventListener('click', getRecommendations);

    // ا�� افذة ا��&� بث�ة
    document.getElementById('closeModal')?.addEventListener('click', closeModal);
    document.getElementById('closeModalBtn')?.addEventListener('click', closeModal);
    elements.stockModal?.addEventListener('click', (e) => {
        if (e.target === elements.stockModal) closeModal();
    });

    // جع� showStockDetail �&تاحا�9 عا��&�`ا�9
    window.showStockDetail = showStockDetail;
    
    // جع� toggleEducationSection �&تاحا�9 عا��&�`ا�9
    window.toggleEducationSection = toggleEducationSection;
}

// Toggle education section visibility
function toggleEducationSection() {
    const section = document.getElementById('educationSection');
    const icon = document.getElementById('educationToggleIcon');
    if (section) {
        section.classList.toggle('hidden');
        if (icon) {
            icon.classList.toggle('fa-chevron-down');
            icon.classList.toggle('fa-chevron-up');
        }
    }
}

function initializeGlobalLoadingIndicator() {
    if (document.getElementById('globalLoadingOverlay')) return;

    const overlay = document.createElement('div');
    overlay.id = 'globalLoadingOverlay';
    overlay.innerHTML = `
        <div style="display:flex;flex-direction:column;align-items:center;gap:10px;">
            <div style="width:42px;height:42px;border:4px solid #e5e7eb;border-top-color:#2563eb;border-radius:9999px;animation:spin 0.9s linear infinite;"></div>
            <div style="font-size:14px;font-weight:600;color:#1f2937;">جاري تحميل البيانات...</div>
            <div style="font-size:12px;color:#6b7280;">الرجاء الانتظار</div>
        </div>
    `;

    overlay.style.cssText = [
        'position: fixed',
        'inset: 0',
        'display: none',
        'align-items: center',
        'justify-content: center',
        'background: rgba(15,23,42,0.26)',
        'backdrop-filter: blur(3px)',
        'z-index: 100000'
    ].join(';');

    const style = document.createElement('style');
    style.textContent = `@keyframes spin { to { transform: rotate(360deg); } }`;
    document.head.appendChild(style);
    document.body.appendChild(overlay);

    window.addEventListener('app:loading', (event) => {
        const isLoading = Boolean(event?.detail?.loading);
        if (isLoading) {
            globalLoadingCount += 1;
            if (globalLoadingTimer) clearTimeout(globalLoadingTimer);

            // Delay to avoid flicker on very fast requests
            globalLoadingTimer = setTimeout(() => {
                if (globalLoadingCount > 0) {
                    overlay.style.display = 'flex';
                }
            }, 180);
            return;
        }

        globalLoadingCount = Math.max(0, globalLoadingCount - 1);
        if (globalLoadingCount === 0) {
            if (globalLoadingTimer) clearTimeout(globalLoadingTimer);
            overlay.style.display = 'none';
        }
    });
}

function initializeThemeToggle() {
    updateThemeToggleUI();
}

function toggleTheme() {
    const isDark = document.documentElement.classList.toggle('dark');
    localStorage.setItem('theme', isDark ? 'dark' : 'light');
    updateThemeToggleUI();
}

function updateThemeToggleUI() {
    const isDark = document.documentElement.classList.contains('dark');
    if (!elements.themeToggle) return;
    elements.themeToggle.innerHTML = isDark
        ? '<i class="fas fa-sun"></i><span>فاتح</span>'
    : '<i class="fas fa-moon"></i><span>داكن</span>';
}

function openMobileSidebar() {
    elements.sidebar?.classList.add('mobile-open');
    elements.sidebarBackdrop?.classList.add('active');
    document.body.classList.add('overflow-hidden');
}

function closeMobileSidebar() {
    elements.sidebar?.classList.remove('mobile-open');
    elements.sidebarBackdrop?.classList.remove('active');
    document.body.classList.remove('overflow-hidden');
}

// ==================== ���حة ا�تحْ�& ====================
async function loadDashboard(options = {}) {
    const { silent = false } = options;
    const loading = document.getElementById('dashboardLoading');
    const content = document.getElementById('dashboardContent');
    
    try {
        // Show loading indicator
        if (!silent) {
            loading?.classList.remove('hidden');
            content?.classList.add('hidden');
        }
        
        const [overview, stocks] = await Promise.all([
            apiService.getMarketOverview(),
            apiService.getStocks({ page_size: 100 })
        ]);

        const stocksList = stocks.stocks || stocks.data || [];

        // تحد�`ث ا�إحصائ�`ات
        const totalStocks = stocks.total || stocksList.length || 0;
        const gainingCount = stocksList.filter(s => s.price_change > 0).length || overview.top_gainers?.length || 0;
        const losingCount = stocksList.filter(s => s.price_change < 0).length || overview.top_losers?.length || 0;
        
        // ا�حص��� ع��0 ��`�&ة �&ؤشر EGX30
        const egx30Index = overview.indices?.find(i => i.symbol === 'EGX30');
        const egx30Value = egx30Index?.value || overview.summary?.egx30_value || 0;
        const egx30ChangePct = Number(egx30Index?.change_percent ?? 0);
        const egx30ChangeEl = document.getElementById('egx30ChangePct');

        document.getElementById('totalStocks').textContent = totalStocks;
        document.getElementById('gainingStocks').textContent = gainingCount;
        document.getElementById('losingStocks').textContent = losingCount;
        document.getElementById('egx30Value').textContent = egx30Value ? formatNumber(egx30Value, 2) : '-';
        if (egx30ChangeEl) {
            const isUp = egx30ChangePct >= 0;
            egx30ChangeEl.className = `text-sm font-medium mt-1 ${isUp ? 'text-green-600' : 'text-red-600'}`;
            egx30ChangeEl.innerHTML = `<i class="fas ${isUp ? 'fa-arrow-up' : 'fa-arrow-down'} text-xs ml-1"></i>${Math.abs(egx30ChangePct).toFixed(2)}%`;
        }

        updateMarketPulseBar({
            gainingCount,
            losingCount,
            totalStocks,
            marketStatus: overview.market_status,
            lastUpdated: overview.last_updated
        });

        await renderPortfolioImpactFeed();

        // تحد�`ث جد��� ا�رابح�`� 
        const gainersTable = document.querySelector('#gainersTable tbody');
        if (gainersTable && overview.top_gainers) {
            gainersTable.innerHTML = overview.top_gainers.map(stock => `
                <tr class="hover:bg-gray-50 cursor-pointer" onclick="showStockDetail('${stock.ticker}')">
                    <td class="px-4 py-3 font-medium text-blue-600">${stock.ticker}</td>
                    <td class="px-4 py-3 text-gray-900">${stock.name_ar || stock.name || '-'}</td>
                    <td class="px-4 py-3 font-medium">${stock.current_price ? formatCurrency(stock.current_price) : '-'}</td>
                    <td class="px-4 py-3 text-green-600">
                        <i class="fas fa-arrow-up text-xs mr-1"></i>
                        ${stock.price_change?.toFixed(2) || '0.00'}
                    </td>
                    <td class="px-4 py-3">
                        <button class="px-2 py-1 text-xs rounded-md bg-emerald-600 text-white hover:bg-emerald-700"
                            onclick="event.stopPropagation(); addTickerToWatchlist('${stock.ticker}')">
                            متابعة
                        </button>
                    </td>
                </tr>
            `).join('') || '<tr><td colspan="5" class="px-4 py-8 text-center text-gray-500">لا توجد بيانات متاحة</td></tr>';
        }

        // تحد�`ث جد��� ا�خاسر�`� 
        const losersTable = document.querySelector('#losersTable tbody');
        if (losersTable && overview.top_losers) {
            losersTable.innerHTML = overview.top_losers.map(stock => `
                <tr class="hover:bg-gray-50 cursor-pointer" onclick="showStockDetail('${stock.ticker}')">
                    <td class="px-4 py-3 font-medium text-blue-600">${stock.ticker}</td>
                    <td class="px-4 py-3 text-gray-900">${stock.name_ar || stock.name || '-'}</td>
                    <td class="px-4 py-3 font-medium">${stock.current_price ? formatCurrency(stock.current_price) : '-'}</td>
                    <td class="px-4 py-3 text-red-600">
                        <i class="fas fa-arrow-down text-xs mr-1"></i>
                        ${Math.abs(stock.price_change || 0).toFixed(2)}
                    </td>
                    <td class="px-4 py-3">
                        <button class="px-2 py-1 text-xs rounded-md bg-emerald-600 text-white hover:bg-emerald-700"
                            onclick="event.stopPropagation(); addTickerToWatchlist('${stock.ticker}')">
                            متابعة
                        </button>
                    </td>
                </tr>
            `).join('') || '<tr><td colspan="5" class="px-4 py-8 text-center text-gray-500">لا توجد بيانات متاحة</td></tr>';
        }

        // استخراج ا��طاعات ��ف�اتر
        state.sectors = [...new Set(stocksList.map(s => s.sector).filter(Boolean))];
        updateSectorFilters();
        
        // Show content, hide loading
        if (!silent) {
            loading?.classList.add('hidden');
            content?.classList.remove('hidden');
        }

    } catch (error) {
        console.error('خطأ في تحميل لوحة التحكم:', error);
        if (!silent) {
            showNotification('فشل تحميل بيانات لوحة التحكم', 'danger');
            loading?.classList.add('hidden');
            content?.classList.remove('hidden');
        }
    }
}

function updateMarketPulseBar({ gainingCount, losingCount, totalStocks, marketStatus, lastUpdated }) {
    const breadthEl = document.getElementById('pulseBreadth');
    const riskEl = document.getElementById('pulseRisk');
    const updatedAtEl = document.getElementById('pulseUpdatedAt');
    const sessionEl = document.getElementById('pulseSession');

    if (breadthEl) {
        const total = Math.max(1, Number(totalStocks || 0));
        const breadthPercent = Number(((Number(gainingCount || 0) / total) * 100).toFixed(1));
        breadthEl.textContent = `${breadthPercent}% رابح`;
        breadthEl.className = `pulse-value ${breadthPercent >= 50 ? 'text-green-600' : 'text-red-600'}`;
    }

    if (riskEl) {
        const gain = Number(gainingCount || 0);
        const loss = Number(losingCount || 0);
        const riskLabel = loss > gain ? 'مرتفعة' : (loss === gain ? 'متوازنة' : 'منخفضة');
        riskEl.textContent = riskLabel;
        riskEl.className = `pulse-value ${riskLabel === 'مرتفعة' ? 'text-red-600' : (riskLabel === 'متوازنة' ? 'text-amber-600' : 'text-green-600')}`;
    }

    if (updatedAtEl) {
        const d = lastUpdated ? new Date(lastUpdated) : new Date();
        updatedAtEl.textContent = d.toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit' });
    }

    if (sessionEl) {
        const isOpen = marketStatus?.is_open;
        sessionEl.textContent = isOpen ? 'مفتوح' : 'مغلق';
        sessionEl.className = `pulse-value ${isOpen ? 'text-emerald-600' : 'text-slate-600'}`;
    }
}

async function renderPortfolioImpactFeed() {
    const container = document.getElementById('portfolioImpactFeed');
    if (!container) {
        return;
    }

    if (!apiService.getApiKey()) {
        container.innerHTML = '<div class="text-sm text-gray-500">سجّل الدخول ثم أضف أصولك لرؤية التأثير اليومي على محفظتك.</div>';
        return;
    }

    try {
        const payload = await apiService.getPortfolioImpact();
        const summary = payload.summary || {};
        const items = payload.items || [];
        const topPositive = payload.top_positive || [];
        const topNegative = payload.top_negative || [];
        const recommendation = payload.recommendation || {};
        const riskAlerts = payload.risk_alerts || [];

        if (!items.length) {
            container.innerHTML = '<div class="text-sm text-gray-500">لا توجد أصول مرتبطة بأسهم بعد. أضف أصولك من صفحة محفظتي لتفعيل الملخص اليومي.</div>';
            return;
        }

        const dayUp = Number(summary.day_impact_value || 0) >= 0;

        const renderList = (list, cls) => {
            if (!list.length) {
                return '<div class="text-xs text-gray-500">لا توجد عناصر</div>';
            }
            return list.map(item => `
                <div class="flex items-center justify-between py-1 border-b border-gray-100 last:border-b-0">
                    <button class="text-sm text-blue-700 hover:text-blue-800 text-right" onclick="showStockDetail('${item.ticker}')">${item.ticker} - ${item.name_ar || '-'}</button>
                    <span class="text-sm font-semibold ${cls}">${item.day_impact_value >= 0 ? '+' : ''}${formatNumber(item.day_impact_value, 2)} جنيه</span>
                </div>
            `).join('');
        };

        const actionClass = `action-${(recommendation.action || 'hold').replace('_', '-')}`;

        const renderAlerts = () => {
            if (!riskAlerts.length) {
                return '<div class="text-xs text-gray-500">لا توجد تنبيهات مخاطرة حرجة الآن.</div>';
            }
            return riskAlerts.slice(0, 5).map(item => `
                <div class="flex flex-wrap items-center justify-between gap-2 py-1.5 border-b border-gray-100 last:border-b-0">
                    <button class="text-sm text-red-700 hover:text-red-800 text-right font-medium" onclick="showStockDetail('${item.ticker}')">${item.ticker} - ${item.name_ar || '-'}</button>
                    <div class="flex flex-wrap gap-1.5">
                        ${(item.alerts || []).map(a => `<span class="alert-chip warn"><i class="fas fa-exclamation-triangle text-[10px]"></i>${a}</span>`).join('')}
                    </div>
                </div>
            `).join('');
        };

        container.innerHTML = `
            <div class="professional-callout ${actionClass} mb-4">
                <div class="flex items-center justify-between gap-3 mb-1">
                    <div class="text-sm font-semibold text-gray-900">توصية اليوم: ${recommendation.action_label_ar || 'ثبّت المراكز'}</div>
                    <div class="text-xs text-gray-600">ثقة ${(Number(recommendation.confidence || 0.6) * 100).toFixed(0)}%</div>
                </div>
                <div class="text-sm text-gray-700">${recommendation.reason_ar || 'راقب توازن المحفظة ووزّع المخاطر قبل أي زيادة.'}</div>
            </div>
            <div class="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                <div class="bg-gray-50 rounded-lg p-3 border border-gray-200">
                    <div class="text-xs text-gray-500 mb-1">القيمة السوقية</div>
                    <div class="text-lg font-semibold text-gray-900">${formatNumber(summary.total_market_value || 0, 2)} جنيه</div>
                </div>
                <div class="bg-gray-50 rounded-lg p-3 border border-gray-200">
                    <div class="text-xs text-gray-500 mb-1">أثر اليوم</div>
                    <div class="text-lg font-semibold ${dayUp ? 'text-green-600' : 'text-red-600'}">
                        ${dayUp ? '+' : ''}${formatNumber(summary.day_impact_value || 0, 2)} جنيه
                        <span class="text-sm">(${Math.abs(Number(summary.day_impact_percent || 0)).toFixed(2)}%)</span>
                    </div>
                </div>
                <div class="bg-gray-50 rounded-lg p-3 border border-gray-200">
                    <div class="text-xs text-gray-500 mb-1">إجمالي الربح/الخسارة</div>
                    <div class="text-lg font-semibold ${(Number(summary.total_gain_loss || 0) >= 0) ? 'text-green-600' : 'text-red-600'}">
                        ${(Number(summary.total_gain_loss || 0) >= 0) ? '+' : ''}${formatNumber(summary.total_gain_loss || 0, 2)} جنيه
                    </div>
                </div>
            </div>
            <div class="rounded-lg border border-rose-200 bg-rose-50/30 p-3 mb-4">
                <div class="text-sm font-semibold text-rose-700 mb-2">تنبيهات مخاطرة مباشرة</div>
                ${renderAlerts()}
            </div>
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div class="rounded-lg border border-green-200 bg-green-50/40 p-3">
                    <div class="text-sm font-semibold text-green-700 mb-2">أكثر الأسهم دعمًا للمحفظة اليوم</div>
                    ${renderList(topPositive, 'text-green-700')}
                </div>
                <div class="rounded-lg border border-red-200 bg-red-50/40 p-3">
                    <div class="text-sm font-semibold text-red-700 mb-2">أكثر الأسهم ضغطًا على المحفظة اليوم</div>
                    ${renderList(topNegative, 'text-red-700')}
                </div>
            </div>
        `;
    } catch (error) {
        console.error('Failed to render portfolio impact feed:', error);
        container.innerHTML = '<div class="text-sm text-amber-600">تعذر تحميل أثر المحفظة الآن. جرّب مرة أخرى.</div>';
    }
}

// ==================== � ظرة عا�&ة ع��0 ا�س��� ====================
async function loadMarketOverview(options = {}) {
    const { silent = false } = options;
    console.log('loadMarketOverview called');
    
    const loading = document.getElementById('marketLoading');
    const content = document.getElementById('marketContent');
    
    try {
        // Show loading indicator
        if (!silent) {
            loading?.classList.remove('hidden');
            content?.classList.add('hidden');
        }
        
        const overview = await apiService.getMarketOverview();
        console.log('Market overview data:', overview);

        // تحد�`ث شبْة ا��&ؤشرات
        const indicesGrid = document.getElementById('indicesGrid');
        console.log('indicesGrid element:', indicesGrid);
        if (indicesGrid && overview.indices) {
            console.log('Rendering', overview.indices.length, 'indices');
            indicesGrid.innerHTML = overview.indices.map(index => createIndexCard(index)).join('');
        }

        // تحد�`ث جد��� ا�أْثر تدا���ا�9
        const activeTable = document.querySelector('#activeTable tbody');
        console.log('activeTable element:', activeTable);
        if (activeTable && overview.most_active) {
            console.log('Rendering', overview.most_active.length, 'most active stocks');
            activeTable.innerHTML = overview.most_active.map(stock => `
                <tr class="hover:bg-gray-50 cursor-pointer" onclick="showStockDetail('${stock.ticker}')">
                    <td class="px-4 py-3 font-medium text-blue-600">${stock.ticker}</td>
                    <td class="px-4 py-3 text-gray-900">${stock.name_ar || stock.name || '-'}</td>
                    <td class="px-4 py-3 font-medium">${stock.current_price ? formatCurrency(stock.current_price) : '-'}</td>
                    <td class="px-4 py-3 text-gray-500">${formatNumber(stock.volume)}</td>
                    <td class="px-4 py-3">
                        <button class="px-2 py-1 text-xs rounded-md bg-emerald-600 text-white hover:bg-emerald-700"
                            onclick="event.stopPropagation(); addTickerToWatchlist('${stock.ticker}')">
                            متابعة
                        </button>
                    </td>
                </tr>
            `).join('') || '<tr><td colspan="5" class="px-4 py-8 text-center text-gray-500">لا توجد بيانات متاحة</td></tr>';
        }
        
        // Show content, hide loading
        if (!silent) {
            loading?.classList.add('hidden');
            content?.classList.remove('hidden');
        }

    } catch (error) {
        console.error('خطأ في تحميل نظرة السوق:', error);
        if (!silent) {
            showNotification('فشل تحميل بيانات السوق', 'danger');
            loading?.classList.add('hidden');
            content?.classList.remove('hidden');
        }
    }
}

// ==================== ا�أس�!�& ====================
async function loadStocks(page = 1, options = {}) {
    const { silent = false } = options;
    const pageLoading = document.getElementById('stocksPageLoading');
    const pageContent = document.getElementById('stocksPageContent');
    const loading = document.getElementById('stocksLoading');
    const tableBody = document.querySelector('#stocksTable tbody');

    try {
        // Show page loading indicator on first load
        if (!silent) {
            if (page === 1 && state.stocks.length === 0) {
                pageLoading?.classList.remove('hidden');
                pageContent?.classList.add('hidden');
            } else {
                loading?.classList.remove('hidden');
            }
        }

        const query = document.getElementById('stockQuickSearch')?.value?.trim();
        const searchField = document.getElementById('stockSearchField')?.value || 'all';
        const stockSortField = document.getElementById('stockSortField')?.value || 'ticker';
        const stockSortDir = document.getElementById('stockSortDir')?.value || 'asc';
        const sector = document.getElementById('sectorFilter')?.value;
        const indexFilter = document.getElementById('indexFilter')?.value;

        const response = await apiService.getStocks({
            page,
            page_size: state.pageSize,
            query: query || undefined,
            search_field: searchField,
            sector: sector || undefined,
            index: indexFilter || undefined,
        });

        state.stocks = sortItems(response.stocks || response.data || [], stockSortField, stockSortDir);
        state.page = page;
        state.totalStocks = response.total || state.stocks.length;

        tableBody.innerHTML = state.stocks.map(stock => `
            <tr class="hover:bg-gray-50 cursor-pointer" onclick="showStockDetail('${stock.ticker}')">
                <td class="px-4 py-3 font-medium text-blue-600">${stock.ticker}</td>
                <td class="px-4 py-3 text-gray-900">${stock.name_ar || stock.name || '-'}</td>
                <td class="px-4 py-3 font-medium">${stock.current_price ? formatCurrency(stock.current_price) : '-'}</td>
                <td class="px-4 py-3 ${stock.price_change >= 0 ? 'text-green-600' : 'text-red-600'}">
                    <i class="fas ${stock.price_change >= 0 ? 'fa-arrow-up' : 'fa-arrow-down'} text-xs mr-1"></i>
                    ${Math.abs(stock.price_change || 0).toFixed(2)}
                </td>
                <td class="px-4 py-3 text-gray-500">${stock.sector || '-'}</td>
                <td class="px-4 py-3">
                    <button class="text-blue-600 hover:text-blue-800 text-sm font-medium"
                        onclick="event.stopPropagation(); showStockDetail('${stock.ticker}')">
                        عرض التفاصيل
                    </button>
                    <button class="mr-2 text-emerald-600 hover:text-emerald-800 text-sm font-medium"
                        onclick="event.stopPropagation(); addTickerToWatchlist('${stock.ticker}')">
                        متابعة
                    </button>
                </td>
            </tr>
        `).join('');

        // تحد�`ث �&ع����&ات ا�صفحات
        document.getElementById('stocksInfo').textContent =
            `عرض ${state.stocks.length} من ${state.totalStocks} سهم`;

        document.getElementById('prevPage').disabled = page <= 1;
        document.getElementById('nextPage').disabled = state.stocks.length < state.pageSize;
        
        // Show content, hide loading
        if (!silent) {
            pageLoading?.classList.add('hidden');
            pageContent?.classList.remove('hidden');
            loading?.classList.add('hidden');
        }

    } catch (error) {
        console.error('خطأ في تحميل الأسهم:', error);
        if (!silent) {
            tableBody.innerHTML = `<tr><td colspan="6" class="px-4 py-8 text-center text-red-500">فشل تحميل الأسهم: ${error.message}</td></tr>`;
            pageLoading?.classList.add('hidden');
            pageContent?.classList.remove('hidden');
            loading?.classList.add('hidden');
        }
    }
}

// ==================== ا�بحث ====================
async function performSearch() {
    const query = document.getElementById('searchQuery')?.value.trim();
    if (!query) {
        showNotification('الرجاء إدخال كلمة البحث', 'warning');
        return;
    }

    const loading = document.getElementById('searchLoading');
    const resultsContainer = document.getElementById('searchResults');

    try {
        loading?.classList.remove('hidden');

        const sector = document.getElementById('searchSectorFilter')?.value;
        const minPrice = document.getElementById('minPrice')?.value;
        const maxPrice = document.getElementById('maxPrice')?.value;

        const response = await apiService.searchStocks(query, {
            sector: sector || undefined,
            min_price: minPrice || undefined,
            max_price: maxPrice || undefined,
        });

        const searchSortField = document.getElementById('searchSortField')?.value || 'ticker';
        const searchSortDir = document.getElementById('searchSortDir')?.value || 'asc';
        const sortedResults = sortItems(response.results || [], searchSortField, searchSortDir);

        if (sortedResults && sortedResults.length > 0) {
            resultsContainer.innerHTML = `
                <div class="mb-4 text-sm text-gray-500">
                    تم العثور على ${response.total} نتيجة لـ "${query}" (مع تطبيق الفرز)
                </div>
                <div class="overflow-x-auto">
                    <table class="w-full">
                        <thead>
                            <tr class="bg-gray-50 text-right">
                                <th class="px-4 py-3 text-xs font-semibold text-gray-500 uppercase">الرمز</th>
                                <th class="px-4 py-3 text-xs font-semibold text-gray-500 uppercase">الاسم</th>
                                <th class="px-4 py-3 text-xs font-semibold text-gray-500 uppercase">السعر</th>
                                <th class="px-4 py-3 text-xs font-semibold text-gray-500 uppercase">القطاع</th>
                                <th class="px-4 py-3 text-xs font-semibold text-gray-500 uppercase">إجراءات</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${sortedResults.map(stock => `
                                <tr class="hover:bg-gray-50 border-b border-gray-100 cursor-pointer" onclick="showStockDetail('${stock.ticker}')">
                                    <td class="px-4 py-3 font-medium text-blue-600">${stock.ticker}</td>
                                    <td class="px-4 py-3 text-gray-900">${stock.name || '-'}</td>
                                    <td class="px-4 py-3 font-medium">${stock.current_price ? formatCurrency(stock.current_price) : '-'}</td>
                                    <td class="px-4 py-3 text-gray-500">${stock.sector || '-'}</td>
                                    <td class="px-4 py-3">
                                        <button class="text-blue-600 hover:text-blue-800 text-sm font-medium"
                                            onclick="event.stopPropagation(); showStockDetail('${stock.ticker}')">عرض</button>
                                        <button class="mr-2 text-emerald-600 hover:text-emerald-800 text-sm font-medium"
                                            onclick="event.stopPropagation(); addTickerToWatchlist('${stock.ticker}')">متابعة</button>
                                    </td>
                                </tr>
                            `).join('')}
                        </tbody>
                    </table>
                </div>
            `;
        } else {
            resultsContainer.innerHTML = createEmptyState({
                icon: 'fa-search',
                title: 'لا توجد نتائج',
                message: `لم يتم العثور على أسهم تطابق "${query}"`
            });
        }

    } catch (error) {
        console.error('خطأ في البحث:', error);
        resultsContainer.innerHTML = createAlert({
            type: 'danger',
            message: `فشل البحث: ${error.message}`
        });
    } finally {
        loading?.classList.add('hidden');
    }
}


// ==================== ا�ت��ص�`ات ====================
async function getRecommendations() {
    const capital = parseFloat(document.getElementById('capitalInput')?.value) || 100000;
    const risk = document.getElementById('riskSelect')?.value || 'medium';
    const maxStocks = parseInt(document.getElementById('maxStocksInput')?.value) || 10;
    const sectors = document.getElementById('sectorsInput')?.value;

    const resultContainer = document.getElementById('recommendationsResult');
    resultContainer.innerHTML = `
        <div class="flex flex-col items-center justify-center py-20">
            <div class="w-16 h-16 border-4 border-gray-200 border-t-blue-600 rounded-full animate-spin mb-4"></div>
            <p class="text-gray-500 text-sm">جاري حساب التوصيات...</p>
        </div>
    `;

    try {
        const response = await apiService.getRecommendations({
            capital,
            risk,
            max_stocks: maxStocks,
            sectors: sectors || undefined,
        });

        if (response.recommendations && response.recommendations.length > 0) {
            const riskText = {
                'low': 'منخفض',
                'medium': 'متوسط',
                'high': 'عالٍ'
            };

            resultContainer.innerHTML = `
                <div class="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
                    <div class="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
                        <h4 class="text-sm font-medium text-gray-500 mb-2">إجمالي رأس المال</h4>
                        <div class="text-2xl font-semibold text-gray-900">${formatCurrency(capital)}</div>
                    </div>
                    <div class="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
                        <h4 class="text-sm font-medium text-gray-500 mb-2">مستوى المخاطرة</h4>
                        <div class="text-2xl font-semibold text-gray-900">${riskText[risk] || risk}</div>
                    </div>
                    <div class="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
                        <h4 class="text-sm font-medium text-gray-500 mb-2">العائد السنوي المتوقع</h4>
                        <div class="text-2xl font-semibold text-green-600">${response.expected_annual_return || 15}%</div>
                    </div>
                </div>
                
                <div class="bg-white rounded-xl shadow-sm border border-gray-200">
                    <div class="p-4 border-b border-gray-200">
                        <h3 class="font-semibold text-gray-900">المحفظة المقترحة</h3>
                        <p class="text-sm text-gray-500">${response.recommendations.length} أسهم مختارة</p>
                    </div>
                    <div class="p-4 space-y-3">
                        ${response.recommendations.map(rec => createRecommendationCard(rec, capital)).join('')}
                    </div>
                </div>
                
                ${response.risk_assessment ? `
                    <div class="mt-6 bg-white rounded-xl p-6 shadow-sm border border-gray-200">
                        <h3 class="font-semibold text-gray-900 mb-4">تقييم المخاطر</h3>
                        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                            ${Object.entries(response.risk_assessment).map(([key, value]) => `
                                <div class="flex justify-between py-2 border-b border-gray-100">
                                    <span class="text-gray-500">${getRiskAssessmentText(key)}</span>
                                    <span class="font-medium">${typeof value === 'number' ? value.toFixed(2) : value}</span>
                                </div>
                            `).join('')}
                        </div>
                    </div>
                ` : ''}
            `;
        } else {
            resultContainer.innerHTML = createAlert({
                type: 'warning',
                title: 'لا توجد توصيات',
                message: 'لم يتم العثور على أسهم مناسبة تطابق معاييرك. حاول تعديل الفلاتر.'
            });
        }

    } catch (error) {
        console.error('خطأ في الحصول على التوصيات:', error);
        resultContainer.innerHTML = createAlert({
            type: 'danger',
            message: `فشل الحصول على التوصيات: ${error.message}`
        });
    }
}

// ==================== تفاص�`� ا�س�!�& ====================
async function showStockDetail(ticker) {
    elements.modalStockName.textContent = `جاري تحميل ${ticker}...`;
    elements.modalBody.innerHTML = createLoadingSpinner();
    elements.stockModal?.classList.add('active');

    if (currentChart) {
        destroyChart(currentChart);
        currentChart = null;
    }

    try {
        const [stockResponse, historyResponse, recommendationResponse] = await Promise.all([
            apiService.getStock(ticker),
            apiService.getStockHistory(ticker, 60).catch(() => null),
            apiService.getStockRecommendation(ticker).catch(() => null)
        ]);

        const stock = stockResponse.data;
        const normalizedHistory = normalizeHistoryPayload(historyResponse);
        const normalizedRecommendation = normalizeRecommendationPayload(recommendationResponse);

        elements.modalStockName.textContent = `${stock.name_ar || stock.name || stock.ticker} (${stock.ticker})`;

        const priceChange = stock.price_change || 0;
        const changeClass = priceChange >= 0 ? 'text-green-600' : 'text-red-600';

        let historyChartHtml = '';
        if (normalizedHistory.success && normalizedHistory.data.length > 0) {
            const summary = normalizedHistory.summary || {};
            historyChartHtml = `
                <div class="mt-6 bg-white rounded-lg p-4 border border-gray-200">
                    <div class="flex items-center justify-between mb-4">
                        <h4 class="font-semibold text-gray-900">الرسم البياني للأسعار</h4>
                        <div class="flex gap-2">
                            <button onclick="switchChartType('candlestick')" id="btn-candlestick" class="px-3 py-1 text-xs rounded-lg bg-blue-600 text-white">شموع</button>
                            <button onclick="switchChartType('line')" id="btn-line" class="px-3 py-1 text-xs rounded-lg bg-gray-200 text-gray-700 hover:bg-gray-300">خطي</button>
                        </div>
                    </div>
                    <div class="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
                        <div class="text-center bg-gray-50 rounded-lg p-2"><div class="text-xs text-gray-500">أعلى</div><div class="font-semibold text-green-600">${summary.high_price?.toFixed(2) || '-'}</div></div>
                        <div class="text-center bg-gray-50 rounded-lg p-2"><div class="text-xs text-gray-500">أدنى</div><div class="font-semibold text-red-600">${summary.low_price?.toFixed(2) || '-'}</div></div>
                        <div class="text-center bg-gray-50 rounded-lg p-2"><div class="text-xs text-gray-500">متوسط</div><div class="font-semibold text-gray-700">${summary.avg_price?.toFixed(2) || '-'}</div></div>
                        <div class="text-center bg-gray-50 rounded-lg p-2"><div class="text-xs text-gray-500">التغير</div><div class="font-semibold ${summary.price_change_percent >= 0 ? 'text-green-600' : 'text-red-600'}">${summary.price_change_percent ? summary.price_change_percent.toFixed(2) + '%' : '-'}</div></div>
                    </div>
                    <div id="stockChart" class="w-full"></div>
                </div>
            `;
        }

        let recommendationHtml = '';
        if (normalizedRecommendation && normalizedRecommendation.success) {
            const rec = normalizedRecommendation.recommendation || {};
            const action = (rec.action || 'hold').toLowerCase();
            const actionAr = rec.action_ar || action;
            const confidenceValue = typeof rec.confidence === 'number'
                ? rec.confidence
                : (typeof rec.confidence_score === 'number' ? rec.confidence_score : 0);

            const recClass = (action === 'buy' || action === 'strong_buy')
                ? 'bg-green-100 text-green-800 border-green-300'
                : ((action === 'sell' || action === 'strong_sell')
                    ? 'bg-red-100 text-red-800 border-red-300'
                    : 'bg-yellow-100 text-yellow-800 border-yellow-300');

            recommendationHtml = `
                <div class="mt-6 bg-white rounded-lg p-4 border border-gray-200">
                    <h4 class="font-semibold text-gray-900 mb-3">التوصية الذكية</h4>
                    <div class="flex items-center gap-3 mb-3">
                        <div class="px-3 py-1 rounded-lg border ${recClass} font-semibold">${actionAr.toUpperCase()}</div>
                        <div class="text-sm text-gray-600">الثقة: <span class="font-semibold">${confidenceValue.toFixed(1)}%</span></div>
                    </div>
                    ${(rec.reason_ar || rec.reason) ? `<p class="text-sm text-gray-700">${rec.reason_ar || rec.reason}</p>` : ''}
                </div>
            `;
        }

        elements.modalBody.innerHTML = `
            <div class="flex items-start justify-between mb-6">
                <div>
                    <h2 class="text-2xl font-bold text-gray-900">${stock.name_ar || stock.name || stock.ticker}</h2>
                    <p class="text-gray-500">${stock.ticker} ${stock.sector ? `⬢ ${stock.sector}` : ''}</p>
                </div>
                <div class="text-left">
                    <div class="text-3xl font-bold text-gray-900">${stock.current_price ? formatCurrency(stock.current_price) : '-'}</div>
                    <div class="${changeClass} text-sm mt-1">${Math.abs(priceChange).toFixed(2)}</div>
                </div>
            </div>

            <div class="mb-6">
                <span class="inline-flex items-center px-3 py-1 rounded-lg bg-slate-100 text-slate-700 text-sm">
                    <i class="fas fa-info-circle ml-1"></i>بيانات EGX محدثة
                </span>
            </div>

            <div class="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                <div class="bg-gray-50 rounded-lg p-4"><div class="text-xs text-gray-500 mb-1">الإغلاق السابق</div><div class="font-semibold">${stock.previous_close ? formatCurrency(stock.previous_close) : '-'}</div></div>
                <div class="bg-gray-50 rounded-lg p-4"><div class="text-xs text-gray-500 mb-1">الافتتاح</div><div class="font-semibold">${stock.open_price ? formatCurrency(stock.open_price) : '-'}</div></div>
                <div class="bg-gray-50 rounded-lg p-4"><div class="text-xs text-gray-500 mb-1">أعلى</div><div class="font-semibold">${stock.high_price ? formatCurrency(stock.high_price) : '-'}</div></div>
                <div class="bg-gray-50 rounded-lg p-4"><div class="text-xs text-gray-500 mb-1">أدنى</div><div class="font-semibold">${stock.low_price ? formatCurrency(stock.low_price) : '-'}</div></div>
            </div>

            ${historyChartHtml}
            ${recommendationHtml}

            <div class="mt-6 pt-4 border-t border-gray-200 text-sm text-gray-500">آخر تحديث: ${formatDate(stock.last_update)}</div>
        `;

        if (normalizedHistory.success && normalizedHistory.data.length > 0) {
            window.currentHistoryData = normalizedHistory.data;
            setTimeout(() => {
                currentChart = createCandlestickChart('stockChart', normalizedHistory.data, {
                    title: ''
                });
            }, 100);
        }

    } catch (error) {
        console.error('خطأ في تحميل تفاصيل السهم:', error);
        elements.modalBody.innerHTML = createAlert({
            type: 'danger',
            message: `فشل تحميل تفاصيل السهم: ${error.message}`
        });
    }
}

// Chart type switching function
window.switchChartType = function (type) {
    if (!window.currentHistoryData) return;

    // Destroy previous chart
    if (currentChart) {
        destroyChart(currentChart);
    }

    // Update button styles
    const candleBtn = document.getElementById('btn-candlestick');
    const lineBtn = document.getElementById('btn-line');

    if (type === 'candlestick') {
        candleBtn.className = 'px-3 py-1 text-xs rounded-lg bg-blue-600 text-white';
        lineBtn.className = 'px-3 py-1 text-xs rounded-lg bg-gray-200 text-gray-700 hover:bg-gray-300';
        currentChart = createCandlestickChart('stockChart', window.currentHistoryData, { title: '' });
    } else {
        candleBtn.className = 'px-3 py-1 text-xs rounded-lg bg-gray-200 text-gray-700 hover:bg-gray-300';
        lineBtn.className = 'px-3 py-1 text-xs rounded-lg bg-blue-600 text-white';
        currentChart = createAreaChart('stockChart', window.currentHistoryData, { title: '' });
    }
};

function closeModal() {
    elements.stockModal?.classList.remove('active');

    // Restore body scroll only if mobile sidebar is not open
    const sidebarOpen = elements.sidebar?.classList.contains('mobile-open');
    if (!sidebarOpen) {
        document.body.classList.remove('overflow-hidden');
    }

    // Destroy chart when closing modal
    if (currentChart) {
        destroyChart(currentChart);
        currentChart = null;
    }
    window.currentHistoryData = null;
}

// ==================== حا�ة ا�س��� ====================
async function updateMarketStatus() {
    try {
        const status = await apiService.getMarketStatus();
        const statusElement = elements.marketStatus;

        if (status.is_open) {
            statusElement.classList.add('open');
            statusElement.querySelector('.status-dot').classList.remove('bg-red-500');
            statusElement.querySelector('.status-dot').classList.add('bg-green-500');
            statusElement.querySelector('.status-text').textContent = 'السوق مفتوح';
        } else {
            statusElement.classList.remove('open');
            statusElement.querySelector('.status-dot').classList.remove('bg-green-500');
            statusElement.querySelector('.status-dot').classList.add('bg-red-500');
            statusElement.querySelector('.status-text').textContent = 'السوق مغلق';
        }

        state.marketStatus = status;

    } catch (error) {
        console.error('خطأ في تحديث حالة السوق:', error);
    }
}

// ==================== ا��&ساعدات ====================
function updateSectorFilters() {
    const selects = ['sectorFilter', 'searchSectorFilter'];

    selects.forEach(id => {
        const select = document.getElementById(id);
        if (select) {
            const currentValue = select.value;
            select.innerHTML = '<option value="">جميع القطاعات</option>' +
                state.sectors.map(s => `<option value="${s}">${s}</option>`).join('');
            select.value = currentValue;
        }
    });
}

// ==================== صفحات ا��&ستخد�& ====================

async function loadWatchlistPage() {
    if (!apiService.hasApiKey()) {
        document.getElementById('watchlistLoading')?.classList.add('hidden');
        document.getElementById('watchlistEmpty')?.classList.remove('hidden');
        document.getElementById('watchlistEmpty').innerHTML = `
            <i class="fas fa-lock text-4xl text-gray-300 mb-4"></i>
            <p class="text-gray-500 mb-4">يجب تسجيل الدخول لعرض قائمة المراقبة</p>
            <button onclick="openAuthModal('login')" class="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-sm">
                تسجيل الدخول
            </button>
        `;
        return;
    }

    try {
        document.getElementById('watchlistLoading')?.classList.remove('hidden');
        document.getElementById('watchlistEmpty')?.classList.add('hidden');
        document.getElementById('watchlistTableContainer')?.classList.add('hidden');

        const watchlist = await loadWatchlist();
        const sortedWatchlist = sortItems(watchlist || [], 'ticker', 'asc');
        
        document.getElementById('watchlistLoading')?.classList.add('hidden');
        
        if (!sortedWatchlist || sortedWatchlist.length === 0) {
            document.getElementById('watchlistEmpty')?.classList.remove('hidden');
            return;
        }

        document.getElementById('watchlistTableContainer')?.classList.remove('hidden');
        const tbody = document.getElementById('watchlistTableBody');
        tbody.innerHTML = sortedWatchlist.map(item => `
            <tr class="border-b border-gray-100 hover:bg-gray-50">
                <td class="px-6 py-4 font-medium text-gray-900">${item.ticker}</td>
                <td class="px-6 py-4 text-gray-600">${item.stock_name || '-'}</td>
                <td class="px-6 py-4">${formatCurrency(item.current_price)}</td>
                <td class="px-6 py-4 ${item.price_change >= 0 ? 'text-green-600' : 'text-red-600'}">
                    ${item.price_change ? (item.price_change >= 0 ? '+' : '') + item.price_change.toFixed(2) + '%' : '-'}
                </td>
                <td class="px-6 py-4 text-sm text-gray-500">
                    ${item.alert_price_above ? `أعلى من ${item.alert_price_above}` : ''}
                    ${item.alert_price_below ? `أقل من ${item.alert_price_below}` : ''}
                    ${!item.alert_price_above && !item.alert_price_below ? '-' : ''}
                </td>
                <td class="px-6 py-4 text-sm text-gray-500">${item.notes || '-'}</td>
                <td class="px-6 py-4">
                    <button onclick="removeWatchlistItem(${item.id})" class="text-red-500 hover:text-red-700">
                        <i class="fas fa-trash"></i>
                    </button>
                </td>
            </tr>
        `).join('');
    } catch (error) {
        console.error('خطأ في تحميل قائمة المراقبة:', error);
        showNotification('فشل تحميل قائمة المراقبة', 'danger');
    }
}

async function loadPortfolioPage() {
    initializePortfolioAssetForm();
    if (!apiService.hasApiKey()) {
        document.getElementById('assetsLoading')?.classList.add('hidden');
        document.getElementById('assetsEmpty')?.classList.remove('hidden');
        document.getElementById('assetsEmpty').innerHTML = `
            <i class="fas fa-lock text-4xl text-gray-300 mb-4"></i>
            <p class="text-gray-500 mb-4">يجب تسجيل الدخول لعرض محفظتك</p>
            <button onclick="openAuthModal('login')" class="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-sm">
                تسجيل الدخول
            </button>
        `;
        return;
    }

    try {
        document.getElementById('assetsLoading')?.classList.remove('hidden');
        document.getElementById('assetsEmpty')?.classList.add('hidden');
        document.getElementById('assetsTableContainer')?.classList.add('hidden');

        const [assets, summary] = await Promise.all([
            loadAssets(),
            loadFinancialSummary()
        ]);
        const sortedAssets = sortItems(assets || [], 'current_value', 'desc');

        // تحد�`ث �&�خص ا��&حفظة
        if (summary) {
            const totalValue = getPortfolioSummaryValue(summary, 'total_assets_value', 'total_value');
            document.getElementById('portfolioTotalValue').textContent = formatCurrency(totalValue);
            const gainLossEl = document.getElementById('portfolioGainLoss');
            gainLossEl.textContent = formatCurrency(summary.total_gain_loss);
            gainLossEl.className = `text-xl font-bold ${summary.total_gain_loss >= 0 ? 'text-green-600' : 'text-red-600'}`;
            
            const gainPercentEl = document.getElementById('portfolioGainPercent');
            gainPercentEl.textContent = summary.total_gain_loss_percent ? summary.total_gain_loss_percent.toFixed(2) + '%' : '-';
            gainPercentEl.className = `text-xl font-bold ${summary.total_gain_loss_percent >= 0 ? 'text-green-600' : 'text-red-600'}`;
            
            document.getElementById('portfolioAssetCount').textContent = sortedAssets?.length || 0;

            renderPortfolioRiskInsights(sortedAssets || [], summary);
        }

        document.getElementById('assetsLoading')?.classList.add('hidden');

        if (!sortedAssets || sortedAssets.length === 0) {
            document.getElementById('assetsEmpty')?.classList.remove('hidden');
            return;
        }

        document.getElementById('assetsTableContainer')?.classList.remove('hidden');
        const tbody = document.getElementById('assetsTableBody');
        tbody.innerHTML = sortedAssets.map(asset => `
            <tr class="border-b border-gray-100 hover:bg-gray-50">
                <td class="px-6 py-4">
                    <span class="px-2 py-1 text-xs rounded-full ${getAssetTypeClass(asset.asset_type)}">${getAssetTypeLabel(asset.asset_type)}</span>
                </td>
                <td class="px-6 py-4 font-medium text-gray-900">${asset.asset_name}</td>
                <td class="px-6 py-4">${asset.quantity}</td>
                <td class="px-6 py-4">${formatCurrency(asset.purchase_price)}</td>
                <td class="px-6 py-4">${formatCurrency(asset.current_price)}</td>
                <td class="px-6 py-4 font-medium">${formatCurrency(asset.current_value)}</td>
                <td class="px-6 py-4 ${asset.gain_loss >= 0 ? 'text-green-600' : 'text-red-600'}">
                    ${formatCurrency(asset.gain_loss)} (${asset.gain_loss_percent ? asset.gain_loss_percent.toFixed(2) : 0}%)
                </td>
                <td class="px-6 py-4 flex items-center gap-2">
                    <button onclick="editAsset(${asset.id})" class="text-blue-500 hover:text-blue-700" title="تعديل">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button onclick="openSellAssetModal(${asset.id}, '${encodeURIComponent(JSON.stringify(asset))}');" class="text-emerald-600 hover:text-emerald-700" title="بيع الأصل">
                        <i class="fas fa-cash-register"></i>
                    </button>
                    <button onclick="deleteAssetConfirm(${asset.id})" class="text-red-500 hover:text-red-700" title="حذف">
                        <i class="fas fa-trash"></i>
                    </button>
                </td>
            </tr>
        `).join('');
    } catch (error) {
        console.error('خطأ في تحميل المحفظة:', error);
        showNotification('فشل تحميل المحفظة', 'danger');
    }
}

function getPortfolioSummaryValue(summary, primaryKey, fallbackKey = null) {
    if (!summary) return 0;
    if (typeof summary[primaryKey] === 'number') return summary[primaryKey];
    if (fallbackKey && typeof summary[fallbackKey] === 'number') return summary[fallbackKey];
    return 0;
}

function renderPortfolioRiskInsights(assets = [], summary = null) {
    const container = document.getElementById('portfolioRiskInsights');
    if (!container) return;

    if (!assets || assets.length === 0) {
        container.innerHTML = `
            <h3 class="font-semibold text-gray-900 mb-2">
                <i class="fas fa-shield-alt text-emerald-600 ml-2"></i>إرشادات إدارة المخاطر
            </h3>
            <p class="text-sm text-gray-600">أضف أصولاً أولاً لعرض تحليل توزيع المحفظة والتنبيهات الذكية لإدارة المخاطر.</p>
        `;
        return;
    }

    const totalValue = getPortfolioSummaryValue(summary, 'total_value', 'total_assets_value') ||
        assets.reduce((sum, asset) => sum + (asset.current_value || 0), 0);
    const typeBreakdown = summary?.by_type || {};
    const totalGainPercent = typeof summary?.total_gain_loss_percent === 'number' ? summary.total_gain_loss_percent : 0;
    const profitableAssets = assets.filter((a) => Number(a.gain_loss || 0) > 0).length;

    const sortedByValue = [...assets].sort((a, b) => (b.current_value || 0) - (a.current_value || 0));
    const largest = sortedByValue[0];
    const largestPercent = totalValue > 0 ? ((largest?.current_value || 0) / totalValue) * 100 : 0;
    const typeCount = Object.keys(typeBreakdown).length || new Set(assets.map(a => a.asset_type)).size;
    const diversificationScore = Math.max(
        0,
        Math.min(100, (typeCount * 18) + Math.min(assets.length, 8) * 5 - Math.max(0, largestPercent - 35))
    );

    const riskLevel = largestPercent >= 45 ? 'مرتفع' : largestPercent >= 30 ? 'متوسط' : 'منخفض';
    const riskClass = largestPercent >= 45 ? 'text-red-600' : largestPercent >= 30 ? 'text-amber-600' : 'text-emerald-600';

    const tips = [];
    if (largestPercent > 35) {
        tips.push(`التركيز مرتفع في أصل واحد (${largest?.asset_name || '-'}) بنسبة ${largestPercent.toFixed(1)}%. يُفضل خفضه إلى أقل من 30%.`);
    } else {
        tips.push('توزيع الأصول الرئيسية جيد. حافظ على حد أقصى 25-30% لكل أصل.');
    }

    if (typeCount < 3) {
        tips.push('يستحسن زيادة التنويع إلى 3 فئات أصول مختلفة على الأقل لتقليل المخاطر.');
    } else {
        tips.push('التنويع بين فئات الأصول جيد. راقب إعادة التوازن شهرياً.');
    }

    if (totalGainPercent < -10) {
        tips.push('المحفظة في تراجع ملحوظ. راجع متوسطات التكلفة وخفف الانكشاف على الأصول الأعلى تذبذباً.');
    } else {
        tips.push('استخدم قاعدة المخاطرة: لا تجعل أي مركز يتجاوز 2% مخاطرة من إجمالي رأس المال.');
    }

    tips.push('احتفظ بسيولة 10-20% لاستغلال الفرص وتخفيف أثر تقلبات السوق.');

    container.innerHTML = `
        <div class="flex items-center justify-between flex-wrap gap-3 mb-4">
            <h3 class="font-semibold text-gray-900">
                <i class="fas fa-shield-alt text-emerald-600 ml-2"></i>لوحة التحكم في المخاطر
            </h3>
            <span class="text-sm ${riskClass} font-semibold">مستوى المخاطر: ${riskLevel}</span>
        </div>
        <div class="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
            <div class="bg-gray-50 rounded-lg p-3">
                <p class="text-xs text-gray-500">أعلى تركّز في أصل</p>
                <p class="font-bold text-gray-900">${largestPercent.toFixed(1)}%</p>
            </div>
            <div class="bg-gray-50 rounded-lg p-3">
                <p class="text-xs text-gray-500">درجة التنويع</p>
                <p class="font-bold text-gray-900">${diversificationScore.toFixed(0)}/100</p>
            </div>
            <div class="bg-gray-50 rounded-lg p-3">
                <p class="text-xs text-gray-500">الأصول الرابحة</p>
                <p class="font-bold text-gray-900">${profitableAssets}</p>
            </div>
            <div class="bg-gray-50 rounded-lg p-3">
                <p class="text-xs text-gray-500">عدد فئات الأصول</p>
                <p class="font-bold text-gray-900">${typeCount}</p>
            </div>
        </div>
        <div class="bg-emerald-50 border border-emerald-200 rounded-lg p-4">
            <h4 class="font-semibold text-emerald-800 mb-2">توجيهات عملية لإدارة الأصول</h4>
            <ul class="text-sm text-emerald-900 space-y-1">
                ${tips.map(tip => `<li>⬢ ${tip}</li>`).join('')}
            </ul>
        </div>
    `;
}

async function loadStockOptionsForPortfolio() {
    if (portfolioUiState.stocksLoaded) return portfolioUiState.stockOptions;

    const allStocks = [];
    let page = 1;
    let totalPages = 1;

    do {
        const response = await apiService.getStocks({ page, page_size: 200 });
        const pageStocks = response?.stocks || [];
        allStocks.push(...pageStocks);
        totalPages = response?.total_pages || 1;
        page += 1;
    } while (page <= totalPages && page <= 10);

    allStocks.sort((a, b) => (a.ticker || '').localeCompare(b.ticker || ''));
    portfolioUiState.stockOptions = allStocks;
    portfolioUiState.stocksLoaded = true;
    return allStocks;
}

function updateAssetNameModeByType() {
    const assetTypeEl = document.getElementById('assetType');
    const assetNameContainerEl = document.getElementById('assetNameContainer');
    const assetNameEl = document.getElementById('assetName');
    const assetTickerEl = document.getElementById('assetTicker');
    const assetPurchasePriceEl = document.getElementById('assetPurchasePrice');
    const stockSelectContainer = document.getElementById('stockSelectionContainer');
    const stockSelect = document.getElementById('assetStockSelect');
    const stockIdEl = document.getElementById('assetStockId');
    const selectedStockMetaEl = document.getElementById('selectedStockMeta');

    if (!assetTypeEl || !assetNameEl || !assetTickerEl || !assetPurchasePriceEl || !stockSelectContainer || !stockSelect || !stockIdEl || !selectedStockMetaEl) return;

    const isStock = assetTypeEl.value === 'stock';

    assetNameContainerEl?.classList.toggle('hidden', isStock);
    stockSelectContainer.classList.toggle('hidden', !isStock);
    assetNameEl.readOnly = isStock;
    assetTickerEl.readOnly = isStock;

    if (!isStock) {
        stockSelect.value = '';
        stockIdEl.value = '';
        selectedStockMetaEl.classList.add('hidden');
        selectedStockMetaEl.textContent = '';
        assetNameEl.value = '';
        assetTickerEl.value = '';
        assetPurchasePriceEl.value = '';
    }
}

async function initializePortfolioAssetForm() {
    const assetTypeEl = document.getElementById('assetType');
    const stockSelect = document.getElementById('assetStockSelect');
    const assetNameEl = document.getElementById('assetName');
    const assetTickerEl = document.getElementById('assetTicker');
    const assetPurchasePriceEl = document.getElementById('assetPurchasePrice');
    const stockIdEl = document.getElementById('assetStockId');
    const selectedStockMetaEl = document.getElementById('selectedStockMeta');

    if (!assetTypeEl || !stockSelect || !assetNameEl || !assetTickerEl || !assetPurchasePriceEl || !stockIdEl || !selectedStockMetaEl) return;

    if (!stockSelect.dataset.initialized) {
        stockSelect.dataset.initialized = 'true';

        assetTypeEl.addEventListener('change', updateAssetNameModeByType);
        stockSelect.addEventListener('change', () => {
            const selected = stockSelect.selectedOptions[0];
            if (!selected || !selected.value) {
                stockIdEl.value = '';
                selectedStockMetaEl.classList.add('hidden');
                selectedStockMetaEl.textContent = '';
                assetNameEl.value = '';
                assetTickerEl.value = '';
                return;
            }

            const selectedPrice = selected.dataset.stockPrice ? parseFloat(selected.dataset.stockPrice) : null;
            stockIdEl.value = selected.dataset.stockId || '';
            assetNameEl.value = selected.dataset.stockName || selected.textContent || '';
            assetTickerEl.value = selected.value || '';

            if (selectedPrice && selectedPrice > 0) {
                assetPurchasePriceEl.value = selectedPrice.toFixed(2);
                selectedStockMetaEl.innerHTML = `آخر سعر متاح: <strong>${formatCurrency(selectedPrice)}</strong> • يمكنك التعديل قبل الحفظ`;
                selectedStockMetaEl.classList.remove('hidden');
            } else {
                selectedStockMetaEl.innerHTML = 'لا يوجد سعر سوقي متاح حاليًا، أدخل سعر الشراء يدويًا.';
                selectedStockMetaEl.classList.remove('hidden');
            }
        });
    }

    updateAssetNameModeByType();

    try {
        const stocks = await loadStockOptionsForPortfolio();
        const options = [
            '<option value="">اختر السهم...</option>',
            ...stocks.map(stock => {
                const displayName = stock.name_ar || stock.name || stock.ticker;
                const latestPrice = stock.current_price || stock.price || stock.close_price || '';
                return `<option value="${stock.ticker}" data-stock-id="${stock.id}" data-stock-name="${displayName}" data-stock-price="${latestPrice}">${displayName} (${stock.ticker})</option>`;
            })
        ];
        stockSelect.innerHTML = options.join('');
    } catch (error) {
        console.error('Failed to load stock dropdown options:', error);
        stockSelect.innerHTML = '<option value="">تعذر تحميل قائمة الأسهم</option>';
    }
}

async function loadIncomeExpensePage() {
    if (!apiService.hasApiKey()) {
        document.getElementById('transactionsLoading')?.classList.add('hidden');
        document.getElementById('transactionsEmpty')?.classList.remove('hidden');
        document.getElementById('transactionsEmpty').innerHTML = `
            <i class="fas fa-lock text-4xl text-gray-300 mb-4"></i>
            <p class="text-gray-500 mb-4">يجب تسجيل الدخول لعرض المعاملات</p>
            <button onclick="openAuthModal('login')" class="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-sm">
                تسجيل الدخول
            </button>
        `;
        return;
    }

    try {
        document.getElementById('transactionsLoading')?.classList.remove('hidden');
        document.getElementById('transactionsEmpty')?.classList.add('hidden');
        document.getElementById('transactionsTableContainer')?.classList.add('hidden');

        const [transactions, summary] = await Promise.all([
            loadIncomeExpenses(),
            loadFinancialSummary().catch(() => null)
        ]);
        const sortedTransactions = sortItems(transactions || [], 'transaction_date', 'desc');
        
        // حساب ا�إج�&ا��`ات
        const totalIncome = sortedTransactions?.filter(t => t.transaction_type === 'income').reduce((sum, t) => sum + t.amount, 0) || 0;
        const totalExpenses = sortedTransactions?.filter(t => t.transaction_type === 'expense').reduce((sum, t) => sum + t.amount, 0) || 0;
        const netCashFlow = totalIncome - totalExpenses;

        document.getElementById('totalIncome').textContent = formatCurrency(totalIncome);
        document.getElementById('totalExpenses').textContent = formatCurrency(totalExpenses);
        const netFlowEl = document.getElementById('netCashFlow');
        netFlowEl.textContent = formatCurrency(netCashFlow);
        netFlowEl.className = `text-xl font-bold ${netCashFlow >= 0 ? 'text-green-600' : 'text-red-600'}`;

        const investmentSpent = sortedTransactions?.filter(t => t.transaction_type === 'expense' && t.category === 'investment').reduce((sum, t) => sum + t.amount, 0) || 0;
        const currentPortfolioValue = getPortfolioSummaryValue(summary, 'total_assets_value', 'total_value');
        const unrealizedPnL = currentPortfolioValue - investmentSpent;

        const investmentSpentEl = document.getElementById('investmentSpent');
        const investmentCurrentValueEl = document.getElementById('investmentCurrentValue');
        const investmentUnrealizedPnLEl = document.getElementById('investmentUnrealizedPnL');

        if (investmentSpentEl) investmentSpentEl.textContent = formatCurrency(investmentSpent);
        if (investmentCurrentValueEl) investmentCurrentValueEl.textContent = formatCurrency(currentPortfolioValue);
        if (investmentUnrealizedPnLEl) {
            investmentUnrealizedPnLEl.textContent = formatCurrency(unrealizedPnL);
            investmentUnrealizedPnLEl.className = `font-bold ${unrealizedPnL >= 0 ? 'text-green-700' : 'text-red-700'}`;
        }

        document.getElementById('transactionsLoading')?.classList.add('hidden');

        if (!sortedTransactions || sortedTransactions.length === 0) {
            document.getElementById('transactionsEmpty')?.classList.remove('hidden');
            return;
        }

        document.getElementById('transactionsTableContainer')?.classList.remove('hidden');
        const tbody = document.getElementById('transactionsTableBody');
        tbody.innerHTML = sortedTransactions.map(t => `
            <tr class="border-b border-gray-100 hover:bg-gray-50">
                <td class="px-6 py-4">
                    <span class="px-2 py-1 text-xs rounded-full ${t.transaction_type === 'income' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}">
                        ${t.transaction_type === 'income' ? 'دخل' : 'مصروف'}
                    </span>
                </td>
                <td class="px-6 py-4">${getCategoryLabel(t.category)}</td>
                <td class="px-6 py-4 font-medium ${t.transaction_type === 'income' ? 'text-green-600' : 'text-red-600'}">
                    ${t.transaction_type === 'income' ? '+' : '-'}${formatCurrency(t.amount)}
                </td>
                <td class="px-6 py-4 text-gray-500">${formatDate(t.transaction_date)}</td>
                <td class="px-6 py-4 text-gray-500">${t.description || '-'}</td>
                <td class="px-6 py-4 flex items-center gap-3">
                    <button onclick="openEditTransactionModal(${t.id}, '${encodeURIComponent(JSON.stringify(t))}')" class="text-blue-500 hover:text-blue-700" title="تعديل">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button onclick="deleteTransactionConfirm(${t.id})" class="text-red-500 hover:text-red-700" title="حذف">
                        <i class="fas fa-trash"></i>
                    </button>
                </td>
            </tr>
        `).join('');
    } catch (error) {
        console.error('خطأ في تحميل المعاملات:', error);
        showNotification('فشل تحميل المعاملات', 'danger');
    }
}

async function loadAlertsPage() {
    if (!apiService.hasApiKey()) {
        document.getElementById('alertsLoading')?.classList.add('hidden');
        document.getElementById('alertsEmpty')?.classList.remove('hidden');
        document.getElementById('alertsEmpty').innerHTML = `
            <i class="fas fa-lock text-4xl text-gray-300 mb-4"></i>
            <p class="text-gray-500 mb-4">يجب تسجيل الدخول لعرض التنبيهات</p>
            <button onclick="openAuthModal('login')" class="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-sm">
                تسجيل الدخول
            </button>
        `;
        return;
    }

    try {
        document.getElementById('alertsLoading')?.classList.remove('hidden');
        document.getElementById('alertsEmpty')?.classList.add('hidden');
        document.getElementById('alertsListContainer')?.classList.add('hidden');

        const alerts = await loadScheduledAdvices();
        const sortedAlerts = sortItems(alerts || [], 'scheduled_time', 'asc');

        document.getElementById('alertsLoading')?.classList.add('hidden');

        if (!sortedAlerts || sortedAlerts.length === 0) {
            document.getElementById('alertsEmpty')?.classList.remove('hidden');
            return;
        }

        document.getElementById('alertsListContainer')?.classList.remove('hidden');
        const container = document.getElementById('alertsListContainer');
        container.innerHTML = sortedAlerts.map(alert => `
            <div class="border border-gray-200 rounded-lg p-4 flex items-center justify-between">
                <div class="flex items-center gap-4">
                    <div class="w-10 h-10 rounded-full ${alert.is_active ? 'bg-green-100' : 'bg-gray-100'} flex items-center justify-center">
                        <i class="fas ${getAdviceIcon(alert.advice_type)} ${alert.is_active ? 'text-green-600' : 'text-gray-400'}"></i>
                    </div>
                    <div>
                        <h4 class="font-medium text-gray-900">${alert.title}</h4>
                        <p class="text-sm text-gray-500">${getFrequencyLabel(alert.frequency)} - ${formatDate(alert.scheduled_time)}</p>
                    </div>
                </div>
                <div class="flex items-center gap-2">
                    <span class="px-2 py-1 text-xs rounded-full ${alert.is_active ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}">
                        ${alert.is_active ? 'نشط' : 'متوقف'}
                    </span>
                    <button onclick="deleteAlertConfirm(${alert.id})" class="text-red-500 hover:text-red-700">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            </div>
        `).join('');
    } catch (error) {
        console.error('خطأ في تحميل التنبيهات:', error);
        showNotification('فشل تحميل التنبيهات', 'danger');
    }
}

// ==================== صفحة أخبار ا�استث�&ار ====================

let currentNewsCategory = 'gold';
let newsData = {
    gold: [],
    silver: [],
    global: []
};

async function loadNewsPage(options = {}) {
    const { silent = false } = options;
    const loadingEl = document.getElementById('newsLoading');
    const contentEl = document.getElementById('newsContent');
    
    if (!silent) {
        loadingEl?.classList.remove('hidden');
        contentEl?.classList.add('hidden');
    }
    
    try {
        // تح�&�`� ج�&�`ع ا�ب�`ا� ات
        const [allNews, indices] = await Promise.all([
            apiService.getAllNews(5),
            apiService.getMarketIndices()
        ]);
        
        // تخز�`�  ا�ب�`ا� ات
        newsData.gold = allNews.gold?.news || [];
        newsData.silver = allNews.silver?.news || [];
        newsData.global = allNews.global_investments?.news || [];
        
        // تحد�`ث أسعار ا�س�ع
        updateCommodityPrices(allNews.gold?.price, allNews.silver?.price);
        
        // تحد�`ث ا��&ؤشرات ا�عا��&�`ة
        renderMarketIndices(indices);
        
        // ت�!�`ئة ا�تب���`بات
        initializeNewsTabs();
        
        // عرض ا�أخبار ا�افتراض�`ة
        renderNewsList(currentNewsCategory);
        
        if (!silent) {
            loadingEl?.classList.add('hidden');
            contentEl?.classList.remove('hidden');
        }
        
    } catch (error) {
        console.error('خطأ في تحميل الأخبار:', error);
        if (!silent) {
            loadingEl?.classList.add('hidden');
            contentEl?.classList.remove('hidden');
        }
        
        // عرض رسا�ة خطأ
        if (!silent) {
            const newsList = document.getElementById('newsList');
            if (newsList) {
                newsList.innerHTML = `
                    <div class="text-center py-8">
                        <i class="fas fa-exclamation-circle text-4xl text-gray-300 mb-4"></i>
                        <p class="text-gray-500">فشل تحميل الأخبار. يرجى المحاولة مرة أخرى.</p>
                    </div>
                `;
            }
        }
    }
}

function updateCommodityPrices(goldPrice, silverPrice) {
    // تحد�`ث سعر ا�ذ�!ب
    const goldPriceEl = document.getElementById('goldPrice');
    const goldChangeBadgeEl = document.getElementById('goldChangeBadge');
    const goldNoteEl = document.getElementById('goldNote');
    
    if (goldPrice && goldPriceEl) {
        goldPriceEl.textContent = formatNumber(goldPrice.price, 2);
        
        if (goldChangeBadgeEl) {
            const changePercent = goldPrice.change_percent || 0;
            const isPositive = changePercent >= 0;
            goldChangeBadgeEl.textContent = `${isPositive ? '+' : ''}${changePercent.toFixed(2)}%`;
            goldChangeBadgeEl.className = `px-3 py-1 rounded-full text-sm ${isPositive ? 'bg-green-500/30' : 'bg-red-500/30'}`;
        }
        
        if (goldNoteEl && goldPrice.note) {
            goldNoteEl.textContent = goldPrice.note;
            goldNoteEl.classList.remove('hidden');
        }
    }
    
    // تحد�`ث سعر ا�فضة
    const silverPriceEl = document.getElementById('silverPrice');
    const silverChangeBadgeEl = document.getElementById('silverChangeBadge');
    const silverNoteEl = document.getElementById('silverNote');
    
    if (silverPrice && silverPriceEl) {
        silverPriceEl.textContent = formatNumber(silverPrice.price, 2);
        
        if (silverChangeBadgeEl) {
            const changePercent = silverPrice.change_percent || 0;
            const isPositive = changePercent >= 0;
            silverChangeBadgeEl.textContent = `${isPositive ? '+' : ''}${changePercent.toFixed(2)}%`;
            silverChangeBadgeEl.className = `px-3 py-1 rounded-full text-sm ${isPositive ? 'bg-green-500/30' : 'bg-red-500/30'}`;
        }
        
        if (silverNoteEl && silverPrice.note) {
            silverNoteEl.textContent = silverPrice.note;
            silverNoteEl.classList.remove('hidden');
        }
    }
}

function renderMarketIndices(indices) {
    const gridEl = document.getElementById('marketIndicesGrid');
    if (!gridEl || !indices) return;
    
    gridEl.innerHTML = indices.map(index => {
        const isPositive = index.change_percent >= 0;
        const changeClass = isPositive ? 'text-green-600' : 'text-red-600';
        const changeIcon = isPositive ? 'fa-arrow-up' : 'fa-arrow-down';
        
        return `
            <div class="bg-gray-50 rounded-lg p-4 hover:bg-gray-100 transition-colors">
                <div class="flex items-center justify-between mb-2">
                    <span class="text-xs text-gray-500">${index.symbol}</span>
                    <span class="text-xs ${changeClass}">
                        <i class="fas ${changeIcon} ml-1"></i>
                        ${index.change_percent.toFixed(2)}%
                    </span>
                </div>
                <div class="font-semibold text-gray-900 text-sm mb-1">${index.name_ar}</div>
                <div class="text-lg font-bold text-gray-900">${formatNumber(index.value, 2)}</div>
            </div>
        `;
    }).join('');
}

function initializeNewsTabs() {
    const tabs = document.querySelectorAll('.news-tab');
    
    tabs.forEach(tab => {
        tab.addEventListener('click', () => {
            // تحد�`ث ا�تب���`ب ا�� شط
            tabs.forEach(t => {
                t.classList.remove('border-blue-600', 'text-blue-600');
                t.classList.add('border-transparent', 'text-gray-500');
            });
            tab.classList.remove('border-transparent', 'text-gray-500');
            tab.classList.add('border-blue-600', 'text-blue-600');
            
            // تح�&�`� ا�أخبار
            const category = tab.dataset.category;
            currentNewsCategory = category;
            renderNewsList(category);
        });
    });
}

function renderNewsList(category) {
    const newsListEl = document.getElementById('newsList');
    if (!newsListEl) return;
    
    const news = newsData[category] || [];
    
    if (news.length === 0) {
        newsListEl.innerHTML = `
            <div class="text-center py-8">
                <i class="fas fa-newspaper text-4xl text-gray-300 mb-4"></i>
                <p class="text-gray-500">لا توجد أخبار متاحة حالياً</p>
            </div>
        `;
        return;
    }
    
    newsListEl.innerHTML = news.map((item, index) => {
        const importanceColors = {
            high: 'bg-red-100 text-red-700',
            medium: 'bg-yellow-100 text-yellow-700',
            low: 'bg-green-100 text-green-700'
        };
        const importanceLabels = {
            high: 'مهم',
            medium: 'متوسط',
            low: 'عادي'
        };
        
        const publishedDate = new Date(item.published_at);
        const timeAgo = getTimeAgo(publishedDate);
        
        return `
            <div class="bg-gray-50 rounded-lg p-5 hover:bg-gray-100 transition-colors cursor-pointer" onclick="showNewsDetail('${category}', ${index})">
                <div class="flex items-start justify-between gap-4">
                    <div class="flex-1">
                        <div class="flex items-center gap-2 mb-2">
                            <span class="px-2 py-1 text-xs rounded-full ${importanceColors[item.importance] || importanceColors.low}">
                                ${importanceLabels[item.importance] || 'عادي'}
                            </span>
                            <span class="text-xs text-gray-500">${item.source}</span>
                            <span class="text-xs text-gray-400">⬢ ${timeAgo}</span>
                        </div>
                        <h4 class="font-semibold text-gray-900 mb-2 leading-relaxed">${item.title}</h4>
                        <p class="text-sm text-gray-600 leading-relaxed">${item.summary}</p>
                    </div>
                    <i class="fas fa-chevron-left text-gray-400 mt-1"></i>
                </div>
            </div>
        `;
    }).join('');
}

function showNewsDetail(category, index) {
    const item = newsData[category]?.[index];
    if (!item) return;
    
    // إ� شاء modal �عرض تفاص�`� ا�خبر
    const modalHtml = `
        <div id="newsDetailModal" class="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onclick="closeNewsDetailModal(event)">
            <div class="bg-white rounded-xl max-w-2xl w-full max-h-[80vh] overflow-hidden" onclick="event.stopPropagation()">
                <div class="p-6 border-b border-gray-200">
                    <div class="flex items-center justify-between">
                        <div class="flex items-center gap-2">
                            <span class="px-2 py-1 text-xs rounded-full bg-blue-100 text-blue-700">${item.source}</span>
                            <span class="text-xs text-gray-500">${getTimeAgo(new Date(item.published_at))}</span>
                        </div>
                        <button onclick="closeNewsDetailModal()" class="text-gray-400 hover:text-gray-600">
                            <i class="fas fa-times text-xl"></i>
                        </button>
                    </div>
                    <h3 class="text-xl font-bold text-gray-900 mt-4 leading-relaxed">${item.title}</h3>
                </div>
                <div class="p-6 overflow-y-auto">
                    <p class="text-gray-700 leading-relaxed">${item.summary}</p>
                    <div class="mt-6 pt-4 border-t border-gray-200">
                        <p class="text-xs text-gray-500">
                            <i class="fas fa-info-circle ml-1"></i>
                            هذه المعلومات لأغراض تعليمية فقط ولا تُعتبر نصيحة استثمارية.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    `;
    
    // إزا�ة modal ا��د�`�& إ�  ��جد
    const oldModal = document.getElementById('newsDetailModal');
    if (oldModal) oldModal.remove();
    
    // إضافة modal ا�جد�`د
    document.body.insertAdjacentHTML('beforeend', modalHtml);
}

function closeNewsDetailModal(event) {
    if (event && event.target !== event.currentTarget) return;
    const modal = document.getElementById('newsDetailModal');
    if (modal) modal.remove();
}

function getTimeAgo(date) {
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);
    
    if (diffMins < 1) return 'الآن';
    if (diffMins < 60) return `منذ ${diffMins} دقيقة`;
    if (diffHours < 24) return `منذ ${diffHours} ساعة`;
    if (diffDays < 7) return `منذ ${diffDays} يوم`;
    
    return date.toLocaleDateString('ar-EG');
}

async function loadSettingsPage() {
    const notLoggedInEl = document.getElementById('settingsNotLoggedIn');
    const formEl = document.getElementById('settingsForm');

    if (!userState.isAuthenticated) {
        notLoggedInEl?.classList.remove('hidden');
        formEl?.classList.add('hidden');
        return;
    }

    notLoggedInEl?.classList.add('hidden');
    formEl?.classList.remove('hidden');

    // تحد�`ث عرض �&فتاح API
    const apiKeyInput = document.getElementById('currentApiKey');
    if (apiKeyInput) {
        apiKeyInput.value = apiService.getApiKey() || '';
    }

    // تح�&�`� ا�إعدادات
    try {
        const settings = await loadUserSettings();
        if (settings) {
            document.getElementById('settingsEmail').value = userState.user?.email || '';
            document.getElementById('settingsUsername').value = userState.user?.username || '';
            document.getElementById('settingsRiskTolerance').value = userState.user?.default_risk_tolerance || 'medium';
        }
    } catch (error) {
        console.error('خطأ في تحميل الإعدادات:', error);
    }
}

// ==================== ��ظائف �&ساعدة ���&ستخد�& ====================

function getAssetTypeLabel(type) {
    const labels = {
        'stock': 'سهم',
        'cash': 'نقد',
        'gold': 'ذهب',
        'silver': 'فضة',
        'crypto': 'عملة رقمية',
        'bond': 'سند',
        'sukuk': 'صكوك',
        'fund': 'صندوق',
        'realestate': 'عقار'
    };
    return labels[type] || type;
}

function getAssetTypeClass(type) {
    const classes = {
        'stock': 'bg-blue-100 text-blue-700',
        'cash': 'bg-green-100 text-green-700',
        'gold': 'bg-yellow-100 text-yellow-700',
        'silver': 'bg-gray-200 text-gray-700',
        'crypto': 'bg-purple-100 text-purple-700',
        'bond': 'bg-indigo-100 text-indigo-700',
        'sukuk': 'bg-emerald-100 text-emerald-700',
        'fund': 'bg-pink-100 text-pink-700',
        'realestate': 'bg-orange-100 text-orange-700'
    };
    return classes[type] || 'bg-gray-100 text-gray-700';
}

function getCategoryLabel(category) {
    const labels = {
        'salary': 'راتب',
        'dividend': 'أرباح الأسهم',
        'trading_profit': 'أرباح التداول',
        'investment': 'استثمار',
        'bills': 'فواتير',
        'food': 'طعام',
        'transport': 'مواصلات',
        'entertainment': 'ترفيه',
        'other': 'أخرى'
    };
    return labels[category] || category;
}

function getAdviceIcon(type) {
    const icons = {
        'market_summary': 'fa-chart-line',
        'portfolio_review': 'fa-wallet',
        'price_alert': 'fa-bell',
        'dividend_reminder': 'fa-coins',
        'rebalancing': 'fa-balance-scale'
    };
    return icons[type] || 'fa-bell';
}

function getFrequencyLabel(frequency) {
    const labels = {
        'once': 'مرة واحدة',
        'daily': 'يومي',
        'weekly': 'أسبوعي',
        'monthly': 'شهري'
    };
    return labels[frequency] || frequency;
}

// ��ظائف إدارة ا�� �&اذج
window.toggleAddAssetForm = function() {
    const form = document.getElementById('addAssetForm');
    const chevron = document.getElementById('addAssetChevron');
    form?.classList.toggle('hidden');
    chevron?.classList.toggle('rotate-180');
};

window.toggleAddTransactionForm = function() {
    const form = document.getElementById('addTransactionForm');
    const chevron = document.getElementById('addTransactionChevron');
    form?.classList.toggle('hidden');
    chevron?.classList.toggle('rotate-180');
};

// إضافة أص� جد�`د
document.getElementById('newAssetForm')?.addEventListener('submit', async (e) => {
    e.preventDefault();

    const assetType = document.getElementById('assetType').value;
    const assetStockSelect = document.getElementById('assetStockSelect');
    const selectedStockOption = assetStockSelect?.selectedOptions?.[0];

    if (assetType === 'stock' && (!selectedStockOption || !selectedStockOption.value)) {
        showNotification('يرجى اختيار سهم من القائمة', 'warning');
        return;
    }
    
    const assetData = {
        asset_type: assetType,
        asset_name: assetType === 'stock'
            ? (selectedStockOption?.dataset?.stockName || document.getElementById('assetName').value)
            : document.getElementById('assetName').value,
        asset_ticker: assetType === 'stock'
            ? (selectedStockOption?.value || document.getElementById('assetTicker').value || null)
            : (document.getElementById('assetTicker').value || null),
        stock_id: document.getElementById('assetStockId')?.value ? parseInt(document.getElementById('assetStockId').value, 10) : null,
        quantity: parseFloat(document.getElementById('assetQuantity').value),
        purchase_price: parseFloat(document.getElementById('assetPurchasePrice').value),
        purchase_date: document.getElementById('assetPurchaseDate').value || null,
        notes: document.getElementById('assetNotes').value || null
    };

    const shouldLinkToCashflow = document.getElementById('linkAssetToCashflow')?.checked;
    const estimatedInvestmentCost = (assetData.quantity || 0) * (assetData.purchase_price || 0);
    const linkTransactionPayload = {
        transaction_type: 'expense',
        category: 'investment',
        amount: estimatedInvestmentCost,
        transaction_date: assetData.purchase_date || new Date().toISOString().split('T')[0],
        description: `ربط تلقائي: شراء أصل (${assetData.asset_name}${assetData.asset_ticker ? ' - ' + assetData.asset_ticker : ''})`
    };

    try {
        await createAsset(assetData);

        if (shouldLinkToCashflow && estimatedInvestmentCost > 0) {
            try {
                await createIncomeExpense(linkTransactionPayload);
            } catch (linkError) {
                console.error('تعذر تسجيل حركة الاستثمار تلقائياً:', linkError);
                showNotification('تمت إضافة الأصل لكن تعذر ربطه تلقائياً بالدخل/المصروفات', 'warning');
            }
        }

        document.getElementById('newAssetForm').reset();
        updateAssetNameModeByType();
        window.toggleAddAssetForm();
        loadPortfolioPage();
    } catch (error) {
        console.error('خطأ في إضافة الأصل:', error);
    }
});

// إضافة �&عا�&�ة جد�`دة
document.getElementById('newTransactionForm')?.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const transactionData = {
        transaction_type: document.getElementById('transactionType').value,
        category: document.getElementById('transactionCategory').value,
        amount: parseFloat(document.getElementById('transactionAmount').value),
        transaction_date: document.getElementById('transactionDate').value,
        description: document.getElementById('transactionDescription').value || null,
        is_recurring: document.getElementById('transactionRecurring').checked,
        recurrence_period: document.getElementById('transactionRecurring').checked ? 
            document.getElementById('recurrencePeriod').value : null
    };

    try {
        await createIncomeExpense(transactionData);
        document.getElementById('newTransactionForm').reset();
        window.toggleAddTransactionForm();
        loadIncomeExpensePage();
    } catch (error) {
        console.error('خطأ في إضافة المعاملة:', error);
    }
});

// ا�تْرار
document.getElementById('transactionRecurring')?.addEventListener('change', (e) => {
    const container = document.getElementById('recurrencePeriodContainer');
    if (e.target.checked) {
        container?.classList.remove('hidden');
    } else {
        container?.classList.add('hidden');
    }
});

// حذف ع� اصر ا��&را�بة
window.removeWatchlistItem = async function(itemId) {
    if (confirm('هل أنت متأكد من إزالة هذا السهم من قائمة المراقبة؟')) {
        try {
            await removeFromWatchlist(itemId);
            loadWatchlistPage();
        } catch (error) {
            console.error('خطأ في إزالة العنصر:', error);
        }
    }
};

// بيع الأصل - فتح النافذة
window.openSellAssetModal = function(assetId, encodedAsset) {
    try {
        const asset = JSON.parse(decodeURIComponent(encodedAsset));
        document.getElementById('sellAssetId').value = assetId;
        document.getElementById('sellAssetName').value = asset.asset_name;
        document.getElementById('sellAssetAvailableQty').value = asset.quantity;
        document.getElementById('sellAssetQuantity').value = '';
        document.getElementById('sellAssetPrice').value = asset.current_price ? asset.current_price.toFixed(2) : '';
        document.getElementById('sellAssetDate').value = new Date().toISOString().split('T')[0];
        document.getElementById('sellAssetTotal').textContent = '-';
        document.getElementById('sellAssetModal').classList.remove('hidden');
    } catch (error) {
        console.error('خطأ في فتح نافذة البيع:', error);
    }
};

// إغلاق نافذة البيع
window.closeSellAssetModal = function() {
    document.getElementById('sellAssetModal').classList.add('hidden');
};

// حساب إجمالي البيع والتحديث الحي
document.getElementById('sellAssetQuantity')?.addEventListener('input', function() {
    const qty = parseFloat(this.value) || 0;
    const price = parseFloat(document.getElementById('sellAssetPrice').value) || 0;
    const total = qty * price;
    document.getElementById('sellAssetTotal').textContent = total > 0 ? formatCurrency(total) : '-';
});

document.getElementById('sellAssetPrice')?.addEventListener('input', function() {
    const qty = parseFloat(document.getElementById('sellAssetQuantity').value) || 0;
    const price = parseFloat(this.value) || 0;
    const total = qty * price;
    document.getElementById('sellAssetTotal').textContent = total > 0 ? formatCurrency(total) : '-';
});

// تأكيد البيع وتسجيل الدخل
window.confirmSellAsset = async function() {
    const assetId = document.getElementById('sellAssetId').value;
    const quantity = parseFloat(document.getElementById('sellAssetQuantity').value);
    const price = parseFloat(document.getElementById('sellAssetPrice').value);
    const date = document.getElementById('sellAssetDate').value;
    const assetName = document.getElementById('sellAssetName').value;
    const availableQty = parseFloat(document.getElementById('sellAssetAvailableQty').value);

    if (!quantity || !price || !date) {
        showNotification('يرجى ملء جميع الحقول المطلوبة', 'warning');
        return;
    }

    if (quantity > availableQty) {
        showNotification(`الكمية المطلوبة تتجاوز المتاح (${availableQty})`, 'warning');
        return;
    }

    try {
        const totalSaleAmount = quantity * price;
        
        // تسجيل دخل استثماري
        const incomeTransaction = {
            transaction_type: 'income',
            category: 'trading_profit',
            amount: totalSaleAmount,
            transaction_date: date,
            description: `ربط تلقائي: بيع أصل (${assetName}) - ${quantity} وحدة بـ ${formatCurrency(price)} للوحدة`
        };

        await createIncomeExpense(incomeTransaction);

        // تحديث الأصل (تقليل الكمية)
        const updateData = {
            quantity: availableQty - quantity
        };
        await updateAsset(assetId, updateData);

        showNotification('تم تسجيل بيع الأصل بنجاح', 'success');
        closeSellAssetModal();
        loadPortfolioPage();
        loadIncomeExpensePage();
    } catch (error) {
        console.error('خطأ في تسجيل بيع الأصل:', error);
        showNotification(error.message || 'فشل تسجيل بيع الأصل', 'error');
    }
};

// حذف الأصول
window.deleteAssetConfirm = async function(assetId) {
    if (confirm('هل أنت متأكد من حذف هذا الأصل؟')) {
        try {
            await deleteAsset(assetId);
            loadPortfolioPage();
        } catch (error) {
            console.error('خطأ في حذف الأصل:', error);
        }
    }
};

// التقرير الشهري - إظهار/إخفاء
window.toggleMonthlyReport = function() {
    const form = document.getElementById('monthlyReportForm');
    const chevron = document.getElementById('monthlyReportChevron');
    form?.classList.toggle('hidden');
    chevron?.classList.toggle('rotate-180');
    
    if (!form?.classList.contains('hidden')) {
        const today = new Date();
        document.getElementById('reportMonth').value = today.getMonth() + 1;
        document.getElementById('reportYear').value = today.getFullYear();
        generateMonthlyReport();
    }
};

// التقرير الشهري - توليد البيانات
window.generateMonthlyReport = async function() {
    try {
        const month = parseInt(document.getElementById('reportMonth').value);
        const year = parseInt(document.getElementById('reportYear').value);
        
        if (!month || !year) return;

        // جلب جميع البيانات
        const [incomeExpenses, portfolio] = await Promise.all([
            loadIncomeExpenses().catch(() => []),
            loadAssets().catch(() => [])
        ]);

        // تصفية البيانات حسب الشهر والسنة
        const monthTransactions = (incomeExpenses || []).filter(t => {
            const txDate = new Date(t.transaction_date);
            return txDate.getMonth() + 1 === month && txDate.getFullYear() === year;
        });

        // حساب النقاط
        const monthlyIncome = monthTransactions
            .filter(t => t.transaction_type === 'income' && t.category !== 'trading_profit' && t.category !== 'dividend')
            .reduce((sum, t) => sum + (t.amount || 0), 0);

        const monthlyExpenses = monthTransactions
            .filter(t => t.transaction_type === 'expense' && t.category !== 'investment')
            .reduce((sum, t) => sum + (t.amount || 0), 0);

        const monthlyInvestment = monthTransactions
            .filter(t => t.transaction_type === 'expense' && t.category === 'investment')
            .reduce((sum, t) => sum + (t.amount || 0), 0);

        const monthlyTradingProfit = monthTransactions
            .filter(t => (t.category === 'trading_profit' || t.category === 'dividend') && t.transaction_type === 'income')
            .reduce((sum, t) => sum + (t.amount || 0), 0);

        // عرض النتائج
        document.getElementById('monthlyIncome').textContent = formatCurrency(monthlyIncome);
        document.getElementById('monthlyExpenses').textContent = formatCurrency(monthlyExpenses);
        document.getElementById('monthlyInvestment').textContent = formatCurrency(monthlyInvestment);
        
        const perfEl = document.getElementById('monthlyPortfolioPerf');
        perfEl.textContent = formatCurrency(monthlyTradingProfit);
        perfEl.className = `font-bold text-lg ${monthlyTradingProfit >= 0 ? 'text-green-700' : 'text-red-700'}`;

        // ملخص نصي
        const netCashFlow = monthlyIncome - monthlyExpenses - monthlyInvestment;
        const summary = `
            الدخل: ${formatCurrency(monthlyIncome)} | المصروفات: ${formatCurrency(monthlyExpenses)} | 
            الاستثمار: ${formatCurrency(monthlyInvestment)} | الأداء الاستثماري: ${formatCurrency(monthlyTradingProfit)} | 
            صافي التدفق النقدي: ${formatCurrency(netCashFlow)}
        `;
        document.getElementById('monthlySummaryText').textContent = summary.trim();

    } catch (error) {
        console.error('خطأ في توليد التقرير الشهري:', error);
        showNotification('فشل توليد التقرير الشهري', 'error');
    }
};

// حذف المعاملات
window.deleteTransactionConfirm = async function(transactionId) {
    if (confirm('هل أنت متأكد من حذف هذه المعاملة؟')) {
        try {
            await deleteIncomeExpense(transactionId);
            loadIncomeExpensePage();
        } catch (error) {
            console.error('خطأ في حذف المعاملة:', error);
        }
    }
};

// فتح نافذة تعديل المعاملة
window.openEditTransactionModal = function(transactionId, encodedTransaction) {
    const t = JSON.parse(decodeURIComponent(encodedTransaction));
    document.getElementById('editTransactionId').value = transactionId;
    document.getElementById('editTransactionType').value = t.transaction_type || 'expense';
    document.getElementById('editTransactionCategory').value = t.category || '';
    document.getElementById('editTransactionAmount').value = t.amount || '';
    document.getElementById('editTransactionDate').value = t.transaction_date ? t.transaction_date.substring(0, 10) : '';
    document.getElementById('editTransactionDescription').value = t.description || '';
    document.getElementById('editTransactionModal').classList.remove('hidden');
};

// إغلاق نافذة التعديل
window.closeEditTransactionModal = function() {
    document.getElementById('editTransactionModal').classList.add('hidden');
};

// حفظ تعديل المعاملة
window.saveEditTransaction = async function() {
    const transactionId = document.getElementById('editTransactionId').value;
    const data = {
        transaction_type: document.getElementById('editTransactionType').value,
        category: document.getElementById('editTransactionCategory').value,
        amount: parseFloat(document.getElementById('editTransactionAmount').value),
        transaction_date: document.getElementById('editTransactionDate').value,
        description: document.getElementById('editTransactionDescription').value
    };
    try {
        await updateIncomeExpense(transactionId, data);
        closeEditTransactionModal();
        loadIncomeExpensePage();
    } catch (error) {
        console.error('خطأ في تعديل المعاملة:', error);
    }
};

// حذف ا�ت� ب�`�!ات
window.deleteAlertConfirm = async function(alertId) {
    if (confirm('هل أنت متأكد من حذف هذا التنبيه؟')) {
        try {
            await deleteScheduledAdvice(alertId);
            loadAlertsPage();
        } catch (error) {
            console.error('خطأ في حذف التنبيه:', error);
        }
    }
};

// �&زا�&� ة أسعار ا�أص���
window.syncAssetPrices = async function() {
    try {
        showNotification('جاري تحديث الأسعار...', 'info');
        await apiService.syncAssetPrices();
        showNotification('تم تحديث الأسعار بنجاح', 'success');
        loadPortfolioPage();
    } catch (error) {
        showNotification('فشل تحديث الأسعار', 'danger');
    }
};

// � سخ �&فتاح API
window.copyApiKey = function() {
    const input = document.getElementById('currentApiKey');
    input.type = 'text';
    input.select();
    document.execCommand('copy');
    input.type = 'password';
    showNotification('تم نسخ مفتاح API', 'success');
};

// حفظ ا�إعدادات
document.getElementById('settingsForm')?.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const settingsData = {
        default_risk_tolerance: document.getElementById('settingsRiskTolerance').value
    };

    try {
        await updateUserSettings(settingsData);
    } catch (error) {
        console.error('خطأ في حفظ الإعدادات:', error);
    }
});

function getRiskAssessmentText(key) {
    const texts = {
        'overall_risk': 'المخاطر الإجمالية',
        'volatility': 'التقلب',
        'concentration_risk': 'مخاطر التركز',
        'sector_diversification': 'تنويع القطاعات',
        'liquidity_risk': 'مخاطر السيولة',
    };
    return texts[key] || key.replace(/_/g, ' ');
}

// ==================== صفحة الاشتراك ====================

async function loadSubscriptionPage() {
    const grid        = document.getElementById('plansGrid');
    const banner      = document.getElementById('currentPlanBanner');
    const planName    = document.getElementById('currentPlanName');
    const planExpiry  = document.getElementById('currentPlanExpiry');
    const resultAlert = document.getElementById('paymentResultAlert');

    // Show payment result if redirected back from Paymob
    const urlParams = new URLSearchParams(window.location.search);
    const paymentStatus = urlParams.get('payment');
    if (paymentStatus && resultAlert) {
        if (paymentStatus === 'success') {
            resultAlert.className = 'mb-6 p-4 rounded-xl text-sm font-medium bg-green-100 text-green-800 border border-green-200';
            resultAlert.innerHTML = '<i class="fas fa-check-circle ml-2"></i>تم الدفع بنجاح! تم تفعيل اشتراكك.';
        } else {
            resultAlert.className = 'mb-6 p-4 rounded-xl text-sm font-medium bg-red-100 text-red-800 border border-red-200';
            resultAlert.innerHTML = '<i class="fas fa-times-circle ml-2"></i>لم يتم إتمام الدفع. يرجى المحاولة مرة أخرى.';
        }
        resultAlert.classList.remove('hidden');
        // Clean URL
        window.history.replaceState({}, '', '/');
    }

    // Load current subscription if logged in
    let currentPlan = 'free';
    if (userState.isAuthenticated && apiService.hasApiKey()) {
        try {
            const sub = await apiService.request('/payment/subscription');
            currentPlan = sub.plan || 'free';
            if (planName) planName.textContent = {free:'مجاني', pro:'احترافي', premium:'بريميوم'}[currentPlan] || currentPlan;
            if (planExpiry && sub.expires_at) {
                const d = new Date(sub.expires_at);
                planExpiry.textContent = 'ينتهي في: ' + d.toLocaleDateString('ar-EG');
            } else if (planExpiry && currentPlan === 'free') {
                planExpiry.textContent = 'الخطة المجانية - لا تنتهي';
            }
            // Gradient by plan
            if (banner) {
                const gradients = {
                    free:    'from-gray-500 to-gray-600',
                    pro:     'from-blue-600 to-indigo-600',
                    premium: 'from-purple-600 to-pink-600'
                };
                banner.className = banner.className.replace(/from-\S+ to-\S+/, gradients[currentPlan] || gradients.free);
            }
        } catch(e) { /* ignore */ }
    }

    // Fetch plans from backend
    // Fallback plans used when backend is unreachable
    const FALLBACK_PLANS = [
        {
            id: 'free', name: 'مجاني', description: 'الوصول الأساسي لبيانات البورصة',
            price_monthly: 0, price_yearly: 0, original_yearly: 0, yearly_discount_pct: 0,
            features: ['عرض أسعار الأسهم الأساسية', 'مؤشرات السوق الرئيسية', 'قائمة مراقبة (حتى 5 أسهم)', 'فحص الامتثال الشرعي']
        },
        {
            id: 'pro', name: 'احترافي', description: 'للمستثمر الجاد',
            price_monthly: 99, price_yearly: 790, original_yearly: 1188, yearly_discount_pct: 33,
            features: ['كل ميزات الخطة المجانية', 'تحليل متعمق بالذكاء الاصطناعي', 'قائمة مراقبة غير محدودة', 'توصيات استثمارية ذكية', 'تنبيهات الأسعار الفورية', 'بيانات تاريخية كاملة', 'محافظ متعددة']
        },
        {
            id: 'premium', name: 'بريميوم', description: 'للمحترفين والمؤسسات',
            price_monthly: 199, price_yearly: 1490, original_yearly: 2388, yearly_discount_pct: 38,
            features: ['كل ميزات الخطة الاحترافية', 'تحليل AI بلا حدود', 'تقارير متقدمة قابلة للتصدير', 'API مباشر للبيانات', 'دعم ذو أولوية', 'وصول مبكر للميزات الجديدة']
        }
    ];

    let plans = [];
    try {
        const data = await apiService.request('/payment/plans');
        plans = data.plans || FALLBACK_PLANS;
    } catch(e) {
        plans = FALLBACK_PLANS;
    }

    // Billing cycle state
    let isYearly = false;
    const toggle      = document.getElementById('billingToggle');
    const toggleThumb = document.getElementById('billingToggleThumb');

    function renderPlans() {
        if (!grid) return;
        grid.innerHTML = plans.map(plan => {
            const price   = isYearly ? plan.price_yearly : plan.price_monthly;
            const period  = isYearly ? 'سنة' : 'شهر';
            const isCurrent = plan.id === currentPlan;
            const isFree    = plan.id === 'free';
            const planKey   = isYearly ? `${plan.id}-yearly` : `${plan.id}-monthly`;

            const featuresHtml = plan.features.map(f =>
                `<li class="flex items-center gap-2 text-sm text-gray-600">
                    <i class="fas fa-check text-green-500 text-xs"></i>${f}
                 </li>`
            ).join('');

            const highlight = plan.id === 'pro'
                ? 'ring-2 ring-blue-500 shadow-xl scale-105' : '';
            const badgeHtml = plan.id === 'pro'
                ? '<span class="absolute -top-3 right-1/2 translate-x-1/2 bg-blue-500 text-white text-xs px-3 py-1 rounded-full font-bold">الأكثر شيوعًا</span>'
                : '';

            // Discount badge for yearly view
            const discountBadge = isYearly && plan.yearly_discount_pct > 0
                ? `<span class="inline-block bg-green-100 text-green-700 text-xs font-bold px-2 py-0.5 rounded-full mb-2">وفر ${plan.yearly_discount_pct}%</span>`
                : '';

            // Price block — show strikethrough original price when yearly
            let priceBlock;
            if (price === 0) {
                priceBlock = '<span class="text-3xl font-bold text-gray-900">مجاني</span>';
            } else if (isYearly && plan.original_yearly && plan.original_yearly !== price) {
                priceBlock = `
                    <div class="flex items-baseline gap-2 flex-wrap">
                        <span class="text-3xl font-bold text-gray-900">${price} ج.م</span>
                        <span class="text-sm text-gray-400 line-through">${plan.original_yearly} ج.م</span>
                    </div>
                    <span class="text-sm text-gray-500">/ سنة</span>
                    <p class="text-xs text-green-600 font-medium mt-1">يعادل ${Math.round(price/12)} ج.م / شهر</p>`;
            } else {
                priceBlock = `<span class="text-3xl font-bold text-gray-900">${price} ج.م</span>
                              <span class="text-sm text-gray-500"> / ${period}</span>`;
            }

            const btnLabel = isCurrent ? 'خطتك الحالية'
                : isFree ? 'البدء مجانًا'
                : 'اشترك الآن';
            const btnClass = isCurrent
                ? 'w-full py-2.5 rounded-lg text-sm font-medium bg-gray-100 text-gray-500 cursor-default'
                : plan.id === 'pro'
                    ? 'w-full py-2.5 rounded-lg text-sm font-bold bg-blue-600 hover:bg-blue-700 text-white cursor-pointer transition-colors shadow-md'
                    : 'w-full py-2.5 rounded-lg text-sm font-medium bg-gray-800 hover:bg-gray-900 text-white cursor-pointer transition-colors';

            return `
            <div class="relative bg-white rounded-xl shadow-sm border border-gray-200 p-6 flex flex-col ${highlight}">
                ${badgeHtml}
                <h4 class="text-lg font-bold text-gray-900 mb-1">${plan.name}</h4>
                <p class="text-sm text-gray-500 mb-3">${plan.description}</p>
                ${discountBadge}
                <div class="mb-5">${priceBlock}</div>
                <ul class="space-y-2 mb-6 flex-1">${featuresHtml}</ul>
                <button class="${btnClass}" ${isCurrent ? 'disabled' : ''}
                    data-plan="${planKey}" onclick="startPayment('${planKey}')">
                    ${btnLabel}
                </button>
            </div>`;
        }).join('');
    }

    if (toggle) {
        toggle.addEventListener('click', () => {
            isYearly = !isYearly;
            toggle.style.backgroundColor = isYearly ? '#2563eb' : '';
            if (toggleThumb) {
                toggleThumb.style.right  = isYearly ? 'auto' : '4px';
                toggleThumb.style.left   = isYearly ? '4px'  : 'auto';
            }
            renderPlans();
        });
    }

    renderPlans();

    // Cancel payment
    const cancelBtn = document.getElementById('cancelPayment');
    if (cancelBtn) {
        cancelBtn.onclick = () => {
            document.getElementById('paymobContainer')?.classList.add('hidden');
            document.getElementById('paymobIframe').src = '';
        };
    }
}

// Called from inline onclick in subscription plan cards
window.startPayment = async function(plan) {
    if (!userState.isAuthenticated || !apiService.hasApiKey()) {
        alert('يرجى تسجيل الدخول أولاً للاشتراك.');
        window.navigateToPage && window.navigateToPage('settings');
        return;
    }
    if (plan.startsWith('free')) return;

    const container = document.getElementById('paymobContainer');
    const iframe    = document.getElementById('paymobIframe');
    if (!container || !iframe) return;

    try {
        const result = await apiService.request('/payment/initiate', {
            method: 'POST',
            body: JSON.stringify({ plan })
        });
        iframe.src = result.iframe_url;
        container.classList.remove('hidden');
        container.scrollIntoView({ behavior: 'smooth' });
    } catch(e) {
        alert('حدث خطأ أثناء تجهيز الدفع: ' + (e.message || 'يرجى المحاولة لاحقاً'));
    }
};

