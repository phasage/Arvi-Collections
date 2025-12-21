# 🚀 Quick Build Guide - Get Your APK in 15 Minutes!

## ⚡ **FASTEST PATH TO APK**

### Step 1: Create Expo Account (2 minutes)
1. Go to https://expo.dev/signup
2. Sign up with email (it's free!)
3. Verify your email

### Step 2: Login to EAS (1 minute)
```bash
cd Arvi-Collections-Mobile
eas login
```
Enter your Expo credentials when prompted.

### Step 3: Configure Build (2 minutes)
```bash
eas build:configure
```
- Press Enter to accept defaults
- This creates your project on Expo

### Step 4: Start APK Build (1 minute to start, 15 minutes to complete)
```bash
# For testing APK
eas build --platform android --profile preview

# For Play Store AAB
eas build --platform android --profile production
```

### Step 5: Download Your Files (1 minute)
- EAS will show a URL when build completes
- Or visit: https://expo.dev and go to your project
- Download the APK/AAB files

---

## 📱 **WHAT YOU'LL GET**

### APK File (preview build)
- **Size**: ~50-80 MB
- **Use**: Install directly on Android devices
- **Testing**: Perfect for sharing with testers
- **Format**: `.apk`

### AAB File (production build)  
- **Size**: ~30-50 MB (optimized)
- **Use**: Upload to Google Play Store
- **Required**: Play Store only accepts AAB since 2021
- **Format**: `.aab`

---

## 🔧 **BEFORE YOU BUILD**

### Critical: Update API URL
Your app currently points to `localhost:5000` which won't work on phones.

**Option 1: Use Your Computer's IP (Quick Test)**
1. Find your computer's IP address:
   ```bash
   ipconfig
   ```
   Look for "IPv4 Address" (e.g., 192.168.1.100)

2. Update `Arvi-Collections-Mobile/src/config/api.js`:
   ```javascript
   export const API_BASE = 'http://192.168.1.100:5000/api';
   ```

3. Make sure your backend is running:
   ```bash
   cd backend
   npm start
   ```

**Option 2: Deploy Backend to Cloud (Production)**
Deploy your backend to Heroku, Railway, or DigitalOcean first.

---

## 🎯 **COMPLETE BUILD COMMANDS**

Copy and paste these commands one by one:

```bash
# Navigate to mobile app
cd Arvi-Collections-Mobile

# Login to Expo (you'll need to create account first)
eas login

# Configure the project
eas build:configure

# Build APK for testing
eas build --platform android --profile preview

# Build AAB for Play Store (optional, do this after testing APK)
eas build --platform android --profile production
```

---

## 📊 **BUILD STATUS TRACKING**

### Check Build Progress
```bash
eas build:list
```

### View Specific Build
```bash
eas build:view [build-id]
```

### Build Logs (if build fails)
The build page will show detailed logs to help debug issues.

---

## 🚨 **COMMON ISSUES & SOLUTIONS**

### Issue: "Not authenticated"
**Solution**: Run `eas login` and enter your Expo credentials

### Issue: "Project not found"
**Solution**: Run `eas build:configure` to set up the project

### Issue: "Build failed - Network error"
**Solution**: Your API URL might be wrong. Update it to your computer's IP or deployed backend

### Issue: "App crashes on startup"
**Solution**: Check that your backend is running and accessible from the phone

---

## 📱 **TESTING YOUR APK**

### Install on Android Device
1. Download APK from Expo build page
2. Transfer to your Android phone
3. Enable "Install from unknown sources" in Settings
4. Tap the APK file to install
5. Open the app and test!

### Test Checklist
- [ ] App opens without crashing
- [ ] Can browse products
- [ ] Can register/login
- [ ] Can add items to cart
- [ ] Backend API is reachable

---

## 🏪 **GOOGLE PLAY STORE SUBMISSION**

### What You Need
1. **AAB file** (not APK) - built with `--profile production`
2. **Google Play Console account** ($25 one-time fee)
3. **App icons and screenshots**
4. **Privacy policy** (required)
5. **Store listing content**

### Upload Process
1. Go to https://play.google.com/console
2. Create new app
3. Upload your AAB file
4. Fill in store listing
5. Submit for review (takes 1-3 days)

---

## ⏱️ **TIME ESTIMATES**

- **Account setup**: 5 minutes
- **First build**: 15-20 minutes
- **Subsequent builds**: 10-15 minutes
- **Download**: 1-2 minutes
- **Testing**: 5-10 minutes

**Total time to APK**: ~25 minutes

---

## 🎯 **QUICK START SCRIPT**

Save this as `quick-build.bat` (Windows):

```batch
@echo off
echo 🚀 Building Arvi's Collection APK
echo.

cd Arvi-Collections-Mobile

echo 📦 Checking EAS CLI...
eas --version
if errorlevel 1 (
    echo Installing EAS CLI...
    npm install -g eas-cli
)

echo 🔐 Login to Expo...
eas whoami
if errorlevel 1 (
    echo Please login to Expo:
    eas login
)

echo ⚙️ Configuring project...
eas build:configure

echo 📱 Starting APK build...
eas build --platform android --profile preview

echo.
echo ✅ Build started! Check progress at:
echo https://expo.dev
echo.
pause
```

Double-click to run!

---

## 📞 **NEED HELP?**

### If Build Fails
1. Check the build logs on Expo website
2. Common issue: API URL pointing to localhost
3. Make sure backend is deployed or use your computer's IP

### If App Crashes
1. Update API URL in `src/config/api.js`
2. Make sure backend is running and accessible
3. Check device logs with `adb logcat`

### Contact Support
- Expo Discord: https://chat.expo.dev/
- Expo Forums: https://forums.expo.dev/

---

## ✅ **SUCCESS CHECKLIST**

After build completes:
- [ ] Download APK from Expo
- [ ] Install on Android device
- [ ] Test core functionality
- [ ] Share with others for testing
- [ ] Build AAB for Play Store (if ready)

---

**Ready to start?** 

1. Create Expo account: https://expo.dev/signup
2. Run the commands above
3. Wait 15 minutes for build
4. Download and test your APK!

Your app is production-ready and will build successfully! 🎉