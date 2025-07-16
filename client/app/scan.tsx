import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

export default function ScanScreen() {
  const [isScanning, setIsScanning] = useState(false);

  const handleScanFace = () => {
    setIsScanning(true);
    // Simulate scanning process
    setTimeout(() => {
      setIsScanning(false);
      Alert.alert(
        'Face Scanned',
        'Face recognition feature will be available in the next update.',
        [{ text: 'OK' }]
      );
    }, 2000);
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.iconContainer}>
            <Ionicons name="camera-outline" size={32} color="#FFFFFF" />
            <View style={styles.sparkleIcon}>
              <Ionicons name="sparkles-outline" size={16} color="#A5B4FC" />
            </View>
          </View>
          <Text style={styles.title}>Face Recognition</Text>
          <Text style={styles.subtitle}>Point your camera at someone to identify them</Text>
        </View>

        {/* Camera Viewfinder */}
        <View style={styles.cameraContainer}>
          <View style={styles.viewfinder}>
            {/* Corner brackets */}
            <View style={[styles.corner, styles.topLeft]} />
            <View style={[styles.corner, styles.topRight]} />
            <View style={[styles.corner, styles.bottomLeft]} />
            <View style={[styles.corner, styles.bottomRight]} />
            
            {/* Camera placeholder */}
            <View style={styles.cameraPlaceholder}>
              <Ionicons 
                name="camera-outline" 
                size={48} 
                color="#64748B" 
              />
              <Text style={styles.cameraText}>Camera viewfinder</Text>
            </View>
            
            {/* Bottom instruction */}
            <View style={styles.instructionContainer}>
              <Text style={styles.instructionText}>
                Align face within the frame for best results
              </Text>
            </View>
          </View>
        </View>

        {/* Scan Button */}
        <TouchableOpacity
          style={[styles.scanButton, isScanning && styles.scanButtonScanning]}
          onPress={handleScanFace}
          disabled={isScanning}
          accessibilityLabel="Scan face"
        >
          {isScanning ? (
            <View style={styles.scanningContainer}>
              <View style={styles.scanningSpinner} />
              <Text style={styles.scanButtonText}>Scanning...</Text>
            </View>
          ) : (
            <Text style={styles.scanButtonText}>Scan Face</Text>
          )}
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F1F5F9',
  },
  content: {
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: 60,
  },
  header: {
    alignItems: 'center',
    marginBottom: 40,
  },
  iconContainer: {
    position: 'relative',
    width: 80,
    height: 80,
    borderRadius: 20,
    backgroundColor: '#6366F1',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
    shadowColor: '#6366F1',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 8,
  },
  sparkleIcon: {
    position: 'absolute',
    top: -8,
    right: -8,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  title: {
    fontSize: 32,
    fontWeight: '800',
    color: '#6366F1',
    marginBottom: 8,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    color: '#64748B',
    textAlign: 'center',
    lineHeight: 24,
  },
  cameraContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 40,
  },
  viewfinder: {
    width: '100%',
    height: 400,
    backgroundColor: '#1E293B',
    borderRadius: 24,
    position: 'relative',
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
  },
  corner: {
    position: 'absolute',
    width: 24,
    height: 24,
    borderColor: '#6366F1',
    borderWidth: 3,
  },
  topLeft: {
    top: 16,
    left: 16,
    borderRightWidth: 0,
    borderBottomWidth: 0,
  },
  topRight: {
    top: 16,
    right: 16,
    borderLeftWidth: 0,
    borderBottomWidth: 0,
  },
  bottomLeft: {
    bottom: 40,
    left: 16,
    borderRightWidth: 0,
    borderTopWidth: 0,
  },
  bottomRight: {
    bottom: 40,
    right: 16,
    borderLeftWidth: 0,
    borderTopWidth: 0,
  },
  cameraPlaceholder: {
    alignItems: 'center',
  },
  cameraText: {
    color: '#64748B',
    fontSize: 16,
    marginTop: 12,
  },
  instructionContainer: {
    position: 'absolute',
    bottom: 16,
    left: 16,
    right: 16,
  },
  instructionText: {
    color: '#94A3B8',
    fontSize: 14,
    textAlign: 'center',
  },
  scanButton: {
    backgroundColor: '#6366F1',
    paddingVertical: 20,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#6366F1',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 8,
    marginBottom: 20,
  },
  scanButtonScanning: {
    backgroundColor: '#94A3B8',
  },
  scanButtonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '600',
  },
  scanningContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  scanningSpinner: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: '#FFFFFF',
    borderTopColor: 'transparent',
    marginRight: 12,
  },
});