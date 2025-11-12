@echo off
echo.
echo ========================================
echo   SmartCrop OS - Starting Backend
echo ========================================
echo.

cd backend

echo Installing dependencies (if needed)...
call npm install --silent

echo.
echo Starting backend server...
echo Backend will run on: http://localhost:3000
echo Press Ctrl+C to stop
echo.

call npm run dev

