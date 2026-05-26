// src/components/ActionBar.js

import React, { useMemo } from "react";
import { StyleSheet, Text, View } from "react-native";

export default function ActionBar({ theme, userEmail, activeSection }) {
  const styles = useMemo(() => createStyles(theme), [theme]);

  const sectionTitle =
    activeSection === "settings" ? "Configuración" : "Cumpleaños";

  const sectionDescription =
    activeSection === "settings"
      ? "Ajustes de la app, cuenta y preferencias."
      : "Organiza fechas importantes y próximos cumpleaños.";

  return (
    <View style={styles.container}>
      <View style={styles.profileBlock}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>B</Text>
        </View>

        <View style={styles.profileTextBlock}>
          <Text style={styles.appTitle}>BirthdayApp</Text>
          <Text style={styles.email} numberOfLines={1}>
            {userEmail}
          </Text>
        </View>
      </View>

      <View style={styles.sectionBlock}>
        <Text style={styles.sectionTitle}>{sectionTitle}</Text>
        <Text style={styles.sectionDescription}>{sectionDescription}</Text>
      </View>
    </View>
  );
}

function createStyles(theme) {
  return StyleSheet.create({
    container: {
      paddingHorizontal: 22,
      paddingTop: 14,
      paddingBottom: 18,
      backgroundColor: theme.colors.background,
      borderBottomWidth: 1,
      borderBottomColor: theme.colors.border,
    },
    profileBlock: {
      flexDirection: "row",
      alignItems: "center",
      marginBottom: 18,
    },
    avatar: {
      width: 48,
      height: 48,
      borderRadius: 18,
      alignItems: "center",
      justifyContent: "center",
      backgroundColor: theme.colors.primary,
      marginRight: 14,
    },
    avatarText: {
      color: "#FFFFFF",
      fontSize: 24,
      fontWeight: "900",
    },
    profileTextBlock: {
      flex: 1,
    },
    appTitle: {
      color: theme.colors.text,
      fontSize: 22,
      fontWeight: "900",
      marginBottom: 2,
    },
    email: {
      color: theme.colors.textMuted,
      fontSize: 13,
      fontWeight: "600",
    },
    sectionBlock: {
      borderRadius: 22,
      padding: 18,
      backgroundColor: theme.colors.card,
      borderWidth: 1,
      borderColor: theme.colors.border,
    },
    sectionTitle: {
      color: theme.colors.text,
      fontSize: 24,
      fontWeight: "900",
      marginBottom: 6,
    },
    sectionDescription: {
      color: theme.colors.textMuted,
      fontSize: 14,
      lineHeight: 20,
    },
  });
}
