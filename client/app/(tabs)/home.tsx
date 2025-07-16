import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  ScrollView,
  Image,
  Alert,
  Modal,
  FlatList,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { supabase, Favorite } from '../../lib/supabase';

const frameStyles = [
  { id: 'classic', name: 'Classic', color: '#8B4513', preview: '🖼️' },
  { id: 'modern', name: 'Modern', color: '#2C3E50', preview: '⬛' },
  { id: 'vintage', name: 'Vintage', color: '#D4AF37', preview: '🟨' },
  { id: 'elegant', name: 'Elegant', color: '#4A4A4A', preview: '⬜' },
  { id: 'colorful', name: 'Colorful', color: '#FF6B6B', preview: '🌈' },
  { id: 'minimal', name: 'Minimal', color: '#FFFFFF', preview: '⚪' },
];

export default function HomeScreen() {
  const [favorites, setFavorites] = useState<Favorite[]>([]);
  const [loading, setLoading] = useState(true);
  const [showFrameModal, setShowFrameModal] = useState(false);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    fetchFavorites();
  }, []);

  const fetchFavorites = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from('favorites')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setFavorites(data || []);
    } catch (error) {
      console.error('Error fetching favorites:', error);
    } finally {
      setLoading(false);
    }
  };

  const pickImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    
    if (status !== 'granted') {
      Alert.alert('Permission needed', 'Please grant camera roll permissions to upload photos.');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });

    if (!result.canceled && result.assets[0]) {
      setSelectedImage(result.assets[0].uri);
      setShowFrameModal(true);
    }
  };

  const uploadFavorite = async (frameStyle: string) => {
    if (!selectedImage) return;

    setUploading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      // Upload image to storage
      const timestamp = Date.now();
      const fileName = `${user.id}/${timestamp}.jpg`;

      const response = await fetch(selectedImage);
      const blob = await response.blob();

      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('favorites')
        .upload(fileName, blob, {
          contentType: 'image/jpeg',
        });

      if (uploadError) throw uploadError;

      // Get public URL
      const { data: urlData } = supabase.storage
        .from('favorites')
        .getPublicUrl(fileName);

      // Save to database
      const { error: dbError } = await supabase
        .from('favorites')
        .insert({
          user_id: user.id,
          image_url: urlData.publicUrl,
          frame_style: frameStyle,
          title: `Favorite ${favorites.length + 1}`,
        });

      if (dbError) throw dbError;

      setShowFrameModal(false);
      setSelectedImage(null);
      fetchFavorites();
      
      Alert.alert('Success!', 'Your favorite has been added.');
    } catch (error) {
      console.error('Upload error:', error);
      Alert.alert('Upload failed', 'There was an error uploading your photo. Please try again.');
    } finally {
      setUploading(false);
    }
  };

  const deleteFavorite = async (id: string, imageUrl: string) => {
    Alert.alert(
      'Delete Favorite',
      'Are you sure you want to delete this favorite?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              // Extract filename from URL for storage deletion
              const fileName = imageUrl.split('/').pop();
              
              // Delete from storage
              if (fileName) {
                await supabase.storage
                  .from('favorites')
                  .remove([fileName]);
              }

              // Delete from database
              const { error } = await supabase
                .from('favorites')
                .delete()
                .eq('id', id);

              if (error) throw error;
              fetchFavorites();
            } catch (error) {
              console.error('Error deleting favorite:', error);
              Alert.alert('Error', 'Failed to delete favorite. Please try again.');
            }
          },
        },
      ]
    );
  };

  const getFrameStyle = (frameType: string) => {
    const frame = frameStyles.find(f => f.id === frameType) || frameStyles[0];
    return {
      borderColor: frame.color,
      borderWidth: 4,
    };
  };

  const renderFavorite = ({ item }: { item: Favorite }) => (
    <View style={styles.favoriteCard}>
      <View style={[styles.imageContainer, getFrameStyle(item.frame_style)]}>
        <Image source={{ uri: item.image_url }} style={styles.favoriteImage} />
        <TouchableOpacity
          style={styles.deleteButton}
          onPress={() => deleteFavorite(item.id, item.image_url)}
        >
          <Ionicons name="close-circle" size={24} color="#EF4444" />
        </TouchableOpacity>
      </View>
      {item.title && <Text style={styles.favoriteTitle}>{item.title}</Text>}
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.logoContainer}>
          <Ionicons name="heart" size={24} color="#6366F1" />
          <Text style={styles.logoText}>Memora</Text>
        </View>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Welcome Section */}
        <View style={styles.welcomeSection}>
          <Text style={styles.welcomeTitle}>Your Favorites</Text>
          <Text style={styles.welcomeSubtitle}>
            Capture and frame your most cherished memories
          </Text>
        </View>

        {/* Add Button */}
        <TouchableOpacity style={styles.addButton} onPress={pickImage}>
          <Ionicons name="add-circle-outline" size={32} color="#6366F1" />
          <Text style={styles.addButtonText}>Add New Favorite</Text>
        </TouchableOpacity>

        {/* Favorites Grid */}
        {loading ? (
          <View style={styles.loadingContainer}>
            <Ionicons name="heart-outline" size={48} color="#94A3B8" />
            <Text style={styles.loadingText}>Loading your favorites...</Text>
          </View>
        ) : favorites.length === 0 ? (
          <View style={styles.emptyState}>
            <Ionicons name="heart-outline" size={80} color="#CBD5E1" />
            <Text style={styles.emptyTitle}>No favorites yet</Text>
            <Text style={styles.emptySubtitle}>
              Add your first favorite photo to get started
            </Text>
          </View>
        ) : (
          <FlatList
            data={favorites}
            renderItem={renderFavorite}
            keyExtractor={(item) => item.id}
            numColumns={2}
            columnWrapperStyle={styles.row}
            contentContainerStyle={styles.favoritesGrid}
            scrollEnabled={false}
          />
        )}
      </ScrollView>

      {/* Frame Selection Modal */}
      <Modal
        visible={showFrameModal}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setShowFrameModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Choose a Frame</Text>
            
            {selectedImage && (
              <View style={styles.previewContainer}>
                <Image source={{ uri: selectedImage }} style={styles.previewImage} />
              </View>
            )}

            <ScrollView style={styles.frameOptions} showsVerticalScrollIndicator={false}>
              {frameStyles.map((frame) => (
                <TouchableOpacity
                  key={frame.id}
                  style={styles.frameOption}
                  onPress={() => uploadFavorite(frame.id)}
                  disabled={uploading}
                >
                  <View style={[styles.framePreview, { borderColor: frame.color }]}>
                    <Text style={styles.frameEmoji}>{frame.preview}</Text>
                  </View>
                  <Text style={styles.frameName}>{frame.name}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>

            <TouchableOpacity
              style={styles.cancelButton}
              onPress={() => setShowFrameModal(false)}
              disabled={uploading}
            >
              <Text style={styles.cancelButtonText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
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
  welcomeSection: {
    paddingVertical: 32,
    alignItems: 'center',
  },
  welcomeTitle: {
    fontSize: 28,
    fontWeight: '800',
    color: '#1E293B',
    marginBottom: 8,
  },
  welcomeSubtitle: {
    fontSize: 16,
    color: '#64748B',
    textAlign: 'center',
  },
  addButton: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 24,
    alignItems: 'center',
    marginBottom: 32,
    borderWidth: 2,
    borderColor: '#E2E8F0',
    borderStyle: 'dashed',
  },
  addButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#6366F1',
    marginTop: 8,
  },
  loadingContainer: {
    alignItems: 'center',
    paddingVertical: 60,
  },
  loadingText: {
    fontSize: 16,
    color: '#64748B',
    marginTop: 16,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 60,
  },
  emptyTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#1E293B',
    marginTop: 16,
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 16,
    color: '#64748B',
    textAlign: 'center',
  },
  favoritesGrid: {
    paddingBottom: 32,
  },
  row: {
    justifyContent: 'space-between',
  },
  favoriteCard: {
    width: '48%',
    marginBottom: 16,
  },
  imageContainer: {
    position: 'relative',
    borderRadius: 12,
    overflow: 'hidden',
  },
  favoriteImage: {
    width: '100%',
    height: 150,
    resizeMode: 'cover',
  },
  deleteButton: {
    position: 'absolute',
    top: 8,
    right: 8,
    backgroundColor: 'rgba(255,255,255,0.9)',
    borderRadius: 12,
  },
  favoriteTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1E293B',
    marginTop: 8,
    textAlign: 'center',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 24,
    maxHeight: '80%',
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#1E293B',
    textAlign: 'center',
    marginBottom: 24,
  },
  previewContainer: {
    alignItems: 'center',
    marginBottom: 24,
  },
  previewImage: {
    width: 120,
    height: 120,
    borderRadius: 12,
  },
  frameOptions: {
    maxHeight: 300,
  },
  frameOption: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 16,
    borderRadius: 12,
    marginBottom: 8,
    backgroundColor: '#F8FAFC',
  },
  framePreview: {
    width: 48,
    height: 48,
    borderRadius: 8,
    borderWidth: 3,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
    backgroundColor: '#FFFFFF',
  },
  frameEmoji: {
    fontSize: 20,
  },
  frameName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1E293B',
  },
  cancelButton: {
    backgroundColor: '#F1F5F9',
    paddingVertical: 16,
    borderRadius: 12,
    marginTop: 16,
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#64748B',
    textAlign: 'center',
  },
});