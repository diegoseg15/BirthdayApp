# Rimind

**Rimind** (internal package name `birthday-app`) is an event and celebration reminder application built with **React Native 0.85** and **Expo 56**. It provides a flexible local-first architecture for privacy-conscious users alongside cloud synchronization via **Firebase**, scheduled push notifications, automatic localization, dynamic dark/light theming, and integrated monetization via **Google Mobile Ads**.

---

## Features

- **Event & Anniversary Tracking**: Track birthdays, anniversaries, and milestones with optional birth year tracking, automatic age calculation, and upcoming event countdowns.
- **Dual-Storage Engine**:
  - **Local-First Mode**: Fully functional offline storage using `@react-native-async-storage/async-storage` without requiring an account.
  - **Firebase Cloud Sync**: Authenticated cloud synchronization with Cloud Firestore (`firebase/firestore`) and Firebase Authentication (`firebase/auth`).
  - **Seamless Legacy Migration**: Built-in migration pipeline from legacy data models to structured user collections.
- **Push & Scheduled Notifications**: Automated local reminder scheduling through `expo-notifications` with dedicated Android notification channels.
- **Localization**: Native locale and timezone detection using `expo-localization` for date formatting and localized user context.
- **Integrated Monetization**: Banner advertisements powered by `react-native-google-mobile-ads` with development test IDs and production banner unit configuration.
- **Adaptive UI & Themes**: System, light, and dark mode support using `expo-system-ui` and safe area management via `react-native-safe-area-context`.

---

## Technology Stack

| Layer | Technologies |
|---|---|
| **Framework & Runtime** | [React Native 0.85](https://reactnative.dev/), [Expo 56](https://docs.expo.dev/versions/v56.0.0/), [React 19](https://react.dev/) |
| **Language & Typings** | TypeScript / JavaScript (ESNext) |
| **Local Persistence** | [@react-native-async-storage/async-storage](https://github.com/react-native-async-storage/async-storage) |
| **Cloud Backend & Auth** | [Firebase 12](https://firebase.google.com/) (Authentication & Cloud Firestore) |
| **Notifications** | [expo-notifications](https://docs.expo.dev/versions/v56.0.0/sdk/notifications/) |
| **Localization** | [expo-localization](https://docs.expo.dev/versions/v56.0.0/sdk/localization/) |
| **Advertising** | [react-native-google-mobile-ads](https://github.com/invertase/react-native-google-mobile-ads) |
| **Date Manipulation** | [moment](https://momentjs.com/), [@react-native-community/datetimepicker](https://github.com/react-native-datetimepicker/datetimepicker) |
| **Code Quality** | ESLint 9 (`eslint-config-expo`), Prettier |

---

## Architecture Overview

```
                      +-----------------------------+
                      |      Rimind App Entry       |
                      |          (App.js)           |
                      +--------------+--------------+
                                     |
               +---------------------+---------------------+
               |                     |                     |
        [Local Guest Mode]    [Authenticated]       [App Settings]
               |                     |                     |
               v                     v                     v
       AsyncStorage Engine     Firebase Service    useAppSettings Hook
    (localBirthdayService)    (birthdayService)    (Theme & Locales)
               |                     |                     |
               +----------+----------+                     |
                          |                                |
                          v                                v
                 Notification Pipeline             Banner Ad Engine
              (notificationService.js)                 (AdCard)
```

---

## Prerequisites

- **Node.js**: LTS version (18.x or 20.x recommended)
- **Package Manager**: `npm` (bundled with Node.js)
- **Expo CLI**: Executable via `npx expo`
- **Mobile Development Environment**:
  - Android Studio and Android SDK (for Android builds / emulators)
  - Xcode and CocoaPods (for iOS development on macOS)
  - [Expo Go](https://expo.dev/go) or a custom development build via `expo-dev-client`

---

## Installation

1. **Clone the repository**:
   ```bash
   git clone <repository-url>
   cd Rimind
   ```

2. **Install project dependencies**:
   ```bash
   npm install
   ```

---

## Configuration

The application requires configuration environment variables for Firebase services and Google Mobile Ads. Create a `.env` file in the root directory:

```env
# Firebase Configuration
EXPO_PUBLIC_FIREBASE_API_KEY=your_firebase_api_key
EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
EXPO_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_messaging_sender_id
EXPO_PUBLIC_FIREBASE_APP_ID=your_app_id

# Google AdMob Banner Units (Optional for development; uses AdMob Test IDs when __DEV__ is true)
EXPO_PUBLIC_ADMOB_ANDROID_BANNER_ID=ca-app-pub-xxxxxxxxxxxxxxxx/xxxxxxxxxx
EXPO_PUBLIC_ADMOB_IOS_BANNER_ID=ca-app-pub-xxxxxxxxxxxxxxxx/xxxxxxxxxx
```

> [!NOTE]
> In development mode (`__DEV__ = true`), the AdMob component automatically defaults to Google's official test ad unit identifiers.

---

## Development Workflow

### Starting the Metro Bundler

Run the local development server:

```bash
npx expo start
```
*Alternatively, you can run:*
```bash
npm start
```

### Running on Specific Platforms

- **Android (Native / Emulator)**:
  ```bash
  npm run android
  ```
- **iOS (Simulator / Device on macOS)**:
  ```bash
  npm run ios
  ```
- **Web (Preview)**:
  ```bash
  npm run web
  ```

---

## Project Structure

```
Rimind/
|-- assets/                    # Static assets, branding logos, icons, splash images
|-- src/
|   |-- components/            # UI components (ActionBar, AddBirthday, ListBirthday, AdCard, etc.)
|   |-- constants/             # Application constants, theme colors, session flags
|   |-- hooks/                 # Custom React hooks (e.g. useAppSettings)
|   |-- services/              # Core business logic:
|   |   |-- adService.js            # AdMob initialization & lifecycle
|   |   |-- authService.js          # Firebase Authentication
|   |   |-- birthdayService.js      # Firestore birthday CRUD & legacy migration
|   |   |-- localBirthdayService.js # Local storage CRUD (AsyncStorage)
|   |   `-- notificationService.js  # Scheduled reminder scheduling
|   |-- theme/                 # Design system, palette definitions, mode resolver
|   `-- utils/                 # Utilities (date formatting, firebase client, polyfills)
|-- app.json                   # Expo application configuration & plugin options
|-- App.js                     # Root application component & lifecycle entrypoint
|-- package.json               # Dependencies and scripts
`-- README.md                  # Project documentation
```

---

## Diagnostics and Code Quality

- **Check project health and dependency compatibility**:
  ```bash
  npm run doctor
  ```

- **Run code linter**:
  ```bash
  npm run lint
  ```

- **Automatically fix dependency mismatches**:
  ```bash
  npm run fix
  ```

---

## License

This project is licensed under the **MIT License**.

```
MIT License

Copyright (c) 2026 Rimind Contributors

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
```
