import React from 'react';
import { useEffect } from 'react';
import { router } from 'expo-router';

export default function HomeScreen() {
  useEffect(() => {
    // Defer navigation to next tick to ensure Root Layout is mounted
    setTimeout(() => {
      // Check if user has completed onboarding (simplified for demo)
      const hasCompletedOnboarding = false; // In real app, check AsyncStorage
      const isAuthenticated = false; // In real app, check auth state
      
      if (!hasCompletedOnboarding) {
        router.replace('/onboarding');
      } else if (!isAuthenticated) {
        router.replace('/auth/signin');
      } else {
        router.replace('/(tabs)/scan');
      }
    }, 0);
  }, []);

  // Return null or loading screen while redirecting
  return null;
}