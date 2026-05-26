// App.js

import './src/utils/base64Polyfill';

import React, { useEffect, useState } from 'react';
import { ActivityIndicator, StatusBar, StyleSheet } from 'react-native';
import {
  SafeAreaProvider,
  SafeAreaView,
} from 'react-native-safe-area-context';

import Auth from './src/components/Auth';
import Birthday from './src/components/Birthday';
import { listenAuthState } from './src/services/authService';
import { configureNotifications } from './src/services/notificationService';

export default function App() {
  return (
    <SafeAreaProvider>
      <AppContent />
    </SafeAreaProvider>
  );
}

function AppContent() {
  const [user, setUser] = useState(undefined);

  useEffect(() => {
    configureNotifications();
  }, []);

  useEffect(() => {
    const unsubscribe = listenAuthState((currentUser) => {
      setUser(currentUser);
    });

    return unsubscribe;
  }, []);

  if (user === undefined) {
    return (
      <SafeAreaView
        style={styles.loadingContainer}
        edges={['top', 'right', 'bottom', 'left']}
      >
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
    backgroundColor: '#15212B',
    alignItems: 'center',
    justifyContent: 'center',
  },
});