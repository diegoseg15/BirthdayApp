// src/components/Birthday.js

import React, { useState } from "react";
import { StyleSheet } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { logout } from "../services/authService";
import ActionBar from "./ActionBar";
import AddBirthday from "./AddBirthday";
import ListBirthday from "./ListBirthday";

export default function Birthday({ user }) {
  const [isAddBirthdayVisible, setIsAddBirthdayVisible] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);

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
});
