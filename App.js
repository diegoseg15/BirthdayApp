// App.js

import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  SafeAreaView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { decode, encode } from "base-64";

import Auth from "./src/components/Auth";
import { listenAuthState, logout } from "./src/services/authService";

if (!global.btoa) global.btoa = encode;
if (!global.atob) global.atob = decode;

export default function App() {
  const [user, setUser] = useState(undefined);
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  useEffect(() => {
    const unsubscribe = listenAuthState((currentUser) => {
      setUser(currentUser);
    });

    return unsubscribe;
  }, []);

  const handleLogout = async () => {
    try {
      setIsLoggingOut(true);
      await logout();
    } finally {
      setIsLoggingOut(false);
    }
  };

  if (user === undefined) {
    return (
      <SafeAreaView style={styles.loadingContainer}>
        <StatusBar barStyle="light-content" backgroundColor="#15212B" />
        <ActivityIndicator color="#F97316" size="large" />
      </SafeAreaView>
    );
  }

  if (!user) {
    return (
      <>
        <StatusBar barStyle="light-content" backgroundColor="#15212B" />
        <Auth />
      </>
    );
  }

  return (
    <SafeAreaView style={styles.homeContainer}>
      <StatusBar barStyle="light-content" backgroundColor="#15212B" />

      <View style={styles.homeContent}>
        <Text style={styles.homeTitle}>Sesión iniciada</Text>
        <Text style={styles.homeSubtitle}>
          Firebase Auth ya está funcionando. En el siguiente paso conectamos la
          lista de cumpleaños.
        </Text>

        <View style={styles.userCard}>
          <Text style={styles.userLabel}>Cuenta activa</Text>
          <Text style={styles.userEmail}>{user.email}</Text>
        </View>

        <TouchableOpacity
          style={[styles.logoutButton, isLoggingOut && styles.disabledButton]}
          onPress={handleLogout}
          disabled={isLoggingOut}
          activeOpacity={0.85}
        >
          {isLoggingOut ? (
            <ActivityIndicator color="#FFFFFF" />
          ) : (
            <Text style={styles.logoutButtonText}>Cerrar sesión</Text>
          )}
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    backgroundColor: "#15212B",
    alignItems: "center",
    justifyContent: "center",
  },
  homeContainer: {
    flex: 1,
    backgroundColor: "#15212B",
  },
  homeContent: {
    flex: 1,
    justifyContent: "center",
    paddingHorizontal: 24,
  },
  homeTitle: {
    color: "#FFFFFF",
    fontSize: 32,
    fontWeight: "900",
    marginBottom: 12,
  },
  homeSubtitle: {
    color: "#CBD5E1",
    fontSize: 16,
    lineHeight: 24,
    marginBottom: 24,
  },
  userCard: {
    padding: 18,
    borderRadius: 22,
    backgroundColor: "#1E3040",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.08)",
    marginBottom: 24,
  },
  userLabel: {
    color: "#94A3B8",
    fontSize: 13,
    fontWeight: "700",
    textTransform: "uppercase",
    marginBottom: 8,
  },
  userEmail: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "700",
  },
  logoutButton: {
    height: 52,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#EF4444",
  },
  disabledButton: {
    opacity: 0.7,
  },
  logoutButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "800",
  },
});
