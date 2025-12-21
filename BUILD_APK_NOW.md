# 📱 Build APK Right Now - Complete Guide

## 🚨 **IMPORTANT: PowerShell Issue Fix**

You have a PowerShell execution policy issue. Here's how to fix it:

### Option 1: Use Command Prompt (Recommended)
1. Press `Win + R`
2. Type `cmd` and press Enter
3. Navigate to your project:
   ```cmd
   cd "D:\Amol\My Projects\Arvi-Collections\Arvi-Collections-Mobile"
   ```
4. Run EAS commands in CMD instead of PowerShell

### Option 2: Fix PowerShell (Advanced)
Run PowerShell as Administrator and execute:
```powershell
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser
```

---

## 🚀 **STEP-BY-STEP APK BUILD**

### Step 1: Open Command Prompt
- Press `Win + R`
- Type `cmd`
- Press Enter

### Step 2: Navigate to Project
```cmd
cd "D:\Amol\My Projects\Arvi-Collections\Arvi-Collections-Mobile"
```

### Step 3: Check EAS Installation
```cmd
eas --version
```

### Step 4: Create Expo Account
1. Go to https://expo.dev/signup
2. Sign up (free)
3. Verify email

### Step 5: Login to EAS
```cmd
eas login
```
Enter your Expo email and password.

### Step 6: Configure Project
```cmd
eas build:configure
```
- Press Enter for all defaults
- This links your project to Expo

### Step 7: Build APK
```cmd
eas build --platform android --profile preview
```

This will:
- Start the build process
- Take 15-20 minutes
- Give you a download link when done

---

## 📱 **WHAT HAPPENS DURING BUILD**

### Build Process (15-20 minutes)
1. **Upload code** to Expo servers (2 min)
2. **Install dependencies** (5 min)
3. **Compile Android app** (8 min)
4. **Generate APK** (2 min)
5. **Upload to CDN** (1 min)

### You'll See:
```
✔ Build started, it may take a few minutes to complete.
✔ You can monitor the build at https://expo.dev/accounts/[your-account]/projects/arvis-collection-mobile/builds/[build-id]

🚀 Build completed!
📱 APK: https://expo.dev/artifacts/[download-link]
```

---

## 📥 **DOWNLOAD & INSTALL**

### Download APK
1. Click the download link from EAS
2. Or visit https://expo.dev → Your Projects → Builds
3. Download the `.apk` file

### Install on Android
1. Transfer APK to your Android phone
2. Go to Settings → Security → Install from Unknown Sources (enable)
3. Tap the APK file
4. Install the app
5. Open and test!

---

## 🔧 **BEFORE BUILDING - CRITICAL UPDATE**

### Update API URL for Testing

Your app currently uses `localhost:5000` which won't work on phones. You need to update it:

#### Option A: Use Your Computer's IP (Quick)
1. Find your computer's IP:
   ```cmd
   ipconfig
   ```
   Look for "IPv4 Address" (e.g., 192.168.1.100)

2. Edit `src/config/api.js` and replace:
   ```javascript
   export const API_BASE = 'http://192.168.1.100:5000/api';
   ```
   (Replace 192.168.1.100 with your actual IP)

3. Make sure backend is running:
   ```cmd
   cd ..\backend
   npm start
   ```

#### Option B: Deploy Backend First (Production)
Deploy your backend to a cloud service first, then update the API URL.

---

## 🎯 **COMPLETE COMMAND SEQUENCE**

Copy these commands and run them one by one in **Command Prompt**:

```cmd
REM Navigate to project
cd "D:\Amol\My Projects\Arvi-Collections\Arvi-Collections-Mobile"

REM Check EAS
eas --version

REM Login (you'll need Expo account)
eas login

REM Configure project
eas build:configure

REM Build APK
eas build --platform android --profile preview
```

---

## 📊 **BUILD MONITORING**

### Check Build Status
```cmd
eas build:list
```

### View Build Details
Visit the URL provided by EAS to see:
- Build progress
- Logs (if build fails)
- Download link (when complete)

---

## 🚨 **TROUBLESHOOTING**

### Build Fails: "Network Error"
**Cause**: App can't reach your backend
**Solution**: Update API URL to your computer's IP address

### Build Fails: "Dependency Error"
**Cause**: Missing packages
**Solution**: Run `npm install` first

### Can't Login to EAS
**Cause**: Need Expo account
**Solution**: Create account at https://expo.dev/signup

### App Crashes on Phone
**Cause**: Backend not accessible
**Solution**: 
1. Make sure backend is running
2. Use your computer's IP in API config
3. Phone and computer on same WiFi network

---

## 📱 **TESTING YOUR APK**

### Installation Test
- [ ] APK installs without errors
- [ ] App icon appears on home screen
- [ ] App opens without crashing

### Functionality Test
- [ ] Home screen loads
- [ ] Can browse products
- [ ] Can register new account
- [ ] Can login
- [ ] Can add items to cart
- [ ] All screens work

### Network Test
- [ ] Products load from backend
- [ ] Login works with backend
- [ ] Cart syncs with backend

---

## 🏪 **FOR GOOGLE PLAY STORE**

### After APK Testing
If APK works well, build AAB for Play Store:

```cmd
eas build --platform android --profile production
```

### Play Store Requirements
- AAB file (not APK)
- Google Play Console account ($25)
- Privacy policy
- App screenshots
- Store description

---

## ⏱️ **TIMELINE**

- **Setup**: 5 minutes
- **Build time**: 15-20 minutes  
- **Download**: 2 minutes
- **Install & test**: 5 minutes
- **Total**: ~30 minutes to working APK

---

## 🎉 **SUCCESS!**

When build completes, you'll have:
- ✅ Professional Android APK
- ✅ Ready for testing
- ✅ Installable on any Android device
- ✅ Production-quality app

---

## 📞 **NEED HELP?**

### If Stuck
1. Check build logs on Expo website
2. Ensure backend is running and accessible
3. Verify API URL is correct
4. Make sure phone and computer are on same network

### Resources
- Expo Docs: https://docs.expo.dev/build/
- Support: https://expo.dev/support

---

**Ready to build?** 

1. Open Command Prompt
2. Run the commands above
3. Wait 20 minutes
4. Download your APK!

Your app is ready for production! 🚀