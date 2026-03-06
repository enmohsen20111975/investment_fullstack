# Unified VPS Plan — m2y.net + Both Apps + SSO

## Context

Two products, one 4GB/2vCPU VPS:
1. **EngiSuite Analytics** (`/applications/engisuite-analytics`) — already live, Nginx + Systemd, JWT auth + Stripe/Paymob subscriptions
2. **Investment Fullstack** (`/applications/investment_fullstack`) — EGX investment platform, Docker Compose, API-Key auth, no subscription yet

**Goal:**
- `m2y.net` → unified landing page
- `invest.m2y.net` → investment app (port 8010)
- `suite.m2y.net` → EngiSuite (port 8000)
- **Shared login (SSO)** — one account works on both apps
- **Separate subscriptions** — user pays independently per app

---

## Architecture Overview

```
                Internet
                   │
              [Nginx + SSL]  ← certbot wildcard or per-subdomain
                   │
     ┌─────────────┼──────────────┐
     │             │              │
  m2y.net    invest.m2y.net  suite.m2y.net
 (static)      port 8010       port 8000
  landing    (Docker Compose) (Systemd)
```

**SSO Strategy — JWT Federation (shared secret key):**
- Both apps share the **same** `JWT_SECRET_KEY` in their `.env` files
- A JWT issued by either app is accepted by the other — no cross-service calls needed
- JWT payload: `user_id`, `email`, `tier` (checked per-app)
- Investment app adds JWT Bearer auth alongside its existing API-key auth

---

## Phase 1 — Nginx Configuration

**File to update:** `engisuite-analytics/ops/nginx_m2y.conf`

Add/update these server blocks:

```nginx
# Landing page — m2y.net
server {
    listen 443 ssl;
    server_name m2y.net www.m2y.net;
    root /var/www/m2y_landing;
    index index.html;
    ssl_certificate /etc/letsencrypt/live/m2y.net/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/m2y.net/privkey.pem;
    location / { try_files $uri /index.html; }
}

# Investment app — invest.m2y.net
server {
    listen 443 ssl;
    server_name invest.m2y.net;
    ssl_certificate /etc/letsencrypt/live/invest.m2y.net/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/invest.m2y.net/privkey.pem;
    location / {
        proxy_pass http://127.0.0.1:8010;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    }
}

# EngiSuite — suite.m2y.net (update existing block)
server {
    listen 443 ssl;
    server_name suite.m2y.net;
    ... existing config ...
}

# HTTP → HTTPS redirect for all
server {
    listen 80;
    server_name m2y.net www.m2y.net invest.m2y.net suite.m2y.net;
    return 301 https://$host$request_uri;
}
```

**SSL:** Run certbot for each subdomain:
```bash
certbot --nginx -d m2y.net -d www.m2y.net
certbot --nginx -d invest.m2y.net
# suite.m2y.net already handled
```

---

## Phase 2 — Landing Page (m2y.net)

**New directory:** `/var/www/m2y_landing/` on VPS (track in repo as `landing/`)

**`landing/index.html`** — Static bilingual (EN/AR) page:
- Hero section describing both products
- "Open Investment App" button → `https://invest.m2y.net`
- "Open EngiSuite" button → `https://suite.m2y.net`
- Pricing section — side-by-side plans for both apps
- Footer with contact info

No backend needed — pure static HTML.

---

## Phase 3 — Investment App: Add JWT Auth (SSO)

### 3a. Config (`app/config.py`)
```python
JWT_SECRET_KEY: str = "same-key-as-engisuite"   # MUST match EngiSuite
JWT_ALGORITHM: str = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES: int = 30
```

### 3b. Auth Middleware (`app/middleware/auth.py`)
- Add `validate_jwt_token(token) → User | None`
  - Decode JWT using `python-jose`
  - Look up user by `email` from token claims
  - Auto-create user record on first JWT login (email as unique key)
- Update `get_current_user()` dependency:
  1. Try `Authorization: Bearer <token>` → JWT validation
  2. Fall back to `X-API-Key` header → existing key validation

### 3c. Auth Routes (`app/routes/auth.py`)
- `POST /auth/login` — issues JWT (same format as EngiSuite) + existing API key
- `GET /auth/me` — works with both JWT and API key auth
- `POST /auth/register` — creates user + issues JWT
- `POST /auth/google` — Google OAuth → JWT

### 3d. Dependencies (`requirements.txt`)
```
python-jose[cryptography]
stripe
```

---

## Phase 4 — Investment App: Subscription System

### 4a. Models (`app/models/models.py`)
```python
# Add to User model:
tier: str = "free"               # free | starter | pro
subscription_end_date: datetime | None = None

# New table:
class SubscriptionHistory(Base):
    user_id, tier, start_date, end_date, payment_id, gateway
```

### 4b. Schemas (`app/schemas/schemas.py`)
```python
class SubscriptionPlan(BaseModel):
    id: str        # "free" | "starter" | "pro"
    name: str
    price_usd: float
    features: list[str]

class UserSubscription(BaseModel):
    tier: str
    end_date: datetime | None
    is_active: bool
```

### 4c. Payment Routes (`app/routes/payments.py` — NEW)
```
GET  /payments/plans           → list of plans + prices
POST /payments/subscribe       → create Stripe checkout session
POST /payments/webhook         → Stripe webhook → activate subscription
GET  /payments/my-subscription → current tier + end date
```

### 4d. Access Control (`app/middleware/auth.py`)
```python
def require_tier(min_tier: str):
    """Dependency factory for premium endpoint protection."""
    async def check(user = Depends(get_current_user)):
        if tier_rank(user.tier) < tier_rank(min_tier):
            raise HTTPException(403, "Upgrade required")
    return check
```
Apply to: AI analysis endpoints, deep insights, portfolio recommendations.

### 4e. Register in main (`app/main.py`)
```python
from app.routes.payments import router as payments_router
app.include_router(payments_router, prefix="/api/payments", tags=["payments"])
```

---

## Phase 5 — CORS Updates

### EngiSuite (`engisuite-analytics/backend/main.py`)
```python
allow_origins=["https://m2y.net", "https://www.m2y.net",
               "https://invest.m2y.net", "https://suite.m2y.net"]
```

### Investment App (`investment_fullstack/app/main.py`)
```python
allow_origins=["https://m2y.net", "https://www.m2y.net",
               "https://invest.m2y.net", "https://suite.m2y.net"]
```

---

## Phase 6 — VPS Deployment Steps

```bash
# 1. Pull investment app on VPS
cd /applications/investment_fullstack
git pull

# 2. Configure .env — CRITICAL: same JWT_SECRET_KEY as EngiSuite
cp .env.example .env
nano .env   # set JWT_SECRET_KEY, STRIPE_SECRET_KEY, etc.

# 3. Start investment app
docker-compose up -d
docker-compose exec api python scripts/init_db.py

# 4. Deploy landing page
mkdir -p /var/www/m2y_landing
cp landing/index.html /var/www/m2y_landing/

# 5. Update Nginx and reload
cp engisuite-analytics/ops/nginx_m2y.conf /etc/nginx/sites-available/m2y.conf
ln -sf /etc/nginx/sites-available/m2y.conf /etc/nginx/sites-enabled/
nginx -t && systemctl reload nginx

# 6. Issue SSL certs
certbot --nginx -d m2y.net -d www.m2y.net -d invest.m2y.net
```

---

## Files to Create / Modify

| File | Action |
|------|--------|
| `engisuite-analytics/ops/nginx_m2y.conf` | Add invest.m2y.net + m2y.net server blocks |
| `investment_fullstack/app/config.py` | Add JWT_SECRET_KEY, JWT_ALGORITHM |
| `investment_fullstack/app/middleware/auth.py` | Add JWT validation, require_tier() |
| `investment_fullstack/app/routes/auth.py` | Add JWT login/register/google endpoints |
| `investment_fullstack/app/models/models.py` | Add tier, subscription_end_date, SubscriptionHistory |
| `investment_fullstack/app/schemas/schemas.py` | Add subscription schemas |
| `investment_fullstack/app/routes/payments.py` | **NEW** — payment routes |
| `investment_fullstack/app/main.py` | Register payments router, update CORS |
| `investment_fullstack/requirements.txt` | Add python-jose, stripe |
| `engisuite-analytics/backend/main.py` | Update CORS allowed origins |
| `landing/index.html` | **NEW** — m2y.net landing page |

---

## Implementation Order

1. **Nginx config** — route all 3 domains, get SSL working (verify before any code changes)
2. **Landing page** — static HTML (fast, visible immediately)
3. **JWT auth in investment app** — SSO foundation (Phase 3)
4. **Subscription system in investment app** — payment tier enforcement (Phase 4)
5. **CORS updates** — cross-domain API calls (Phase 5)

---

## Verification Checklist

- [ ] `curl https://m2y.net` → landing page HTML
- [ ] `curl https://invest.m2y.net/health` → 200 OK
- [ ] `curl https://suite.m2y.net/api/health` → 200 OK
- [ ] Login at `suite.m2y.net` → copy JWT → call `invest.m2y.net/api/auth/me` with Bearer token → user info returned (SSO works)
- [ ] Login at `invest.m2y.net` → copy JWT → call `suite.m2y.net/auth/me` → user info returned (bidirectional SSO)
- [ ] Subscribe at `invest.m2y.net/api/payments/subscribe` → tier upgrades → premium endpoints unlock
- [ ] `docker stats` on VPS → both apps under 4GB RAM combined
- [ ] HTTP redirects to HTTPS on all domains
