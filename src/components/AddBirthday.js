// src/components/AddBirthday.js

import React, { useState } from "react";
import {
  ActivityIndicator,
  Modal,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import DateTimePickerModal from "react-native-modal-datetime-picker";

import { createBirthday } from "../services/birthdayService";
import { formatDate } from "../utils/date";

const DEFAULT_FORM = {
  name: "",
  lastname: "",
  dateBirth: new Date(),
};

export default function AddBirthday({ visible, userId, onClose }) {
  const [formData, setFormData] = useState(DEFAULT_FORM);
  const [formError, setFormError] = useState({});
  const [generalError, setGeneralError] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [isDatePickerVisible, setIsDatePickerVisible] = useState(false);

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

  const resetForm = () => {
    setFormData(DEFAULT_FORM);
    setFormError({});
    setGeneralError("");
    setIsDatePickerVisible(false);
  };

  const closeModal = () => {
    if (isSaving) return;

    resetForm();
    onClose();
  };

  const saveBirthday = async () => {
    const errors = {};

    if (!formData.name.trim()) errors.name = true;
    if (!formData.lastname.trim()) errors.lastname = true;
    if (!formData.dateBirth) errors.dateBirth = true;

    setFormError(errors);

    if (Object.keys(errors).length > 0) {
      setGeneralError("Completa todos los campos.");
      return;
    }

    try {
      setIsSaving(true);
      setGeneralError("");

      await createBirthday(userId, formData);

      resetForm();
      onClose();
    } catch {
      setGeneralError(
        "No se pudo guardar el cumpleaños. Inténtalo nuevamente.",
      );
    } finally {
      setIsSaving(false);
    }
  };

  const handleConfirmDate = (selectedDate) => {
    updateForm("dateBirth", selectedDate);
    setIsDatePickerVisible(false);
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
          <Text style={styles.title}>Nuevo cumpleaños</Text>
          <Text style={styles.subtitle}>
            Guarda la fecha de una persona importante.
          </Text>

          <TextInput
            style={[styles.input, formError.name && styles.inputError]}
            placeholder="Nombre"
            placeholderTextColor="#94A3B8"
            value={formData.name}
            onChangeText={(value) => updateForm("name", value)}
          />

          <TextInput
            style={[styles.input, formError.lastname && styles.inputError]}
            placeholder="Apellido"
            placeholderTextColor="#94A3B8"
            value={formData.lastname}
            onChangeText={(value) => updateForm("lastname", value)}
          />

          <TouchableOpacity
            style={[
              styles.dateButton,
              formError.dateBirth && styles.inputError,
            ]}
            onPress={() => setIsDatePickerVisible(true)}
            activeOpacity={0.85}
          >
            <View>
              <Text style={styles.dateLabel}>Fecha de nacimiento</Text>
              <Text style={styles.dateValue}>
                {formatDate(formData.dateBirth)}
              </Text>
            </View>
          </TouchableOpacity>

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
                <Text style={styles.saveButtonText}>Guardar</Text>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </View>

      <DateTimePickerModal
        isVisible={isDatePickerVisible}
        mode="date"
        date={formData.dateBirth}
        maximumDate={new Date()}
        display={Platform.OS === "ios" ? "inline" : "default"}
        onConfirm={handleConfirmDate}
        onCancel={() => setIsDatePickerVisible(false)}
      />
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: "center",
    paddingHorizontal: 22,
    backgroundColor: "rgba(0,0,0,0.62)",
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
  },
  modalCard: {
    borderRadius: 28,
    padding: 22,
    backgroundColor: "#1E3040",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.1)",
  },
  title: {
    color: "#FFFFFF",
    fontSize: 24,
    fontWeight: "900",
    marginBottom: 8,
  },
  subtitle: {
    color: "#CBD5E1",
    fontSize: 14,
    lineHeight: 20,
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
  dateButton: {
    minHeight: 62,
    justifyContent: "center",
    backgroundColor: "#15212B",
    borderRadius: 18,
    paddingHorizontal: 18,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.08)",
  },
  dateLabel: {
    color: "#94A3B8",
    fontSize: 12,
    fontWeight: "700",
    textTransform: "uppercase",
    marginBottom: 4,
  },
  dateValue: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "700",
  },
  errorText: {
    color: "#FCA5A5",
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
    backgroundColor: "#334155",
  },
  cancelButtonText: {
    color: "#E2E8F0",
    fontSize: 15,
    fontWeight: "800",
  },
  saveButton: {
    flex: 1,
    height: 52,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#F97316",
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
