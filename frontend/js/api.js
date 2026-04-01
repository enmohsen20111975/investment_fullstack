/**
 * API Service Module
 * Handles all communication with the EGX Investment API backend
 */

// Dynamically determine API base URL based on environment
const getApiBaseUrl = () => {
    // If running on localhost (development) - use the same port as the frontend
    // The backend serves both the frontend and API on the same port
    if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
        return `${window.location.protocol}//${window.location.hostname}:${window.location.port}/api`;
    }
    // Production: use the same domain with /api path
    return `${window.location.protocol}//${window.location.host}/api`;
};

const API_BASE_URL = getApiBaseUrl();

class ApiService {
    constructor() {
        // Get API key from localStorage only - no default key exposed
        try {
            this.apiKey = localStorage.getItem('api_key') || null;
        } catch (e) {
            console.warn('localStorage access blocked');
            this.apiKey = null;
        }
    }
    /**
     * Check if API key is configured
     * @returns {boolean} True if API key exists
     */
    hasApiKey() {
        return !!this.apiKey;
    }

    /**
     * Set the API key for authentication
     * @param {string} key - API key
     */
    setApiKey(key) {
        this.apiKey = key;
        try {
            localStorage.setItem('api_key', key);
        } catch (e) {
            console.warn('localStorage access blocked, API key not persisted');
        }
    }

    /**
     * Get the current API key
     * @returns {string} Current API key
     */
    getApiKey() {
        return this.apiKey;
    }

    resetApiKey() {
        this.apiKey = null;
        try {
            localStorage.removeItem('api_key');
        } catch (e) {
            console.warn('localStorage access blocked, API key not removed');
        }
    }

    /**
     * Make an authenticated API request
     * @param {string} endpoint - API endpoint
     * @param {Object} options - Fetch options
     * @returns {Promise<Object>} Response data
     */
    async request(endpoint, options = {}) {
        const url = `${API_BASE_URL}${endpoint}`;

        const headers = {
            'Content-Type': 'application/json',
            ...options.headers,
        };

        if (this.apiKey) {
            headers['X-API-Key'] = this.apiKey;
        }

        try {
            window.dispatchEvent(new CustomEvent('app:loading', {
                detail: { loading: true, endpoint }
            }));

            const response = await fetch(url, {
                ...options,
                headers,
            });

            if (!response.ok) {
                const error = await response.json().catch(() => ({ detail: 'Unknown error' }));
                throw new Error(error.detail?.message || error.detail || `HTTP ${response.status}`);
            }

            return await response.json();
        } catch (error) {
            console.error(`API Error [${endpoint}]:`, error);
            throw error;
        } finally {
            window.dispatchEvent(new CustomEvent('app:loading', {
                detail: { loading: false, endpoint }
            }));
        }
    }

    // ==================== AUTH ====================

    async register(data) {
        return this.request('/auth/register', {
            method: 'POST',
            body: JSON.stringify(data),
        });
    }

    async login(data) {
        return this.request('/auth/login', {
            method: 'POST',
            body: JSON.stringify(data),
        });
    }

    async getGoogleAuthConfig() {
        return this.request('/auth/google/config');
    }

    async loginWithGoogle(data) {
        return this.request('/auth/google', {
            method: 'POST',
            body: JSON.stringify(data),
        });
    }

    async getCurrentUser() {
        return this.request('/auth/me');
    }

    async logout() {
        return this.request('/auth/logout', { method: 'POST' });
    }

    // ==================== STOCKS ====================

    /**
     * Get all stocks with optional filters
     * @param {Object} params - Query parameters
     * @returns {Promise<Object>} Stocks list
     */
    async getStocks(params = {}) {
        const query = new URLSearchParams();
        if (params.query) query.append('query', params.query);
        if (params.search_field) query.append('search_field', params.search_field);
        if (params.sector) query.append('sector', params.sector);
        if (params.index) query.append('index', params.index);
        if (params.page) query.append('page', params.page);
        if (params.page_size) query.append('page_size', params.page_size);

        return this.request(`/stocks?${query.toString()}`);
    }

    /**
     * Get a single stock by ticker
     * @param {string} ticker - Stock ticker symbol
     * @returns {Promise<Object>} Stock details
     */
    async getStock(ticker) {
        return this.request(`/stocks/${ticker.toUpperCase()}`);
    }

    /**
     * Search stocks
     * @param {string} query - Search query
     * @param {Object} params - Additional parameters
     * @returns {Promise<Object>} Search results
     */
    async searchStocks(query, params = {}) {
        const searchParams = new URLSearchParams();
        searchParams.append('query', query);
        if (params.sector) searchParams.append('sector', params.sector);
        if (params.min_price) searchParams.append('min_price', params.min_price);
        if (params.max_price) searchParams.append('max_price', params.max_price);

        return this.request(`/stocks/search/query?${searchParams.toString()}`);
    }

    // ==================== PORTFOLIO ====================

    /**
     * Get portfolio recommendations
     * @param {Object} params - Recommendation parameters
     * @returns {Promise<Object>} Recommendations
     */
    async getRecommendations(params) {
        const query = new URLSearchParams();
        query.append('capital', params.capital);
        query.append('risk', params.risk || 'medium');
        if (params.max_stocks) query.append('max_stocks', params.max_stocks);
        if (params.sectors) query.append('sectors', params.sectors);

        return this.request(`/portfolio/recommend?${query.toString()}`);
    }

    /**
     * Get advanced portfolio recommendations
     * @param {Object} data - Recommendation request data
     * @returns {Promise<Object>} Recommendations
     */
    async getAdvancedRecommendations(data) {
        return this.request('/portfolio/recommend/advanced', {
            method: 'POST',
            body: JSON.stringify(data),
        });
    }

    // ==================== MARKET ====================

    /**
     * Get market overview
     * @returns {Promise<Object>} Market overview data
     */
    async getMarketOverview() {
        return this.request('/market/overview');
    }

    /**
     * Get market indices
     * @returns {Promise<Object>} Market indices
     */
    async getMarketIndices() {
        return this.request('/market/indices');
    }

    /**
     * Get specific market index
     * @param {string} symbol - Index symbol
     * @returns {Promise<Object>} Index details
     */
    async getMarketIndex(symbol) {
        return this.request(`/market/indices/${symbol.toUpperCase()}`);
    }

    /**
     * Get market status
     * @returns {Promise<Object>} Market status
     */
    async getMarketStatus() {
        return this.request('/market/status');
    }

    /**
     * Get last data update status from database
     * @param {string} updateType - Type of update (stocks, indices, etc.)
     * @param {number} days - Number of days of history
     * @returns {Promise<Object>} Update status
     */
    async getUpdateStatus(updateType = 'stocks', days = 7) {
        return this.request(`/market/update-status?update_type=${updateType}&days=${days}`);
    }

    /**
     * Get update history from database
     * @param {string} updateType - Type of update
     * @param {number} days - Number of days to look back
     * @returns {Promise<Object>} Update history
     */
    async getUpdateHistory(updateType = 'stocks', days = 30) {
        return this.request(`/market/update-history?update_type=${updateType}&days=${days}`);
    }

    /**
     * Check if data update is allowed based on market schedule
     * @param {boolean} force - Force update check
     * @returns {Promise<Object>} Update permission status
     */
    async checkUpdateAllowed(force = false) {
        return this.request('/market/check-update-allowed', {
            method: 'POST',
            body: JSON.stringify({ force })
        });
    }

    /**
     * Update stock data (only allowed during market hours)
     * @param {Array} stocks - Array of stock data to update
     * @param {boolean} force - Force update regardless of schedule
     * @param {string} source - Source identifier
     * @returns {Promise<Object>} Update result
     */
    async updateStockData(stocks, force = false, source = 'api') {
        return this.request('/market/update-data', {
            method: 'POST',
            body: JSON.stringify({ stocks, force, source })
        });
    }

    /**
     * Check if data needs refresh based on last update
     * @param {number} maxAgeMinutes - Maximum age in minutes
     * @returns {Promise<Object>} Refresh check result
     */
    async checkDataNeedsRefresh(maxAgeMinutes = null) {
        const query = maxAgeMinutes ? `?max_age_minutes=${maxAgeMinutes}` : '';
        return this.request(`/market/refresh-check${query}`);
    }

    // ==================== STOCK HISTORY & RECOMMENDATIONS ====================

    /**
     * Get stock price history
     * @param {string} ticker - Stock ticker symbol
     * @param {number} days - Number of days of history
     * @returns {Promise<Object>} Stock history data
     */
    async getStockHistory(ticker, days = 30) {
        return this.request(`/stocks/${ticker.toUpperCase()}/history?days=${days}`);
    }

    /**
     * Get AI-powered stock recommendation
     * @param {string} ticker - Stock ticker symbol
     * @returns {Promise<Object>} Stock recommendation with AI analysis
     */
    async getStockRecommendation(ticker) {
        return this.request(`/stocks/${ticker.toUpperCase()}/recommendation`);
    }

    // ==================== AI INSIGHTS & TRUSTED SOURCES ====================

    /**
     * Get trusted sources recommendations
     * @returns {Promise<Object>} Recommendations from trusted financial sources
     */
    async getTrustedSourcesRecommendations() {
        return this.request('/market/recommendations/trusted-sources');
    }

    /**
     * Get AI market insights
     * @returns {Promise<Object>} AI-generated market insights
     */
    async getAIMarketInsights() {
        return this.request('/market/recommendations/ai-insights');
    }

    // ==================== USER WATCHLIST ====================

    /**
     * Get user's watchlist
     * @returns {Promise<Array>} Watchlist items
     */
    async getWatchlist() {
        return this.request('/user/watchlist');
    }

    /**
     * Add stock to watchlist
     * @param {Object} data - Watchlist item data
     * @returns {Promise<Object>} Result
     */
    async addToWatchlist(data) {
        return this.request('/user/watchlist', {
            method: 'POST',
            body: JSON.stringify(data),
        });
    }

    /**
     * Update watchlist item
     * @param {number} itemId - Watchlist item ID
     * @param {Object} data - Update data
     * @returns {Promise<Object>} Result
     */
    async updateWatchlistItem(itemId, data) {
        return this.request(`/user/watchlist/${itemId}`, {
            method: 'PUT',
            body: JSON.stringify(data),
        });
    }

    /**
     * Remove from watchlist
     * @param {number} itemId - Watchlist item ID
     * @returns {Promise<Object>} Result
     */
    async removeFromWatchlist(itemId) {
        return this.request(`/user/watchlist/${itemId}`, {
            method: 'DELETE',
        });
    }

    // ==================== USER ASSETS ====================

    /**
     * Get user's assets
     * @param {string} assetType - Optional filter by type
     * @returns {Promise<Array>} User assets
     */
    async getUserAssets(assetType = null) {
        const query = assetType ? `?asset_type=${assetType}` : '';
        return this.request(`/user/assets${query}`);
    }

    /**
     * Create new asset
     * @param {Object} data - Asset data
     * @returns {Promise<Object>} Result
     */
    async createUserAsset(data) {
        return this.request('/user/assets', {
            method: 'POST',
            body: JSON.stringify(data),
        });
    }

    /**
     * Update asset
     * @param {number} assetId - Asset ID
     * @param {Object} data - Update data
     * @returns {Promise<Object>} Result
     */
    async updateUserAsset(assetId, data) {
        return this.request(`/user/assets/${assetId}`, {
            method: 'PUT',
            body: JSON.stringify(data),
        });
    }

    /**
     * Delete asset
     * @param {number} assetId - Asset ID
     * @returns {Promise<Object>} Result
     */
    async deleteUserAsset(assetId) {
        return this.request(`/user/assets/${assetId}`, {
            method: 'DELETE',
        });
    }

    /**
     * Sync asset prices with current stock prices
     * @returns {Promise<Object>} Sync result
     */
    async syncAssetPrices() {
        return this.request('/user/assets/sync-prices', {
            method: 'POST',
        });
    }

    /**
     * Get portfolio impact feed for dashboard
     * @returns {Promise<Object>} Portfolio impact summary and top movers
     */
    async getPortfolioImpact() {
        return this.request('/user/portfolio-impact');
    }

    /**
     * Get financial summary
     * @returns {Promise<Object>} Financial summary
     */
    async getFinancialSummary() {
        return this.request('/user/financial-summary');
    }

    // ==================== INCOME & EXPENSE ====================

    /**
     * Get income/expense transactions
     * @param {Object} params - Filter parameters
     * @returns {Promise<Array>} Transactions
     */
    async getIncomeExpenses(params = {}) {
        const query = new URLSearchParams();
        if (params.transaction_type) query.append('transaction_type', params.transaction_type);
        if (params.category) query.append('category', params.category);
        if (params.start_date) query.append('start_date', params.start_date);
        if (params.end_date) query.append('end_date', params.end_date);
        return this.request(`/user/income-expense?${query.toString()}`);
    }

    /**
     * Create income/expense transaction
     * @param {Object} data - Transaction data
     * @returns {Promise<Object>} Result
     */
    async createIncomeExpense(data) {
        return this.request('/user/income-expense', {
            method: 'POST',
            body: JSON.stringify(data),
        });
    }

    /**
     * Update income/expense transaction
     * @param {number} transactionId - Transaction ID
     * @param {Object} data - Update data
     * @returns {Promise<Object>} Result
     */
    async updateIncomeExpense(transactionId, data) {
        return this.request(`/user/income-expense/${transactionId}`, {
            method: 'PUT',
            body: JSON.stringify(data),
        });
    }

    /**
     * Delete income/expense transaction
     * @param {number} transactionId - Transaction ID
     * @returns {Promise<Object>} Result
     */
    async deleteIncomeExpense(transactionId) {
        return this.request(`/user/income-expense/${transactionId}`, {
            method: 'DELETE',
        });
    }

    // ==================== PORTFOLIO SHARING ====================

    /**
     * Share portfolio
     * @param {Object} data - Share settings
     * @returns {Promise<Object>} Share result with share code
     */
    async sharePortfolio(data) {
        return this.request('/user/share-portfolio', {
            method: 'POST',
            body: JSON.stringify(data),
        });
    }

    /**
     * Get shared portfolio by code
     * @param {string} shareCode - Share code
     * @param {string} password - Optional password
     * @returns {Promise<Object>} Shared portfolio data
     */
    async getSharedPortfolio(shareCode, password = null) {
        const headers = password ? { 'X-Share-Password': password } : {};
        return this.request(`/user/shared-portfolio/${shareCode}`, { headers });
    }

    /**
     * Get user's shared portfolios
     * @returns {Promise<Array>} Shared portfolios list
     */
    async getMySharedPortfolios() {
        return this.request('/user/my-shares');
    }

    /**
     * Revoke shared portfolio
     * @param {number} shareId - Share ID
     * @returns {Promise<Object>} Result
     */
    async revokeSharedPortfolio(shareId) {
        return this.request(`/user/share/${shareId}`, {
            method: 'DELETE',
        });
    }

    // ==================== SCHEDULED ADVICE ====================

    /**
     * Get scheduled advices
     * @returns {Promise<Array>} Scheduled advices
     */
    async getScheduledAdvices() {
        return this.request('/user/scheduled-advice');
    }

    /**
     * Create scheduled advice
     * @param {Object} data - Advice data
     * @returns {Promise<Object>} Result
     */
    async createScheduledAdvice(data) {
        return this.request('/user/scheduled-advice', {
            method: 'POST',
            body: JSON.stringify(data),
        });
    }

    /**
     * Update scheduled advice
     * @param {number} adviceId - Advice ID
     * @param {Object} data - Update data
     * @returns {Promise<Object>} Result
     */
    async updateScheduledAdvice(adviceId, data) {
        return this.request(`/user/scheduled-advice/${adviceId}`, {
            method: 'PUT',
            body: JSON.stringify(data),
        });
    }

    /**
     * Delete scheduled advice
     * @param {number} adviceId - Advice ID
     * @returns {Promise<Object>} Result
     */
    async deleteScheduledAdvice(adviceId) {
        return this.request(`/user/scheduled-advice/${adviceId}`, {
            method: 'DELETE',
        });
    }

    // ==================== LEARNING PROGRESS ====================

    /**
     * Get learning progress
     * @returns {Promise<Object>} Learning progress data
     */
    async getLearningProgress() {
        return this.request('/user/learning-progress');
    }

    /**
     * Update learning progress
     * @param {Object} data - Progress data
     * @returns {Promise<Object>} Result
     */
    async updateLearningProgress(data) {
        return this.request('/user/learning-progress', {
            method: 'PUT',
            body: JSON.stringify(data),
        });
    }

    // ==================== USER SETTINGS ====================

    /**
     * Get user settings
     * @returns {Promise<Object>} User settings
     */
    async getUserSettings() {
        return this.request('/user/settings');
    }

    /**
     * Update user settings
     * @param {Object} data - Settings data
     * @returns {Promise<Object>} Result
     */
    async updateUserSettings(data) {
        return this.request('/user/settings', {
            method: 'PUT',
            body: JSON.stringify(data),
        });
    }

    // ==================== HEALTH ====================

    /**
     * Check API health
     * @returns {Promise<Object>} Health status
     */
    async checkHealth() {
        const healthUrl = `${API_BASE_URL}/health`;
        const response = await fetch(healthUrl);
        return response.json();
    }

    // ==================== NEWS ====================

    /**
     * Get all investment news (gold, silver, global)
     * @param {number} limit - Number of news items per category
     * @returns {Promise<Object>} All news categories
     */
    async getAllNews(limit = 5) {
        return this.request(`/news/all?limit=${limit}`);
    }

    /**
     * Get gold investment news
     * @param {number} limit - Number of news items
     * @returns {Promise<Object>} Gold news and price
     */
    async getGoldNews(limit = 10) {
        return this.request(`/news/gold?limit=${limit}`);
    }

    /**
     * Get silver investment news
     * @param {number} limit - Number of news items
     * @returns {Promise<Object>} Silver news and price
     */
    async getSilverNews(limit = 10) {
        return this.request(`/news/silver?limit=${limit}`);
    }

    /**
     * Get global investment news
     * @param {number} limit - Number of news items
     * @returns {Promise<Object>} Global investment news
     */
    async getGlobalNews(limit = 10) {
        return this.request(`/news/global?limit=${limit}`);
    }

    /**
     * Get commodity prices (gold and silver)
     * @returns {Promise<Object>} Commodity prices
     */
    async getCommodityPrices() {
        return this.request('/news/commodities/prices');
    }

    /**
     * Get global market indices
     * @returns {Promise<Array>} Market indices data
     */
    async getMarketIndices() {
        return this.request('/news/market-indices');
    }

    /**
     * Get EGX indices with component stocks
     * @param {string} index - Specific index (EGX30, EGX70, EGX100)
     * @returns {Promise<Object>} EGX indices data
     */
    async getEGXIndices(index = null) {
        const url = index ? `/news/egx-indices?index=${index}` : '/news/egx-indices';
        return this.request(url);
    }
}

// Export singleton instance
const apiService = new ApiService();
export default apiService;
