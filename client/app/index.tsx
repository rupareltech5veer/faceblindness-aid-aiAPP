// Polyfill for structuredClone (for React Native/Expo)
if (typeof globalThis.structuredClone !== 'function') {
  globalThis.structuredClone = (obj: any) => JSON.parse(JSON.stringify(obj));
}
import React, { useEffect } from 'react';
import { View, StyleSheet } from 'react-native';
import { router } from 'expo-router';

export default function HomeScreen() {
  useEffect(() => {
    const timer = setTimeout(() => {
      router.replace('/onboarding');
    }, 0);
    return () => clearTimeout(timer);
  }, []);

  return <View style={styles.container} />;
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F1F5F9',
  },
});