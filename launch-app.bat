@echo off
echo.
echo ========================================
echo   ARVI'S COLLECTION - LAUNCHING APP
echo ========================================
echo.
echo Backend Status: Checking...
curl -s http://localhost:5000/api/health > nul
if %errorlevel% == 0 (
    echo Backend Status: ✅ RUNNING on port 5000
) else (
    echo Backend Status: ❌ NOT RUNNING
    echo Please start the backend server first!
    pause
    exit
)
echo.
echo Products Available: Checking...
curl -s http://localhost:5000/api/products > nul
if %errorlevel% == 0 (
    echo Products API: ✅ WORKING
) else (
    echo Products API: ❌ ERROR
)
echo.
echo Categories Available: Checking...
curl -s http://localhost:5000/api/categories > nul
if %errorlevel% == 0 (
    echo Categories API: ✅ WORKING
) else (
    echo Categories API: ❌ ERROR
)
echo.
echo ========================================
echo   LAUNCHING ARVI'S COLLECTION STORE
echo ========================================
echo.
echo Opening app.html in your default browser...
echo.
echo Demo Login Credentials:
echo Admin: admin@arviscollection.com / admin123
echo User:  john@example.com / password123
echo.
start "" "app.html"
echo.
echo ✅ Application launched successfully!
echo.
echo If the app doesn't open automatically,
echo double-click on 'app.html' in this folder.
echo.
pause