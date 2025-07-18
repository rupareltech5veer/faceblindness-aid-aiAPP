// Polyfill for structuredClone (for React Native/Expo)
if (typeof globalThis.structuredClone !== 'function') {
  globalThis.structuredClone = (obj: any) => JSON.parse(JSON.stringify(obj));
}
import React, { useEffect, useState } from 'react';
import { View, StyleSheet } from 'react-native';
import { router } from 'expo-router';
import { supabase } from '../lib/supabase';
import { StorageService } from '../lib/storage';

export default function HomeScreen() {
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    checkAppState();
  }, []);

  const checkAppState = async () => {
    try {
      // Check if this is the first launch
      const isFirstLaunch = await StorageService.isFirstLaunch();
      
      if (isFirstLaunch) {
        // First time opening the app - show onboarding
        router.replace('/onboarding');
        return;
      }

      // Not first launch - show title screen then navigate to login
      router.replace('/title');
      
    } catch (error) {
      console.error('Error checking app state:', error);
      // Default to onboarding on error
      router.replace('/onboarding');
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return <View style={styles.container} />;
  }

  return null;
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F1F5F9',
  },
});