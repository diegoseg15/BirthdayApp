// src/theme/appTheme.js

export const APP_VERSION = "2.0.0";

export const THEME_MODES = {
  SYSTEM: "system",
  LIGHT: "light",
  DARK: "dark",
};

const shared = {
  spacing: {
    xs: 6,
    sm: 10,
    md: 14,
    lg: 18,
    xl: 22,
    xxl: 28,
  },
  radius: {
    sm: 12,
    md: 16,
    lg: 22,
    xl: 28,
  },
};

const palettes = {
  dark: {
    background: "#15212B",
    surface: "#1E3040",
    surfaceAlt: "#24384A",
    card: "#1E3040",
    primary: "#F97316",
    primarySoft: "rgba(249,115,22,0.14)",
    text: "#FFFFFF",
    textMuted: "#CBD5E1",
    textSubtle: "#94A3B8",
    border: "rgba(255,255,255,0.08)",
    danger: "#EF4444",
    dangerSoft: "rgba(239,68,68,0.16)",
    success: "#22C55E",
    successSoft: "rgba(34,197,94,0.16)",
    warning: "#FDBA74",
    overlay: "rgba(0,0,0,0.62)",
    input: "#15212B",
  },
  light: {
    background: "#F8FAFC",
    surface: "#FFFFFF",
    surfaceAlt: "#E2E8F0",
    card: "#FFFFFF",
    primary: "#F97316",
    primarySoft: "rgba(249,115,22,0.12)",
    text: "#0F172A",
    textMuted: "#475569",
    textSubtle: "#64748B",
    border: "#E2E8F0",
    danger: "#DC2626",
    dangerSoft: "rgba(220,38,38,0.10)",
    success: "#16A34A",
    successSoft: "rgba(22,163,74,0.10)",
    warning: "#C2410C",
    overlay: "rgba(15,23,42,0.48)",
    input: "#F1F5F9",
  },
};

export function getResolvedThemeMode(themeMode, systemColorScheme) {
  if (themeMode === THEME_MODES.LIGHT) return THEME_MODES.LIGHT;
  if (themeMode === THEME_MODES.DARK) return THEME_MODES.DARK;

  return systemColorScheme === "dark" ? THEME_MODES.DARK : THEME_MODES.LIGHT;
}

export function createAppTheme(themeMode, systemColorScheme) {
  const resolvedMode = getResolvedThemeMode(themeMode, systemColorScheme);
  const isDark = resolvedMode === THEME_MODES.DARK;

  return {
    mode: resolvedMode,
    preference: themeMode,
    isDark,
    colors: palettes[resolvedMode],
    ...shared,
  };
}
