import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  ScrollView,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const learningModules = [
  {
    id: 'basics',
    title: 'Face Recognition Basics',
    description: 'Learn fundamental techniques for remembering faces',
    icon: 'school-outline',
    color: '#4F46E5',
    backgroundColor: '#EEF2FF',
    progress: 75,
    lessons: 8,
    completed: 6,
  },
  {
    id: 'memory',
    title: 'Memory Techniques',
    description: 'Advanced strategies for facial memory improvement',
    icon: 'bulb-outline',
    color: '#059669',
    backgroundColor: '#ECFDF5',
    progress: 45,
    lessons: 12,
    completed: 5,
  },
  {
    id: 'practice',
    title: 'Daily Practice',
    description: 'Regular exercises to strengthen recognition skills',
    icon: 'fitness-outline',
    color: '#DC2626',
    backgroundColor: '#FEF2F2',
    progress: 90,
    lessons: 15,
    completed: 13,
  },
  {
    id: 'advanced',
    title: 'Advanced Techniques',
    description: 'Professional methods for complex recognition challenges',
    icon: 'trophy-outline',
    color: '#7C3AED',
    backgroundColor: '#F3E8FF',
    progress: 20,
    lessons: 10,
    completed: 2,
  },
];

const achievements = [
  {
    id: 'first_week',
    title: 'First Week Complete',
    description: 'Completed 7 days of practice',
    icon: 'calendar-outline',
    earned: true,
  },
  {
    id: 'memory_master',
    title: 'Memory Master',
    description: 'Mastered 5 memory techniques',
    icon: 'medal-outline',
    earned: true,
  },
  {
    id: 'streak_champion',
    title: 'Streak Champion',
    description: 'Maintained 30-day practice streak',
    icon: 'flame-outline',
    earned: false,
  },
];

export default function LearningScreen() {
  const [selectedModule, setSelectedModule] = useState<string | null>(null);

  const handleModulePress = (moduleId: string) => {
    Alert.alert(
      'Start Learning',
      'This learning module will be available in the next update.',
      [{ text: 'OK' }]
    );
  };

  const handleQuickPractice = () => {
    Alert.alert(
      'Quick Practice',
      'Practice session will be available in the next update.',
      [{ text: 'OK' }]
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <Text style={styles.title}>Learning Center</Text>
          <Text style={styles.subtitle}>Improve your face recognition skills</Text>
        </View>

        <View style={styles.progressSection}>
          <View style={styles.progressCard}>
            <View style={styles.progressHeader}>
              <Text style={styles.progressTitle}>Overall Progress</Text>
              <Text style={styles.progressPercentage}>58%</Text>
            </View>
            <View style={styles.progressBar}>
              <View style={[styles.progressFill, { width: '58%' }]} />
            </View>
            <Text style={styles.progressText}>26 of 45 lessons completed</Text>
          </View>

          <TouchableOpacity 
            style={styles.quickPracticeButton}
            onPress={handleQuickPractice}
            accessibilityLabel="Start quick practice session"
          >
            <Ionicons name="play-circle-outline" size={24} color="#FFFFFF" />
            <Text style={styles.quickPracticeText}>Quick Practice</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.modulesSection}>
          <Text style={styles.sectionTitle}>Learning Modules</Text>
          {learningModules.map((module) => (
            <TouchableOpacity
              key={module.id}
              style={styles.moduleCard}
              onPress={() => handleModulePress(module.id)}
              accessibilityLabel={`${module.title}: ${module.description}`}
            >
              <View style={[styles.moduleIcon, { backgroundColor: module.backgroundColor }]}>
                <Ionicons name={module.icon as any} size={32} color={module.color} />
              </View>
              
              <View style={styles.moduleContent}>
                <Text style={styles.moduleTitle}>{module.title}</Text>
                <Text style={styles.moduleDescription}>{module.description}</Text>
                
                <View style={styles.moduleStats}>
                  <Text style={styles.moduleStatsText}>
                    {module.completed}/{module.lessons} lessons
                  </Text>
                  <View style={styles.moduleProgressBar}>
                    <View 
                      style={[
                        styles.moduleProgressFill, 
                        { width: `${module.progress}%`, backgroundColor: module.color }
                      ]} 
                    />
                  </View>
                  <Text style={styles.moduleProgressText}>{module.progress}%</Text>
                </View>
              </View>

              <Ionicons name="chevron-forward" size={20} color="#94A3B8" />
            </TouchableOpacity>
          ))}
        </View>

        <View style={styles.achievementsSection}>
          <Text style={styles.sectionTitle}>Achievements</Text>
          <View style={styles.achievementsGrid}>
            {achievements.map((achievement) => (
              <View
                key={achievement.id}
                style={[
                  styles.achievementCard,
                  !achievement.earned && styles.achievementCardLocked
                ]}
              >
                <View style={[
                  styles.achievementIcon,
                  achievement.earned ? styles.achievementIconEarned : styles.achievementIconLocked
                ]}>
                  <Ionicons 
                    name={achievement.icon as any} 
                    size={24} 
                    color={achievement.earned ? '#F59E0B' : '#94A3B8'} 
                  />
                </View>
                <Text style={[
                  styles.achievementTitle,
                  !achievement.earned && styles.achievementTitleLocked
                ]}>
                  {achievement.title}
                </Text>
                <Text style={[
                  styles.achievementDescription,
                  !achievement.earned && styles.achievementDescriptionLocked
                ]}>
                  {achievement.description}
                </Text>
                {achievement.earned && (
                  <View style={styles.earnedBadge}>
                    <Ionicons name="checkmark-circle" size={16} color="#10B981" />
                  </View>
                )}
              </View>
            ))}
          </View>
        </View>

        <View style={styles.tipsSection}>
          <Text style={styles.sectionTitle}>Today's Tip</Text>
          <View style={styles.tipCard}>
            <View style={styles.tipIcon}>
              <Ionicons name="lightbulb-outline" size={24} color="#F59E0B" />
            </View>
            <View style={styles.tipContent}>
              <Text style={styles.tipTitle}>Focus on Distinctive Features</Text>
              <Text style={styles.tipText}>
                When meeting someone new, identify 2-3 unique facial features like eye shape, 
                nose structure, or smile characteristics. This creates stronger memory anchors.
              </Text>
            </View>
          </View>
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
  progressSection: {
    marginBottom: 32,
  },
  progressCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  progressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  progressTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1E293B',
  },
  progressPercentage: {
    fontSize: 24,
    fontWeight: '800',
    color: '#4F46E5',
  },
  progressBar: {
    height: 8,
    backgroundColor: '#E2E8F0',
    borderRadius: 4,
    marginBottom: 8,
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#4F46E5',
    borderRadius: 4,
  },
  progressText: {
    fontSize: 14,
    color: '#64748B',
  },
  quickPracticeButton: {
    backgroundColor: '#4F46E5',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    borderRadius: 12,
    shadowColor: '#4F46E5',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  quickPracticeText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  modulesSection: {
    marginBottom: 32,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1E293B',
    marginBottom: 16,
  },
  moduleCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  moduleIcon: {
    width: 64,
    height: 64,
    borderRadius: 32,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  moduleContent: {
    flex: 1,
  },
  moduleTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1E293B',
    marginBottom: 4,
  },
  moduleDescription: {
    fontSize: 14,
    color: '#64748B',
    marginBottom: 12,
  },
  moduleStats: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  moduleStatsText: {
    fontSize: 12,
    color: '#64748B',
    marginRight: 8,
    minWidth: 60,
  },
  moduleProgressBar: {
    flex: 1,
    height: 4,
    backgroundColor: '#E2E8F0',
    borderRadius: 2,
    marginRight: 8,
  },
  moduleProgressFill: {
    height: '100%',
    borderRadius: 2,
  },
  moduleProgressText: {
    fontSize: 12,
    color: '#64748B',
    minWidth: 30,
  },
  achievementsSection: {
    marginBottom: 32,
  },
  achievementsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  achievementCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    width: '48%',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
    position: 'relative',
  },
  achievementCardLocked: {
    backgroundColor: '#F8FAFC',
  },
  achievementIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  achievementIconEarned: {
    backgroundColor: '#FEF3C7',
  },
  achievementIconLocked: {
    backgroundColor: '#F1F5F9',
  },
  achievementTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1E293B',
    textAlign: 'center',
    marginBottom: 4,
  },
  achievementTitleLocked: {
    color: '#94A3B8',
  },
  achievementDescription: {
    fontSize: 12,
    color: '#64748B',
    textAlign: 'center',
    lineHeight: 16,
  },
  achievementDescriptionLocked: {
    color: '#CBD5E1',
  },
  earnedBadge: {
    position: 'absolute',
    top: 8,
    right: 8,
  },
  tipsSection: {
    marginBottom: 16,
  },
  tipCard: {
    backgroundColor: '#FFFBEB',
    borderRadius: 12,
    padding: 16,
    flexDirection: 'row',
    borderWidth: 1,
    borderColor: '#FDE68A',
  },
  tipIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#FEF3C7',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  tipContent: {
    flex: 1,
  },
  tipTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#92400E',
    marginBottom: 4,
  },
  tipText: {
    fontSize: 14,
    color: '#A16207',
    lineHeight: 20,
  },
});