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

const { width } = Dimensions.get('window');

const slides = [
  {
    id: 1,
    icon: 'hand-right-outline',
    iconColor: '#4F46E5',
    backgroundColor: 'rgba(79, 70, 229, 0.1)',
    accentColor: '#6366F1',
    title: 'Welcome to FaceAssist',
    description: 'Your journey to better face recognition starts here. We understand the challenges of prosopagnosia and are here to help.',
    points: [
      'Designed specifically for face blindness',
      'Evidence-based memory techniques',
      'Supportive and judgment-free environment',
      'Personalized learning experience'
    ]
  },
  {
    id: 2,
    icon: 'scan-circle-outline',
    iconColor: '#059669',
    backgroundColor: 'rgba(16, 185, 129, 0.1)',
    accentColor: '#10B981',
    title: 'Scan & Identify',
    description: 'Our smart recognition system helps you capture and analyze faces with detailed descriptions.',
    points: [
      'High-contrast photo capture interface',
      'Detailed facial feature descriptions',
      'Custom memory aids and mnemonics',
      'Voice-guided instructions available'
    ]
  },
  {
    id: 3,
    icon: 'school-outline',
    iconColor: '#DC2626',
    backgroundColor: 'rgba(220, 38, 38, 0.1)',
    accentColor: '#EF4444',
    title: 'Learn & Practice',
    description: 'Improve your face recognition skills through structured exercises and progress tracking.',
    points: [
      'Adaptive learning algorithms',
      'Progress tracking and insights',
      'Spaced repetition techniques',
      'Confidence building exercises'
    ]
  },
  {
    id: 4,
    icon: 'shield-checkmark-outline',
    iconColor: '#7C3AED',
    backgroundColor: 'rgba(124, 58, 237, 0.1)',
    accentColor: '#8B5CF6',
    title: 'Private & Secure',
    description: 'Your privacy is our priority. All data is encrypted and stored securely on your device.',
    points: [
      'End-to-end encryption',
      'Local data storage options',
      'No sharing without permission',
      'GDPR and accessibility compliant'
    ]
  }
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

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: slide.backgroundColor }]}>
      {/* Animated Background Elements */}
      <View style={styles.backgroundElements}>
        <View style={[styles.floatingShape, styles.shape1, { backgroundColor: slide.accentColor }]} />
        <View style={[styles.floatingShape, styles.shape2, { backgroundColor: slide.iconColor }]} />
        <View style={[styles.floatingShape, styles.shape3, { backgroundColor: slide.accentColor }]} />
      </View>

      <View style={styles.header}>
        <TouchableOpacity 
          onPress={skipToAuth}
          style={styles.skipButton}
          accessibilityLabel="Skip introduction"
        >
          <Text style={[styles.skipText, { color: slide.iconColor }]}>Skip</Text>
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.slideContainer}>
          <View style={[styles.iconContainer, { backgroundColor: slide.backgroundColor }]}>
            <View style={styles.iconGlow}>
              <Ionicons name={slide.icon as any} size={64} color={slide.iconColor} />
            </View>
            <View style={[styles.iconShadow, { backgroundColor: slide.iconColor }]} />
          </View>

          <Text style={[styles.slideTitle, { color: slide.iconColor }]}>{slide.title}</Text>
          <Text style={styles.slideDescription}>{slide.description}</Text>

          <View style={styles.pointsContainer}>
            {slide.points.map((point, index) => (
              <View key={index} style={styles.pointItem}>
                <View style={[styles.pointDot, { backgroundColor: slide.iconColor }]} />
                <Text style={styles.pointText}>{point}</Text>
              </View>
            ))}
          </View>
        </View>
      </ScrollView>

      <View style={styles.footer}>
        <View style={styles.pagination}>
          {slides.map((_, index) => (
            <View
              key={index}
              style={[
                styles.paginationDot,
                index === currentSlide && [styles.paginationDotActive, { backgroundColor: slide.iconColor }]
              ]}
            />
          ))}
        </View>

        <View style={styles.navigationButtons}>
          <TouchableOpacity
            onPress={prevSlide}
            style={[styles.navButton, styles.backButton]}
            disabled={currentSlide === 0}
            accessibilityLabel="Go to previous slide"
          >
            <Ionicons 
              name="chevron-back" 
              size={24} 
              color={currentSlide === 0 ? '#CBD5E1' : slide.iconColor} 
            />
          </TouchableOpacity>

          <TouchableOpacity
            onPress={nextSlide}
            style={[styles.navButton, styles.nextButton, { backgroundColor: slide.iconColor }]}
            accessibilityLabel={currentSlide === slides.length - 1 ? "Continue to sign in" : "Go to next slide"}
          >
            {currentSlide === slides.length - 1 ? (
              <>
                <Text style={styles.nextButtonText}>Continue</Text>
                <Ionicons name="arrow-forward" size={20} color="#FFFFFF" />
              </>
            ) : (
              <Ionicons name="chevron-forward" size={24} color="#FFFFFF" />
            )}
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  backgroundElements: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  floatingShape: {
    position: 'absolute',
    borderRadius: 20,
    opacity: 0.1,
  },
  shape1: {
    width: 80,
    height: 80,
    top: 120,
    right: 30,
    transform: [{ rotate: '45deg' }],
  },
  shape2: {
    width: 60,
    height: 60,
    bottom: 300,
    left: 20,
    borderRadius: 30,
  },
  shape3: {
    width: 100,
    height: 40,
    bottom: 150,
    right: 50,
    borderRadius: 20,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    paddingHorizontal: 24,
    paddingTop: 16,
  },
  skipButton: {
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
  },
  skipText: {
    fontSize: 16,
    fontWeight: '600',
  },
  content: {
    flexGrow: 1,
    paddingHorizontal: 24,
    justifyContent: 'center',
  },
  slideContainer: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  iconContainer: {
    width: 140,
    height: 140,
    borderRadius: 70,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 32,
    position: 'relative',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15,
    shadowRadius: 16,
    elevation: 8,
  },
  iconGlow: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 2,
  },
  iconShadow: {
    position: 'absolute',
    width: 130,
    height: 130,
    borderRadius: 65,
    opacity: 0.2,
    top: 5,
    left: 5,
    zIndex: 1,
  },
  slideTitle: {
    fontSize: 32,
    fontWeight: '900',
    textAlign: 'center',
    marginBottom: 16,
    textShadowColor: 'rgba(0, 0, 0, 0.1)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
  },
  slideDescription: {
    fontSize: 18,
    color: '#1E293B',
    textAlign: 'center',
    lineHeight: 26,
    marginBottom: 32,
    paddingHorizontal: 20,
    fontWeight: '500',
  },
  pointsContainer: {
    width: '100%',
    maxWidth: 320,
  },
  pointItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    padding: 16,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  pointDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    marginTop: 8,
    marginRight: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 2,
  },
  pointText: {
    flex: 1,
    fontSize: 16,
    color: '#1E293B',
    lineHeight: 24,
    fontWeight: '500',
  },
  footer: {
    paddingHorizontal: 24,
    paddingBottom: 32,
  },
  pagination: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: 24,
  },
  paginationDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: 'rgba(30, 41, 59, 0.3)',
    marginHorizontal: 6,
  },
  paginationDotActive: {
    width: 30,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 2,
  },
  navigationButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  navButton: {
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  backButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
  },
  nextButton: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    width: 'auto',
    minWidth: 56,
    shadowOpacity: 0.3,
  },
  nextButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
    marginRight: 8,
  },
});