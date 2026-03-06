/**
 * �&� صة استث�&ار EGX - ا�تطب�`� ا�رئ�`س�`
 * ��اج�!ة أ�&ا�&�`ة �&ع�`ار�`ة باستخدا�& Tailwind CSS
 */

import apiService from '/static/js/api.js';
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
} from '/static/js/modules/utils.js';
import {
    createCandlestickChart,
    createCombinedChart,
    createAreaChart,
    destroyChart
} from '/static/js/modules/charts.js';
import { normalizeHistoryPayload, normalizeRecommendationPayload } from '/static/js/modules/deep-analysis.js';
import { initializeLearningCenter } from '/static/js/modules/learning.js';
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
    deleteIncomeExpense,
    createScheduledAdvice,
    deleteScheduledAdvice,
    updateUserSettings,
    showNotification
} from '/static/js/modules/user.js';

// Global chart instance for cleanup
let currentChart = null;
let globalLoadingCount = 0;
let globalLoadingTimer = null;

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
});

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
        dashboard: '???? ??????',
        market: '???? ???? ??? ?????',
        stocks: '???? ??????',
        search: '????? ?? ??????',
        halal: '?????? ??????',
        recommendations: '?????? ???????',
        learning: '???? ??????',
        news: '????? ?????????',
        watchlist: '????? ????????',
        portfolio: '??????',
        'income-expense': '????? ??????????',
        alerts: '????????? ????????',
        settings: '?????????',
    };
    elements.pageTitle.textContent = titles[page] || '???? ??????';

    state.currentPage = page;

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
        case 'halal':
            loadHalalStocks();
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
            showNotification('�`رج�0 إدخا� �&فتاح API صا�ح', 'danger');
            return;
        }
        apiService.setApiKey(key);
        showNotification('ت�& حفظ �&فتاح API', 'success');
    });

    // ف�اتر صفحة ا�أس�!�&
    document.getElementById('indexFilter')?.addEventListener('change', () => loadStocks(1));
    document.getElementById('sectorFilter')?.addEventListener('change', () => loadStocks(1));
    document.getElementById('halalOnlyFilter')?.addEventListener('change', () => loadStocks(1));
    document.getElementById('prevPage')?.addEventListener('click', () => loadStocks(state.page - 1));
    document.getElementById('nextPage')?.addEventListener('click', () => loadStocks(state.page + 1));

    // ا�بحث
    document.getElementById('searchBtn')?.addEventListener('click', performSearch);
    document.getElementById('searchQuery')?.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') performSearch();
    });

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
            <div style="font-size:14px;font-weight:600;color:#1f2937;">جار�` تح�&�`� ا�ب�`ا� ات...</div>
            <div style="font-size:12px;color:#6b7280;">ا�رجاء ا�ا� تظار</div>
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
        : '<i class="fas fa-moon"></i><span>داْ� </span>';
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
async function loadDashboard() {
    const loading = document.getElementById('dashboardLoading');
    const content = document.getElementById('dashboardContent');
    
    try {
        // Show loading indicator
        loading?.classList.remove('hidden');
        content?.classList.add('hidden');
        
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

        document.getElementById('totalStocks').textContent = totalStocks;
        document.getElementById('gainingStocks').textContent = gainingCount;
        document.getElementById('losingStocks').textContent = losingCount;
        document.getElementById('egx30Value').textContent = egx30Index?.value ? formatNumber(egx30Index.value, 2) : '-';

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
                    <td class="px-4 py-3">${createBadge(getComplianceText(stock.compliance_status), stock.compliance_status?.toLowerCase())}</td>
                </tr>
            `).join('') || '<tr><td colspan="5" class="px-4 py-8 text-center text-gray-500">�ا ت��جد ب�`ا� ات �&تاحة</td></tr>';
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
                    <td class="px-4 py-3">${createBadge(getComplianceText(stock.compliance_status), stock.compliance_status?.toLowerCase())}</td>
                </tr>
            `).join('') || '<tr><td colspan="5" class="px-4 py-8 text-center text-gray-500">�ا ت��جد ب�`ا� ات �&تاحة</td></tr>';
        }

        // استخراج ا��طاعات ��ف�اتر
        state.sectors = [...new Set(stocksList.map(s => s.sector).filter(Boolean))];
        updateSectorFilters();
        
        // Show content, hide loading
        loading?.classList.add('hidden');
        content?.classList.remove('hidden');

    } catch (error) {
        console.error('خطأ ف�` تح�&�`� ���حة ا�تحْ�&:', error);
        showNotification('فش� تح�&�`� ب�`ا� ات ���حة ا�تحْ�&', 'danger');
        loading?.classList.add('hidden');
        content?.classList.remove('hidden');
    }
}

// ==================== � ظرة عا�&ة ع��0 ا�س��� ====================
async function loadMarketOverview() {
    console.log('loadMarketOverview called');
    
    const loading = document.getElementById('marketLoading');
    const content = document.getElementById('marketContent');
    
    try {
        // Show loading indicator
        loading?.classList.remove('hidden');
        content?.classList.add('hidden');
        
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
                    <td class="px-4 py-3">${createBadge(getComplianceText(stock.compliance_status), stock.compliance_status?.toLowerCase())}</td>
                </tr>
            `).join('') || '<tr><td colspan="5" class="px-4 py-8 text-center text-gray-500">�ا ت��جد ب�`ا� ات �&تاحة</td></tr>';
        }
        
        // Show content, hide loading
        loading?.classList.add('hidden');
        content?.classList.remove('hidden');

    } catch (error) {
        console.error('خطأ ف�` تح�&�`� � ظرة ا�س���:', error);
        showNotification('فش� تح�&�`� ب�`ا� ات ا�س���', 'danger');
        loading?.classList.add('hidden');
        content?.classList.remove('hidden');
    }
}

// ==================== ا�أس�!�& ====================
async function loadStocks(page = 1) {
    const pageLoading = document.getElementById('stocksPageLoading');
    const pageContent = document.getElementById('stocksPageContent');
    const loading = document.getElementById('stocksLoading');
    const tableBody = document.querySelector('#stocksTable tbody');

    try {
        // Show page loading indicator on first load
        if (page === 1 && state.stocks.length === 0) {
            pageLoading?.classList.remove('hidden');
            pageContent?.classList.add('hidden');
        } else {
            loading?.classList.remove('hidden');
        }

        const halalOnly = document.getElementById('halalOnlyFilter')?.checked;
        const sector = document.getElementById('sectorFilter')?.value;
        const indexFilter = document.getElementById('indexFilter')?.value;

        const response = await apiService.getStocks({
            page,
            page_size: state.pageSize,
            halal_only: halalOnly,
            sector: sector || undefined,
            index: indexFilter || undefined,
        });

        state.stocks = response.stocks || response.data || [];
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
                <td class="px-4 py-3">${createBadge(getComplianceText(stock.compliance_status), stock.compliance_status?.toLowerCase())}</td>
                <td class="px-4 py-3">
                    <button class="text-blue-600 hover:text-blue-800 text-sm font-medium">
                        عرض ا�تفاص�`�
                    </button>
                </td>
            </tr>
        `).join('');

        // تحد�`ث �&ع����&ات ا�صفحات
        document.getElementById('stocksInfo').textContent =
            `عرض ${state.stocks.length} �&�  ${state.totalStocks} س�!�&`;

        document.getElementById('prevPage').disabled = page <= 1;
        document.getElementById('nextPage').disabled = state.stocks.length < state.pageSize;
        
        // Show content, hide loading
        pageLoading?.classList.add('hidden');
        pageContent?.classList.remove('hidden');
        loading?.classList.add('hidden');

    } catch (error) {
        console.error('خطأ ف�` تح�&�`� ا�أس�!�&:', error);
        tableBody.innerHTML = `<tr><td colspan="7" class="px-4 py-8 text-center text-red-500">فش� تح�&�`� ا�أس�!�&: ${error.message}</td></tr>`;
        pageLoading?.classList.add('hidden');
        pageContent?.classList.remove('hidden');
        loading?.classList.add('hidden');
    }
}

// ==================== ا�بحث ====================
async function performSearch() {
    const query = document.getElementById('searchQuery')?.value.trim();
    if (!query) {
        showNotification('ا�رجاء إدخا� ْ��&ة ا�بحث', 'warning');
        return;
    }

    const loading = document.getElementById('searchLoading');
    const resultsContainer = document.getElementById('searchResults');

    try {
        loading?.classList.remove('hidden');

        const halalOnly = document.getElementById('searchHalalOnly')?.checked;
        const sector = document.getElementById('searchSectorFilter')?.value;
        const minPrice = document.getElementById('minPrice')?.value;
        const maxPrice = document.getElementById('maxPrice')?.value;

        const response = await apiService.searchStocks(query, {
            halal_only: halalOnly,
            sector: sector || undefined,
            min_price: minPrice || undefined,
            max_price: maxPrice || undefined,
        });

        if (response.results && response.results.length > 0) {
            resultsContainer.innerHTML = `
                <div class="mb-4 text-sm text-gray-500">
                    ت�& ا�عث��ر ع��0 ${response.total} � ت�`جة �٬ "${query}"
                </div>
                <div class="overflow-x-auto">
                    <table class="w-full">
                        <thead>
                            <tr class="bg-gray-50 text-right">
                                <th class="px-4 py-3 text-xs font-semibold text-gray-500 uppercase">ا�ر�&ز</th>
                                <th class="px-4 py-3 text-xs font-semibold text-gray-500 uppercase">ا�اس�&</th>
                                <th class="px-4 py-3 text-xs font-semibold text-gray-500 uppercase">ا�سعر</th>
                                <th class="px-4 py-3 text-xs font-semibold text-gray-500 uppercase">ا��طاع</th>
                                <th class="px-4 py-3 text-xs font-semibold text-gray-500 uppercase">ا�ا�&تثا�</th>
                                <th class="px-4 py-3 text-xs font-semibold text-gray-500 uppercase">إجراءات</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${response.results.map(stock => `
                                <tr class="hover:bg-gray-50 border-b border-gray-100 cursor-pointer" onclick="showStockDetail('${stock.ticker}')">
                                    <td class="px-4 py-3 font-medium text-blue-600">${stock.ticker}</td>
                                    <td class="px-4 py-3 text-gray-900">${stock.name || '-'}</td>
                                    <td class="px-4 py-3 font-medium">${stock.current_price ? formatCurrency(stock.current_price) : '-'}</td>
                                    <td class="px-4 py-3 text-gray-500">${stock.sector || '-'}</td>
                                    <td class="px-4 py-3">${createBadge(getComplianceText(stock.compliance_status), stock.compliance_status?.toLowerCase())}</td>
                                    <td class="px-4 py-3">
                                        <button class="text-blue-600 hover:text-blue-800 text-sm font-medium">عرض</button>
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
                title: '�ا ت��جد � تائج',
                message: `��& �`ت�& ا�عث��ر ع��0 أس�!�& تطاب� "${query}"`
            });
        }

    } catch (error) {
        console.error('خطأ ف�` ا�بحث:', error);
        resultsContainer.innerHTML = createAlert({
            type: 'danger',
            message: `فش� ا�بحث: ${error.message}`
        });
    } finally {
        loading?.classList.add('hidden');
    }
}

// ==================== ا�أس�!�& ا�ح�ا� ====================
async function loadHalalStocks() {
    const pageLoading = document.getElementById('halalPageLoading');
    const pageContent = document.getElementById('halalPageContent');
    const loading = document.getElementById('halalLoading');
    const tableBody = document.querySelector('#halalTable tbody');

    try {
        // Show page loading indicator
        pageLoading?.classList.remove('hidden');
        pageContent?.classList.add('hidden');

        const response = await apiService.getHalalStocks();

        if (response.stocks && response.stocks.length > 0) {
            tableBody.innerHTML = response.stocks.map(stock => `
                <tr class="hover:bg-gray-50 cursor-pointer" onclick="showStockDetail('${stock.ticker}')">
                    <td class="px-4 py-3 font-medium text-blue-600">${stock.ticker}</td>
                    <td class="px-4 py-3 text-gray-900">${stock.name || '-'}</td>
                    <td class="px-4 py-3 font-medium">${stock.current_price ? formatCurrency(stock.current_price) : '-'}</td>
                    <td class="px-4 py-3 text-gray-500">${stock.sector || '-'}</td>
                    <td class="px-4 py-3 text-sm text-gray-600">${stock.compliance_note || '�&ت��اف� �&ع ا�شر�`عة'}</td>
                </tr>
            `).join('');
        } else {
            tableBody.innerHTML = '<tr><td colspan="5" class="px-4 py-8 text-center text-gray-500">�ا ت��جد أس�!�& ح�ا�</td></tr>';
        }
        
        // Show content, hide loading
        pageLoading?.classList.add('hidden');
        pageContent?.classList.remove('hidden');

    } catch (error) {
        console.error('خطأ ف�` تح�&�`� ا�أس�!�& ا�ح�ا�:', error);
        tableBody.innerHTML = `<tr><td colspan="5" class="px-4 py-8 text-center text-red-500">فش� ا�تح�&�`�: ${error.message}</td></tr>`;
        pageLoading?.classList.add('hidden');
        pageContent?.classList.remove('hidden');
    }
}

// ==================== ا�ت��ص�`ات ====================
async function getRecommendations() {
    const capital = parseFloat(document.getElementById('capitalInput')?.value) || 100000;
    const risk = document.getElementById('riskSelect')?.value || 'medium';
    const maxStocks = parseInt(document.getElementById('maxStocksInput')?.value) || 10;
    const sectors = document.getElementById('sectorsInput')?.value;
    const halalOnly = document.getElementById('recommendHalalOnly')?.checked;

    const resultContainer = document.getElementById('recommendationsResult');
    resultContainer.innerHTML = `
        <div class="flex flex-col items-center justify-center py-20">
            <div class="w-16 h-16 border-4 border-gray-200 border-t-blue-600 rounded-full animate-spin mb-4"></div>
            <p class="text-gray-500 text-sm">جار�` حساب ا�ت��ص�`ات...</p>
        </div>
    `;

    try {
        const response = await apiService.getRecommendations({
            capital,
            risk,
            max_stocks: maxStocks,
            sectors: sectors || undefined,
            halal_only: halalOnly,
        });

        if (response.recommendations && response.recommendations.length > 0) {
            const riskText = {
                'low': '�&� خفض',
                'medium': '�&ت��سط',
                'high': 'عا��`'
            };

            resultContainer.innerHTML = `
                <div class="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
                    <div class="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
                        <h4 class="text-sm font-medium text-gray-500 mb-2">إج�&ا��` رأس ا��&ا�</h4>
                        <div class="text-2xl font-semibold text-gray-900">${formatCurrency(capital)}</div>
                    </div>
                    <div class="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
                        <h4 class="text-sm font-medium text-gray-500 mb-2">�&ست���0 ا��&خاطرة</h4>
                        <div class="text-2xl font-semibold text-gray-900">${riskText[risk] || risk}</div>
                    </div>
                    <div class="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
                        <h4 class="text-sm font-medium text-gray-500 mb-2">ا�عائد ا�س� ���` ا��&ت���ع</h4>
                        <div class="text-2xl font-semibold text-green-600">${response.expected_annual_return || 15}%</div>
                    </div>
                </div>
                
                <div class="bg-white rounded-xl shadow-sm border border-gray-200">
                    <div class="p-4 border-b border-gray-200">
                        <h3 class="font-semibold text-gray-900">ا��&حفظة ا��&�ترحة</h3>
                        <p class="text-sm text-gray-500">${response.recommendations.length} أس�!�& �&ختارة</p>
                    </div>
                    <div class="p-4 space-y-3">
                        ${response.recommendations.map(rec => createRecommendationCard(rec, capital)).join('')}
                    </div>
                </div>
                
                ${response.risk_assessment ? `
                    <div class="mt-6 bg-white rounded-xl p-6 shadow-sm border border-gray-200">
                        <h3 class="font-semibold text-gray-900 mb-4">ت��`�`�& ا��&خاطر</h3>
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
                title: '�ا ت��جد ت��ص�`ات',
                message: '��& �`ت�& ا�عث��ر ع��0 أس�!�& �&� اسبة تطاب� �&عا�`�`رْ. حا��� تعد�`� ا�ف�اتر.'
            });
        }

    } catch (error) {
        console.error('خطأ ف�` ا�حص��� ع��0 ا�ت��ص�`ات:', error);
        resultContainer.innerHTML = createAlert({
            type: 'danger',
            message: `فش� ا�حص��� ع��0 ا�ت��ص�`ات: ${error.message}`
        });
    }
}

// ==================== تفاص�`� ا�س�!�& ====================
async function showStockDetail(ticker) {
    elements.modalStockName.textContent = `جار�` تح�&�`� ${ticker}...`;
    elements.modalBody.innerHTML = createLoadingSpinner();
    elements.stockModal?.classList.add('active');

    // Destroy previous chart if exists
    if (currentChart) {
        destroyChart(currentChart);
        currentChart = null;
    }

    try {
        // Fetch stock details, history, and recommendation in parallel
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

        // Build history chart HTML with ApexCharts container
        let historyChartHtml = '';
        if (normalizedHistory.success && normalizedHistory.data.length > 0) {
            const history = normalizedHistory.data;
            const summary = normalizedHistory.summary || {};

            historyChartHtml = `
                <div class="mt-6 bg-white rounded-lg p-4 border border-gray-200">
                    <div class="flex items-center justify-between mb-4">
                        <h4 class="font-semibold text-gray-900">
                            <i class="fas fa-chart-candlestick ml-2 text-blue-500"></i>
                            ا�رس�& ا�ب�`ا� �` ��أسعار
                        </h4>
                        <div class="flex gap-2">
                            <button onclick="switchChartType('candlestick')" id="btn-candlestick" 
                                class="px-3 py-1 text-xs rounded-lg bg-blue-600 text-white">
                                ش�&��ع
                            </button>
                            <button onclick="switchChartType('line')" id="btn-line"
                                class="px-3 py-1 text-xs rounded-lg bg-gray-200 text-gray-700 hover:bg-gray-300">
                                خط�`
                            </button>
                        </div>
                    </div>
                    <div class="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
                        <div class="text-center bg-gray-50 rounded-lg p-2">
                            <div class="text-xs text-gray-500">أع��0 سعر</div>
                            <div class="font-semibold text-green-600">${summary.high_price?.toFixed(2) || '-'}</div>
                        </div>
                        <div class="text-center bg-gray-50 rounded-lg p-2">
                            <div class="text-xs text-gray-500">أد� �0 سعر</div>
                            <div class="font-semibold text-red-600">${summary.low_price?.toFixed(2) || '-'}</div>
                        </div>
                        <div class="text-center bg-gray-50 rounded-lg p-2">
                            <div class="text-xs text-gray-500">�&ت��سط ا�سعر</div>
                            <div class="font-semibold text-gray-700">${summary.avg_price?.toFixed(2) || '-'}</div>
                        </div>
                        <div class="text-center bg-gray-50 rounded-lg p-2">
                            <div class="text-xs text-gray-500">ا�تغ�`ر ا�ْ��`</div>
                            <div class="font-semibold ${summary.price_change_percent >= 0 ? 'text-green-600' : 'text-red-600'}">
                                ${summary.price_change_percent ? summary.price_change_percent.toFixed(2) + '%' : '-'}
                            </div>
                        </div>
                    </div>
                    <div id="stockChart" class="w-full"></div>
                </div>
            `;
        }

        // Build recommendation HTML with enriched data
        let recommendationHtml = '';
        if (normalizedRecommendation && normalizedRecommendation.success) {
            const rec = normalizedRecommendation.recommendation || {};
            const scores = normalizedRecommendation.scores || rec.score_breakdown || {};
            const trend = normalizedRecommendation.trend || {};
            const dataQuality = normalizedRecommendation.data_quality || {};
            
            const action = (rec.action || 'hold').toLowerCase();
            const actionAr = rec.action_ar || action;
            
            // Action styling
            const recClass = (action === 'buy' || action === 'strong_buy') ? 'bg-green-100 text-green-800 border-green-300' :
                (action === 'sell' || action === 'strong_sell') ? 'bg-red-100 text-red-800 border-red-300' :
                    'bg-yellow-100 text-yellow-800 border-yellow-300';
            const recIcon = (action === 'buy' || action === 'strong_buy') ? 'fa-arrow-up' :
                (action === 'sell' || action === 'strong_sell') ? 'fa-arrow-down' :
                    'fa-minus';
            const recBgClass = (action === 'buy' || action === 'strong_buy') ? 'from-green-50 to-emerald-50 border-green-200' :
                (action === 'sell' || action === 'strong_sell') ? 'from-red-50 to-rose-50 border-red-200' :
                    'from-blue-50 to-indigo-50 border-blue-200';

            const confidenceValue = typeof rec.confidence === 'number'
                ? rec.confidence
                : (typeof rec.confidence_score === 'number' ? rec.confidence_score : 0);
            const confidenceLabelMap = {
                high: 'عا��`ة',
                medium: '�&ت��سطة',
                low: '�&� خفضة',
                very_low: '�&� خفضة جدا�9'
            };
            const confidenceLabel = rec.confidence_label_ar || confidenceLabelMap[rec.confidence_label] || '';

            // Target price handling
            const targetPrice = (typeof recommendationResponse.target_price === 'number')
                ? recommendationResponse.target_price
                : (typeof rec.target_price === 'number' ? rec.target_price : null);
            const upsidePercent = recommendationResponse.upside_percent || rec.upside_potential;
            const downsidePercent = recommendationResponse.downside_percent;
            const priceRange = recommendationResponse.price_range;

            // Key strengths and risks - handle both object and string formats
            const strengths = Array.isArray(recommendationResponse.key_strengths)
                ? recommendationResponse.key_strengths.slice(0, 4).map(s => typeof s === 'object' ? s : { title: s, title_ar: s })
                : (Array.isArray(rec.key_strengths) ? rec.key_strengths.slice(0, 4).map(s => typeof s === 'object' ? s : { title: s, title_ar: s }) : []);
            const risks = Array.isArray(recommendationResponse.key_risks)
                ? recommendationResponse.key_risks.slice(0, 4).map(r => typeof r === 'object' ? r : { title: r, title_ar: r })
                : (Array.isArray(rec.key_risks) ? rec.key_risks.slice(0, 4).map(r => typeof r === 'object' ? r : { title: r, title_ar: r }) : []);

            // Risk level with Arabic
            const riskLevel = recommendationResponse.risk_level || rec.risk_level || 'medium';
            const riskLevelAr = recommendationResponse.risk_level_ar || { low: '�&� خفض', medium: '�&ت��سط', high: '�&رتفع' }[riskLevel] || riskLevel;
            const riskScore = recommendationResponse.risk_score || scores.risk_score || 50;
            const riskClass = riskLevel === 'low' ? 'text-green-600' : riskLevel === 'high' ? 'text-red-600' : 'text-yellow-600';

            // Trend signal with Arabic
            const trendSignal = trend.signal || scores.trend_signal || 'neutral';
            const trendStrength = trend.strength || 50;
            const trendAr = { bullish: 'صاعد', bearish: '�!ابط', neutral: '�&حا�`د' }[trendSignal] || trendSignal;
            const trendClass = trendSignal === 'bullish' ? 'text-green-600' : trendSignal === 'bearish' ? 'text-red-600' : 'text-gray-600';

            // Score breakdown display
            const compositeScore = scores.composite || scores.composite_score || 50;
            const fundamentalScore = scores.fundamental || scores.fundamental_score || 50;
            const technicalScore = scores.technical || scores.technical_score || 50;
            const momentumScore = scores.momentum || 50;
            const qualityScore = scores.quality || 50;

            recommendationHtml = `
                <div class="mt-6 bg-gradient-to-r ${recBgClass} rounded-lg p-4 border">
                    <h4 class="font-semibold text-gray-900 mb-3 flex items-center justify-between">
                        <span>
                            <i class="fas fa-brain ml-2 text-indigo-500"></i>
                            ا�ت��ص�`ة ا�ذْ�`ة
                        </span>
                        ${recommendationResponse.processing_time_ms ? `
                            <span class="text-xs text-gray-400 font-normal">
                                <i class="fas fa-clock ml-1"></i>
                                ${recommendationResponse.processing_time_ms}ms
                            </span>
                        ` : ''}
                    </h4>
                    
                    <!-- Main Action Badge -->
                    <div class="flex items-center gap-4 mb-4">
                        <div class="px-4 py-2 rounded-lg border ${recClass} font-bold text-lg">
                            <i class="fas ${recIcon} ml-2"></i>
                            ${actionAr.toUpperCase()}
                        </div>
                        <div class="text-gray-600">
                            <span class="text-sm">�&ست���0 ا�ث�ة:</span>
                            <span class="font-semibold mr-1">${confidenceValue.toFixed(1)}%</span>
                            ${confidenceLabel ? `<span class="text-xs text-gray-500">(${confidenceLabel})</span>` : ''}
                        </div>
                    </div>
                    
                    <!-- Reason -->
                    ${(rec.reason_ar || rec.reason) ? `
                        <div class="bg-white rounded p-3 mb-3">
                            <div class="text-sm text-gray-600 mb-1">ا�سبب:</div>
                            <div class="text-gray-800">${rec.reason_ar || rec.reason}</div>
                        </div>
                    ` : ''}
                    
                    <!-- Price Targets -->
                    ${targetPrice ? `
                        <div class="grid grid-cols-3 gap-3 text-sm mb-3">
                            <div class="bg-white rounded p-2">
                                <span class="text-gray-500 block text-xs">ا�سعر ا��&ست�!دف</span>
                                <span class="font-semibold text-lg">${targetPrice.toFixed(2)}</span>
                            </div>
                            <div class="bg-white rounded p-2">
                                <span class="text-gray-500 block text-xs">� سبة ا�صع��د</span>
                                <span class="font-semibold ${upsidePercent >= 0 ? 'text-green-600' : 'text-red-600'}">
                                    ${upsidePercent >= 0 ? '+' : ''}${upsidePercent?.toFixed(1)}%
                                </span>
                            </div>
                            <div class="bg-white rounded p-2">
                                <span class="text-gray-500 block text-xs">� سبة ا��!ب��ط</span>
                                <span class="font-semibold text-red-600">
                                    ${downsidePercent?.toFixed(1)}%
                                </span>
                            </div>
                        </div>
                        ${priceRange ? `
                            <div class="text-xs text-gray-500 mb-3">
                                <i class="fas fa-info-circle ml-1"></i>
                                ا�� طا� ا�سعر�`: ${priceRange.low?.toFixed(2)} - ${priceRange.high?.toFixed(2)}
                            </div>
                        ` : ''}
                    ` : ''}
                    
                    <!-- Risk & Trend -->
                    <div class="grid grid-cols-2 gap-3 text-sm mb-3">
                        <div class="bg-white rounded p-2">
                            <span class="text-gray-500 block text-xs">�&ست���0 ا��&خاطر</span>
                            <span class="font-semibold ${riskClass}">${riskLevelAr}</span>
                            <span class="text-xs text-gray-400 mr-1">(${riskScore.toFixed(0)})</span>
                        </div>
                        <div class="bg-white rounded p-2">
                            <span class="text-gray-500 block text-xs">إشارة ا�اتجا�!</span>
                            <span class="font-semibold ${trendClass}">${trendAr}</span>
                            <span class="text-xs text-gray-400 mr-1">(${trendStrength.toFixed(0)}%)</span>
                        </div>
                    </div>
                    
                    <!-- Score Breakdown -->
                    <div class="bg-white rounded p-3 mb-3">
                        <div class="text-sm text-gray-600 mb-2">تفاص�`� ا�� تائج:</div>
                        <div class="grid grid-cols-5 gap-2 text-center text-xs">
                            <div>
                                <div class="font-bold text-lg ${compositeScore >= 60 ? 'text-green-600' : compositeScore <= 40 ? 'text-red-600' : 'text-gray-600'}">${compositeScore.toFixed(0)}</div>
                                <div class="text-gray-500">ا�إج�&ا��`</div>
                            </div>
                            <div>
                                <div class="font-bold ${fundamentalScore >= 60 ? 'text-green-600' : fundamentalScore <= 40 ? 'text-red-600' : 'text-gray-600'}">${fundamentalScore.toFixed(0)}</div>
                                <div class="text-gray-500">ا�أساس�`ات</div>
                            </div>
                            <div>
                                <div class="font-bold ${technicalScore >= 60 ? 'text-green-600' : technicalScore <= 40 ? 'text-red-600' : 'text-gray-600'}">${technicalScore.toFixed(0)}</div>
                                <div class="text-gray-500">ا�ت�� �`ة</div>
                            </div>
                            <div>
                                <div class="font-bold ${momentumScore >= 60 ? 'text-green-600' : momentumScore <= 40 ? 'text-red-600' : 'text-gray-600'}">${momentumScore.toFixed(0)}</div>
                                <div class="text-gray-500">ا�زخ�&</div>
                            </div>
                            <div>
                                <div class="font-bold ${qualityScore >= 60 ? 'text-green-600' : qualityScore <= 40 ? 'text-red-600' : 'text-gray-600'}">${qualityScore.toFixed(0)}</div>
                                <div class="text-gray-500">ا�ج��دة</div>
                            </div>
                        </div>
                    </div>
                    
                    <!-- Key Strengths -->
                    ${strengths.length ? `
                        <div class="mb-3">
                            <div class="text-green-700 font-medium mb-2 flex items-center">
                                <i class="fas fa-check-circle ml-2"></i>
                                � �اط ا����ة
                            </div>
                            <div class="space-y-1">
                                ${strengths.map(item => `
                                    <div class="flex items-start text-sm bg-green-50 rounded p-2">
                                        <i class="fas fa-plus-circle text-green-500 ml-2 mt-0.5"></i>
                                        <div>
                                            <span class="font-medium text-gray-800">${item.title_ar || item.title || item}</span>
                                            ${item.description_ar || item.description ? `<span class="text-gray-500 text-xs block">${item.description_ar || item.description}</span>` : ''}
                                        </div>
                                    </div>
                                `).join('')}
                            </div>
                        </div>
                    ` : ''}
                    
                    <!-- Key Risks -->
                    ${risks.length ? `
                        <div class="mb-3">
                            <div class="text-red-700 font-medium mb-2 flex items-center">
                                <i class="fas fa-exclamation-triangle ml-2"></i>
                                ع��ا�&� ا��&خاطرة
                            </div>
                            <div class="space-y-1">
                                ${risks.map(item => `
                                    <div class="flex items-start text-sm bg-red-50 rounded p-2">
                                        <i class="fas fa-minus-circle text-red-500 ml-2 mt-0.5"></i>
                                        <div>
                                            <span class="font-medium text-gray-800">${item.title_ar || item.title || item}</span>
                                            ${item.description_ar || item.description ? `<span class="text-gray-500 text-xs block">${item.description_ar || item.description}</span>` : ''}
                                        </div>
                                    </div>
                                `).join('')}
                            </div>
                        </div>
                    ` : ''}
                    
                    <!-- Data Quality -->
                    ${dataQuality.score ? `
                        <div class="text-xs text-gray-400 pt-2 border-t border-gray-200">
                            <i class="fas fa-database ml-1"></i>
                            ج��دة ا�ب�`ا� ات: ${dataQuality.score.toFixed(0)}%
                            ${dataQuality.sources_available ? `| ${dataQuality.sources_available} �&صادر` : ''}
                        </div>
                    ` : ''}
                    
                    <!-- Educational Section -->
                    ${recommendationResponse.education ? `
                        <div class="mt-4 pt-3 border-t border-gray-200">
                            <button onclick="toggleEducationSection()" class="flex items-center justify-between w-full text-sm font-medium text-indigo-600 hover:text-indigo-800">
                                <span>
                                    <i class="fas fa-graduation-cap ml-2"></i>
                                    تع���& ا��&ز�`د ع�  �!ذا ا�تح��`�
                                </span>
                                <i class="fas fa-chevron-down" id="educationToggleIcon"></i>
                            </button>
                            <div id="educationSection" class="hidden mt-3 space-y-4">
                                <!-- Recommendation Guide -->
                                ${recommendationResponse.education.recommendation_guide ? `
                                    <div class="bg-indigo-50 rounded-lg p-3">
                                        <h5 class="font-semibold text-indigo-800 mb-2">
                                            ${recommendationResponse.education.recommendation_guide.title}
                                        </h5>
                                        <p class="text-sm text-gray-700 mb-2">${recommendationResponse.education.recommendation_guide.description}</p>
                                        <div class="text-sm">
                                            <div class="font-medium text-gray-700 mb-1">ا�خط��ات ا��&�ترحة:</div>
                                            <ul class="list-disc pr-5 text-gray-600 space-y-1">
                                                ${recommendationResponse.education.recommendation_guide.actions.map(a => `<li>${a}</li>`).join('')}
                                            </ul>
                                        </div>
                                    </div>
                                ` : ''}
                                
                                <!-- Financial Terms -->
                                ${recommendationResponse.education.terms && recommendationResponse.education.terms.length > 0 ? `
                                    <div class="bg-gray-50 rounded-lg p-3">
                                        <h5 class="font-semibold text-gray-800 mb-2">
                                            <i class="fas fa-book ml-2 text-gray-500"></i>
                                            شرح ا��&صط�حات ا��&ا��`ة
                                        </h5>
                                        <div class="space-y-2">
                                            ${recommendationResponse.education.terms.map(term => `
                                                <div class="bg-white rounded p-2 text-sm">
                                                    <div class="flex justify-between items-start">
                                                        <div class="font-medium text-gray-800">${term.term}</div>
                                                        <div class="text-xs text-gray-400">${term.term_en}</div>
                                                    </div>
                                                    <div class="text-gray-600 mt-1">${term.explanation}</div>
                                                    <div class="flex justify-between items-center mt-1">
                                                        <span class="text-xs px-2 py-0.5 rounded ${
                                                            term.interpretation.includes('�&�&تاز') || term.interpretation.includes('جذاب') || term.interpretation.includes('�&� خفض ا��&خاطر') || term.interpretation.includes('�&�ب���') || term.interpretation.includes('فرصة')
                                                                ? 'bg-green-100 text-green-700'
                                                                : term.interpretation.includes('�&رتفع') || term.interpretation.includes('ضع�`ف') || term.interpretation.includes('حذر') || term.interpretation.includes('�&رتفع ا��&خاطر')
                                                                    ? 'bg-red-100 text-red-700'
                                                                    : 'bg-yellow-100 text-yellow-700'
                                                        }">${term.interpretation}</span>
                                                        <span class="font-semibold">${term.value}</span>
                                                    </div>
                                                    <div class="text-xs text-gray-500 mt-1 italic">
                                                        <i class="fas fa-lightbulb ml-1 text-yellow-500"></i>
                                                        ${term.tip}
                                                    </div>
                                                </div>
                                            `).join('')}
                                        </div>
                                    </div>
                                ` : ''}
                                
                                <!-- Scores Explanation -->
                                ${recommendationResponse.education.scores_explanation ? `
                                    <div class="bg-blue-50 rounded-lg p-3">
                                        <h5 class="font-semibold text-blue-800 mb-2">
                                            <i class="fas fa-chart-bar ml-2 text-blue-500"></i>
                                            ف�!�& ا�� تائج
                                        </h5>
                                        <div class="space-y-2 text-sm">
                                            <div class="bg-white rounded p-2">
                                                <div class="font-medium text-gray-800">${recommendationResponse.education.scores_explanation.composite.title}</div>
                                                <div class="text-gray-600">${recommendationResponse.education.scores_explanation.composite.description}</div>
                                            </div>
                                            <div class="bg-white rounded p-2">
                                                <div class="font-medium text-gray-800">${recommendationResponse.education.scores_explanation.fundamental.title}</div>
                                                <div class="text-gray-600">${recommendationResponse.education.scores_explanation.fundamental.description}</div>
                                            </div>
                                            <div class="bg-white rounded p-2">
                                                <div class="font-medium text-gray-800">${recommendationResponse.education.scores_explanation.technical.title}</div>
                                                <div class="text-gray-600">${recommendationResponse.education.scores_explanation.technical.description}</div>
                                            </div>
                                        </div>
                                    </div>
                                ` : ''}
                                
                                <!-- Risk Education -->
                                ${recommendationResponse.education.risk_education ? `
                                    <div class="bg-orange-50 rounded-lg p-3">
                                        <h5 class="font-semibold text-orange-800 mb-2">
                                            <i class="fas fa-shield-alt ml-2 text-orange-500"></i>
                                            ${recommendationResponse.education.risk_education.title}
                                        </h5>
                                        <p class="text-sm text-gray-700 mb-2">${recommendationResponse.education.risk_education.explanation}</p>
                                        ${recommendationResponse.education.risk_education.your_risk_level ? `
                                            <div class="bg-white rounded p-2 mb-2">
                                                <div class="font-medium text-gray-800">�&ست���0 �&خاطر �!ذا ا�س�!�&:</div>
                                                <div class="text-gray-600">${recommendationResponse.education.risk_education.your_risk_level.what_it_means}</div>
                                            </div>
                                        ` : ''}
                                        <div class="text-sm">
                                            <div class="font-medium text-gray-700 mb-1">� صائح إدارة ا��&خاطر:</div>
                                            <ul class="list-disc pr-5 text-gray-600 space-y-1">
                                                ${recommendationResponse.education.risk_education.risk_management_tips.slice(0, 3).map(tip => `<li>${tip}</li>`).join('')}
                                            </ul>
                                        </div>
                                    </div>
                                ` : ''}
                                
                                <!-- Next Steps -->
                                ${recommendationResponse.education.next_steps && recommendationResponse.education.next_steps.length > 0 ? `
                                    <div class="bg-green-50 rounded-lg p-3">
                                        <h5 class="font-semibold text-green-800 mb-2">
                                            <i class="fas fa-route ml-2 text-green-500"></i>
                                            ا�خط��ات ا�تا��`ة
                                        </h5>
                                        <div class="space-y-2">
                                            ${recommendationResponse.education.next_steps.map(step => `
                                                <div class="flex items-start bg-white rounded p-2 text-sm">
                                                    <div class="w-6 h-6 rounded-full bg-green-100 text-green-600 flex items-center justify-center text-xs font-bold ml-2 flex-shrink-0">
                                                        ${step.step}
                                                    </div>
                                                    <div>
                                                        <div class="font-medium text-gray-800">${step.title}</div>
                                                        <div class="text-gray-600">${step.description}</div>
                                                        <div class="text-xs text-green-600 mt-1">
                                                            <i class="fas fa-arrow-left ml-1"></i>
                                                            ${step.action}
                                                        </div>
                                                    </div>
                                                </div>
                                            `).join('')}
                                        </div>
                                    </div>
                                ` : ''}
                            </div>
                        </div>
                    ` : ''}
                    
                    <!-- Disclaimer -->
                    <div class="text-xs text-gray-400 mt-2 pt-2 border-t border-gray-200">
                        <i class="fas fa-info-circle ml-1"></i>
                        �!ذا ا�تح��`� ��أغراض ا��&ع����&ات�`ة ف�ط ���ا �`ُعتبر � ص�`حة �&ا��`ة.
                    </div>
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
                    <div class="${changeClass} text-sm mt-1">
                        <i class="fas ${priceChange >= 0 ? 'fa-arrow-up' : 'fa-arrow-down'} text-xs ml-1"></i>
                        ${Math.abs(priceChange).toFixed(2)} ج� �`�!
                    </div>
                </div>
            </div>
            
            <div class="mb-6">
                ${createBadge(getComplianceText(stock.compliance_status), stock.compliance_status?.toLowerCase())}
                ${stock.compliance_note ? `<span class="mr-2 text-sm text-gray-500">${stock.compliance_note}</span>` : ''}
            </div>
            
            <div class="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                <div class="bg-gray-50 rounded-lg p-4">
                    <div class="text-xs text-gray-500 mb-1">إغ�ا� ساب�</div>
                    <div class="font-semibold">${stock.previous_close ? formatCurrency(stock.previous_close) : '-'}</div>
                </div>
                <div class="bg-gray-50 rounded-lg p-4">
                    <div class="text-xs text-gray-500 mb-1">ا�افتتاح</div>
                    <div class="font-semibold">${stock.open_price ? formatCurrency(stock.open_price) : '-'}</div>
                </div>
                <div class="bg-gray-50 rounded-lg p-4">
                    <div class="text-xs text-gray-500 mb-1">أع��0</div>
                    <div class="font-semibold">${stock.high_price ? formatCurrency(stock.high_price) : '-'}</div>
                </div>
                <div class="bg-gray-50 rounded-lg p-4">
                    <div class="text-xs text-gray-500 mb-1">أد� �0</div>
                    <div class="font-semibold">${stock.low_price ? formatCurrency(stock.low_price) : '-'}</div>
                </div>
            </div>
            
            <h4 class="font-semibold text-gray-900 mb-3">ا��&�ا�`�`س ا�رئ�`س�`ة</h4>
            <div class="grid grid-cols-2 md:grid-cols-3 gap-4">
                <div class="flex justify-between py-2 border-b border-gray-100">
                    <span class="text-gray-500">ا�حج�&</span>
                    <span class="font-medium">${formatNumber(stock.volume)}</span>
                </div>
                <div class="flex justify-between py-2 border-b border-gray-100">
                    <span class="text-gray-500">ا���`�&ة ا�س����`ة</span>
                    <span class="font-medium">${stock.market_cap ? formatNumber(stock.market_cap) : '-'}</span>
                </div>
                <div class="flex justify-between py-2 border-b border-gray-100">
                    <span class="text-gray-500">�&ضاعف ا�ربح�`ة</span>
                    <span class="font-medium">${stock.pe_ratio?.toFixed(2) || '-'}</span>
                </div>
                <div class="flex justify-between py-2 border-b border-gray-100">
                    <span class="text-gray-500">�&ضاعف ا���`�&ة ا�دفتر�`ة</span>
                    <span class="font-medium">${stock.pb_ratio?.toFixed(2) || '-'}</span>
                </div>
                <div class="flex justify-between py-2 border-b border-gray-100">
                    <span class="text-gray-500">ربح�`ة ا�س�!�&</span>
                    <span class="font-medium">${stock.eps?.toFixed(2) || '-'}</span>
                </div>
                <div class="flex justify-between py-2 border-b border-gray-100">
                    <span class="text-gray-500">ا�عائد ع��0 ح���� ا��&سا�!�&�`� </span>
                    <span class="font-medium">${stock.roe ? `${stock.roe.toFixed(2)}%` : '-'}</span>
                </div>
                <div class="flex justify-between py-2 border-b border-gray-100">
                    <span class="text-gray-500">عائد ا�ت��ز�`عات</span>
                    <span class="font-medium">${stock.dividend_yield ? `${stock.dividend_yield.toFixed(2)}%` : '-'}</span>
                </div>
                <div class="flex justify-between py-2 border-b border-gray-100">
                    <span class="text-gray-500">� سبة ا�د�`�  ��ح����</span>
                    <span class="font-medium">${stock.debt_to_equity?.toFixed(2) || '-'}</span>
                </div>
            </div>
            
            <h4 class="font-semibold text-gray-900 mt-6 mb-3">ا��&ؤشرات ا�ف� �`ة</h4>
            <div class="grid grid-cols-2 md:grid-cols-3 gap-4">
                <div class="flex justify-between py-2 border-b border-gray-100">
                    <span class="text-gray-500">ا��&ت��سط ا��&تحرْ 50</span>
                    <span class="font-medium">${stock.ma_50?.toFixed(2) || '-'}</span>
                </div>
                <div class="flex justify-between py-2 border-b border-gray-100">
                    <span class="text-gray-500">ا��&ت��سط ا��&تحرْ 200</span>
                    <span class="font-medium">${stock.ma_200?.toFixed(2) || '-'}</span>
                </div>
                <div class="flex justify-between py-2 border-b border-gray-100">
                    <span class="text-gray-500">�&ؤشر ا����ة ا�� سب�`ة</span>
                    <span class="font-medium">${stock.rsi?.toFixed(2) || '-'}</span>
                </div>
                <div class="flex justify-between py-2 border-b border-gray-100">
                    <span class="text-gray-500">�&ست���0 ا�دع�&</span>
                    <span class="font-medium">${stock.support_level?.toFixed(2) || '-'}</span>
                </div>
                <div class="flex justify-between py-2 border-b border-gray-100">
                    <span class="text-gray-500">�&ست���0 ا��&�ا���&ة</span>
                    <span class="font-medium">${stock.resistance_level?.toFixed(2) || '-'}</span>
                </div>
            </div>
            
            ${historyChartHtml}
            ${recommendationHtml}
            
            <div class="mt-6 pt-4 border-t border-gray-200 text-sm text-gray-500">
                آخر تحد�`ث: ${formatDate(stock.last_update)}
            </div>
        `;

        // Initialize chart after DOM is ready
        if (normalizedHistory.success && normalizedHistory.data.length > 0) {
            // Store history data globally for chart type switching
            window.currentHistoryData = normalizedHistory.data;

            // Use setTimeout to ensure DOM is ready
            setTimeout(() => {
                currentChart = createCandlestickChart('stockChart', normalizedHistory.data, {
                    title: ''
                });
            }, 100);
        }

    } catch (error) {
        console.error('خطأ ف�` تح�&�`� تفاص�`� ا�س�!�&:', error);
        elements.modalBody.innerHTML = createAlert({
            type: 'danger',
            message: `فش� تح�&�`� تفاص�`� ا�س�!�&: ${error.message}`
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
            statusElement.querySelector('.status-text').textContent = 'ا�س��� �&فت��ح';
        } else {
            statusElement.classList.remove('open');
            statusElement.querySelector('.status-dot').classList.remove('bg-green-500');
            statusElement.querySelector('.status-dot').classList.add('bg-red-500');
            statusElement.querySelector('.status-text').textContent = 'ا�س��� �&غ��';
        }

        state.marketStatus = status;

    } catch (error) {
        console.error('خطأ ف�` تحد�`ث حا�ة ا�س���:', error);
    }
}

// ==================== ا��&ساعدات ====================
function updateSectorFilters() {
    const selects = ['sectorFilter', 'searchSectorFilter'];

    selects.forEach(id => {
        const select = document.getElementById(id);
        if (select) {
            const currentValue = select.value;
            select.innerHTML = '<option value="">ج�&�`ع ا��طاعات</option>' +
                state.sectors.map(s => `<option value="${s}">${s}</option>`).join('');
            select.value = currentValue;
        }
    });
}

// ==================== صفحات ا��&ستخد�& ====================

async function loadWatchlistPage() {
    if (!userState.isAuthenticated) {
        document.getElementById('watchlistLoading')?.classList.add('hidden');
        document.getElementById('watchlistEmpty')?.classList.remove('hidden');
        document.getElementById('watchlistEmpty').innerHTML = `
            <i class="fas fa-lock text-4xl text-gray-300 mb-4"></i>
            <p class="text-gray-500 mb-4">�`جب تسج�`� ا�دخ��� �عرض �ائ�&ة ا��&را�بة</p>
            <button onclick="openAuthModal('login')" class="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-sm">
                تسج�`� ا�دخ���
            </button>
        `;
        return;
    }

    try {
        document.getElementById('watchlistLoading')?.classList.remove('hidden');
        document.getElementById('watchlistEmpty')?.classList.add('hidden');
        document.getElementById('watchlistTableContainer')?.classList.add('hidden');

        const watchlist = await loadWatchlist();
        
        document.getElementById('watchlistLoading')?.classList.add('hidden');
        
        if (!watchlist || watchlist.length === 0) {
            document.getElementById('watchlistEmpty')?.classList.remove('hidden');
            return;
        }

        document.getElementById('watchlistTableContainer')?.classList.remove('hidden');
        const tbody = document.getElementById('watchlistTableBody');
        tbody.innerHTML = watchlist.map(item => `
            <tr class="border-b border-gray-100 hover:bg-gray-50">
                <td class="px-6 py-4 font-medium text-gray-900">${item.ticker}</td>
                <td class="px-6 py-4 text-gray-600">${item.stock_name || '-'}</td>
                <td class="px-6 py-4">${formatCurrency(item.current_price)}</td>
                <td class="px-6 py-4 ${item.price_change >= 0 ? 'text-green-600' : 'text-red-600'}">
                    ${item.price_change ? (item.price_change >= 0 ? '+' : '') + item.price_change.toFixed(2) + '%' : '-'}
                </td>
                <td class="px-6 py-4 text-sm text-gray-500">
                    ${item.alert_price_above ? `أع��0 �&�  ${item.alert_price_above}` : ''}
                    ${item.alert_price_below ? `أ�� �&�  ${item.alert_price_below}` : ''}
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
        console.error('خطأ ف�` تح�&�`� �ائ�&ة ا��&را�بة:', error);
        showNotification('فش� تح�&�`� �ائ�&ة ا��&را�بة', 'danger');
    }
}

async function loadPortfolioPage() {
    initializePortfolioAssetForm();
    if (!userState.isAuthenticated) {
        document.getElementById('assetsLoading')?.classList.add('hidden');
        document.getElementById('assetsEmpty')?.classList.remove('hidden');
        document.getElementById('assetsEmpty').innerHTML = `
            <i class="fas fa-lock text-4xl text-gray-300 mb-4"></i>
            <p class="text-gray-500 mb-4">�`جب تسج�`� ا�دخ��� �عرض �&حفظتْ</p>
            <button onclick="openAuthModal('login')" class="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-sm">
                تسج�`� ا�دخ���
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
            
            document.getElementById('portfolioAssetCount').textContent = assets?.length || 0;

            renderPortfolioRiskInsights(assets || [], summary);
        }

        document.getElementById('assetsLoading')?.classList.add('hidden');

        if (!assets || assets.length === 0) {
            document.getElementById('assetsEmpty')?.classList.remove('hidden');
            return;
        }

        document.getElementById('assetsTableContainer')?.classList.remove('hidden');
        const tbody = document.getElementById('assetsTableBody');
        tbody.innerHTML = assets.map(asset => `
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
                <td class="px-6 py-4">
                    <button onclick="editAsset(${asset.id})" class="text-blue-500 hover:text-blue-700 ml-2">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button onclick="deleteAssetConfirm(${asset.id})" class="text-red-500 hover:text-red-700">
                        <i class="fas fa-trash"></i>
                    </button>
                </td>
            </tr>
        `).join('');
    } catch (error) {
        console.error('خطأ ف�` تح�&�`� ا��&حفظة:', error);
        showNotification('فش� تح�&�`� ا��&حفظة', 'danger');
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
                <i class="fas fa-shield-alt text-emerald-600 ml-2"></i>إرشادات إدارة ا��&خاطر
            </h3>
            <p class="text-sm text-gray-600">أضف أص���ْ أ���ا�9 �عرض تح��`� ت��ز�`ع ا��&حفظة ��ا�ت� ب�`�!ات ا�ذْ�`ة �إدارة ا��&خاطر.</p>
        `;
        return;
    }

    const totalValue = getPortfolioSummaryValue(summary, 'total_value', 'total_assets_value') ||
        assets.reduce((sum, asset) => sum + (asset.current_value || 0), 0);
    const typeBreakdown = summary?.by_type || {};
    const halalPercent = typeof summary?.halal_percent === 'number' ? summary.halal_percent : 100;
    const totalGainPercent = typeof summary?.total_gain_loss_percent === 'number' ? summary.total_gain_loss_percent : 0;

    const sortedByValue = [...assets].sort((a, b) => (b.current_value || 0) - (a.current_value || 0));
    const largest = sortedByValue[0];
    const largestPercent = totalValue > 0 ? ((largest?.current_value || 0) / totalValue) * 100 : 0;
    const typeCount = Object.keys(typeBreakdown).length || new Set(assets.map(a => a.asset_type)).size;
    const diversificationScore = Math.max(
        0,
        Math.min(100, (typeCount * 18) + Math.min(assets.length, 8) * 5 - Math.max(0, largestPercent - 35))
    );

    const riskLevel = largestPercent >= 45 ? '�&رتفع' : largestPercent >= 30 ? '�&ت��سط' : '�&� خفض';
    const riskClass = largestPercent >= 45 ? 'text-red-600' : largestPercent >= 30 ? 'text-amber-600' : 'text-emerald-600';

    const tips = [];
    if (largestPercent > 35) {
        tips.push(`ا�ترْ�`ز عا��` ف�` أص� ��احد (${largest?.asset_name || '-'}) ب� سبة ${largestPercent.toFixed(1)}%. �`فض� خفض�! إ��0 أ�� �&�  30%.`);
    } else {
        tips.push('ت��ز�`عْ ع��0 ا�أص��� ا�رئ�`س�`ة ج�`د. حافظ ع��0 حد أ�ص�0 25-30% �ْ� أص�.');
    }

    if (typeCount < 3) {
        tips.push('�`ستحس�  ز�`ادة ا�ت� ���`ع ع��0 ا�أ�� إ��0 3 فئات أص��� �&خت�فة �ت���`� ا��&خاطر.');
    } else {
        tips.push('ا�ت� ���`ع ب�`�  فئات ا�أص��� ج�`د. را�ب إعادة ا�ت��از�  ش�!ر�`ا�9.');
    }

    if (totalGainPercent < -10) {
        tips.push('ا��&حفظة ف�` تراجع �&�ح��ظ. راجع �&ت��سطات ا�تْ�فة ��خف�ض ا�ا� ْشاف ع��0 ا�أص��� ا�أع��0 ت��با�9.');
    } else {
        tips.push('استخد�& �اعدة ا��&خاطرة: �ا تجع� أ�` �&رْز �`تجا��ز 2% �&خاطرة �&�  إج�&ا��` رأس ا��&ا�.');
    }

    tips.push('احتفظ بس�`���ة 10-20% �استغ�ا� ا�فرص ��تخف�`ف أثر ت��بات ا�س���.');

    container.innerHTML = `
        <div class="flex items-center justify-between flex-wrap gap-3 mb-4">
            <h3 class="font-semibold text-gray-900">
                <i class="fas fa-shield-alt text-emerald-600 ml-2"></i>���حة ا�تحْ�& ف�` ا��&خاطر
            </h3>
            <span class="text-sm ${riskClass} font-semibold">�&ست���0 ا��&خاطر: ${riskLevel}</span>
        </div>
        <div class="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
            <div class="bg-gray-50 rounded-lg p-3">
                <p class="text-xs text-gray-500">أع��0 ترْ�ز ف�` أص�</p>
                <p class="font-bold text-gray-900">${largestPercent.toFixed(1)}%</p>
            </div>
            <div class="bg-gray-50 rounded-lg p-3">
                <p class="text-xs text-gray-500">درجة ا�ت� ���`ع</p>
                <p class="font-bold text-gray-900">${diversificationScore.toFixed(0)}/100</p>
            </div>
            <div class="bg-gray-50 rounded-lg p-3">
                <p class="text-xs text-gray-500">� سبة ا�أص��� ا�ح�ا�</p>
                <p class="font-bold text-gray-900">${halalPercent.toFixed(1)}%</p>
            </div>
            <div class="bg-gray-50 rounded-lg p-3">
                <p class="text-xs text-gray-500">عدد فئات ا�أص���</p>
                <p class="font-bold text-gray-900">${typeCount}</p>
            </div>
        </div>
        <div class="bg-emerald-50 border border-emerald-200 rounded-lg p-4">
            <h4 class="font-semibold text-emerald-800 mb-2">ت��ج�`�!ات ع�&��`ة �إدارة ا�أص���</h4>
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
    const assetNameEl = document.getElementById('assetName');
    const assetTickerEl = document.getElementById('assetTicker');
    const stockSelectContainer = document.getElementById('stockSelectionContainer');
    const stockSelect = document.getElementById('assetStockSelect');
    const stockIdEl = document.getElementById('assetStockId');

    if (!assetTypeEl || !assetNameEl || !assetTickerEl || !stockSelectContainer || !stockSelect || !stockIdEl) return;

    const isStock = assetTypeEl.value === 'stock';

    stockSelectContainer.classList.toggle('hidden', !isStock);
    assetNameEl.readOnly = isStock;
    assetTickerEl.readOnly = isStock;

    if (!isStock) {
        stockSelect.value = '';
        stockIdEl.value = '';
        assetNameEl.value = '';
        assetTickerEl.value = '';
    }
}

async function initializePortfolioAssetForm() {
    const assetTypeEl = document.getElementById('assetType');
    const stockSelect = document.getElementById('assetStockSelect');
    const assetNameEl = document.getElementById('assetName');
    const assetTickerEl = document.getElementById('assetTicker');
    const stockIdEl = document.getElementById('assetStockId');

    if (!assetTypeEl || !stockSelect || !assetNameEl || !assetTickerEl || !stockIdEl) return;

    if (!stockSelect.dataset.initialized) {
        stockSelect.dataset.initialized = 'true';

        assetTypeEl.addEventListener('change', updateAssetNameModeByType);
        stockSelect.addEventListener('change', () => {
            const selected = stockSelect.selectedOptions[0];
            if (!selected || !selected.value) {
                stockIdEl.value = '';
                assetNameEl.value = '';
                assetTickerEl.value = '';
                return;
            }

            stockIdEl.value = selected.dataset.stockId || '';
            assetNameEl.value = selected.dataset.stockName || selected.textContent || '';
            assetTickerEl.value = selected.value || '';
        });
    }

    updateAssetNameModeByType();

    try {
        const stocks = await loadStockOptionsForPortfolio();
        const options = [
            '<option value="">اختر ا�س�!�&...</option>',
            ...stocks.map(stock => {
                const displayName = stock.name_ar || stock.name || stock.ticker;
                return `<option value="${stock.ticker}" data-stock-id="${stock.id}" data-stock-name="${displayName}">${stock.ticker} - ${displayName}</option>`;
            })
        ];
        stockSelect.innerHTML = options.join('');
    } catch (error) {
        console.error('Failed to load stock dropdown options:', error);
        stockSelect.innerHTML = '<option value="">تعذر تح�&�`� �ائ�&ة ا�أس�!�&</option>';
    }
}

async function loadIncomeExpensePage() {
    if (!userState.isAuthenticated) {
        document.getElementById('transactionsLoading')?.classList.add('hidden');
        document.getElementById('transactionsEmpty')?.classList.remove('hidden');
        document.getElementById('transactionsEmpty').innerHTML = `
            <i class="fas fa-lock text-4xl text-gray-300 mb-4"></i>
            <p class="text-gray-500 mb-4">�`جب تسج�`� ا�دخ��� �عرض ا��&عا�&�ات</p>
            <button onclick="openAuthModal('login')" class="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-sm">
                تسج�`� ا�دخ���
            </button>
        `;
        return;
    }

    try {
        document.getElementById('transactionsLoading')?.classList.remove('hidden');
        document.getElementById('transactionsEmpty')?.classList.add('hidden');
        document.getElementById('transactionsTableContainer')?.classList.add('hidden');

        const transactions = await loadIncomeExpenses();
        
        // حساب ا�إج�&ا��`ات
        const totalIncome = transactions?.filter(t => t.transaction_type === 'income').reduce((sum, t) => sum + t.amount, 0) || 0;
        const totalExpenses = transactions?.filter(t => t.transaction_type === 'expense').reduce((sum, t) => sum + t.amount, 0) || 0;
        const netCashFlow = totalIncome - totalExpenses;

        document.getElementById('totalIncome').textContent = formatCurrency(totalIncome);
        document.getElementById('totalExpenses').textContent = formatCurrency(totalExpenses);
        const netFlowEl = document.getElementById('netCashFlow');
        netFlowEl.textContent = formatCurrency(netCashFlow);
        netFlowEl.className = `text-xl font-bold ${netCashFlow >= 0 ? 'text-green-600' : 'text-red-600'}`;

        document.getElementById('transactionsLoading')?.classList.add('hidden');

        if (!transactions || transactions.length === 0) {
            document.getElementById('transactionsEmpty')?.classList.remove('hidden');
            return;
        }

        document.getElementById('transactionsTableContainer')?.classList.remove('hidden');
        const tbody = document.getElementById('transactionsTableBody');
        tbody.innerHTML = transactions.map(t => `
            <tr class="border-b border-gray-100 hover:bg-gray-50">
                <td class="px-6 py-4">
                    <span class="px-2 py-1 text-xs rounded-full ${t.transaction_type === 'income' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}">
                        ${t.transaction_type === 'income' ? 'دخ�' : '�&صر��ف'}
                    </span>
                </td>
                <td class="px-6 py-4">${getCategoryLabel(t.category)}</td>
                <td class="px-6 py-4 font-medium ${t.transaction_type === 'income' ? 'text-green-600' : 'text-red-600'}">
                    ${t.transaction_type === 'income' ? '+' : '-'}${formatCurrency(t.amount)}
                </td>
                <td class="px-6 py-4 text-gray-500">${formatDate(t.transaction_date)}</td>
                <td class="px-6 py-4 text-gray-500">${t.description || '-'}</td>
                <td class="px-6 py-4">
                    <button onclick="deleteTransactionConfirm(${t.id})" class="text-red-500 hover:text-red-700">
                        <i class="fas fa-trash"></i>
                    </button>
                </td>
            </tr>
        `).join('');
    } catch (error) {
        console.error('خطأ ف�` تح�&�`� ا��&عا�&�ات:', error);
        showNotification('فش� تح�&�`� ا��&عا�&�ات', 'danger');
    }
}

async function loadAlertsPage() {
    if (!userState.isAuthenticated) {
        document.getElementById('alertsLoading')?.classList.add('hidden');
        document.getElementById('alertsEmpty')?.classList.remove('hidden');
        document.getElementById('alertsEmpty').innerHTML = `
            <i class="fas fa-lock text-4xl text-gray-300 mb-4"></i>
            <p class="text-gray-500 mb-4">�`جب تسج�`� ا�دخ��� �عرض ا�ت� ب�`�!ات</p>
            <button onclick="openAuthModal('login')" class="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-sm">
                تسج�`� ا�دخ���
            </button>
        `;
        return;
    }

    try {
        document.getElementById('alertsLoading')?.classList.remove('hidden');
        document.getElementById('alertsEmpty')?.classList.add('hidden');
        document.getElementById('alertsListContainer')?.classList.add('hidden');

        const alerts = await loadScheduledAdvices();

        document.getElementById('alertsLoading')?.classList.add('hidden');

        if (!alerts || alerts.length === 0) {
            document.getElementById('alertsEmpty')?.classList.remove('hidden');
            return;
        }

        document.getElementById('alertsListContainer')?.classList.remove('hidden');
        const container = document.getElementById('alertsListContainer');
        container.innerHTML = alerts.map(alert => `
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
                        ${alert.is_active ? '� شط' : '�&ت���ف'}
                    </span>
                    <button onclick="deleteAlertConfirm(${alert.id})" class="text-red-500 hover:text-red-700">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            </div>
        `).join('');
    } catch (error) {
        console.error('خطأ ف�` تح�&�`� ا�ت� ب�`�!ات:', error);
        showNotification('فش� تح�&�`� ا�ت� ب�`�!ات', 'danger');
    }
}

// ==================== صفحة أخبار ا�استث�&ار ====================

let currentNewsCategory = 'gold';
let newsData = {
    gold: [],
    silver: [],
    global: []
};

async function loadNewsPage() {
    const loadingEl = document.getElementById('newsLoading');
    const contentEl = document.getElementById('newsContent');
    
    loadingEl?.classList.remove('hidden');
    contentEl?.classList.add('hidden');
    
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
        
        loadingEl?.classList.add('hidden');
        contentEl?.classList.remove('hidden');
        
    } catch (error) {
        console.error('خطأ ف�` تح�&�`� ا�أخبار:', error);
        loadingEl?.classList.add('hidden');
        contentEl?.classList.remove('hidden');
        
        // عرض رسا�ة خطأ
        const newsList = document.getElementById('newsList');
        if (newsList) {
            newsList.innerHTML = `
                <div class="text-center py-8">
                    <i class="fas fa-exclamation-circle text-4xl text-gray-300 mb-4"></i>
                    <p class="text-gray-500">فش� تح�&�`� ا�أخبار. �`رج�0 ا��&حا���ة �&رة أخر�0.</p>
                </div>
            `;
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
                <p class="text-gray-500">�ا ت��جد أخبار �&تاحة حا��`ا�9</p>
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
            high: '�&�!�&',
            medium: '�&ت��سط',
            low: 'عاد�`'
        };
        
        const publishedDate = new Date(item.published_at);
        const timeAgo = getTimeAgo(publishedDate);
        
        return `
            <div class="bg-gray-50 rounded-lg p-5 hover:bg-gray-100 transition-colors cursor-pointer" onclick="showNewsDetail('${category}', ${index})">
                <div class="flex items-start justify-between gap-4">
                    <div class="flex-1">
                        <div class="flex items-center gap-2 mb-2">
                            <span class="px-2 py-1 text-xs rounded-full ${importanceColors[item.importance] || importanceColors.low}">
                                ${importanceLabels[item.importance] || 'عاد�`'}
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
                            �!ذ�! ا��&ع����&ات ��أغراض ا�تع��`�&�`ة ف�ط ���ا تعتبر � ص�`حة استث�&ار�`ة.
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
    
    if (diffMins < 1) return 'ا�آ� ';
    if (diffMins < 60) return `�&� ذ ${diffMins} د��`�ة`;
    if (diffHours < 24) return `�&� ذ ${diffHours} ساعة`;
    if (diffDays < 7) return `�&� ذ ${diffDays} �`���&`;
    
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
            document.getElementById('settingsHalalOnly').checked = userState.user?.halal_only_preference || false;
            document.getElementById('settingsRiskTolerance').value = userState.user?.default_risk_tolerance || 'medium';
        }
    } catch (error) {
        console.error('خطأ ف�` تح�&�`� ا�إعدادات:', error);
    }
}

// ==================== ��ظائف �&ساعدة ���&ستخد�& ====================

function getAssetTypeLabel(type) {
    const labels = {
        'stock': 'س�!�&',
        'cash': '� �د',
        'gold': 'ذ�!ب',
        'silver': 'فضة',
        'crypto': 'ع�&�ة ر��&�`ة',
        'bond': 'س� د',
        'sukuk': 'صْ��ْ',
        'fund': 'ص� د���',
        'realestate': 'ع�ار'
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
        'dividend': 'أرباح ا�أس�!�&',
        'trading_profit': 'أرباح ا�تدا���',
        'investment': 'استث�&ار',
        'bills': 'ف��ات�`ر',
        'food': 'طعا�&',
        'transport': '�&��اص�ات',
        'entertainment': 'ترف�`�!',
        'other': 'أخر�0'
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
        'once': '�&رة ��احدة',
        'daily': '�`���&�`',
        'weekly': 'أسب��ع�`',
        'monthly': 'ش�!ر�`'
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
        showNotification('J1,I '.*J'1 'D3GE EF 'DB'&E)', 'warning');
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
        is_halal: document.getElementById('assetIsHalal').checked,
        notes: document.getElementById('assetNotes').value || null
    };

    try {
        await createAsset(assetData);
        document.getElementById('newAssetForm').reset();
        updateAssetNameModeByType();
        window.toggleAddAssetForm();
        loadPortfolioPage();
    } catch (error) {
        console.error('خطأ ف�` إضافة ا�أص�:', error);
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
        console.error('خطأ ف�` إضافة ا��&عا�&�ة:', error);
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
    if (confirm('�!� أ� ت �&تأْد �&�  إزا�ة �!ذا ا�س�!�& �&�  �ائ�&ة ا��&را�بة�x')) {
        try {
            await removeFromWatchlist(itemId);
            loadWatchlistPage();
        } catch (error) {
            console.error('خطأ ف�` إزا�ة ا�ع� صر:', error);
        }
    }
};

// حذف ا�أص���
window.deleteAssetConfirm = async function(assetId) {
    if (confirm('�!� أ� ت �&تأْد �&�  حذف �!ذا ا�أص��x')) {
        try {
            await deleteAsset(assetId);
            loadPortfolioPage();
        } catch (error) {
            console.error('خطأ ف�` حذف ا�أص�:', error);
        }
    }
};

// حذف ا��&عا�&�ات
window.deleteTransactionConfirm = async function(transactionId) {
    if (confirm('�!� أ� ت �&تأْد �&�  حذف �!ذ�! ا��&عا�&�ة�x')) {
        try {
            await deleteIncomeExpense(transactionId);
            loadIncomeExpensePage();
        } catch (error) {
            console.error('خطأ ف�` حذف ا��&عا�&�ة:', error);
        }
    }
};

// حذف ا�ت� ب�`�!ات
window.deleteAlertConfirm = async function(alertId) {
    if (confirm('�!� أ� ت �&تأْد �&�  حذف �!ذا ا�ت� ب�`�!�x')) {
        try {
            await deleteScheduledAdvice(alertId);
            loadAlertsPage();
        } catch (error) {
            console.error('خطأ ف�` حذف ا�ت� ب�`�!:', error);
        }
    }
};

// �&زا�&� ة أسعار ا�أص���
window.syncAssetPrices = async function() {
    try {
        showNotification('جار�` تحد�`ث ا�أسعار...', 'info');
        await apiService.syncAssetPrices();
        showNotification('ت�& تحد�`ث ا�أسعار ب� جاح', 'success');
        loadPortfolioPage();
    } catch (error) {
        showNotification('فش� تحد�`ث ا�أسعار', 'danger');
    }
};

// � سخ �&فتاح API
window.copyApiKey = function() {
    const input = document.getElementById('currentApiKey');
    input.type = 'text';
    input.select();
    document.execCommand('copy');
    input.type = 'password';
    showNotification('ت�& � سخ �&فتاح API', 'success');
};

// حفظ ا�إعدادات
document.getElementById('settingsForm')?.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const settingsData = {
        halal_only_preference: document.getElementById('settingsHalalOnly').checked,
        default_risk_tolerance: document.getElementById('settingsRiskTolerance').value
    };

    try {
        await updateUserSettings(settingsData);
    } catch (error) {
        console.error('خطأ ف�` حفظ ا�إعدادات:', error);
    }
});

function getComplianceText(status) {
    const texts = {
        'halal': 'ح�ا�',
        'haram': 'حرا�&',
        'doubtful': '�&شْ��ْ',
        'unknown': 'غ�`ر �&عر��ف'
    };
    return texts[status?.toLowerCase()] || status?.toUpperCase() || 'غ�`ر �&عر��ف';
}

function getRiskAssessmentText(key) {
    const texts = {
        'overall_risk': 'ا��&خاطر ا�إج�&ا��`ة',
        'volatility': 'ا�ت��ب',
        'concentration_risk': '�&خاطر ا�ترْز',
        'sector_diversification': 'ت� ��ع ا��طاعات',
        'shariah_compliance': 'ا�ا�&تثا� ا�شرع�`',
        'liquidity_risk': '�&خاطر ا�س�`���ة',
    };
    return texts[key] || key.replace(/_/g, ' ');
}

