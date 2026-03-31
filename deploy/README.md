# EGX Investment Platform - Hostinger Deployment Guide

## 📦 Ready-to-Deploy Package

This folder contains EVERYTHING you need. No commands required!

**Just upload and configure in Hostinger hPanel.**

## 📁 Folder Structure

```
deploy/
├── server.js              # Main Node.js server
├── package.json           # Dependencies config
├── package-lock.json      # Dependency lock
├── .env                   # Your environment config (EDIT THIS!)
├── egx_investment.db      # Pre-initialized SQLite database
├── node_modules/          # All dependencies included (8441 files)
├── backend/               # Backend logic
├── frontend/              # Static frontend files
├── scripts/               # Utility scripts
└── logs/                  # Application logs
```

## 🚀 Hostinger Deployment Steps (No Commands Needed!)

### Step 1: Create Node.js App in hPanel
1. Log into Hostinger hPanel
2. Go to **Hosting** → **Manage**
3. Find **Node.js** in the menu
4. Click **Create App**
5. Set the following:
   - **App Name**: `egx-investment` (or any name you prefer)
   - **Domain**: Select your domain (e.g., `invist.m2y.net`)
   - **Node.js Version**: `18.x` or higher
   - **App Mode**: `Production`
   - **App Root**: `/public_html/invist` (or your chosen folder)
   - **App URL**: `/` (root) or your subdirectory
   - **Entry Point**: `server.js`

### Step 2: Upload Files via File Manager
1. Go to **Files** → **File Manager**
2. Navigate to your app root folder (e.g., `/public_html/invist/`)
3. Upload ALL files from this `deploy` folder:
   - You can zip the deploy folder and upload it
   - Then extract it in File Manager
   - OR upload files in batches

### Step 3: Edit Environment File
1. In File Manager, find `.env` file
2. Right-click → **Edit**
3. Update these critical values:

```env
# REQUIRED - Change these!
SECRET_KEY=your-super-secret-key-at-least-64-characters-long-random-string
API_KEYS=your-production-api-key-here

# Your domain
CORS_ORIGINS=https://invist.m2y.net,https://www.invist.m2y.net

# Production settings
NODE_ENV=production
DEBUG=false

# Server port (check Hostinger for assigned port)
PORT=8100
```

### Step 4: Restart the App
1. Go back to **Node.js** in hPanel
2. Find your app
3. Click **Restart**

### Step 5: Test Your App
Visit your domain: `https://invist.m2y.net`

You should see the EGX Investment Platform!

## ⚙️ Important Configuration

### Environment Variables (.env)
Make sure these are set correctly:

| Variable | Description | Example |
|----------|-------------|---------|
| `SECRET_KEY` | JWT secret (64+ chars) | Random string |
| `API_KEYS` | API authentication key | Your secure key |
| `CORS_ORIGINS` | Allowed domains | `https://yourdomain.com` |
| `NODE_ENV` | Environment | `production` |
| `PORT` | Server port | `8100` (or Hostinger assigned) |

### Database
- SQLite database is pre-initialized at `egx_investment.db`
- Contains 60 EGX stocks and 5 market indices
- Default admin user is created

### Default Admin Credentials
- **Email**: `admin@egx.com`
- **Password**: `admin123`
- **API Key**: See the log output or create new one

**⚠️ CHANGE THE ADMIN PASSWORD AFTER FIRST LOGIN!**

## 🔧 Troubleshooting

### App Not Starting?
1. Check `.env` file exists and has correct values
2. Check `NODE_ENV=production`
3. Verify Node.js version is 18+
4. Check File Manager for error logs in `logs/` folder

### Database Errors?
1. Verify `egx_investment.db` file exists
2. Check file permissions (644)
3. Ensure the database file wasn't corrupted during upload

### CORS Errors?
1. Update `CORS_ORIGINS` in `.env` with your domain
2. Include both `https://` and `https://www.` versions
3. Restart the app after changes

### Can't Access API?
1. Check if app is running in hPanel
2. Verify the port matches Hostinger's assignment
3. Check SSL is enabled for HTTPS

## 📊 File Count

- Total files: ~8,500+
- node_modules: ~8,441 files
- Application code: ~73 files
- Database: 1 file

## 🔄 Updating the App

To update:
1. Upload new files to server (overwrite existing)
2. If `package.json` changed, you may need to run `npm install` via SSH
3. Restart the app in hPanel

## 📞 Support

If you encounter issues:
1. Check Hostinger's Node.js documentation
2. Review error logs in `logs/app.log`
3. Contact Hostinger support for server-related issues

---

**Good luck with your deployment! 🎉**
