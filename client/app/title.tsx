import React, { useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  Image,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { supabase } from '../lib/supabase';

export default function TitleScreen() {
  useEffect(() => {
    // Auto-dismiss after 3 seconds
    const timer = setTimeout(() => {
      // Check authentication status
      checkAuthAndNavigate();
    }, 3000);

    return () => clearTimeout(timer);
  }, []);

  const checkAuthAndNavigate = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (session) {
        // User is authenticated - go to main app
        router.replace('/(tabs)/home');
      } else {
        // User not authenticated - go to sign in
        router.replace('/auth/signin');
      }
    } catch (error) {
      // Default to sign in on error
      router.replace('/auth/signin');
    }
  };

  return (
    <LinearGradient
      colors={['#6366F1', '#8B5CF6', '#D946EF']}
      style={styles.container}
    >
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.content}>
          {/* Floating Background Icons */}
          <View style={styles.floatingIconsContainer}>
            <View style={[styles.floatingIcon, styles.floatingIcon1]}>
              <Ionicons name="heart-outline" size={20} color="rgba(255,255,255,0.3)" />
            </View>
            <View style={[styles.floatingIcon, styles.floatingIcon2]}>
              <Ionicons name="people-outline" size={20} color="rgba(255,255,255,0.3)" />
            </View>
            <View style={[styles.floatingIcon, styles.floatingIcon3]}>
              <Ionicons name="camera-outline" size={18} color="rgba(255,255,255,0.3)" />
            </View>
            <View style={[styles.floatingIcon, styles.floatingIcon4]}>
              <Ionicons name="sparkles-outline" size={18} color="rgba(255,255,255,0.3)" />
            </View>
          </View>

          {/* Main Content */}
          <View style={styles.mainContent}>
            {/* Central Logo */}
            <View style={styles.logoContainer}>
              <Image 
                source={require('../assets/dolphin-logo-nobg.png')}
                style={styles.logo}
                resizeMode="contain"
              />
            </View>

            {/* App Name and Slogan */}
            <Text style={styles.appName}>Memora</Text>
            <Text style={styles.slogan}>Faces that matter, memories that stay.</Text>
          </View>
        </View>
      </SafeAreaView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  safeArea: {
    flex: 1,
  },
  content: {
    flex: 1,
    position: 'relative',
  },
  floatingIconsContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  floatingIcon: {
    position: 'absolute',
    width: 50,
    height: 50,
    borderRadius: 12,
    backgroundColor: 'rgba(255,255,255,0.1)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  floatingIcon1: {
    top: 120,
    left: 40,
  },
  floatingIcon2: {
    top: 200,
    right: 50,
  },
  floatingIcon3: {
    bottom: 250,
    left: 60,
  },
  floatingIcon4: {
    bottom: 180,
    right: 40,
  },
  mainContent: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 40,
  },
  logoContainer: {
    marginBottom: 40,
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
  },
  logo: {
    width: 200,
    height: 200,
  },
  appName: {
    fontSize: 48,
    fontWeight: '800',
    color: '#FFFFFF',
    marginBottom: 12,
    textAlign: 'center',
    letterSpacing: -1,
  },
  slogan: {
    fontSize: 18,
    fontWeight: '500',
    color: 'rgba(255,255,255,0.9)',
    textAlign: 'center',
    lineHeight: 26,
    paddingHorizontal: 20,
  },
});