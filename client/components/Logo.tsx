import React from 'react';
import { View, StyleSheet } from 'react-native';
import Svg, { Circle, Path, Defs, LinearGradient, Stop } from 'react-native-svg';

interface LogoProps {
  size?: number;
  variant?: 'default' | 'monochrome' | 'white';
}

export default function Logo({ size = 80, variant = 'default' }: LogoProps) {
  const getColors = () => {
    switch (variant) {
      case 'monochrome':
        return {
          primary: '#64748B',
          secondary: '#94A3B8',
          accent: '#CBD5E1',
        };
      case 'white':
        return {
          primary: '#FFFFFF',
          secondary: '#F8FAFC',
          accent: '#E2E8F0',
        };
      default:
        return {
          primary: '#6366F1',
          secondary: '#8B5CF6',
          accent: '#A5B4FC',
        };
    }
  };

  const colors = getColors();

  return (
    <View style={[styles.container, { width: size, height: size }]}>
      <Svg width={size} height={size} viewBox="0 0 80 80">
        <Defs>
          <LinearGradient id="logoGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <Stop offset="0%" stopColor={colors.primary} />
            <Stop offset="100%" stopColor={colors.secondary} />
          </LinearGradient>
          <LinearGradient id="eyeGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <Stop offset="0%" stopColor={colors.accent} />
            <Stop offset="100%" stopColor={colors.primary} />
          </LinearGradient>
        </Defs>
        
        {/* Main circle background */}
        <Circle
          cx="40"
          cy="40"
          r="36"
          fill="url(#logoGradient)"
          stroke={colors.accent}
          strokeWidth="2"
        />
        
        {/* Face outline */}
        <Circle
          cx="40"
          cy="40"
          r="24"
          fill="none"
          stroke="#FFFFFF"
          strokeWidth="2"
          opacity="0.8"
        />
        
        {/* Left eye */}
        <Circle
          cx="32"
          cy="35"
          r="4"
          fill="url(#eyeGradient)"
        />
        
        {/* Right eye */}
        <Circle
          cx="48"
          cy="35"
          r="4"
          fill="url(#eyeGradient)"
        />
        
        {/* Eye pupils */}
        <Circle cx="32" cy="35" r="2" fill="#FFFFFF" />
        <Circle cx="48" cy="35" r="2" fill="#FFFFFF" />
        
        {/* Nose */}
        <Path
          d="M40 42 L38 48 L42 48 Z"
          fill="#FFFFFF"
          opacity="0.6"
        />
        
        {/* Smile */}
        <Path
          d="M32 50 Q40 56 48 50"
          fill="none"
          stroke="#FFFFFF"
          strokeWidth="2.5"
          strokeLinecap="round"
          opacity="0.8"
        />
        
        {/* Recognition dots/sparkles around the face */}
        <Circle cx="25" cy="25" r="1.5" fill={colors.accent} opacity="0.8" />
        <Circle cx="55" cy="25" r="1.5" fill={colors.accent} opacity="0.8" />
        <Circle cx="25" cy="55" r="1.5" fill={colors.accent} opacity="0.8" />
        <Circle cx="55" cy="55" r="1.5" fill={colors.accent} opacity="0.8" />
        
        {/* AI assistance indicator - small sparkle */}
        <Path
          d="M60 20 L62 16 L64 20 L68 18 L64 20 L62 24 L60 20 L56 18 Z"
          fill={colors.accent}
          opacity="0.9"
        />
      </Svg>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
  },
});