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
import { LinearGradient } from 'expo-linear-gradient';
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
    } finally {
      setLoading(false);
    }
  };

  const updateAppSetting = async (key: keyof AppSettings, value: boolean) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // Update local state immediately for better UX
      setAppSettings(prev => prev ? { ...prev, [key]: value } : {
        id: '',
        user_id: user.id,
        notifications_enabled: true,
        dark_mode: key === 'dark_mode' ? value : false,
        sound_enabled: true,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      });

      const { error } = await supabase
        .from('app_settings')
        .upsert({
          user_id: user.id,
          notifications_enabled: key === 'notifications_enabled' ? value : (appSettings?.notifications_enabled ?? true),
          dark_mode: key === 'dark_mode' ? value : (appSettings?.dark_mode ?? false),
          sound_enabled: key === 'sound_enabled' ? value : (appSettings?.sound_enabled ?? true),
          updated_at: new Date().toISOString(),
        });

      if (error) {
        // Revert local state on error
        setAppSettings(prev => prev ? { ...prev, [key]: !value } : {
          id: '',
          user_id: user.id,
          notifications_enabled: key === 'notifications_enabled' ? !value : true,
          dark_mode: key === 'dark_mode' ? !value : false,
          sound_enabled: key === 'sound_enabled' ? !value : true,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        });
        Alert.alert('Error', 'Failed to update setting. Please try again.');
      }
    } catch (error) {
      // Revert local state on error
      setAppSettings(prev => prev ? { ...prev, [key]: !value } : {
        id: '',
        user_id: user.id,
        notifications_enabled: key === 'notifications_enabled' ? !value : true,
        dark_mode: key === 'dark_mode' ? !value : false,
        sound_enabled: key === 'sound_enabled' ? !value : true,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      });
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
    <LinearGradient
      colors={['rgba(189, 189, 189, 0.3)', 'rgba(97, 97, 97, 0.35)']}
      start={[0, 0]}
      end={[1, 1]}
      style={{ flex: 1 }}
    >
      <SafeAreaView style={styles.safeArea}>
        <ScrollView 
          style={styles.content} 
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: 95 }}
          nestedScrollEnabled={false}
          removeClippedSubviews={false}
        >
          {/* Header */}
          <View style={styles.header}>
            <View style={styles.iconContainer}>
              <Ionicons name="settings-outline" size={32} color="#FFFFFF" />
              <View style={styles.sparkleIcon}>
                <Ionicons name="sparkles-outline" size={16} color="#64748B" />
              </View>
            </View>
            <Text style={styles.title}>Settings</Text>
            <Text style={styles.subtitle}>Customize your app experience</Text>
          </View>

          {/* Account Settings */}
          <View style={styles.settingsSection}>
            <Text style={styles.sectionTitle}>Account</Text>
            <View style={styles.settingsGroup}>
              <TouchableOpacity
                style={styles.settingItem}
                onPress={() => router.push('/profile')}
                accessibilityLabel="Profile Settings"
              >
                <View style={[styles.settingIcon, { backgroundColor: '#6366F1' }]}>
                  <Ionicons name="person-outline" size={20} color="#FFFFFF" />
                </View>
                <View style={styles.settingContent}>
                  <Text style={styles.settingTitle}>Profile Settings</Text>
                  <Text style={styles.settingDescription}>Edit your profile information</Text>
                </View>
                <Ionicons name="chevron-forward" size={20} color="#94A3B8" />
              </TouchableOpacity>
              
              {accountSettings.slice(1).map((setting, index) => (
                <TouchableOpacity
                  key={`account-${setting.id}-${index + 1}`}
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
            <Text style={styles.sectionTitle}>App Settings</Text>
            <View style={styles.settingsGroup}>
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
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  containerDark: {
    backgroundColor: '#0F172A',
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
    backgroundColor: '#64748B',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
    shadowColor: '#64748B',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 8,
  },
  iconContainerDark: {
    backgroundColor: '#475569',
    shadowColor: '#000',
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
  sparkleIconDark: {
    backgroundColor: '#1E293B',
  },
  title: {
    fontSize: 32,
    fontWeight: '800',
    color: '#6366F1',
    marginBottom: 8,
    textAlign: 'center',
  },
  titleDark: {
    color: '#A5B4FC',
  },
  subtitle: {
    fontSize: 16,
    color: '#64748B',
    textAlign: 'center',
  },
  subtitleDark: {
    color: '#94A3B8',
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
  settingsSection: {
    marginBottom: 32,
  },
  sectionTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#1E293B',
    marginBottom: 16,
  },
  sectionTitleDark: {
    color: '#F1F5F9',
  },
  settingsGroup: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.1,
    shadowRadius: 24,
    elevation: 8,
  },
  settingsGroupDark: {
    backgroundColor: '#1E293B',
    shadowColor: '#000',
    shadowOpacity: 0.3,
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingVertical: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  settingItemDark: {
    borderBottomColor: '#334155',
  },
  settingIcon: {
    width: 48,
    height: 48,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 20,
  },
  settingContent: {
    flex: 1,
  },
  settingTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1E293B',
    marginBottom: 4,
  },
  settingTitleDark: {
    color: '#F1F5F9',
  },
  settingDescription: {
    fontSize: 14,
    color: '#64748B',
  },
  settingDescriptionDark: {
    color: '#94A3B8',
  },
  signOutSection: {
    marginBottom: 32,
  },
  signOutButton: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 24,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.1,
    shadowRadius: 24,
    elevation: 8,
    borderWidth: 1,
    borderColor: '#FEE2E2',
  },
  signOutButtonDark: {
    backgroundColor: '#1E293B',
    borderColor: '#7F1D1D',
    shadowOpacity: 0.3,
  },
  signOutIcon: {
    width: 48,
    height: 48,
    borderRadius: 12,
    backgroundColor: '#FEE2E2',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 20,
  },
  signOutIconDark: {
    backgroundColor: '#7F1D1D',
  },
  signOutText: {
    flex: 1,
    fontSize: 18,
    fontWeight: '600',
    color: '#EF4444',
  },
  signOutTextDark: {
    color: '#F87171',
  },
});