@echo off
echo Starting Apna Shehar Development Environment...
echo.

echo Starting Backend (Spring Boot)...
start cmd /k "cd /d backend && ./mvnw spring-boot:run"

echo Waiting 10 seconds before starting frontend...
timeout /t 10 /nobreak >nul

echo Starting Frontend (React)...
start cmd /k "cd /d frontend && npm start"

echo.
echo Development servers starting...
echo Backend: http://localhost:8080
echo Frontend: http://localhost:3000
echo.
pause