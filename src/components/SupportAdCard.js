// src/components/SupportAdCard.js

import React, { useMemo, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";

import { showSupportInterstitialAd } from "../services/fullScreenAdService";

export default function SupportAdCard({ theme }) {
  const styles = useMemo(() => createStyles(theme), [theme]);
  const [isLoadingAd, setIsLoadingAd] = useState(false);

  const openAd = async () => {
    if (isLoadingAd) return;

    try {
      setIsLoadingAd(true);

      const result = await showSupportInterstitialAd();

      if (!result.shown) {
        Alert.alert(
          "Anuncio no disponible",
          "No se pudo cargar un anuncio en este momento. Inténtalo más tarde.",
        );
      }
    } catch {
      Alert.alert(
        "Anuncio no disponible",
        "No se pudo cargar un anuncio en este momento. Inténtalo más tarde.",
      );
    } finally {
      setIsLoadingAd(false);
    }
  };

  return (
    <View style={styles.card}>
      <View style={styles.iconBox}>
        <Ionicons name="heart-outline" size={24} color={theme.colors.primary} />
      </View>

      <View style={styles.textBlock}>
        <Text style={styles.eyebrow}>Apoyar Rimind</Text>
        <Text style={styles.title}>Ayuda a mantener la app</Text>
        <Text style={styles.description}>
          Puedes ver un anuncio de pantalla completa para apoyar el desarrollo
          de Rimind.
        </Text>
      </View>

      <TouchableOpacity
        style={[styles.button, isLoadingAd && styles.disabledButton]}
        onPress={openAd}
        activeOpacity={0.85}
        disabled={isLoadingAd}
      >
        {isLoadingAd ? (
          <ActivityIndicator color="#FFFFFF" />
        ) : (
          <Text style={styles.buttonText}>Ver anuncio</Text>
        )}
      </TouchableOpacity>
    </View>
  );
}

function createStyles(theme) {
  return StyleSheet.create({
    card: {
      borderRadius: theme.radius.lg,
      padding: theme.spacing.lg,
      backgroundColor: theme.colors.card,
      borderWidth: 1,
      borderColor: theme.colors.border,
      marginBottom: theme.spacing.xl,
    },
    iconBox: {
      width: 48,
      height: 48,
      borderRadius: 18,
      alignItems: "center",
      justifyContent: "center",
      backgroundColor: theme.colors.primarySoft,
      marginBottom: theme.spacing.md,
    },
    textBlock: {
      marginBottom: theme.spacing.lg,
    },
    eyebrow: {
      color: theme.colors.primary,
      fontSize: 11,
      fontWeight: "900",
      textTransform: "uppercase",
      marginBottom: 6,
      letterSpacing: 0.6,
    },
    title: {
      color: theme.colors.text,
      fontSize: 18,
      fontWeight: "900",
      marginBottom: 8,
    },
    description: {
      color: theme.colors.textMuted,
      fontSize: 14,
      lineHeight: 20,
    },
    button: {
      height: 50,
      borderRadius: theme.radius.md,
      alignItems: "center",
      justifyContent: "center",
      backgroundColor: theme.colors.primary,
    },
    disabledButton: {
      opacity: 0.7,
    },
    buttonText: {
      color: "#FFFFFF",
      fontSize: 15,
      fontWeight: "900",
    },
  });
}
