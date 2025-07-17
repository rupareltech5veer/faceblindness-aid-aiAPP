import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

export default function TopNavBar({ userName = 'User', gradientColors = ["#7C3AED", "#6366F1"] }) {
  return (
    <LinearGradient
      colors={gradientColors}
      start={[0, 0]}
      end={[1, 1]}
      style={styles.gradient}
    >
      <View style={styles.container}>
        <Text style={styles.text}>Welcome <Text style={styles.user}>{userName}</Text></Text>
      </View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  gradient: {
    width: '100%',
    paddingTop: 64, // More space for dynamic island
    paddingBottom: 24,
    alignItems: 'center',
    justifyContent: 'center',
    borderBottomLeftRadius: 0, // Match bottom navbar pill shape
    borderBottomRightRadius: 0,
    borderTopLeftRadius: 32,
    borderTopRightRadius: 32,
    elevation: 8,
  },
  container: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  text: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
    textShadowColor: '#000',
    textShadowOffset: { width: -1, height: 1 },
    textShadowRadius: 1,
  },
  user: {
    color: '#FBBF24',
    fontWeight: '800',
  },
});
