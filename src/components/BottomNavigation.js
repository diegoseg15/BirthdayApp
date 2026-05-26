// src/components/BottomNavigation.js

import React, { useMemo } from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";

const SECTIONS = {
  BIRTHDAYS: "birthdays",
  SETTINGS: "settings",
};

function BottomNavigation({
  theme,
  activeSection,
  onChangeSection,
  onOpenAddBirthday,
}) {
  const insets = useSafeAreaInsets();
  const styles = useMemo(() => createStyles(theme, insets), [theme, insets]);

  return (
    <View pointerEvents="box-none" style={styles.wrapper}>
      <View style={styles.navigationBar}>
        <TouchableOpacity
          style={styles.navItem}
          onPress={() => onChangeSection(SECTIONS.BIRTHDAYS)}
          activeOpacity={0.85}
        >
          <Ionicons
            name={
              activeSection === SECTIONS.BIRTHDAYS
                ? "calendar"
                : "calendar-outline"
            }
            size={22}
            color={
              activeSection === SECTIONS.BIRTHDAYS
                ? theme.colors.primary
                : theme.colors.textSubtle
            }
          />

          <Text
            style={[
              styles.navLabel,
              activeSection === SECTIONS.BIRTHDAYS && styles.navLabelActive,
            ]}
          >
            Cumpleaños
          </Text>
        </TouchableOpacity>

        <View style={styles.centerSpace} />

        <TouchableOpacity
          style={styles.navItem}
          onPress={() => onChangeSection(SECTIONS.SETTINGS)}
          activeOpacity={0.85}
        >
          <Ionicons
            name={
              activeSection === SECTIONS.SETTINGS
                ? "settings"
                : "settings-outline"
            }
            size={22}
            color={
              activeSection === SECTIONS.SETTINGS
                ? theme.colors.primary
                : theme.colors.textSubtle
            }
          />

          <Text
            style={[
              styles.navLabel,
              activeSection === SECTIONS.SETTINGS && styles.navLabelActive,
            ]}
          >
            Ajustes
          </Text>
        </TouchableOpacity>
      </View>

      <TouchableOpacity
        style={styles.addButton}
        onPress={onOpenAddBirthday}
        activeOpacity={0.9}
      >
        <Ionicons name="add" size={34} color="#FFFFFF" />
      </TouchableOpacity>
    </View>
  );
}

export default BottomNavigation;

function createStyles(theme, insets) {
  return StyleSheet.create({
    wrapper: {
      position: "absolute",
      left: 0,
      right: 0,
      bottom: Math.max(insets.bottom, 12),
      alignItems: "center",
      paddingHorizontal: 22,
    },
    navigationBar: {
      width: "100%",
      maxWidth: 420,
      height: 74,
      borderRadius: 24,
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      backgroundColor: theme.colors.card,
      borderWidth: 1,
      borderColor: theme.colors.border,
      shadowColor: "#000000",
      shadowOffset: {
        width: 0,
        height: 16,
      },
      shadowOpacity: theme.isDark ? 0.34 : 0.18,
      shadowRadius: 24,
      elevation: 18,
      paddingHorizontal: 12,
    },
    navItem: {
      flex: 1,
      height: 62,
      alignItems: "center",
      justifyContent: "center",
      gap: 4,
    },
    centerSpace: {
      width: 82,
    },
    navLabel: {
      color: theme.colors.textSubtle,
      fontSize: 11,
      fontWeight: "800",
    },
    navLabelActive: {
      color: theme.colors.primary,
    },
    addButton: {
      position: "absolute",
      top: -28,
      width: 68,
      height: 68,
      borderRadius: 34,
      alignItems: "center",
      justifyContent: "center",
      backgroundColor: theme.colors.primary,
      borderWidth: 7,
      borderColor: theme.colors.background,
      shadowColor: theme.colors.primary,
      shadowOffset: {
        width: 0,
        height: 10,
      },
      shadowOpacity: 0.36,
      shadowRadius: 16,
      elevation: 24,
    },
  });
}
