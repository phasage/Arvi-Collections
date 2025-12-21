@echo off
title Arvis Collections - Flutter APK Builder
color 0A

echo.
echo ========================================
echo   ARVIS COLLECTIONS FLUTTER APK BUILDER
echo ========================================
echo.

echo 📱 Building Flutter Standalone E-commerce App
echo.

REM Check if Flutter is installed
flutter --version >nul 2>&1
if errorlevel 1 (
    echo ❌ Flutter is not installed
    echo.
    echo 📥 Please install Flutter first:
    echo 1. Download: https://docs.flutter.dev/get-started/install/windows
    echo 2. Extract to: C:\flutter
    echo 3. Add C:\flutter\bin to PATH
    echo 4. Restart Command Prompt
    echo 5. Run this script again
    echo.
    pause
    exit /b 1
) else (
    echo ✅ Flutter is installed
    flutter --version
)

echo.
echo 📂 Navigating to Flutter project...
cd /d "D:\Amol\My Projects\Arvi-Collections\Arvis-Collections-Flutter-Standalone"

if not exist "pubspec.yaml" (
    echo ❌ Flutter project not found
    echo 💡 Make sure you're in the right directory
    pause
    exit /b 1
)

echo ✅ Flutter project found
echo.

echo 📦 Getting dependencies...
flutter pub get
if errorlevel 1 (
    echo ❌ Failed to get dependencies
    pause
    exit /b 1
)

echo.
echo 🔍 Running Flutter doctor...
flutter doctor

echo.
echo 🚀 Building APK (this may take 5-10 minutes)...
echo ⏱️ Please wait...
echo.

flutter build apk --release

if errorlevel 1 (
    echo ❌ Build failed
    echo 💡 Check the error messages above
    echo 💡 Try: flutter clean && flutter pub get
    pause
    exit /b 1
) else (
    echo.
    echo ✅ APK BUILD SUCCESSFUL! 🎉
    echo.
    echo 📁 APK Location:
    echo build\app\outputs\flutter-apk\app-release.apk
    echo.
    echo 📊 APK Details:
    for %%f in (build\app\outputs\flutter-apk\app-release.apk) do (
        echo Size: %%~zf bytes (~%%~zf MB)
    )
    echo.
    echo 📱 Next Steps:
    echo 1. Copy APK to your Android phone
    echo 2. Enable "Install from unknown sources"
    echo 3. Install and test the app
    echo.
    echo 🎯 Your app features:
    echo ✅ Complete e-commerce functionality
    echo ✅ Built-in admin panel
    echo ✅ Local SQLite database
    echo ✅ Offline operation
    echo ✅ Professional UI
    echo.
    echo 👨‍💼 Admin Login:
    echo Email: admin@arviscollections.com
    echo Password: Admin@123
)

echo.
pause