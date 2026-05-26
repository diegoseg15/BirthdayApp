// App.js

import "./src/utils/base64Polyfill";

import React, { useEffect, useState } from "react";
import { ActivityIndicator, StatusBar, StyleSheet } from "react-native";
import { SafeAreaProvider, SafeAreaView } from "react-native-safe-area-context";

import Auth from "./src/components/Auth";
import Birthday from "./src/components/Birthday";
import { listenAuthState } from "./src/services/authService";
import { configureNotifications } from "./src/services/notificationService";
import { useAppSettings } from "./src/hooks/useAppSettings";

export default function App() {
  return (
    <SafeAreaProvider>
      <AppContent />
    </SafeAreaProvider>
  );
}

function AppContent() {
  const [user, setUser] = useState(undefined);

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
  }, []);

  useEffect(() => {
    const unsubscribe = listenAuthState((currentUser) => {
      setUser(currentUser);
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

  return (
    <>
      <StatusBar
        barStyle={theme.isDark ? "light-content" : "dark-content"}
        backgroundColor={theme.colors.background}
      />

      {user ? (
        <Birthday
          user={user}
          theme={theme}
          appSettings={settings}
          deviceLanguage={deviceLanguage}
          onChangeThemeMode={updateThemeMode}
          onChangeNotificationsEnabled={updateNotificationsEnabled}
        />
      ) : (
        <Auth theme={theme} />
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
