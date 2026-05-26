// src/components/Auth.js

import React, { useState } from "react";
import {
  KeyboardAvoidingView,
  Platform,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";

import LoginForm from "./LoginForm";
import RegisterForm from "./RegisterForm";

export default function Auth() {
  const [isLogin, setIsLogin] = useState(true);

  const changeForm = () => {
    setIsLogin((currentValue) => !currentValue);
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView
        style={styles.keyboardView}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
        >
          <View style={styles.header}>
            <View style={styles.logoMark}>
              <Text style={styles.logoText}>B</Text>
            </View>

            <Text style={styles.title}>BirthdayApp</Text>
            <Text style={styles.subtitle}>
              Guarda cumpleaños importantes y mantén tus recordatorios
              organizados.
            </Text>
          </View>

          <View style={styles.card}>
            {isLogin ? (
              <LoginForm changeForm={changeForm} />
            ) : (
              <RegisterForm changeForm={changeForm} />
            )}
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#15212B",
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
  logoMark: {
    width: 84,
    height: 84,
    borderRadius: 28,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#F97316",
    marginBottom: 18,
  },
  logoText: {
    color: "#FFFFFF",
    fontSize: 42,
    fontWeight: "900",
  },
  title: {
    color: "#FFFFFF",
    fontSize: 34,
    fontWeight: "800",
    marginBottom: 10,
  },
  subtitle: {
    color: "#CBD5E1",
    fontSize: 15,
    lineHeight: 22,
    textAlign: "center",
    maxWidth: 320,
  },
  card: {
    width: "100%",
    borderRadius: 28,
    padding: 22,
    backgroundColor: "#1E3040",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.08)",
  },
});
