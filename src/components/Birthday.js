// src/components/Birthday.js

import React, { useEffect, useState } from "react";
import { StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { logout } from "../services/authService";
import { migrateLegacyBirthdays } from "../services/birthdayService";
import ActionBar from "./ActionBar";
import AddBirthday from "./AddBirthday";
import ListBirthday from "./ListBirthday";

export default function Birthday({ user }) {
  const [isAddBirthdayVisible, setIsAddBirthdayVisible] = useState(false);
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
    setIsAddBirthdayVisible(true);
  };

  const closeAddBirthday = () => {
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

  return (
    <SafeAreaView style={styles.safeArea} edges={["top", "right", "left"]}>
      <ActionBar
        userEmail={user.email}
        onOpenAddBirthday={openAddBirthday}
        onLogout={handleLogout}
        isLoggingOut={isLoggingOut}
      />

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

      <ListBirthday userId={user.uid} />

      <AddBirthday
        visible={isAddBirthdayVisible}
        userId={user.uid}
        onClose={closeAddBirthday}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#15212B",
  },
  successBanner: {
    marginHorizontal: 22,
    marginTop: 14,
    borderRadius: 16,
    paddingVertical: 12,
    paddingHorizontal: 14,
    backgroundColor: "rgba(34,197,94,0.16)",
    borderWidth: 1,
    borderColor: "rgba(134,239,172,0.26)",
  },
  successBannerText: {
    color: "#86EFAC",
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
    backgroundColor: "rgba(239,68,68,0.16)",
    borderWidth: 1,
    borderColor: "rgba(252,165,165,0.26)",
  },
  errorBannerText: {
    color: "#FCA5A5",
    fontSize: 13,
    fontWeight: "800",
    textAlign: "center",
  },
});
