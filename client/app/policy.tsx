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

const { width, height } = Dimensions.get('window');

const slides = [
  {
    id: 1,
    icon: 'eye-outline',
    iconColor: '#6366F1',
    backgroundColor: ['#6366F1', '#8B5CF6'],
    title: 'Welcome to FaceAssist',
    subtitle: 'Your personal face recognition companion',
    description: 'Designed specifically for people with face blindness (prosopagnosia), FaceAssist helps you recognize and remember the people in your life.',
  },
  {
    id: 2,
    icon: 'people-outline',
    iconColor: '#10B981',
    backgroundColor: ['#10B981', '#059669'],
    title: 'Scan & Identify',
    subtitle: 'Recognize faces instantly',
    description: 'Use your camera to scan faces and get instant identification with confidence scores and helpful context about each person.',
  },
  {
    id: 3,
    icon: 'shield-checkmark-outline',
    iconColor: '#F97316',
    backgroundColor: ['#F97316', '#DC2626'],
    title: 'Private & Secure',
    subtitle: 'Your data stays safe',
    description: 'All face data is processed locally on your device. Your privacy and security are our top priorities.',
  },
];

export default function PolicyScreen() {
  const [currentSlide, setCurrentSlide] = useState(0);

  const nextSlide = () => {
    if (currentSlide < slides.length - 1) {
      setCurrentSlide(currentSlide + 1);
    } else {
      router.push('/auth/signin');
    }
  };

  const prevSlide = () => {
    if (currentSlide > 0) {
      setCurrentSlide(currentSlide - 1);
    }
  };

  const skipToAuth = () => {
    router.push('/auth/signin');
  };

  const slide = slides[currentSlide];
  const isLastSlide = currentSlide === slides.length - 1;

  return (
    <LinearGradient
      colors={slide.backgroundColor}
      style={styles.container}
    >
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.content}>
          {/* Main Card */}
          <View style={styles.card}>
            {/* Pagination Dots */}
            <View style={styles.pagination}>
              {slides.map((_, index) => (
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

            {/* Skip Button */}
            <TouchableOpacity
              onPress={skipToAuth}
              style={styles.skipButton}
              accessibilityLabel="Skip introduction"
            >
              <Text style={styles.skipText}>Skip introduction</Text>
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
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    padding: 32,
    width: '100%',
    maxWidth: 400,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 20 },
    shadowOpacity: 0.25,
    shadowRadius: 25,
    elevation: 20,
  },
  pagination: {
    flexDirection: 'row',
    marginBottom: 32,
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
    marginBottom: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 4,
  },
  title: {
    fontSize: 24,
    fontWeight: '800',
    color: '#1E293B',
    textAlign: 'center',
    marginBottom: 12,
  },
  subtitle: {
    fontSize: 18,
    fontWeight: '600',
    textAlign: 'center',
    marginBottom: 20,
  },
  description: {
    fontSize: 16,
    color: '#64748B',
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 40,
  },
  navigationContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    width: '100%',
    marginBottom: 24,
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
  skipButton: {
    paddingVertical: 8,
    paddingHorizontal: 16,
  },
  skipText: {
    fontSize: 16,
    color: '#94A3B8',
    fontWeight: '500',
  },
});