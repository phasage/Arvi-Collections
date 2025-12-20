@echo off
echo.
echo ========================================
echo   TESTING ARVI'S COLLECTION APP
echo ========================================
echo.
echo 1. Testing Backend APIs...
curl -s http://localhost:5000/api/health
echo.
echo.
echo 2. Testing Categories API...
curl -s http://localhost:5000/api/categories | findstr "success"
echo.
echo.
echo 3. Testing Products API...
curl -s http://localhost:5000/api/products | findstr "success"
echo.
echo.
echo 4. Opening Application...
start "" "app.html"
echo.
echo ✅ Application should now be open in your browser!
echo.
echo Demo Login Credentials:
echo - Admin: admin@arviscollection.com / admin123
echo - User:  john@example.com / password123
echo.
echo If you see "Loading..." text, check browser console (F12)
echo for any JavaScript errors.
echo.
pause