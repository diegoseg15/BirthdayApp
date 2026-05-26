// App.js

import "./src/utils/base64Polyfill";

import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  SafeAreaView,
  StatusBar,
  StyleSheet,
} from "react-native";

import Auth from "./src/components/Auth";
import Birthday from "./src/components/Birthday";
import { listenAuthState } from "./src/services/authService";

export default function App() {
  const [user, setUser] = useState(undefined);

  useEffect(() => {
    const unsubscribe = listenAuthState((currentUser) => {
      setUser(currentUser);
    });

    return unsubscribe;
  }, []);

  if (user === undefined) {
    return (
      <SafeAreaView style={styles.loadingContainer}>
        <StatusBar barStyle="light-content" backgroundColor="#15212B" />
        <ActivityIndicator color="#F97316" size="large" />
      </SafeAreaView>
    );
  }

  return (
    <>
      <StatusBar barStyle="light-content" backgroundColor="#15212B" />
      {user ? <Birthday user={user} /> : <Auth />}
    </>
  );
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    backgroundColor: "#15212B",
    alignItems: "center",
    justifyContent: "center",
  },
});
