// src/components/AddBirthday.js

import React, { useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  Modal,
  Pressable,
  StyleSheet,
  Switch,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

import { createBirthday, updateBirthday } from "../services/birthdayService";
import { getDateFromFirestoreValue } from "../utils/date";

const FALLBACK_BIRTH_YEAR = 2000;

const DEFAULT_FORM = {
  name: "",
  lastname: "",
  birthDay: "",
  birthMonth: "",
  birthYear: "",
  hasBirthYear: false,
};

export default function AddBirthday({
  visible,
  userId,
  theme,
  notificationsEnabled,
  birthdayToEdit,
  onClose,
}) {
  const styles = useMemo(() => createStyles(theme), [theme]);

  const [formData, setFormData] = useState(DEFAULT_FORM);
  const [formError, setFormError] = useState({});
  const [generalError, setGeneralError] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  const isEditing = Boolean(birthdayToEdit?.id);

  useEffect(() => {
    if (!visible) return;

    if (!birthdayToEdit) {
      setFormData(DEFAULT_FORM);
      setFormError({});
      setGeneralError("");
      return;
    }

    const date = getDateFromFirestoreValue(birthdayToEdit.dateBirth);
    const hasBirthYear = birthdayToEdit.hasBirthYear ?? true;

    setFormData({
      name: birthdayToEdit.name || "",
      lastname: birthdayToEdit.lastname || "",
      birthDay: String(birthdayToEdit.birthDay || date?.getDate() || ""),
      birthMonth: String(
        birthdayToEdit.birthMonth || (date ? date.getMonth() + 1 : ""),
      ),
      birthYear: hasBirthYear
        ? String(birthdayToEdit.birthYear || date?.getFullYear() || "")
        : "",
      hasBirthYear,
    });

    setFormError({});
    setGeneralError("");
  }, [birthdayToEdit, visible]);

  const updateForm = (field, value) => {
    const numericFields = ["birthDay", "birthMonth", "birthYear"];
    const nextValue = numericFields.includes(field)
      ? value.replace(/[^0-9]/g, "")
      : value;

    setFormData((currentForm) => ({
      ...currentForm,
      [field]: nextValue,
    }));

    setFormError((currentErrors) => ({
      ...currentErrors,
      [field]: false,
    }));

    setGeneralError("");
  };

  const toggleBirthYear = (value) => {
    setFormData((currentForm) => ({
      ...currentForm,
      hasBirthYear: value,
      birthYear: value ? currentForm.birthYear : "",
    }));

    setFormError((currentErrors) => ({
      ...currentErrors,
      birthYear: false,
    }));

    setGeneralError("");
  };

  const resetForm = () => {
    setFormData(DEFAULT_FORM);
    setFormError({});
    setGeneralError("");
  };

  const closeModal = () => {
    if (isSaving) return;

    resetForm();
    onClose();
  };

  const saveBirthday = async () => {
    const validation = validateBirthdayForm(formData);

    setFormError(validation.errors);

    if (!validation.isValid) {
      setGeneralError(validation.message);
      return;
    }

    const birthDay = Number(formData.birthDay);
    const birthMonth = Number(formData.birthMonth);
    const birthYear = formData.hasBirthYear
      ? Number(formData.birthYear)
      : FALLBACK_BIRTH_YEAR;

    const dateBirth = new Date(
      birthYear,
      birthMonth - 1,
      birthDay,
      12,
      0,
      0,
      0,
    );

    try {
      setIsSaving(true);
      setGeneralError("");

      const payload = {
        name: formData.name,
        lastname: formData.lastname,
        dateBirth,
        hasBirthYear: formData.hasBirthYear,
      };

      if (isEditing) {
        await updateBirthday(userId, birthdayToEdit.id, payload, {
          notificationsEnabled,
          currentNotificationId: birthdayToEdit.notificationId,
        });
      } else {
        await createBirthday(userId, payload, {
          notificationsEnabled,
        });
      }

      resetForm();
      onClose();
    } catch (error) {
      console.warn("Birthday save failed:", error);
      setGeneralError(
        "No se pudo guardar el cumpleaños. Inténtalo nuevamente.",
      );
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      statusBarTranslucent
      onRequestClose={closeModal}
    >
      <View style={styles.overlay}>
        <Pressable style={styles.backdrop} onPress={closeModal} />

        <View style={styles.modalCard}>
          <Text style={styles.title}>
            {isEditing ? "Editar cumpleaños" : "Nuevo cumpleaños"}
          </Text>
          <Text style={styles.subtitle}>
            Guarda día y mes. El año es opcional.
          </Text>

          <TextInput
            style={[styles.input, formError.name && styles.inputError]}
            placeholder="Nombre"
            placeholderTextColor={theme.colors.textSubtle}
            value={formData.name}
            onChangeText={(value) => updateForm("name", value)}
          />

          <TextInput
            style={[styles.input, formError.lastname && styles.inputError]}
            placeholder="Apellido"
            placeholderTextColor={theme.colors.textSubtle}
            value={formData.lastname}
            onChangeText={(value) => updateForm("lastname", value)}
          />

          <View style={styles.dateGrid}>
            <View style={styles.dateField}>
              <Text style={styles.dateLabel}>Día</Text>
              <TextInput
                style={[
                  styles.dateInput,
                  formError.birthDay && styles.inputError,
                ]}
                placeholder="DD"
                placeholderTextColor={theme.colors.textSubtle}
                keyboardType="number-pad"
                maxLength={2}
                value={formData.birthDay}
                onChangeText={(value) => updateForm("birthDay", value)}
              />
            </View>

            <View style={styles.dateField}>
              <Text style={styles.dateLabel}>Mes</Text>
              <TextInput
                style={[
                  styles.dateInput,
                  formError.birthMonth && styles.inputError,
                ]}
                placeholder="MM"
                placeholderTextColor={theme.colors.textSubtle}
                keyboardType="number-pad"
                maxLength={2}
                value={formData.birthMonth}
                onChangeText={(value) => updateForm("birthMonth", value)}
              />
            </View>

            {formData.hasBirthYear ? (
              <View style={styles.dateFieldLarge}>
                <Text style={styles.dateLabel}>Año</Text>
                <TextInput
                  style={[
                    styles.dateInput,
                    formError.birthYear && styles.inputError,
                  ]}
                  placeholder="AAAA"
                  placeholderTextColor={theme.colors.textSubtle}
                  keyboardType="number-pad"
                  maxLength={4}
                  value={formData.birthYear}
                  onChangeText={(value) => updateForm("birthYear", value)}
                />
              </View>
            ) : null}
          </View>

          <View style={styles.switchRow}>
            <View style={styles.switchTextBlock}>
              <Text style={styles.switchTitle}>Incluir año</Text>
              <Text style={styles.switchDescription}>
                Actívalo solo si quieres guardar la fecha completa.
              </Text>
            </View>

            <Switch
              value={formData.hasBirthYear}
              onValueChange={toggleBirthYear}
              thumbColor={
                formData.hasBirthYear
                  ? theme.colors.primary
                  : theme.colors.textSubtle
              }
            />
          </View>

          <View style={styles.reminderInfo}>
            <Text style={styles.reminderInfoText}>
              {notificationsEnabled
                ? "Se intentará crear un recordatorio automático."
                : "Los recordatorios están desactivados en configuración."}
            </Text>
          </View>

          {generalError ? (
            <Text style={styles.errorText}>{generalError}</Text>
          ) : null}

          <View style={styles.footer}>
            <TouchableOpacity
              style={styles.cancelButton}
              onPress={closeModal}
              disabled={isSaving}
              activeOpacity={0.85}
            >
              <Text style={styles.cancelButtonText}>Cancelar</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.saveButton, isSaving && styles.disabledButton]}
              onPress={saveBirthday}
              disabled={isSaving}
              activeOpacity={0.85}
            >
              {isSaving ? (
                <ActivityIndicator color="#FFFFFF" />
              ) : (
                <Text style={styles.saveButtonText}>
                  {isEditing ? "Actualizar" : "Guardar"}
                </Text>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}

function validateBirthdayForm(formData) {
  const errors = {};

  const cleanName = formData.name.trim();
  const cleanLastname = formData.lastname.trim();

  const birthDay = Number(formData.birthDay);
  const birthMonth = Number(formData.birthMonth);
  const birthYear = formData.hasBirthYear
    ? Number(formData.birthYear)
    : FALLBACK_BIRTH_YEAR;

  if (!cleanName) errors.name = true;
  if (!cleanLastname) errors.lastname = true;

  if (!formData.birthDay || birthDay < 1 || birthDay > 31) {
    errors.birthDay = true;
  }

  if (!formData.birthMonth || birthMonth < 1 || birthMonth > 12) {
    errors.birthMonth = true;
  }

  if (formData.hasBirthYear) {
    const currentYear = new Date().getFullYear();

    if (!formData.birthYear || birthYear < 1900 || birthYear > currentYear) {
      errors.birthYear = true;
    }
  }

  if (
    !errors.birthDay &&
    !errors.birthMonth &&
    !errors.birthYear &&
    !isValidCalendarDate(birthDay, birthMonth, birthYear)
  ) {
    errors.birthDay = true;
    errors.birthMonth = true;
  }

  if (Object.keys(errors).length === 0) {
    return {
      isValid: true,
      errors,
      message: "",
    };
  }

  return {
    isValid: false,
    errors,
    message: getValidationMessage(errors),
  };
}

function isValidCalendarDate(day, month, year) {
  const date = new Date(year, month - 1, day);

  return (
    date.getFullYear() === year &&
    date.getMonth() === month - 1 &&
    date.getDate() === day
  );
}

function getValidationMessage(errors) {
  if (errors.name || errors.lastname) {
    return "Completa el nombre y apellido.";
  }

  if (errors.birthYear) {
    return "Ingresa un año válido.";
  }

  return "Ingresa un día y mes válidos.";
}

function createStyles(theme) {
  return StyleSheet.create({
    overlay: {
      flex: 1,
      justifyContent: "center",
      paddingHorizontal: 22,
      backgroundColor: theme.colors.overlay,
    },
    backdrop: {
      ...StyleSheet.absoluteFillObject,
    },
    modalCard: {
      borderRadius: 28,
      padding: 22,
      backgroundColor: theme.colors.card,
      borderWidth: 1,
      borderColor: theme.colors.border,
    },
    title: {
      color: theme.colors.text,
      fontSize: 24,
      fontWeight: "900",
      marginBottom: 8,
    },
    subtitle: {
      color: theme.colors.textMuted,
      fontSize: 14,
      lineHeight: 20,
      marginBottom: 20,
    },
    input: {
      height: 52,
      color: theme.colors.text,
      backgroundColor: theme.colors.input,
      borderRadius: 18,
      paddingHorizontal: 18,
      marginBottom: 14,
      fontSize: 16,
      borderWidth: 1,
      borderColor: theme.colors.border,
    },
    inputError: {
      borderColor: theme.colors.danger,
    },
    dateGrid: {
      flexDirection: "row",
      gap: 10,
      marginBottom: 14,
    },
    dateField: {
      flex: 1,
    },
    dateFieldLarge: {
      flex: 1.4,
    },
    dateLabel: {
      color: theme.colors.textSubtle,
      fontSize: 12,
      fontWeight: "900",
      textTransform: "uppercase",
      marginBottom: 7,
      marginLeft: 2,
    },
    dateInput: {
      height: 52,
      color: theme.colors.text,
      backgroundColor: theme.colors.input,
      borderRadius: 18,
      paddingHorizontal: 16,
      fontSize: 16,
      fontWeight: "800",
      borderWidth: 1,
      borderColor: theme.colors.border,
    },
    switchRow: {
      minHeight: 64,
      borderRadius: 18,
      paddingHorizontal: 16,
      paddingVertical: 12,
      backgroundColor: theme.colors.input,
      borderWidth: 1,
      borderColor: theme.colors.border,
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      gap: 12,
      marginBottom: 14,
    },
    switchTextBlock: {
      flex: 1,
    },
    switchTitle: {
      color: theme.colors.text,
      fontSize: 15,
      fontWeight: "900",
      marginBottom: 4,
    },
    switchDescription: {
      color: theme.colors.textMuted,
      fontSize: 13,
      lineHeight: 18,
    },
    reminderInfo: {
      borderRadius: 14,
      paddingVertical: 10,
      paddingHorizontal: 12,
      backgroundColor: theme.colors.primarySoft,
      marginBottom: 14,
    },
    reminderInfoText: {
      color: theme.colors.primary,
      fontSize: 13,
      fontWeight: "800",
      lineHeight: 18,
    },
    errorText: {
      color: theme.colors.danger,
      fontSize: 14,
      lineHeight: 20,
      marginBottom: 14,
    },
    footer: {
      flexDirection: "row",
      gap: 12,
      marginTop: 4,
    },
    cancelButton: {
      flex: 1,
      height: 52,
      borderRadius: 18,
      alignItems: "center",
      justifyContent: "center",
      backgroundColor: theme.colors.surfaceAlt,
    },
    cancelButtonText: {
      color: theme.colors.text,
      fontSize: 15,
      fontWeight: "800",
    },
    saveButton: {
      flex: 1,
      height: 52,
      borderRadius: 18,
      alignItems: "center",
      justifyContent: "center",
      backgroundColor: theme.colors.primary,
    },
    disabledButton: {
      opacity: 0.7,
    },
    saveButtonText: {
      color: "#FFFFFF",
      fontSize: 15,
      fontWeight: "800",
    },
  });
}
