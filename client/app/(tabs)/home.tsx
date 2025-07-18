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
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { supabase, Favorite } from '../../lib/supabase';

// Define MediaType locally to avoid undefined issues
const MediaType = {
  Images: 'images' as const,
  Videos: 'videos' as const,
  All: 'all' as const,
};

const frameStyles = [
  { id: 'none', name: 'No Frame', color: 'transparent', preview: '📷' },
  { id: 'classic', name: 'Classic', color: '#8B4513', preview: '🖼️' },
  { id: 'modern', name: 'Modern', color: '#2C3E50', preview: '⬛' },
  { id: 'vintage', name: 'Vintage', color: '#D4AF37', preview: '🟨' },
  { id: 'elegant', name: 'Elegant', color: '#4A4A4A', preview: '⬜' },
  { id: 'colorful', name: 'Colorful', color: '#FF6B6B', preview: '🌈' },
];

export default function HomeScreen() {
  const [favorites, setFavorites] = useState<Favorite[]>([]);
  const [loading, setLoading] = useState(true);
  const [showFrameModal, setShowFrameModal] = useState(false);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [selectedFrame, setSelectedFrame] = useState<string>('none');
  const [showPreview, setShowPreview] = useState(false);
  const [imageError, setImageError] = useState<{[key: string]: boolean}>({});

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
    try {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      
      if (status !== 'granted') {
        Alert.alert('Permission needed', 'Please grant camera roll permissions to upload photos.');
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaType.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      });

      if (!result.canceled && result.assets && result.assets[0]) {
        setSelectedImage(result.assets[0].uri);
        setShowFrameModal(true);
      }
    } catch (error) {
      console.error('Error picking image:', error);
      Alert.alert('Error', 'Failed to open image picker. Please try again.');
    }
  };

  const handleFrameSelect = (frameId: string) => {
    setSelectedFrame(frameId);
    setShowFrameModal(false);
    setShowPreview(true);
  };

  const handleApplyFrame = () => {
    uploadFavorite(selectedFrame);
    setShowPreview(false);
    setShowFrameModal(false);
  };

  const handleCancelFrame = () => {
    setShowPreview(false);
    setShowFrameModal(true);
    setSelectedFrame('none');
  };

  const uploadFavorite = async (frameStyle: string) => {
    if (!selectedImage) return;

    setUploading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        Alert.alert('Authentication Required', 'Please sign in to save favorites.');
        return;
      }

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
      setShowPreview(false);
      setSelectedImage(null);
      setSelectedFrame('none');
      fetchFavorites();
      
      Alert.alert('Success!', 'Your favorite has been added.');
    } catch (error) {
      console.error('Error uploading favorite:', error);
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
              const urlParts = imageUrl.split('/');
              const fileName = urlParts[urlParts.length - 1];
              
              // Delete from storage
              if (fileName) {
                const { data: { user } } = await supabase.auth.getUser();
                if (user) {
                  await supabase.storage
                    .from('favorites')
                    .remove([`${user.id}/${fileName}`]);
                }
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
    const frame = frameStyles.find(f => f.id === frameType) || frameStyles[1]; // Default to classic if not found
    
    if (frame.id === 'none') {
      return {
        borderWidth: 0,
        backgroundColor: 'transparent',
      };
    }
    
    return {
      borderColor: frame.color,
      borderWidth: 4,
      backgroundColor: 'transparent',
    };
  };

  const handleImageError = (itemId: string) => {
    setImageError(prev => ({ ...prev, [itemId]: true }));
  };

  const handleImageLoad = (itemId: string) => {
    setImageError(prev => ({ ...prev, [itemId]: false }));
  };

  const renderFavorite = ({ item }: { item: Favorite }) => (
    <View style={styles.favoriteCard}>
      <View style={[styles.imageContainer, getFrameStyle(item.frame_style)]}>
        {imageError[item.id] ? (
          <View style={[styles.favoriteImage, styles.errorPlaceholder]}>
            <Ionicons name="image-outline" size={32} color="#94A3B8" />
            <Text style={styles.errorText}>Failed to load image</Text>
          </View>
        ) : (
          <Image 
            source={{ uri: item.image_url }} 
            style={styles.favoriteImage}
            onError={() => handleImageError(item.id)}
            onLoad={() => handleImageLoad(item.id)}
            onLoadStart={() => handleImageLoad(item.id)}
          />
        )}
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
    <LinearGradient
      colors={['rgba(255, 154, 158, 0.3)', 'rgba(250, 208, 196, 0.35)']}
      start={[0, 0]}
      end={[1, 1]}
      style={{ flex: 1 }}
    >
      <SafeAreaView style={styles.safeArea}>
        <ScrollView 
          style={styles.content} 
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: 95 }}
        >
          {/* Header */}
          <View style={styles.header}>
            <View style={styles.iconContainer}>
              <Ionicons name="heart" size={32} color="#FFFFFF" />
              <View style={styles.sparkleIcon}>
                <Ionicons name="sparkles-outline" size={16} color="#EC4899" />
              </View>
            </View>
            <Text style={styles.title}>Memora</Text>
            <Text style={styles.subtitle}>
              Capture and frame your most cherished memories
            </Text>
          </View>

          {/* Add Button */}
          <TouchableOpacity style={styles.addButton} onPress={pickImage}>
            <Ionicons name="add-circle-outline" size={28} color="#FFFFFF" />
            <Text style={styles.addButtonText}>Add New Favorite</Text>
          </TouchableOpacity>

          {/* Favorites Grid */}
          {loading ? (
            <View style={styles.loadingContainer}>
              <Ionicons name="heart-outline" size={64} color="#EC4899" />
              <Text style={styles.loadingText}>Loading your favorites...</Text>
            </View>
          ) : favorites.length === 0 ? (
            <View style={styles.emptyState}>
              <View style={styles.emptyIconContainer}>
                <Ionicons name="heart-outline" size={64} color="#EC4899" />
              </View>
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
      </SafeAreaView>

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
                {showPreview ? (
                  <>
                    <Text style={styles.previewTitle}>Preview with {frameStyles.find(f => f.id === selectedFrame)?.name} Frame</Text>
                    <View style={[styles.framePreviewContainer, getFrameStyle(selectedFrame)]}>
                      <Image source={{ uri: selectedImage }} style={styles.previewImage} />
                    </View>
                  </>
                ) : (
                  <>
                    <Text style={styles.previewTitle}>Selected Photo</Text>
                    <Image 
                      source={{ uri: selectedImage }} 
                      style={styles.previewImage}
                      onError={() => console.error('Error loading preview image')}
                    />
                  </>
                )}
              </View>
            )}

            {!showPreview ? (
              <ScrollView style={styles.frameOptions} showsVerticalScrollIndicator={false}>
                {frameStyles.map((frame) => (
                  <TouchableOpacity
                    key={frame.id}
                    style={styles.frameOption}
                    onPress={() => handleFrameSelect(frame.id)}
                    disabled={uploading}
                  >
                    <View style={[styles.framePreview, { borderColor: frame.color, borderWidth: frame.id === 'none' ? 0 : 3 }]}>
                      <Text style={styles.frameEmoji}>{frame.preview}</Text>
                    </View>
                    <Text style={styles.frameName}>{frame.name}</Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            ) : (
              <View style={styles.previewActions}>
                <TouchableOpacity
                  style={styles.previewCancelButton}
                  onPress={handleCancelFrame}
                  disabled={uploading}
                >
                  <Text style={styles.previewCancelText}>Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.previewApplyButton}
                  onPress={handleApplyFrame}
                  disabled={uploading}
                >
                  <Text style={styles.previewApplyText}>
                    {uploading ? 'Applying...' : 'Apply Frame'}
                  </Text>
                </TouchableOpacity>
              </View>
            )}

            {!showPreview && (
              <TouchableOpacity
                style={styles.cancelButton}
                onPress={() => setShowFrameModal(false)}
                disabled={uploading}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
            )}
          </View>
        </View>
      </Modal>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  safeArea: {
    flex: 1,
  },
  content: {
    flex: 1,
    paddingHorizontal: 24,
  },
  header: {
    alignItems: 'center',
    paddingTop: 60,
    paddingBottom: 40,
  },
  iconContainer: {
    position: 'relative',
    width: 80,
    height: 80,
    borderRadius: 20,
    backgroundColor: '#EC4899',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
    shadowColor: '#EC4899',
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
    color: '#EC4899',
    marginBottom: 8,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    color: '#64748B',
    textAlign: 'center',
    lineHeight: 24,
    paddingHorizontal: 20,
  },
  addButton: {
    backgroundColor: '#EC4899',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 20,
    borderRadius: 16,
    marginBottom: 32,
    shadowColor: '#EC4899',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 8,
  },
  addButtonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '600',
    marginLeft: 8,
  },
  loadingContainer: {
    alignItems: 'center',
    paddingVertical: 80,
  },
  loadingText: {
    fontSize: 16,
    color: '#64748B',
    marginTop: 16,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 80,
  },
  emptyIconContainer: {
    width: 120,
    height: 120,
    borderRadius: 24,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.1,
    shadowRadius: 24,
    elevation: 8,
  },
  emptyTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#1E293B',
    marginBottom: 8,
    textAlign: 'center',
  },
  emptySubtitle: {
    fontSize: 16,
    color: '#64748B',
    textAlign: 'center',
    paddingHorizontal: 20,
  },
  favoritesGrid: {
    paddingBottom: 32,
  },
  row: {
    justifyContent: 'space-between',
  },
  favoriteCard: {
    width: '48%',
    marginBottom: 20,
  },
  imageContainer: {
    position: 'relative',
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15,
    shadowRadius: 24,
    elevation: 8,
    backgroundColor: '#FFFFFF',
  },
  favoriteImage: {
    width: '100%',
    height: 160,
    resizeMode: 'cover',
  },
  errorPlaceholder: {
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
  },
  errorText: {
    fontSize: 12,
    color: '#94A3B8',
    marginTop: 8,
    textAlign: 'center',
  },
  deleteButton: {
    position: 'absolute',
    top: 8,
    right: 8,
    backgroundColor: 'rgba(255,255,255,0.9)',
    borderRadius: 12,
    padding: 4,
  },
  favoriteTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1E293B',
    marginTop: 12,
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
  previewTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1E293B',
    marginBottom: 12,
    textAlign: 'center',
  },
  framePreviewContainer: {
    padding: 8,
    borderRadius: 12,
  },
  previewImage: {
    width: 120,
    height: 120,
    borderRadius: 12,
  },
  previewActions: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 24,
  },
  previewCancelButton: {
    flex: 1,
    backgroundColor: '#F1F5F9',
    paddingVertical: 16,
    borderRadius: 12,
  },
  previewCancelText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#64748B',
    textAlign: 'center',
  },
  previewApplyButton: {
    flex: 1,
    backgroundColor: '#EC4899',
    paddingVertical: 16,
    borderRadius: 12,
  },
  previewApplyText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
    textAlign: 'center',
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