@echo off
title ReceiptSolv Pro - Web Bishop Technology Ltd
echo ========================================================
echo       ReceiptSolv Pro - Receipt & Invoice Engine
echo            WEB BISHOP TECHNOLOGY LTD
echo ========================================================
echo.
echo Starting application server with Mobile Phone access enabled...
cd /d "%~dp0receipt-generator"

:: Give the server a moment then open local browser
start "" "http://localhost:5173"

echo.
echo [OK] Opening local browser at: http://localhost:5173
echo [OK] To open on your mobile phone connected to Wi-Fi, open: http://192.168.100.150:5173
echo.

:: Launch Vite Dev Server with network host enabled
call npm.cmd run dev -- --host
pause
