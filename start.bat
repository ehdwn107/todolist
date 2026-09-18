@echo off
echo [1/2] 백엔드 서버 시작 (http://localhost:8000)
start "Backend" cmd /k "cd /d %~dp0backend && python -m uvicorn main:app --reload --port 8000"

timeout /t 2 /nobreak >nul

echo [2/2] 프론트엔드 서버 시작 (http://localhost:5173)
start "Frontend" cmd /k "cd /d %~dp0frontend && npm run dev"

echo.
echo 브라우저에서 http://localhost:5173 을 열어주세요.
