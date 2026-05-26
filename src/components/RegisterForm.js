// src/components/RegisterForm.js

import React, { useState } from "react";
import {
  ActivityIndicator,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

import { registerWithEmail } from "../services/authService";
import { validateEmail, validatePassword } from "../utils/validation";

const DEFAULT_FORM = {
  email: "",
  password: "",
  repeatPassword: "",
};

export default function RegisterForm({ changeForm }) {
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

  const register = async () => {
    const errors = {};

    if (!formData.email || !validateEmail(formData.email)) {
      errors.email = true;
    }

    if (!validatePassword(formData.password)) {
      errors.password = true;
    }

    if (formData.password !== formData.repeatPassword) {
      errors.password = true;
      errors.repeatPassword = true;
    }

    setFormError(errors);

    if (Object.keys(errors).length > 0) {
      setGeneralError(getValidationMessage(formData));
      return;
    }

    try {
      setIsLoading(true);
      setGeneralError("");

      await registerWithEmail({
        email: formData.email,
        password: formData.password,
      });
    } catch (error) {
      setGeneralError(getRegisterErrorMessage(error.code));
      setFormError({
        email: true,
        password: true,
        repeatPassword: true,
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <View>
      <Text style={styles.formTitle}>Crear cuenta</Text>

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

      <TextInput
        style={[styles.input, formError.repeatPassword && styles.inputError]}
        placeholder="Repetir contraseña"
        placeholderTextColor="#94A3B8"
        secureTextEntry
        value={formData.repeatPassword}
        onChangeText={(value) => updateForm("repeatPassword", value)}
      />

      {generalError ? (
        <Text style={styles.errorText}>{generalError}</Text>
      ) : null}

      <TouchableOpacity
        style={[styles.primaryButton, isLoading && styles.disabledButton]}
        onPress={register}
        disabled={isLoading}
        activeOpacity={0.85}
      >
        {isLoading ? (
          <ActivityIndicator color="#FFFFFF" />
        ) : (
          <Text style={styles.primaryButtonText}>Registrarme</Text>
        )}
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.secondaryButton}
        onPress={changeForm}
        disabled={isLoading}
        activeOpacity={0.85}
      >
        <Text style={styles.secondaryButtonText}>
          ¿Ya tienes cuenta? Inicia sesión
        </Text>
      </TouchableOpacity>
    </View>
  );
}

function getValidationMessage(formData) {
  if (!validateEmail(formData.email)) {
    return "Ingresa un correo válido.";
  }

  if (!validatePassword(formData.password)) {
    return "La contraseña debe tener al menos 6 caracteres.";
  }

  if (formData.password !== formData.repeatPassword) {
    return "Las contraseñas no coinciden.";
  }

  return "Revisa los datos ingresados.";
}

function getRegisterErrorMessage(code) {
  const messages = {
    "auth/email-already-in-use": "Ya existe una cuenta con este correo.",
    "auth/invalid-email": "El correo no tiene un formato válido.",
    "auth/weak-password": "La contraseña es demasiado débil.",
    "auth/network-request-failed": "No hay conexión. Inténtalo nuevamente.",
  };

  return messages[code] || "No se pudo crear la cuenta. Inténtalo nuevamente.";
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
