/**
 * وحدة مكونات واجهة المستخدم
 * مكونات واجهة مستخدم قابلة لإعادة الاستخدام باستخدام Tailwind CSS
 */

/**
 * إنشاء عنصر بطاقة إحصائية
 * @param {Object} config - تكوين البطاقة
 * @returns {string} نص HTML
 */
export function createStatCard(config) {
    const { title, value, icon, iconColor, change, changeType } = config;

    const iconColors = {
        primary: 'bg-blue-100 text-blue-600',
        success: 'bg-green-100 text-green-600',
        warning: 'bg-yellow-100 text-yellow-600',
        danger: 'bg-red-100 text-red-600',
    };

    const changeColors = {
        positive: 'text-green-600',
        negative: 'text-red-600',
        neutral: 'text-gray-500',
    };

    return `
        <div class="bg-white rounded-xl p-6 shadow-sm border border-gray-200 flex items-start gap-4">
            <div class="w-12 h-12 rounded-lg flex items-center justify-center text-xl ${iconColors[iconColor] || iconColors.primary}">
                <i class="fas ${icon}"></i>
            </div>
            <div>
                <h4 class="text-sm font-medium text-gray-500 mb-1">${title}</h4>
                <div class="text-2xl font-semibold text-gray-900">${value}</div>
                ${change ? `<div class="text-sm mt-1 ${changeColors[changeType] || changeColors.neutral}">${change}</div>` : ''}
            </div>
        </div>
    `;
}

/**
 * إنشاء عنصر شارة
 * @param {string} text - نص الشارة
 * @param {string} type - نوع الشارة (halal, haram, doubtful, primary, secondary)
 * @returns {string} نص HTML
 */
export function createBadge(text, type = 'secondary') {
    const styles = {
        halal: 'bg-green-100 text-green-700',
        haram: 'bg-red-100 text-red-700',
        doubtful: 'bg-yellow-100 text-yellow-700',
        primary: 'bg-blue-100 text-blue-700',
        secondary: 'bg-gray-100 text-gray-700',
    };

    return `<span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${styles[type] || styles.secondary}">${text}</span>`;
}

/**
 * إنشاء مؤشر تحميل
 * @returns {string} نص HTML
 */
export function createLoadingSpinner() {
    return `
        <div class="flex items-center justify-center py-12">
            <div class="w-10 h-10 border-4 border-gray-200 border-t-blue-600 rounded-full animate-spin"></div>
        </div>
    `;
}

/**
 * إنشاء حالة فارغة
 * @param {Object} config - تكوين الحالة الفارغة
 * @returns {string} نص HTML
 */
export function createEmptyState(config) {
    const { icon, title, message } = config;
    return `
        <div class="text-center py-12">
            <i class="fas ${icon} text-5xl text-gray-300 mb-4"></i>
            <h3 class="text-lg font-medium text-gray-600 mb-2">${title}</h3>
            <p class="text-gray-400">${message}</p>
        </div>
    `;
}

/**
 * إنشاء رسالة تنبيه
 * @param {Object} config - تكوين التنبيه
 * @returns {string} نص HTML
 */
export function createAlert(config) {
    const { type, title, message } = config;

    const styles = {
        info: 'bg-blue-50 border-blue-200 text-blue-700',
        success: 'bg-green-50 border-green-200 text-green-700',
        warning: 'bg-yellow-50 border-yellow-200 text-yellow-700',
        danger: 'bg-red-50 border-red-200 text-red-700',
    };

    const icons = {
        info: 'fa-info-circle',
        success: 'fa-check-circle',
        warning: 'fa-exclamation-triangle',
        danger: 'fa-times-circle',
    };

    return `
        <div class="flex items-start gap-3 p-4 rounded-lg border ${styles[type] || styles.info}">
            <i class="fas ${icons[type] || icons.info} mt-0.5"></i>
            <div>
                ${title ? `<strong class="block">${title}</strong>` : ''}
                <p class="text-sm">${message}</p>
            </div>
        </div>
    `;
}

/**
 * إنشاء صف جدول للأسهم
 * @param {Object} stock - بيانات السهم
 * @returns {string} نص HTML
 */
export function createStockTableRow(stock) {
    const priceChange = stock.price_change || (stock.current_price && stock.previous_close
        ? stock.current_price - stock.previous_close
        : 0);
    const changePercent = stock.previous_close
        ? ((priceChange / stock.previous_close) * 100).toFixed(2)
        : '0.00';

    const changeClass = priceChange >= 0 ? 'text-green-600' : 'text-red-600';
    const changeIcon = priceChange >= 0 ? 'fa-arrow-up' : 'fa-arrow-down';

    const complianceBadge = createBadge(
        getComplianceText(stock.compliance_status),
        stock.compliance_status?.toLowerCase() || 'secondary'
    );

    return `
        <tr class="hover:bg-gray-50 cursor-pointer" onclick="window.showStockDetail('${stock.ticker}')">
            <td class="px-4 py-3 font-medium text-blue-600">${stock.ticker}</td>
            <td class="px-4 py-3 text-gray-900">${stock.name_ar || stock.name || '-'}</td>
            <td class="px-4 py-3 font-medium">${stock.current_price ? `${stock.current_price.toFixed(2)} جنيه` : '-'}</td>
            <td class="px-4 py-3 ${changeClass}">
                <i class="fas ${changeIcon} text-xs ml-1"></i>
                ${Math.abs(changePercent)}%
            </td>
            <td class="px-4 py-3 text-gray-500">${stock.sector || '-'}</td>
            <td class="px-4 py-3">${complianceBadge}</td>
            <td class="px-4 py-3">
                <button class="text-blue-600 hover:text-blue-800 text-sm font-medium">
                    عرض التفاصيل
                </button>
            </td>
        </tr>
    `;
}

/**
 * إنشاء بطاقة توصية
 * @param {Object} recommendation - بيانات التوصية
 * @param {number} capital - رأس المال
 * @returns {string} نص HTML
 */
export function createRecommendationCard(recommendation, capital) {
    const allocationPercent = Number(
        recommendation.allocation_percent ?? recommendation.allocation ?? 0
    );
    const amount = recommendation.allocation_amount !== undefined
        ? Number(recommendation.allocation_amount)
        : ((allocationPercent / 100) * Number(capital || 0));

    return `
        <div class="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:border-blue-500 hover:shadow-md transition-all cursor-pointer">
            <div>
                <h4 class="font-semibold text-gray-900">${recommendation.ticker}</h4>
                <p class="text-sm text-gray-500">${recommendation.name || recommendation.sector || 'غير محدد'}</p>
                ${recommendation.score !== undefined ? `<p class="text-xs text-gray-400 mt-1">درجة التحليل: ${Number(recommendation.score).toFixed(1)}</p>` : ''}
            </div>
            <div class="text-left">
                <div class="text-xl font-semibold text-blue-600">${allocationPercent.toFixed(1)}%</div>
                <div class="text-sm text-gray-500">${Number(amount || 0).toFixed(0)} جنيه</div>
            </div>
        </div>
    `;
}

/**
 * إنشاء بطاقة مؤشر سوقي
 * @param {Object} index - بيانات المؤشر
 * @returns {string} نص HTML
 */
export function createIndexCard(index) {
    const changeClass = index.change >= 0 ? 'text-green-600' : 'text-red-600';
    const changeIcon = index.change >= 0 ? 'fa-arrow-up' : 'fa-arrow-down';

    const indexNames = {
        'EGX30': 'مؤشر EGX 30',
        'EGX70': 'مؤشر EGX 70',
        'EGX33': 'مؤشر EGX 33 الشرعي'
    };

    return `
        <div class="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
            <div class="flex items-center justify-between mb-4">
                <div>
                    <h4 class="font-semibold text-gray-900">${index.symbol}</h4>
                    <p class="text-sm text-gray-500">${indexNames[index.symbol] || index.name}</p>
                </div>
                ${index.is_shariah ? createBadge('شرعي', 'halal') : ''}
            </div>
            <div class="text-2xl font-semibold text-gray-900 mb-2">
                ${index.current_value ? index.current_value.toFixed(2) : '-'}
            </div>
            <div class="${changeClass} text-sm">
                <i class="fas ${changeIcon} text-xs ml-1"></i>
                ${index.change_percent ? Math.abs(index.change_percent).toFixed(2) : '0.00'}%
            </div>
        </div>
    `;
}

/**
 * تنسيق رقم مع فواصل
 * @param {number} num - الرقم المراد تنسيقه
 * @returns {string} الرقم المنسق
 */
export function formatNumber(num, decimals) {
    if (num === null || num === undefined || num === '') return '-';
    const n = Number(num);
    if (isNaN(n) || (!n && num !== 0)) return '-';
    if (decimals !== undefined) {
        return n.toLocaleString('en-US', { minimumFractionDigits: decimals, maximumFractionDigits: decimals });
    }
    const parts = n.toString().split('.');
    parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ',');
    return parts.join('.');
}

/**
 * تنسيق العملة
 * @param {number} amount - المبلغ المراد تنسيقه
 * @param {string} currency - رمز العملة
 * @returns {string} العملة المنسقة
 */
export function formatCurrency(amount, currency = 'جنيه') {
    if (!amount) return '-';
    return `${amount.toFixed(2)} ${currency}`;
}

/**
 * تنسيق التاريخ
 * @param {string|Date} date - التاريخ المراد تنسيقه
 * @returns {string} التاريخ المنسق
 */
export function formatDate(date) {
    if (!date) return '-';
    const d = new Date(date);
    return d.toLocaleDateString('ar-EG', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
    });
}

/**
 * الحصول على نص الامتثال
 * @param {string} status - حالة الامتثال
 * @returns {string} نص الامتثال
 */
function getComplianceText(status) {
    const texts = {
        'halal': 'حلال',
        'haram': 'حرام',
        'doubtful': 'مشكوك',
        'controversial': 'مشكوك',
        'unknown': 'غير معروف'
    };
    return texts[status?.toLowerCase()] || 'غير معروف';
}
