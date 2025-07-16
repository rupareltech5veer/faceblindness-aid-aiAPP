import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  Image,
  RefreshControl,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { supabase, Face } from '../lib/supabase';

export default function DirectoryScreen() {
  const [faces, setFaces] = useState<Face[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchFaces = async () => {
    try {
      const { data, error } = await supabase
        .from('faces')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        throw error;
      }

      setFaces(data || []);
    } catch (error) {
      console.error('Error fetching faces:', error);
      Alert.alert('Error', 'Failed to load faces. Please try again.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchFaces();
  }, []);

  const onRefresh = () => {
    setRefreshing(true);
    fetchFaces();
  };

  const deleteFace = async (id: string, imageUrl: string) => {
    Alert.alert(
      'Delete Face',
      'Are you sure you want to delete this face record?',
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
                  .from('face-uploads')
                  .remove([fileName]);
              }

              // Delete from database
              const { error } = await supabase
                .from('faces')
                .delete()
                .eq('id', id);

              if (error) throw error;

              // Refresh the list
              fetchFaces();
            } catch (error) {
              console.error('Error deleting face:', error);
              Alert.alert('Error', 'Failed to delete face. Please try again.');
            }
          },
        },
      ]
    );
  };

  const renderFaceItem = ({ item }: { item: Face }) => (
    <View style={styles.faceCard}>
      <Image source={{ uri: item.image_url }} style={styles.faceImage} />
      <View style={styles.faceInfo}>
        <View style={styles.faceHeader}>
          <Text style={styles.faceName}>{item.name}</Text>
          <TouchableOpacity
            onPress={() => deleteFace(item.id, item.image_url)}
            style={styles.deleteButton}
          >
            <Ionicons name="trash-outline" size={20} color="#ef4444" />
          </TouchableOpacity>
        </View>
        <Text style={styles.faceDescription}>{item.description}</Text>
        <View style={styles.mnemonicContainer}>
          <Ionicons name="bulb-outline" size={16} color="#f59e0b" />
          <Text style={styles.faceMnemonic}>{item.mnemonic}</Text>
        </View>
        <Text style={styles.faceDate}>
          Added {new Date(item.created_at).toLocaleDateString()}
        </Text>
      </View>
    </View>
  );

  const renderEmptyState = () => (
    <View style={styles.emptyState}>
      <Ionicons name="people-outline" size={80} color="#94a3b8" />
      <Text style={styles.emptyTitle}>No faces yet</Text>
      <Text style={styles.emptySubtitle}>
        Upload your first photo to start building your face directory
      </Text>
    </View>
  );

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <Ionicons name="people-outline" size={48} color="#6366f1" />
          <Text style={styles.loadingText}>Loading your faces...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <FlatList
        data={faces}
        renderItem={renderFaceItem}
        keyExtractor={(item) => item.id}
        contentContainerStyle={[
          styles.listContainer,
          faces.length === 0 && styles.emptyListContainer,
        ]}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        ListEmptyComponent={renderEmptyState}
        showsVerticalScrollIndicator={false}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#64748b',
  },
  listContainer: {
    padding: 16,
  },
  emptyListContainer: {
    flex: 1,
    justifyContent: 'center',
  },
  faceCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
    overflow: 'hidden',
  },
  faceImage: {
    width: '100%',
    height: 200,
    resizeMode: 'cover',
  },
  faceInfo: {
    padding: 16,
  },
  faceHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  faceName: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1e293b',
    flex: 1,
  },
  deleteButton: {
    padding: 4,
  },
  faceDescription: {
    fontSize: 16,
    color: '#374151',
    lineHeight: 24,
    marginBottom: 12,
  },
  mnemonicContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fef3c7',
    padding: 12,
    borderRadius: 8,
    marginBottom: 12,
  },
  faceMnemonic: {
    fontSize: 14,
    color: '#92400e',
    fontStyle: 'italic',
    marginLeft: 8,
    flex: 1,
  },
  faceDate: {
    fontSize: 12,
    color: '#94a3b8',
  },
  emptyState: {
    alignItems: 'center',
    paddingHorizontal: 32,
  },
  emptyTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1e293b',
    marginTop: 16,
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 16,
    color: '#64748b',
    textAlign: 'center',
    lineHeight: 24,
  },
});