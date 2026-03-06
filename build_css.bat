@echo off
REM Build Tailwind CSS using standalone CLI
REM Download tailwindcss.exe from: https://github.com/tailwindlabs/tailwindcss/releases/latest

if not exist tailwindcss.exe (
    echo ERROR: tailwindcss.exe not found!
    echo Please download it from: https://github.com/tailwindlabs/tailwindcss/releases/latest
    echo Look for: tailwindcss-windows-x64.exe
    echo Rename it to: tailwindcss.exe
    pause
    exit /b 1
)

echo Building Tailwind CSS...
tailwindcss.exe -i ./frontend/css/input.css -o ./frontend/css/tailwind.css --minify

if %ERRORLEVEL% EQU 0 (
    echo CSS built successfully!
) else (
    echo Build failed!
    pause
)
