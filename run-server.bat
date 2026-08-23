@echo off
set "PATH=%LOCALAPPDATA%\Programs\nodejs;%LOCALAPPDATA%\Programs\Git\cmd;%PATH%"
cd /d "%~dp0server"
echo ====================================================
echo   Starting GigEasy PostgreSQL Real-Time Server...
echo   API: http://localhost:5000/api
echo   WebSocket: ws://localhost:5000/realtime
echo ====================================================
npm start
pause
