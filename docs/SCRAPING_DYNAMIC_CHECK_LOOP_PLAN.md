# Scraping Upgrade Plan: Dynamic Browser + Full Source Check Loop

## Goal
Upgrade the scraping layer to maximize real data coverage by combining:
1. Static HTTP parsing (`httpx`) for speed.
2. Dynamic browser automation (`Playwright`) for JS-rendered pages.
3. A unified per-source check loop that retries in dynamic mode when static mode is insufficient.

This document is designed as a handoff/runbook for any AI coding assistant.

## Scope Implemented
- Added dynamic scraping fallback into `OpenSourcesIntelligenceService`.
- Added per-source check loop for all configured sources:
  - yahoo_finance
  - sa_investing
  - tradingview
  - finviz
  - marketwatch
- Added click/scroll/wait browser actions to reveal more data in JS-heavy pages.
- Added second-level action loop for blocked/low-coverage sources (`sa_investing`, `finviz`):
  - tab traversal attempts
  - next-page click attempts
  - repeated scroll cycles after each action round
- Added attempt tracking metadata in payloads (`check_loop_attempts`).

## Files Changed
- `app/services/open_sources_service.py`
- `requirements.txt`

## Core Architecture

### 1) Static-first, Dynamic-fallback strategy
For each source:
- Step A: Run existing static fetcher (HTTP + parsing).
- Step B: If static result is unavailable, launch dynamic flow for that same source.
- Step C: Return first available payload, otherwise return best unavailable payload with diagnostics.

Rationale:
- Keeps runtime and infra cost low for sources that already work with static HTTP.
- Improves completeness for sites requiring browser JS execution or consent clicks.

### 2) Full Source Check Loop
`_run_source_check_loop(ticker, source_name, fetcher)`:
- Executes static fetch.
- Logs attempt metadata as structured list.
- Executes dynamic fetch for same source when static is unavailable.
- Returns payload with:
  - `check_loop_attempts`
  - `fallback_used` (when dynamic succeeds)
  - `dynamic_fallback_available`

### 3) Dynamic Browser Workflow
`_fetch_dynamic_html(...)` uses Playwright and performs:
- Headless Chromium launch.
- Page navigation (`goto`) with timeout.
- Consent/cookie button clicking via candidate selectors.
- Wait selector probing (comma-separated alternatives).
- Repeated bottom scrolling to trigger lazy loading / infinite lists.
- Secondary action rounds for selected sources:
  - click through known tab selectors
  - click through pagination/next selectors
  - re-scroll after each round
- DOM extraction via `page.content()`.

### 4) Secondary Action Loop (New)
`\_run_secondary_dynamic_actions(page, action_plan)` executes bounded rounds:
- `rounds`: number of action rounds.
- `tab_selectors`: selectors clicked sequentially each round.
- `next_page_selectors`: selectors used to advance pages.
- `next_clicks_per_round`: how many next attempts each round.

This loop is currently enabled with stronger plans for:
- `sa_investing`
- `finviz`

Design intent:
- Keep retries bounded and deterministic.
- Increase odds of extracting JS-hidden/paginated sections.
- Avoid infinite navigation loops.

## Source Matrix (Dynamic Candidates)

### yahoo_finance
- URL: `https://finance.yahoo.com/quote/{ticker}.CA`
- Actions: consent click + scroll
- Parse hints: title + price keywords

### sa_investing
- URLs:
  - `https://sa.investing.com/equities/{ticker}`
  - `https://sa.investing.com/equities/egypt`
- Actions: consent click + scroll
- Parse hints: title + price keywords + ticker presence

### tradingview
- URL: `https://www.tradingview.com/symbols/EGX-{ticker}/`
- Actions: consent click + scroll
- Parse hints: technical sections + title/ticker

### finviz
- URLs:
  - `https://finviz.com/quote.ashx?t={ticker}`
  - `https://finviz.com/quote.ashx?t={ticker}.CA`
- Actions: scroll + tab attempts + limited next-page attempts
- Parse hints: quote table footprint + P/E hint + title

### marketwatch
- URLs:
  - `https://www.marketwatch.com/investing/stock/{ticker}`
  - `https://www.marketwatch.com/markets`
- Actions: consent click + scroll
- Parse hints: title + ticker presence

## How to Run (Ops)
1. Install Python deps:
   - `pip install -r requirements.txt`
2. Install Playwright browser runtime:
   - `python -m playwright install chromium`
3. Run your normal pipeline/API startup.

## Data Contract Additions
Each source payload may now include:
- `check_loop_attempts`: list of static/dynamic attempt status.
- `fallback_used`: true when dynamic mode provided final success.
- `mode`: `dynamic` for dynamic-derived payloads.

These fields are backward-compatible additions.

## Reliability Notes
- Dynamic mode is optional: if Playwright is not installed, static mode still runs.
- Playwright import is guarded, avoiding hard crash at import-time.
- Dynamic failures are logged at debug level and do not break pipeline execution.

## Performance Notes
- Static mode remains primary for speed.
- Dynamic mode introduces higher latency and CPU cost; only used when static is unavailable.
- Scroll depth is intentionally bounded (`DYNAMIC_SCROLL_STEPS`).

## Extension Guide (For Other AI Coders)

### Add a new source
1. Add source fetcher in `build_stock_intelligence` fetcher list.
2. Implement `_fetch_<source>_snapshot` (static).
3. Add dynamic candidate entries in `_fetch_dynamic_snapshot` source map.
4. Add source-specific parsing branch in `_parse_dynamic_snapshot`.

### Improve extraction depth
- Add stronger selectors for rendered price/volume widgets.
- Add source-specific click actions for tabs (e.g., technicals, financials, news).
- Add pagination click loops when table page controls are detected.

### Tune source action plans
Action plans are configured per candidate URL in `\_fetch_dynamic_snapshot`.
For each plan, tune:
- `tab_selectors`
- `next_page_selectors`
- `rounds`
- `next_clicks_per_round`

Tip: keep selector lists ordered from most stable to least stable.

### Add stronger observability
- Emit per-source timing (static and dynamic duration).
- Emit dynamic action logs (clicked selectors, scroll count, wait selector hit).

## Validation Checklist
- [ ] Static source still returns data when available.
- [ ] Dynamic fallback activates when static source blocked/unavailable.
- [ ] Payload includes `check_loop_attempts` for every source.
- [ ] No pipeline failure when Playwright is missing.
- [ ] Browser runtime installed in deployment image/host.

## Known Limitations
- Some providers can still block bot traffic even in headless browser mode.
- Selector footprints may require periodic updates when sites change layout.
- Current loop does not yet perform deep multi-tab traversal per source.

## Next Recommended Iteration
- Add adaptive per-source action plans (tab click chains, next-page loops).
- Add anti-block hygiene (jittered waits, rotating headers/proxies where legal and compliant).
- Add cached snapshots and rate-limited refresh orchestration.
