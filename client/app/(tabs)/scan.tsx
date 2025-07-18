import React, { useRef, useState } from 'react';
import { CameraView, useCameraPermissions } from 'expo-camera';
import {
  View,
  Text,
  TouchableOpacity,
  SafeAreaView,
  Image,
  Dimensions,
  Alert,
  ScrollView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import * as ImagePicker from 'expo-image-picker';

const { width } = Dimensions.get('window');

export default function ScanScreen() {
  const cameraRef = useRef<any>(null);
  const [permission, requestPermission] = useCameraPermissions();
  const [photoUri, setPhotoUri] = useState<string | null>(null);
  const [isScanning, setIsScanning] = useState(false);

  const handleCapture = async () => {
    setIsScanning(true);
    try {
      const result = await ImagePicker.launchCameraAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 1,
      });
      
      if (!result.canceled && result.assets && result.assets.length > 0) {
        setPhotoUri(result.assets[0].uri);
        // Simulate processing
        setTimeout(() => {
          Alert.alert(
            'Face Scanned',
            'Face recognition feature will be available in the next update.',
            [{ text: 'OK' }]
          );
          setIsScanning(false);
        }, 2000);
      } else {
        setIsScanning(false);
      }
    } catch (error) {
      console.error('Camera error:', error);
      setIsScanning(false);
    }
  };

  const requestCameraPermission = async () => {
    const result = await requestPermission();
    if (!result.granted) {
      Alert.alert(
        'Camera Permission Required',
        'Please grant camera permission to use face scanning.',
        [{ text: 'OK' }]
      );
    }
  };

  return (
    <LinearGradient
      colors={['rgba(168, 224, 99, 0.3)', 'rgba(86, 171, 47, 0.35)']}
      start={[0, 0]}
      end={[1, 1]}
      style={{ flex: 1 }}
    >
      <ScrollView 
        style={{ flex: 1 }} 
        contentContainerStyle={{ flexGrow: 1, paddingBottom: 95 }}
        showsVerticalScrollIndicator={false}
      >
      <SafeAreaView style={{ flex: 1 }}>
        {/* Header */}
        <View style={{
          alignItems: 'center',
          paddingHorizontal: 24,
          paddingTop: 60,
          paddingBottom: 40,
        }}>
          <View style={{
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
          }}>
            <Ionicons name="camera-outline" size={32} color="#FFFFFF" />
            <View style={{
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
            }}>
              <Ionicons name="sparkles-outline" size={16} color="#A5B4FC" />
            </View>
          </View>
          <Text style={{
            fontSize: 32,
            fontWeight: '800',
            color: '#6366F1',
            marginBottom: 8,
            textAlign: 'center',
          }}>Face Recognition</Text>
          <Text style={{
            fontSize: 16,
            color: '#64748B',
            textAlign: 'center',
            lineHeight: 24,
          }}>Point your camera at someone to identify them</Text>
        </View>

        {/* Main Content */}
        <View style={{ flex: 1, paddingHorizontal: 24 }}>
          {/* Camera Viewfinder */}
          <View style={{
            flex: 1,
            justifyContent: 'center',
            alignItems: 'center',
            marginBottom: 40,
          }}>
            <View style={{
              width: '100%',
              height: 400,
              backgroundColor: '#1E293B',
              borderRadius: 24,
              position: 'relative',
              justifyContent: 'center',
              alignItems: 'center',
              overflow: 'hidden',
              shadowColor: '#000',
              shadowOffset: { width: 0, height: 8 },
              shadowOpacity: 0.15,
              shadowRadius: 24,
              elevation: 8,
            }}>
              {!permission ? (
                <View style={{ alignItems: 'center' }}>
                  <Ionicons name="camera-outline" size={48} color="#64748B" />
                  <Text style={{ color: '#64748B', fontSize: 16, marginTop: 12 }}>
                    Requesting camera permission...
                  </Text>
                </View>
              ) : !permission.granted ? (
                <View style={{ alignItems: 'center' }}>
                  <Ionicons name="lock-closed-outline" size={48} color="#64748B" />
                  <Text style={{ color: '#64748B', fontSize: 16, marginTop: 12, textAlign: 'center' }}>
                    Camera permission required
                  </Text>
                  <TouchableOpacity
                    onPress={requestCameraPermission}
                    style={{
                      backgroundColor: '#6366F1',
                      paddingHorizontal: 20,
                      paddingVertical: 12,
                      borderRadius: 12,
                      marginTop: 16,
                    }}
                  >
                    <Text style={{ color: '#FFFFFF', fontWeight: '600' }}>Grant Permission</Text>
                  </TouchableOpacity>
                </View>
              ) : (
                <CameraView
                  style={{ flex: 1 }}
                  facing="front"
                  ref={cameraRef}
                />
              )}

              {/* Corner brackets */}
              <View style={{ position: 'absolute', top: 16, left: 16, width: 24, height: 24, borderColor: '#6366F1', borderWidth: 3, borderRightWidth: 0, borderBottomWidth: 0 }} />
              <View style={{ position: 'absolute', top: 16, right: 16, width: 24, height: 24, borderColor: '#6366F1', borderWidth: 3, borderLeftWidth: 0, borderBottomWidth: 0 }} />
              <View style={{ position: 'absolute', bottom: 40, left: 16, width: 24, height: 24, borderColor: '#6366F1', borderWidth: 3, borderRightWidth: 0, borderTopWidth: 0 }} />
              <View style={{ position: 'absolute', bottom: 40, right: 16, width: 24, height: 24, borderColor: '#6366F1', borderWidth: 3, borderLeftWidth: 0, borderTopWidth: 0 }} />

              {/* Bottom instruction */}
              <View style={{
                position: 'absolute',
                bottom: 16,
                left: 16,
                right: 16,
              }}>
                <Text style={{
                  color: '#94A3B8',
                  fontSize: 14,
                  textAlign: 'center',
                }}>
                  Align face within the frame for best results
                </Text>
              </View>
            </View>
          </View>

          {/* Scan Button */}
          <TouchableOpacity
            style={{
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
              opacity: isScanning ? 0.7 : 1,
            }}
            onPress={handleCapture}
            disabled={isScanning || !permission?.granted}
          >
            {isScanning ? (
              <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <View style={{
                  width: 20,
                  height: 20,
                  borderRadius: 10,
                  borderWidth: 2,
                  borderColor: '#FFFFFF',
                  borderTopColor: 'transparent',
                  marginRight: 12,
                }} />
                <Text style={{ color: '#FFFFFF', fontSize: 18, fontWeight: '600' }}>
                  Scanning...
                </Text>
              </View>
            ) : (
              <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <Ionicons name="camera" size={24} color="#FFFFFF" />
                <Text style={{ color: '#FFFFFF', fontSize: 18, fontWeight: '600', marginLeft: 8 }}>
                  Scan Face
                </Text>
              </View>
            )}
          </TouchableOpacity>

          {/* Show captured photo */}
          {photoUri && (
            <View style={{ alignItems: 'center', marginBottom: 20 }}>
              <View style={{
                backgroundColor: '#FFFFFF',
                borderRadius: 16,
                padding: 16,
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 4 },
                shadowOpacity: 0.1,
                shadowRadius: 12,
                elevation: 4,
              }}>
                <Image 
                  source={{ uri: photoUri }} 
                  style={{ 
                    width: 120, 
                    height: 120, 
                    borderRadius: 12,
                    borderWidth: 2,
                    borderColor: '#6366F1'
                  }} 
                  resizeMode="cover" 
                />
                <Text style={{ 
                  marginTop: 8, 
                  color: '#6366F1', 
                  fontWeight: '600',
                  textAlign: 'center'
                }}>
                  Captured Photo
                </Text>
              </View>
            </View>
          )}
        </View>
      </SafeAreaView>
      </ScrollView>
    </LinearGradient>
  );
}