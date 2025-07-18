import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  Dimensions,
  Image,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { StorageService } from '../lib/storage';

const { width, height } = Dimensions.get('window');

export default function OnboardingScreen() {
  const handleGetStarted = async () => {
    await StorageService.setFirstLaunchComplete();
    router.replace('/setup');
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
              <Ionicons name="heart-outline" size={24} color="rgba(255,255,255,0.3)" />
            </View>
            <View style={[styles.floatingIcon, styles.floatingIcon2]}>
              <Ionicons name="eye-outline" size={24} color="rgba(255,255,255,0.3)" />
            </View>
            <View style={[styles.floatingIcon, styles.floatingIcon3]}>
              <Ionicons name="people-outline" size={20} color="rgba(255,255,255,0.3)" />
            </View>
            <View style={[styles.floatingIcon, styles.floatingIcon4]}>
              <Ionicons name="sparkles-outline" size={20} color="rgba(255,255,255,0.3)" />
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

            {/* Get Started Button */}
            <TouchableOpacity 
              style={styles.getStartedButton}
              onPress={handleGetStarted}
              accessibilityLabel="Get started with Memora"
            >
              <Text style={styles.getStartedText}>Get Started</Text>
              <Ionicons name="chevron-forward" size={24} color="#FFFFFF" />
            </TouchableOpacity>
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
    width: 60,
    height: 60,
    borderRadius: 16,
    backgroundColor: 'rgba(255,255,255,0.1)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  floatingIcon1: {
    top: 100,
    left: 30,
  },
  floatingIcon2: {
    top: 200,
    right: 40,
  },
  floatingIcon3: {
    top: 300,
    left: 50,
  },
  floatingIcon4: {
    bottom: 200,
    right: 30,
  },
  mainContent: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 40,
  },
  logoContainer: {
    marginBottom: 60,
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
  },
  logo: {
    width: 220,
    height: 220,
  },
  appName: {
    fontSize: 56,
    fontWeight: '800',
    color: '#FFFFFF',
    marginBottom: 16,
    textAlign: 'center',
    letterSpacing: -2,
  },
  slogan: {
    fontSize: 20,
    fontWeight: '500',
    color: 'rgba(255,255,255,0.9)',
    textAlign: 'center',
    lineHeight: 28,
    marginBottom: 80,
    paddingHorizontal: 20,
  },
  getStartedButton: {
    backgroundColor: 'rgba(255,255,255,0.2)',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 20,
    paddingHorizontal: 40,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.3)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.2,
    shadowRadius: 16,
    elevation: 8,
  },
  getStartedText: {
    color: '#FFFFFF',
    fontSize: 20,
    fontWeight: '600',
    marginRight: 12,
  },
});