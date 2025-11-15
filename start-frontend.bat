@echo off
echo.
echo ========================================
echo   CropWise - Starting Frontend
echo ========================================
echo.

cd frontend

echo Installing dependencies (if needed)...
call npm install --silent

echo.
echo Starting frontend server...
echo Frontend will run on: http://localhost:8080
echo Press Ctrl+C to stop
echo.

call npm run dev

