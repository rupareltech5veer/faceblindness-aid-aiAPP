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
  TextInput,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { supabase, UserProfile } from '../lib/supabase';
import * as ImagePicker from 'expo-image-picker';

// Define MediaType locally to avoid undefined issues
const MediaType = {
  images: 'images' as const,
  videos: 'videos' as const,
  all: 'all' as const,
};

export default function ProfileScreen() {
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [userEmail, setUserEmail] = useState('');
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [editedName, setEditedName] = useState('');
  const [uploading, setUploading] = useState(false);
  const [imageError, setImageError] = useState(false);

  useEffect(() => {
    fetchUserProfile();
  }, []);

  const fetchUserProfile = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        console.log('No user found');
        return;
      }

      setUserEmail(user.email || '');

      console.log('Fetching profile for user:', user.id);
      
      // First, check if there are multiple profiles for this user and clean them up
      const { data: allProfiles, error: allProfilesError } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('user_id', user.id);

      if (allProfilesError) {
        console.error('Error fetching all profiles:', allProfilesError);
      } else if (allProfiles && allProfiles.length > 1) {
        console.log(`Found ${allProfiles.length} profiles for user, cleaning up duplicates...`);
        
        // Keep the most recent profile and delete the rest
        const sortedProfiles = allProfiles.sort((a, b) => 
          new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
        );
        const profileToKeep = sortedProfiles[0];
        const profilesToDelete = sortedProfiles.slice(1);
        
        // Delete duplicate profiles
        for (const profile of profilesToDelete) {
          await supabase
            .from('user_profiles')
            .delete()
            .eq('id', profile.id);
        }
        
        console.log('Cleaned up duplicate profiles, keeping:', profileToKeep);
        setUserProfile(profileToKeep);
        setEditedName(profileToKeep.full_name || 'User');
        return;
      }
      
      const { data: profile, error } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (error) {
        console.error('Error fetching profile:', error);
        if (error.code === 'PGRST116') {
          // No profile found, create one
          console.log('No profile found, creating one...');
          const defaultName = user.user_metadata?.full_name || 
                             user.email?.split('@')[0] || 
                             'User';
          
          const { data: newProfile, error: createError } = await supabase
            .from('user_profiles')
            .insert({
              user_id: user.id,
              full_name: defaultName,
            })
            .select()
            .single();
          
          if (createError) {
            console.error('Error creating profile:', createError);
            // Set default values
            setUserProfile({
              id: '',
              user_id: user.id,
              full_name: defaultName,
              avatar_url: null,
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString(),
            });
            setEditedName(defaultName);
          } else {
            console.log('Profile created successfully:', newProfile);
            setUserProfile(newProfile);
            setEditedName(newProfile.full_name || defaultName);
          }
        } else {
          // Other error, set default values
          const defaultName = user.user_metadata?.full_name || 
                             user.email?.split('@')[0] || 
                             'User';
          setUserProfile({
            id: '',
            user_id: user.id,
            full_name: defaultName,
            avatar_url: null,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          });
          setEditedName(defaultName);
        }
      } else {
        console.log('Profile fetched successfully:', profile);
        setUserProfile(profile);
        setEditedName(profile?.full_name || 'User');
      }
    } catch (error) {
      console.error('Error in fetchUserProfile:', error);
      // Set fallback values
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const defaultName = user.user_metadata?.full_name || 
                           user.email?.split('@')[0] || 
                           'User';
        setUserProfile({
          id: '',
          user_id: user.id,
          full_name: defaultName,
          avatar_url: null,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        });
        setEditedName(defaultName);
      }
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
      mediaTypes: ['images'],
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });

    if (!result.canceled && result.assets[0]) {
      await updateProfileImage(result.assets[0].uri);
    }
    } catch (error) {
      console.error('Error picking image:', error);
      Alert.alert('Error', 'Failed to open image picker. Please try again.');
    }
  };

  const updateProfileImage = async (imageUri: string) => {
    setUploading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      // Upload image to storage
      const timestamp = Date.now();
      const fileName = `${user.id}/avatar_${timestamp}.jpg`;

      const response = await fetch(imageUri);
      const blob = await response.blob();

      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('face-uploads')
        .upload(fileName, blob, {
          contentType: 'image/jpeg',
          upsert: true
        });

      if (uploadError) throw uploadError;

      // Get public URL
      const { data: urlData } = supabase.storage
        .from('face-uploads')
        .getPublicUrl(fileName);

      // Update profile using the same approach as saveProfile
      const { error: updateError } = await supabase
        .from('user_profiles')
        .update({
          avatar_url: urlData.publicUrl,
          updated_at: new Date().toISOString(),
        })
        .eq('user_id', user.id);

      if (updateError) {
        console.error('Error updating profile with avatar:', updateError);
        throw new Error('Failed to update profile with new avatar');
      }

      // Update local state directly instead of fetching
      if (userProfile) {
        setUserProfile({
          ...userProfile,
          avatar_url: urlData.publicUrl,
          updated_at: new Date().toISOString(),
        });
      }
      
      Alert.alert('Success!', 'Profile photo updated successfully.');
    } catch (error: any) {
      console.error('Profile photo update error:', error);
      Alert.alert('Error', `Failed to update profile photo: ${error?.message || 'Please try again.'}`);
    } finally {
      setUploading(false);
    }
  };

  const saveProfile = async () => {
    if (!editedName.trim()) {
      Alert.alert('Missing Information', 'Please enter your full name.');
      return;
    }

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const { error } = await supabase
        .from('user_profiles')
        .update({
          full_name: editedName.trim(),
          updated_at: new Date().toISOString(),
        })
        .eq('user_id', user.id);

      if (error) {
        throw error;
      }

      // Update local state directly instead of fetching
      if (userProfile) {
        setUserProfile({
          ...userProfile,
          full_name: editedName.trim(),
          updated_at: new Date().toISOString(),
        });
      }
      
      setEditing(false);
      
      // Force TopNavBar to refresh by calling fetchUserName directly
      // This is a workaround since CustomEvent doesn't exist in React Native
      
      Alert.alert('Success!', 'Profile updated successfully.');
    } catch (error: any) {
      console.error('Profile update error:', error);
      Alert.alert('Error', `Failed to update profile: ${error?.message || 'Please try again.'}`);
    }
  };

  const saveProfile_old = async () => {
    if (!editedName.trim()) {
      Alert.alert('Missing Information', 'Please enter your full name.');
      return;
    }

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const { error } = await supabase
        .from('user_profiles')
        .upsert({
          user_id: user.id,
          full_name: editedName.trim(),
          updated_at: new Date().toISOString(),
        });

      if (error) throw error;

      // Fetch the updated profile to ensure we have the latest data
      await fetchUserProfile();
      
      setEditing(false);
      
      // Dispatch custom event to update TopNavBar
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('profileUpdated', {
          detail: { fullName: editedName.trim() }
        }));
      }
      
      Alert.alert('Success!', 'Profile updated successfully.');
    } catch (error) {
      console.error('Profile update error:', error);
      Alert.alert('Error', 'Failed to update profile. Please try again.');
    }
  };

  const handleChangePassword = () => {
    router.push('/auth/reset-password');
  };

  const handleDeleteAccount = () => {
    Alert.alert(
      'Delete Account',
      'Are you sure you want to delete your account? This action cannot be undone and will remove all your data.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: confirmDeleteAccount,
        },
      ]
    );
  };

  const confirmDeleteAccount = () => {
    Alert.alert(
      'Final Confirmation',
      'This will permanently delete your account and all associated data. Type "DELETE" to confirm.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'I understand, delete my account',
          style: 'destructive',
          onPress: deleteAccount,
        },
      ]
    );
  };

  const deleteAccount = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      // Delete user data from all tables
      await Promise.all([
        supabase.from('faces').delete().eq('user_id', user.id),
        supabase.from('favorites').delete().eq('user_id', user.id),
        supabase.from('connections').delete().eq('user_id', user.id),
        supabase.from('learning_progress').delete().eq('user_id', user.id),
        supabase.from('app_settings').delete().eq('user_id', user.id),
        supabase.from('user_profiles').delete().eq('user_id', user.id),
      ]);

      // Delete user account
      const { error } = await supabase.auth.admin.deleteUser(user.id);
      if (error) throw error;

      Alert.alert(
        'Account Deleted',
        'Your account has been successfully deleted.',
        [{ text: 'OK', onPress: () => router.replace('/auth/signin') }]
      );
    } catch (error) {
      Alert.alert('Error', 'Failed to delete account. Please contact support.');
    }
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <Ionicons name="person-outline" size={48} color="#94A3B8" />
          <Text style={styles.loadingText}>Loading profile...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <LinearGradient
      colors={['#F8FAFC', '#E2E8F0']}
      style={styles.container}
    >
      <SafeAreaView style={styles.safeArea}>
        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          {/* Header */}
          <View style={styles.header}>
            <TouchableOpacity
              style={styles.backButton}
              onPress={() => router.back()}
            >
              <Ionicons name="chevron-back" size={24} color="#64748B" />
            </TouchableOpacity>
            <Text style={styles.title}>Profile</Text>
            <TouchableOpacity
              style={styles.editButton}
              onPress={() => editing ? saveProfile() : setEditing(true)}
            >
              <Text style={styles.editButtonText}>
                {editing ? 'Save' : 'Edit'}
              </Text>
            </TouchableOpacity>
          </View>

          {/* Profile Card */}
          <View style={styles.profileCard}>
            {/* Profile Photo */}
            <TouchableOpacity
              style={styles.photoContainer}
              onPress={pickImage}
              disabled={uploading}
            >
              {userProfile?.avatar_url ? (
                <>
                  {imageError ? (
                    <View style={[styles.profilePhoto, styles.errorPlaceholder]}>
                      <Ionicons name="person-outline" size={48} color="#94A3B8" />
                      <Text style={styles.errorText}>Failed to load</Text>
                    </View>
                  ) : (
                    <Image 
                      source={{ uri: userProfile.avatar_url }} 
                      style={styles.profilePhoto}
                      onError={() => setImageError(true)}
                      onLoad={() => setImageError(false)}
                    />
                  )}
                </>
              ) : (
                <View style={styles.placeholderPhoto}>
                  <Ionicons name="person-outline" size={48} color="#94A3B8" />
                </View>
              )}
              <View style={styles.photoOverlay}>
                <Ionicons name="camera-outline" size={20} color="#FFFFFF" />
              </View>
              {uploading && (
                <View style={styles.uploadingOverlay}>
                  <Text style={styles.uploadingText}>Uploading...</Text>
                </View>
              )}
            </TouchableOpacity>

            {/* Profile Info */}
            <View style={styles.profileInfo}>
              {editing ? (
                <TextInput
                  style={styles.nameInput}
                  value={editedName}
                  onChangeText={setEditedName}
                  placeholder="Enter your full name"
                  placeholderTextColor="#94A3B8"
                />
              ) : (
                <Text style={styles.profileName}>
                  {userProfile?.full_name || 'User'}
                </Text>
              )}
              <Text style={styles.profileEmail}>{userEmail}</Text>
            </View>
          </View>

          {/* Actions */}
          <View style={styles.actionsSection}>
            <TouchableOpacity
              style={styles.actionButton}
              onPress={handleChangePassword}
            >
              <View style={styles.actionIcon}>
                <Ionicons name="lock-closed-outline" size={24} color="#64748B" />
              </View>
              <Text style={styles.actionText}>Change Password</Text>
              <Ionicons name="chevron-forward" size={20} color="#64748B" />
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.actionButton, styles.dangerButton]}
              onPress={handleDeleteAccount}
            >
              <View style={[styles.actionIcon, styles.dangerIcon]}>
                <Ionicons name="trash-outline" size={24} color="#EF4444" />
              </View>
              <Text style={[styles.actionText, styles.dangerText]}>Delete Account</Text>
              <Ionicons name="chevron-forward" size={20} color="#94A3B8" />
            </TouchableOpacity>
          </View>
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
  content: {
    flex: 1,
    paddingHorizontal: 24,
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
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 20,
    paddingBottom: 32,
  },
  backButton: {
    padding: 8,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: '#1E293B',
  },
  editButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: '#64748B',
    borderRadius: 8,
  },
  editButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  profileCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    padding: 32,
    alignItems: 'center',
    marginBottom: 32,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.1,
    shadowRadius: 24,
    elevation: 8,
  },
  photoContainer: {
    position: 'relative',
    marginBottom: 24,
  },
  profilePhoto: {
    width: 120,
    height: 120,
    borderRadius: 60,
  },
  errorPlaceholder: {
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
  },
  errorText: {
    fontSize: 10,
    color: '#94A3B8',
    marginTop: 4,
    textAlign: 'center',
  },
  placeholderPhoto: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: '#F1F5F9',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#E2E8F0',
  },
  photoOverlay: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#64748B',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    borderColor: '#FFFFFF',
  },
  uploadingOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    borderRadius: 60,
    backgroundColor: 'rgba(0,0,0,0.7)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  uploadingText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
  profileInfo: {
    alignItems: 'center',
  },
  profileName: {
    fontSize: 28,
    fontWeight: '700',
    color: '#1E293B',
    marginBottom: 8,
    textAlign: 'center',
  },
  nameInput: {
    fontSize: 28,
    fontWeight: '700',
    color: '#1E293B',
    marginBottom: 8,
    textAlign: 'center',
    borderBottomWidth: 2,
    borderBottomColor: '#6366F1',
    paddingVertical: 8,
    minWidth: 200,
  },
  profileEmail: {
    fontSize: 16,
    color: '#64748B',
    textAlign: 'center',
  },
  actionsSection: {
    marginBottom: 32,
  },
  actionButton: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  dangerButton: {
    borderWidth: 1,
    borderColor: '#FEE2E2',
  },
  actionIcon: {
    width: 48,
    height: 48,
    borderRadius: 12,
    backgroundColor: '#EEF2FF',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  dangerIcon: {
    backgroundColor: '#FEE2E2',
  },
  actionText: {
    flex: 1,
    fontSize: 18,
    fontWeight: '600',
    color: '#1E293B',
  },
  dangerText: {
    color: '#EF4444',
  },
});