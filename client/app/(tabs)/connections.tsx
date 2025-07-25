import React, { useState, useEffect, useRef } from 'react';
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
  TextInput,
  FlatList,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { LinearGradient } from 'expo-linear-gradient';
import { supabase, Connection } from '../../lib/supabase';

export default function ConnectionsScreen() {
  
  const [connections, setConnections] = useState<Connection[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingConnection, setEditingConnection] = useState<Connection | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    notes: '',
    image: null as string | null,
  });
  const [uploading, setUploading] = useState(false);
  const [imageErrors, setImageErrors] = useState<{[key: string]: boolean}>({});

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
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setConnections(data || []);
    } catch (error) {
      console.error('Error fetching connections:', error);
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      notes: '',
      image: null,
    });
    setEditingConnection(null);
  };

  const openAddModal = () => {
    resetForm();
    setShowAddModal(true);
  };

  const openEditModal = (connection: Connection) => {
    setFormData({
      name: connection.name,
      description: connection.description || '',
      notes: connection.notes || '',
      image: connection.image_url,
    });
    setEditingConnection(connection);
    setShowAddModal(true);
  };

  const pickImage = async () => {
    console.log('pickImage function called - checking permissions...');
    
    try {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      console.log('Permission status:', status);
      
      if (status !== 'granted') {
        console.log('Permission denied for media library');
        Alert.alert('Permission needed', 'Please grant camera roll permissions to upload photos.');
        return;
      }

      console.log('Permission granted, launching image picker...');
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ['images'],
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      });

      console.log('Image picker result:', result);
      if (!result.canceled && result.assets && result.assets[0]) {
        console.log('Image selected:', result.assets[0].uri);
        setFormData(prev => ({ ...prev, image: result.assets[0].uri }));
      } else {
        console.log('Image picker was canceled or no image selected');
      }
    } catch (error) {
      console.error('Error in pickImage:', error);
      Alert.alert('Error', 'Failed to open image picker. Please try again.');
    }
  };

  const saveConnection = async () => {
    if (!formData.name.trim()) {
      Alert.alert('Missing Information', 'Please enter a name.');
      return;
    }

    setUploading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        Alert.alert('Authentication Required', 'Please sign in to save connections.');
        return;
      }

      let imageUrl = formData.image;
      let faceEmbedding = null;
      let facialTraits = {};
      let traitDescriptions: string[] = [];
      let landmarkData = {};

      if (editingConnection) {
        // Update existing connection
        const { error } = await supabase
          .from('connections')
          .update({
            name: formData.name.trim(),
            description: formData.description.trim() || null,
            notes: formData.notes.trim() || null,
            updated_at: new Date().toISOString(),
          })
          .eq('id', editingConnection.id);

        if (error) throw error;
      } else {
        // Create new connection
        if (!formData.image) {
          Alert.alert('Missing Image', 'Please select an image for face recognition.');
          return;
        }

        // Upload image to Supabase storage if it's a new image
        if (formData.image.startsWith('file://')) {
          const timestamp = Date.now();
          const fileName = `${user.id}/connection_${timestamp}.jpg`;

          const response = await fetch(formData.image);
          const blob = await response.blob();

          const { data: uploadData, error: uploadError } = await supabase.storage
            .from('connections')
            .upload(fileName, blob, {
              contentType: 'image/jpeg',
            });

          if (uploadError) throw uploadError;

          // Get public URL
          const { data: urlData } = supabase.storage
            .from('connections')
            .getPublicUrl(fileName);

          imageUrl = urlData.publicUrl;

          // Try to get face analysis from backend
          try {
            const backendUrl = process.env.EXPO_PUBLIC_BACKEND_URL || 'http://localhost:8000';
            
            // Prepare form data for backend analysis
            const formDataToSend = new FormData();
            formDataToSend.append('user_id', user.id);
            formDataToSend.append('name', formData.name.trim());
            formDataToSend.append('role', formData.description.trim());
            formDataToSend.append('context', formData.notes.trim());
            formDataToSend.append('file', blob, 'connection.jpg');

            const apiResponse = await fetch(`${backendUrl}/connections/add`, {
              method: 'POST',
              body: formDataToSend,
            });

            if (apiResponse.ok) {
              const result = await apiResponse.json();
              if (result.success && result.data) {
                faceEmbedding = result.data.face_embedding || null;
                facialTraits = result.data.facial_traits || {};
                traitDescriptions = result.data.trait_descriptions || [];
                landmarkData = result.data.landmark_data || {};
              }
            }
          } catch (backendError) {
            console.log('Backend analysis failed, continuing without AI features:', backendError);
            // Continue without AI analysis - user can still save the connection
          }
        }

        // Save to database
        const { error: dbError } = await supabase
          .from('connections')
          .insert({
            user_id: user.id,
            name: formData.name.trim(),
            image_url: imageUrl,
            description: formData.description.trim() || null,
            notes: formData.notes.trim() || null,
            face_embedding: faceEmbedding,
            facial_traits: facialTraits,
            trait_descriptions: traitDescriptions,
            landmark_data: landmarkData,
          });

        if (dbError) throw dbError;

        // Show success message with traits if available
        if (traitDescriptions.length > 0) {
          Alert.alert(
            'Connection Added!', 
            `Face analysis complete. Detected traits: ${traitDescriptions.slice(0, 3).join(', ')}`,
            [{ text: 'OK' }]
          );
        } else {
          Alert.alert('Connection Added!', 'Person added to your connections successfully.');
        }
      }

      setShowAddModal(false);
      resetForm();
      fetchConnections();

      if (editingConnection) {
        Alert.alert('Success!', 'Connection updated successfully.');
      }
    } catch (error: any) {
      console.error('Error saving connection:', error);
      Alert.alert('Save failed', `There was an error saving the connection: ${error?.message || 'Please try again.'}`);
    } finally {
      setUploading(false);
    }
  };

  const deleteConnection = async (connection: Connection) => {
    Alert.alert(
      'Delete Connection',
      `Are you sure you want to delete ${connection.name}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              // Delete image from storage if exists
              if (connection.image_url) {
                const urlParts = connection.image_url.split('/');
                const fileName = urlParts[urlParts.length - 1];
                if (fileName) {
                  await supabase.storage
                    .from('connections')
                    .remove([`${connection.user_id}/${fileName}`]);
                }
              }

              // Delete from database
              const { error } = await supabase
                .from('connections')
                .delete()
                .eq('id', connection.id);

              if (error) throw error;
              fetchConnections();
            } catch (error) {
              console.error('Error deleting connection:', error);
              Alert.alert('Error', 'Failed to delete connection. Please try again.');
            }
          },
        },
      ]
    );
  };

  const handleImageError = (itemId: string) => {
    setImageErrors(prev => ({ ...prev, [itemId]: true }));
  };

  const handleImageLoad = (itemId: string) => {
    setImageErrors(prev => ({ ...prev, [itemId]: false }));
  };

  const renderConnection = ({ item }: { item: Connection }) => (
    <View style={styles.connectionCard}>
      <View style={styles.connectionHeader}>
        {item.image_url ? (
          <>
            {imageErrors[item.id] ? (
              <View style={[styles.connectionImage, styles.errorPlaceholder]}>
                <Ionicons name="person-outline" size={24} color="#94A3B8" />
                <Text style={styles.errorText}>Failed to load</Text>
              </View>
            ) : (
              <Image 
                source={{ uri: item.image_url }} 
                style={styles.connectionImage}
                onError={() => handleImageError(item.id)}
                onLoad={() => handleImageLoad(item.id)}
              />
            )}
          </>
        ) : (
          <View style={styles.placeholderImage}>
            <Ionicons name="person-outline" size={32} color="#94A3B8" />
          </View>
        )}
        <View style={styles.connectionInfo}>
          <Text style={styles.connectionName}>{item.name}</Text>
          {item.description && (
            <Text style={styles.connectionDescription}>{item.description}</Text>
          )}
          <Text style={styles.connectionDate}>
            Added {new Date(item.created_at).toLocaleDateString()}
          </Text>
        </View>
        <View style={styles.connectionActions}>
          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => openEditModal(item)}
          >
            <Ionicons name="pencil-outline" size={20} color="#6366F1" />
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => deleteConnection(item)}
          >
            <Ionicons name="trash-outline" size={20} color="#EF4444" />
          </TouchableOpacity>
        </View>
      </View>
      {item.notes && (
        <View style={styles.notesContainer}>
          <Ionicons name="document-text-outline" size={16} color="#6366F1" />
          <Text style={styles.connectionNotes}>{item.notes}</Text>
        </View>
      )}
    </View>
  );

  return (
    <LinearGradient
      colors={['rgba(76, 175, 80, 0.3)', 'rgba(33, 150, 243, 0.35)']}
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
              <Ionicons name="people-outline" size={32} color="#FFFFFF" />
              <View style={styles.sparkleIcon}>
                <Ionicons name="sparkles-outline" size={16} color="#A5B4FC" />
              </View>
            </View>
            <Text style={styles.title}>Connections</Text>
            <Text style={styles.subtitle}>
              Organize your relationships and build stronger connections
            </Text>
            
            <TouchableOpacity style={styles.addButton} onPress={openAddModal}>
              <Ionicons name="add-circle-outline" size={28} color="#FFFFFF" />
              <Text style={styles.addButtonText}>Add Connection</Text>
            </TouchableOpacity>
          </View>

          {/* Content */}
          <View style={styles.content}>
            {loading ? (
              <View style={styles.loadingContainer}>
                <Ionicons name="people-outline" size={64} color="#6366F1" />
                <Text style={styles.loadingText}>Loading your connections...</Text>
              </View>
            ) : connections.length === 0 ? (
              <View style={styles.emptyState}>
                <View style={styles.emptyIconContainer}>
                  <Ionicons name="people-outline" size={64} color="#6366F1" />
                </View>
                <Text style={styles.emptyTitle}>No connections yet</Text>
                <Text style={styles.emptySubtitle}>
                  Add your first connection to get started
                </Text>
              </View>
            ) : (
              <FlatList
                data={connections}
                renderItem={renderConnection}
                keyExtractor={(item) => item.id}
                showsVerticalScrollIndicator={false}
                contentContainerStyle={styles.connectionsList}
              />
            )}
          </View>

        {/* Add/Edit Modal */}
        <Modal
          visible={showAddModal}
          transparent={true}
          animationType="slide"
          onRequestClose={() => setShowAddModal(false)}
        >
          <KeyboardAvoidingView 
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            style={styles.modalOverlay}
          >
            <View style={styles.modalContent}>
              <ScrollView 
                showsVerticalScrollIndicator={false}
                keyboardShouldPersistTaps="handled"
                contentContainerStyle={styles.scrollViewContent}
              >
                <Text style={styles.modalTitle}>
                  {editingConnection ? 'Edit Connection' : 'Add New Connection'}
                </Text>

                {/* Image Picker */}
                <TouchableOpacity 
                  style={styles.imagePicker} 
                  onPress={pickImage}
                  activeOpacity={0.7}
                >
                  {formData.image ? (
                    <Image 
                      source={{ uri: formData.image }} 
                      style={styles.selectedImage}
                      onError={() => console.error('Error loading selected image')}
                    />
                  ) : (
                    <View style={styles.imagePickerPlaceholder}>
                      <Ionicons name="camera-outline" size={32} color="#94A3B8" />
                      <Text style={styles.imagePickerText}>Add Photo</Text>
                    </View>
                  )}
                </TouchableOpacity>

                {/* Name Input */}
                <View style={styles.inputGroup}>
                  <Text style={styles.inputLabel}>Name *</Text>
                  <TextInput
                    style={styles.textInput}
                    value={formData.name}
                    onChangeText={(text) => setFormData(prev => ({ ...prev, name: text }))}
                    placeholder="Enter person's name"
                    placeholderTextColor="#94A3B8"
                    returnKeyType="next"
                  />
                </View>

                {/* Description Input */}
                <View style={styles.inputGroup}>
                  <Text style={styles.inputLabel}>Description</Text>
                  <TextInput
                    style={styles.textInput}
                    value={formData.description}
                    onChangeText={(text) => setFormData(prev => ({ ...prev, description: text }))}
                    placeholder="Brief description (e.g., colleague, friend)"
                    placeholderTextColor="#94A3B8"
                    returnKeyType="next"
                  />
                </View>

                {/* Notes Input */}
                <View style={styles.inputGroup}>
                  <Text style={styles.inputLabel}>Notes</Text>
                  <Text style={styles.inputHint}>
                    Personal details, memorable stories, or unique characteristics that help you remember this person
                  </Text>
                  <TextInput
                    style={[styles.textInput, styles.textArea]}
                    value={formData.notes}
                    onChangeText={(text) => setFormData(prev => ({ ...prev, notes: text }))}
                    placeholder="e.g., 'Loves hiking, has a distinctive laugh, met at Sarah's birthday party'"
                    placeholderTextColor="#94A3B8"
                    multiline
                    numberOfLines={4}
                    returnKeyType="done"
                    blurOnSubmit={true}
                    textAlignVertical="top"
                  />
                </View>

                {/* Action Buttons */}
                <View style={styles.modalActions}>
                  <TouchableOpacity
                    style={styles.cancelButton}
                    onPress={() => setShowAddModal(false)}
                    disabled={uploading}
                  >
                    <Text style={styles.cancelButtonText}>Cancel</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[styles.saveButton, uploading && styles.saveButtonDisabled]}
                    onPress={saveConnection}
                    disabled={uploading}
                  >
                    <Text style={styles.saveButtonText}>
                      {uploading ? 'Saving...' : 'Save'}
                    </Text>
                  </TouchableOpacity>
                </View>
              </ScrollView>
            </View>
          </KeyboardAvoidingView>
        </Modal>
        </ScrollView>
      </SafeAreaView>
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
  header: {
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingTop: 60,
    paddingBottom: 40,
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
    paddingHorizontal: 20,
    marginBottom: 32,
  },
  addButton: {
    backgroundColor: '#6366F1',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 16,
    shadowColor: '#6366F1',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 8,
  },
  addButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
    marginLeft: 8,
  },
  content: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 16,
    color: '#64748B',
    marginTop: 16,
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
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
  },
  connectionsList: {
    padding: 24,
  },
  connectionCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 24,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.1,
    shadowRadius: 24,
    elevation: 8,
  },
  connectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  connectionImage: {
    width: 80,
    height: 80,
    borderRadius: 16,
    marginRight: 20,
    resizeMode: 'cover',
  },
  errorPlaceholder: {
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  errorText: {
    fontSize: 10,
    color: '#94A3B8',
    marginTop: 2,
    textAlign: 'center',
  },
  placeholderImage: {
    width: 80,
    height: 80,
    borderRadius: 16,
    backgroundColor: '#F1F5F9',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 20,
    borderWidth: 2,
    borderColor: '#E2E8F0',
    borderStyle: 'dashed',
  },
  connectionInfo: {
    flex: 1,
  },
  connectionName: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1E293B',
    marginBottom: 6,
  },
  connectionDescription: {
    fontSize: 16,
    color: '#6366F1',
    marginBottom: 6,
  },
  connectionDate: {
    fontSize: 14,
    color: '#94A3B8',
  },
  connectionActions: {
    flexDirection: 'row',
    gap: 12,
  },
  actionButton: {
    padding: 12,
    borderRadius: 8,
    backgroundColor: '#F8FAFC',
  },
  notesContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginTop: 20,
    paddingTop: 20,
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
  },
  connectionNotes: {
    flex: 1,
    fontSize: 16,
    color: '#64748B',
    lineHeight: 20,
    marginLeft: 12,
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
    maxHeight: '90%',
  },
  scrollViewContent: {
    paddingBottom: 20,
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#1E293B',
    textAlign: 'center',
    marginBottom: 24,
  },
  imagePicker: {
    alignItems: 'center',
    marginBottom: 24,
  },
  selectedImage: {
    width: 120,
    height: 120,
    borderRadius: 16,
  },
  imagePickerPlaceholder: {
    width: 120,
    height: 120,
    borderRadius: 16,
    backgroundColor: '#F1F5F9',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#E2E8F0',
    borderStyle: 'dashed',
  },
  imagePickerText: {
    fontSize: 14,
    color: '#94A3B8',
    marginTop: 8,
  },
  inputGroup: {
    marginBottom: 20,
  },
  inputLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 8,
  },
  inputHint: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 8,
    fontStyle: 'italic',
    lineHeight: 18,
  },
  textInput: {
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    backgroundColor: '#FFFFFF',
    color: '#1E293B',
  },
  textArea: {
    height: 100,
    textAlignVertical: 'top',
  },
  modalActions: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 24,
  },
  cancelButton: {
    flex: 1,
    backgroundColor: '#F1F5F9',
    paddingVertical: 16,
    borderRadius: 12,
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#64748B',
    textAlign: 'center',
  },
  saveButton: {
    flex: 1,
    backgroundColor: '#6366F1',
    paddingVertical: 16,
    borderRadius: 12,
  },
  saveButtonDisabled: {
    backgroundColor: '#94A3B8',
  },
  saveButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
    textAlign: 'center',
  },
});