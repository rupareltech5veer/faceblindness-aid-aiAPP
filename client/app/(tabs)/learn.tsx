import React from 'react';
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
    id: 'memory-training',
    title: 'Memory Training',
    description: 'Practice remembering faces with guided exercises',
    icon: 'book-outline',
    color: '#6366F1',
    progress: 65,
  },
  {
    id: 'face-quiz',
    title: 'Face Recognition Quiz',
    description: 'Test your ability to identify familiar faces',
    icon: 'target-outline',
    color: '#10B981',
    progress: 78,
  },
  {
    id: 'facial-features',
    title: 'Facial Features Focus',
    description: 'Learn to identify unique facial characteristics',
    icon: 'play-outline',
    color: '#8B5CF6',
    progress: 45,
  },
];

const achievements = [
  {
    id: '7-day-streak',
    title: '7-Day Streak',
    icon: 'trophy-outline',
    color: '#F59E0B',
  },
  {
    id: 'quick-learner',
    title: 'Quick Learner',
    icon: 'target-outline',
    color: '#10B981',
  },
];

export default function LearnScreen() {
  const handleModulePress = (moduleId: string) => {
    Alert.alert(
      'Learning Module',
      'Learning modules will be available in the next update.',
      [{ text: 'OK' }]
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
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

        {/* Learning Modules */}
        <View style={styles.modulesContainer}>
          {learningModules.map((module) => (
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
                    <View style={styles.progressBar}>
                      <View 
                        style={[
                          styles.progressFill, 
                          { width: `${module.progress}%`, backgroundColor: module.color }
                        ]} 
                      />
                    </View>
                    <Text style={styles.progressText}>{module.progress}%</Text>
                  </View>
                </View>

                <Ionicons name="chevron-forward" size={20} color="#94A3B8" />
              </View>
            </TouchableOpacity>
          ))}
        </View>

        {/* Recent Achievements */}
        <View style={styles.achievementsSection}>
          <View style={styles.achievementsHeader}>
            <Ionicons name="star-outline" size={20} color="#F59E0B" />
            <Text style={styles.achievementsTitle}>Recent Achievements</Text>
          </View>
          
          <View style={styles.achievementsList}>
            {achievements.map((achievement) => (
              <View key={achievement.id} style={styles.achievementItem}>
                <View style={[styles.achievementIcon, { backgroundColor: achievement.color }]}>
                  <Ionicons name={achievement.icon as any} size={20} color="#FFFFFF" />
                </View>
                <Text style={styles.achievementTitle}>{achievement.title}</Text>
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
    fontSize: 32,
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
  modulesContainer: {
    paddingHorizontal: 24,
    marginBottom: 32,
  },
  moduleCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 20,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 4,
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
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
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
  progressBar: {
    flex: 1,
    height: 6,
    backgroundColor: '#E2E8F0',
    borderRadius: 3,
    marginRight: 12,
  },
  progressFill: {
    height: '100%',
    borderRadius: 3,
  },
  progressText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#64748B',
    minWidth: 35,
  },
  achievementsSection: {
    paddingHorizontal: 24,
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
  achievementIcon: {
    width: 40,
    height: 40,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  achievementTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1E293B',
  },
});