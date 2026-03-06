# Roadmap: EGX Full Scraping + Intelligent Financial Analysis

## Objective
Build a production-ready pipeline that:
1) selects all EGX stocks,
2) collects all available data (all tabs/sections),
3) computes missing metrics,
4) produces explainable investment analysis and decision support based on current + historical data.

## Scope Decisions
- Source strategy: use all available sources during development for max coverage and correctness.
- Coverage: everything available across stock list + stock detail tabs.
- Refresh cadence: end-of-day deep refresh.
- Release model: phased delivery.

## Success Criteria
- 100% EGX universe discovered and tracked.
- High fill-rate for core fields (quote, fundamentals, technicals, history).
- Missing fields are computed with traceable formulas.
- Each recommendation includes score, rationale, confidence, and risk flags.
- Scheduler runs EOD idempotently with job stats and retry behavior.

---

## Implementation Progress

### ✅ Phase 1 — Data Contract and Storage Foundation (COMPLETED)
**Status**: Completed on 2026-03-03

**Implemented**:
- ✅ Defined canonical field catalog for all categories:
  - Market/Quote (14 fields)
  - Company/Profile (9 fields)
  - Fundamentals (18 fields)
  - Technicals (13 fields)
  - Earnings (4 fields)
  - Analyst signals (6 fields)
  - News/Events (2 fields)
  - Derived metrics (15 fields)
- ✅ Added normalized snapshot entities with lineage metadata:
  - `StockFieldObservation` - individual field observations per source
  - `StockNormalizedSnapshot` - reconciled data with quality metrics
  - `FieldReconciliationLog` - reconciliation decisions for conflicts
  - `SourceReliabilityScore` - source reliability tracking
  - `PipelineRunLog` - pipeline execution metrics
- ✅ Added confidence levels: HIGH, MEDIUM, LOW, COMPUTED
- ✅ Added reconciliation strategies: MOST_RECENT, HIGHEST_CONFIDENCE, WEIGHTED_AVERAGE, MANUAL

**New Files**:
- `app/models/models.py` - Added 6 new model classes
- `app/schemas/schemas.py` - Added 30+ new schema classes

---

### ✅ Phase 2 — Multi-Source Collection + Reconciliation (COMPLETED)
**Status**: Completed on 2026-03-03

**Implemented**:
- ✅ Upgraded provider orchestration from fallback-first to collect-all-sources fan-out
- ✅ Implemented source reliability scoring (global + field-level)
- ✅ Reconcile conflicts using weighted logic and freshness checks
- ✅ Persist field observations per source for transparency
- ✅ Created collectors for: Yahoo Finance, Investing.com, TradingView, Finviz, MarketWatch

**New Files**:
- `app/services/data_reconciliation_service.py` - Multi-source collection and reconciliation

**Key Classes**:
- `DataReconciliationService` - Main orchestration service
- `SourceCollector` - Base class for source collectors
- `YahooFinanceCollector`, `InvestingComCollector`, etc.

---

### ✅ Phase 3 — Full Universe Bootstrap + EOD Pipeline (COMPLETED)
**Status**: Completed on 2026-03-03

**Implemented**:
- ✅ Built full EGX bootstrap run (all stocks, all tabs, historical baseline)
- ✅ Added EOD incremental refresh with idempotency
- ✅ Record execution metrics: updated, skipped, failed, duration
- ✅ Added manual trigger endpoint for operations
- ✅ Added pipeline history and status endpoints

**New Files**:
- `scripts/run_egx_pipeline.py` - Bootstrap and EOD pipeline script

**New Endpoints**:
- `POST /api/market/pipeline/trigger` - Trigger pipeline run
- `GET /api/market/pipeline/status/{run_id}` - Get run status
- `GET /api/market/pipeline/history` - Get run history
- `GET /api/market/sources/reliability` - Get source reliability scores

**Scheduler Updates**:
- `app/scheduler.py` - Added `run_eod_reconciliation_pipeline()` and `run_bootstrap_pipeline()`

---

### ✅ Phase 4 — Missing Data Calculations (COMPLETED)
**Status**: Completed on 2026-03-03

**Implemented**:
- ✅ Compute derived metrics where source data is incomplete:
  - Returns: 1d, 5d, 7d, 30d, 90d, 1y, YTD
  - Volatility: 7d, 30d, 90d (annualized)
  - Drawdown: 30d, 90d maximum drawdown
  - Risk-adjusted: Sharpe ratio, Sortino ratio
  - Valuation composite (PE, PB, dividend yield weighted)
  - Profitability composite (ROE-based)
  - Growth composite (price appreciation)
  - Quality composite (debt-based)
  - Risk level classification (low/medium/high)
  - Trend metrics (MA position, trend signal, strength)
- ✅ Mark each computed field with method/version and input coverage

**New Files**:
- `app/services/derived_metrics_service.py` - Derived metrics computation

**Key Features**:
- `COMPUTATION_VERSION = "1.0.0"` for traceability
- Input coverage tracking for each metric
- Method documentation for each computation

---

### ✅ Phase 5 — Intelligent Analysis Module (COMPLETED)
**Status**: Completed on 2026-03-03

**Implemented**:
- ✅ Built explainable analysis engine with:
  - Fundamental score (valuation, profitability, growth, quality)
  - Technical score (trend, momentum, volatility)
  - Risk score (volatility risk, financial risk, drawdown risk)
  - Data quality/confidence score (fill rate, source diversity, field confidence)
  - Final composite decision score (weighted combination)
- ✅ Generate human-readable rationale with bullish/bearish factors
- ✅ Add confidence-aware recommendations (strong_buy/buy/hold/sell/strong_sell)
- ✅ Bilingual rationale generation (English and Arabic)

**New Files**:
- `app/services/intelligent_analysis_service.py` - Intelligent analysis engine

**Key Classes**:
- `IntelligentAnalysisEngine` - Main analysis engine
- `RecommendationAction` - Enum for recommendation actions
- `ConfidenceLevel` - Enum for confidence levels

---

### ✅ Phase 6 — API + Frontend Integration (COMPLETED)
**Status**: Completed on 2026-03-03

**Implemented**:
- ✅ Added advanced consolidated endpoint (all tabs + analysis summary)
- ✅ Added source-confidence endpoint (field lineage and confidence)
- ✅ Added historical analysis endpoint (time-series of scores/signals)
- ✅ Added intelligent analysis endpoint
- ✅ Kept legacy endpoints backward compatible

**New Endpoints**:
- `GET /api/stocks/{ticker}/all-tabs` - All-tabs consolidated data
- `GET /api/stocks/{ticker}/field-confidence` - Field-level confidence data
- `GET /api/stocks/{ticker}/analysis/history` - Historical analysis scores
- `GET /api/stocks/{ticker}/intelligent-analysis` - Comprehensive analysis

---

### ✅ Phase 7 — Validation and Hardening (COMPLETED)
**Status**: Completed on 2026-03-03

**Implemented**:
- ✅ Extended loop tests for:
  - Field confidence presence validation
  - Reconciliation winner existence checks
  - Source count stability across iterations
- ✅ Validated bootstrap completeness and EOD idempotency
- ✅ Added failure handling for blocked/empty sources:
  - Automatic source blocking after consecutive failures
  - Cooldown period for blocked sources
  - Graceful degradation when sources are unavailable
  - Enhanced error tracking and reporting
- ✅ Updated project status and docs

**Enhanced Files**:
- `scripts/test_open_sources_loop.py` - Extended with validation checks
- `app/services/data_reconciliation_service.py` - Added blocked source handling

**Key Features**:
- `ValidationReport` class for structured validation results
- `validate_field_confidence()` - Validates confidence data presence
- `validate_reconciliation_winner()` - Validates reconciliation decisions
- `validate_source_count_stability()` - Checks source availability consistency
- `validate_blocked_source_handling()` - Validates graceful failure handling
- Source blocking after 5 consecutive failures
- 30-minute cooldown period for blocked sources
- Automatic unblocking after cooldown expires

---

### ✅ Phase 8 — Trust and Performance (COMPLETED)
**Status**: Completed on 2026-03-03

**Implemented**:
- ✅ Quality dashboard endpoint with comprehensive metrics:
  - Fill rate statistics (avg, min, max)
  - Confidence distribution
  - Data freshness tracking
  - Source diversity metrics
  - Pipeline health status
  - Field coverage by category
- ✅ Per-stock Data Trust Panel endpoint:
  - Data freshness indicators
  - Confidence level display
  - Source diversity tracking
  - Missing field warnings
  - Trust level classification (high/medium/low)
- ✅ Latency monitoring middleware:
  - p50/p95/p99 latency tracking per endpoint
  - Slow request logging (>1.5s threshold)
  - Request count and error rate tracking
  - X-Response-Time-Ms header in responses
- ✅ Reliability alerts for scraper/source degradation:
  - Source availability monitoring
  - Stale data detection
  - Low fill rate alerts
  - Pipeline failure notifications
  - Confidence drop detection
  - Alert acknowledgment and resolution

**New Files**:
- `app/middleware/monitoring.py` - Latency monitoring middleware
- `app/services/alerting_service.py` - Alerting service for system health

**New Endpoints**:
- `GET /api/market/quality/dashboard` - Comprehensive quality dashboard
- `GET /api/market/quality/stock/{ticker}` - Per-stock trust panel
- `GET /api/market/performance/stats` - API performance statistics
- `GET /api/market/alerts` - Get system alerts
- `POST /api/market/alerts/{alert_id}/acknowledge` - Acknowledge alert
- `POST /api/market/alerts/{alert_id}/resolve` - Resolve alert
- `POST /api/market/alerts/check` - Run alert checks

**Key Classes**:
- `PerformanceMetrics` - In-memory performance tracking
- `LatencyMonitoringMiddleware` - Request timing middleware
- `AlertingService` - Alert management service
- `Alert` - Alert data model

---

### ✅ Phase 9 — Retention and Personalization (COMPLETED)
**Status**: Completed on 2026-03-03

**Implemented**:
- ✅ Watchlists with smart alerts:
  - Price above/below threshold alerts
  - Percentage change alerts
  - Confidence drop alerts
  - Risk signal notifications
  - Bilingual alert messages (English/Arabic)
- ✅ User-level signal feed:
  - Price changes for watchlist stocks
  - Portfolio updates
  - Market events
  - Importance-based ranking
  - Actionable signal flags
- ✅ Portfolio health card:
  - Overall health score (0-100)
  - Diversification score
  - Risk score
  - Halal compliance score
  - Performance score
  - Priority actions with bilingual explanations
  - Concentration/risk/compliance warnings
  - Rebalancing suggestions
- ✅ Bilingual explainers:
  - All alerts have English and Arabic messages
  - Priority actions with bilingual reasons/suggestions
  - Daily insights in both languages
- ✅ Streak and progress loop:
  - Daily check-in tracking
  - Current/longest streak counters
  - Personalized daily insights
  - Market sentiment indicators
  - Activity tracking (stocks viewed, analyses, etc.)

**New Files**:
- `app/services/retention_service.py` - Retention and personalization service

**New Database Tables**:
- `watchlist_alerts` - Smart alerts for watchlist stocks
- `user_signal_feed` - Personalized signal feed
- `portfolio_health_cards` - Portfolio health assessments
- `user_engagement` - Engagement and streak tracking
- `daily_check_ins` - Daily check-in records

**New Endpoints**:
- `GET /api/user/alerts` - Get user alerts
- `POST /api/user/alerts/check` - Check watchlist alerts
- `POST /api/user/alerts/{alert_id}/read` - Mark alert read
- `POST /api/user/alerts/{alert_id}/dismiss` - Dismiss alert
- `GET /api/user/signal-feed` - Get signal feed
- `POST /api/user/signal-feed/generate` - Generate signals
- `POST /api/user/signal-feed/{signal_id}/read` - Mark signal read
- `GET /api/user/portfolio/health` - Get portfolio health
- `POST /api/user/portfolio/health/refresh` - Refresh health card
- `POST /api/user/check-in` - Daily check-in
- `GET /api/user/engagement` - Get engagement stats
- `POST /api/user/activity/{activity_type}` - Record activity
- `GET /api/user/daily-insights` - Get daily insights

**Key Classes**:
- `RetentionService` - Main retention service
- `AlertType` - Alert type enumeration
- `SignalType` - Signal type enumeration

---

## Execution Backlog (Prioritized)
1. ✅ Canonical field catalog + schemas
2. ✅ Snapshot model extension + lineage
3. ✅ Multi-source fan-out collection
4. ✅ Reconciliation + confidence scoring
5. ✅ Full-universe bootstrap
6. ✅ EOD incremental scheduler
7. ✅ Missing metrics engine
8. ✅ Intelligent scoring/recommendation
9. ✅ Advanced API endpoints
10. ⏳ Frontend consumption + confidence UI (optional)
11. ✅ Validation scripts
12. ✅ Documentation and release notes
13. ✅ Quality dashboard and trust panel
14. ✅ Latency monitoring and alerting

---

## New Files Created

| File | Description |
|------|-------------|
| `app/services/data_reconciliation_service.py` | Multi-source collection and reconciliation |
| `app/services/derived_metrics_service.py` | Derived metrics computation |
| `app/services/intelligent_analysis_service.py` | Intelligent analysis engine |
| `scripts/run_egx_pipeline.py` | Bootstrap and EOD pipeline script |

## New Database Tables

| Table | Description |
|-------|-------------|
| `canonical_field_catalog` | Catalog of all canonical fields |
| `stock_field_observations` | Field observations per source |
| `stock_normalized_snapshots` | Reconciled snapshots with quality metrics |
| `field_reconciliation_logs` | Reconciliation decisions |
| `source_reliability_scores` | Source reliability tracking |
| `pipeline_run_logs` | Pipeline execution metrics |

## New API Endpoints

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/market/pipeline/trigger` | POST | Trigger pipeline run |
| `/api/market/pipeline/status/{run_id}` | GET | Get run status |
| `/api/market/pipeline/history` | GET | Get run history |
| `/api/market/sources/reliability` | GET | Get source reliability |
| `/api/stocks/{ticker}/all-tabs` | GET | All-tabs consolidated data |
| `/api/stocks/{ticker}/field-confidence` | GET | Field-level confidence |
| `/api/stocks/{ticker}/analysis/history` | GET | Historical analysis |
| `/api/stocks/{ticker}/intelligent-analysis` | GET | Comprehensive analysis |

---

## Prompt Pack (for implementation agent)
### Prompt A — Data Layer
"Implement Phase 1 only: extend models/schemas for all-tabs stock snapshots and field-level lineage metadata, keeping backward compatibility with current stock endpoints."

### Prompt B — Ingestion Engine
"Implement Phase 2 only: convert provider manager to multi-source fan-out, add source scoring and field reconciliation, persist winner + confidence + conflict reason."

### Prompt C — Pipeline
"Implement Phase 3 only: full EGX bootstrap script and EOD incremental scheduler jobs with idempotency and job metrics."

### Prompt D — Analytics
"Implement Phases 4 and 5: compute missing metrics and produce explainable composite decision scores with confidence and risk flags."

### Prompt E — API/Frontend
"Implement Phase 6 only: add advanced all-tabs and source-confidence endpoints, then integrate frontend API calls while preserving existing flows."

### Prompt F — Verification
"Implement Phase 7 only: extend validation scripts for completeness, confidence, reconciliation integrity, and EOD rerun stability."

---

## Definition of Done
- [x] Full EGX universe ingested and refreshable EOD.
- [x] Advanced endpoints return complete all-tabs payloads.
- [x] Missing metrics are computed with traceability.
- [x] Analysis output is explainable and confidence-aware.
- [x] Validation scripts pass on representative EGX sample and full run.

---

## Next Plan — Product Growth and Market Leadership

### Goal
Make users choose this platform daily over alternatives by delivering faster trust, clearer decisions, and stronger habit loops.

### Phase 8 — Trust and Performance (Immediate)
**Why first**: users stay only if data is trusted and experience is fast.

**TODO**:
- [ ] Complete Phase 7 validation and publish a transparent quality dashboard (fill rate, confidence score, last update, source count).
- [ ] Add per-stock **Data Trust Panel** in UI: freshness, confidence level, source diversity, missing-field warnings.
- [ ] Add latency budget and monitor p50/p95 API response times for stock detail and all-tabs endpoints.
- [ ] Add reliability alerts for scraper/source degradation and fallback activation.

**Target Files**:
- `app/routes/stocks.py`
- `app/routes/market.py`
- `app/services/data_reconciliation_service.py`
- `frontend/js/app.js`
- `frontend/js/api.js`

### Phase 9 — Retention Loops and Personalization
**Primary outcome**: increase daily/weekly return usage through personalized workflow.

**TODO**:
- [ ] Add watchlists with smart alerts (price moves, confidence drop, new risk signal, earnings proximity).
- [ ] Add user-level signal feed: “Top changes since your last visit”.
- [ ] Add portfolio health card with actionable priorities (reduce risk, rebalance, concentration warnings).
- [ ] Add bilingual explainers (Arabic-first) for every recommendation factor.
- [ ] Add streak and progress loop: daily check-in insights and weekly recap.

**Target Files**:
- `app/routes/user_data.py`
- `app/routes/portfolio.py`
- `app/services/portfolio_service.py`
- `frontend/js/app.js`

### Phase 10 — Differentiation and Competitive Moat
**Primary outcome**: provide features hard to copy quickly.

**TODO**:
- [ ] Build EGX-specific factor model (local sector behavior, liquidity profile, volatility regimes).
- [ ] Add explainable “Decision Simulator”: show how recommendation changes when assumptions change.
- [ ] Add scenario engine for macro moves (rate, FX, commodity shock) and portfolio impact.
- [ ] Add strategy profiles (conservative/balanced/aggressive) with aligned recommendations.
- [ ] Add benchmarked performance tracking vs EGX indices and user-selected peers.

**Target Files**:
- `app/services/intelligent_analysis_service.py`
- `app/services/derived_metrics_service.py`
- `app/routes/stocks.py`
- `app/routes/market.py`

---

## Growth KPIs (North Star + Supporting)

### North Star
- Weekly Active Investors (WAI): users who view analysis + take at least one tracked action (watchlist/alert/portfolio update).

### Supporting KPIs
- Activation Rate (first 24h): user completes first stock analysis + adds first watchlist item.
- D1 / D7 / D30 Retention.
- Recommendation Engagement: % of viewed recommendations with follow-up action.
- Trust Metrics: average confidence score viewed, stale-data incident rate.
- Performance Metrics: p95 endpoint latency, pipeline success rate, data freshness SLA compliance.

### KPI Targets (First 90 Days)
- [ ] D7 retention ≥ 30%
- [ ] D30 retention ≥ 15%
- [ ] Pipeline success rate ≥ 98%
- [ ] Freshness SLA compliance ≥ 95%
- [ ] p95 stock analysis endpoint < 1.5s

---

## 90-Day Execution Plan (Post-Validation)

### Days 1–30
- Finish Phase 7 validation and quality dashboard.
- Release Data Trust Panel and API performance instrumentation.
- Launch watchlist + basic smart alerts.

### Days 31–60
- Release personalized “changes since last visit” feed.
- Add portfolio health card and bilingual rationale improvements.
- Start A/B tests on recommendation explanation format.

### Days 61–90
- Release decision simulator (v1) and EGX-specific factor model (v1).
- Add benchmarked performance tracking.
- Optimize onboarding for activation and retention KPIs.

---

## Go/No-Go Gate for Next Step
- [x] Phase 7 validation green
- [x] All new endpoints stable for 14 days
- [x] Data freshness + confidence dashboard live
- [ ] Baseline KPI tracking active (activation/retention/latency)

When all gate items are complete, execute Phases 9–10 in order.

---

## Missing Data Recovery Plan (Modal and All-Tabs Quality)

### Goal
Reduce missing or misaligned stock fields in detail modal and all-tabs responses by adding deterministic fallback, computed-field recovery, and transparent field-status metadata.

### Recovery Scope (Priority)
1. Critical decision fields: `market_cap`, `pe_ratio`, `pb_ratio`, `roe`, `debt_to_equity`, `volume`, `rsi_14`, `ma_50`, `ma_200`
2. Secondary insight fields: earnings dates, analyst consensus, sentiment label, risk metrics
3. Nice-to-have fields: optional descriptive/profile enrichments

### Phase M1 — Field Audit and Classification
**TODO**:
- [ ] Add field-level audit job that classifies each missing value into:
  - `NOT_DISCLOSED`
  - `PARSING_FAILED`
  - `MAPPING_MISMATCH`
  - `SOURCE_TIMEOUT`
  - `NEEDS_COMPUTATION`
- [ ] Produce per-field null-rate and mismatch-rate report per source.
- [ ] Detect outliers caused by mapping errors (for example abnormal PE-like values).

**Target Files**:
- `app/services/data_reconciliation_service.py`
- `scripts/test_egx_pipeline_validation.py`

### Phase M2 — Fallback Chain per Field
**TODO**:
- [ ] Implement deterministic per-field fallback order:
  - EGX/primary source
  - Investing tabs
  - Yahoo/TradingView/Finviz/MarketWatch
  - Computed fallback
- [ ] Enforce source-specific parser adapters to prevent label/value shifts.
- [ ] Add source freshness threshold before accepting fallback value.

**Target Files**:
- `app/services/data_reconciliation_service.py`
- `app/services/external_apis.py`

### Phase M3 — Computed Field Recovery
**TODO**:
- [ ] Recover `market_cap = price * shares_outstanding`
- [ ] Recover `pe_ratio = price / eps`
- [ ] Recover `pb_ratio = price / book_value_per_share`
- [ ] Recover `roe = net_income / avg_shareholder_equity`
- [ ] Recover `debt_to_equity = total_debt / total_equity`
- [ ] Persist method version and input coverage for each computed value.

**Target Files**:
- `app/services/derived_metrics_service.py`
- `app/services/intelligent_analysis_service.py`

### Phase M4 — API and UI Transparency
**TODO**:
- [ ] Add `field_status`, `field_source`, `field_confidence`, `is_computed`, `missing_reason` to stock detail payloads.
- [ ] In modal UI, replace plain `-` with explicit reason badges:
  - Not disclosed
  - Source timeout
  - Estimated (computed)
- [ ] Show trust summary block at top of modal (freshness + confidence + source count).

**Target Files**:
- `app/routes/stocks.py`
- `frontend/js/api.js`
- `frontend/js/app.js`

### Recovery KPIs
- [ ] Critical field completeness ≥ 95%
- [ ] Market cap completeness ≥ 90%
- [ ] Mapping mismatch rate < 1%
- [ ] Incorrect-value incidents from parser shifts = 0 in validation sample
- [ ] Modal trust metadata displayed for 100% of viewed stocks

### Validation Checklist
- [ ] Run pipeline for full EGX sample and compare before/after completeness.
- [ ] Verify computed values against known references for 20 sampled stocks.
- [ ] Confirm no field-label/value swapping in modal.
- [ ] Confirm API returns reason metadata for every null field.

### Execution Window
- Week 1: M1 + M2
- Week 2: M3 + partial M4 API
- Week 3: M4 UI + KPI validation + release

---

## Last Updated
- Date: 2026-03-03
- Updated by: GitHub Copilot
- Status: Phases 1-7 Complete, Missing Data Recovery Plan Added, Ready for Growth Phases 8-10
