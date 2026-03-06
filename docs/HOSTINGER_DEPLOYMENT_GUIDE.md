# EGX Investment Platform - Hostinger Deployment Guide

This guide will walk you through deploying your full-stack EGX Investment Platform to Hostinger's Business hosting plan.

## Table of Contents
1. [Prerequisites](#prerequisites)
2. [Prepare Your Application](#prepare-your-application)
3. [Hostinger Setup](#hostinger-setup)
4. [Upload Files](#upload-files)
5. [Environment Configuration](#environment-configuration)
6. [Database Setup](#database-setup)
7. [Start Your Application](#start-your-application)
8. [Domain Configuration](#domain-configuration)
9. [Troubleshooting](#troubleshooting)

---

## Prerequisites

### What You Need:
- **Hostinger Business Plan** (with Node.js support)
- **Domain name** (optional, can use Hostinger subdomain)
- **FTP client** (FileZilla recommended) OR use Hostinger File Manager
- **SSH access** (available on Business plans)

### Check Hostinger Requirements:
- Node.js version: 18.x or higher
- npm version: 9.x or higher
- Database: SQLite (default) or MySQL/PostgreSQL

---

## Prepare Your Application

### Step 1: Create Production Environment File

Create a `.env` file with production settings:

```env
# Application
APP_NAME=EGX Investment API
APP_VERSION=1.0.0
DEBUG=false
ENVIRONMENT=production
NODE_ENV=production

# Database - SQLite (easiest for Hostinger)
DATABASE_URL=sqlite://./egx_investment.db

# Security - CHANGE THESE!
API_KEYS=your-production-api-key-here
SECRET_KEY=your-super-secret-production-key-min-32-characters-long

# CORS - Set your domain
CORS_ORIGINS=https://yourdomain.com,https://www.yourdomain.com

# Scheduler
SCHEDULER_ENABLED=true
DATA_UPDATE_INTERVAL_MINUTES=15

# External API Keys - Keep your existing keys or update
TWELVE_DATA_API_KEY=your-twelvedata-key
EODHD_API_KEY=your-eodhd-key
TOGETHER_API_KEY=your-together-api-key
TOGETHER_MODEL=Qwen3-Next-80B-A3B-Instruct

# User API Key
USER_API_KEY=your-secure-user-api-key

# Logging
LOG_LEVEL=INFO
LOG_FILE=logs/app.log

# Port (Hostinger will provide this)
PORT=3000
```

### Step 2: Build CSS for Production

Run this command locally before uploading:

```bash
npm run build:css
```

### Step 3: Install Production Dependencies

```bash
npm ci --only=production
```

### Step 4: Files to Upload

Create a deployment package with these files and folders:

```
✅ UPLOAD (Required):
├── backend/
│   ├── config.js
│   ├── database.js
│   ├── logger.js
│   ├── middleware/
│   ├── models/
│   ├── routes/
│   └── services/
├── frontend/
│   ├── index.html
│   ├── css/
│   ├── js/
│   └── images/
├── scripts/
│   └── init_db.js
├── server.js
├── package.json
├── package-lock.json
├── .env (your production config)
└── egx_investment.db (if you have existing data)

❌ DO NOT UPLOAD:
├── node_modules/ (will install on server)
├── .git/
├── logs/*.log (except keep directory)
├── temp-investment-course/
├── skills/
├── docs/ (optional, not needed for production)
├── .env.example
├── Dockerfile
├── docker-compose.yml
├── *.bat files
└── requirements.txt (Python, not needed)
```

---

## Hostinger Setup

### Step 1: Access Hostinger Control Panel (hPanel)

1. Log in to Hostinger: https://hpanel.hostinger.com
2. Select your hosting plan
3. Navigate to **Hosting** → **Dashboard**

### Step 2: Enable Node.js

1. Go to **Advanced** → **Node.js**
2. Click **Create Node.js App**
3. Configure:
   - **App Name**: `egx-investment`
   - **Node.js Version**: `18.x` or `20.x` (recommended)
   - **Mode**: `Production`
   - **App URL**: Select your domain or subdomain
   - **App Directory**: `/public_html` or custom path
   - **Startup File**: `server.js`

### Step 3: Note Your Port

Hostinger will assign a port. Note it down (e.g., `3000`, `8080`, etc.)

---

## Upload Files

### Option A: Using File Manager (Easiest)

1. In hPanel, go to **Files** → **File Manager**
2. Navigate to your app directory (e.g., `public_html` or your Node.js app folder)
3. Upload all files from your deployment package
4. Extract if you uploaded a ZIP file

### Option B: Using FTP (FileZilla)

1. In hPanel, go to **Files** → **FTP Access**
2. Create FTP account or use existing
3. Connect using FileZilla:
   - **Host**: `ftp.yourdomain.com` or server IP
   - **Username**: Your FTP username
   - **Password**: Your FTP password
   - **Port**: `21`
4. Upload files to your app directory

### Option C: Using SSH (Advanced)

```bash
# Connect via SSH
ssh username@yourdomain.com

# Navigate to app directory
cd ~/public_html  # or your app path

# Upload files using scp from local machine
scp -r ./deployment-package/* username@yourdomain.com:~/public_html/
```

---

## Environment Configuration

### Step 1: Create .env File

1. In File Manager, create a new file named `.env`
2. Add your production environment variables (see Step 1 above)
3. **Important**: Update the `PORT` to match your Hostinger-assigned port

### Step 2: Update CORS Origins

In your `.env` file, set your actual domain:

```env
CORS_ORIGINS=https://yourdomain.com,https://www.yourdomain.com
```

---

## Database Setup

### Option A: SQLite (Recommended for simplicity)

Your app is configured to use SQLite by default. The database file `egx_investment.db` will be created automatically.

1. Ensure the `egx_investment.db` file has write permissions
2. Run database initialization via SSH:

```bash
cd ~/public_html  # or your app path
npm run init:db
```

### Option B: MySQL (Hostinger provides this)

1. In hPanel, go to **Databases** → **MySQL Databases**
2. Create a new database and user
3. Update your `.env`:

```env
DATABASE_URL=mysql://db_user:db_password@localhost:3306/db_name
```

4. Install MySQL package:

```bash
npm install mysql2
```

---

## Start Your Application

### Step 1: Install Dependencies

Via SSH or Terminal in hPanel:

```bash
cd ~/public_html  # or your app path
npm install --production
```

### Step 2: Start the App

#### Using Hostinger Node.js Manager:
1. Go to **Node.js** in hPanel
2. Click **Restart** on your app

#### Using SSH (with PM2):
```bash
cd ~/public_html
npm install -g pm2
pm2 start server.js --name egx-investment
pm2 save
pm2 startup
```

### Step 3: Verify It's Running

1. Visit your domain: `https://yourdomain.com`
2. Check API health: `https://yourdomain.com/health`
3. You should see:
```json
{
  "status": "healthy",
  "version": "1.0.0",
  "timestamp": "2024-...",
  "database": "connected"
}
```

---

## Domain Configuration

### Step 1: Set Up SSL (HTTPS)

1. In hPanel, go to **SSL** → **SSL Certificates**
2. Install **Let's Encrypt** (free) or use custom SSL
3. Force HTTPS redirect

### Step 2: Configure DNS (if using custom domain)

1. Go to **Domains** → **DNS Zone Editor**
2. Ensure A record points to your Hostinger server IP
3. Add CNAME for `www` if needed

### Step 3: Update Frontend API URLs

If your frontend makes API calls, ensure they point to your domain:

In `frontend/js/api.js`, verify the API base URL:
```javascript
const API_BASE = 'https://yourdomain.com/api';
```

---

## Troubleshooting

### Common Issues and Solutions

#### 1. "Cannot find module" Error
```bash
# Solution: Reinstall dependencies
npm install --production
```

#### 2. Database Connection Failed
```bash
# Check database file permissions
chmod 664 egx_investment.db
chmod 775 .
```

#### 3. Port Already in Use
- Check Hostinger Node.js settings for assigned port
- Update `.env` PORT value

#### 4. App Crashes on Start
```bash
# Check logs
pm2 logs egx-investment
# or
cat logs/app.log
```

#### 5. CORS Errors
- Update `CORS_ORIGINS` in `.env` to include your domain
- Restart the app after changes

#### 6. 502 Bad Gateway
- App may not be running - restart via hPanel or SSH
- Check if port matches Hostinger configuration

#### 7. Static Files Not Loading
- Verify `frontend/` directory is uploaded
- Check file permissions: `chmod -R 755 frontend/`

### Checking Logs

#### Via SSH:
```bash
# PM2 logs
pm2 logs

# Application logs
tail -f logs/app.log
tail -f logs/error.log
```

#### Via File Manager:
- Navigate to `logs/` folder
- Download and view `app.log` and `error.log`

---

## Quick Deployment Checklist

- [ ] Hostinger Business plan active
- [ ] Node.js app created in hPanel
- [ ] All files uploaded (except node_modules, .git, etc.)
- [ ] `.env` file created with production settings
- [ ] Dependencies installed (`npm install --production`)
- [ ] Database initialized (`npm run init:db`)
- [ ] App started/restarted
- [ ] SSL certificate installed
- [ ] Domain DNS configured
- [ ] Health check passes (`/health` endpoint)
- [ ] Frontend loads correctly
- [ ] API endpoints work

---

## Post-Deployment

### Set Up Automatic Data Updates

Your app has a scheduler for automatic data updates. Ensure it's enabled:

```env
SCHEDULER_ENABLED=true
DATA_UPDATE_INTERVAL_MINUTES=15
```

### Monitor Your App

1. Set up uptime monitoring (UptimeRobot, etc.)
2. Check logs regularly
3. Monitor resource usage in hPanel

### Backup Strategy

1. **Database**: Regularly backup `egx_investment.db`
2. **Environment**: Keep a secure copy of `.env`
3. **Code**: Maintain Git repository

---

## Support Resources

- **Hostinger Knowledge Base**: https://support.hostinger.com
- **Hostinger Node.js Guide**: https://support.hostinger.com/articles/4805608
- **PM2 Documentation**: https://pm2.keymetrics.io/docs/usage/quick-start/

---

## Security Recommendations

1. **Change all default keys** in `.env`
2. **Use strong SECRET_KEY** (32+ characters)
3. **Enable HTTPS** (SSL certificate)
4. **Restrict CORS** to your domain only
5. **Keep dependencies updated**:
   ```bash
   npm audit
   npm audit fix
   ```
6. **Set proper file permissions**:
   - Directories: 755
   - Files: 644
   - `.env`: 600 (restricted)

---

Good luck with your deployment! If you encounter any issues, refer to the Troubleshooting section or contact Hostinger support.
