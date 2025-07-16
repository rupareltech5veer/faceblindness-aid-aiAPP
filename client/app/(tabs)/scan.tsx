import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  Alert,
  Image,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';

export default function ScanScreen() {
  const [isScanning, setIsScanning] = useState(false);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [showOverlay, setShowOverlay] = useState(false);

  const handleCameraCapture = async () => {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    
    if (status !== 'granted') {
      Alert.alert('Permission needed', 'Please grant camera permissions to capture photos.');
      return;
    }

    const result = await ImagePicker.launchCameraAsync({
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });

    if (!result.canceled && result.assets[0]) {
      setCapturedImage(result.assets[0].uri);
      setShowOverlay(true);
      
      // Simulate AI processing
      setIsScanning(true);
      setTimeout(() => {
        setIsScanning(false);
      }, 2000);
    }
  };

  const handleScanFace = () => {
    setIsScanning(true);
    // Simulate scanning process
    setTimeout(() => {
      setIsScanning(false);
      Alert.alert(
        'Face Scanned',
        'AI facial recognition will be implemented in the next update.',
        [{ text: 'OK' }]
      );
    }, 2000);
  };

  const resetScan = () => {
    setCapturedImage(null);
    setShowOverlay(false);
    setIsScanning(false);
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.logoContainer}>
          <Ionicons name="camera" size={24} color="#6366F1" />
          <Text style={styles.logoText}>Scan</Text>
        </View>
      </View>

      <View style={styles.content}>
        {/* Instructions */}
        <View style={styles.instructionsContainer}>
          <View style={styles.iconContainer}>
            <Ionicons name="camera-outline" size={32} color="#FFFFFF" />
            <View style={styles.sparkleIcon}>
              <Ionicons name="sparkles-outline" size={16} color="#A5B4FC" />
            </View>
          </View>
          <Text style={styles.title}>Face Recognition</Text>
          <Text style={styles.subtitle}>
            {capturedImage 
              ? 'AI facial highlighting will be added here' 
              : 'Capture a photo to identify faces'
            }
          </Text>
        </View>

        {/* Camera Viewfinder or Captured Image */}
        <View style={styles.cameraContainer}>
          {capturedImage ? (
            <View style={styles.imageContainer}>
              <Image source={{ uri: capturedImage }} style={styles.capturedImage} />
              
              {/* AI Overlay Placeholder */}
              {showOverlay && (
                <View style={styles.overlayContainer}>
                  <View style={styles.faceHighlight}>
                    <View style={styles.highlightBox} />
                    <Text style={styles.overlayText}>
                      {isScanning ? 'Analyzing...' : 'Face detected'}
                    </Text>
                  </View>
                </View>
              )}
            </View>
          ) : (
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
          )}
        </View>

        {/* Action Buttons */}
        <View style={styles.actionButtons}>
          {capturedImage ? (
            <>
              <TouchableOpacity
                style={styles.secondaryButton}
                onPress={resetScan}
                accessibilityLabel="Take another photo"
              >
                <Ionicons name="camera-outline" size={20} color="#6366F1" />
                <Text style={styles.secondaryButtonText}>Retake</Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                style={[styles.scanButton, isScanning && styles.scanButtonScanning]}
                onPress={handleScanFace}
                disabled={isScanning}
                accessibilityLabel="Analyze face"
              >
                {isScanning ? (
                  <View style={styles.scanningContainer}>
                    <View style={styles.scanningSpinner} />
                    <Text style={styles.scanButtonText}>Analyzing...</Text>
                  </View>
                ) : (
                  <>
                    <Ionicons name="scan-outline" size={20} color="#FFFFFF" />
                    <Text style={styles.scanButtonText}>Analyze Face</Text>
                  </>
                )}
              </TouchableOpacity>
            </>
          ) : (
            <TouchableOpacity
              style={styles.captureButton}
              onPress={handleCameraCapture}
              accessibilityLabel="Capture photo"
            >
              <Ionicons name="camera" size={24} color="#FFFFFF" />
              <Text style={styles.captureButtonText}>Capture Photo</Text>
            </TouchableOpacity>
          )}
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
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
    paddingVertical: 16,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
  },
  logoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  logoText: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1E293B',
    marginLeft: 8,
  },
  content: {
    flex: 1,
    paddingHorizontal: 24,
  },
  instructionsContainer: {
    alignItems: 'center',
    paddingVertical: 32,
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
    fontSize: 28,
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
    marginBottom: 32,
  },
  imageContainer: {
    position: 'relative',
    width: '100%',
    height: 400,
    borderRadius: 24,
    overflow: 'hidden',
  },
  capturedImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  overlayContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
  },
  faceHighlight: {
    alignItems: 'center',
  },
  highlightBox: {
    width: 150,
    height: 150,
    borderWidth: 3,
    borderColor: '#10B981',
    borderRadius: 12,
    backgroundColor: 'rgba(16, 185, 129, 0.1)',
  },
  overlayText: {
    marginTop: 16,
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
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
  actionButtons: {
    flexDirection: 'row',
    gap: 12,
    paddingBottom: 20,
  },
  captureButton: {
    flex: 1,
    backgroundColor: '#6366F1',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 18,
    borderRadius: 16,
    shadowColor: '#6366F1',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 8,
  },
  captureButtonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '600',
    marginLeft: 8,
  },
  secondaryButton: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 18,
    borderRadius: 16,
    borderWidth: 2,
    borderColor: '#6366F1',
  },
  secondaryButtonText: {
    color: '#6366F1',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  scanButton: {
    flex: 1,
    backgroundColor: '#6366F1',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 18,
    borderRadius: 16,
    shadowColor: '#6366F1',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 8,
  },
  scanButtonScanning: {
    backgroundColor: '#94A3B8',
  },
  scanButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
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