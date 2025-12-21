# Arvi's Collection Mobile App

A cross-platform mobile e-commerce application for Arvi's Collection built with React Native and Expo.

## 📱 Features

- **Product Browsing** - Browse products with categories and filters
- **Shopping Cart** - Add/remove items, manage quantities
- **User Authentication** - Login, register, and profile management
- **Order Management** - Place orders and track order history
- **Secure Storage** - Encrypted storage for sensitive data
- **Offline Support** - Cart persists even when offline
- **Push Notifications** - Order updates and promotional notifications
- **Barcode Scanner** - Scan product barcodes for quick access
- **Image Upload** - Upload product images from camera or gallery

## 🚀 Getting Started

### Prerequisites

- Node.js (v18 or higher recommended)
- npm or yarn
- Expo CLI: `npm install -g expo-cli`
- For iOS: macOS with Xcode
- For Android: Android Studio with Android SDK

### Installation

1. Navigate to the mobile app directory:
```bash
cd Arvi-Collections-Mobile
```

2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npm start
```

## 📲 Running on Devices

### Option 1: Expo Go App (Easiest)

1. Install Expo Go on your mobile device:
   - **Android**: [Google Play Store](https://play.google.com/store/apps/details?id=host.exp.exponent)
   - **iOS**: [App Store](https://apps.apple.com/app/expo-go/id982107779)

2. Start the development server:
```bash
npm start
```

3. Scan the QR code with:
   - **Android**: Expo Go app
   - **iOS**: Camera app (opens in Expo Go)

### Option 2: Android APK Build

1. Configure app.json with your details

2. Build APK:
```bash
eas build --platform android --profile preview
```

3. Or build locally:
```bash
expo build:android -t apk
```

4. Download and install the APK on your Android device

### Option 3: iOS IPA Build (Requires Apple Developer Account)

1. Configure app.json with your bundle identifier

2. Build IPA:
```bash
eas build --platform ios --profile preview
```

3. Install via TestFlight or direct installation

### Option 4: Development Build

For Android:
```bash
npm run android
```

For iOS (macOS only):
```bash
npm run ios
```

## 🔧 Configuration

### API Configuration

Update the API base URL in:
- `src/context/AuthContext.js`
- `src/context/CartContext.js`
- `src/screens/*.js`

Change `http://localhost:5000/api` to your backend URL.

For testing on physical devices, use your computer's IP address:
```javascript
const API_BASE = 'http://192.168.1.XXX:5000/api';
```

### App Configuration

Edit `app.json` to customize:
- App name
- Bundle identifier
- Version
- Icons and splash screen
- Permissions

## 📦 Building for Production

### Android APK/AAB

1. Install EAS CLI:
```bash
npm install -g eas-cli
```

2. Login to Expo:
```bash
eas login
```

3. Configure build:
```bash
eas build:configure
```

4. Build APK (for direct installation):
```bash
eas build --platform android --profile preview
```

5. Build AAB (for Google Play Store):
```bash
eas build --platform android --profile production
```

### iOS IPA

1. Ensure you have an Apple Developer account

2. Configure signing:
```bash
eas build:configure
```

3. Build for TestFlight/App Store:
```bash
eas build --platform ios --profile production
```

## 📱 Installing on Devices

### Android

**Method 1: Direct APK Installation**
1. Download the APK file
2. Enable "Install from Unknown Sources" in device settings
3. Open the APK file and install

**Method 2: Google Play Store**
1. Upload AAB to Google Play Console
2. Complete store listing
3. Publish app
4. Users can install from Play Store

### iOS

**Method 1: TestFlight**
1. Upload IPA to App Store Connect
2. Add testers via email
3. Testers install via TestFlight app

**Method 2: App Store**
1. Upload IPA to App Store Connect
2. Complete app review process
3. Publish to App Store
4. Users can install from App Store

**Method 3: Development (Xcode)**
1. Open project in Xcode
2. Connect iOS device
3. Select device and click Run

## 🔐 Permissions Required

### Android
- Internet access
- Camera (for barcode scanning and image upload)
- Storage (for image selection)
- Notifications

### iOS
- Camera usage
- Photo library access
- Notifications

## 🛠️ Development Scripts

```bash
# Start development server
npm start

# Start with cache cleared
npm start --clear

# Run on Android
npm run android

# Run on iOS
npm run ios

# Run on web
npm run web

# Run tests
npm test

# Build for production
eas build --platform all
```

## 📁 Project Structure

```
Arvi-Collections-Mobile/
├── src/
│   ├── screens/          # App screens
│   │   ├── HomeScreen.js
│   │   ├── ProductsScreen.js
│   │   ├── ProductDetailScreen.js
│   │   ├── CartScreen.js
│   │   ├── ProfileScreen.js
│   │   ├── LoginScreen.js
│   │   ├── RegisterScreen.js
│   │   ├── CheckoutScreen.js
│   │   ├── OrdersScreen.js
│   │   └── CategoriesScreen.js
│   ├── context/          # React Context
│   │   ├── AuthContext.js
│   │   └── CartContext.js
│   ├── components/       # Reusable components
│   ├── services/         # API services
│   └── utils/            # Utility functions
├── assets/               # Images, fonts, etc.
├── App.js               # Main app component
├── app.json             # Expo configuration
└── package.json         # Dependencies

```

## 🔗 Backend Integration

Ensure your backend API is running and accessible:

1. Start backend server:
```bash
cd ../backend
npm run dev
```

2. Backend should be running on `http://localhost:5000`

3. For mobile device testing, use your computer's IP address

## 🐛 Troubleshooting

### Common Issues

**1. Cannot connect to backend**
- Ensure backend is running
- Use computer's IP address instead of localhost
- Check firewall settings
- Verify API_BASE URL in code

**2. Build fails**
- Clear cache: `expo start --clear`
- Delete node_modules and reinstall
- Check Node.js version compatibility

**3. App crashes on device**
- Check console logs
- Verify all permissions are granted
- Ensure backend API is accessible

**4. Images not loading**
- Check image URLs
- Verify internet connection
- Check CORS settings on backend

## 📚 Additional Resources

- [Expo Documentation](https://docs.expo.dev/)
- [React Native Documentation](https://reactnative.dev/)
- [EAS Build Documentation](https://docs.expo.dev/build/introduction/)
- [Publishing to App Stores](https://docs.expo.dev/distribution/introduction/)

## 🤝 Support

For issues and questions:
- Check the troubleshooting section
- Review Expo documentation
- Contact support team

## 📄 License

This project is part of Arvi's Collection e-commerce platform.

---

**Note**: This app requires the Arvi's Collection backend API to be running. Ensure the backend is accessible from your mobile device for full functionality.
