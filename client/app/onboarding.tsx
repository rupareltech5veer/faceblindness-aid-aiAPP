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
        {/* Animated Background Elements */}
        <View style={styles.backgroundElements}>
          <View style={[styles.floatingCircle, styles.circle1]} />
          <View style={[styles.floatingCircle, styles.circle2]} />
          <View style={[styles.floatingCircle, styles.circle3]} />
          <View style={[styles.floatingCircle, styles.circle4]} />
        </View>

        {/* Hero Section */}
        <View style={styles.heroSection}>
          <View style={styles.iconContainer}>
            <View style={styles.mainIcon}>
              <Ionicons name="eye-outline" size={48} color="#ffffff" />
            </View>
            <View style={styles.accentDot1} />
            <View style={styles.accentDot2} />
            <View style={styles.accentDot3} />
            <View style={styles.glowEffect} />
          </View>
          
          <Text style={styles.title}>FaceAssist</Text>
          <Text style={styles.subtitle}>
            Your personal companion for recognizing and remembering faces
          </Text>
        </View>

        {/* Features Section */}
        <View style={styles.featuresSection}>
          <View style={[styles.featureCard, styles.featureCard1]}>
            <View style={[styles.featureIcon, styles.featureIcon1]}>
              <Ionicons name="scan-outline" size={32} color="#4F46E5" />
            </View>
            <Text style={styles.featureTitle}>Smart Recognition</Text>
            <Text style={styles.featureDescription}>
              Capture photos and get detailed facial descriptions to help you remember
            </Text>
          </View>

          <View style={[styles.featureCard, styles.featureCard2]}>
            <View style={[styles.featureIcon, styles.featureIcon2]}>
              <Ionicons name="library-outline" size={32} color="#059669" />
            </View>
            <Text style={styles.featureTitle}>Personal Directory</Text>
            <Text style={styles.featureDescription}>
              Build your own collection of faces with custom memory aids
            </Text>
          </View>

          <View style={[styles.featureCard, styles.featureCard3]}>
            <View style={[styles.featureIcon, styles.featureIcon3]}>
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
    backgroundColor: '#0F172A',
  },
  content: {
    flexGrow: 1,
    paddingHorizontal: 24,
  },
  backgroundElements: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  floatingCircle: {
    position: 'absolute',
    borderRadius: 50,
    opacity: 0.1,
  },
  circle1: {
    width: 100,
    height: 100,
    backgroundColor: '#4F46E5',
    top: 100,
    right: 20,
  },
  circle2: {
    width: 60,
    height: 60,
    backgroundColor: '#10B981',
    top: 300,
    left: 30,
  },
  circle3: {
    width: 80,
    height: 80,
    backgroundColor: '#F59E0B',
    bottom: 200,
    right: 40,
  },
  circle4: {
    width: 40,
    height: 40,
    backgroundColor: '#EF4444',
    bottom: 400,
    left: 50,
  },
  heroSection: {
    alignItems: 'center',
    paddingTop: 80,
    paddingBottom: 60,
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
    shadowOpacity: 0.4,
    shadowRadius: 20,
    elevation: 12,
  },
  glowEffect: {
    position: 'absolute',
    width: 140,
    height: 140,
    borderRadius: 70,
    backgroundColor: '#4F46E5',
    opacity: 0.2,
    top: -10,
    left: -10,
  },
  accentDot1: {
    position: 'absolute',
    top: 10,
    right: 10,
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#10B981',
    shadowColor: '#10B981',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  accentDot2: {
    position: 'absolute',
    bottom: 20,
    left: -10,
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: '#F59E0B',
    shadowColor: '#F59E0B',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  accentDot3: {
    position: 'absolute',
    top: 40,
    left: -20,
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: '#EF4444',
    shadowColor: '#EF4444',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  title: {
    fontSize: 42,
    fontWeight: '900',
    color: '#FFFFFF',
    marginBottom: 16,
    textAlign: 'center',
    textShadowColor: 'rgba(79, 70, 229, 0.3)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 8,
  },
  subtitle: {
    fontSize: 18,
    color: '#CBD5E1',
    textAlign: 'center',
    lineHeight: 26,
    paddingHorizontal: 20,
  },
  featuresSection: {
    paddingVertical: 20,
  },
  featureCard: {
    borderRadius: 20,
    padding: 28,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15,
    shadowRadius: 16,
    elevation: 8,
    borderWidth: 1,
  },
  featureCard1: {
    backgroundColor: 'rgba(79, 70, 229, 0.1)',
    borderColor: 'rgba(79, 70, 229, 0.2)',
  },
  featureCard2: {
    backgroundColor: 'rgba(16, 185, 129, 0.1)',
    borderColor: 'rgba(16, 185, 129, 0.2)',
  },
  featureCard3: {
    backgroundColor: 'rgba(220, 38, 38, 0.1)',
    borderColor: 'rgba(220, 38, 38, 0.2)',
  },
  featureIcon: {
    width: 72,
    height: 72,
    borderRadius: 36,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  featureIcon1: {
    backgroundColor: 'rgba(79, 70, 229, 0.15)',
    shadowColor: '#4F46E5',
  },
  featureIcon2: {
    backgroundColor: 'rgba(16, 185, 129, 0.15)',
    shadowColor: '#10B981',
  },
  featureIcon3: {
    backgroundColor: 'rgba(220, 38, 38, 0.15)',
    shadowColor: '#DC2626',
  },
  featureTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: '#FFFFFF',
    marginBottom: 12,
  },
  featureDescription: {
    fontSize: 16,
    color: '#94A3B8',
    lineHeight: 24,
  },
  ctaSection: {
    alignItems: 'center',
    paddingTop: 40,
    paddingBottom: 60,
  },
  primaryButton: {
    backgroundColor: '#4F46E5',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 20,
    paddingHorizontal: 40,
    borderRadius: 16,
    shadowColor: '#4F46E5',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.4,
    shadowRadius: 16,
    elevation: 8,
    marginBottom: 20,
    minWidth: 220,
  },
  primaryButtonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '700',
    marginRight: 8,
  },
  supportText: {
    fontSize: 14,
    color: '#64748B',
    textAlign: 'center',
    fontStyle: 'italic',
  },
}); df