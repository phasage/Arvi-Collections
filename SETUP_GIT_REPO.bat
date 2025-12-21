@echo off
title Setup Git Repository for Flutter Project
color 0A

echo.
echo ========================================
echo   SETUP GIT REPOSITORY FOR FLUTTER
echo ========================================
echo.

echo 🚀 Setting up Git repository for Arvis Collections Flutter app...
echo.

REM Navigate to Flutter project
cd /d "D:\Amol\My Projects\Arvi-Collections\Arvis-Collections-Flutter-Standalone"

echo 📂 Current directory: %CD%
echo.

echo 🔍 Checking if Git is installed...
git --version >nul 2>&1
if errorlevel 1 (
    echo ❌ Git is not installed
    echo 📥 Please install Git first:
    echo    Go to: https://git-scm.com/download/windows
    echo    Download and install Git for Windows
    pause
    exit /b 1
) else (
    echo ✅ Git is installed
    git --version
)

echo.
echo 📋 Initializing Git repository...
git init
if errorlevel 1 (
    echo ❌ Failed to initialize Git repository
    pause
    exit /b 1
) else (
    echo ✅ Git repository initialized
)

echo.
echo 📝 Creating .gitignore file...
echo # Miscellaneous > .gitignore
echo *.class >> .gitignore
echo *.log >> .gitignore
echo *.pyc >> .gitignore
echo *.swp >> .gitignore
echo .DS_Store >> .gitignore
echo .atom/ >> .gitignore
echo .buildlog/ >> .gitignore
echo .history >> .gitignore
echo .svn/ >> .gitignore
echo migrate_working_dir/ >> .gitignore
echo. >> .gitignore
echo # IntelliJ related >> .gitignore
echo *.iml >> .gitignore
echo *.ipr >> .gitignore
echo *.iws >> .gitignore
echo .idea/ >> .gitignore
echo. >> .gitignore
echo # The .vscode folder contains launch configuration and tasks you configure in >> .gitignore
echo # VS Code which you may wish to be included in version control, so this line >> .gitignore
echo # is commented out by default. >> .gitignore
echo #.vscode/ >> .gitignore
echo. >> .gitignore
echo # Flutter/Dart/Pub related >> .gitignore
echo **/doc/api/ >> .gitignore
echo **/ios/Flutter/.last_build_id >> .gitignore
echo .dart_tool/ >> .gitignore
echo .flutter-plugins >> .gitignore
echo .flutter-plugins-dependencies >> .gitignore
echo .packages >> .gitignore
echo .pub-cache/ >> .gitignore
echo .pub/ >> .gitignore
echo /build/ >> .gitignore
echo. >> .gitignore
echo # Symbolication related >> .gitignore
echo app.*.symbols >> .gitignore
echo. >> .gitignore
echo # Obfuscation related >> .gitignore
echo app.*.map.json >> .gitignore
echo. >> .gitignore
echo # Android Studio will place build artifacts here >> .gitignore
echo /android/app/debug >> .gitignore
echo /android/app/profile >> .gitignore
echo /android/app/release >> .gitignore

echo ✅ .gitignore file created

echo.
echo 📦 Adding files to Git...
git add .
if errorlevel 1 (
    echo ❌ Failed to add files to Git
    pause
    exit /b 1
) else (
    echo ✅ Files added to Git
)

echo.
echo 💾 Creating initial commit...
git commit -m "Initial commit: Arvis Collections Flutter E-commerce App with Admin Panel"
if errorlevel 1 (
    echo ❌ Failed to create initial commit
    pause
    exit /b 1
) else (
    echo ✅ Initial commit created
)

echo.
echo 🌐 Next steps to create GitHub repository:
echo.
echo 1. Go to: https://github.com/new
echo 2. Repository name: arvis-collections-flutter
echo 3. Description: Flutter E-commerce App with Local Database and Admin Panel
echo 4. Make it Public (for free Codemagic builds)
echo 5. Do NOT initialize with README (we already have files)
echo 6. Click "Create repository"
echo.
echo 7. Copy the repository URL (e.g., https://github.com/YOUR_USERNAME/arvis-collections-flutter.git)
echo 8. Come back here and run the commands shown on GitHub
echo.

echo Press any key to open GitHub new repository page...
pause >nul

REM Open GitHub new repository page
start https://github.com/new

echo.
echo 📋 After creating GitHub repository, run these commands:
echo.
echo git remote add origin https://github.com/YOUR_USERNAME/arvis-collections-flutter.git
echo git branch -M main
echo git push -u origin main
echo.
echo 🎯 Then go to Codemagic and add your repository!
echo.

pause