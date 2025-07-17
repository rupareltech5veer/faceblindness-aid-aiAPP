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
  TextInput,
  FlatList,
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
      setFormData(prev => ({ ...prev, image: result.assets[0].uri }));
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
      if (!user) throw new Error('Not authenticated');

      let imageUrl = formData.image;

      // Upload new image if selected
      if (formData.image && formData.image.startsWith('file://')) {
        const timestamp = Date.now();
        const fileName = `${user.id}/${timestamp}.jpg`;

        const response = await fetch(formData.image);
        const blob = await response.blob();

        const { data: uploadData, error: uploadError } = await supabase.storage
          .from('connections')
          .upload(fileName, blob, {
            contentType: 'image/jpeg',
          });

        if (uploadError) throw uploadError;

        const { data: urlData } = supabase.storage
          .from('connections')
          .getPublicUrl(fileName);

        imageUrl = urlData.publicUrl;
      }

      const connectionData = {
        user_id: user.id,
        name: formData.name.trim(),
        description: formData.description.trim() || null,
        notes: formData.notes.trim() || null,
        image_url: imageUrl,
        updated_at: new Date().toISOString(),
      };

      if (editingConnection) {
        // Update existing connection
        const { error } = await supabase
          .from('connections')
          .update(connectionData)
          .eq('id', editingConnection.id);

        if (error) throw error;
      } else {
        // Create new connection
        const { error } = await supabase
          .from('connections')
          .insert(connectionData);

        if (error) throw error;
      }

      setShowAddModal(false);
      resetForm();
      fetchConnections();
      
      Alert.alert('Success!', `Connection ${editingConnection ? 'updated' : 'added'} successfully.`);
    } catch (error) {
      console.error('Save error:', error);
      Alert.alert('Save failed', 'There was an error saving the connection. Please try again.');
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
                const fileName = connection.image_url.split('/').pop();
                if (fileName) {
                  await supabase.storage
                    .from('connections')
                    .remove([fileName]);
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

  const renderConnection = ({ item }: { item: Connection }) => (
    <View style={styles.connectionCard}>
      <View style={styles.connectionHeader}>
        {item.image_url ? (
          <Image source={{ uri: item.image_url }} style={styles.connectionImage} />
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
      colors={['#F8FAFC', '#E2E8F0']}
      style={styles.container}
    >
      <SafeAreaView style={styles.safeArea}>
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
              contentContainerStyle={styles.connectionsList}
              showsVerticalScrollIndicator={false}
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
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <ScrollView showsVerticalScrollIndicator={false}>
              <Text style={styles.modalTitle}>
                {editingConnection ? 'Edit Connection' : 'Add New Connection'}
              </Text>

              {/* Image Picker */}
              <TouchableOpacity style={styles.imagePicker} onPress={pickImage}>
                {formData.image ? (
                  <Image source={{ uri: formData.image }} style={styles.selectedImage} />
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
                />
              </View>

              {/* Notes Input */}
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Notes</Text>
                <TextInput
                  style={[styles.textInput, styles.textArea]}
                  value={formData.notes}
                  onChangeText={(text) => setFormData(prev => ({ ...prev, notes: text }))}
                  placeholder="Personal notes, memorable details, etc."
                  placeholderTextColor="#94A3B8"
                  multiline
                  numberOfLines={4}
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
        </View>
      </Modal>
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
    width: 64,
    height: 64,
    borderRadius: 16,
    marginRight: 20,
  },
  placeholderImage: {
    width: 64,
    height: 64,
    borderRadius: 16,
    backgroundColor: '#F1F5F9',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 20,
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