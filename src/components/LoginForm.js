// src/components/LoginForm.js

import React, { useState } from "react";
import {
  ActivityIndicator,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

import { loginWithEmail } from "../services/authService";
import { validateEmail } from "../utils/validation";

const DEFAULT_FORM = {
  email: "",
  password: "",
};

export default function LoginForm({ changeForm }) {
  const [formData, setFormData] = useState(DEFAULT_FORM);
  const [formError, setFormError] = useState({});
  const [generalError, setGeneralError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const updateForm = (field, value) => {
    setFormData((currentForm) => ({
      ...currentForm,
      [field]: value,
    }));

    setFormError((currentErrors) => ({
      ...currentErrors,
      [field]: false,
    }));

    setGeneralError("");
  };

  const login = async () => {
    const errors = {};

    if (!formData.email) errors.email = true;
    if (!validateEmail(formData.email)) errors.email = true;
    if (!formData.password) errors.password = true;

    setFormError(errors);

    if (Object.keys(errors).length > 0) {
      setGeneralError("Revisa tu correo y contraseña.");
      return;
    }

    try {
      setIsLoading(true);
      setGeneralError("");

      await loginWithEmail({
        email: formData.email,
        password: formData.password,
      });
    } catch (error) {
      setGeneralError(getLoginErrorMessage(error.code));
      setFormError({
        email: true,
        password: true,
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <View>
      <Text style={styles.formTitle}>Iniciar sesión</Text>

      <TextInput
        style={[styles.input, formError.email && styles.inputError]}
        placeholder="Correo electrónico"
        placeholderTextColor="#94A3B8"
        autoCapitalize="none"
        autoCorrect={false}
        keyboardType="email-address"
        value={formData.email}
        onChangeText={(value) => updateForm("email", value)}
      />

      <TextInput
        style={[styles.input, formError.password && styles.inputError]}
        placeholder="Contraseña"
        placeholderTextColor="#94A3B8"
        secureTextEntry
        value={formData.password}
        onChangeText={(value) => updateForm("password", value)}
      />

      {generalError ? (
        <Text style={styles.errorText}>{generalError}</Text>
      ) : null}

      <TouchableOpacity
        style={[styles.primaryButton, isLoading && styles.disabledButton]}
        onPress={login}
        disabled={isLoading}
        activeOpacity={0.85}
      >
        {isLoading ? (
          <ActivityIndicator color="#FFFFFF" />
        ) : (
          <Text style={styles.primaryButtonText}>Entrar</Text>
        )}
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.secondaryButton}
        onPress={changeForm}
        disabled={isLoading}
        activeOpacity={0.85}
      >
        <Text style={styles.secondaryButtonText}>
          ¿No tienes cuenta? Regístrate
        </Text>
      </TouchableOpacity>
    </View>
  );
}

function getLoginErrorMessage(code) {
  const messages = {
    "auth/invalid-email": "El correo no tiene un formato válido.",
    "auth/user-disabled": "Esta cuenta fue deshabilitada.",
    "auth/user-not-found": "No existe una cuenta con este correo.",
    "auth/wrong-password": "La contraseña no es correcta.",
    "auth/invalid-credential": "Correo o contraseña incorrectos.",
    "auth/network-request-failed": "No hay conexión. Inténtalo nuevamente.",
  };

  return messages[code] || "No se pudo iniciar sesión. Inténtalo nuevamente.";
}

const styles = StyleSheet.create({
  formTitle: {
    color: "#FFFFFF",
    fontSize: 24,
    fontWeight: "800",
    marginBottom: 20,
  },
  input: {
    height: 52,
    color: "#FFFFFF",
    backgroundColor: "#15212B",
    borderRadius: 18,
    paddingHorizontal: 18,
    marginBottom: 14,
    fontSize: 16,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.08)",
  },
  inputError: {
    borderColor: "#EF4444",
  },
  errorText: {
    color: "#FCA5A5",
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 14,
  },
  primaryButton: {
    height: 52,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#F97316",
    marginTop: 4,
  },
  disabledButton: {
    opacity: 0.7,
  },
  primaryButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "800",
  },
  secondaryButton: {
    alignItems: "center",
    marginTop: 18,
  },
  secondaryButtonText: {
    color: "#CBD5E1",
    fontSize: 15,
    fontWeight: "600",
  },
});
