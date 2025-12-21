# 📦 Building Android App for Google Play Store

## 🎯 Important: APK vs AAB

- **APK** (.apk) - For testing, direct installation, not accepted by Play Store anymore
- **AAB** (.aab) - **Required for Google Play Store** since August 2021
- **Recommendation**: Build both - APK for testing, AAB for Play Store

---

## 🚀 **STEP-BY-STEP BUILD GUIDE**

### Step 1: Install EAS CLI

```bash
npm install -g eas-cli
```

### Step 2: Login to Expo Account

```bash
eas login
```

If you don't have an Expo account:
1. Go to https://expo.dev/signup
2. Create a free account
3. Then run `eas login` and enter your credentials

### Step 3: Configure EAS Build

```bash
cd Arvi-Collections-Mobile
eas build:configure
```

This will:
- Create/update `eas.json`
- Link your project to Expo
- Set up build profiles

### Step 4: Build APK (For Testing)

```bash
# Build APK for testing on physical devices
eas build --platform android --profile preview
```

This creates an APK file you can:
- Install directly on Android devices
- Share with testers
- Test before Play Store submission

**Build time**: 10-20 minutes
**Output**: Download link for .apk file

### Step 5: Build AAB (For Google Play Store)

```bash
# Build AAB for Play Store submission
eas build --platform android --profile production
```

This creates an AAB file for:
- Google Play Store submission
- Optimized app size
- Dynamic delivery features

**Build time**: 10-20 minutes
**Output**: Download link for .aab file

---

## 📱 **QUICK BUILD COMMANDS**

### For Testing (APK)
```bash
cd Arvi-Collections-Mobile
eas build -p android --profile preview
```

### For Play Store (AAB)
```bash
cd Arvi-Collections-Mobile
eas build -p android --profile production
```

### Check Build Status
```bash
eas build:list
```

---

## ⚙️ **BEFORE BUILDING - IMPORTANT UPDATES**

### 1. Update Production API URL

You need to deploy your backend first and update the API URL:

**Edit `Arvi-Collections-Mobile/app.json`:**
```json
{
  "expo": {
    "extra": {
      "apiUrl": "https://your-production-api.com/api"
    }
  }
}
```

### 2. Update EAS Project ID

After running `eas build:configure`, update `app.json`:
```json
{
  "expo": {
    "extra": {
      "eas": {
        "projectId": "your-actual-project-id"
      }
    }
  }
}
```

### 3. Verify App Details

Check `app.json` for:
- App name
- Version number
- Bundle identifier
- Permissions

---

## 🔧 **TROUBLESHOOTING**

### Issue: "Not logged in"
```bash
eas login
```

### Issue: "Project not configured"
```bash
eas build:configure
```

### Issue: "Build failed"
- Check build logs: `eas build:list`
- View specific build: `eas build:view [build-id]`

### Issue: "Missing credentials"
EAS will automatically generate credentials for you on first build.

---

## 📥 **AFTER BUILD COMPLETES**

### Download Your Files

1. EAS will provide a download link
2. Or visit: https://expo.dev/accounts/[your-account]/projects/arvis-collection-mobile/builds
3. Download the APK or AAB file

### Test APK
```bash
# Install on connected Android device
adb install path/to/your-app.apk
```

### Submit AAB to Play Store
1. Go to Google Play Console
2. Create new app or select existing
3. Upload the .aab file
4. Fill in store listing details
5. Submit for review

---

## 🎯 **RECOMMENDED BUILD WORKFLOW**

### Phase 1: Testing Build
```bash
# Build APK for testing
eas build -p android --profile preview

# Download and test on devices
# Fix any issues
```

### Phase 2: Production Build
```bash
# Build AAB for Play Store
eas build -p android --profile production

# Download AAB
# Submit to Google Play Console
```

---

## 💡 **ALTERNATIVE: LOCAL BUILD (Advanced)**

If you want to build locally without EAS:

### Prerequisites
- Android Studio installed
- Java JDK 11+
- Android SDK configured

### Build Locally
```bash
cd Arvi-Collections-Mobile

# Generate Android project
npx expo prebuild --platform android

# Build APK
cd android
./gradlew assembleRelease

# Build AAB
./gradlew bundleRelease
```

**Output locations:**
- APK: `android/app/build/outputs/apk/release/app-release.apk`
- AAB: `android/app/build/outputs/bundle/release/app-release.aab`

---

## 📋 **GOOGLE PLAY STORE REQUIREMENTS**

Before submitting to Play Store, you need:

### Required
- [ ] AAB file (not APK)
- [ ] App icon (512x512 PNG)
- [ ] Feature graphic (1024x500 PNG)
- [ ] Screenshots (at least 2, various sizes)
- [ ] Privacy policy URL
- [ ] App description
- [ ] Content rating questionnaire

### Recommended
- [ ] Promotional video
- [ ] Promo graphic
- [ ] TV banner (if supporting Android TV)

---

## 🚀 **COMPLETE BUILD SCRIPT**

Save this as `build-android.sh`:

```bash
#!/bin/bash

echo "🚀 Building Arvi's Collection Android App"
echo ""

# Check if EAS CLI is installed
if ! command -v eas &> /dev/null; then
    echo "📦 Installing EAS CLI..."
    npm install -g eas-cli
fi

# Navigate to project
cd Arvi-Collections-Mobile

# Login check
echo "🔐 Checking EAS login..."
eas whoami || eas login

# Configure if needed
echo "⚙️ Configuring build..."
eas build:configure

# Build APK for testing
echo "📱 Building APK for testing..."
eas build -p android --profile preview --non-interactive

# Build AAB for Play Store
echo "📦 Building AAB for Play Store..."
eas build -p android --profile production --non-interactive

echo ""
echo "✅ Build process started!"
echo "📊 Check status: eas build:list"
echo "🌐 Or visit: https://expo.dev"
```

Make executable:
```bash
chmod +x build-android.sh
./build-android.sh
```

---

## ⏱️ **BUILD TIME ESTIMATES**

- **First build**: 15-25 minutes (includes setup)
- **Subsequent builds**: 10-15 minutes
- **Local builds**: 5-10 minutes (if configured)

---

## 📞 **NEED HELP?**

### EAS Build Documentation
https://docs.expo.dev/build/introduction/

### Google Play Console
https://play.google.com/console

### Expo Support
https://expo.dev/support

---

## ✅ **QUICK CHECKLIST**

Before building:
- [ ] Backend API deployed to production
- [ ] Production API URL updated in app.json
- [ ] App version number updated
- [ ] Expo account created
- [ ] EAS CLI installed

After building:
- [ ] Download APK and test on devices
- [ ] Download AAB for Play Store
- [ ] Prepare store listing materials
- [ ] Submit to Google Play Console

---

**Ready to build?** Run these commands:

```bash
cd Arvi-Collections-Mobile
npm install -g eas-cli
eas login
eas build -p android --profile preview
```

This will start the build process and provide you with download links when complete!