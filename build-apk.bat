@echo off
title Arvi's Collection - APK Builder
color 0A

echo.
echo ========================================
echo    ARVI'S COLLECTION APK BUILDER
echo ========================================
echo.

REM Navigate to mobile app directory
cd /d "D:\Amol\My Projects\Arvi-Collections\Arvi-Collections-Mobile"

echo 📱 Current directory: %CD%
echo.

echo 🔍 Checking EAS CLI installation...
eas --version >nul 2>&1
if errorlevel 1 (
    echo ❌ EAS CLI not found or not working
    echo 💡 Please run: npm install -g eas-cli
    echo 💡 Or use Command Prompt instead of PowerShell
    pause
    exit /b 1
) else (
    echo ✅ EAS CLI is installed
)

echo.
echo 🔐 Checking Expo login status...
eas whoami >nul 2>&1
if errorlevel 1 (
    echo ❌ Not logged in to Expo
    echo 💡 Please create account at: https://expo.dev/signup
    echo 💡 Then run: eas login
    pause
    exit /b 1
) else (
    echo ✅ Logged in to Expo
)

echo.
echo ⚙️ Configuring EAS build...
eas build:configure
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

eas build --platform android --profile preview

if errorlevel 1 (
    echo ❌ Build failed
    echo 💡 Check build logs at: https://expo.dev
) else (
    echo.
    echo ✅ Build completed successfully!
    echo 📥 Download your APK from the link above
    echo 📱 Install on Android device and test
)

echo.
echo 📋 Next steps:
echo 1. Download APK from Expo website
echo 2. Transfer to Android phone
echo 3. Enable "Install from unknown sources"
echo 4. Install and test the app
echo.

pause