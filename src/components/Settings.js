// src/components/Settings.js

import React, { useMemo, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

import { APP_VERSION, THEME_MODES } from "../theme/appTheme";

const THEME_OPTIONS = [
  {
    label: "Sistema",
    description: "Usar la apariencia del dispositivo",
    value: THEME_MODES.SYSTEM,
  },
  {
    label: "Claro",
    description: "Interfaz clara",
    value: THEME_MODES.LIGHT,
  },
  {
    label: "Oscuro",
    description: "Interfaz oscura",
    value: THEME_MODES.DARK,
  },
];

export default function Settings({
  user,
  theme,
  appSettings,
  deviceLanguage,
  onChangeThemeMode,
  onChangeNotificationsEnabled,
  onLogout,
  isLoggingOut,
}) {
  const styles = useMemo(() => createStyles(theme), [theme]);
  const [isUpdatingNotifications, setIsUpdatingNotifications] = useState(false);

  const toggleNotifications = async (value) => {
    try {
      setIsUpdatingNotifications(true);
      await onChangeNotificationsEnabled(value);
    } catch {
      Alert.alert(
        "Error",
        "No se pudo actualizar la configuración de notificaciones.",
      );
    } finally {
      setIsUpdatingNotifications(false);
    }
  };

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
    >
      <View style={styles.headerCard}>
        <Text style={styles.eyebrow}>Configuración</Text>
        <Text style={styles.title}>Personaliza tu experiencia</Text>
        <Text style={styles.description}>
          Ajusta recordatorios, apariencia, idioma y datos generales de la app.
        </Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Notificaciones</Text>

        <View style={styles.settingRow}>
          <View style={styles.settingTextBlock}>
            <Text style={styles.settingTitle}>Recordatorios de cumpleaños</Text>
            <Text style={styles.settingDescription}>
              Programar alertas para los cumpleaños guardados.
            </Text>
          </View>

          {isUpdatingNotifications ? (
            <ActivityIndicator color={theme.colors.primary} />
          ) : (
            <Switch
              value={appSettings.notificationsEnabled}
              onValueChange={toggleNotifications}
              thumbColor={
                appSettings.notificationsEnabled
                  ? theme.colors.primary
                  : theme.colors.textSubtle
              }
            />
          )}
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Apariencia</Text>

        {THEME_OPTIONS.map((option) => {
          const isActive = appSettings.themeMode === option.value;

          return (
            <TouchableOpacity
              key={option.value}
              style={[styles.optionRow, isActive && styles.optionRowActive]}
              onPress={() => onChangeThemeMode(option.value)}
              activeOpacity={0.85}
            >
              <View style={styles.settingTextBlock}>
                <Text style={styles.settingTitle}>{option.label}</Text>
                <Text style={styles.settingDescription}>
                  {option.description}
                </Text>
              </View>

              <View style={[styles.radio, isActive && styles.radioActive]}>
                {isActive ? <View style={styles.radioDot} /> : null}
              </View>
            </TouchableOpacity>
          );
        })}
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Idioma</Text>

        <View style={styles.infoCard}>
          <Text style={styles.settingTitle}>Idioma del dispositivo</Text>
          <Text style={styles.settingDescription}>
            La app toma el idioma desde la configuración del celular.
          </Text>

          <View style={styles.infoPill}>
            <Text style={styles.infoPillText}>
              {deviceLanguage.languageTag}
            </Text>
          </View>
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Cuenta</Text>

        <View style={styles.infoCard}>
          <Text style={styles.settingTitle}>Sesión activa</Text>
          <Text style={styles.settingDescription}>{user.email}</Text>

          <TouchableOpacity
            style={[styles.logoutButton, isLoggingOut && styles.disabledButton]}
            onPress={onLogout}
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
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Información de la app</Text>

        <View style={styles.infoCard}>
          <Text style={styles.appName}>BirthdayApp</Text>
          <Text style={styles.settingDescription}>
            Organizador de cumpleaños con recordatorios y sincronización en la
            nube.
          </Text>

          <View style={styles.infoPill}>
            <Text style={styles.infoPillText}>Versión {APP_VERSION}</Text>
          </View>
        </View>
      </View>
    </ScrollView>
  );
}

function createStyles(theme) {
  return StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.colors.background,
    },
    content: {
      padding: theme.spacing.xl,
      paddingBottom: 42,
    },
    headerCard: {
      borderRadius: theme.radius.xl,
      padding: theme.spacing.xl,
      backgroundColor: theme.colors.card,
      borderWidth: 1,
      borderColor: theme.colors.border,
      marginBottom: theme.spacing.xl,
    },
    eyebrow: {
      color: theme.colors.primary,
      fontSize: 12,
      fontWeight: "900",
      textTransform: "uppercase",
      marginBottom: 8,
    },
    title: {
      color: theme.colors.text,
      fontSize: 26,
      fontWeight: "900",
      marginBottom: 10,
    },
    description: {
      color: theme.colors.textMuted,
      fontSize: 15,
      lineHeight: 22,
    },
    section: {
      marginBottom: theme.spacing.xl,
    },
    sectionTitle: {
      color: theme.colors.text,
      fontSize: 18,
      fontWeight: "900",
      marginBottom: theme.spacing.md,
    },
    settingRow: {
      minHeight: 82,
      borderRadius: theme.radius.lg,
      padding: theme.spacing.lg,
      backgroundColor: theme.colors.card,
      borderWidth: 1,
      borderColor: theme.colors.border,
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      gap: theme.spacing.md,
    },
    optionRow: {
      minHeight: 78,
      borderRadius: theme.radius.lg,
      padding: theme.spacing.lg,
      backgroundColor: theme.colors.card,
      borderWidth: 1,
      borderColor: theme.colors.border,
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      gap: theme.spacing.md,
      marginBottom: theme.spacing.sm,
    },
    optionRowActive: {
      borderColor: theme.colors.primary,
      backgroundColor: theme.colors.primarySoft,
    },
    settingTextBlock: {
      flex: 1,
    },
    settingTitle: {
      color: theme.colors.text,
      fontSize: 16,
      fontWeight: "900",
      marginBottom: 5,
    },
    settingDescription: {
      color: theme.colors.textMuted,
      fontSize: 14,
      lineHeight: 20,
    },
    radio: {
      width: 24,
      height: 24,
      borderRadius: 12,
      borderWidth: 2,
      borderColor: theme.colors.textSubtle,
      alignItems: "center",
      justifyContent: "center",
    },
    radioActive: {
      borderColor: theme.colors.primary,
    },
    radioDot: {
      width: 10,
      height: 10,
      borderRadius: 5,
      backgroundColor: theme.colors.primary,
    },
    infoCard: {
      borderRadius: theme.radius.lg,
      padding: theme.spacing.lg,
      backgroundColor: theme.colors.card,
      borderWidth: 1,
      borderColor: theme.colors.border,
    },
    infoPill: {
      alignSelf: "flex-start",
      marginTop: theme.spacing.md,
      borderRadius: 999,
      paddingVertical: 8,
      paddingHorizontal: 12,
      backgroundColor: theme.colors.primarySoft,
    },
    infoPillText: {
      color: theme.colors.primary,
      fontSize: 13,
      fontWeight: "900",
    },
    logoutButton: {
      height: 50,
      borderRadius: theme.radius.md,
      alignItems: "center",
      justifyContent: "center",
      backgroundColor: theme.colors.danger,
      marginTop: theme.spacing.lg,
    },
    disabledButton: {
      opacity: 0.7,
    },
    logoutButtonText: {
      color: "#FFFFFF",
      fontSize: 15,
      fontWeight: "900",
    },
    appName: {
      color: theme.colors.text,
      fontSize: 22,
      fontWeight: "900",
      marginBottom: 8,
    },
  });
}
