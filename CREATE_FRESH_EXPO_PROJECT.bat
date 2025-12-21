@echo off
title Create Fresh Expo Project
color 0A

echo.
echo ========================================
echo   CREATING FRESH EXPO PROJECT
echo ========================================
echo.

REM Navigate to parent directory
cd "D:\Amol\My Projects\Arvi-Collections"

echo 📱 Creating new Expo project...
npx create-expo-app@latest Arvi-Collections-Mobile-Fresh --template blank

echo.
echo 📂 Copying your source files...
xcopy "Arvi-Collections-Mobile\src" "Arvi-Collections-Mobile-Fresh\src" /E /I /Y
xcopy "Arvi-Collections-Mobile\assets" "Arvi-Collections-Mobile-Fresh\assets" /E /I /Y

echo.
echo ⚙️ Configuring project...
cd Arvi-Collections-Mobile-Fresh

REM Copy our configurations
copy "..\Arvi-Collections-Mobile\app.json" "app.json"
copy "..\Arvi-Collections-Mobile\eas.json" "eas.json"

echo.
echo 📦 Installing dependencies...
npm install @react-navigation/native @react-navigation/stack @react-navigation/bottom-tabs
npm install react-native-screens react-native-safe-area-context react-native-gesture-handler
npm install @react-native-async-storage/async-storage expo-secure-store

echo.
echo 🚀 Ready to build!
echo Run: eas build --platform android --profile preview
echo.

pause