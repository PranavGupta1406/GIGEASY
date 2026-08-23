@echo off
set "PATH=%LOCALAPPDATA%\Programs\nodejs;%LOCALAPPDATA%\Programs\Git\cmd;%PATH%"
cd /d "%~dp0"
echo ===================================
echo   Starting GigEasy for Mobile...
echo ===================================
npm start
pause
