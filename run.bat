@echo off
set "PATH=%LOCALAPPDATA%\Programs\nodejs;%LOCALAPPDATA%\Programs\Git\cmd;%PATH%"
cd /d "%~dp0"
echo ===================================
echo   Starting GigEasy Web App...
echo ===================================
npm run web
pause
