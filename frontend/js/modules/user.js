/**
 * ��حدة إدارة ا��&ستخد�&
 * تتعا�&� �&ع ا��&صاد�ة�R �ائ�&ة ا��&را�بة�R ا�أص����R ��ا�إعدادات
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

// ==================== ا�ت�!�`ئة ====================
export async function initializeUserModule() {
    console.log('ت�!�`ئة ��حدة ا��&ستخد�&...');
    
    // إ� شاء ع� اصر ��اج�!ة ا��&ستخد�&
    createAuthModal();
    createUserDropdown();
    
    // ا�تح�� �&�  حا�ة ا��&صاد�ة
    await checkAuthStatus();
    
    // إضافة �&ست�&ع�` ا�أحداث
    setupEventListeners();
    
    console.log('ت�& ت�!�`ئة ��حدة ا��&ستخد�& ب� جاح');
}

// ==================== ا��&صاد�ة ====================

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
        console.error('خطأ ف�` ا�تح�� �&�  حا�ة ا��&صاد�ة:', error);
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
            <!-- رأس ا�� افذة -->
            <div class="bg-gradient-to-r from-emerald-600 to-teal-600 p-4">
                <div class="flex justify-between items-center">
                    <h3 id="authModalTitle" class="text-xl font-bold text-white">تسج�`� ا�دخ���</h3>
                    <button onclick="closeAuthModal()" class="text-white hover:text-gray-200">
                        <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
                        </svg>
                    </button>
                </div>
            </div>
            
            <!-- �&حت���0 ا�� افذة -->
            <div class="p-6 overflow-y-auto" style="max-height: calc(90vh - 72px);">
                <!-- تبد�`� ا�تب���`بات -->
                <div class="flex mb-6 bg-gray-100 dark:bg-gray-700 rounded-lg p-1">
                    <button id="loginTab" onclick="switchAuthTab('login')" class="flex-1 py-2 px-4 rounded-lg text-sm font-medium transition-all bg-white dark:bg-gray-600 text-emerald-600 dark:text-emerald-400 shadow">
                        تسج�`� ا�دخ���
                    </button>
                    <button id="registerTab" onclick="switchAuthTab('register')" class="flex-1 py-2 px-4 rounded-lg text-sm font-medium transition-all text-gray-600 dark:text-gray-300">
                        إ� شاء حساب
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
                        <span class="px-2 bg-white dark:bg-gray-800 text-gray-500">أ��</span>
                    </div>
                </div>
                
                <!-- � �&��ذج تسج�`� ا�دخ��� -->
                <form id="loginForm" class="space-y-4">
                    <div>
                        <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">ا�بر�`د ا�إ�ْتر��� �` أ�� اس�& ا��&ستخد�&</label>
                        <input type="text" id="loginUsername" required class="w-full px-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-emerald-500 dark:bg-gray-700 dark:text-white" placeholder="أدخ� ا�بر�`د أ�� اس�& ا��&ستخد�&">
                    </div>
                    <div>
                        <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">ْ��&ة ا��&ر��ر</label>
                        <input type="password" id="loginPassword" required class="w-full px-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-emerald-500 dark:bg-gray-700 dark:text-white" placeholder="أدخ� ْ��&ة ا��&ر��ر">
                    </div>
                    <div id="loginError" class="hidden text-red-500 text-sm"></div>
                    <button type="submit" class="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-medium py-2.5 px-4 rounded-lg transition-colors">
                        تسج�`� ا�دخ���
                    </button>
                </form>
                
                <!-- � �&��ذج ا�تسج�`� -->
                <form id="registerForm" class="space-y-4 hidden">
                    <div>
                        <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">ا�بر�`د ا�إ�ْتر��� �`</label>
                        <input type="email" id="registerEmail" required class="w-full px-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-emerald-500 dark:bg-gray-700 dark:text-white" placeholder="example@email.com">
                    </div>
                    <div>
                        <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">اس�& ا��&ستخد�&</label>
                        <input type="text" id="registerUsername" required minlength="3" class="w-full px-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-emerald-500 dark:bg-gray-700 dark:text-white" placeholder="اختر اس�& �&ستخد�&">
                    </div>
                    <div>
                        <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">ْ��&ة ا��&ر��ر</label>
                        <input type="password" id="registerPassword" required minlength="8" class="w-full px-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-emerald-500 dark:bg-gray-700 dark:text-white" placeholder="8 أحرف ع��0 ا�أ��">
                    </div>
                    <div>
                        <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">تأْ�`د ْ��&ة ا��&ر��ر</label>
                        <input type="password" id="registerPasswordConfirm" required class="w-full px-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-emerald-500 dark:bg-gray-700 dark:text-white" placeholder="أعد ْتابة ْ��&ة ا��&ر��ر">
                    </div>
                    <div class="flex items-center">
                        <input type="checkbox" id="registerHalalOnly" class="w-4 h-4 text-emerald-600 rounded focus:ring-emerald-500">
                        <label for="registerHalalOnly" class="mr-2 text-sm text-gray-700 dark:text-gray-300">تفض�`� ا�استث�&ار ا�ح�ا� ف�ط</label>
                    </div>
                    <div>
                        <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">تح�&� ا��&خاطر</label>
                        <select id="registerRiskTolerance" class="w-full px-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-emerald-500 dark:bg-gray-700 dark:text-white">
                            <option value="low">�&� خفض</option>
                            <option value="medium" selected>�&ت��سط</option>
                            <option value="high">�&رتفع</option>
                        </select>
                    </div>
                    <div id="registerError" class="hidden text-red-500 text-sm"></div>
                    <button type="submit" class="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-medium py-2.5 px-4 rounded-lg transition-colors">
                        إ� شاء ا�حساب
                    </button>
                </form>
            </div>
        </div>
    `;
    document.body.appendChild(modal);
    authModal = modal;
    
    // إضافة �&ست�&ع�` ا�� �&اذج
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
            errorEl.textContent = 'تسج�`� ا�دخ��� عبر Google غ�`ر �&تاح حا��`ا�9';
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
            errorEl.textContent = 'فش� تح�&�`� خد�&ة Google. تح�� �&�  ا�اتصا� با�إ� تر� ت';
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
        console.error('خطأ ف�` ت�!�`ئة Google Auth:', error);
        errorEl.textContent = 'تعذر ت�!�`ئة تسج�`� ا�دخ��� عبر Google';
        errorEl.classList.remove('hidden');
    }
}

async function handleGoogleCredentialResponse(googleResponse) {
    const errorEl = document.getElementById('loginError');
    try {
        if (errorEl) errorEl.classList.add('hidden');
        const credential = googleResponse?.credential;
        if (!credential) {
            throw new Error('��& �`ت�& است�ا�& ر�&ز Google');
        }

        const response = await apiService.loginWithGoogle({
            id_token: credential
        });

        if (response?.api_key && response?.user) {
            await completeAuthentication(response, 'ت�& تسج�`� ا�دخ��� عبر Google ب� جاح');
        }
    } catch (error) {
        if (errorEl) {
            errorEl.textContent = error.message || 'فش� تسج�`� ا�دخ��� عبر Google';
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
    // ا�بحث ع�  �&ْا�  إضافة ا��ائ�&ة ا��&� سد�ة
    const headerRight = document.querySelector('header .flex.items-center.gap-4');
    if (!headerRight) return;
    
    const dropdown = document.createElement('div');
    dropdown.id = 'userDropdownContainer';
    dropdown.className = 'relative';
    dropdown.innerHTML = `
        <!-- زائر -->
        <div id="guestActions" class="flex items-center gap-2">
            <button onclick="openAuthModal('login')" class="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors">
                تسج�`� ا�دخ���
            </button>
            <button onclick="openAuthModal('register')" class="px-4 py-2 text-sm font-medium bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg transition-colors">
                إ� شاء حساب
            </button>
        </div>
        
        <!-- �&ستخد�& �&سج� -->
        <div id="userActions" class="hidden relative">
            <button onclick="toggleUserMenu()" class="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
                <div class="w-8 h-8 bg-emerald-600 rounded-full flex items-center justify-center">
                    <span id="userInitial" class="text-white font-medium text-sm">U</span>
                </div>
                <span id="userDisplayName" class="text-sm font-medium text-gray-700 dark:text-gray-300 hidden sm:block">ا��&ستخد�&</span>
                <svg class="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"/>
                </svg>
            </button>
            
            <!-- ا��ائ�&ة ا��&� سد�ة -->
            <div id="userMenu" class="hidden absolute left-0 mt-2 w-56 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 py-2 z-50">
                <div class="px-4 py-2 border-b border-gray-200 dark:border-gray-700">
                    <p id="menuUserEmail" class="text-sm text-gray-600 dark:text-gray-400 truncate">user@email.com</p>
                </div>
                <a href="#" onclick="navigateToPage('watchlist'); return false;" class="flex items-center gap-3 px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700">
                    <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/>
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"/>
                    </svg>
                    �ائ�&ة ا��&را�بة
                </a>
                <a href="#" onclick="navigateToPage('portfolio'); return false;" class="flex items-center gap-3 px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700">
                    <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"/>
                    </svg>
                    �&حفظت�`
                </a>
                <a href="#" onclick="navigateToPage('income-expense'); return false;" class="flex items-center gap-3 px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700">
                    <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z"/>
                    </svg>
                    ا�دخ� ��ا��&صر��فات
                </a>
                <a href="#" onclick="navigateToPage('alerts'); return false;" class="flex items-center gap-3 px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700">
                    <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"/>
                    </svg>
                    ا�ت� ب�`�!ات ا��&جد���ة
                </a>
                <div class="border-t border-gray-200 dark:border-gray-700 my-2"></div>
                <a href="#" onclick="navigateToPage('settings'); return false;" class="flex items-center gap-3 px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700">
                    <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"/>
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/>
                    </svg>
                    ا�إعدادات
                </a>
                <button onclick="handleLogout()" class="w-full flex items-center gap-3 px-4 py-2 text-sm text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20">
                    <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"/>
                    </svg>
                    تسج�`� ا�خر��ج
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

// ==================== �&عا�جات ا�أحداث ====================

function setupEventListeners() {
    // إغ�ا� ا��ائ�&ة ع� د ا�� �ر خارج�!ا
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
            await completeAuthentication(response, 'ت�& تسج�`� ا�دخ��� ب� جاح');
        }
    } catch (error) {
        errorEl.textContent = error.message || 'فش� تسج�`� ا�دخ���. تح�� �&�  ب�`ا� اتْ';
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
        errorEl.textContent = 'ْ��&تا ا��&ر��ر غ�`ر �&تطاب�ت�`� ';
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
            await completeAuthentication(response, 'ت�& إ� شاء ا�حساب ب� جاح');
        }
    } catch (error) {
        errorEl.textContent = error.message || 'فش� إ� شاء ا�حساب';
        errorEl.classList.remove('hidden');
    }
}

async function handleLogout() {
    try {
        await apiService.logout();
    } catch (error) {
        console.error('خطأ ف�` تسج�`� ا�خر��ج:', error);
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
    showNotification('ت�& تسج�`� ا�خر��ج', 'info');
    
    // ا�ع��دة ��صفحة ا�رئ�`س�`ة
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
        console.error('خطأ ف�` تح�&�`� ب�`ا� ات ا��&ستخد�&:', error);
    }
}

// ==================== �ائ�&ة ا��&را�بة ====================

async function loadWatchlist() {
    try {
        userState.watchlist = await apiService.getWatchlist();
        return userState.watchlist;
    } catch (error) {
        console.error('خطأ ف�` تح�&�`� �ائ�&ة ا��&را�بة:', error);
        return [];
    }
}

async function addToWatchlist(stockId, options = {}) {
    try {
        const response = await apiService.addToWatchlist({
            stock_id: stockId,
            ...options
        });
        showNotification('ت�&ت ا�إضافة إ��0 �ائ�&ة ا��&را�بة', 'success');
        await loadWatchlist();
        return response;
    } catch (error) {
        showNotification(error.message || 'فش� ا�إضافة إ��0 �ائ�&ة ا��&را�بة', 'error');
        throw error;
    }
}

async function removeFromWatchlist(itemId) {
    try {
        await apiService.removeFromWatchlist(itemId);
        showNotification('ت�&ت ا�إزا�ة �&�  �ائ�&ة ا��&را�بة', 'success');
        await loadWatchlist();
    } catch (error) {
        showNotification(error.message || 'فش� ا�إزا�ة �&�  �ائ�&ة ا��&را�بة', 'error');
        throw error;
    }
}

// ==================== ا�أص��� ====================

async function loadAssets() {
    try {
        userState.assets = await apiService.getUserAssets();
        return userState.assets;
    } catch (error) {
        console.error('خطأ ف�` تح�&�`� ا�أص���:', error);
        return [];
    }
}

async function createAsset(assetData) {
    try {
        const response = await apiService.createUserAsset(assetData);
        showNotification('ت�&ت إضافة ا�أص� ب� جاح', 'success');
        await loadAssets();
        return response;
    } catch (error) {
        showNotification(error.message || 'فش� إضافة ا�أص�', 'error');
        throw error;
    }
}

async function updateAsset(assetId, assetData) {
    try {
        const response = await apiService.updateUserAsset(assetId, assetData);
        showNotification('ت�& تحد�`ث ا�أص� ب� جاح', 'success');
        await loadAssets();
        return response;
    } catch (error) {
        showNotification(error.message || 'فش� تحد�`ث ا�أص�', 'error');
        throw error;
    }
}

async function deleteAsset(assetId) {
    try {
        await apiService.deleteUserAsset(assetId);
        showNotification('ت�& حذف ا�أص� ب� جاح', 'success');
        await loadAssets();
    } catch (error) {
        showNotification(error.message || 'فش� حذف ا�أص�', 'error');
        throw error;
    }
}

// ==================== ا�دخ� ��ا��&صر��فات ====================

async function loadIncomeExpenses(params = {}) {
    try {
        userState.incomeExpenses = await apiService.getIncomeExpenses(params);
        return userState.incomeExpenses;
    } catch (error) {
        console.error('خطأ ف�` تح�&�`� ا��&عا�&�ات:', error);
        return [];
    }
}

async function createIncomeExpense(data) {
    try {
        const response = await apiService.createIncomeExpense(data);
        showNotification('ت�&ت إضافة ا��&عا�&�ة ب� جاح', 'success');
        await loadIncomeExpenses();
        return response;
    } catch (error) {
        showNotification(error.message || 'فش� إضافة ا��&عا�&�ة', 'error');
        throw error;
    }
}

async function deleteIncomeExpense(transactionId) {
    try {
        await apiService.deleteIncomeExpense(transactionId);
        showNotification('ت�& حذف ا��&عا�&�ة ب� جاح', 'success');
        await loadIncomeExpenses();
    } catch (error) {
        showNotification(error.message || 'فش� حذف ا��&عا�&�ة', 'error');
        throw error;
    }
}

// ==================== ا��&�خص ا��&ا��` ====================

async function loadFinancialSummary() {
    try {
        userState.financialSummary = await apiService.getFinancialSummary();
        return userState.financialSummary;
    } catch (error) {
        console.error('خطأ ف�` تح�&�`� ا��&�خص ا��&ا��`:', error);
        return null;
    }
}

// ==================== ا�ت� ب�`�!ات ا��&جد���ة ====================

async function loadScheduledAdvices() {
    try {
        userState.scheduledAdvices = await apiService.getScheduledAdvices();
        return userState.scheduledAdvices;
    } catch (error) {
        console.error('خطأ ف�` تح�&�`� ا�ت� ب�`�!ات:', error);
        return [];
    }
}

async function createScheduledAdvice(data) {
    try {
        const response = await apiService.createScheduledAdvice(data);
        showNotification('ت�& إ� شاء ا�ت� ب�`�! ب� جاح', 'success');
        await loadScheduledAdvices();
        return response;
    } catch (error) {
        showNotification(error.message || 'فش� إ� شاء ا�ت� ب�`�!', 'error');
        throw error;
    }
}

async function deleteScheduledAdvice(adviceId) {
    try {
        await apiService.deleteScheduledAdvice(adviceId);
        showNotification('ت�& حذف ا�ت� ب�`�! ب� جاح', 'success');
        await loadScheduledAdvices();
    } catch (error) {
        showNotification(error.message || 'فش� حذف ا�ت� ب�`�!', 'error');
        throw error;
    }
}

// ==================== إعدادات ا��&ستخد�& ====================

async function loadUserSettings() {
    try {
        userState.settings = await apiService.getUserSettings();
        return userState.settings;
    } catch (error) {
        console.error('خطأ ف�` تح�&�`� ا�إعدادات:', error);
        return null;
    }
}

async function updateUserSettings(data) {
    try {
        const response = await apiService.updateUserSettings(data);
        showNotification('ت�& تحد�`ث ا�إعدادات ب� جاح', 'success');
        await loadUserSettings();
        return response;
    } catch (error) {
        showNotification(error.message || 'فش� تحد�`ث ا�إعدادات', 'error');
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

// ==================== ��ظائف عا�&ة ====================

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
        modalTitle.textContent = 'تسج�`� ا�دخ���';
    } else {
        registerTab.classList.add('bg-white', 'dark:bg-gray-600', 'text-emerald-600', 'dark:text-emerald-400', 'shadow');
        registerTab.classList.remove('text-gray-600', 'dark:text-gray-300');
        loginTab.classList.remove('bg-white', 'dark:bg-gray-600', 'text-emerald-600', 'dark:text-emerald-400', 'shadow');
        loginTab.classList.add('text-gray-600', 'dark:text-gray-300');
        registerForm.classList.remove('hidden');
        loginForm.classList.add('hidden');
        if (googleAuthSection) googleAuthSection.classList.add('hidden');
        if (authDivider) authDivider.classList.add('hidden');
        modalTitle.textContent = 'إ� شاء حساب';
    }
};

window.toggleUserMenu = function() {
    const menu = document.getElementById('userMenu');
    if (menu) {
        menu.classList.toggle('hidden');
    }
};

// تصد�`ر ا���ظائف ��ا�ب�`ا� ات
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

