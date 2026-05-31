// src/components/Birthday.js

import React, { useEffect, useMemo, useState } from "react";
import { Alert, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { logout } from "../services/authService";
import {
  disableBirthdayRemindersForUser,
  enableBirthdayRemindersForUser,
  migrateLegacyBirthdays,
} from "../services/birthdayService";
import ActionBar from "./ActionBar";
import AddBirthday from "./AddBirthday";
import BottomNavigation from "./BottomNavigation";
import ListBirthday from "./ListBirthday";
import Settings from "./Settings";

const SECTIONS = {
  BIRTHDAYS: "birthdays",
  SETTINGS: "settings",
};

export default function Birthday({
  user,
  theme,
  appSettings,
  deviceLanguage,
  onChangeThemeMode,
  onChangeNotificationsEnabled,
  onRequestLogin,
}) {
  const styles = useMemo(() => createStyles(theme), [theme]);

  const [activeSection, setActiveSection] = useState(SECTIONS.BIRTHDAYS);
  const [isAddBirthdayVisible, setIsAddBirthdayVisible] = useState(false);
  const [birthdayToEdit, setBirthdayToEdit] = useState(null);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [migrationMessage, setMigrationMessage] = useState("");
  const [migrationError, setMigrationError] = useState("");

  useEffect(() => {
    let isMounted = true;

    async function runLegacyMigration() {
      try {
        setMigrationError("");

        const result = await migrateLegacyBirthdays(user.uid);

        if (!isMounted) return;

        if (result.migrated > 0) {
          setMigrationMessage(
            `Se recuperaron ${result.migrated} cumpleaños anteriores.`,
          );

          setTimeout(() => {
            if (isMounted) {
              setMigrationMessage("");
            }
          }, 4500);
        }
      } catch {
        if (isMounted) {
          setMigrationError(
            "No se pudieron recuperar los cumpleaños anteriores. Revisa las reglas de Firestore.",
          );
        }
      }
    }

    runLegacyMigration();

    return () => {
      isMounted = false;
    };
  }, [user.uid]);

  const openAddBirthday = () => {
    setBirthdayToEdit(null);
    setIsAddBirthdayVisible(true);
  };

  const openEditBirthday = (birthday) => {
    setBirthdayToEdit(birthday);
    setIsAddBirthdayVisible(true);
  };

  const closeAddBirthday = () => {
    setBirthdayToEdit(null);
    setIsAddBirthdayVisible(false);
  };

  const handleLogout = async () => {
    try {
      setIsLoggingOut(true);
      await logout();
    } finally {
      setIsLoggingOut(false);
    }
  };

  const handleChangeNotifications = async (enabled) => {
    await onChangeNotificationsEnabled(enabled);

    try {
      if (enabled) {
        await enableBirthdayRemindersForUser(user.uid);
        return;
      }

      await disableBirthdayRemindersForUser(user.uid);
    } catch {
      Alert.alert(
        "Aviso",
        "La preferencia se guardó, pero no se pudieron actualizar todos los recordatorios existentes.",
      );
    }
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={["top", "right", "left"]}>
      <View style={styles.content}>
        <ActionBar theme={theme} userEmail={user.email} />

        {migrationMessage ? (
          <View style={styles.successBanner}>
            <Text style={styles.successBannerText}>{migrationMessage}</Text>
          </View>
        ) : null}

        {migrationError ? (
          <View style={styles.errorBanner}>
            <Text style={styles.errorBannerText}>{migrationError}</Text>
          </View>
        ) : null}

        {activeSection === SECTIONS.BIRTHDAYS ? (
          <ListBirthday
            userId={user.uid}
            theme={theme}
            notificationsEnabled={appSettings.notificationsEnabled}
            onEditBirthday={openEditBirthday}
          />
        ) : (
          <Settings
            user={user}
            theme={theme}
            appSettings={appSettings}
            deviceLanguage={deviceLanguage}
            onChangeThemeMode={onChangeThemeMode}
            onChangeNotificationsEnabled={handleChangeNotifications}
            onLogout={handleLogout}
            onRequestLogin={onRequestLogin}
            isLoggingOut={isLoggingOut}
          />
        )}
      </View>

      <AddBirthday
        visible={isAddBirthdayVisible}
        userId={user.uid}
        theme={theme}
        notificationsEnabled={appSettings.notificationsEnabled}
        birthdayToEdit={birthdayToEdit}
        onClose={closeAddBirthday}
      />

      <BottomNavigation
        theme={theme}
        activeSection={activeSection}
        onChangeSection={setActiveSection}
        onOpenAddBirthday={openAddBirthday}
      />
    </SafeAreaView>
  );
}

function createStyles(theme) {
  return StyleSheet.create({
    safeArea: {
      flex: 1,
      backgroundColor: theme.colors.background,
    },
    content: {
      flex: 1,
      backgroundColor: theme.colors.background,
    },
    successBanner: {
      marginHorizontal: 22,
      marginTop: 14,
      borderRadius: 16,
      paddingVertical: 12,
      paddingHorizontal: 14,
      backgroundColor: theme.colors.successSoft,
      borderWidth: 1,
      borderColor: theme.colors.success,
    },
    successBannerText: {
      color: theme.colors.success,
      fontSize: 13,
      fontWeight: "800",
      textAlign: "center",
    },
    errorBanner: {
      marginHorizontal: 22,
      marginTop: 14,
      borderRadius: 16,
      paddingVertical: 12,
      paddingHorizontal: 14,
      backgroundColor: theme.colors.dangerSoft,
      borderWidth: 1,
      borderColor: theme.colors.danger,
    },
    errorBannerText: {
      color: theme.colors.danger,
      fontSize: 13,
      fontWeight: "800",
      textAlign: "center",
    },
  });
}
