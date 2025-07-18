import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  Alert,
  TextInput,
  ScrollView,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as ImagePicker from 'expo-image-picker';
import { Ionicons } from '@expo/vector-icons';
import { supabase } from '../lib/supabase';
import { generateFacialCue } from '../lib/api';
import { router } from 'expo-router';

// Define MediaType locally to avoid undefined issues
const MediaType = {
  Images: 'Images' as const,
  Videos: 'Videos' as const,
  All: 'All' as const,
};

export default function UploadScreen() {
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [personName, setPersonName] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const [aiResult, setAiResult] = useState<{
    description: string;
    mnemonic: string;
  } | null>(null);

  const pickImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    
    if (status !== 'granted') {
      Alert.alert('Permission needed', 'Please grant camera roll permissions to upload photos.');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: [MediaType.Images],
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });

    if (!result.canceled && result.assets[0]) {
      setSelectedImage(result.assets[0].uri);
      setAiResult(null); // Reset AI result when new image is selected
    }
  };

  const uploadImage = async () => {
    if (!selectedImage || !personName.trim()) {
      Alert.alert('Missing information', 'Please select an image and enter a name.');
      return;
    }

    setIsUploading(true);

    try {
      // Check authentication
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        Alert.alert('Authentication Required', 'Please sign in to upload photos.');
        return;
      }

      // Create a unique filename
      const timestamp = Date.now();
      const fileName = `faces/${user.id}/face_${timestamp}.jpg`;

      // Convert image to blob for upload
      const response = await fetch(selectedImage);
      const blob = await response.blob();

      // Upload to Supabase storage
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('face-uploads')
        .upload(fileName, blob, {
          contentType: 'image/jpeg',
        });

      if (uploadError) {
        throw uploadError;
      }

      // Get public URL
      const { data: urlData } = supabase.storage
        .from('face-uploads')
        .getPublicUrl(fileName);

      // Generate AI facial cue using our backend
      const aiCue = await generateFacialCue(fileName, user.id);
      setAiResult(aiCue);

      // Save to database
      const { error: dbError } = await supabase
        .from('faces')
        .insert({
          user_id: user.id,
          image_url: urlData.publicUrl,
          name: personName.trim(),
          description: aiCue.description,
          mnemonic: aiCue.mnemonic,
        });

      if (dbError) {
        throw dbError;
      }

      Alert.alert(
        'Success!', 
        'Photo uploaded and facial cue generated successfully.',
        [
          {
            text: 'View Directory',
            onPress: () => router.push('/directory'),
          },
          {
            text: 'Upload Another',
            onPress: () => {
              setSelectedImage(null);
              setPersonName('');
              setAiResult(null);
            },
          },
        ]
      );

    } catch (error) {
      Alert.alert('Upload failed', 'There was an error uploading your photo. Please try again.');
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollView} contentContainerStyle={styles.content}>
        <View style={styles.uploadSection}>
          <TouchableOpacity style={styles.imagePickerButton} onPress={pickImage}>
            {selectedImage ? (
              <Image source={{ uri: selectedImage }} style={styles.selectedImage} />
            ) : (
              <View style={styles.placeholderContainer}>
                <Ionicons name="camera-outline" size={48} color="#94a3b8" />
                <Text style={styles.placeholderText}>Tap to select photo</Text>
              </View>
            )}
          </TouchableOpacity>

          <View style={styles.inputContainer}>
            <Text style={styles.inputLabel}>Person's Name</Text>
            <TextInput
              style={styles.textInput}
              value={personName}
              onChangeText={setPersonName}
              placeholder="Enter the person's name"
              placeholderTextColor="#94a3b8"
            />
          </View>

          <TouchableOpacity
            style={[
              styles.uploadButton,
              (!selectedImage || !personName.trim() || isUploading) && styles.uploadButtonDisabled
            ]}
            onPress={uploadImage}
            disabled={!selectedImage || !personName.trim() || isUploading}
          >
            {isUploading ? (
              <ActivityIndicator color="white" />
            ) : (
              <>
                <Ionicons name="cloud-upload-outline" size={20} color="white" />
                <Text style={styles.uploadButtonText}>Upload & Generate Cue</Text>
              </>
            )}
          </TouchableOpacity>
        </View>

        {aiResult && (
          <View style={styles.resultSection}>
            <Text style={styles.resultTitle}>AI-Generated Memory Cue</Text>
            <View style={styles.resultCard}>
              <View style={styles.resultItem}>
                <Text style={styles.resultLabel}>Description:</Text>
                <Text style={styles.resultText}>{aiResult.description}</Text>
              </View>
              <View style={styles.resultItem}>
                <Text style={styles.resultLabel}>Memory Tip:</Text>
                <Text style={styles.resultText}>{aiResult.mnemonic}</Text>
              </View>
            </View>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  scrollView: {
    flex: 1,
  },
  content: {
    padding: 24,
  },
  uploadSection: {
    marginBottom: 32,
  },
  imagePickerButton: {
    width: '100%',
    height: 200,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#e2e8f0',
    borderStyle: 'dashed',
    marginBottom: 24,
    overflow: 'hidden',
  },
  selectedImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  placeholderContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f1f5f9',
  },
  placeholderText: {
    marginTop: 8,
    fontSize: 16,
    color: '#94a3b8',
  },
  inputContainer: {
    marginBottom: 24,
  },
  inputLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 8,
  },
  textInput: {
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    backgroundColor: 'white',
  },
  uploadButton: {
    backgroundColor: '#6366f1',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    borderRadius: 8,
    gap: 8,
  },
  uploadButtonDisabled: {
    backgroundColor: '#94a3b8',
  },
  uploadButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  resultSection: {
    marginTop: 24,
  },
  resultTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1e293b',
    marginBottom: 16,
  },
  resultCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  resultItem: {
    marginBottom: 16,
  },
  resultLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#6366f1',
    marginBottom: 4,
  },
  resultText: {
    fontSize: 16,
    color: '#374151',
    lineHeight: 24,
  },
});