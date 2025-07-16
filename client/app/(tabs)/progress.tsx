import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const progressStats = [
  {
    id: 'faces-learned',
    title: 'Faces Learned',
    value: '127',
    change: '+12',
    icon: 'trending-up-outline',
    iconColor: '#6366F1',
  },
  {
    id: 'recognition-rate',
    title: 'Recognition Rate',
    value: '78%',
    change: '+5%',
    icon: 'trending-up-outline',
    iconColor: '#10B981',
  },
  {
    id: 'study-streak',
    title: 'Study Streak',
    value: '7 days',
    change: 'New!',
    icon: 'trending-up-outline',
    iconColor: '#8B5CF6',
  },
  {
    id: 'quiz-average',
    title: 'Quiz Average',
    value: '85%',
    change: '+8%',
    icon: 'trending-up-outline',
    iconColor: '#F97316',
  },
];

const weeklyProgress = [
  { day: 'Mon', label: 'M', progress: 20 },
  { day: 'Tue', label: 'T', progress: 40 },
  { day: 'Wed', label: 'W', progress: 60 },
  { day: 'Thu', label: 'T', progress: 80 },
  { day: 'Fri', label: 'F', progress: 90 },
  { day: 'Sat', label: 'S', progress: 70 },
  { day: 'Sun', label: 'S', progress: 95 },
];

export default function ProgressScreen() {
  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.iconContainer}>
            <Ionicons name="bar-chart-outline" size={32} color="#FFFFFF" />
            <View style={styles.sparkleIcon}>
              <Ionicons name="trophy-outline" size={16} color="#F97316" />
            </View>
          </View>
          <Text style={styles.title}>Your Progress</Text>
          <Text style={styles.subtitle}>
            Track your face recognition improvement over time
          </Text>
        </View>

        {/* Progress Stats Grid */}
        <View style={styles.statsGrid}>
          {progressStats.map((stat) => (
            <View key={stat.id} style={styles.statCard}>
              <View style={styles.statHeader}>
                <Text style={styles.statTitle}>{stat.title}</Text>
                <View style={[styles.statIcon, { backgroundColor: stat.iconColor }]}>
                  <Ionicons name={stat.icon as any} size={16} color="#FFFFFF" />
                </View>
              </View>
              
              <View style={styles.statContent}>
                <Text style={styles.statValue}>{stat.value}</Text>
                <Text style={[
                  styles.statChange,
                  stat.change === 'New!' ? styles.statChangeNew : styles.statChangePositive
                ]}>
                  {stat.change}
                </Text>
              </View>
            </View>
          ))}
        </View>

        {/* Weekly Progress */}
        <View style={styles.weeklySection}>
          <View style={styles.weeklySectionHeader}>
            <Ionicons name="sparkles-outline" size={20} color="#F97316" />
            <Text style={styles.weeklySectionTitle}>Weekly Progress</Text>
          </View>
          
          <View style={styles.weeklyChart}>
            {weeklyProgress.map((day, index) => (
              <View key={index} style={styles.dayColumn}>
                <View style={styles.dayLabel}>
                  <Text style={styles.dayLabelText}>{day.label}</Text>
                </View>
                <Text style={styles.dayName}>{day.day}</Text>
                <View style={styles.progressBarContainer}>
                  <View style={styles.progressBarBackground}>
                    <View 
                      style={[
                        styles.progressBarFill, 
                        { height: `${day.progress}%` }
                      ]} 
                    />
                  </View>
                </View>
                <Text style={styles.progressPercentage}>{day.progress}%</Text>
              </View>
            ))}
          </View>
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
    backgroundColor: '#F97316',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
    shadowColor: '#F97316',
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
    color: '#F97316',
    marginBottom: 8,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    color: '#64748B',
    textAlign: 'center',
    lineHeight: 24,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: 24,
    marginBottom: 32,
    gap: 16,
  },
  statCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    width: '47%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  statHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  statTitle: {
    fontSize: 14,
    color: '#64748B',
    fontWeight: '500',
    flex: 1,
  },
  statIcon: {
    width: 24,
    height: 24,
    borderRadius: 6,
    justifyContent: 'center',
    alignItems: 'center',
  },
  statContent: {
    flexDirection: 'row',
    alignItems: 'baseline',
    justifyContent: 'space-between',
  },
  statValue: {
    fontSize: 24,
    fontWeight: '800',
    color: '#1E293B',
  },
  statChange: {
    fontSize: 14,
    fontWeight: '600',
  },
  statChangePositive: {
    color: '#10B981',
  },
  statChangeNew: {
    color: '#8B5CF6',
  },
  weeklySection: {
    paddingHorizontal: 24,
    marginBottom: 32,
  },
  weeklySectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  weeklySectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1E293B',
    marginLeft: 8,
  },
  weeklyChart: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 24,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 4,
  },
  dayColumn: {
    alignItems: 'center',
    flex: 1,
  },
  dayLabel: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#F97316',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  dayLabelText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
  dayName: {
    fontSize: 12,
    color: '#64748B',
    marginBottom: 12,
  },
  progressBarContainer: {
    height: 120,
    justifyContent: 'flex-end',
    marginBottom: 8,
  },
  progressBarBackground: {
    width: 20,
    height: 100,
    backgroundColor: '#E2E8F0',
    borderRadius: 10,
    justifyContent: 'flex-end',
    overflow: 'hidden',
  },
  progressBarFill: {
    width: '100%',
    backgroundColor: '#F97316',
    borderRadius: 10,
  },
  progressPercentage: {
    fontSize: 12,
    fontWeight: '600',
    color: '#64748B',
  },
});