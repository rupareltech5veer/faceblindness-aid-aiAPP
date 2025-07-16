import React, { useState } from 'react';
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

const { width, height } = Dimensions.get('window');

export default function OnboardingScreen() {
  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {/* Hero Section */}
        <View style={styles.heroSection}>
          <View style={styles.iconContainer}>
            <View style={styles.mainIcon}>
              <Ionicons name="eye-outline" size={48} color="#ffffff" />
            </View>
            <View style={styles.accentDot1} />
            <View style={styles.accentDot2} />
            <View style={styles.accentDot3} />
          </View>
          
          <Text style={styles.title}>FaceAssist</Text>
          <Text style={styles.subtitle}>
            Your personal companion for recognizing and remembering faces
          </Text>
        </View>

        {/* Features Section */}
        <View style={styles.featuresSection}>
          <View style={styles.featureCard}>
            <View style={styles.featureIcon}>
              <Ionicons name="scan-outline" size={32} color="#4F46E5" />
            </View>
            <Text style={styles.featureTitle}>Smart Recognition</Text>
            <Text style={styles.featureDescription}>
              Capture photos and get detailed facial descriptions to help you remember
            </Text>
          </View>

          <View style={styles.featureCard}>
            <View style={styles.featureIcon}>
              <Ionicons name="library-outline" size={32} color="#059669" />
            </View>
            <Text style={styles.featureTitle}>Personal Directory</Text>
            <Text style={styles.featureDescription}>
              Build your own collection of faces with custom memory aids
            </Text>
          </View>

          <View style={styles.featureCard}>
            <View style={styles.featureIcon}>
              <Ionicons name="school-outline" size={32} color="#DC2626" />
            </View>
            <Text style={styles.featureTitle}>Practice & Learn</Text>
            <Text style={styles.featureDescription}>
              Improve your face recognition skills with guided exercises
            </Text>
          </View>
        </View>

        {/* CTA Section */}
        <View style={styles.ctaSection}>
          <TouchableOpacity 
            style={styles.primaryButton}
            onPress={() => router.push('/policy')}
            accessibilityLabel="Get started with FaceAssist"
            accessibilityHint="Navigate to the welcome and policy information"
          >
            <Text style={styles.primaryButtonText}>Get Started</Text>
            <Ionicons name="arrow-forward" size={20} color="#ffffff" />
          </TouchableOpacity>
          
          <Text style={styles.supportText}>
            Designed specifically for individuals with face blindness
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  content: {
    flexGrow: 1,
    paddingHorizontal: 24,
  },
  heroSection: {
    alignItems: 'center',
    paddingTop: 60,
    paddingBottom: 40,
  },
  iconContainer: {
    position: 'relative',
    marginBottom: 32,
  },
  mainIcon: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: '#4F46E5',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#4F46E5',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 8,
  },
  accentDot1: {
    position: 'absolute',
    top: 10,
    right: 10,
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: '#10B981',
  },
  accentDot2: {
    position: 'absolute',
    bottom: 20,
    left: -10,
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: '#F59E0B',
  },
  accentDot3: {
    position: 'absolute',
    top: 40,
    left: -20,
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#EF4444',
  },
  title: {
    fontSize: 36,
    fontWeight: '800',
    color: '#1E293B',
    marginBottom: 12,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 18,
    color: '#64748B',
    textAlign: 'center',
    lineHeight: 26,
    paddingHorizontal: 20,
  },
  featuresSection: {
    paddingVertical: 20,
  },
  featureCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 24,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  featureIcon: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#F1F5F9',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  featureTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1E293B',
    marginBottom: 8,
  },
  featureDescription: {
    fontSize: 16,
    color: '#64748B',
    lineHeight: 24,
  },
  ctaSection: {
    alignItems: 'center',
    paddingTop: 20,
    paddingBottom: 40,
  },
  primaryButton: {
    backgroundColor: '#4F46E5',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 18,
    paddingHorizontal: 32,
    borderRadius: 12,
    shadowColor: '#4F46E5',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
    marginBottom: 16,
    minWidth: 200,
  },
  primaryButtonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '600',
    marginRight: 8,
  },
  supportText: {
    fontSize: 14,
    color: '#64748B',
    textAlign: 'center',
    fontStyle: 'italic',
  },
});