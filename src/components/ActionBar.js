// src/components/ActionBar.js

import React, { useMemo } from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";

const SECTIONS = {
  BIRTHDAYS: "birthdays",
  SETTINGS: "settings",
};

export default function ActionBar({
  theme,
  userEmail,
  activeSection,
  onChangeSection,
  onOpenAddBirthday,
}) {
  const styles = useMemo(() => createStyles(theme), [theme]);

  return (
    <View style={styles.container}>
      <View style={styles.profileBlock}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>B</Text>
        </View>

        <View style={styles.profileTextBlock}>
          <Text style={styles.title}>BirthdayApp</Text>
          <Text style={styles.email} numberOfLines={1}>
            {userEmail}
          </Text>
        </View>

        <TouchableOpacity
          style={styles.addButton}
          onPress={onOpenAddBirthday}
          activeOpacity={0.85}
        >
          <Text style={styles.addButtonText}>+</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.tabs}>
        <TouchableOpacity
          style={[
            styles.tab,
            activeSection === SECTIONS.BIRTHDAYS && styles.tabActive,
          ]}
          onPress={() => onChangeSection(SECTIONS.BIRTHDAYS)}
          activeOpacity={0.85}
        >
          <Text
            style={[
              styles.tabText,
              activeSection === SECTIONS.BIRTHDAYS && styles.tabTextActive,
            ]}
          >
            Cumpleaños
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.tab,
            activeSection === SECTIONS.SETTINGS && styles.tabActive,
          ]}
          onPress={() => onChangeSection(SECTIONS.SETTINGS)}
          activeOpacity={0.85}
        >
          <Text
            style={[
              styles.tabText,
              activeSection === SECTIONS.SETTINGS && styles.tabTextActive,
            ]}
          >
            Configuración
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

function createStyles(theme) {
  return StyleSheet.create({
    container: {
      paddingHorizontal: 22,
      paddingTop: 14,
      paddingBottom: 16,
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
    title: {
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
    addButton: {
      width: 46,
      height: 46,
      borderRadius: 16,
      alignItems: "center",
      justifyContent: "center",
      backgroundColor: theme.colors.primary,
    },
    addButtonText: {
      color: "#FFFFFF",
      fontSize: 28,
      lineHeight: 30,
      fontWeight: "900",
    },
    tabs: {
      flexDirection: "row",
      padding: 4,
      borderRadius: 18,
      backgroundColor: theme.colors.surface,
      borderWidth: 1,
      borderColor: theme.colors.border,
    },
    tab: {
      flex: 1,
      height: 42,
      borderRadius: 14,
      alignItems: "center",
      justifyContent: "center",
    },
    tabActive: {
      backgroundColor: theme.colors.primary,
    },
    tabText: {
      color: theme.colors.textMuted,
      fontSize: 14,
      fontWeight: "800",
    },
    tabTextActive: {
      color: "#FFFFFF",
    },
  });
}
