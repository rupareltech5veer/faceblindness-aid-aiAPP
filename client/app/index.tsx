import React from 'react';
import { useEffect } from 'react';
import { router } from 'expo-router';

export default function HomeScreen() {
  useEffect(() => {
    // Check if user is authenticated (simplified for demo)
    const isAuthenticated = false; // In real app, check auth state
    
    if (isAuthenticated) {
      router.replace('/dashboard');
    } else {
      router.replace('/onboarding');
    }
  }, []);

  // Return null or loading screen while redirecting
  return null;
}