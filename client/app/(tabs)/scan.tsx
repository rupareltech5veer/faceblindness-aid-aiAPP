import React, { useRef, useState } from 'react';
import { CameraView, useCameraPermissions } from 'expo-camera';
import {
  View,
  Text,
  TouchableOpacity,
  SafeAreaView,
  Image,
  Dimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';

const { width } = Dimensions.get('window');

export default function ScanScreen() {
  const cameraRef = useRef<any>(null);
  const [permission, requestPermission] = useCameraPermissions();
  const [photoUri, setPhotoUri] = useState<string | null>(null);

  const handleCapture = async () => {
    const result = await ImagePicker.launchCameraAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 1,
    });
    if (!result.canceled && result.assets && result.assets.length > 0) {
      setPhotoUri(result.assets[0].uri);
    }
  };
  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#F8FAFC' }}>
      {/* Top Bar */}
      <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center', paddingTop: 18, paddingBottom: 8, borderBottomWidth: 1, borderColor: '#F1F5F9', backgroundColor: '#fff' }}>
        <Ionicons name="camera" size={22} color="#7C3AED" />
        <Text style={{ marginLeft: 8, fontSize: 18, fontWeight: '700', color: '#1E293B' }}>Scan</Text>
      </View>

      {/* Main Content */}
      <View style={{ flex: 1, alignItems: 'center', paddingHorizontal: 18, paddingTop: 18 }}>
        {/* Icon with badge */}
        <View style={{ marginTop: 8, marginBottom: 18, alignItems: 'center', justifyContent: 'center' }}>
          <View style={{ backgroundColor: '#7C3AED', borderRadius: 20, width: 64, height: 64, alignItems: 'center', justifyContent: 'center', shadowColor: '#7C3AED', shadowOpacity: 0.18, shadowRadius: 12, elevation: 6 }}>
            <Ionicons name="camera-outline" size={36} color="#fff" />
            <View style={{ position: 'absolute', top: -8, right: -8, backgroundColor: '#fff', borderRadius: 16, padding: 4, shadowColor: '#7C3AED', shadowOpacity: 0.2, shadowRadius: 4, elevation: 2 }}>
              <Ionicons name="sparkles-outline" size={16} color="#7C3AED" />
            </View>
          </View>
        </View>
        {/* Title and subtitle */}
        <Text style={{ fontSize: 28, fontWeight: '800', color: '#7C3AED', textAlign: 'center', marginBottom: 2 }}>Face Recognition</Text>
        <Text style={{ fontSize: 16, color: '#64748B', textAlign: 'center', marginBottom: 18 }}>Capture a photo to identify faces</Text>

        {/* Camera Viewfinder */}
        <View style={{ width: width * 0.9, aspectRatio: 1, borderRadius: 24, overflow: 'hidden', backgroundColor: '#181A2A', marginBottom: 18, position: 'relative', justifyContent: 'center', alignItems: 'center' }}>
          {!permission ? (
            <Text style={{ color: '#fff' }}>Requesting camera permission...</Text>
          ) : !permission.granted ? (
            <TouchableOpacity onPress={requestPermission}><Text style={{ color: '#7C3AED', fontWeight: 'bold' }}>Grant Camera Permission</Text></TouchableOpacity>
          ) : (
            <CameraView
              style={{ flex: 1 }}
              facing="front"
              ref={cameraRef}
            />
          )}
          {/* Purple corner marks */}
          <View style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, pointerEvents: 'none' }}>
            {/* Top Left */}
            <View style={{ position: 'absolute', top: 0, left: 0, width: 32, height: 32, borderTopWidth: 4, borderLeftWidth: 4, borderColor: '#7C3AED', borderRadius: 12 }} />
            {/* Top Right */}
            <View style={{ position: 'absolute', top: 0, right: 0, width: 32, height: 32, borderTopWidth: 4, borderRightWidth: 4, borderColor: '#7C3AED', borderRadius: 12 }} />
            {/* Bottom Left */}
            <View style={{ position: 'absolute', bottom: 0, left: 0, width: 32, height: 32, borderBottomWidth: 4, borderLeftWidth: 4, borderColor: '#7C3AED', borderRadius: 12 }} />
            {/* Bottom Right */}
            <View style={{ position: 'absolute', bottom: 0, right: 0, width: 32, height: 32, borderBottomWidth: 4, borderRightWidth: 4, borderColor: '#7C3AED', borderRadius: 12 }} />
          </View>
          {/* Instruction overlay */}
          <Text style={{ position: 'absolute', bottom: 10, left: 0, right: 0, textAlign: 'center', color: '#fff', fontWeight: '600', fontSize: 15, textShadowColor: '#181A2A', textShadowOffset: { width: 0, height: 1 }, textShadowRadius: 4 }}>
            Align face within the frame for best results
          </Text>
        </View>

        {/* Capture Button */}
        <View style={{ width: '100%', paddingBottom: 12, paddingTop: 8 }}>
          <TouchableOpacity
            style={{
              backgroundColor: '#7C3AED',
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'center',
              paddingVertical: 18,
              borderRadius: 16,
              shadowColor: '#7C3AED',
              shadowOffset: { width: 0, height: 8 },
              shadowOpacity: 0.3,
              shadowRadius: 16,
              elevation: 8,
            }}
            onPress={handleCapture}
          >
            <Ionicons name="camera" size={24} color="#FFFFFF" />
            <Text style={{ color: '#FFFFFF', fontSize: 18, fontWeight: '700', marginLeft: 8 }}>Capture Photo</Text>
          </TouchableOpacity>
        </View>

        {/* Show captured photo */}
        {photoUri && (
          <View style={{ marginTop: 16, alignItems: 'center' }}>
            <Image source={{ uri: photoUri }} style={{ width: 220, height: 220, borderRadius: 16, borderWidth: 2, borderColor: '#7C3AED' }} resizeMode="cover" />
            <Text style={{ marginTop: 8, color: '#7C3AED', fontWeight: '600' }}>Captured Photo</Text>
          </View>
        )}
      </View>
    </SafeAreaView>
  );
}
