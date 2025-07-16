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
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity 
          onPress={skipToAuth}
          style={styles.skipButton}
          accessibilityLabel="Skip introduction"
        >
          <Text style={styles.skipText}>Skip</Text>
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.slideContainer}>
          <View style={[styles.iconContainer, { backgroundColor: `${slide.iconColor}15` }]}>
            <Ionicons name={slide.icon as any} size={64} color={slide.iconColor} />
          </View>

          <Text style={styles.slideTitle}>{slide.title}</Text>
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
                index === currentSlide && styles.paginationDotActive
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
              color={currentSlide === 0 ? '#CBD5E1' : '#64748B'} 
            />
          </TouchableOpacity>

          <TouchableOpacity
            onPress={nextSlide}
            style={[styles.navButton, styles.nextButton]}
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
    backgroundColor: '#F8FAFC',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    paddingHorizontal: 24,
    paddingTop: 16,
  },
  skipButton: {
    paddingVertical: 8,
    paddingHorizontal: 16,
  },
  skipText: {
    fontSize: 16,
    color: '#64748B',
    fontWeight: '500',
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
    width: 120,
    height: 120,
    borderRadius: 60,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 32,
  },
  slideTitle: {
    fontSize: 28,
    fontWeight: '800',
    color: '#1E293B',
    textAlign: 'center',
    marginBottom: 16,
  },
  slideDescription: {
    fontSize: 18,
    color: '#64748B',
    textAlign: 'center',
    lineHeight: 26,
    marginBottom: 32,
    paddingHorizontal: 20,
  },
  pointsContainer: {
    width: '100%',
    maxWidth: 320,
  },
  pointItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  pointDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginTop: 8,
    marginRight: 16,
  },
  pointText: {
    flex: 1,
    fontSize: 16,
    color: '#374151',
    lineHeight: 24,
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
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#CBD5E1',
    marginHorizontal: 4,
  },
  paginationDotActive: {
    backgroundColor: '#4F46E5',
    width: 24,
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
  },
  backButton: {
    backgroundColor: '#F1F5F9',
  },
  nextButton: {
    backgroundColor: '#4F46E5',
    flexDirection: 'row',
    paddingHorizontal: 20,
    width: 'auto',
    minWidth: 56,
  },
  nextButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
    marginRight: 8,
  },
});