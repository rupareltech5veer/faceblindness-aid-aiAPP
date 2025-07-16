import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  Dimensions,
  ScrollView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';

const { width, height } = Dimensions.get('window');

export default function OnboardingScreen() {
  return (
    <LinearGradient
      colors={['#6366F1', '#8B5CF6', '#D946EF']}
      style={styles.container}
    >
      <SafeAreaView style={styles.safeArea}>
        <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
          {/* Floating Background Icons */}
          <View style={styles.floatingIconsContainer}>
            <View style={[styles.floatingIcon, styles.floatingIcon1]}>
              <Ionicons name="heart-outline" size={24} color="rgba(255,255,255,0.3)" />
            </View>
            <View style={[styles.floatingIcon, styles.floatingIcon2]}>
              <Ionicons name="eye-outline" size={24} color="rgba(255,255,255,0.3)" />
            </View>
            <View style={[styles.floatingIcon, styles.floatingIcon3]}>
              <Ionicons name="bulb-outline" size={20} color="rgba(255,255,255,0.3)" />
            </View>
            <View style={[styles.floatingIcon, styles.floatingIcon4]}>
              <Ionicons name="sparkles-outline" size={20} color="rgba(255,255,255,0.3)" />
            </View>
          </View>

          {/* Main Content */}
          <View style={styles.mainContent}>
            {/* Central Icon */}
            <View style={styles.centralIconContainer}>
              <View style={styles.centralIcon}>
                <Ionicons name="eye-outline" size={48} color="#FFFFFF" />
              </View>
            </View>

            {/* Title and Subtitle */}
            <Text style={styles.title}>FaceAssist</Text>
            <Text style={styles.subtitle}>Remember Every Face</Text>
            <Text style={styles.description}>
              Your intelligent companion for meaningful connections
            </Text>

            {/* Feature Icons */}
            <View style={styles.featuresContainer}>
              <View style={styles.featureItem}>
                <View style={styles.featureIcon}>
                  <Ionicons name="bulb-outline" size={28} color="#FFFFFF" />
                </View>
                <Text style={styles.featureLabel}>Smart Recognition</Text>
              </View>

              <View style={styles.featureItem}>
                <View style={styles.featureIcon}>
                  <Ionicons name="heart-outline" size={28} color="#FFFFFF" />
                </View>
                <Text style={styles.featureLabel}>Personal Growth</Text>
              </View>

              <View style={styles.featureItem}>
                <View style={styles.featureIcon}>
                  <Ionicons name="sparkles-outline" size={28} color="#FFFFFF" />
                </View>
                <Text style={styles.featureLabel}>Confidence Builder</Text>
              </View>
            </View>

            {/* Action Buttons */}
            <View style={styles.actionContainer}>
              <TouchableOpacity 
                style={styles.primaryButton}
                onPress={() => router.replace('/policy')}
                accessibilityLabel="Begin your journey with FaceAssist"
              >
                <Text style={styles.primaryButtonText}>Begin Your Journey</Text>
                <Ionicons name="chevron-forward" size={20} color="#FFFFFF" />
              </TouchableOpacity>

              <TouchableOpacity 
                style={styles.skipButton}
                onPress={() => router.replace('/auth/signin')}
                accessibilityLabel="Skip introduction"
              >
                <Text style={styles.skipButtonText}>Skip introduction</Text>
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>
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
    flexGrow: 1,
    paddingHorizontal: 24,
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
    backdropFilter: 'blur(10px)',
  },
  floatingIcon1: {
    top: 80,
    left: 30,
  },
  floatingIcon2: {
    top: 180,
    left: 30,
  },
  floatingIcon3: {
    top: 160,
    right: 30,
  },
  floatingIcon4: {
    bottom: 120,
    right: 30,
  },
  mainContent: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 60,
    paddingBottom: 40,
  },
  centralIconContainer: {
    marginBottom: 40,
  },
  centralIcon: {
    width: 120,
    height: 120,
    borderRadius: 24,
    backgroundColor: 'rgba(255,255,255,0.15)',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 8,
  },
  title: {
    fontSize: 48,
    fontWeight: '800',
    color: '#FFFFFF',
    marginBottom: 12,
    textAlign: 'center',
    letterSpacing: -1,
  },
  subtitle: {
    fontSize: 24,
    fontWeight: '600',
    color: 'rgba(255,255,255,0.9)',
    marginBottom: 16,
    textAlign: 'center',
  },
  description: {
    fontSize: 18,
    color: 'rgba(255,255,255,0.8)',
    textAlign: 'center',
    lineHeight: 26,
    marginBottom: 60,
    paddingHorizontal: 20,
  },
  featuresContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '100%',
    marginBottom: 80,
    paddingHorizontal: 20,
  },
  featureItem: {
    alignItems: 'center',
    flex: 1,
  },
  featureIcon: {
    width: 64,
    height: 64,
    borderRadius: 16,
    backgroundColor: 'rgba(255,255,255,0.15)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  featureLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: 'rgba(255,255,255,0.9)',
    textAlign: 'center',
    lineHeight: 18,
  },
  actionContainer: {
    width: '100%',
    alignItems: 'center',
  },
  primaryButton: {
    backgroundColor: 'rgba(255,255,255,0.2)',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 18,
    paddingHorizontal: 32,
    borderRadius: 16,
    marginBottom: 24,
    minWidth: 280,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.3)',
  },
  primaryButtonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '600',
    marginRight: 8,
  },
  skipButton: {
    paddingVertical: 12,
    paddingHorizontal: 24,
  },
  skipButtonText: {
    color: 'rgba(255,255,255,0.7)',
    fontSize: 16,
    fontWeight: '500',
  },
});