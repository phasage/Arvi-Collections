@echo off
title Android Studio Installation Helper
color 0A

echo.
echo ========================================
echo   ANDROID STUDIO INSTALLATION HELPER
echo ========================================
echo.

echo 📱 Setting up Android development environment...
echo.

echo 🔍 Checking current Flutter setup...
flutter doctor
echo.

echo 📥 Android Studio Installation Steps:
echo.
echo 1. DOWNLOAD ANDROID STUDIO
echo    Go to: https://developer.android.com/studio
echo    File size: ~3.5 GB (includes Android SDK)
echo.
echo 2. INSTALL ANDROID STUDIO
echo    - Run the installer
echo    - Choose "Standard" installation
echo    - Let it download Android SDK (additional 2-3 GB)
echo    - Note the SDK location (usually C:\Users\%USERNAME%\AppData\Local\Android\Sdk)
echo.
echo 3. SET ENVIRONMENT VARIABLES
echo    - Press Win + X, select "System"
echo    - Click "Advanced system settings"
echo    - Click "Environment Variables"
echo    - Under "System Variables", click "New"
echo    - Variable name: ANDROID_HOME
echo    - Variable value: [Your SDK path from step 2]
echo    - Click OK
echo.
echo 4. ACCEPT LICENSES
echo    After installation, run: flutter doctor --android-licenses
echo    Press 'y' for all prompts
echo.
echo 5. VERIFY SETUP
echo    Run: flutter doctor
echo    Should show checkmarks for Flutter and Android toolchain
echo.

echo ⚡ ALTERNATIVE: ONLINE BUILD (NO INSTALLATION)
echo.
echo If you want to skip local setup:
echo 1. Go to: https://codemagic.io
echo 2. Sign up (free)
echo 3. Upload your Flutter project
echo 4. Build APK online in 15 minutes
echo.

echo 🎯 RECOMMENDATION:
echo - For immediate APK: Use Codemagic (online)
echo - For development: Install Android Studio (local)
echo.

echo Press any key to open Android Studio download page...
pause >nul

REM Open Android Studio download page
start https://developer.android.com/studio

echo.
echo 📋 After installation:
echo 1. Restart Command Prompt
echo 2. Run: flutter doctor
echo 3. Run: flutter doctor --android-licenses
echo 4. Build APK: flutter build apk --release
echo.

pause