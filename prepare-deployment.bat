@echo off
REM EGX Investment Platform - Deployment Package Creator
REM This script creates a deployment-ready ZIP file for Hostinger

echo ============================================
echo EGX Investment Platform - Deployment Prep
echo ============================================
echo.

REM Set variables
set DEPLOY_DIR=deploy-package
set TIMESTAMP=%date:~-4,4%%date:~-7,2%%date:~-10,2%_%time:~0,2%%time:~3,2%
set TIMESTAMP=%TIMESTAMP: =0%
set ZIP_FILE=egx-investment-deploy-%TIMESTAMP%.zip

echo [1/6] Cleaning previous deployment folder...
if exist "%DEPLOY_DIR%" rmdir /s /q "%DEPLOY_DIR%"
mkdir "%DEPLOY_DIR%"

echo [2/6] Creating directory structure...
mkdir "%DEPLOY_DIR%\backend\middleware"
mkdir "%DEPLOY_DIR%\backend\models\enums"
mkdir "%DEPLOY_DIR%\backend\routes"
mkdir "%DEPLOY_DIR%\backend\services"
mkdir "%DEPLOY_DIR%\frontend\css"
mkdir "%DEPLOY_DIR%\frontend\js\modules"
mkdir "%DEPLOY_DIR%\frontend\images"
mkdir "%DEPLOY_DIR%\scripts"
mkdir "%DEPLOY_DIR%\logs"

echo [3/6] Copying backend files...
copy backend\config.js "%DEPLOY_DIR%\backend\"
copy backend\database.js "%DEPLOY_DIR%\backend\"
copy backend\logger.js "%DEPLOY_DIR%\backend\"
copy backend\middleware\*.js "%DEPLOY_DIR%\backend\middleware\"
copy backend\models\*.js "%DEPLOY_DIR%\backend\models\"
copy backend\models\enums\*.js "%DEPLOY_DIR%\backend\models\enums\"
copy backend\routes\*.js "%DEPLOY_DIR%\backend\routes\"
copy backend\services\*.js "%DEPLOY_DIR%\backend\services\"

echo [4/6] Copying frontend files...
copy frontend\index.html "%DEPLOY_DIR%\frontend\"
copy frontend\css\*.css "%DEPLOY_DIR%\frontend\css\"
copy frontend\js\*.js "%DEPLOY_DIR%\frontend\js\"
copy frontend\js\modules\*.js "%DEPLOY_DIR%\frontend\js\modules\"
copy frontend\images\*.svg "%DEPLOY_DIR%\frontend\images\"

echo [5/6] Copying root files...
copy server.js "%DEPLOY_DIR%\"
copy package.json "%DEPLOY_DIR%\"
copy package-lock.json "%DEPLOY_DIR%\"
copy .env.production "%DEPLOY_DIR%\.env.example"
copy scripts\init_db.js "%DEPLOY_DIR%\scripts\"
copy egx_investment.db "%DEPLOY_DIR%\" 2>nul
if exist egx_investment.db (
    echo Database file copied.
) else (
    echo No existing database file - will be created on first run.
)

echo [6/6] Creating ZIP archive...
powershell -Command "Compress-Archive -Path '%DEPLOY_DIR%\*' -DestinationPath '%ZIP_FILE%' -Force"

echo.
echo ============================================
echo Deployment package created successfully!
echo ============================================
echo.
echo ZIP file: %ZIP_FILE%
echo.
echo IMPORTANT: Before uploading to Hostinger:
echo 1. Rename .env.example to .env
echo 2. Update all values in .env with your production settings
echo 3. Change all API keys and SECRET_KEY
echo 4. Set your domain in CORS_ORIGINS
echo.
echo See docs/HOSTINGER_DEPLOYMENT_GUIDE.md for detailed instructions.
echo.

pause
