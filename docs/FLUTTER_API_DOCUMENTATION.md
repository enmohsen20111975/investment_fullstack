# EGX Investment API Documentation for Flutter

## Base URLs

| Environment | Base URL |
|-------------|----------|
| **Local Development** | `http://localhost:8010/api` |
| **Production** | `https://your-domain.com/api` (replace with your online URL) |

## Authentication

All API endpoints require an API key in the request header:

```
X-API-Key: your_api_key_here
```

**Default API Key (for development):**
```
2a04bb8e3a549176ed4b52f0ea632fc463de859581d8e2adbc1298cc1783548e
```

## Data Policy (Important)

- This backend is configured for **real data only**.
- No mock/fake/simulated prices, history, analyst consensus, or news should be used.
- If real data is unavailable from configured providers, endpoints may return explicit unavailability errors.

---

## API Endpoints Overview

### 1. Health & System

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/health` | Health check (no auth required) |
| GET | `/api` | API info and available endpoints |

---

### 2. Stocks Endpoints (`/api/stocks`)

#### 2.1 Get Stock by Ticker
```
GET /api/stocks/{ticker}
```

**Parameters:**
| Name | Type | Required | Description |
|------|------|----------|-------------|
| ticker | string | Yes | Stock ticker symbol (e.g., ETEL, ABUK, COMI) |

**Example Request:**
```http
GET http://localhost:8010/api/stocks/ETEL
X-API-Key: 2a04bb8e3a549176ed4b52f0ea632fc463de859581d8e2adbc1298cc1783548e
```

**Response:**
```json
{
  "success": true,
  "message": "Stock data retrieved successfully for ETEL",
  "data": {
    "id": 1,
    "ticker": "ETEL",
    "name": "Telecom Egypt",
    "name_ar": "الاتصالات المصرية",
    "current_price": 25.50,
    "previous_close": 25.00,
    "price_change": 0.50,
    "open_price": 25.10,
    "high_price": 25.80,
    "low_price": 24.90,
    "volume": 1500000,
    "market_cap": 45000000000,
    "pe_ratio": 8.5,
    "pb_ratio": 1.2,
    "dividend_yield": 5.2,
    "eps": 3.0,
    "roe": 15.5,
    "debt_to_equity": 0.3,
    "support_level": 24.00,
    "resistance_level": 27.00,
    "ma_50": 24.50,
    "ma_200": 23.00,
    "rsi": 55.0,
    "investment_type": "stock",
    "sector": "Telecommunications",
    "industry": "Telecom Services",
    "is_halal": true,
    "compliance_status": "halal",
    "compliance_note": "Shariah compliant - EGX 33 Index",
    "is_active": true,
    "is_egx": true,
    "last_update": "2026-02-15T13:00:00"
  }
}
```

---

#### 2.2 List All Stocks
```
GET /api/stocks
```

**Query Parameters:**
| Name | Type | Required | Default | Description |
|------|------|----------|---------|-------------|
| halal_only | boolean | No | false | Filter to halal stocks only |
| sector | string | No | null | Filter by sector (partial match) |
| page | integer | No | 1 | Page number |
| page_size | integer | No | 50 | Results per page (max 100) |

**Example Request:**
```http
GET http://localhost:8010/api/stocks?halal_only=true&page=1&page_size=20
X-API-Key: 2a04bb8e3a549176ed4b52f0ea632fc463de859581d8e2adbc1298cc1783548e
```

**Response:**
```json
{
  "success": true,
  "message": "Found 20 stocks",
  "data": [
    {
      "id": 1,
      "ticker": "ETEL",
      "name": "Telecom Egypt",
      "current_price": 25.50,
      "is_halal": true,
      "compliance_status": "halal",
      ...
    }
  ],
  "total": 20,
  "page": 1,
  "page_size": 20
}
```

---

#### 2.3 Search Stocks
```
GET /api/stocks/search/query
```

**Query Parameters:**
| Name | Type | Required | Default | Description |
|------|------|----------|---------|-------------|
| query | string | Yes | - | Search term (ticker or company name) |
| halal_only | boolean | No | false | Filter to halal stocks only |
| sector | string | No | null | Filter by sector |
| min_price | float | No | null | Minimum stock price |
| max_price | float | No | null | Maximum stock price |
| page | integer | No | 1 | Page number |
| page_size | integer | No | 20 | Results per page (max 100) |

**Example Request:**
```http
GET http://localhost:8010/api/stocks/search/query?query=telecom&halal_only=true
X-API-Key: 2a04bb8e3a549176ed4b52f0ea632fc463de859581d8e2adbc1298cc1783548e
```

**Response:**
```json
{
  "success": true,
  "message": "Found 2 stocks matching 'telecom'",
  "query": "telecom",
  "results": [
    {
      "ticker": "ETEL",
      "name": "Telecom Egypt",
      "current_price": 25.50,
      "sector": "Telecommunications",
      "compliance_status": "halal",
      "compliance_note": "Shariah compliant",
      "relevance_score": 1.0
    }
  ],
  "total": 2,
  "page": 1,
  "page_size": 20,
  "has_more": false
}
```

---

### 3. Market Endpoints (`/api/market`)

#### 3.1 Get Market Overview
```
GET /api/market/overview
```

**Example Request:**
```http
GET http://localhost:8010/api/market/overview
X-API-Key: 2a04bb8e3a549176ed4b52f0ea632fc463de859581d8e2adbc1298cc1783548e
```

**Response:**
```json
{
  "success": true,
  "message": "Market overview retrieved successfully",
  "indices": [
    {
      "symbol": "EGX30",
      "name": "EGX 30 Index",
      "current_value": 18500.50,
      "previous_close": 18450.00,
      "change": 50.50,
      "change_percent": 0.27,
      "is_shariah": false,
      "last_update": "2026-02-15T13:00:00"
    },
    {
      "symbol": "EGX33",
      "name": "EGX 33 Shariah Compliant Index",
      "current_value": 4200.00,
      "previous_close": 4180.00,
      "change": 20.00,
      "change_percent": 0.48,
      "is_shariah": true,
      "last_update": "2026-02-15T13:00:00"
    }
  ],
  "top_gainers": [...],
  "top_losers": [...],
  "most_active": [...],
  "last_update": "2026-02-15T13:00:00"
}
```

---

#### 3.2 Get Market Indices
```
GET /api/market/indices
```

**Example Request:**
```http
GET http://localhost:8010/api/market/indices
X-API-Key: 2a04bb8e3a549176ed4b52f0ea632fc463de859581d8e2adbc1298cc1783548e
```

**Response:**
```json
{
  "success": true,
  "message": "Found 3 market indices",
  "indices": [
    {
      "symbol": "EGX30",
      "name": "EGX 30 Index",
      "current_value": 18500.50,
      "previous_close": 18450.00,
      "change": 50.50,
      "change_percent": 0.27,
      "is_shariah": false,
      "last_update": "2026-02-15T13:00:00"
    }
  ]
}
```

---

#### 3.3 Get Specific Market Index
```
GET /api/market/indices/{symbol}
```

**Parameters:**
| Name | Type | Required | Description |
|------|------|----------|-------------|
| symbol | string | Yes | Index symbol (EGX30, EGX70, EGX33) |

**Example Request:**
```http
GET http://localhost:8010/api/market/indices/EGX33
X-API-Key: 2a04bb8e3a549176ed4b52f0ea632fc463de859581d8e2adbc1298cc1783548e
```

---

#### 3.4 Get Market Status
```
GET /api/market/status
```

**Example Request:**
```http
GET http://localhost:8010/api/market/status
X-API-Key: 2a04bb8e3a549176ed4b52f0ea632fc463de859581d8e2adbc1298cc1783548e
```

**Response:**
```json
{
  "success": true,
  "is_open": true,
  "current_time_cairo": "2026-02-15 13:00:00 EET",
  "trading_hours": "10:00 AM - 2:30 PM Cairo time",
  "trading_days": "Sunday - Thursday",
  "message": "Market is open. Closes at 14:30 Cairo time."
}
```

---

### 4. Portfolio Endpoints (`/api/portfolio`)

#### 4.1 Get Portfolio Recommendations
```
GET /api/portfolio/recommend
```

**Query Parameters:**
| Name | Type | Required | Default | Description |
|------|------|----------|---------|-------------|
| capital | float | Yes | - | Investment capital amount (EGP) |
| risk | string | No | "medium" | Risk tolerance: "low", "medium", "high" |
| halal_only | boolean | No | false | Filter to halal investments only |
| max_stocks | integer | No | 10 | Maximum stocks in portfolio (1-20) |
| sectors | string | No | null | Comma-separated preferred sectors |

**Example Request:**
```http
GET http://localhost:8010/api/portfolio/recommend?capital=100000&risk=medium&halal_only=true&max_stocks=5
X-API-Key: 2a04bb8e3a549176ed4b52f0ea632fc463de859581d8e2adbc1298cc1783548e
```

**Response:**
```json
{
  "success": true,
  "message": "Generated 5 stock recommendations for 100000.0 EGP capital",
  "capital": 100000.0,
  "risk": "medium",
  "halal_only": true,
  "recommendations": [
    {
      "ticker": "ETEL",
      "name": "Telecom Egypt",
      "current_price": 25.50,
      "allocation_percent": 25.0,
      "allocation_amount": 25000.0,
      "shares": 980,
      "sector": "Telecommunications",
      "is_halal": true,
      "compliance_note": "Shariah compliant - EGX 33 Index",
      "recommendation_reason": "Strong fundamentals, low debt, consistent dividends"
    }
  ],
  "total_allocation": 100.0,
  "expected_annual_return": 15.0,
  "risk_assessment": {
    "level": "medium",
    "diversification_score": 0.75,
    "sector_concentration": "Well diversified"
  }
}
```

---

#### 4.2 Advanced Portfolio Recommendations (POST)
```
POST /api/portfolio/recommend/advanced
```

**Request Body:**
```json
{
  "capital": 100000.0,
  "risk": "medium",
  "halal_only": true,
  "max_stocks": 10,
  "sectors": ["Telecommunications", "Healthcare", "Industrials"]
}
```

**Example Request:**
```http
POST http://localhost:8010/api/portfolio/recommend/advanced
X-API-Key: 2a04bb8e3a549176ed4b52f0ea632fc463de859581d8e2adbc1298cc1783548e
Content-Type: application/json

{
  "capital": 100000,
  "risk": "medium",
  "halal_only": true,
  "max_stocks": 5
}
```

---

#### 4.3 List Halal Stocks
```
GET /api/portfolio/halal-stocks
```

**Example Request:**
```http
GET http://localhost:8010/api/portfolio/halal-stocks
X-API-Key: 2a04bb8e3a549176ed4b52f0ea632fc463de859581d8e2adbc1298cc1783548e
```

**Response:**
```json
{
  "success": true,
  "message": "Found 25 halal stocks",
  "total": 25,
  "stocks": [
    {
      "ticker": "ETEL",
      "name": "Telecom Egypt",
      "current_price": 25.50,
      "sector": "Telecommunications",
      "compliance_note": "Shariah compliant - EGX 33 Index"
    }
  ],
  "note": "These stocks are considered halal based on EGX 33 Shariah Compliant Index..."
}
```

---

#### 4.4 List Haram Stocks
```
GET /api/portfolio/haram-stocks
```

**Example Request:**
```http
GET http://localhost:8010/api/portfolio/haram-stocks
X-API-Key: 2a04bb8e3a549176ed4b52f0ea632fc463de859581d8e2adbc1298cc1783548e
```

---

## Error Responses

All endpoints return consistent error responses:

```json
{
  "detail": {
    "error": "error_code",
    "message": "Human readable error message"
  }
}
```

**Common HTTP Status Codes:**
| Code | Description |
|------|-------------|
| 200 | Success |
| 400 | Bad Request - Invalid parameters |
| 401 | Unauthorized - Invalid or missing API key |
| 404 | Not Found - Resource not found |
| 500 | Internal Server Error |

---

## Flutter Integration Example

### 1. Create API Service Class

```dart
// lib/services/api_service.dart
import 'dart:convert';
import 'package:http/http.dart' as http;

class ApiService {
  // Change this for production
  static const String baseUrl = 'http://localhost:8010/api';
  // static const String baseUrl = 'https://your-domain.com/api';
  
  static const String apiKey = '2a04bb8e3a549176ed4b52f0ea632fc463de859581d8e2adbc1298cc1783548e';
  
  Map<String, String> get _headers => {
    'X-API-Key': apiKey,
    'Content-Type': 'application/json',
  };

  // Get stock by ticker
  Future<Map<String, dynamic>> getStock(String ticker) async {
    final response = await http.get(
      Uri.parse('$baseUrl/stocks/$ticker'),
      headers: _headers,
    );
    
    if (response.statusCode == 200) {
      return json.decode(response.body);
    }
    throw Exception('Failed to load stock: ${response.body}');
  }

  // List all stocks
  Future<Map<String, dynamic>> listStocks({
    bool halalOnly = false,
    String? sector,
    int page = 1,
    int pageSize = 50,
  }) async {
    final queryParams = {
      'halal_only': halalOnly.toString(),
      'page': page.toString(),
      'page_size': pageSize.toString(),
      if (sector != null) 'sector': sector,
    };
    
    final response = await http.get(
      Uri.parse('$baseUrl/stocks').replace(queryParameters: queryParams),
      headers: _headers,
    );
    
    if (response.statusCode == 200) {
      return json.decode(response.body);
    }
    throw Exception('Failed to load stocks: ${response.body}');
  }

  // Search stocks
  Future<Map<String, dynamic>> searchStocks({
    required String query,
    bool halalOnly = false,
    int page = 1,
    int pageSize = 20,
  }) async {
    final queryParams = {
      'query': query,
      'halal_only': halalOnly.toString(),
      'page': page.toString(),
      'page_size': pageSize.toString(),
    };
    
    final response = await http.get(
      Uri.parse('$baseUrl/stocks/search/query').replace(queryParameters: queryParams),
      headers: _headers,
    );
    
    if (response.statusCode == 200) {
      return json.decode(response.body);
    }
    throw Exception('Failed to search stocks: ${response.body}');
  }

  // Get market overview
  Future<Map<String, dynamic>> getMarketOverview() async {
    final response = await http.get(
      Uri.parse('$baseUrl/market/overview'),
      headers: _headers,
    );
    
    if (response.statusCode == 200) {
      return json.decode(response.body);
    }
    throw Exception('Failed to load market overview: ${response.body}');
  }

  // Get market status
  Future<Map<String, dynamic>> getMarketStatus() async {
    final response = await http.get(
      Uri.parse('$baseUrl/market/status'),
      headers: _headers,
    );
    
    if (response.statusCode == 200) {
      return json.decode(response.body);
    }
    throw Exception('Failed to load market status: ${response.body}');
  }

  // Get portfolio recommendations
  Future<Map<String, dynamic>> getRecommendations({
    required double capital,
    String risk = 'medium',
    bool halalOnly = false,
    int maxStocks = 10,
    String? sectors,
  }) async {
    final queryParams = {
      'capital': capital.toString(),
      'risk': risk,
      'halal_only': halalOnly.toString(),
      'max_stocks': maxStocks.toString(),
      if (sectors != null) 'sectors': sectors,
    };
    
    final response = await http.get(
      Uri.parse('$baseUrl/portfolio/recommend').replace(queryParameters: queryParams),
      headers: _headers,
    );
    
    if (response.statusCode == 200) {
      return json.decode(response.body);
    }
    throw Exception('Failed to get recommendations: ${response.body}');
  }

  // Get halal stocks
  Future<Map<String, dynamic>> getHalalStocks() async {
    final response = await http.get(
      Uri.parse('$baseUrl/portfolio/halal-stocks'),
      headers: _headers,
    );
    
    if (response.statusCode == 200) {
      return json.decode(response.body);
    }
    throw Exception('Failed to load halal stocks: ${response.body}');
  }
}
```

### 2. Android Network Configuration

For Android, add this to `android/app/src/main/AndroidManifest.xml` to allow HTTP connections:

```xml
<application
    android:usesCleartextTraffic="true"
    ...>
    ...
</application>
```

### 3. Data Models

```dart
// lib/models/stock.dart
class Stock {
  final String ticker;
  final String name;
  final String? nameAr;
  final double? currentPrice;
  final double? previousClose;
  final double? priceChange;
  final double? volume;
  final double? marketCap;
  final String? sector;
  final bool isHalal;
  final String complianceStatus;
  final String? complianceNote;

  Stock({
    required this.ticker,
    required this.name,
    this.nameAr,
    this.currentPrice,
    this.previousClose,
    this.priceChange,
    this.volume,
    this.marketCap,
    this.sector,
    required this.isHalal,
    required this.complianceStatus,
    this.complianceNote,
  });

  factory Stock.fromJson(Map<String, dynamic> json) {
    return Stock(
      ticker: json['ticker'],
      name: json['name'],
      nameAr: json['name_ar'],
      currentPrice: json['current_price']?.toDouble(),
      previousClose: json['previous_close']?.toDouble(),
      priceChange: json['price_change']?.toDouble(),
      volume: json['volume']?.toDouble(),
      marketCap: json['market_cap']?.toDouble(),
      sector: json['sector'],
      isHalal: json['is_halal'] ?? false,
      complianceStatus: json['compliance_status'] ?? 'unknown',
      complianceNote: json['compliance_note'],
    );
  }
}
```

---

## Quick Reference Table

| Endpoint | Method | Auth | Description |
|----------|--------|------|-------------|
| `/health` | GET | No | Health check |
| `/api` | GET | No | API info |
| `/api/stocks` | GET | Yes | List all stocks |
| `/api/stocks/{ticker}` | GET | Yes | Get stock by ticker |
| `/api/stocks/{ticker}/history` | GET | Yes | Get stock price history |
| `/api/stocks/{ticker}/deep-insights` | GET | Yes | Multi-source deep stock intelligence |
| `/api/stocks/{ticker}/deep-insights/history` | GET | Yes | Read saved deep insights from DB |
| `/api/stocks/{ticker}/recommendation` | GET | Yes | Get AI stock recommendation |
| `/api/stocks/search/query` | GET | Yes | Search stocks |
| `/api/market/overview` | GET | Yes | Market overview |
| `/api/market/indices` | GET | Yes | All market indices |
| `/api/market/indices/{symbol}` | GET | Yes | Specific index |
| `/api/market/status` | GET | Yes | Market open/closed |
| `/api/market/recommendations/trusted-sources` | GET | Yes | Trusted sources recommendations |
| `/api/market/recommendations/ai-insights` | GET | Yes | AI market insights |
| `/api/portfolio/recommend` | GET | Yes | Portfolio recommendations |
| `/api/portfolio/wealth-plan` | GET | Yes | Safe money management plan |
| `/api/portfolio/recommend/advanced` | POST | Yes | Advanced recommendations |
| `/api/portfolio/halal-stocks` | GET | Yes | List halal stocks |
| `/api/portfolio/haram-stocks` | GET | Yes | List haram stocks |

---

## Wealth Management Plan

### Get Safe Money Allocation Plan
```
GET /api/portfolio/wealth-plan
```

**Query Parameters:**
| Name | Type | Required | Default | Description |
|------|------|----------|---------|-------------|
| capital | float | Yes | - | Total money to manage |
| risk | string | No | medium | low / medium / high |
| halal_only | boolean | No | false | Halal-only stock filter |
| max_stocks | integer | No | 10 | Maximum stocks to include |
| sectors | string | No | null | Comma-separated preferred sectors |

**Response (example):**
```json
{
  "success": true,
  "message": "Wealth plan generated for 100000 EGP",
  "capital": 100000,
  "risk": "medium",
  "halal_only": true,
  "asset_allocation": [
    {"asset_type": "cash", "allocation_percent": 15, "allocation_amount": 15000},
    {"asset_type": "gold", "allocation_percent": 15, "allocation_amount": 15000},
    {"asset_type": "silver", "allocation_percent": 10, "allocation_amount": 10000},
    {"asset_type": "stocks", "allocation_percent": 60, "allocation_amount": 60000}
  ],
  "stock_buckets": [
    {
      "bucket_type": "saving",
      "allocation_percent": 27,
      "allocation_amount": 27000,
      "recommendations": []
    },
    {
      "bucket_type": "growth",
      "allocation_percent": 33,
      "allocation_amount": 33000,
      "recommendations": []
    }
  ],
  "safety_rules": [
    "Keep at least 3-6 months of expenses in cash.",
    "Do not put all money in one stock or one sector."
  ],
  "rebalance_hint": "Review every month and after earnings/news shocks."
}
```

---

## Stock History & Recommendations

### 5.1 Get Stock Price History
```
GET /api/stocks/{ticker}/history
```

**Parameters:**
| Name | Type | Required | Default | Description |
|------|------|----------|---------|-------------|
| ticker | string | Yes | - | Stock ticker symbol |
| days | integer | No | 30 | Number of days of history (1-365) |

**Example Request:**
```http
GET http://localhost:8010/api/stocks/ETEL/history?days=30
X-API-Key: 2a04bb8e3a549176ed4b52f0ea632fc463de859581d8e2adbc1298cc1783548e
```

**Response:**
```json
{
  "success": true,
  "message": "Retrieved 30 days of history for ETEL",
  "ticker": "ETEL",
  "name": "Telecom Egypt",
  "days": 30,
  "data": [
    {
      "date": "2026-02-15",
      "open": 25.10,
      "high": 25.80,
      "low": 24.90,
      "close": 25.50,
      "volume": 1500000
    }
  ],
  "summary": {
    "start_price": 23.00,
    "end_price": 25.50,
    "high_price": 26.50,
    "low_price": 23.00,
    "avg_price": 24.75,
    "total_volume": 25000000,
    "price_change": 2.50,
    "price_change_percent": 10.86
  },
  "last_update": "2026-03-03T10:00:00"
}
```

**When real data is unavailable (example 502):**
```json
{
  "detail": {
    "error": "historical_data_unavailable",
    "message": "No real historical data available for ticker 'ETEL' from configured data sources."
  }
}
```

---

### 5.2 Get Deep Stock Insights (Open Sources)
```
GET /api/stocks/{ticker}/deep-insights
```

**Query Parameters:**
| Name | Type | Required | Default | Description |
|------|------|----------|---------|-------------|
| ticker | string | Yes | - | Stock ticker symbol |
| days | integer | No | 60 | History window used for risk/return metrics (7-365) |

**Response:**
```json
{
  "success": true,
  "message": "Deep insights generated for ETEL",
  "ticker": "ETEL",
  "days": 60,
  "saved": {
    "run_id": "f93fd8e9f54c4fd6bc7b1912f5d9e21a",
    "aggregate_snapshot_id": 42,
    "saved_at": "2026-03-03T12:30:00"
  },
  "insights": {
    "real_data_only": true,
    "sources_available_count": 3,
    "sources": {
      "yahoo_finance": {"available": true, "current_price": 25.5},
      "sa_investing": {"available": true},
      "tradingview": {"available": true},
      "finviz": {"available": false},
      "marketwatch": {"available": false}
    },
    "decision_metrics": {
      "data_points": 60,
      "return_7d": 0.018,
      "return_30d": 0.064,
      "volatility_annualized": 0.27,
      "max_drawdown": 0.11,
      "trend_signal": "short_term_uptrend",
      "risk_level": "medium"
    }
  }
}
```

The backend persists this output into `egx_investment.db` with timestamped rows:
- Per-source rows in `stock_source_snapshots`
- Aggregated rows in `stock_deep_insight_snapshots`

---

### 5.3 Get Deep Insights History (Frontend Data Source)
```
GET /api/stocks/{ticker}/deep-insights/history
```

**Query Parameters:**
| Name | Type | Required | Default | Description |
|------|------|----------|---------|-------------|
| ticker | string | Yes | - | Stock ticker symbol |
| limit | integer | No | 20 | Number of latest saved snapshots (1-100) |

**Response:**
```json
{
  "success": true,
  "message": "Retrieved 5 deep insight snapshots for ETEL",
  "ticker": "ETEL",
  "count": 5,
  "data": [
    {
      "id": 42,
      "run_id": "f93fd8e9f54c4fd6bc7b1912f5d9e21a",
      "ticker": "ETEL",
      "sources_available_count": 3,
      "fetched_at": "2026-03-03T12:30:00",
      "insights": {
        "real_data_only": true,
        "decision_metrics": {
          "risk_level": "medium"
        }
      }
    }
  ]
}
```

---

### 5.4 Get AI Stock Recommendation
```
GET /api/stocks/{ticker}/recommendation
```

**Parameters:**
| Name | Type | Required | Description |
|------|------|----------|-------------|
| ticker | string | Yes | Stock ticker symbol |

**Example Request:**
```http
GET http://localhost:8010/api/stocks/ETEL/recommendation
X-API-Key: 2a04bb8e3a549176ed4b52f0ea632fc463de859581d8e2adbc1298cc1783548e
```

**Response:**
```json
{
  "success": true,
  "message": "AI recommendation generated for ETEL",
  "ticker": "ETEL",
  "stock_data": {
    "current_price": 25.50,
    "sector": "Telecommunications",
    "compliance_status": "halal"
  },
  "recommendation": {
    "action": "buy",
    "confidence": 75,
    "target_price": 28.00,
    "upside_potential": 9.8,
    "risk_level": "medium",
    "reason": "Strong fundamentals with low debt ratio and consistent dividend payments. Technical indicators show bullish momentum."
  },
  "trusted_sources": [
    {
      "name": "Bloomberg",
      "rating": "Buy",
      "reliability": 95
    },
    {
      "name": "Reuters",
      "rating": "Hold",
      "reliability": 90
    }
  ],
  "last_update": "2026-02-15T13:00:00"
}
```

---

### 5.3 Get Trusted Sources Recommendations
```
GET /api/market/recommendations/trusted-sources
```

**Example Request:**
```http
GET http://localhost:8010/api/market/recommendations/trusted-sources
X-API-Key: 2a04bb8e3a549176ed4b52f0ea632fc463de859581d8e2adbc1298cc1783548e
```

**Response:**
```json
{
  "success": true,
  "message": "Trusted sources recommendations retrieved successfully",
  "real_data_only": true,
  "data_availability": {
    "analyst_recommendations_count": 0,
    "market_news_count": 0,
    "has_ai_summary": false
  },
  "sources": [
    {
      "id": "sa_investing",
      "name": "Investing Saudi (Egypt Equities)",
      "reliability": 0.85,
      "url": "https://sa.investing.com/equities/egypt"
    },
    {
      "id": "tradingview",
      "name": "TradingView",
      "reliability": 0.82,
      "url": "https://www.tradingview.com/markets/stocks-egypt/"
    }
  ],
  "analyst_recommendations": {},
  "market_news": [],
  "ai_summary": null
}
```

---

### 5.4 Get AI Market Insights
```
GET /api/market/recommendations/ai-insights
```

**Example Request:**
```http
GET http://localhost:8010/api/market/recommendations/ai-insights
X-API-Key: 2a04bb8e3a549176ed4b52f0ea632fc463de859581d8e2adbc1298cc1783548e
```

**Response:**
```json
{
  "success": true,
  "message": "AI market insights generated successfully",
  "market_data": {
    "indices": [...],
    "top_stocks": [...]
  },
  "insights": {
    "market_sentiment": "bullish",
    "confidence": 70,
    "top_opportunities": [
      {
        "ticker": "ETEL",
        "reason": "Strong technical momentum and fundamental support",
        "potential_return": 15.0
      }
    ],
    "sector_recommendations": [
      {
        "sector": "Telecommunications",
        "outlook": "positive",
        "reason": "Growing demand for digital services"
      }
    ],
    "risk_factors": [
      "Currency fluctuation risks",
      "Global market volatility"
    ],
    "investment_strategy": "Consider a balanced portfolio with focus on telecommunications and banking sectors..."
  },
  "last_update": "2026-02-15T13:00:00"
}
```

---

## Flutter Integration - Additional Methods

Add these methods to your `ApiService` class:

```dart
  // Get stock price history
  Future<Map<String, dynamic>> getStockHistory(String ticker, {int days = 30}) async {
    final response = await http.get(
      Uri.parse('$baseUrl/stocks/$ticker/history?days=$days'),
      headers: _headers,
    );
    
    if (response.statusCode == 200) {
      return json.decode(response.body);
    }
    throw Exception('Failed to load stock history: ${response.body}');
  }

  // Get AI stock recommendation
  Future<Map<String, dynamic>> getStockRecommendation(String ticker) async {
    final response = await http.get(
      Uri.parse('$baseUrl/stocks/$ticker/recommendation'),
      headers: _headers,
    );
    
    if (response.statusCode == 200) {
      return json.decode(response.body);
    }
    throw Exception('Failed to load recommendation: ${response.body}');
  }

  // Get trusted sources recommendations
  Future<Map<String, dynamic>> getTrustedSourcesRecommendations() async {
    final response = await http.get(
      Uri.parse('$baseUrl/market/recommendations/trusted-sources'),
      headers: _headers,
    );
    
    if (response.statusCode == 200) {
      return json.decode(response.body);
    }
    throw Exception('Failed to load trusted sources: ${response.body}');
  }

  // Get AI market insights
  Future<Map<String, dynamic>> getAIMarketInsights() async {
    final response = await http.get(
      Uri.parse('$baseUrl/market/recommendations/ai-insights'),
      headers: _headers,
    );
    
    if (response.statusCode == 200) {
      return json.decode(response.body);
    }
    throw Exception('Failed to load AI insights: ${response.body}');
  }
```

---

## Phase 7-9: Advanced Features (NEW)

### Quality Dashboard & Trust Panel

#### Get Quality Dashboard
```http
GET /api/market/quality/dashboard
```

Returns comprehensive data quality metrics including fill rates, confidence scores, freshness, source diversity, and alerts.

**Example Request:**
```http
GET http://localhost:8010/api/market/quality/dashboard
X-API-Key: 2a04bb8e3a549176ed4b52f0ea632fc463de859581d8e2adbc1298cc1783548e
```

**Response:**
```json
{
  "success": true,
  "timestamp": "2026-03-03T12:00:00",
  "summary": {
    "total_stocks": 100,
    "stocks_with_recent_data": 95,
    "stale_stocks": 5,
    "data_freshness_pct": 95.0
  },
  "fill_rate": {
    "average": 0.65,
    "min": 0.30,
    "max": 0.95,
    "sample_count": 95
  },
  "confidence": {
    "average": 0.72,
    "high_confidence_count": 60,
    "low_confidence_count": 10
  },
  "sources": {
    "total": 5,
    "active": 4,
    "healthy": 3,
    "degraded": 1
  },
  "alerts": []
}
```

#### Get Stock Trust Panel
```http
GET /api/market/quality/stock/{ticker}
```

Returns data trust information for a specific stock including freshness, confidence, source diversity, and warnings.

**Parameters:**
| Name | Type | Required | Description |
|------|------|----------|-------------|
| ticker | string | Yes | Stock ticker symbol |

**Example Request:**
```http
GET http://localhost:8010/api/market/quality/stock/ETEL
X-API-Key: 2a04bb8e3a549176ed4b52f0ea632fc463de859581d8e2adbc1298cc1783548e
```

**Response:**
```json
{
  "success": true,
  "ticker": "ETEL",
  "stock_name": "Telecom Egypt",
  "has_data": true,
  "trust_level": "high",
  "freshness": {
    "last_update": "2026-03-03T10:00:00",
    "age_hours": 2.5,
    "is_fresh": true
  },
  "confidence": {
    "overall": 0.85,
    "level": "high"
  },
  "source_diversity": {
    "count": 3,
    "sources": ["yahoo_finance", "sa_investing", "tradingview"]
  },
  "field_coverage": {
    "populated": 65,
    "expected": 81,
    "fill_rate": 0.80
  },
  "missing_critical_fields": [],
  "warnings": []
}
```

---

### Performance & Latency

#### Get Performance Statistics
```http
GET /api/market/performance/stats
```

Returns API latency statistics (p50/p95/p99) and request counts.

**Example Request:**
```http
GET http://localhost:8010/api/market/performance/stats
X-API-Key: 2a04bb8e3a549176ed4b52f0ea632fc463de859581d8e2adbc1298cc1783548e
```

**Response:**
```json
{
  "success": true,
  "summary": {
    "uptime_seconds": 86400,
    "total_requests": 15000,
    "total_errors": 25,
    "error_rate": 0.0017,
    "overall_latency": {
      "count": 15000,
      "avg_ms": 125.5,
      "min_ms": 15.2,
      "max_ms": 2500.0,
      "p50_ms": 100.0,
      "p95_ms": 450.0,
      "p99_ms": 1200.0
    }
  },
  "latency_by_endpoint": {
    "GET /api/stocks": {...},
    "GET /api/market/overview": {...}
  },
  "slow_requests": []
}
```

---

### System Alerts

#### Get System Alerts
```http
GET /api/market/alerts
```

**Query Parameters:**
| Name | Type | Required | Default | Description |
|------|------|----------|---------|-------------|
| severity | string | No | null | Filter by severity: info, warning, error, critical |
| include_resolved | boolean | No | false | Include resolved alerts |
| limit | integer | No | 50 | Maximum alerts to return |

**Example Request:**
```http
GET http://localhost:8010/api/market/alerts?severity=warning
X-API-Key: 2a04bb8e3a549176ed4b52f0ea632fc463de859581d8e2adbc1298cc1783548e
```

#### Acknowledge Alert
```http
POST /api/market/alerts/{alert_id}/acknowledge
```

#### Resolve Alert
```http
POST /api/market/alerts/{alert_id}/resolve
```

#### Run Alert Checks
```http
POST /api/market/alerts/check
```

---

### User Watchlist Alerts (Phase 9)

#### Get User Alerts
```http
GET /api/user/alerts
```

**Query Parameters:**
| Name | Type | Required | Default | Description |
|------|------|----------|---------|-------------|
| unread_only | boolean | No | false | Only return unread alerts |
| limit | integer | No | 50 | Maximum alerts to return |

**Example Request:**
```http
GET http://localhost:8010/api/user/alerts?unread_only=true
X-API-Key: 2a04bb8e3a549176ed4b52f0ea632fc463de859581d8e2adbc1298cc1783548e
```

**Response:**
```json
{
  "success": true,
  "alerts": [
    {
      "id": 1,
      "alert_type": "price_above",
      "severity": "info",
      "ticker": "ETEL",
      "trigger_value": 26.0,
      "current_value": 26.5,
      "change_percent": 2.5,
      "message": "ETEL is now above your alert price of 26.00 EGP",
      "message_ar": "ETEL تجاوز سعر التنبيه الخاص بك البالغ 26.00 جنيه",
      "is_read": false,
      "created_at": "2026-03-03T10:00:00"
    }
  ]
}
```

#### Check Watchlist Alerts
```http
POST /api/user/alerts/check
```

Triggers alert checks for all watchlist items.

#### Mark Alert as Read
```http
POST /api/user/alerts/{alert_id}/read
```

#### Dismiss Alert
```http
POST /api/user/alerts/{alert_id}/dismiss
```

---

### User Signal Feed (Phase 9)

#### Get Signal Feed
```http
GET /api/user/signal-feed
```

**Query Parameters:**
| Name | Type | Required | Default | Description |
|------|------|----------|---------|-------------|
| unread_only | boolean | No | false | Only return unread signals |
| limit | integer | No | 50 | Maximum signals to return |

**Example Request:**
```http
GET http://localhost:8010/api/user/signal-feed
X-API-Key: 2a04bb8e3a549176ed4b52f0ea632fc463de859581d8e2adbc1298cc1783548e
```

**Response:**
```json
{
  "success": true,
  "signals": [
    {
      "id": 1,
      "signal_type": "price_change",
      "ticker": "ETEL",
      "title": "ETEL gained 5.2%",
      "title_ar": "ETEL ارتفع 5.2%",
      "description": "Current price: 26.50 EGP (was 25.20)",
      "description_ar": "السعر الحالي: 26.50 جنيه (كان 25.20)",
      "previous_value": 25.20,
      "current_value": 26.50,
      "change_percent": 5.2,
      "importance_score": 0.8,
      "is_read": false,
      "is_actionable": true,
      "action_type": "view_stock",
      "created_at": "2026-03-03T10:00:00"
    }
  ]
}
```

#### Generate Signal Feed
```http
POST /api/user/signal-feed/generate
```

Generates fresh signals based on current data.

#### Mark Signal as Read
```http
POST /api/user/signal-feed/{signal_id}/read
```

---

### Portfolio Health (Phase 9)

#### Get Portfolio Health
```http
GET /api/user/portfolio/health
```

**Example Request:**
```http
GET http://localhost:8010/api/user/portfolio/health
X-API-Key: 2a04bb8e3a549176ed4b52f0ea632fc463de859581d8e2adbc1298cc1783548e
```

**Response:**
```json
{
  "overall_health_score": 75,
  "diversification_score": 80,
  "risk_score": 70,
  "halal_compliance_score": 100,
  "performance_score": 65,
  "priority_actions": [
    {
      "priority": 1,
      "action": "diversify",
      "reason": "Your portfolio is highly concentrated",
      "reason_ar": "محفظتك مركزة بشكل كبير",
      "suggestion": "Consider adding assets from different sectors",
      "suggestion_ar": "فكر في إضافة أصول من قطاعات مختلفة"
    }
  ],
  "concentration_warnings": [],
  "risk_warnings": [],
  "compliance_warnings": [],
  "rebalance_suggestions": [],
  "calculated_at": "2026-03-03T10:00:00"
}
```

#### Refresh Portfolio Health
```http
POST /api/user/portfolio/health/refresh
```

Forces recalculation of portfolio health scores.

---

### Daily Check-in & Engagement (Phase 9)

#### Daily Check-in
```http
POST /api/user/check-in
```

Records a daily check-in and updates streak counter.

**Example Request:**
```http
POST http://localhost:8010/api/user/check-in
X-API-Key: 2a04bb8e3a549176ed4b52f0ea632fc463de859581d8e2adbc1298cc1783548e
```

**Response:**
```json
{
  "checked_in": true,
  "streak_days": 7,
  "longest_streak": 14,
  "total_check_ins": 45,
  "portfolio_value": 150000.0,
  "portfolio_change_percent": 5.2,
  "top_mover": "ETEL",
  "top_mover_change": 8.5,
  "market_sentiment": "bullish",
  "insight": "🔥 Amazing! You're on a 7-day streak! Keep up the great work.",
  "insight_ar": "🔥 رائع! أنت في سلسلة من 7 أيام! استمر في العمل الرائع."
}
```

#### Get Engagement Stats
```http
GET /api/user/engagement
```

**Response:**
```json
{
  "current_streak_days": 7,
  "longest_streak_days": 14,
  "last_check_in": "2026-03-03T10:00:00",
  "total_check_ins": 45,
  "total_stocks_viewed": 120,
  "total_analyses_viewed": 35,
  "total_portfolio_updates": 10,
  "total_watchlist_adds": 8,
  "lessons_completed": 3,
  "quiz_average_score": 85.5,
  "simulations_completed": 2
}
```

#### Record Activity
```http
POST /api/user/activity/{activity_type}
```

**Activity Types:**
- `stock_viewed`
- `analysis_viewed`
- `portfolio_update`
- `watchlist_add`
- `lesson_complete`
- `simulation_complete`

**Example:**
```http
POST http://localhost:8010/api/user/activity/stock_viewed
X-API-Key: 2a04bb8e3a549176ed4b52f0ea632fc463de859581d8e2adbc1298cc1783548e
```

#### Get Daily Insights
```http
GET /api/user/daily-insights
```

Returns combined daily insights including streak, portfolio health, unread alerts, and recent signals.

---

### Pipeline Management

#### Trigger Pipeline
```http
POST /api/market/pipeline/trigger
```

**Query Parameters:**
| Name | Type | Required | Default | Description |
|------|------|----------|---------|-------------|
| run_type | string | No | eod | Pipeline type: bootstrap, eod, manual |
| tickers | string | No | null | Comma-separated list of tickers |
| batch_size | integer | No | 10 | Batch size for processing |

#### Get Pipeline Status
```http
GET /api/market/pipeline/status/{run_id}
```

#### Get Pipeline History
```http
GET /api/market/pipeline/history
```

**Query Parameters:**
| Name | Type | Required | Default | Description |
|------|------|----------|---------|-------------|
| run_type | string | No | null | Filter by type: bootstrap, eod, manual |
| status | string | No | null | Filter by status |
| limit | integer | No | 20 | Maximum results |

#### Get Source Reliability
```http
GET /api/market/sources/reliability
```

---

## Flutter Integration Example (Extended)

### Add to API Service Class

```dart
  // ============ Phase 7-9: Quality & Trust ============
  
  /// Get quality dashboard
  Future<Map<String, dynamic>> getQualityDashboard() async {
    final response = await http.get(
      Uri.parse('$baseUrl/market/quality/dashboard'),
      headers: _headers,
    );
    
    if (response.statusCode == 200) {
      return json.decode(response.body);
    }
    throw Exception('Failed to load quality dashboard: ${response.body}');
  }
  
  /// Get stock trust panel
  Future<Map<String, dynamic>> getStockTrustPanel(String ticker) async {
    final response = await http.get(
      Uri.parse('$baseUrl/market/quality/stock/$ticker'),
      headers: _headers,
    );
    
    if (response.statusCode == 200) {
      return json.decode(response.body);
    }
    throw Exception('Failed to load trust panel: ${response.body}');
  }
  
  /// Get performance statistics
  Future<Map<String, dynamic>> getPerformanceStats() async {
    final response = await http.get(
      Uri.parse('$baseUrl/market/performance/stats'),
      headers: _headers,
    );
    
    if (response.statusCode == 200) {
      return json.decode(response.body);
    }
    throw Exception('Failed to load performance stats: ${response.body}');
  }
  
  // ============ Phase 9: Retention & Personalization ============
  
  /// Get user alerts
  Future<Map<String, dynamic>> getUserAlerts({bool unreadOnly = false, int limit = 50}) async {
    final queryParams = {
      if (unreadOnly) 'unread_only': 'true',
      'limit': limit.toString(),
    };
    
    final uri = Uri.parse('$baseUrl/user/alerts').replace(queryParameters: queryParams);
    final response = await http.get(uri, headers: _headers);
    
    if (response.statusCode == 200) {
      return json.decode(response.body);
    }
    throw Exception('Failed to load user alerts: ${response.body}');
  }
  
  /// Check watchlist alerts
  Future<Map<String, dynamic>> checkWatchlistAlerts() async {
    final response = await http.post(
      Uri.parse('$baseUrl/user/alerts/check'),
      headers: _headers,
    );
    
    if (response.statusCode == 200) {
      return json.decode(response.body);
    }
    throw Exception('Failed to check alerts: ${response.body}');
  }
  
  /// Mark alert as read
  Future<bool> markAlertRead(int alertId) async {
    final response = await http.post(
      Uri.parse('$baseUrl/user/alerts/$alertId/read'),
      headers: _headers,
    );
    return response.statusCode == 200;
  }
  
  /// Get signal feed
  Future<Map<String, dynamic>> getSignalFeed({bool unreadOnly = false, int limit = 50}) async {
    final queryParams = {
      if (unreadOnly) 'unread_only': 'true',
      'limit': limit.toString(),
    };
    
    final uri = Uri.parse('$baseUrl/user/signal-feed').replace(queryParameters: queryParams);
    final response = await http.get(uri, headers: _headers);
    
    if (response.statusCode == 200) {
      return json.decode(response.body);
    }
    throw Exception('Failed to load signal feed: ${response.body}');
  }
  
  /// Get portfolio health
  Future<Map<String, dynamic>> getPortfolioHealth() async {
    final response = await http.get(
      Uri.parse('$baseUrl/user/portfolio/health'),
      headers: _headers,
    );
    
    if (response.statusCode == 200) {
      return json.decode(response.body);
    }
    throw Exception('Failed to load portfolio health: ${response.body}');
  }
  
  /// Daily check-in
  Future<Map<String, dynamic>> dailyCheckIn() async {
    final response = await http.post(
      Uri.parse('$baseUrl/user/check-in'),
      headers: _headers,
    );
    
    if (response.statusCode == 200) {
      return json.decode(response.body);
    }
    throw Exception('Failed to check in: ${response.body}');
  }
  
  /// Get engagement stats
  Future<Map<String, dynamic>> getEngagementStats() async {
    final response = await http.get(
      Uri.parse('$baseUrl/user/engagement'),
      headers: _headers,
    );
    
    if (response.statusCode == 200) {
      return json.decode(response.body);
    }
    throw Exception('Failed to load engagement stats: ${response.body}');
  }
  
  /// Record activity
  Future<bool> recordActivity(String activityType) async {
    final response = await http.post(
      Uri.parse('$baseUrl/user/activity/$activityType'),
      headers: _headers,
    );
    return response.statusCode == 200;
  }
  
  /// Get daily insights
  Future<Map<String, dynamic>> getDailyInsights() async {
    final response = await http.get(
      Uri.parse('$baseUrl/user/daily-insights'),
      headers: _headers,
    );
    
    if (response.statusCode == 200) {
      return json.decode(response.body);
    }
    throw Exception('Failed to load daily insights: ${response.body}');
  }
  
  // ============ Pipeline Management ============
  
  /// Trigger pipeline
  Future<Map<String, dynamic>> triggerPipeline({String runType = 'eod', String? tickers, int batchSize = 10}) async {
    final queryParams = {
      'run_type': runType,
      'batch_size': batchSize.toString(),
      if (tickers != null) 'tickers': tickers,
    };
    
    final uri = Uri.parse('$baseUrl/market/pipeline/trigger').replace(queryParameters: queryParams);
    final response = await http.post(uri, headers: _headers);
    
    if (response.statusCode == 200) {
      return json.decode(response.body);
    }
    throw Exception('Failed to trigger pipeline: ${response.body}');
  }
  
  /// Get pipeline status
  Future<Map<String, dynamic>> getPipelineStatus(String runId) async {
    final response = await http.get(
      Uri.parse('$baseUrl/market/pipeline/status/$runId'),
      headers: _headers,
    );
    
    if (response.statusCode == 200) {
      return json.decode(response.body);
    }
    throw Exception('Failed to get pipeline status: ${response.body}');
  }
  
  /// Get source reliability
  Future<Map<String, dynamic>> getSourceReliability() async {
    final response = await http.get(
      Uri.parse('$baseUrl/market/sources/reliability'),
      headers: _headers,
    );
    
    if (response.statusCode == 200) {
      return json.decode(response.body);
    }
    throw Exception('Failed to get source reliability: ${response.body}');
  }
```

---

## Notes

1. **Local Testing**: Use `http://10.0.2.2:8010/api` for Android emulator (instead of localhost)
2. **Real Device**: Use your computer's IP address (e.g., `http://192.168.1.x:8010/api`)
3. **Production**: Replace with your deployed domain URL
4. **API Key**: Keep the API key secure - use environment variables in production
5. **Bilingual Support**: All Phase 9 endpoints return both English and Arabic text (`message`/`message_ar`, `title`/`title_ar`)
6. **Market Hours**: Data refresh only occurs during market hours (Saturday-Thursday, 8:00 AM - 2:00 PM Cairo time)
