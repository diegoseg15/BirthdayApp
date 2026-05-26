// src/hooks/useAppSettings.js

import { useCallback, useEffect, useMemo, useState } from "react";
import { useColorScheme } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as Localization from "expo-localization";

import { createAppTheme, THEME_MODES } from "../theme/appTheme";

const SETTINGS_STORAGE_KEY = "@birthday-app/settings";

const DEFAULT_SETTINGS = {
  themeMode: THEME_MODES.SYSTEM,
  notificationsEnabled: true,
};

export function useAppSettings() {
  const systemColorScheme = useColorScheme();
  const [settings, setSettings] = useState(DEFAULT_SETTINGS);
  const [isSettingsReady, setIsSettingsReady] = useState(false);

  useEffect(() => {
    let isMounted = true;

    async function loadSettings() {
      try {
        const storedSettings = await AsyncStorage.getItem(SETTINGS_STORAGE_KEY);

        if (!isMounted) return;

        if (storedSettings) {
          setSettings({
            ...DEFAULT_SETTINGS,
            ...JSON.parse(storedSettings),
          });
        }
      } finally {
        if (isMounted) {
          setIsSettingsReady(true);
        }
      }
    }

    loadSettings();

    return () => {
      isMounted = false;
    };
  }, []);

  const persistSettings = useCallback(async (nextSettings) => {
    setSettings(nextSettings);
    await AsyncStorage.setItem(
      SETTINGS_STORAGE_KEY,
      JSON.stringify(nextSettings),
    );
  }, []);

  const updateThemeMode = useCallback(
    async (themeMode) => {
      const validThemeModes = Object.values(THEME_MODES);

      if (!validThemeModes.includes(themeMode)) return;

      await persistSettings({
        ...settings,
        themeMode,
      });
    },
    [persistSettings, settings],
  );

  const updateNotificationsEnabled = useCallback(
    async (notificationsEnabled) => {
      await persistSettings({
        ...settings,
        notificationsEnabled,
      });
    },
    [persistSettings, settings],
  );

  const theme = useMemo(
    () => createAppTheme(settings.themeMode, systemColorScheme),
    [settings.themeMode, systemColorScheme],
  );

  const deviceLanguage = useMemo(() => {
    const locale = Localization.getLocales?.()[0];

    return {
      languageTag:
        locale?.languageTag ||
        Intl.DateTimeFormat().resolvedOptions().locale ||
        "es-EC",
      languageCode: locale?.languageCode || "es",
      regionCode: locale?.regionCode || "",
      currencyCode: locale?.currencyCode || "",
    };
  }, []);

  return {
    settings,
    isSettingsReady,
    theme,
    deviceLanguage,
    updateThemeMode,
    updateNotificationsEnabled,
  };
}
