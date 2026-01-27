# Mobile Compatibility Checklist for MyTuDo

This document identifies potential issues when running MyTuDo on mobile (Android/iOS) and provides solutions.

## ✅ Already Compatible

### 1. **localStorage Usage**
- **Status**: ✅ Compatible
- **Location**: `src/hooks/useLocalStorage.ts`, auth store
- **Notes**: Capacitor supports Web Storage API (localStorage/sessionStorage) natively

### 2. **Window Event Listeners**
- **Status**: ✅ Compatible
- **Locations**:
  - `src/hooks/useLocalStorage.ts` (storage events)
  - `src/hooks/useMediaQuery.ts` (media queries)
  - `src/features/wardrobe/pages/AddItemPage.tsx` (paste events)
- **Notes**: Standard DOM APIs work in Capacitor's WebView

## ⚠️ Needs Attention

### 1. **API URL Configuration**
- **Status**: ⚠️ Needs Update
- **Location**: `src/api/client.ts`
- **Issue**: 
  ```typescript
  const API_BASE_URL = import.meta.env.VITE_API_URL + "/api" || "/api";
  ```
  - In mobile app, relative URLs won't work if API is on different server
  - Need absolute URL for production

- **Solution**: Update to use full URL in production
  ```typescript
  const API_BASE_URL = import.meta.env.VITE_API_URL 
    ? import.meta.env.VITE_API_URL + "/api" 
    : "/api";
  ```
  
- **Capacitor Config**: Add to `capacitor.config.ts`:
  ```typescript
  server: {
    androidScheme: 'https',
    iosScheme: 'https'
  }
  ```

### 2. **Navigation using window.location.href**
- **Status**: ⚠️ Consider Improvement
- **Location**: `src/api/client.ts` (lines 49, 53)
- **Issue**: 
  ```typescript
  window.location.href = "/login";
  ```
  - Works but doesn't integrate well with React Router
  - Causes full page reload

- **Recommended Solution**: Use React Router's `navigate` instead
  ```typescript
  // In api/client.ts
  import { NavigateFunction } from 'react-router-dom';
  
  let navigateRef: NavigateFunction | null = null;
  
  export const setNavigate = (navigate: NavigateFunction) => {
    navigateRef = navigate;
  };
  
  // In interceptor:
  if (navigateRef) {
    navigateRef('/login');
  } else {
    window.location.href = '/login';
  }
  ```

### 3. **Clipboard API (Paste Events)**
- **Status**: ⚠️ May Need Plugin
- **Location**: `src/features/wardrobe/pages/AddItemPage.tsx`
- **Issue**: Paste events for images might not work the same on mobile
- **Current Code**:
  ```typescript
  const handlePaste = (e: ClipboardEvent) => {
    const items = e.clipboardData?.items;
    // ... process clipboard items
  };
  ```

- **Mobile Consideration**: 
  - Mobile doesn't have traditional clipboard paste the same way
  - Consider adding a "Choose from Gallery" button using Capacitor Camera plugin
  
- **Recommended Addition**: Install and use `@capacitor/camera`
  ```bash
  npm install @capacitor/camera
  ```
  
  ```typescript
  import { Camera, CameraResultType } from '@capacitor/camera';
  
  const takePicture = async () => {
    const image = await Camera.getPhoto({
      quality: 90,
      allowEditing: false,
      resultType: CameraResultType.Uri,
      source: CameraSource.Photos // For gallery
    });
    // Convert to File object
  };
  ```

### 4. **File Input for Images**
- **Status**: ⚠️ Works but can be enhanced
- **Location**: `src/features/wardrobe/pages/AddItemPage.tsx`
- **Current**: Uses `<input type="file" accept="image/*">`
- **Mobile Consideration**: 
  - Works on mobile but limited
  - Better to provide explicit "Take Photo" and "Choose Photo" buttons
  
- **Recommended Enhancement**:
  ```typescript
  import { Camera, CameraResultType, CameraSource } from '@capacitor/camera';
  
  const handleTakePhoto = async () => {
    const photo = await Camera.getPhoto({
      resultType: CameraResultType.Uri,
      source: CameraSource.Camera,
      quality: 90
    });
    // Process photo
  };
  
  const handleChoosePhoto = async () => {
    const photo = await Camera.getPhoto({
      resultType: CameraResultType.Uri,
      source: CameraSource.Photos,
      quality: 90
    });
    // Process photo
  };
  ```

### 5. **Background Removal**
- **Status**: ⚠️ Performance Concern
- **Location**: Uses `@imgly/background-removal`
- **Issue**: This is a heavy operation that may struggle on mobile devices
- **Recommendations**:
  - Add loading indicator (already present ✅)
  - Consider server-side processing as alternative
  - Add device capability detection:
    ```typescript
    const isMobile = /Android|iPhone|iPad/i.test(navigator.userAgent);
    if (isMobile) {
      // Warn user or use different algorithm
    }
    ```

### 6. **Touch vs Click Events**
- **Status**: ✅ Mostly Compatible
- **Notes**: React's onClick works for touch events
- **CSS Consideration**: Ensure hover states don't interfere with touch
  
  **Review**: Some CSS uses `:hover` states
  ```css
  /* Add touch-friendly alternatives */
  @media (hover: none) {
    .button:hover {
      /* Disable hover or use :active instead */
    }
  }
  ```

## 🔧 Required Changes

### 1. **Update API Client for Mobile**

Create a new file: `src/utils/platform.ts`

```typescript
import { Capacitor } from '@capacitor/core';

export const isNativePlatform = () => Capacitor.isNativePlatform();
export const getPlatform = () => Capacitor.getPlatform(); // 'ios', 'android', 'web'
export const isAndroid = () => Capacitor.getPlatform() === 'android';
export const isIOS = () => Capacitor.getPlatform() === 'ios';
```

Update `src/api/client.ts`:

```typescript
import { Capacitor } from '@capacitor/core';

const getBaseURL = () => {
  // In native mobile apps, use the full production URL
  if (Capacitor.isNativePlatform()) {
    return import.meta.env.VITE_API_URL + "/api" || "https://your-production-api.com/api";
  }
  // In web, use relative or environment variable
  return import.meta.env.VITE_API_URL ? import.meta.env.VITE_API_URL + "/api" : "/api";
};

const API_BASE_URL = getBaseURL();
```

### 2. **Add Mobile-Specific UI Components**

Create: `src/components/ImagePicker.tsx`

```typescript
import { Camera, CameraResultType, CameraSource } from '@capacitor/camera';
import { Capacitor } from '@capacitor/core';

export const ImagePicker = ({ onImageSelected }: { onImageSelected: (file: File) => void }) => {
  const isMobile = Capacitor.isNativePlatform();
  
  const handleCamera = async () => {
    const photo = await Camera.getPhoto({
      resultType: CameraResultType.Uri,
      source: CameraSource.Camera,
      quality: 90
    });
    // Convert to File and call onImageSelected
  };
  
  const handleGallery = async () => {
    const photo = await Camera.getPhoto({
      resultType: CameraResultType.Uri,
      source: CameraSource.Photos,
      quality: 90
    });
    // Convert to File and call onImageSelected
  };
  
  if (isMobile) {
    return (
      <div>
        <button onClick={handleCamera}>Take Photo</button>
        <button onClick={handleGallery}>Choose from Gallery</button>
      </div>
    );
  }
  
  return <input type="file" accept="image/*" />; // Web fallback
};
```

### 3. **Add Status Bar and Splash Screen Configuration**

Install:
```bash
npm install @capacitor/status-bar @capacitor/splash-screen
```

Create: `src/utils/mobileSetup.ts`

```typescript
import { StatusBar, Style } from '@capacitor/status-bar';
import { SplashScreen } from '@capacitor/splash-screen';
import { Capacitor } from '@capacitor/core';

export const initMobileApp = async () => {
  if (!Capacitor.isNativePlatform()) return;
  
  // Configure status bar
  await StatusBar.setStyle({ style: Style.Light });
  await StatusBar.setBackgroundColor({ color: '#4DD0C8' }); // Your teal color
  
  // Hide splash screen
  await SplashScreen.hide();
};
```

Call in `src/main.tsx`:
```typescript
import { initMobileApp } from './utils/mobileSetup';

initMobileApp();

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);
```

### 4. **Handle Safe Areas (iOS Notch)**

Add to `src/index.css`:

```css
body {
  /* Safe area insets for iOS notch */
  padding-top: env(safe-area-inset-top);
  padding-bottom: env(safe-area-inset-bottom);
  padding-left: env(safe-area-inset-left);
  padding-right: env(safe-area-inset-right);
}
```

Update `capacitor.config.ts`:

```typescript
const config: CapacitorConfig = {
  // ...
  ios: {
    contentInset: 'always'
  },
  android: {
    allowMixedContent: true // Only if you need HTTP in development
  }
};
```

### 5. **Network Status Detection**

Install:
```bash
npm install @capacitor/network
```

Add to your app:
```typescript
import { Network } from '@capacitor/network';

// Check current status
const status = await Network.getStatus();
console.log('Network connected:', status.connected);

// Listen to network changes
Network.addListener('networkStatusChange', status => {
  console.log('Network status changed', status);
  // Show offline message if needed
});
```

## 📋 Testing Checklist

Before deploying to mobile:

- [ ] Test API calls work with production URL
- [ ] Test image upload from camera
- [ ] Test image upload from gallery
- [ ] Test navigation between pages
- [ ] Test authentication flow
- [ ] Test offline behavior
- [ ] Test on different screen sizes
- [ ] Test touch interactions (tap, swipe, scroll)
- [ ] Test input focus and keyboard behavior
- [ ] Check safe areas on iOS (notch, bottom bar)
- [ ] Test performance on mid-range devices
- [ ] Verify permissions (camera, storage) are requested correctly
- [ ] Test background removal on mobile (may need timeout/warning)

## 🚀 Recommended Plugins

Essential for mobile app:

```bash
npm install @capacitor/app           # App state & deep links
npm install @capacitor/haptics       # Vibration feedback
npm install @capacitor/keyboard      # Keyboard control
npm install @capacitor/status-bar    # Status bar styling
npm install @capacitor/camera        # Camera & gallery
npm install @capacitor/network       # Network detection
npm install @capacitor/splash-screen # Splash screen
npm install @capacitor/share         # Native share dialog
```

## 📱 Platform-Specific Considerations

### Android
- Min SDK version: 22 (Android 5.1)
- Target SDK version: 33+ (Android 13+)
- Handle back button behavior
- Request runtime permissions for camera/storage

### iOS
- Min iOS version: 13.0+
- Configure Info.plist for camera usage description
- Handle safe areas
- Test on devices with notch (iPhone X+)

## 🔐 Security Considerations

1. **API Keys**: Never commit API keys
   - Use environment variables
   - Different keys for dev/prod

2. **HTTPS**: Always use HTTPS in production
   ```typescript
   androidScheme: 'https',
   iosScheme: 'https'
   ```

3. **Token Storage**: Current localStorage is OK for mobile but consider:
   - Capacitor Preferences for sensitive data
   - Biometric authentication for extra security

## 📝 Next Steps

1. ✅ Install Capacitor and initialize (see android-build.md)
2. ⚠️ Update API client with platform detection
3. ⚠️ Add Camera plugin for image selection
4. ⚠️ Test on physical device
5. ⏳ Add status bar configuration
6. ⏳ Add network detection
7. ⏳ Optimize performance for mobile
8. ⏳ Add mobile-specific UI enhancements
