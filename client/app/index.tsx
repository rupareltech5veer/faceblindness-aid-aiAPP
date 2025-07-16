import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, SafeAreaView } from 'react-native';
import { Link } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

export default function HomeScreen() {
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <View style={styles.header}>
          <Ionicons name="people-outline" size={80} color="#6366f1" />
          <Text style={styles.title}>Face Blindness Aid</Text>
          <Text style={styles.subtitle}>
            Upload photos and generate memory cues to help recognize familiar faces
          </Text>
        </View>

        <View style={styles.buttonContainer}>
          <Link href="/upload" asChild>
            <TouchableOpacity style={[styles.button, styles.primaryButton]}>
              <Ionicons name="camera-outline" size={24} color="white" />
              <Text style={styles.primaryButtonText}>Upload Photo</Text>
            </TouchableOpacity>
          </Link>

          <Link href="/directory" asChild>
            <TouchableOpacity style={[styles.button, styles.secondaryButton]}>
              <Ionicons name="grid-outline" size={24} color="#6366f1" />
              <Text style={styles.secondaryButtonText}>Photo Directory</Text>
            </TouchableOpacity>
          </Link>
        </View>

        <View style={styles.footer}>
          <Text style={styles.footerText}>
            Tap "Upload Photo" to add a new face, or browse your saved faces in the directory.
          </Text>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  content: {
    flex: 1,
    padding: 24,
    justifyContent: 'space-between',
  },
  header: {
    alignItems: 'center',
    marginTop: 60,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#1e293b',
    marginTop: 16,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#64748b',
    textAlign: 'center',
    lineHeight: 24,
    paddingHorizontal: 20,
  },
  buttonContainer: {
    gap: 16,
  },
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 12,
    gap: 8,
  },
  primaryButton: {
    backgroundColor: '#6366f1',
    shadowColor: '#6366f1',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  secondaryButton: {
    backgroundColor: 'white',
    borderWidth: 2,
    borderColor: '#6366f1',
  },
  primaryButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: '600',
  },
  secondaryButtonText: {
    color: '#6366f1',
    fontSize: 18,
    fontWeight: '600',
  },
  footer: {
    marginBottom: 40,
  },
  footerText: {
    fontSize: 14,
    color: '#94a3b8',
    textAlign: 'center',
    lineHeight: 20,
  },
});