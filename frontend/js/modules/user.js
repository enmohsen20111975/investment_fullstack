/**
 * وحدة إدارة المستخدم
 * تتعامل مع المصادقة والقائمة المنسدلة والأصول وعرض الإعدادات
 */
import apiService from '/static/js/api.js';

// ==================== حا�ة ا��&ستخد�& ====================
const userState = {
    isAuthenticated: false,
    user: null,
    watchlist: [],
    assets: [],
    incomeExpenses: [],
    scheduledAdvices: [],
    learningProgress: null,
    settings: null,
    financialSummary: null
};

// ==================== ع� اصر DOM ====================
let authModal = null;
let userDropdown = null;
let googleAuthConfig = null;
let googleInitAttempts = 0;

// ==================== التهيئة ====================
export async function initializeUserModule() {
    console.log('تهيئة وحدة المستخدم...');
    
    // إنشاء عناصر واجهة المستخدم
    createAuthModal();
    createUserDropdown();
    
    // التحقق من حالة المصادقة
    await checkAuthStatus();
    
    // إضافة مستمع الأحداث
    setupEventListeners();
    
    console.log('تم تهيئة وحدة المستخدم بنجاح');
}

// ==================== المصادقة ====================

async function checkAuthStatus() {
    try {
        const response = await apiService.getCurrentUser();
        const resolvedUser = response?.user || response;
        if (resolvedUser && resolvedUser.id) {
            userState.isAuthenticated = true;
            userState.user = resolvedUser;
            updateUIForAuthenticatedUser();
        } else {
            userState.isAuthenticated = false;
            userState.user = null;
            updateUIForGuestUser();
        }
    } catch (error) {
        console.error('خطأ في التحقق من حالة المصادقة:', error);
        userState.isAuthenticated = false;
        userState.user = null;
        updateUIForGuestUser();
    }
}

function createAuthModal() {
    const modal = document.createElement('div');
    modal.id = 'authModal';
    modal.className = 'fixed inset-0 bg-black/50 hidden z-50 flex items-center justify-center';
    modal.innerHTML = `
        <div id="authModalPanel" class="bg-white dark:bg-gray-800 rounded-xl shadow-2xl w-full mx-4 overflow-hidden border border-gray-100 dark:border-gray-700" style="max-width: 420px; max-height: 90vh;">
            <!-- رأس النافذة -->
            <div class="bg-gradient-to-r from-emerald-600 to-teal-600 p-4">
                <div class="flex justify-between items-center">
                    <h3 id="authModalTitle" class="text-xl font-bold text-white">تسجيل الدخول</h3>
                    <button onclick="closeAuthModal()" class="text-white hover:text-gray-200">
                        <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
                        </svg>
                    </button>
                </div>
            </div>
            
            <!-- محتوى النافذة -->
            <div class="p-6 overflow-y-auto" style="max-height: calc(90vh - 72px);">
                <!-- تبديل التبويبات -->
                <div class="flex mb-6 bg-gray-100 dark:bg-gray-700 rounded-lg p-1">
                    <button id="loginTab" onclick="switchAuthTab('login')" class="flex-1 py-2 px-4 rounded-lg text-sm font-medium transition-all bg-white dark:bg-gray-600 text-emerald-600 dark:text-emerald-400 shadow">
                        تسجيل الدخول
                    </button>
                    <button id="registerTab" onclick="switchAuthTab('register')" class="flex-1 py-2 px-4 rounded-lg text-sm font-medium transition-all text-gray-600 dark:text-gray-300">
                        إنشاء حساب
                    </button>
                </div>

                <div id="googleAuthSection" class="mb-4">
                    <div id="googleLoginContainer" class="w-full flex justify-center items-center" style="min-height: 44px;"></div>
                    <p id="googleAuthError" class="hidden text-xs text-amber-600 dark:text-amber-400 mt-2 text-center"></p>
                </div>

                <div id="authDivider" class="relative mb-4">
                    <div class="absolute inset-0 flex items-center">
                        <div class="w-full border-t border-gray-200 dark:border-gray-700"></div>
                    </div>
                    <div class="relative flex justify-center text-xs">
                        <span class="px-2 bg-white dark:bg-gray-800 text-gray-500">أو</span>
                    </div>
                </div>
                
                <!-- نموذج تسجيل الدخول -->
                <form id="loginForm" class="space-y-4">
                    <div>
                        <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">البريد الإلكتروني أو اسم المستخدم</label>
                        <input type="text" id="loginUsername" required class="w-full px-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-emerald-500 dark:bg-gray-700 dark:text-white" placeholder="أدخل البريد أو اسم المستخدم">
                    </div>
                    <div>
                        <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">كلمة المرور</label>
                        <input type="password" id="loginPassword" required class="w-full px-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-emerald-500 dark:bg-gray-700 dark:text-white" placeholder="أدخل كلمة المرور">
                    </div>
                    <div id="loginError" class="hidden text-red-500 text-sm"></div>
                    <button type="submit" class="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-medium py-2.5 px-4 rounded-lg transition-colors">
                        تسجيل الدخول
                    </button>
                </form>
                
                <!-- نموذج التسجيل -->
                <form id="registerForm" class="space-y-4 hidden">
                    <div>
                        <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">البريد الإلكتروني</label>
                        <input type="email" id="registerEmail" required class="w-full px-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-emerald-500 dark:bg-gray-700 dark:text-white" placeholder="example@email.com">
                    </div>
                    <div>
                        <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">اسم المستخدم</label>
                        <input type="text" id="registerUsername" required minlength="3" class="w-full px-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-emerald-500 dark:bg-gray-700 dark:text-white" placeholder="اختر اسم مستخدم">
                    </div>
                    <div>
                        <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">كلمة المرور</label>
                        <input type="password" id="registerPassword" required minlength="8" class="w-full px-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-emerald-500 dark:bg-gray-700 dark:text-white" placeholder="8 أحرف على الأقل">
                    </div>
                    <div>
                        <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">تأكيد كلمة المرور</label>
                        <input type="password" id="registerPasswordConfirm" required class="w-full px-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-emerald-500 dark:bg-gray-700 dark:text-white" placeholder="أعد كتابة كلمة المرور">
                    </div>
                    <div class="flex items-center">
                        <input type="checkbox" id="registerHalalOnly" class="w-4 h-4 text-emerald-600 rounded focus:ring-emerald-500">
                        <label for="registerHalalOnly" class="mr-2 text-sm text-gray-700 dark:text-gray-300">تفضيل الاستثمار الحلال فقط</label>
                    </div>
                    <div>
                        <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">تحمل المخاطر</label>
                        <select id="registerRiskTolerance" class="w-full px-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-emerald-500 dark:bg-gray-700 dark:text-white">
                            <option value="low">منخفض</option>
                            <option value="medium" selected>متوسط</option>
                            <option value="high">مرتفع</option>
                        </select>
                    </div>
                    <div id="registerError" class="hidden text-red-500 text-sm"></div>
                    <button type="submit" class="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-medium py-2.5 px-4 rounded-lg transition-colors">
                        إنشاء الحساب
                    </button>
                </form>
            </div>
        </div>
    `;
    document.body.appendChild(modal);
    authModal = modal;
    
    // إضافة مستمعي الأحداث
    document.getElementById('loginForm').addEventListener('submit', handleLogin);
    document.getElementById('registerForm').addEventListener('submit', handleRegister);
    initializeGoogleAuth();
}

async function initializeGoogleAuth() {
    const container = document.getElementById('googleLoginContainer');
    const errorEl = document.getElementById('googleAuthError');
    if (!container || !errorEl) return;

    container.innerHTML = '';
    errorEl.classList.add('hidden');

    try {
        googleAuthConfig = await apiService.getGoogleAuthConfig();
        if (!googleAuthConfig.enabled || !googleAuthConfig.client_id) {
            errorEl.textContent = 'تسجيل الدخول عبر Google غير متاح حالياً';
            errorEl.classList.remove('hidden');
            return;
        }

        if (!window.google?.accounts?.id) {
            if (googleInitAttempts < 5) {
                googleInitAttempts += 1;
                setTimeout(() => {
                    initializeGoogleAuth();
                }, 700);
                return;
            }
            errorEl.textContent = 'فشل تحميل خدمة Google. تحقق من الاتصال بالإنترنت';
            errorEl.classList.remove('hidden');
            return;
        }

        googleInitAttempts = 0;

        window.google.accounts.id.initialize({
            client_id: googleAuthConfig.client_id,
            callback: handleGoogleCredentialResponse,
            ux_mode: 'popup',
            context: 'signin'
        });

        window.google.accounts.id.renderButton(container, {
            theme: 'outline',
            size: 'large',
            width: Math.min(360, Math.max(260, container.clientWidth || 320)),
            text: 'continue_with',
            shape: 'rectangular'
        });
    } catch (error) {
        console.error('خطأ في تهيئة Google Auth:', error);
        errorEl.textContent = 'تعذر تهيئة تسجيل الدخول عبر Google';
        errorEl.classList.remove('hidden');
    }
}

async function handleGoogleCredentialResponse(googleResponse) {
    const errorEl = document.getElementById('loginError');
    try {
        if (errorEl) errorEl.classList.add('hidden');
        const credential = googleResponse?.credential;
        if (!credential) {
            throw new Error('لا يمكن استخراج رمز Google');
        }

        const response = await apiService.loginWithGoogle({
            id_token: credential
        });

        if (response?.api_key && response?.user) {
            await completeAuthentication(response, 'تم تسجيل الدخول عبر Google بنجاح');
        }
    } catch (error) {
        if (errorEl) {
            errorEl.textContent = error.message || 'فشل تسجيل الدخول عبر Google';
            errorEl.classList.remove('hidden');
        }
    }
}

async function completeAuthentication(response, message) {
    apiService.setApiKey(response.api_key);
    userState.isAuthenticated = true;
    userState.user = response.user;
    updateUIForAuthenticatedUser();
    closeAuthModal();
    showNotification(message, 'success');
    await loadUserData();
}

function createUserDropdown() {
    // البحث عن مكان إضافة القائمة المنسدلة
    const headerRight = document.querySelector('header .flex.items-center.gap-4');
    if (!headerRight) return;
    
    const dropdown = document.createElement('div');
    dropdown.id = 'userDropdownContainer';
    dropdown.className = 'relative';
    dropdown.innerHTML = `
        <!-- زائر -->
        <div id="guestActions" class="flex items-center gap-2">
            <button onclick="openAuthModal('login')" class="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors">
                تسجيل الدخول
            </button>
            <button onclick="openAuthModal('register')" class="px-4 py-2 text-sm font-medium bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg transition-colors">
                إنشاء حساب
            </button>
        </div>
        
        <!-- مستخدم مسجل -->
        <div id="userActions" class="hidden relative">
            <button onclick="toggleUserMenu()" class="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
                <div class="w-8 h-8 bg-emerald-600 rounded-full flex items-center justify-center">
                    <span id="userInitial" class="text-white font-medium text-sm">U</span>
                </div>
                <span id="userDisplayName" class="text-sm font-medium text-gray-700 dark:text-gray-300 hidden sm:block">المستخدم</span>
                <svg class="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"/>
                </svg>
            </button>
            
            <!-- القائمة المنسدلة -->
            <div id="userMenu" class="hidden absolute left-0 mt-2 w-56 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 py-2 z-50">
                <div class="px-4 py-2 border-b border-gray-200 dark:border-gray-700">
                    <p id="menuUserEmail" class="text-sm text-gray-600 dark:text-gray-400 truncate">user@email.com</p>
                </div>
                <a href="#" onclick="navigateToPage('watchlist'); return false;" class="flex items-center gap-3 px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700">
                    <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/>
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"/>
                    </svg>
                    قائمة المراقبة
                </a>
                <a href="#" onclick="navigateToPage('portfolio'); return false;" class="flex items-center gap-3 px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700">
                    <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"/>
                    </svg>
                    محفظتي
                </a>
                <a href="#" onclick="navigateToPage('income-expense'); return false;" class="flex items-center gap-3 px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700">
                    <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z"/>
                    </svg>
                    الدخل والمصروفات
                </a>
                <a href="#" onclick="navigateToPage('alerts'); return false;" class="flex items-center gap-3 px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700">
                    <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"/>
                    </svg>
                    التنبيهات المجدولة
                </a>
                <div class="border-t border-gray-200 dark:border-gray-700 my-2"></div>
                <a href="#" onclick="navigateToPage('settings'); return false;" class="flex items-center gap-3 px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700">
                    <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"/>
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/>
                    </svg>
                    الإعدادات
                </a>
                <button onclick="handleLogout()" class="w-full flex items-center gap-3 px-4 py-2 text-sm text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20">
                    <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"/>
                    </svg>
                    تسجيل الخروج
                </button>
            </div>
        </div>
    `;
    
    headerRight.insertBefore(dropdown, headerRight.firstChild);
    userDropdown = dropdown;
}

function updateUIForAuthenticatedUser() {
    const guestActions = document.getElementById('guestActions');
    const userActions = document.getElementById('userActions');
    const userInitial = document.getElementById('userInitial');
    const userDisplayName = document.getElementById('userDisplayName');
    const menuUserEmail = document.getElementById('menuUserEmail');
    
    if (guestActions) guestActions.classList.add('hidden');
    if (userActions) userActions.classList.remove('hidden');
    
    if (userState.user) {
        if (userInitial) userInitial.textContent = userState.user.username.charAt(0).toUpperCase();
        if (userDisplayName) userDisplayName.textContent = userState.user.username;
        if (menuUserEmail) menuUserEmail.textContent = userState.user.email;
    }
}

function updateUIForGuestUser() {
    const guestActions = document.getElementById('guestActions');
    const userActions = document.getElementById('userActions');
    
    if (guestActions) guestActions.classList.remove('hidden');
    if (userActions) userActions.classList.add('hidden');
}

// ==================== معالجات الأحداث ====================

function setupEventListeners() {
    // إغلاق القائمة عند الضغط خارجها
    document.addEventListener('click', (e) => {
        const userMenu = document.getElementById('userMenu');
        const userActionsContainer = document.getElementById('userActions');
        if (userMenu && !userActionsContainer?.contains(e.target)) {
            userMenu.classList.add('hidden');
        }
    });
}

async function handleLogin(e) {
    e.preventDefault();
    const username = document.getElementById('loginUsername').value;
    const password = document.getElementById('loginPassword').value;
    const errorEl = document.getElementById('loginError');
    
    try {
        errorEl.classList.add('hidden');
        const response = await apiService.login({
            username_or_email: username,
            password: password
        });
        
        if (response?.api_key && response?.user) {
            await completeAuthentication(response, 'تم تسجيل الدخول بنجاح');
        }
    } catch (error) {
        errorEl.textContent = error.message || 'فشل تسجيل الدخول. تحقق من البيانات';
        errorEl.classList.remove('hidden');
    }
}

async function handleRegister(e) {
    e.preventDefault();
    const email = document.getElementById('registerEmail').value;
    const username = document.getElementById('registerUsername').value;
    const password = document.getElementById('registerPassword').value;
    const passwordConfirm = document.getElementById('registerPasswordConfirm').value;
    const halalOnly = document.getElementById('registerHalalOnly').checked;
    const riskTolerance = document.getElementById('registerRiskTolerance').value;
    const errorEl = document.getElementById('registerError');
    
    if (password !== passwordConfirm) {
        errorEl.textContent = 'كلمات المرور غير متطابقة';
        errorEl.classList.remove('hidden');
        return;
    }
    
    try {
        errorEl.classList.add('hidden');
        const response = await apiService.register({
            email: email,
            username: username,
            password: password,
            halal_only_preference: halalOnly,
            default_risk_tolerance: riskTolerance
        });
        
        if (response?.api_key && response?.user) {
            await completeAuthentication(response, 'تم إنشاء الحساب بنجاح');
        }
    } catch (error) {
        errorEl.textContent = error.message || 'فشل إنشاء الحساب';
        errorEl.classList.remove('hidden');
    }
}

async function handleLogout() {
    try {
        await apiService.logout();
    } catch (error) {
        console.error('خطأ في تسجيل الخروج:', error);
    }
    
    apiService.resetApiKey();
    userState.isAuthenticated = false;
    userState.user = null;
    userState.watchlist = [];
    userState.assets = [];
    userState.incomeExpenses = [];
    userState.scheduledAdvices = [];
    userState.learningProgress = null;
    userState.settings = null;
    
    updateUIForGuestUser();
    showNotification('تم تسجيل الخروج', 'info');
    
    // العودة لصفحة الرئيسية
    if (typeof navigateToPage === 'function') {
        navigateToPage('dashboard');
    }
}

async function loadUserData() {
    if (!userState.isAuthenticated) return;
    
    try {
        await Promise.all([
            loadWatchlist(),
            loadAssets(),
            loadFinancialSummary()
        ]);
    } catch (error) {
        console.error('خطأ في تحميل بيانات المستخدم:', error);
    }
}

// ==================== قائمة المراقبة ====================

async function loadWatchlist() {
    try {
        userState.watchlist = await apiService.getWatchlist();
        return userState.watchlist;
    } catch (error) {
        console.error('خطأ في تحميل قائمة المراقبة:', error);
        return [];
    }
}

async function addToWatchlist(ticker, options = {}) {
    try {
        const response = await apiService.addToWatchlist({
            ticker,
            ...options
        });
        showNotification('تمت الإضافة إلى قائمة المراقبة', 'success');
        await loadWatchlist();
        return response;
    } catch (error) {
        showNotification(error.message || 'فشل الإضافة إلى قائمة المراقبة', 'error');
        throw error;
    }
}

async function removeFromWatchlist(itemId) {
    try {
        await apiService.removeFromWatchlist(itemId);
        showNotification('تمت الإزالة من قائمة المراقبة', 'success');
        await loadWatchlist();
    } catch (error) {
        showNotification(error.message || 'فشل الإزالة من قائمة المراقبة', 'error');
        throw error;
    }
}

// ==================== الأصول ====================

async function loadAssets() {
    try {
        userState.assets = await apiService.getUserAssets();
        return userState.assets;
    } catch (error) {
        console.error('خطأ في تحميل الأصول:', error);
        return [];
    }
}

async function createAsset(assetData) {
    try {
        const response = await apiService.createUserAsset(assetData);
        showNotification('تمت إضافة الأصل بنجاح', 'success');
        await loadAssets();
        return response;
    } catch (error) {
        showNotification(error.message || 'فشل إضافة الأصل', 'error');
        throw error;
    }
}

async function updateAsset(assetId, assetData) {
    try {
        const response = await apiService.updateUserAsset(assetId, assetData);
        showNotification('تم تحديث الأصل بنجاح', 'success');
        await loadAssets();
        return response;
    } catch (error) {
        showNotification(error.message || 'فشل تحديث الأصل', 'error');
        throw error;
    }
}

async function deleteAsset(assetId) {
    try {
        await apiService.deleteUserAsset(assetId);
        showNotification('تم حذف الأصل بنجاح', 'success');
        await loadAssets();
    } catch (error) {
        showNotification(error.message || 'فشل حذف الأصل', 'error');
        throw error;
    }
}

// ==================== الدخل والمصروفات ====================

async function loadIncomeExpenses(params = {}) {
    try {
        userState.incomeExpenses = await apiService.getIncomeExpenses(params);
        return userState.incomeExpenses;
    } catch (error) {
        console.error('خطأ في تحميل المعاملات:', error);
        return [];
    }
}

async function createIncomeExpense(data) {
    try {
        const response = await apiService.createIncomeExpense(data);
        showNotification('تمت إضافة المعاملة بنجاح', 'success');
        await loadIncomeExpenses();
        return response;
    } catch (error) {
        showNotification(error.message || 'فشل إضافة المعاملة', 'error');
        throw error;
    }
}

async function deleteIncomeExpense(transactionId) {
    try {
        await apiService.deleteIncomeExpense(transactionId);
        showNotification('تم حذف المعاملة بنجاح', 'success');
        await loadIncomeExpenses();
    } catch (error) {
        showNotification(error.message || 'فشل حذف المعاملة', 'error');
        throw error;
    }
}

// ==================== الملخص المالي ====================

async function loadFinancialSummary() {
    try {
        userState.financialSummary = await apiService.getFinancialSummary();
        return userState.financialSummary;
    } catch (error) {
        console.error('خطأ في تحميل الملخص المالي:', error);
        return null;
    }
}

// ==================== التنبيهات المجدولة ====================

async function loadScheduledAdvices() {
    try {
        userState.scheduledAdvices = await apiService.getScheduledAdvices();
        return userState.scheduledAdvices;
    } catch (error) {
        console.error('خطأ في تحميل التنبيهات:', error);
        return [];
    }
}

async function createScheduledAdvice(data) {
    try {
        const response = await apiService.createScheduledAdvice(data);
        showNotification('تم إنشاء التنبيه بنجاح', 'success');
        await loadScheduledAdvices();
        return response;
    } catch (error) {
        showNotification(error.message || 'فشل إنشاء التنبيه', 'error');
        throw error;
    }
}

async function deleteScheduledAdvice(adviceId) {
    try {
        await apiService.deleteScheduledAdvice(adviceId);
        showNotification('تم حذف التنبيه بنجاح', 'success');
        await loadScheduledAdvices();
    } catch (error) {
        showNotification(error.message || 'فشل حذف التنبيه', 'error');
        throw error;
    }
}

// ==================== إعدادات المستخدم ====================

async function loadUserSettings() {
    try {
        userState.settings = await apiService.getUserSettings();
        return userState.settings;
    } catch (error) {
        console.error('خطأ في تحميل الإعدادات:', error);
        return null;
    }
}

async function updateUserSettings(data) {
    try {
        const response = await apiService.updateUserSettings(data);
        showNotification('تم تحديث الإعدادات بنجاح', 'success');
        await loadUserSettings();
        return response;
    } catch (error) {
        showNotification(error.message || 'فشل تحديث الإعدادات', 'error');
        throw error;
    }
}

// ==================== ��ظائف �&ساعدة ====================

function showNotification(message, type = 'info') {
    const notification = document.createElement('div');
    notification.className = `fixed top-4 left-4 z-50 px-6 py-3 rounded-lg shadow-lg transform transition-all duration-300 translate-y-[-100%] opacity-0 ${
        type === 'success' ? 'bg-green-500' :
        type === 'error' ? 'bg-red-500' :
        'bg-blue-500'
    } text-white`;
    notification.textContent = message;
    document.body.appendChild(notification);
    
    // إظ�!ار
    setTimeout(() => {
        notification.classList.remove('translate-y-[-100%]', 'opacity-0');
    }, 10);
    
    // إخفاء
    setTimeout(() => {
        notification.classList.add('translate-y-[-100%]', 'opacity-0');
        setTimeout(() => notification.remove(), 300);
    }, 3000);
}

// ==================== وظائف عامة ====================

window.openAuthModal = function(tab = 'login') {
    if (authModal) {
        authModal.classList.remove('hidden');
        switchAuthTab(tab);
        if (tab === 'login') {
            initializeGoogleAuth();
        }
    }
};

window.closeAuthModal = function() {
    if (authModal) {
        authModal.classList.add('hidden');
    }
};

window.switchAuthTab = function(tab) {
    const loginTab = document.getElementById('loginTab');
    const registerTab = document.getElementById('registerTab');
    const loginForm = document.getElementById('loginForm');
    const registerForm = document.getElementById('registerForm');
    const modalTitle = document.getElementById('authModalTitle');
    const googleAuthSection = document.getElementById('googleAuthSection');
    const authDivider = document.getElementById('authDivider');
    
    if (tab === 'login') {
        loginTab.classList.add('bg-white', 'dark:bg-gray-600', 'text-emerald-600', 'dark:text-emerald-400', 'shadow');
        loginTab.classList.remove('text-gray-600', 'dark:text-gray-300');
        registerTab.classList.remove('bg-white', 'dark:bg-gray-600', 'text-emerald-600', 'dark:text-emerald-400', 'shadow');
        registerTab.classList.add('text-gray-600', 'dark:text-gray-300');
        loginForm.classList.remove('hidden');
        registerForm.classList.add('hidden');
        if (googleAuthSection) googleAuthSection.classList.remove('hidden');
        if (authDivider) authDivider.classList.remove('hidden');
        modalTitle.textContent = 'تسجيل الدخول';
    } else {
        registerTab.classList.add('bg-white', 'dark:bg-gray-600', 'text-emerald-600', 'dark:text-emerald-400', 'shadow');
        registerTab.classList.remove('text-gray-600', 'dark:text-gray-300');
        loginTab.classList.remove('bg-white', 'dark:bg-gray-600', 'text-emerald-600', 'dark:text-emerald-400', 'shadow');
        loginTab.classList.add('text-gray-600', 'dark:text-gray-300');
        registerForm.classList.remove('hidden');
        loginForm.classList.add('hidden');
        if (googleAuthSection) googleAuthSection.classList.add('hidden');
        if (authDivider) authDivider.classList.add('hidden');
            modalTitle.textContent = 'إنشاء حساب';
    }
};

window.toggleUserMenu = function() {
    const menu = document.getElementById('userMenu');
    if (menu) {
        menu.classList.toggle('hidden');
    }
};

// تصدير الوظائف والبيانات
export {
    userState,
    checkAuthStatus,
    loadUserData,
    loadWatchlist,
    addToWatchlist,
    removeFromWatchlist,
    loadAssets,
    createAsset,
    updateAsset,
    deleteAsset,
    loadIncomeExpenses,
    createIncomeExpense,
    deleteIncomeExpense,
    loadFinancialSummary,
    loadScheduledAdvices,
    createScheduledAdvice,
    deleteScheduledAdvice,
    loadUserSettings,
    updateUserSettings,
    showNotification
};

