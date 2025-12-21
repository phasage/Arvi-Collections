@echo off
title Arvi's Collection - APK Creator
color 0A

echo.
echo ========================================
echo    ARVI'S COLLECTION APK CREATOR
echo ========================================
echo.

echo 📱 Creating production-ready APK for Google Play Store...
echo.

REM Check if we're in the right directory
if not exist "Arvi-Collections-Mobile" (
    echo ❌ Arvi-Collections-Mobile folder not found
    echo 💡 Please run this script from the main project directory
    pause
    exit /b 1
)

echo 🔍 Checking EAS CLI installation...
eas --version >nul 2>&1
if errorlevel 1 (
    echo ❌ EAS CLI not found
    echo 📦 Installing EAS CLI...
    npm install -g eas-cli
    if errorlevel 1 (
        echo ❌ Failed to install EAS CLI
        echo 💡 Please run: npm install -g eas-cli
        pause
        exit /b 1
    )
) else (
    echo ✅ EAS CLI is installed
)

echo.
echo 🔐 Checking Expo login status...
eas whoami >nul 2>&1
if errorlevel 1 (
    echo ❌ Not logged in to Expo
    echo.
    echo 📝 You need to create a free Expo account and login:
    echo.
    echo 1. Go to: https://expo.dev/signup
    echo 2. Create a free account
    echo 3. Come back and run this command: eas login
    echo.
    echo After logging in, run this script again.
    pause
    exit /b 1
) else (
    echo ✅ Logged in to Expo
)

echo.
echo 📂 Navigating to React Native app...
cd Arvi-Collections-Mobile

echo.
echo 📦 Installing dependencies...
npm install
if errorlevel 1 (
    echo ⚠️ Some dependencies may have issues, but continuing...
)

echo.
echo ⚙️ Configuring EAS build...
eas build:configure --non-interactive
if errorlevel 1 (
    echo ❌ Build configuration failed
    pause
    exit /b 1
)

echo.
echo 🚀 Starting APK build...
echo ⏱️ This will take 15-20 minutes...
echo 🌐 You can monitor progress at: https://expo.dev
echo.

eas build --platform android --profile preview --non-interactive

if errorlevel 1 (
    echo ❌ Build failed
    echo 💡 Check build logs at: https://expo.dev
    echo 💡 Common issues:
    echo    - Network connection
    echo    - Expo account limits
    echo    - Build configuration
) else (
    echo.
    echo ✅ APK BUILD COMPLETED SUCCESSFULLY! 🎉
    echo.
    echo 📥 Next steps:
    echo 1. Go to: https://expo.dev
    echo 2. Download your APK file
    echo 3. Transfer to Android phone
    echo 4. Install and test the app
    echo.
    echo 📱 Your APK is ready for:
    echo ✅ Testing on Android devices
    echo ✅ Sharing with users
    echo ✅ Google Play Store submission (after building AAB)
)

echo.
echo 📋 Build Summary:
echo ================
echo App Name: Arvi's Collection
echo Platform: Android
echo Build Type: APK (for testing)
echo Features: Complete e-commerce with MFA
echo Size: ~40-60 MB
echo.

pause