// App.js

import "./src/utils/base64Polyfill";

import React, { useEffect, useState } from "react";
import { ActivityIndicator, StatusBar, StyleSheet } from "react-native";
import { SafeAreaProvider, SafeAreaView } from "react-native-safe-area-context";

import Auth from "./src/components/Auth";
import Birthday from "./src/components/Birthday";
import { LOCAL_USER } from "./src/constants/session";
import { useAppSettings } from "./src/hooks/useAppSettings";
import { listenAuthState } from "./src/services/authService";
import { configureNotifications } from "./src/services/notificationService";
import { initializeAds } from "./src/services/adService";

export default function App() {
  return (
    <SafeAreaProvider>
      <AppContent />
    </SafeAreaProvider>
  );
}

function AppContent() {
  const [user, setUser] = useState(undefined);
  const [isAuthVisible, setIsAuthVisible] = useState(false);

  const {
    settings,
    isSettingsReady,
    theme,
    deviceLanguage,
    updateThemeMode,
    updateNotificationsEnabled,
  } = useAppSettings();

useEffect(() => {
  configureNotifications();
  initializeAds();
}, []);

  useEffect(() => {
    const unsubscribe = listenAuthState((currentUser) => {
      setUser(currentUser);

      if (currentUser) {
        setIsAuthVisible(false);
      }
    });

    return unsubscribe;
  }, []);

  if (user === undefined || !isSettingsReady) {
    return (
      <SafeAreaView
        style={[
          styles.loadingContainer,
          { backgroundColor: theme.colors.background },
        ]}
        edges={["top", "right", "bottom", "left"]}
      >
        <StatusBar
          barStyle={theme.isDark ? "light-content" : "dark-content"}
          backgroundColor={theme.colors.background}
        />
        <ActivityIndicator color={theme.colors.primary} size="large" />
      </SafeAreaView>
    );
  }

  const activeUser = user || LOCAL_USER;

  return (
    <>
      <StatusBar
        barStyle={theme.isDark ? "light-content" : "dark-content"}
        backgroundColor={theme.colors.background}
      />

      {isAuthVisible && !user ? (
        <Auth theme={theme} onContinueLocal={() => setIsAuthVisible(false)} />
      ) : (
        <Birthday
          user={activeUser}
          theme={theme}
          appSettings={settings}
          deviceLanguage={deviceLanguage}
          onChangeThemeMode={updateThemeMode}
          onChangeNotificationsEnabled={updateNotificationsEnabled}
          onRequestLogin={() => setIsAuthVisible(true)}
        />
      )}
    </>
  );
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
});
