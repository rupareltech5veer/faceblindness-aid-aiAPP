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

const settingsGroups = [
  {
    title: 'Accessibility',
    items: [
      {
        id: 'high_contrast',
        title: 'High Contrast Mode',
        description: 'Enhance visual contrast for better readability',
        type: 'toggle',
        icon: 'contrast-outline',
        value: false,
      },
      {
        id: 'large_text',
        title: 'Large Text',
        description: 'Increase font size throughout the app',
        type: 'toggle',
        icon: 'text-outline',
        value: false,
      },
      {
        id: 'voice_guidance',
        title: 'Voice Guidance',
        description: 'Enable audio instructions and feedback',
        type: 'toggle',
        icon: 'volume-high-outline',
        value: true,
      },
      {
        id: 'haptic_feedback',
        title: 'Haptic Feedback',
        description: 'Vibration feedback for interactions',
        type: 'toggle',
        icon: 'phone-portrait-outline',
        value: true,
      },
    ],
  },
  {
    title: 'Recognition Settings',
    items: [
      {
        id: 'auto_analysis',
        title: 'Auto Analysis',
        description: 'Automatically analyze uploaded photos',
        type: 'toggle',
        icon: 'scan-outline',
        value: true,
      },
      {
        id: 'detailed_descriptions',
        title: 'Detailed Descriptions',
        description: 'Generate comprehensive facial descriptions',
        type: 'toggle',
        icon: 'list-outline',
        value: true,
      },
      {
        id: 'memory_aids',
        title: 'Memory Aids',
        description: 'Create custom mnemonics for each face',
        type: 'toggle',
        icon: 'bulb-outline',
        value: true,
      },
    ],
  },
  {
    title: 'Privacy & Security',
    items: [
      {
        id: 'local_storage',
        title: 'Local Storage Only',
        description: 'Keep all data on your device',
        type: 'toggle',
        icon: 'shield-checkmark-outline',
        value: true,
      },
      {
        id: 'biometric_lock',
        title: 'Biometric Lock',
        description: 'Require fingerprint or face ID to open app',
        type: 'toggle',
        icon: 'finger-print-outline',
        value: false,
      },
      {
        id: 'data_encryption',
        title: 'Data Encryption',
        description: 'Encrypt stored photos and data',
        type: 'toggle',
        icon: 'lock-closed-outline',
        value: true,
      },
    ],
  },
  {
    title: 'Learning & Practice',
    items: [
      {
        id: 'daily_reminders',
        title: 'Daily Practice Reminders',
        description: 'Get notified to practice face recognition',
        type: 'toggle',
        icon: 'notifications-outline',
        value: true,
      },
      {
        id: 'adaptive_difficulty',
        title: 'Adaptive Difficulty',
        description: 'Adjust exercise difficulty based on progress',
        type: 'toggle',
        icon: 'trending-up-outline',
        value: true,
      },
    ],
  },
];

const accountItems = [
  {
    id: 'profile',
    title: 'Profile Settings',
    description: 'Manage your account information',
    icon: 'person-outline',
    action: 'navigate',
  },
  {
    id: 'export_data',
    title: 'Export Data',
    description: 'Download your face directory and settings',
    icon: 'download-outline',
    action: 'function',
  },
  {
    id: 'help_support',
    title: 'Help & Support',
    description: 'Get help and contact support',
    icon: 'help-circle-outline',
    action: 'navigate',
  },
  {
    id: 'about',
    title: 'About FaceAssist',
    description: 'App version and information',
    icon: 'information-circle-outline',
    action: 'navigate',
  },
];

export default function SettingsScreen() {
  const [settings, setSettings] = useState<Record<string, boolean>>({
    high_contrast: false,
    large_text: false,
    voice_guidance: true,
    haptic_feedback: true,
    auto_analysis: true,
    detailed_descriptions: true,
    memory_aids: true,
    local_storage: true,
    biometric_lock: false,
    data_encryption: true,
    daily_reminders: true,
    adaptive_difficulty: true,
  });

  const handleToggle = (settingId: string) => {
    setSettings(prev => ({
      ...prev,
      [settingId]: !prev[settingId],
    }));
  };

  const handleAccountAction = (itemId: string) => {
    switch (itemId) {
      case 'export_data':
        Alert.alert(
          'Export Data',
          'This feature will be available in the next update.',
          [{ text: 'OK' }]
        );
        break;
      case 'profile':
      case 'help_support':
      case 'about':
        Alert.alert(
          'Coming Soon',
          'This feature will be available in the next update.',
          [{ text: 'OK' }]
        );
        break;
    }
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
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <Text style={styles.title}>Settings</Text>
          <Text style={styles.subtitle}>Customize your FaceAssist experience</Text>
        </View>

        {settingsGroups.map((group, groupIndex) => (
          <View key={groupIndex} style={styles.settingsGroup}>
            <Text style={styles.groupTitle}>{group.title}</Text>
            {group.items.map((item) => (
              <View key={item.id} style={styles.settingItem}>
                <View style={styles.settingIcon}>
                  <Ionicons name={item.icon as any} size={24} color="#4F46E5" />
                </View>
                <View style={styles.settingContent}>
                  <Text style={styles.settingTitle}>{item.title}</Text>
                  <Text style={styles.settingDescription}>{item.description}</Text>
                </View>
                <Switch
                  value={settings[item.id]}
                  onValueChange={() => handleToggle(item.id)}
                  trackColor={{ false: '#E2E8F0', true: '#A5B4FC' }}
                  thumbColor={settings[item.id] ? '#4F46E5' : '#F1F5F9'}
                  accessibilityLabel={`Toggle ${item.title}`}
                />
              </View>
            ))}
          </View>
        ))}

        <View style={styles.settingsGroup}>
          <Text style={styles.groupTitle}>Account</Text>
          {accountItems.map((item) => (
            <TouchableOpacity
              key={item.id}
              style={styles.accountItem}
              onPress={() => handleAccountAction(item.id)}
              accessibilityLabel={item.title}
            >
              <View style={styles.settingIcon}>
                <Ionicons name={item.icon as any} size={24} color="#4F46E5" />
              </View>
              <View style={styles.settingContent}>
                <Text style={styles.settingTitle}>{item.title}</Text>
                <Text style={styles.settingDescription}>{item.description}</Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color="#94A3B8" />
            </TouchableOpacity>
          ))}
        </View>

        <View style={styles.dangerZone}>
          <TouchableOpacity
            style={styles.signOutButton}
            onPress={handleSignOut}
            accessibilityLabel="Sign out of your account"
          >
            <Ionicons name="log-out-outline" size={20} color="#DC2626" />
            <Text style={styles.signOutText}>Sign Out</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.footer}>
          <Text style={styles.versionText}>FaceAssist v1.0.0</Text>
          <Text style={styles.copyrightText}>
            Designed for individuals with prosopagnosia
          </Text>
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
  content: {
    paddingHorizontal: 24,
    paddingBottom: 32,
  },
  header: {
    paddingTop: 20,
    paddingBottom: 24,
    alignItems: 'center',
  },
  title: {
    fontSize: 28,
    fontWeight: '800',
    color: '#1E293B',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#64748B',
    textAlign: 'center',
  },
  settingsGroup: {
    marginBottom: 32,
  },
  groupTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1E293B',
    marginBottom: 16,
  },
  settingItem: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 8,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  accountItem: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 8,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  settingIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#EEF2FF',
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
    marginBottom: 4,
  },
  settingDescription: {
    fontSize: 14,
    color: '#64748B',
    lineHeight: 20,
  },
  dangerZone: {
    marginTop: 16,
    marginBottom: 32,
  },
  signOutButton: {
    backgroundColor: '#FEF2F2',
    borderRadius: 12,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#FECACA',
  },
  signOutText: {
    color: '#DC2626',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  footer: {
    alignItems: 'center',
    paddingTop: 16,
  },
  versionText: {
    fontSize: 14,
    color: '#94A3B8',
    marginBottom: 4,
  },
  copyrightText: {
    fontSize: 12,
    color: '#CBD5E1',
    textAlign: 'center',
    fontStyle: 'italic',
  },
});