// src/components/Auth.js

import React, { useMemo, useState } from "react";
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import BrandLogo from "./BrandLogo";
import LoginForm from "./LoginForm";
import RegisterForm from "./RegisterForm";

export default function Auth({ theme, onContinueLocal }) {
  const styles = useMemo(() => createStyles(theme), [theme]);
  const [isLogin, setIsLogin] = useState(true);

  const changeForm = () => {
    setIsLogin((currentValue) => !currentValue);
  };

  return (
    <SafeAreaView
      style={styles.safeArea}
      edges={["top", "right", "bottom", "left"]}
    >
      <KeyboardAvoidingView
        style={styles.keyboardView}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.header}>
            <BrandLogo
              theme={theme}
              size={96}
              rounded={30}
              showBackground={false}
            />

            <Text style={styles.title}>Rimind</Text>
            <Text style={styles.subtitle}>
              Recuerda cumpleaños, fechas importantes y momentos que no quieres
              olvidar.
            </Text>
          </View>

          <View style={styles.card}>
            {isLogin ? (
              <LoginForm changeForm={changeForm} />
            ) : (
              <RegisterForm changeForm={changeForm} />
            )}
          </View>

          <TouchableOpacity
            style={styles.localButton}
            onPress={onContinueLocal}
            activeOpacity={0.85}
          >
            <Text style={styles.localButtonText}>Continuar sin cuenta</Text>
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

function createStyles(theme) {
  return StyleSheet.create({
    safeArea: {
      flex: 1,
      backgroundColor: theme.colors.background,
    },
    keyboardView: {
      flex: 1,
    },
    scrollContent: {
      flexGrow: 1,
      justifyContent: "center",
      paddingHorizontal: 24,
      paddingVertical: 32,
    },
    header: {
      alignItems: "center",
      marginBottom: 28,
    },
    title: {
      color: theme.colors.text,
      fontSize: 36,
      fontWeight: "900",
      marginTop: 16,
      marginBottom: 10,
      letterSpacing: -0.5,
    },
    subtitle: {
      color: theme.colors.textMuted,
      fontSize: 15,
      lineHeight: 22,
      textAlign: "center",
      maxWidth: 330,
    },
    card: {
      width: "100%",
      borderRadius: 28,
      padding: 22,
      backgroundColor: theme.colors.card,
      borderWidth: 1,
      borderColor: theme.colors.border,
    },
    localButton: {
      height: 50,
      borderRadius: 18,
      alignItems: "center",
      justifyContent: "center",
      marginTop: 16,
      backgroundColor: theme.colors.surfaceAlt,
    },
    localButtonText: {
      color: theme.colors.text,
      fontSize: 15,
      fontWeight: "900",
    },
  });
}
