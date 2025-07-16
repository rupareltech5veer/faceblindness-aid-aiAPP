import React, { useState, useEffect } from 'react';
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
import { supabase, LearningProgress } from '../../lib/supabase';

const learningModules = [
  {
    id: 'memory-training',
    title: 'Memory Training',
    description: 'Practice remembering faces with guided exercises',
    icon: 'book-outline',
    color: '#6366F1',
    totalLessons: 8,
  },
  {
    id: 'face-quiz',
    title: 'Face Recognition Quiz',
    description: 'Test your ability to identify familiar faces',
    icon: 'target-outline',
    color: '#10B981',
    totalLessons: 12,
  },
  {
    id: 'facial-features',
    title: 'Facial Features Focus',
    description: 'Learn to identify unique facial characteristics',
    icon: 'eye-outline',
    color: '#8B5CF6',
    totalLessons: 10,
  },
  {
    id: 'practice-sessions',
    title: 'Daily Practice',
    description: 'Regular exercises to strengthen recognition skills',
    icon: 'fitness-outline',
    color: '#F97316',
    totalLessons: 15,
  },
];

const achievements = [
  {
    id: '7-day-streak',
    title: '7-Day Streak',
    description: 'Completed 7 days of practice',
    icon: 'trophy-outline',
    color: '#F59E0B',
    earned: true,
  },
  {
    id: 'quick-learner',
    title: 'Quick Learner',
    description: 'Finished first module',
    icon: 'star-outline',
    color: '#10B981',
    earned: true,
  },
  {
    id: 'memory-master',
    title: 'Memory Master',
    description: 'Mastered 5 techniques',
    icon: 'medal-outline',
    color: '#8B5CF6',
    earned: false,
  },
];

export default function LearnScreen() {
  const [learningProgress, setLearningProgress] = useState<LearningProgress[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchLearningProgress();
  }, []);

  const fetchLearningProgress = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from('learning_progress')
        .select('*')
        .eq('user_id', user.id);

      if (error) throw error;
      setLearningProgress(data || []);
    } catch (error) {
      console.error('Error fetching learning progress:', error);
    } finally {
      setLoading(false);
    }
  };

  const getModuleProgress = (moduleId: string) => {
    const progress = learningProgress.find(p => p.module_id === moduleId);
    return progress || {
      progress_percentage: 0,
      completed_lessons: 0,
      total_lessons: learningModules.find(m => m.id === moduleId)?.totalLessons || 0,
    };
  };

  const handleModulePress = async (moduleId: string) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // Update last accessed time
      const { error } = await supabase
        .from('learning_progress')
        .upsert({
          user_id: user.id,
          module_id: moduleId,
          last_accessed: new Date().toISOString(),
        });

      if (error) throw error;

      Alert.alert(
        'Learning Module',
        'Learning modules will be fully implemented in the next update.',
        [{ text: 'OK' }]
      );
    } catch (error) {
      console.error('Error updating progress:', error);
    }
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
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.logoContainer}>
          <Ionicons name="book" size={24} color="#6366F1" />
          <Text style={styles.logoText}>Learn</Text>
        </View>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Welcome Section */}
        <View style={styles.welcomeSection}>
          <View style={styles.iconContainer}>
            <Ionicons name="school-outline" size={32} color="#FFFFFF" />
            <View style={styles.sparkleIcon}>
              <Ionicons name="sparkles-outline" size={16} color="#A78BFA" />
            </View>
          </View>
          <Text style={styles.title}>Learning Center</Text>
          <Text style={styles.subtitle}>
            Improve your face recognition skills with interactive exercises
          </Text>
        </View>

        {/* Overall Progress */}
        <View style={styles.progressSection}>
          <View style={styles.progressCard}>
            <View style={styles.progressHeader}>
              <Text style={styles.progressTitle}>Overall Progress</Text>
              <Text style={styles.progressPercentage}>
                {Math.round(learningProgress.reduce((acc, p) => acc + p.progress_percentage, 0) / Math.max(learningProgress.length, 1))}%
              </Text>
            </View>
            <View style={styles.progressBar}>
              <View style={[
                styles.progressFill, 
                { width: `${Math.round(learningProgress.reduce((acc, p) => acc + p.progress_percentage, 0) / Math.max(learningProgress.length, 1))}%` }
              ]} />
            </View>
            <Text style={styles.progressText}>
              {learningProgress.reduce((acc, p) => acc + p.completed_lessons, 0)} of{' '}
              {learningModules.reduce((acc, m) => acc + m.totalLessons, 0)} lessons completed
            </Text>
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

        {/* Learning Modules */}
        <View style={styles.modulesSection}>
          <Text style={styles.sectionTitle}>Learning Modules</Text>
          {learningModules.map((module) => {
            const progress = getModuleProgress(module.id);
            return (
              <TouchableOpacity
                key={module.id}
                style={styles.moduleCard}
                onPress={() => handleModulePress(module.id)}
                accessibilityLabel={`${module.title}: ${module.description}`}
              >
                <View style={styles.moduleContent}>
                  <View style={[styles.moduleIcon, { backgroundColor: module.color }]}>
                    <Ionicons name={module.icon as any} size={28} color="#FFFFFF" />
                  </View>
                  
                  <View style={styles.moduleInfo}>
                    <Text style={styles.moduleTitle}>{module.title}</Text>
                    <Text style={styles.moduleDescription}>{module.description}</Text>
                    
                    <View style={styles.progressContainer}>
                      <Text style={styles.progressStats}>
                        {progress.completed_lessons}/{module.totalLessons} lessons
                      </Text>
                      <View style={styles.moduleProgressBar}>
                        <View 
                          style={[
                            styles.moduleProgressFill, 
                            { 
                              width: `${progress.progress_percentage}%`, 
                              backgroundColor: module.color 
                            }
                          ]} 
                        />
                      </View>
                      <Text style={styles.progressText}>{progress.progress_percentage}%</Text>
                    </View>
                  </View>

                  <Ionicons name="chevron-forward" size={20} color="#94A3B8" />
                </View>
              </TouchableOpacity>
            );
          })}
        </View>

        {/* Achievements */}
        <View style={styles.achievementsSection}>
          <View style={styles.achievementsHeader}>
            <Ionicons name="star-outline" size={20} color="#F59E0B" />
            <Text style={styles.achievementsTitle}>Achievements</Text>
          </View>
          
          <View style={styles.achievementsList}>
            {achievements.map((achievement) => (
              <View
                key={achievement.id}
                style={[
                  styles.achievementItem,
                  !achievement.earned && styles.achievementItemLocked
                ]}
              >
                <View style={[
                  styles.achievementIcon,
                  { backgroundColor: achievement.earned ? achievement.color : '#F1F5F9' }
                ]}>
                  <Ionicons 
                    name={achievement.icon as any} 
                    size={20} 
                    color={achievement.earned ? '#FFFFFF' : '#94A3B8'} 
                  />
                </View>
                <View style={styles.achievementContent}>
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
                </View>
                {achievement.earned && (
                  <Ionicons name="checkmark-circle" size={20} color="#10B981" />
                )}
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
  welcomeSection: {
    alignItems: 'center',
    paddingVertical: 32,
  },
  iconContainer: {
    position: 'relative',
    width: 80,
    height: 80,
    borderRadius: 20,
    backgroundColor: '#8B5CF6',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
    shadowColor: '#8B5CF6',
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
    fontSize: 28,
    fontWeight: '800',
    color: '#8B5CF6',
    marginBottom: 8,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    color: '#64748B',
    textAlign: 'center',
    lineHeight: 24,
    paddingHorizontal: 20,
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
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
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
    color: '#8B5CF6',
  },
  progressBar: {
    height: 8,
    backgroundColor: '#E2E8F0',
    borderRadius: 4,
    marginBottom: 8,
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#8B5CF6',
    borderRadius: 4,
  },
  progressText: {
    fontSize: 14,
    color: '#64748B',
  },
  quickPracticeButton: {
    backgroundColor: '#8B5CF6',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    borderRadius: 12,
    shadowColor: '#8B5CF6',
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
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  moduleContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  moduleIcon: {
    width: 56,
    height: 56,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  moduleInfo: {
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
    lineHeight: 20,
  },
  progressContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  progressStats: {
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
  achievementsSection: {
    marginBottom: 32,
  },
  achievementsHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  achievementsTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1E293B',
    marginLeft: 8,
  },
  achievementsList: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  achievementItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  achievementItemLocked: {
    opacity: 0.6,
  },
  achievementIcon: {
    width: 40,
    height: 40,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  achievementContent: {
    flex: 1,
  },
  achievementTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1E293B',
    marginBottom: 2,
  },
  achievementTitleLocked: {
    color: '#94A3B8',
  },
  achievementDescription: {
    fontSize: 14,
    color: '#64748B',
  },
  achievementDescriptionLocked: {
    color: '#CBD5E1',
  },
});