// src/components/AdCard.js

import React, { useMemo, useState } from "react";
import { Platform, StyleSheet, Text, View } from "react-native";
import {
  BannerAd,
  BannerAdSize,
  TestIds,
} from "react-native-google-mobile-ads";

function getBannerAdUnitId() {
  if (__DEV__) {
    return TestIds.BANNER;
  }

  return Platform.select({
    android: process.env.EXPO_PUBLIC_ADMOB_ANDROID_BANNER_ID,
    ios: process.env.EXPO_PUBLIC_ADMOB_IOS_BANNER_ID,
    default: undefined,
  });
}

export default function AdCard({ theme, placement = "default" }) {
  const styles = useMemo(
    () => createStyles(theme, placement),
    [theme, placement],
  );
  const [hasAdError, setHasAdError] = useState(false);

  const bannerAdUnitId = getBannerAdUnitId();

  if (!bannerAdUnitId || hasAdError) {
    return null;
  }

  return (
    <View style={styles.card}>
      <View style={styles.header}>
        <View>
          <Text style={styles.label}>Publicidad</Text>
          <Text style={styles.title}>Contenido patrocinado</Text>
        </View>

        <View style={styles.badge}>
          <Text style={styles.badgeText}>Ad</Text>
        </View>
      </View>

      <View style={styles.bannerContainer}>
        <BannerAd
          unitId={bannerAdUnitId}
          size={BannerAdSize.ANCHORED_ADAPTIVE_BANNER}
          requestOptions={{
            requestNonPersonalizedAdsOnly: true,
          }}
          onAdFailedToLoad={(error) => {
            console.warn("Ad failed to load:", error);
            setHasAdError(true);
          }}
        />
      </View>
    </View>
  );
}

function createStyles(theme, placement) {
  const isSettingsPlacement = placement === "settings";

  return StyleSheet.create({
    card: {
      borderRadius: theme.radius.lg,
      padding: theme.spacing.lg,
      backgroundColor: theme.colors.card,
      borderWidth: 1,
      borderColor: theme.colors.border,
      marginBottom: isSettingsPlacement ? theme.spacing.xl : 14,
      overflow: "hidden",
    },
    header: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      gap: theme.spacing.md,
      marginBottom: theme.spacing.md,
    },
    label: {
      color: theme.colors.primary,
      fontSize: 11,
      fontWeight: "900",
      textTransform: "uppercase",
      marginBottom: 4,
      letterSpacing: 0.6,
    },
    title: {
      color: theme.colors.text,
      fontSize: 16,
      fontWeight: "900",
    },
    badge: {
      borderRadius: 999,
      paddingVertical: 6,
      paddingHorizontal: 10,
      backgroundColor: theme.colors.primarySoft,
    },
    badgeText: {
      color: theme.colors.primary,
      fontSize: 12,
      fontWeight: "900",
    },
    bannerContainer: {
      minHeight: 70,
      borderRadius: theme.radius.md,
      alignItems: "center",
      justifyContent: "center",
      backgroundColor: theme.colors.input,
      borderWidth: 1,
      borderColor: theme.colors.border,
      overflow: "hidden",
    },
  });
}
