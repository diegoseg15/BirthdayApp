// src/components/ActionBar.js

import React, { useMemo } from "react";
import { StyleSheet, Text, View } from "react-native";

import BrandLogo from "./BrandLogo";

export default function ActionBar({ theme, userEmail }) {
  const styles = useMemo(() => createStyles(theme), [theme]);

  return (
    <View style={styles.container}>
      <View style={styles.profileBlock}>
        <BrandLogo theme={theme} size={50} rounded={18} />

        <View style={styles.profileTextBlock}>
          <Text style={styles.appTitle}>Rimind</Text>
          <Text style={styles.email} numberOfLines={1}>
            {userEmail}
          </Text>
        </View>
      </View>
    </View>
  );
}

function createStyles(theme) {
  return StyleSheet.create({
    container: {
      paddingHorizontal: 22,
      paddingTop: 14,
      paddingBottom: 14,
      backgroundColor: theme.colors.background,
      borderBottomWidth: 1,
      borderBottomColor: theme.colors.border,
    },
    profileBlock: {
      flexDirection: "row",
      alignItems: "center",
    },
    profileTextBlock: {
      flex: 1,
      marginLeft: 14,
    },
    appTitle: {
      color: theme.colors.text,
      fontSize: 22,
      fontWeight: "900",
      marginBottom: 2,
      letterSpacing: -0.3,
    },
    email: {
      color: theme.colors.textMuted,
      fontSize: 13,
      fontWeight: "600",
    },
  });
}
