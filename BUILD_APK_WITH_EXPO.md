# 🚀 Create APK Using Your Expo Account

## 👤 **Your Expo Account**
- **Username**: amolphasage
- **Dashboard**: https://expo.dev/accounts/amolphasage

---

## 📱 **Step-by-Step APK Creation**

### **Step 1: Open Command Prompt**

1. Press `Win + R`
2. Type `cmd`
3. Press Enter

---

### **Step 2: Navigate to Your Project**

```cmd
cd "D:\Amol\My Projects\Arvi-Collections\Arvi-Collections-Mobile"
```

---

### **Step 3: Login to Expo**

```cmd
eas login
```

**Enter your credentials:**
- Username: `amolphasage`
- Password: [your password]

**Verify login:**
```cmd
eas whoami
```
Should show: `amolphasage`

---

### **Step 4: Install Dependencies**

```cmd
npm install
```

Wait for installation to complete (~2-3 minutes)

---

### **Step 5: Configure EAS Build (First Time Only)**

```cmd
eas build:configure
```

**Questions you'll see:**
1. "Would you like to automatically create an EAS project?" → Press `Y`
2. "Generate a new Android Keystore?" → Press `Y`

This creates/updates your `eas.json` file.

---

### **Step 6: Build APK for Testing**

```cmd
eas build --platform android --profile preview
```

**What happens:**
1. ✅ Code uploaded to Expo servers
2. ✅ Dependencies installed
3. ✅ Android app compiled
4. ✅ APK generated
5. ✅ APK uploaded to Expo CDN

**Time**: 15-20 minutes ⏱️

---

### **Step 7: Monitor Build Progress**

While building, you can:

1. **Watch in terminal** - Shows real-time progress
2. **Open dashboard**: https://expo.dev/accounts/amolphasage/projects
3. **View build logs** - Click on your build for details

---

### **Step 8: Download APK**

Once build completes:

**Option A: From Terminal**
- Terminal will show download link
- Click the link to download APK

**Option B: From Dashboard**
1. Go to: https://expo.dev/accounts/amolphasage/projects
2. Click on "arvis-collection-mobile" project
3. Click on "Builds" tab
4. Find your latest build
5. Click "Download" button
6. Save APK file (~40-60 MB)

---

### **Step 9: Install APK on Android Device**

**Method 1: USB Transfer**
1. Connect Android phone to PC via USB
2. Copy APK to phone's Download folder
3. On phone, open File Manager
4. Navigate to Downloads
5. Tap on APK file
6. Tap "Install"

**Method 2: Cloud Transfer**
1. Upload APK to Google Drive/Dropbox
2. Open link on Android phone
3. Download APK
4. Install from Downloads

**Enable Installation:**
- Settings → Security → Unknown Sources (enable)
- Or: Settings → Apps → Special Access → Install Unknown Apps

---

## 🎯 **Complete Command Sequence**

Copy and paste these commands one by one:

```cmd
REM Step 1: Navigate to project
cd "D:\Amol\My Projects\Arvi-Collections\Arvi-Collections-Mobile"

REM Step 2: Login to Expo
eas login

REM Step 3: Verify login
eas whoami

REM Step 4: Install dependencies
npm install

REM Step 5: Configure build (first time only)
eas build:configure

REM Step 6: Build APK
eas build --platform android --profile preview
```

---

## 📊 **Build Profiles Explained**

Your `eas.json` has 3 profiles:

### **1. Preview Profile (For Testing)**
```cmd
eas build --platform android --profile preview
```
- **Output**: APK file
- **Use**: Testing on devices
- **Install**: Direct APK installation
- **Size**: ~40-60 MB

### **2. Production Profile (For Play Store)**
```cmd
eas build --platform android --profile production
```
- **Output**: AAB file (Android App Bundle)
- **Use**: Google Play Store submission
- **Install**: Only via Play Store
- **Size**: ~30-50 MB (optimized)

### **3. Development Profile**
```cmd
eas build --platform android --profile development
```
- **Output**: Development build
- **Use**: Development/debugging
- **Features**: Hot reload, debugging tools

---

## 🔧 **Troubleshooting**

### **Issue: "Not logged in"**
```cmd
eas login
```
Enter your credentials for amolphasage account

### **Issue: "Project not found"**
```cmd
eas build:configure
```
This creates the project in your Expo account

### **Issue: "Build failed"**
1. Check internet connection
2. View build logs at: https://expo.dev/accounts/amolphasage
3. Try building again

### **Issue: PowerShell script error**
- Use Command Prompt (cmd) instead of PowerShell
- Or run: `Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser`

---

## 📱 **After APK Installation**

### **Test Your App:**

1. **Launch App** - Tap "Arvi's Collection" icon
2. **Register Account** - Create new user
3. **Browse Products** - View clothing items
4. **Add to Cart** - Select items
5. **Checkout** - Place order
6. **View Orders** - Check order history
7. **Admin Panel** - Login as admin (if admin user)

### **Default Admin Credentials:**
```
Email: admin@arviscollections.com
Password: Admin@123
```

---

## 🏪 **Next Steps for Google Play Store**

### **1. Build AAB for Play Store**
```cmd
eas build --platform android --profile production
```

### **2. Create Store Assets**
- App icon: 512x512 PNG
- Screenshots: 2-8 images
- Feature graphic: 1024x500 PNG
- App description

### **3. Submit to Play Store**
1. Go to: https://play.google.com/console
2. Create app listing
3. Upload AAB file
4. Complete store information
5. Submit for review

---

## ✅ **Quick Reference**

### **Essential Commands:**
```cmd
# Login
eas login

# Check login status
eas whoami

# Build APK (testing)
eas build --platform android --profile preview

# Build AAB (Play Store)
eas build --platform android --profile production

# View builds
eas build:list
```

### **Important Links:**
- **Your Dashboard**: https://expo.dev/accounts/amolphasage
- **Your Projects**: https://expo.dev/accounts/amolphasage/projects
- **Build Documentation**: https://docs.expo.dev/build/introduction/

---

## 🎉 **Ready to Build!**

Your app includes:
- ✅ Complete e-commerce functionality
- ✅ User authentication with MFA
- ✅ Shopping cart and checkout
- ✅ Order management
- ✅ Admin panel
- ✅ Professional UI/UX
- ✅ Security features

**Run the commands above to create your APK in 15-20 minutes!**

---

## 💡 **Pro Tips**

1. **Keep terminal open** during build - Don't close it
2. **Stable internet** - Build uploads code to Expo servers
3. **First build takes longer** - Subsequent builds are faster
4. **Save download link** - APK link expires after 30 days
5. **Test thoroughly** - Install on multiple devices if possible

**Your APK will be production-ready for Google Play Store!** 🚀