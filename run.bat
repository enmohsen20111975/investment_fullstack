@echo off
echo ========================================
echo EGX Investment Platform - Node.js Server
echo ========================================
echo.

REM Check if Node.js is installed
where node >nul 2>nul
if %errorlevel% neq 0 (
    echo ERROR: Node.js is not installed!
    echo Please install Node.js from: https://nodejs.org/
    echo Download the LTS version and install it.
    pause
    exit /b 1
)

echo Node.js version:
node --version
echo.

REM Check if node_modules exists
if not exist "node_modules" (
    echo Installing dependencies...
    echo This may take a few minutes...
    echo.
    call npm install
    if %errorlevel% neq 0 (
        echo ERROR: Failed to install dependencies
        pause
        exit /b 1
    )
    echo.
    echo Dependencies installed successfully!
    echo.
)

REM Check if database exists
if not exist "egx_investment.db" (
    echo Database not found. Initializing database...
    echo.
    call node scripts/init_db.js
    if %errorlevel% neq 0 (
        echo ERROR: Failed to initialize database
        pause
        exit /b 1
    )
    echo.
    echo Database initialized successfully!
    echo IMPORTANT: Save the API key shown above!
    echo.
)

echo Starting server on http://127.0.0.1:8100
echo Press Ctrl+C to stop the server
echo.
echo ========================================
echo.

node server.js

pause