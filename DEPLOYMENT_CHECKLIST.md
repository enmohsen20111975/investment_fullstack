# EGX Investment Platform - Deployment Checklist

## Pre-Deployment Checklist

### 1. Hostinger Account Setup
- [ ] Log in to Hostinger hPanel
- [ ] Verify Business plan is active (required for Node.js)
- [ ] Note your server IP address
- [ ] Set up SSH access (optional but recommended)

### 2. Domain Configuration
- [ ] Domain is pointed to Hostinger nameservers
- [ ] DNS A record points to your Hostinger server IP
- [ ] WWW CNAME record configured (if needed)

### 3. Node.js App Setup in hPanel
- [ ] Go to **Advanced** → **Node.js**
- [ ] Click **Create Node.js App**
- [ ] Set App Name: `egx-investment`
- [ ] Select Node.js Version: `18.x` or `20.x`
- [ ] Set Mode: `Production`
- [ ] Set App URL: Your domain
- [ ] Set App Directory: `public_html` or custom
- [ ] Set Startup File: `server.js`
- [ ] **Note the assigned PORT number**

### 4. Prepare Files Locally
- [ ] Run `npm run build:css` to build production CSS
- [ ] Copy `.env.production` to `.env`
- [ ] Update `.env` with your production values:
  - [ ] Set `SECRET_KEY` (32+ characters)
  - [ ] Set `API_KEYS` (unique production keys)
  - [ ] Set `USER_API_KEY` (secure random key)
  - [ ] Set `CORS_ORIGINS` to your domain
  - [ ] Set `PORT` to Hostinger-assigned port
  - [ ] Update external API keys if needed

### 5. Security Settings
- [ ] Generate new `SECRET_KEY`: 
  ```bash
  node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
  ```
- [ ] Generate new `USER_API_KEY`:
  ```bash
  node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
  ```
- [ ] Update all API keys in `.env`

---

## File Upload Checklist

### Files to Upload (Required)
- [ ] `server.js` - Main application file
- [ ] `package.json` - Dependencies list
- [ ] `package-lock.json` - Dependency lock file
- [ ] `.env` - Environment configuration (with production values)
- [ ] `backend/` folder - All backend code
  - [ ] `backend/config.js`
  - [ ] `backend/database.js`
  - [ ] `backend/logger.js`
  - [ ] `backend/middleware/` (all files)
  - [ ] `backend/models/` (all files including enums/)
  - [ ] `backend/routes/` (all files)
  - [ ] `backend/services/` (all files)
- [ ] `frontend/` folder - All frontend files
  - [ ] `frontend/index.html`
  - [ ] `frontend/css/` (all CSS files)
  - [ ] `frontend/js/` (all JS files including modules/)
  - [ ] `frontend/images/` (all images)
- [ ] `scripts/init_db.js` - Database initialization
- [ ] `egx_investment.db` - Existing database (if any)

### Files to NOT Upload
- [ ] `node_modules/` - Will be installed on server
- [ ] `.git/` - Git repository data
- [ ] `logs/*.log` - Log files (keep directory)
- [ ] `temp-investment-course/` - Development files
- [ ] `skills/` - Development resources
- [ ] `*.bat` files - Windows scripts (optional)
- [ ] `Dockerfile`, `docker-compose.yml` - Docker files
- [ ] `requirements.txt`, `run_server.py` - Python files

---

## Post-Upload Checklist

### 1. Install Dependencies
Via SSH or Terminal:
```bash
cd ~/public_html  # or your app directory
npm install --production
```
- [ ] Dependencies installed successfully

### 2. Initialize Database
```bash
npm run init:db
```
- [ ] Database initialized successfully
- [ ] `egx_investment.db` file created

### 3. Set File Permissions
```bash
chmod 755 .
chmod 664 egx_investment.db
chmod 600 .env
chmod -R 755 frontend/
chmod -R 755 backend/
```
- [ ] Permissions set correctly

### 4. Start Application
- [ ] Restart Node.js app via hPanel
- [ ] OR via SSH: `pm2 start server.js --name egx-investment`

---

## SSL Certificate Checklist

- [ ] Go to **SSL** → **SSL Certificates** in hPanel
- [ ] Install **Let's Encrypt** (free) SSL certificate
- [ ] Enable **Force HTTPS** redirect
- [ ] Test: Visit `https://yourdomain.com`

---

## Verification Checklist

### 1. Health Check
- [ ] Visit: `https://yourdomain.com/health`
- [ ] Expected response:
  ```json
  {
    "status": "healthy",
    "version": "1.0.0",
    "timestamp": "...",
    "database": "connected"
  }
  ```

### 2. API Check
- [ ] Visit: `https://yourdomain.com/api`
- [ ] Expected response shows API endpoints

### 3. Frontend Check
- [ ] Visit: `https://yourdomain.com`
- [ ] Frontend loads correctly
- [ ] No console errors in browser
- [ ] CSS styles load properly
- [ ] JavaScript files load properly

### 4. API Endpoints Test
- [ ] Test `/api/stocks` endpoint
- [ ] Test `/api/market` endpoint
- [ ] Test authentication `/api/auth`

---

## Troubleshooting Quick Reference

| Issue | Solution |
|-------|----------|
| 502 Bad Gateway | Restart app, check port |
| Cannot find module | Run `npm install` |
| Database error | Check file permissions |
| CORS errors | Update CORS_ORIGINS in .env |
| App won't start | Check logs: `pm2 logs` |
| Static files 404 | Check frontend/ folder exists |

---

## Post-Deployment Tasks

- [ ] Set up uptime monitoring (UptimeRobot, etc.)
- [ ] Configure automatic backups
- [ ] Test all major features
- [ ] Monitor resource usage in hPanel
- [ ] Set up log rotation (optional)

---

## Useful Commands

```bash
# Check app status
pm2 status

# View logs
pm2 logs egx-investment

# Restart app
pm2 restart egx-investment

# Stop app
pm2 stop egx-investment

# Check Node.js version
node -v

# Check npm version
npm -v
```

---

## Contact & Support

- **Hostinger Support**: https://support.hostinger.com
- **GitHub Repository**: https://github.com/enmohsen20111975/investment_fullstack
- **Deployment Guide**: See `docs/HOSTINGER_DEPLOYMENT_GUIDE.md`

---

**Deployment Date**: _______________

**Deployed By**: _______________

**Domain**: _______________

**Server IP**: _______________

**Port**: _______________
