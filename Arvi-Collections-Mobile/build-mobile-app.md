# 📱 Build & Install Arvi's Collection Mobile App

This guide will help you build and install the Arvi's Collection mobile app on Android and iOS devices.

## 🚀 Quick Start (Easiest Method)

### Method 1: Expo Go App (No Build Required)

1. **Install Expo Go on your mobile device:**
   - Android: [Google Play Store](https://play.google.com/store/apps/details?id=host.exp.exponent)
   - iOS: [App Store](https://apps.apple.com/app/expo-go/id982107779)

2. **Start the development server:**
   ```bash
   cd Arvi-Collections-Mobile
   npm start
   ```

3. **Scan QR code:**
   - Android: Use Expo Go app to scan QR code
   - iOS: Use Camera app to scan QR code (opens in Expo Go)

## 📦 Build Installation Files

### Prerequisites

1. **Install EAS CLI:**
   ```bash
   npm install -g eas-cli
   ```

2. **Login to Expo:**
   ```bash
   eas login
   ```

3. **Configure project:**
   ```bash
   cd Arvi-Collections-Mobile
   eas build:configure
   ```

### 🤖 Android APK Build

**Build APK for direct installation:**
```bash
eas build --platform android --profile preview
```

**Build AAB for Google Play Store:**
```bash
eas build --platform android --profile production
```

### 🍎 iOS IPA Build

**Requirements:**
- Apple Developer Account ($99/year)
- macOS (for local builds)

**Build IPA:**
```bash
eas build --platform ios --profile preview
```

## 📲 Installation Methods

### Android Installation

#### Method 1: Direct APK Installation
1. Download the APK file from EAS build
2. On your Android device:
   - Go to Settings > Security
   - Enable "Install from Unknown Sources"
   - Open the APK file and install

#### Method 2: Google Play Store
1. Upload AAB to Google Play Console
2. Complete store listing and review process
3. Publish app
4. Users install from Play Store

### iOS Installation

#### Method 1: TestFlight (Recommended)
1. Upload IPA to App Store Connect
2. Add testers via email addresses
3. Testers install TestFlight app
4. Install app through TestFlight

#### Method 2: App Store
1. Upload IPA to App Store Connect
2. Complete App Store review process
3. Publish to App Store
4. Users install from App Store

#### Method 3: Development Install (Xcode)
1. Open project in Xcode
2. Connect iOS device via USB
3. Select device and click Run

## 🔧 Configuration for Physical Devices

### Update API URLs

Before building, update the API base URL in these files:

1. **src/context/AuthContext.js**
2. **src/context/CartContext.js**
3. **src/screens/HomeScreen.js**
4. **src/screens/ProductsScreen.js**

Replace `http://localhost:5000/api` with your server's IP address:

```javascript
// For local network testing
const API_BASE = 'http://192.168.1.XXX:5000/api';

// For production
const API_BASE = 'https://your-domain.com/api';
```

### Find Your Computer's IP Address

**Windows:**
```bash
ipconfig
```

**macOS/Linux:**
```bash
ifconfig
```

Look for your local network IP (usually starts with 192.168.x.x)

## 🛠️ Build Commands Reference

```bash
# Start development server
npm start

# Build Android APK (for direct install)
eas build --platform android --profile preview

# Build Android AAB (for Play Store)
eas build --platform android --profile production

# Build iOS IPA
eas build --platform ios --profile preview

# Build for both platforms
eas build --platform all --profile preview

# Check build status
eas build:list

# View build logs
eas build:view [build-id]
```

## 📱 Testing on Devices

### Android Testing
1. Enable Developer Options:
   - Go to Settings > About Phone
   - Tap "Build Number" 7 times
   - Go back to Settings > Developer Options
   - Enable "USB Debugging"

2. Connect via USB and run:
   ```bash
   npm run android
   ```

### iOS Testing (macOS only)
1. Connect iOS device via USB
2. Trust the computer on your device
3. Run:
   ```bash
   npm run ios
   ```

## 🔐 App Signing & Distribution

### Android Signing
EAS handles signing automatically. For manual signing:

1. Generate keystore:
   ```bash
   keytool -genkey -v -keystore my-release-key.keystore -alias my-key-alias -keyalg RSA -keysize 2048 -validity 10000
   ```

2. Configure in `eas.json`

### iOS Signing
Requires Apple Developer Account:

1. Create App ID in Apple Developer Portal
2. Create Distribution Certificate
3. Create Provisioning Profile
4. Configure in EAS

## 🚨 Troubleshooting

### Common Issues

**1. Build Fails**
- Check Node.js version (18+ recommended)
- Clear cache: `expo start --clear`
- Delete node_modules: `rm -rf node_modules && npm install`

**2. Cannot Connect to Backend**
- Ensure backend server is running
- Use correct IP address (not localhost)
- Check firewall settings
- Verify network connectivity

**3. App Crashes on Device**
- Check device logs
- Verify all permissions are granted
- Ensure backend API is accessible from device

**4. Build Takes Too Long**
- EAS builds can take 10-20 minutes
- Check build queue status
- Consider upgrading to paid EAS plan for faster builds

### Getting Help

1. Check [Expo Documentation](https://docs.expo.dev/)
2. Review [EAS Build Documentation](https://docs.expo.dev/build/introduction/)
3. Check build logs for specific errors
4. Contact support team

## 📊 Build Status

After running build commands, you can:

1. **Monitor builds:**
   ```bash
   eas build:list
   ```

2. **View build details:**
   ```bash
   eas build:view [build-id]
   ```

3. **Download builds:**
   - Visit [Expo Dashboard](https://expo.dev/)
   - Navigate to your project
   - Download APK/IPA files

## 🎯 Next Steps

1. **Test the app** on physical devices
2. **Update API endpoints** for production
3. **Configure app store listings**
4. **Set up analytics** and crash reporting
5. **Plan app updates** and versioning

---

**Note:** Building for iOS requires an Apple Developer Account ($99/year). Android builds are free but may require Google Play Console account ($25 one-time) for store distribution.