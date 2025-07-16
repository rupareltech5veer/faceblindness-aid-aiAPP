import React, { useState } from 'react';
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

const userProfile = {
  name: 'John Doe',
  email: 'john.doe@email.com',
  membershipType: 'Premium Member',
};

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

const appSettings = [
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
  const [darkMode, setDarkMode] = useState(false);

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
          onPress: () => router.replace('/auth/signin'),
        },
      ]
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
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

        {/* User Profile */}
        <View style={styles.profileSection}>
          <View style={styles.profileCard}>
            <View style={styles.profileIcon}>
              <Ionicons name="person-outline" size={32} color="#FFFFFF" />
            </View>
            <View style={styles.profileInfo}>
              <View style={styles.profileNameRow}>
                <Ionicons name="star" size={16} color="#F59E0B" />
                <Text style={styles.profileName}>{userProfile.name}</Text>
              </View>
              <Text style={styles.profileEmail}>{userProfile.email}</Text>
              <View style={styles.membershipBadge}>
                <Text style={styles.membershipText}>{userProfile.membershipType}</Text>
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
            {appSettings.map((setting) => (
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
                value={darkMode}
                onValueChange={setDarkMode}
                trackColor={{ false: '#E2E8F0', true: '#A5B4FC' }}
                thumbColor={darkMode ? '#6366F1' : '#F1F5F9'}
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
    backgroundColor: '#F1F5F9',
  },
  scrollView: {
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
  },
  profileSection: {
    paddingHorizontal: 24,
    marginBottom: 32,
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
    paddingHorizontal: 24,
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
    paddingHorizontal: 24,
    marginTop: 16,
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