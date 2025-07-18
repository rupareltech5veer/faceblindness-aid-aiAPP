import React, { useRef, useState, useEffect } from 'react';
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
  Switch,
  ActivityIndicator,
  StyleSheet,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import * as ImagePicker from 'expo-image-picker';
import * as FileSystem from 'expo-file-system';
import { supabase } from '../../lib/supabase';
import { scanAndIdentify, ScanResult } from '../../lib/api';
import { Connection } from '../../lib/supabase';

const { width, height } = Dimensions.get('window');

export default function ScanScreen() {
  const cameraRef = useRef<any>(null);
  const [permission, requestPermission] = useCameraPermissions();
  const [photoUri, setPhotoUri] = useState<string | null>(null);
  const [identifiedFaces, setIdentifiedFaces] = useState<ScanResult['faces']>([]);
  const [scanHistory, setScanHistory] = useState<Array<{
    id: string;
    timestamp: Date;
    photoUri: string;
    faces: ScanResult['faces'];
  }>>([]);
  const [showScanHistory, setShowScanHistory] = useState(false);
  const [isScanning, setIsScanning] = useState(false);
  const [showEmotionOverlay, setShowEmotionOverlay] = useState(true);
  const [showCaricatureOverlay, setShowCaricatureOverlay] = useState(true);
  const [imageOriginalDimensions, setImageOriginalDimensions] = useState({ width: 0, height: 0 });
  const [displayDimensions, setDisplayDimensions] = useState({ width: 0, height: 0 });
  const [connections, setConnections] = useState<Connection[]>([]);
  const [connectionsLoading, setConnectionsLoading] = useState(true);

  useEffect(() => {
    fetchConnections();
  }, []);

  const fetchConnections = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from('connections')
        .select('*')
        .eq('user_id', user.id);

      if (error) throw error;
      setConnections(data || []);
    } catch (error) {
      console.error('Error fetching connections:', error);
    } finally {
      setConnectionsLoading(false);
    }
  };

  const handleCapture = async () => {
    if (connections.length === 0) {
      Alert.alert(
        'No Connections Found',
        'Please add at least one connection to use this feature. Go to the Connections tab to add your first connection.',
        [{ text: 'OK' }]
      );
      return;
    }

    setIsScanning(true);
    try {
      const { status: mediaLibraryStatus } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      const { status: cameraStatus } = await ImagePicker.requestCameraPermissionsAsync();
      if (mediaLibraryStatus !== 'granted' || cameraStatus !== 'granted') {
        Alert.alert('Permission needed', 'Please grant camera permissions to capture photos.');
        setIsScanning(false);
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.8,
      });
      
      if (!result.canceled && result.assets && result.assets.length > 0) {
        const asset = result.assets[0];
        setPhotoUri(asset.uri);
        setImageOriginalDimensions({ 
          width: asset.width || 800, 
          height: asset.height || 600 
        });
        
        // Read image as base64
        const base64 = await FileSystem.readAsStringAsync(asset.uri, {
          encoding: FileSystem.EncodingType.Base64,
        });
        
        // Get current user
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
          Alert.alert('Error', 'Please sign in to use face scanning.');
          setIsScanning(false);
          return;
        }
        
        try {
          // Call AI backend
          const scanResult = await scanAndIdentify(
            `data:image/jpeg;base64,${base64}`,
            user.id,
            showCaricatureOverlay,
            showEmotionOverlay
          );
          
          if (scanResult && scanResult.faces && Array.isArray(scanResult.faces)) {
            setIdentifiedFaces(scanResult.faces);
            
            // Add to scan history
            const newScan = {
              id: Date.now().toString(),
              timestamp: new Date(),
              photoUri: asset.uri,
              faces: scanResult.faces
            };
            setScanHistory(prev => [newScan, ...prev]);
            
            if (scanResult.faces.length === 0) {
              Alert.alert('No Faces Found', 'No faces were detected in the image. Try taking another photo.');
            } else {
              // Show identification results
              const identifiedPeople = scanResult.faces.filter(face => face.name !== 'Unknown');
              if (identifiedPeople.length > 0) {
                const names = identifiedPeople.map(face => face.name).join(', ');
                Alert.alert('Face Recognition', `Identified: ${names}`);
              }
            }
          } else {
            setIdentifiedFaces([]);
            Alert.alert('Scan Error', 'Unable to process scan results. Please try again.');
          }
        } catch (scanError) {
          console.error('Scan error:', scanError);
          setIdentifiedFaces([]);
          Alert.alert('Scan Error', 'Face recognition service is currently unavailable. Please try again later.');
        }
      }
    } catch (error) {
      console.error('Error capturing and scanning:', error);
      Alert.alert('Camera Error', 'Failed to capture image. Please check camera permissions and try again.');
    } finally {
      setIsScanning(false);
    }
  };

  const resetScan = () => {
    setPhotoUri(null);
    setIdentifiedFaces([]);
    setImageOriginalDimensions({ width: 0, height: 0 });
    setDisplayDimensions({ width: 0, height: 0 });
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

  const onImageLayout = (event: any) => {
    const { width: imgWidth, height: imgHeight } = event.nativeEvent.layout;
    setDisplayDimensions({ width: imgWidth, height: imgHeight });
  };

  const canUseScanFeature = connections.length > 0;

  const renderFaceOverlays = () => {
    if (!photoUri || identifiedFaces.length === 0 || displayDimensions.width === 0) {
      return null;
    }

    const scaleX = displayDimensions.width / imageOriginalDimensions.width;
    const scaleY = displayDimensions.height / imageOriginalDimensions.height;

    return identifiedFaces.map((face, index) => {
      const [left, top, right, bottom] = face.bbox;
      const scaledLeft = left * scaleX;
      const scaledTop = top * scaleY;
      const scaledWidth = (right - left) * scaleX;
      const scaledHeight = (bottom - top) * scaleY;

      return (
        <View
          key={index}
          style={{
            position: 'absolute',
            left: scaledLeft,
            top: scaledTop,
            width: scaledWidth,
            height: scaledHeight,
            borderWidth: 2,
            borderColor: face.confidence > 0.7 ? '#10B981' : '#F59E0B',
            backgroundColor: 'rgba(0,0,0,0.1)',
          }}
        >
          {/* Face info overlay */}
          <View
            style={{
              position: 'absolute',
              bottom: -80,
              left: 0,
              right: 0,
              backgroundColor: 'rgba(0,0,0,0.8)',
              padding: 8,
              borderRadius: 8,
              minWidth: 140,
              maxWidth: 200,
            }}
          >
            <Text style={{ color: '#FFFFFF', fontSize: 14, fontWeight: '600' }}>
              {face.name}
            </Text>
            {face.role && (
              <Text style={{ color: '#A3A3A3', fontSize: 12 }}>
                {face.role}
              </Text>
            )}
            {face.name !== 'Unknown' && (
              <Text style={{ color: '#A3A3A3', fontSize: 12 }}>
                {Math.round(face.confidence * 100)}% confident
              </Text>
            )}
            {showEmotionOverlay && (
              <Text style={{ color: '#60A5FA', fontSize: 12 }}>
                😊 {face.emotion}
              </Text>
            )}
            {face.name === 'Unknown' ? (
              <Text style={{ color: '#EF4444', fontSize: 11, fontStyle: 'italic' }}>
                No match found
              </Text>
            ) : (
              showCaricatureOverlay && face.traits.length > 0 && (
                <Text style={{ color: '#F59E0B', fontSize: 11 }}>
                  {face.traits.slice(0, 2).join(', ')}
                </Text>
              )
            )}
          </View>
        </View>
      );
    });
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
              shadowColor: '#56AB2F',
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
                backgroundColor: '#64748B',
                justifyContent: 'center',
                alignItems: 'center',
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.1,
                shadowRadius: 4,
                elevation: 2,
              }}>
                <Ionicons name="sparkles-outline" size={16} color="#A8E063" />
              </View>
            </View>
            <Text style={{
              fontSize: 32,
              fontWeight: '800',
              color: '#56AB2F',
              marginBottom: 8,
              textAlign: 'center',
            }}>AI Face Scanner</Text>
            <Text style={{
              fontSize: 16,
              color: '#64748B',
              textAlign: 'center',
              lineHeight: 24,
            }}>Capture a photo to identify people and emotions</Text>
          </View>

          {/* Connection Status */}
          {!connectionsLoading && (
            <View style={styles.statusContainer}>
              <View style={[
                styles.statusCard,
                canUseScanFeature ? styles.statusCardEnabled : styles.statusCardDisabled
              ]}>
                <View style={[
                  styles.statusIcon,
                  canUseScanFeature ? styles.statusIconEnabled : styles.statusIconDisabled
                ]}>
                  <Ionicons 
                    name={canUseScanFeature ? "checkmark-circle" : "alert-circle"} 
                    size={20} 
                    color={canUseScanFeature ? "#10B981" : "#F59E0B"} 
                  />
                </View>
                <View style={styles.statusContent}>
                  <Text style={[
                    styles.statusTitle,
                    canUseScanFeature ? styles.statusTitleEnabled : styles.statusTitleDisabled
                  ]}>
                    {canUseScanFeature ? 'Ready to Scan' : 'Connections Required'}
                  </Text>
                  <Text style={styles.statusDescription}>
                    {canUseScanFeature 
                      ? `${connections.length} connection${connections.length !== 1 ? 's' : ''} available for recognition`
                      : 'Please add at least one connection to use this feature'
                    }
                  </Text>
                </View>
              </View>
            </View>
          )}

          {/* Controls */}
          <View style={{ paddingHorizontal: 24, marginBottom: 20 }}>
            <View style={{
              backgroundColor: '#FFFFFF',
              borderRadius: 16,
              padding: 20,
              shadowColor: '#000',
              shadowOffset: { width: 0, height: 4 },
              shadowOpacity: 0.1,
              shadowRadius: 12,
              elevation: 4,
            }}>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                <Text style={{ fontSize: 16, fontWeight: '600', color: '#1E293B' }}>
                  Show Emotions
                </Text>
                <Switch
                  value={showEmotionOverlay}
                  onValueChange={setShowEmotionOverlay}
                  trackColor={{ false: '#E2E8F0', true: '#A5B4FC' }}
                  thumbColor={showEmotionOverlay ? '#6366F1' : '#F1F5F9'}
                />
              </View>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                <Text style={{ fontSize: 16, fontWeight: '600', color: '#1E293B' }}>
                  Show Traits
                </Text>
                <Switch
                  value={showCaricatureOverlay}
                  onValueChange={setShowCaricatureOverlay}
                  trackColor={{ false: '#E2E8F0', true: '#A5B4FC' }}
                  thumbColor={showCaricatureOverlay ? '#6366F1' : '#F1F5F9'}
                />
              </View>
            </View>
          </View>

          {/* Main Content */}
          <View style={{ flex: 1, paddingHorizontal: 24 }}>
            {/* Camera/Image Display */}
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
                {photoUri ? (
                  <>
                    <Image
                      source={{ uri: photoUri }}
                      style={{ width: '100%', height: '100%' }}
                      resizeMode="contain"
                      onLayout={onImageLayout}
                    />
                    {renderFaceOverlays()}
                  </>
                ) : !permission ? (
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
                  <View style={{ alignItems: 'center' }}>
                    <Ionicons name="camera-outline" size={48} color="#64748B" />
                    <Text style={{ color: '#64748B', fontSize: 16, marginTop: 12, textAlign: 'center' }}>
                      Ready to scan faces
                    </Text>
                  </View>
                )}
              </View>
            </View>

            {/* Action Buttons */}
            <View style={{ marginBottom: 20 }}>
              {photoUri ? (
                <View style={{ flexDirection: 'row', gap: 12 }}>
                  <TouchableOpacity
                    style={{
                      flex: 1,
                      backgroundColor: '#F1F5F9',
                      paddingVertical: 16,
                      borderRadius: 16,
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                    onPress={resetScan}
                    disabled={isScanning}
                  >
                    <Text style={{ color: '#64748B', fontSize: 16, fontWeight: '600' }}>
                      Scan New Photo
                    </Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={{
                      flex: 1,
                      backgroundColor: '#56AB2F',
                      paddingVertical: 16,
                      borderRadius: 16,
                      alignItems: 'center',
                      justifyContent: 'center',
                      opacity: isScanning ? 0.7 : 1,
                    }}
                    onPress={handleCapture}
                    disabled={isScanning}
                  >
                    {isScanning ? (
                      <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                        <ActivityIndicator size="small" color="#FFFFFF" />
                        <Text style={{ color: '#FFFFFF', fontSize: 16, fontWeight: '600', marginLeft: 8 }}>
                          Analyzing...
                        </Text>
                      </View>
                    ) : (
                      <Text style={{ color: '#FFFFFF', fontSize: 16, fontWeight: '600' }}>
                        Rescan
                      </Text>
                    )}
                  </TouchableOpacity>
                </View>
              ) : (
                <TouchableOpacity
                  style={{
                    backgroundColor: '#56AB2F',
                    paddingVertical: 20,
                    borderRadius: 16,
                    alignItems: 'center',
                    justifyContent: 'center',
                    shadowColor: '#56AB2F',
                    shadowOffset: { width: 0, height: 8 },
                    shadowOpacity: 0.3,
                    shadowRadius: 16,
                    elevation: 8,
                    opacity: isScanning || !permission?.granted || !canUseScanFeature ? 0.7 : 1,
                  }}
                  onPress={handleCapture}
                  disabled={isScanning || !permission?.granted || !canUseScanFeature}
                >
                  {isScanning ? (
                    <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                      <ActivityIndicator size="small" color="#FFFFFF" />
                      <Text style={{ color: '#FFFFFF', fontSize: 18, fontWeight: '600', marginLeft: 12 }}>
                        Analyzing...
                      </Text>
                    </View>
                  ) : (
                    <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                      <Ionicons name="camera" size={24} color="#FFFFFF" />
                      <Text style={{ color: '#FFFFFF', fontSize: 18, fontWeight: '600', marginLeft: 8 }}>
                        {canUseScanFeature ? 'Capture & Scan' : 'Add Connections First'}
                      </Text>
                    </View>
                  )}
                </TouchableOpacity>
              )}
            </View>

            {/* Results Summary */}
            {identifiedFaces.length > 0 && (
              <View style={{
                backgroundColor: '#FFFFFF',
                borderRadius: 16,
                padding: 20,
                marginBottom: 20,
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 4 },
                shadowOpacity: 0.1,
                shadowRadius: 12,
                elevation: 4,
              }}>
                <Text style={{ fontSize: 18, fontWeight: '700', color: '#1E293B', marginBottom: 12 }}>
                  Scan Results ({identifiedFaces.length} face{identifiedFaces.length !== 1 ? 's' : ''})
                </Text>
                {identifiedFaces.map((face, index) => (
                  <View key={index} style={{ 
                    flexDirection: 'row', 
                    alignItems: 'center', 
                    paddingVertical: 8,
                    borderBottomWidth: index < identifiedFaces.length - 1 ? 1 : 0,
                    borderBottomColor: '#F1F5F9'
                  }}>
                    <View style={{
                      width: 8,
                      height: 8,
                      borderRadius: 4,
                      backgroundColor: face.confidence > 0.7 ? '#10B981' : '#F59E0B',
                      marginRight: 12,
                    }} />
                    <View style={{ flex: 1 }}>
                      <Text style={{ fontSize: 16, fontWeight: '600', color: '#1E293B' }}>
                        {face.name}
                      </Text>
                      {face.role && (
                        <Text style={{ fontSize: 14, color: '#64748B' }}>
                          {face.role}
                        </Text>
                      )}
                    </View>
                    <Text style={{ fontSize: 14, color: '#64748B' }}>
                      {Math.round(face.confidence * 100)}%
                    </Text>
                  </View>
                ))}
                {identifiedFaces.map((face, index) => (
                  face.name !== 'Unknown' && face.traits.length > 0 && (
                    <Text key={index} style={{ fontSize: 12, color: '#F59E0B', fontStyle: 'italic' }}>
                      Traits: {face.traits.slice(0, 3).join(', ')}
                    </Text>
                  )
                ))}
              </View>
            )}

            {/* Scan History Toggle */}
            {scanHistory.length > 0 && (
              <TouchableOpacity
                style={{
                  backgroundColor: '#FFFFFF',
                  borderRadius: 16,
                  padding: 16,
                  marginBottom: 20,
                  flexDirection: 'row',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  shadowColor: '#000',
                  shadowOffset: { width: 0, height: 4 },
                  shadowOpacity: 0.1,
                  shadowRadius: 12,
                  elevation: 4,
                }}
                onPress={() => setShowScanHistory(!showScanHistory)}
              >
                <Text style={{ fontSize: 16, fontWeight: '600', color: '#1E293B' }}>
                  {showScanHistory ? 'Hide' : 'Show'} Scan History ({scanHistory.length})
                </Text>
                <Ionicons 
                  name={showScanHistory ? "chevron-up" : "chevron-down"} 
                  size={20} 
                  color="#64748B" 
                />
              </TouchableOpacity>
            )}

            {/* Scan History */}
            {showScanHistory && scanHistory.length > 0 && (
              <View style={{
                backgroundColor: '#FFFFFF',
                borderRadius: 16,
                padding: 20,
                marginBottom: 20,
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 4 },
                shadowOpacity: 0.1,
                shadowRadius: 12,
                elevation: 4,
              }}>
                <Text style={{ fontSize: 18, fontWeight: '700', color: '#1E293B', marginBottom: 16 }}>
                  Previous Scans
                </Text>
                {scanHistory.map((scan, scanIndex) => (
                  <View key={scan.id} style={{
                    marginBottom: 16,
                    paddingBottom: 16,
                    borderBottomWidth: scanIndex < scanHistory.length - 1 ? 1 : 0,
                    borderBottomColor: '#F1F5F9'
                  }}>
                    <Text style={{ fontSize: 14, color: '#64748B', marginBottom: 8 }}>
                      {scan.timestamp.toLocaleString()}
                    </Text>
                    {scan.faces.map((face, faceIndex) => (
                      <View key={faceIndex} style={{
                        flexDirection: 'row',
                        alignItems: 'center',
                        marginBottom: 4
                      }}>
                        <View style={{
                          width: 6,
                          height: 6,
                          borderRadius: 3,
                          backgroundColor: face.confidence > 0.7 ? '#10B981' : '#F59E0B',
                          marginRight: 8,
                        }} />
                        <Text style={{ fontSize: 14, color: '#1E293B', flex: 1 }}>
                          {face.name} ({Math.round(face.confidence * 100)}%)
                        </Text>
                      </View>
                    ))}
                  </View>
                ))}
              </View>
            )}
          </View>
        </SafeAreaView>
      </ScrollView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  statusContainer: {
    paddingHorizontal: 24,
    marginBottom: 20,
  },
  statusCard: {
    borderRadius: 16,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 4,
  },
  statusCardEnabled: {
    backgroundColor: '#F0FDF4',
    borderWidth: 1,
    borderColor: '#BBF7D0',
  },
  statusCardDisabled: {
    backgroundColor: '#FFFBEB',
    borderWidth: 1,
    borderColor: '#FDE68A',
  },
  statusIcon: {
    width: 40,
    height: 40,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  statusIconEnabled: {
    backgroundColor: '#DCFCE7',
  },
  statusIconDisabled: {
    backgroundColor: '#FEF3C7',
  },
  statusContent: {
    flex: 1,
  },
  statusTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  statusTitleEnabled: {
    color: '#065F46',
  },
  statusTitleDisabled: {
    color: '#92400E',
  },
  statusDescription: {
    fontSize: 14,
    color: '#64748B',
    lineHeight: 18,
  },
});