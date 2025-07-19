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
import { LinearGradient } from 'expo-linear-gradient';
import { StorageService } from '../lib/storage';

const { width, height } = Dimensions.get('window');

const setupSlides = [
  {
    id: 1,
    icon: 'heart-outline',
    iconColor: '#6366F1',
    backgroundColor: ['#6366F1', '#8B5CF6'] as const,
    title: 'Welcome to Memora',
    subtitle: 'Personal memory companion',
    description: 'Memora helps you remember the faces and moments that matter most. Build stronger connections together.',
  },
  {
    id: 2,
    icon: 'camera-outline',
    iconColor: '#10B981',
    backgroundColor: ['#10B981', '#059669'] as const,
    title: 'Capture & Learn',
    subtitle: 'Smart face recognition',
    description: 'Use your camera to capture faces and let Memora help you create memorable associations and learning cues.',
  },
  {
    id: 3,
    icon: 'people-outline',
    iconColor: '#F97316',
    backgroundColor: ['#F97316', '#DC2626'] as const,
    title: 'Build Connections',
    subtitle: 'Organize your relationships',
    description: 'Create a personal directory of important people in your life with photos, notes, and memorable details.',
  },
  {
    id: 4,
    icon: 'shield-checkmark-outline',
    iconColor: '#8B5CF6',
    backgroundColor: ['#8B5CF6', '#7C3AED'] as const,
    title: 'Privacy First',
    subtitle: 'Your data stays secure',
    description: 'All your personal data is encrypted and stored securely. You have complete control over your information.',
  },
];

export default function SetupScreen() {
  const [currentSlide, setCurrentSlide] = useState(0);

  const nextSlide = () => {
    if (currentSlide < setupSlides.length - 1) {
      setCurrentSlide(currentSlide + 1);
    } else {
      handleComplete();
    }
  };

  const prevSlide = () => {
    if (currentSlide > 0) {
      setCurrentSlide(currentSlide - 1);
    }
  };

  const handleComplete = async () => {
    await StorageService.setOnboardingCompleted();
    router.replace('/auth/signup');
  };

  const handleSkip = async () => {
    await StorageService.setOnboardingCompleted();
    router.replace('/auth/signup');
  };

  const slide = setupSlides[currentSlide];
  const isLastSlide = currentSlide === setupSlides.length - 1;

  return (
    <LinearGradient
      colors={slide.backgroundColor}
      style={styles.container}
    >
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.content}>
          {/* Skip Button */}
          <View style={styles.topBar}>
            <TouchableOpacity
              onPress={handleSkip}
              style={styles.skipButton}
              accessibilityLabel="Skip setup"
            >
              <Text style={styles.skipText}>Skip</Text>
            </TouchableOpacity>
          </View>

          {/* Main Card */}
          <View style={styles.card}>
            {/* Pagination Dots */}
            <View style={styles.pagination}>
              {setupSlides.map((_, index) => (
                <View
                  key={index}
                  style={[
                    styles.paginationDot,
                    index === currentSlide && [
                      styles.paginationDotActive,
                      { backgroundColor: slide.iconColor }
                    ]
                  ]}
                />
              ))}
            </View>

            {/* Icon */}
            <View style={[styles.iconContainer, { backgroundColor: slide.iconColor }]}>
              <Ionicons name={slide.icon as any} size={48} color="#FFFFFF" />
            </View>

            {/* Content */}
            <Text style={styles.title}>{slide.title}</Text>
            <Text style={[styles.subtitle, { color: slide.iconColor }]}>
              {slide.subtitle}
            </Text>
            <Text style={styles.description}>{slide.description}</Text>

            {/* Navigation Buttons */}
            <View style={styles.navigationContainer}>
              <TouchableOpacity
                onPress={prevSlide}
                style={[styles.backButton, currentSlide === 0 && styles.backButtonDisabled]}
                disabled={currentSlide === 0}
                accessibilityLabel="Go back"
              >
                <Ionicons 
                  name="chevron-back" 
                  size={20} 
                  color={currentSlide === 0 ? '#CBD5E1' : '#64748B'} 
                />
                <Text style={[
                  styles.backButtonText,
                  currentSlide === 0 && styles.backButtonTextDisabled
                ]}>
                  Back
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={nextSlide}
                style={[styles.nextButton, { backgroundColor: slide.iconColor }]}
                accessibilityLabel={isLastSlide ? "Get started" : "Next slide"}
              >
                <Text style={styles.nextButtonText}>
                  {isLastSlide ? 'Get Started' : 'Next'}
                </Text>
                <Ionicons name="chevron-forward" size={20} color="#FFFFFF" />
              </TouchableOpacity>
            </View>
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
    paddingHorizontal: 24,
  },
  topBar: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    paddingTop: 20,
    paddingBottom: 20,
  },
  skipButton: {
    paddingVertical: 8,
    paddingHorizontal: 16,
  },
  skipText: {
    color: 'rgba(255,255,255,0.8)',
    fontSize: 16,
    fontWeight: '500',
  },
  card: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    padding: 32,
    marginBottom: 40,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 20 },
    shadowOpacity: 0.25,
    shadowRadius: 25,
    elevation: 20,
  },
  pagination: {
    flexDirection: 'row',
    marginBottom: 40,
    gap: 8,
  },
  paginationDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#E2E8F0',
  },
  paginationDotActive: {
    width: 24,
  },
  iconContainer: {
    width: 80,
    height: 80,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 32,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 4,
  },
  title: {
    fontSize: 28,
    fontWeight: '800',
    color: '#1E293B',
    textAlign: 'center',
    marginBottom: 12,
  },
  subtitle: {
    fontSize: 18,
    fontWeight: '600',
    textAlign: 'center',
    marginBottom: 24,
  },
  description: {
    fontSize: 16,
    color: '#64748B',
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 48,
    paddingHorizontal: 20,
  },
  navigationContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    width: '100%',
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
  },
  backButtonDisabled: {
    opacity: 0.5,
  },
  backButtonText: {
    fontSize: 16,
    color: '#64748B',
    marginLeft: 4,
    fontWeight: '500',
  },
  backButtonTextDisabled: {
    color: '#CBD5E1',
  },
  nextButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  nextButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
    marginRight: 8,
  },
});