import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  ScrollView,
  Switch,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { supabase, UserProfile, AppSettings } from '../../lib/supabase';
import { StorageService } from '../../lib/storage';

const accountSettings = [
  {
    id: 'profile',
    title: 'Profile Settings',
    description: 'Edit your profile information',
    icon: 'person-outline',
    color: '#6366F1',
  },
  {
    id: 'privacy',
    title: 'Privacy & Security',
    description: 'Manage your privacy settings',
    icon: 'shield-checkmark-outline',
    color: '#10B981',
  },
];

const appSettingsConfig = [
  {
    id: 'notifications',
    title: 'Notifications',
    description: 'Configure alerts and reminders',
    icon: 'notifications-outline',
    color: '#F59E0B',
  },
  {
    id: 'audio',
    title: 'Audio Feedback',
    description: 'Voice prompts and sounds',
    icon: 'volume-high-outline',
    color: '#EF4444',
  },
];

export default function SettingsScreen() {
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [appSettings, setAppSettings] = useState<AppSettings | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchUserData();
  }, []);

  const fetchUserData = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // Fetch user profile
      const { data: profile } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('user_id', user.id)
        .single();

      setUserProfile(profile);

      // Fetch app settings
      const { data: settings } = await supabase
        .from('app_settings')
        .select('*')
        .eq('user_id', user.id)
        .single();

      setAppSettings(settings);
    } catch (error) {
      console.error('Error fetching user data:', error);
    } finally {
      setLoading(false);
    }
  };

  const updateAppSetting = async (key: keyof AppSettings, value: boolean) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { error } = await supabase
        .from('app_settings')
        .upsert({
          user_id: user.id,
          [key]: value,
          updated_at: new Date().toISOString(),
        });

      if (error) throw error;

      setAppSettings(prev => prev ? { ...prev, [key]: value } : null);
    } catch (error) {
      console.error('Error updating setting:', error);
      Alert.alert('Error', 'Failed to update setting. Please try again.');
    }
  };

  const handleSettingPress = (settingId: string) => {
    Alert.alert(
      'Settings',
      'This setting will be available in the next update.',
      [{ text: 'OK' }]
    );
  };

  const handleSignOut = () => {
    Alert.alert(
      'Sign Out',
      'Are you sure you want to sign out?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Sign Out',
          style: 'destructive',
          onPress: async () => {
            try {
              await supabase.auth.signOut();
              await StorageService.clearAll();
              router.replace('/auth/signin');
            } catch (error) {
              console.error('Error signing out:', error);
              Alert.alert('Error', 'Failed to sign out. Please try again.');
            }
          },
        },
      ]
    );
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <Ionicons name="settings-outline" size={48} color="#94A3B8" />
          <Text style={styles.loadingText}>Loading settings...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.logoContainer}>
          <Ionicons name="settings" size={24} color="#6366F1" />
          <Text style={styles.logoText}>Settings</Text>
        </View>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* User Profile */}
        <View style={styles.profileSection}>
          <View style={styles.profileCard}>
            <View style={styles.profileIcon}>
              <Ionicons name="person-outline" size={32} color="#FFFFFF" />
            </View>
            <View style={styles.profileInfo}>
              <View style={styles.profileNameRow}>
                <Ionicons name="star" size={16} color="#F59E0B" />
                <Text style={styles.profileName}>
                  {userProfile?.full_name || 'User'}
                </Text>
              </View>
              <Text style={styles.profileEmail}>
                {userProfile?.user_id ? 'Memora Member' : 'Guest User'}
              </Text>
              <View style={styles.membershipBadge}>
                <Text style={styles.membershipText}>Premium Member</Text>
              </View>
            </View>
          </View>
        </View>

        {/* Account Settings */}
        <View style={styles.settingsSection}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Account</Text>
          </View>
          <View style={styles.settingsGroup}>
            {accountSettings.map((setting) => (
              <TouchableOpacity
                key={setting.id}
                style={styles.settingItem}
                onPress={() => handleSettingPress(setting.id)}
                accessibilityLabel={setting.title}
              >
                <View style={[styles.settingIcon, { backgroundColor: setting.color }]}>
                  <Ionicons name={setting.icon as any} size={20} color="#FFFFFF" />
                </View>
                <View style={styles.settingContent}>
                  <Text style={styles.settingTitle}>{setting.title}</Text>
                  <Text style={styles.settingDescription}>{setting.description}</Text>
                </View>
                <Ionicons name="chevron-forward" size={20} color="#94A3B8" />
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* App Settings */}
        <View style={styles.settingsSection}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>App Settings</Text>
          </View>
          <View style={styles.settingsGroup}>
            {appSettingsConfig.map((setting) => (
              <TouchableOpacity
                key={setting.id}
                style={styles.settingItem}
                onPress={() => handleSettingPress(setting.id)}
                accessibilityLabel={setting.title}
              >
                <View style={[styles.settingIcon, { backgroundColor: setting.color }]}>
                  <Ionicons name={setting.icon as any} size={20} color="#FFFFFF" />
                </View>
                <View style={styles.settingContent}>
                  <Text style={styles.settingTitle}>{setting.title}</Text>
                  <Text style={styles.settingDescription}>{setting.description}</Text>
                </View>
                <Ionicons name="chevron-forward" size={20} color="#94A3B8" />
              </TouchableOpacity>
            ))}
            
            {/* Notifications Toggle */}
            <View style={styles.settingItem}>
              <View style={[styles.settingIcon, { backgroundColor: '#F59E0B' }]}>
                <Ionicons name="notifications-outline" size={20} color="#FFFFFF" />
              </View>
              <View style={styles.settingContent}>
                <Text style={styles.settingTitle}>Push Notifications</Text>
                <Text style={styles.settingDescription}>Receive app notifications</Text>
              </View>
              <Switch
                value={appSettings?.notifications_enabled ?? true}
                onValueChange={(value) => updateAppSetting('notifications_enabled', value)}
                trackColor={{ false: '#E2E8F0', true: '#A5B4FC' }}
                thumbColor={appSettings?.notifications_enabled ? '#6366F1' : '#F1F5F9'}
              />
            </View>

            {/* Dark Mode Toggle */}
            <View style={styles.settingItem}>
              <View style={[styles.settingIcon, { backgroundColor: '#64748B' }]}>
                <Ionicons name="moon-outline" size={20} color="#FFFFFF" />
              </View>
              <View style={styles.settingContent}>
                <Text style={styles.settingTitle}>Dark Mode</Text>
                <Text style={styles.settingDescription}>Toggle dark theme</Text>
              </View>
              <Switch
                value={appSettings?.dark_mode ?? false}
                onValueChange={(value) => updateAppSetting('dark_mode', value)}
                trackColor={{ false: '#E2E8F0', true: '#A5B4FC' }}
                thumbColor={appSettings?.dark_mode ? '#6366F1' : '#F1F5F9'}
              />
            </View>

            {/* Sound Toggle */}
            <View style={styles.settingItem}>
              <View style={[styles.settingIcon, { backgroundColor: '#EF4444' }]}>
                <Ionicons name="volume-high-outline" size={20} color="#FFFFFF" />
              </View>
              <View style={styles.settingContent}>
                <Text style={styles.settingTitle}>Sound Effects</Text>
                <Text style={styles.settingDescription}>App sounds and feedback</Text>
              </View>
              <Switch
                value={appSettings?.sound_enabled ?? true}
                onValueChange={(value) => updateAppSetting('sound_enabled', value)}
                trackColor={{ false: '#E2E8F0', true: '#A5B4FC' }}
                thumbColor={appSettings?.sound_enabled ? '#6366F1' : '#F1F5F9'}
              />
            </View>
          </View>
        </View>

        {/* Sign Out Button */}
        <View style={styles.signOutSection}>
          <TouchableOpacity
            style={styles.signOutButton}
            onPress={handleSignOut}
            accessibilityLabel="Sign out of your account"
          >
            <View style={styles.signOutIcon}>
              <Ionicons name="log-out-outline" size={20} color="#EF4444" />
            </View>
            <Text style={styles.signOutText}>Sign Out</Text>
            <Ionicons name="chevron-forward" size={20} color="#94A3B8" />
          </TouchableOpacity>
        </View>
      </ScrollView>
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
  profileSection: {
    paddingVertical: 24,
  },
  profileCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 20,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 4,
  },
  profileIcon: {
    width: 64,
    height: 64,
    borderRadius: 16,
    backgroundColor: '#6366F1',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  profileInfo: {
    flex: 1,
  },
  profileNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  profileName: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1E293B',
    marginLeft: 8,
  },
  profileEmail: {
    fontSize: 16,
    color: '#64748B',
    marginBottom: 8,
  },
  membershipBadge: {
    backgroundColor: '#FEF3C7',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
    alignSelf: 'flex-start',
  },
  membershipText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#92400E',
  },
  settingsSection: {
    marginBottom: 24,
  },
  sectionHeader: {
    backgroundColor: '#6366F1',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  settingsGroup: {
    backgroundColor: '#FFFFFF',
    borderBottomLeftRadius: 16,
    borderBottomRightRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 4,
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  settingIcon: {
    width: 40,
    height: 40,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  settingContent: {
    flex: 1,
  },
  settingTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1E293B',
    marginBottom: 2,
  },
  settingDescription: {
    fontSize: 14,
    color: '#64748B',
  },
  signOutSection: {
    marginTop: 16,
    marginBottom: 32,
  },
  signOutButton: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
    borderWidth: 1,
    borderColor: '#FEE2E2',
  },
  signOutIcon: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: '#FEE2E2',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  signOutText: {
    flex: 1,
    fontSize: 16,
    fontWeight: '600',
    color: '#EF4444',
  },
});