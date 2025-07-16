import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  ScrollView,
  Dimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';

const { width } = Dimensions.get('window');

const dashboardItems = [
  {
    id: 'scanner',
    title: 'Photo Scanner',
    description: 'Capture and analyze faces with AI assistance',
    icon: 'scan-outline',
    color: '#4F46E5',
    backgroundColor: '#EEF2FF',
    route: '/upload',
  },
  {
    id: 'contacts',
    title: 'Contacts',
    description: 'Manage your personal face directory',
    icon: 'people-outline',
    color: '#059669',
    backgroundColor: '#ECFDF5',
    route: '/directory',
  },
  {
    id: 'learning',
    title: 'Learning',
    description: 'Practice and improve recognition skills',
    icon: 'school-outline',
    color: '#DC2626',
    backgroundColor: '#FEF2F2',
    route: '/learning',
  },
  {
    id: 'settings',
    title: 'Settings',
    description: 'Customize your app preferences',
    icon: 'settings-outline',
    color: '#7C3AED',
    backgroundColor: '#F3E8FF',
    route: '/settings',
  },
];

export default function DashboardScreen() {
  const handleItemPress = (route: string) => {
    router.push(route as any);
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <View style={styles.welcomeSection}>
            <Text style={styles.welcomeText}>Welcome back!</Text>
            <Text style={styles.subtitleText}>What would you like to do today?</Text>
          </View>
          
          <TouchableOpacity 
            style={styles.profileButton}
            onPress={() => router.push('/settings')}
            accessibilityLabel="Open profile settings"
          >
            <Ionicons name="person-circle-outline" size={32} color="#64748B" />
          </TouchableOpacity>
        </View>

        <View style={styles.quickStats}>
          <View style={styles.statCard}>
            <Text style={styles.statNumber}>12</Text>
            <Text style={styles.statLabel}>Faces Saved</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statNumber}>85%</Text>
            <Text style={styles.statLabel}>Recognition Rate</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statNumber}>7</Text>
            <Text style={styles.statLabel}>Days Streak</Text>
          </View>
        </View>

        <View style={styles.mainActions}>
          <Text style={styles.sectionTitle}>Main Features</Text>
          <View style={styles.actionsGrid}>
            {dashboardItems.map((item) => (
              <TouchableOpacity
                key={item.id}
                style={styles.actionCard}
                onPress={() => handleItemPress(item.route)}
                accessibilityLabel={`${item.title}: ${item.description}`}
              >
                <View style={[styles.actionIcon, { backgroundColor: item.backgroundColor }]}>
                  <Ionicons name={item.icon as any} size={32} color={item.color} />
                </View>
                <Text style={styles.actionTitle}>{item.title}</Text>
                <Text style={styles.actionDescription}>{item.description}</Text>
                <View style={styles.actionArrow}>
                  <Ionicons name="chevron-forward" size={20} color="#94A3B8" />
                </View>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <View style={styles.recentActivity}>
          <Text style={styles.sectionTitle}>Recent Activity</Text>
          <View style={styles.activityCard}>
            <View style={styles.activityIcon}>
              <Ionicons name="camera-outline" size={24} color="#4F46E5" />
            </View>
            <View style={styles.activityContent}>
              <Text style={styles.activityTitle}>Photo uploaded</Text>
              <Text style={styles.activityDescription}>Added Sarah to your directory</Text>
              <Text style={styles.activityTime}>2 hours ago</Text>
            </View>
          </View>
          
          <View style={styles.activityCard}>
            <View style={styles.activityIcon}>
              <Ionicons name="trophy-outline" size={24} color="#059669" />
            </View>
            <View style={styles.activityContent}>
              <Text style={styles.activityTitle}>Practice completed</Text>
              <Text style={styles.activityDescription}>Finished recognition exercise</Text>
              <Text style={styles.activityTime}>Yesterday</Text>
            </View>
          </View>
        </View>

        <View style={styles.helpSection}>
          <TouchableOpacity 
            style={styles.helpCard}
            onPress={() => router.push('/help')}
            accessibilityLabel="Get help and support"
          >
            <Ionicons name="help-circle-outline" size={24} color="#4F46E5" />
            <Text style={styles.helpText}>Need help? Tap here for support</Text>
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
  content: {
    paddingHorizontal: 24,
    paddingBottom: 32,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 20,
    paddingBottom: 24,
  },
  welcomeSection: {
    flex: 1,
  },
  welcomeText: {
    fontSize: 24,
    fontWeight: '800',
    color: '#1E293B',
    marginBottom: 4,
  },
  subtitleText: {
    fontSize: 16,
    color: '#64748B',
  },
  profileButton: {
    padding: 8,
  },
  quickStats: {
    flexDirection: 'row',
    marginBottom: 32,
    gap: 12,
  },
  statCard: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  statNumber: {
    fontSize: 24,
    fontWeight: '800',
    color: '#1E293B',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: '#64748B',
    textAlign: 'center',
  },
  mainActions: {
    marginBottom: 32,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1E293B',
    marginBottom: 16,
  },
  actionsGrid: {
    gap: 16,
  },
  actionCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
    borderWidth: 1,
    borderColor: '#F1F5F9',
  },
  actionIcon: {
    width: 64,
    height: 64,
    borderRadius: 32,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  actionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1E293B',
    marginBottom: 8,
  },
  actionDescription: {
    fontSize: 14,
    color: '#64748B',
    lineHeight: 20,
    marginBottom: 12,
  },
  actionArrow: {
    position: 'absolute',
    top: 20,
    right: 20,
  },
  recentActivity: {
    marginBottom: 32,
  },
  activityCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  activityIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#F1F5F9',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  activityContent: {
    flex: 1,
  },
  activityTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1E293B',
    marginBottom: 4,
  },
  activityDescription: {
    fontSize: 14,
    color: '#64748B',
    marginBottom: 4,
  },
  activityTime: {
    fontSize: 12,
    color: '#94A3B8',
  },
  helpSection: {
    marginTop: 16,
  },
  helpCard: {
    backgroundColor: '#EEF2FF',
    borderRadius: 12,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E0E7FF',
  },
  helpText: {
    flex: 1,
    fontSize: 16,
    color: '#4F46E5',
    fontWeight: '500',
    marginLeft: 12,
  },
});