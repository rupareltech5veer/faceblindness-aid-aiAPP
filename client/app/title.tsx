import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  Image,
  Animated,
  Easing,
} from 'react-native';
import { useFocusEffect } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { supabase } from '../lib/supabase';

const iconPositions = [
  { top: 50, left: 50 },    // 1
  { top: 175, left: 300 }, // 2
  { top: 325, left: 20 },  // 3
  { top: 450, left: 320 }, // 4
  { top: 600, left: 70 },  // 5
  { top: 675, left: 290 }, // 6
];

const iconNames: (
  | 'heart-outline'
  | 'eye-outline'
  | 'people-outline'
  | 'sparkles-outline'
  | 'star-outline'
  | 'cloud-outline'
)[] = [
  'heart-outline',
  'eye-outline',
  'people-outline',
  'sparkles-outline',
  'star-outline',
  'cloud-outline',
];

export default function TitleScreen() {
  // Animated scale values for each icon
  const animatedScales = iconNames.map(() => React.useRef(new Animated.Value(1)).current);

  useFocusEffect(
    React.useCallback(() => {
      let timeouts: ReturnType<typeof setTimeout>[] = [];

      // Helper to animate scale for one icon
      const animateScale = (i: number) => {
        // Random duration between 400ms and 1200ms
        const duration = 400 + Math.random() * 800;
        // Random delay before next animation
        const delay = 300 + Math.random() * 1200;
        // Random target scale between 1.2 and 1.6
        const targetScale = 1.2 + Math.random() * 0.4;
        Animated.sequence([
          Animated.timing(animatedScales[i], {
            toValue: targetScale,
            duration,
            useNativeDriver: true,
            easing: Easing.inOut(Easing.ease),
          }),
          Animated.timing(animatedScales[i], {
            toValue: 1,
            duration,
            useNativeDriver: true,
            easing: Easing.inOut(Easing.ease),
          }),
        ]).start(() => {
          // Schedule next animation with random delay
          timeouts[i] = setTimeout(() => animateScale(i), delay);
        });
      };

      // Start animation for each icon
      iconNames.forEach((_, i) => {
        animateScale(i);
      });

      return () => {
        // Stop all timeouts and reset scales
        timeouts.forEach(t => clearTimeout(t));
        animatedScales.forEach(scale => scale.setValue(1));
      };
    }, [])
  );

  // ...existing code...

  // Auto-dismiss after 3 seconds
  React.useEffect(() => {
    const timer = setTimeout(() => {
      checkAuthAndNavigate();
    }, 3000);
    return () => clearTimeout(timer);
  }, []);

  const checkAuthAndNavigate = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        router.replace('/(tabs)/home');
      } else {
        router.replace('/auth/signin');
      }
    } catch (error) {
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
            {iconNames.map((name, i) => (
              <Animated.View
                key={name}
                style={[
                  styles.floatingIcon,
                  {
                    top: iconPositions[i].top,
                    left: iconPositions[i].left,
                    transform: [{ scale: animatedScales[i] }],
                  },
                ]}
              >
                <Ionicons name={name} size={i < 3 ? 24 : 22} color="rgba(255,255,255,0.3)" />
              </Animated.View>
            ))}
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
    width: 60,
    height: 60,
    borderRadius: 16,
    backgroundColor: 'rgba(255,255,255,0.1)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  mainContent: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 40,
  },
  logoContainer: {
    marginTop: -300,
    position: 'absolute',
    alignItems: 'center',
    justifyContent: 'center',
  },
  logo: {
    width: 300,
    height: 300,
  },
  appName: {
    marginTop: 150,
    fontSize: 48,
    fontWeight: '800',
    color: '#FFFFFF',
    marginBottom: 8,
    textAlign: 'center',
    letterSpacing: -1,
  },
  slogan: {
    fontSize: 16,
    fontWeight: '500',
    color: 'rgba(255,255,255,0.9)',
    textAlign: 'center',
    lineHeight: 22,
    paddingHorizontal: 20,
    marginBottom: 0,
  },
});