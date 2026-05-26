// src/components/BrandLogo.js

import React, { useMemo } from "react";
import { Image, StyleSheet, View } from "react-native";

const lightLogo = require("../../assets/icons/icon-light.png");
const darkLogo = require("../../assets/icons/icon-dark.png");

export default function BrandLogo({
  theme,
  size = 52,
  rounded = 18,
  showBackground = true,
}) {
  const styles = useMemo(
    () => createStyles(theme, size, rounded, showBackground),
    [theme, size, rounded, showBackground],
  );

  const logoSource = theme?.isDark ? darkLogo : lightLogo;

  return (
    <View style={styles.container}>
      <Image source={logoSource} style={styles.logo} resizeMode="contain" />
    </View>
  );
}

function createStyles(theme, size, rounded, showBackground) {
  return StyleSheet.create({
    container: {
      width: size,
      height: size,
      borderRadius: rounded,
      alignItems: "center",
      justifyContent: "center",
      backgroundColor: showBackground ? theme.colors.card : "transparent",
      borderWidth: showBackground ? 1 : 0,
      borderColor: theme.colors.border,
      overflow: "hidden",
    },
    logo: {
      width: size,
      height: size,
    },
  });
}
