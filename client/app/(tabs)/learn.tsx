import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  ScrollView,
  Alert,
  Modal,
  Image,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { supabase, LearningProgress } from '../../lib/supabase';
import { getLearningModuleData, updateLearningProgress, LearningModuleData } from '../../lib/api';

const learningModules = [
  {
    id: 'caricature',
    title: 'Caricature Training',
    description: 'Learn distinctive facial features through AI-enhanced caricatures',
    icon: 'brush-outline',
    color: '#6366F1',
    totalLessons: 10,
  },
  {
    id: 'spacing',
    title: 'Spacing Awareness',
    description: 'Practice recognizing faces with subtle geometric variations',
    icon: 'resize-outline',
    color: '#10B981',
    totalLessons: 12,
  },
  {
    id: 'trait-tagging',
    title: 'Trait Identification',
    description: 'AI-assisted facial trait recognition and memory reinforcement',
    icon: 'eye-outline',
    color: '#8B5CF6',
    totalLessons: 8,
  },
  {
    id: 'morph-matching',
    title: 'Morph Matching',
    description: 'Advanced face recognition through progressive morphing',
    icon: 'swap-horizontal-outline',
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
  const [showModuleModal, setShowModuleModal] = useState(false);
  const [currentModuleData, setCurrentModuleData] = useState<LearningModuleData | null>(null);
  const [currentModule, setCurrentModule] = useState<string>('');
  const [moduleLoading, setModuleLoading] = useState(false);
  const [exerciseStep, setExerciseStep] = useState(0);
  const [userAnswer, setUserAnswer] = useState<number | null>(null);
  const [showResults, setShowResults] = useState(false);

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
    const module = learningModules.find(m => m.id === moduleId);
    return progress || {
      progress_percentage: 0,
      completed_lessons: 0,
      total_lessons: module?.totalLessons || 0,
    };
  };

  const handleModulePress = async (moduleId: string) => {
    setCurrentModule(moduleId);
    setModuleLoading(true);
    setShowModuleModal(true);
    setExerciseStep(0);
    setUserAnswer(null);
    setShowResults(false);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const progress = getModuleProgress(moduleId);
      const difficultyLevel = Math.max(1, Math.floor(progress.progress_percentage / 20) + 1);

      const moduleData = await getLearningModuleData(moduleId, user.id, difficultyLevel);
      setCurrentModuleData(moduleData);
    } catch (error) {
      console.error('Error loading module:', error);
      Alert.alert('Error', 'Failed to load training module. Please try again.');
      setShowModuleModal(false);
    } finally {
      setModuleLoading(false);
    }
  };

  const handleAnswerSelect = (answerIndex: number) => {
    setUserAnswer(answerIndex);
  };

  const handleSubmitAnswer = async () => {
    if (!currentModuleData || userAnswer === null) return;

    const isCorrect = userAnswer === currentModuleData.data.correct_index;
    const accuracy = isCorrect ? 1.0 : 0.0;

    setShowResults(true);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // For demo purposes, we'll use a mock face_id
      // In a real implementation, this would come from the module data
      await updateLearningProgress(
        user.id,
        'mock-face-id',
        currentModule,
        accuracy,
        currentModuleData.next_difficulty
      );

      // Update local progress
      fetchLearningProgress();
    } catch (error) {
      console.error('Error updating progress:', error);
    }
  };

  const handleNextExercise = () => {
    setShowModuleModal(false);
    setCurrentModuleData(null);
    setExerciseStep(0);
    setUserAnswer(null);
    setShowResults(false);
  };

  const handleQuickPractice = async () => {
    // Start with a random module for quick practice
    const randomModule = learningModules[Math.floor(Math.random() * learningModules.length)];
    handleModulePress(randomModule.id);
  };

  const renderModuleExercise = () => {
    if (!currentModuleData || moduleLoading) {
      return (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#6366F1" />
          <Text style={styles.loadingText}>Loading exercise...</Text>
        </View>
      );
    }

    const { data } = currentModuleData;

    switch (currentModule) {
      case 'caricature':
        return (
          <View style={styles.exerciseContainer}>
            <Text style={styles.exerciseTitle}>Caricature Training</Text>
            <Text style={styles.exerciseDescription}>
              Study the highlighted features of this person
            </Text>
            
            {data.target_face && (
              <Image 
                source={{ uri: data.target_face }} 
                style={styles.exerciseImage}
                resizeMode="contain"
              />
            )}
            
            {data.traits && (
              <View style={styles.traitsContainer}>
                <Text style={styles.traitsTitle}>Key Features:</Text>
                {data.traits.map((trait, index) => (
                  <Text key={index} style={styles.traitItem}>• {trait}</Text>
                ))}
              </View>
            )}
          </View>
        );

      case 'spacing':
        return (
          <View style={styles.exerciseContainer}>
            <Text style={styles.exerciseTitle}>Spacing Recognition</Text>
            <Text style={styles.exerciseDescription}>
              Which face matches the target? Look carefully at facial proportions.
            </Text>
            
            {data.options && Array.isArray(data.options) && (
              <View style={styles.optionsContainer}>
                {data.options.map((option, index) => (
                  <TouchableOpacity
                    key={index}
                    style={[
                      styles.optionButton,
                      userAnswer === index && styles.selectedOption
                    ]}
                    onPress={() => handleAnswerSelect(index)}
                    disabled={showResults}
                  >
                    <Text style={styles.optionText}>Option {index + 1}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            )}
          </View>
        );

      case 'trait-tagging':
        return (
          <View style={styles.exerciseContainer}>
            <Text style={styles.exerciseTitle}>Trait Identification</Text>
            <Text style={styles.exerciseDescription}>
              What distinctive features do you notice in this face?
            </Text>
            
            {data.suggested_traits && (
              <View style={styles.traitsContainer}>
                <Text style={styles.traitsTitle}>AI Suggested Traits:</Text>
                {data.suggested_traits.map((trait, index) => (
                  <TouchableOpacity
                    key={index}
                    style={[
                      styles.traitButton,
                      userAnswer === index && styles.selectedTrait
                    ]}
                    onPress={() => handleAnswerSelect(index)}
                    disabled={showResults}
                  >
                    <Text style={styles.traitButtonText}>{trait}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            )}
          </View>
        );

      case 'morph-matching':
        return (
          <View style={styles.exerciseContainer}>
            <Text style={styles.exerciseTitle}>Morph Matching</Text>
            <Text style={styles.exerciseDescription}>
              This face is {data.morph_percentage}% morphed. Who is the primary person?
            </Text>
            
            {data.options && (
              <View style={styles.optionsContainer}>
                {data.options.map((option, index) => (
                  <TouchableOpacity
                    key={index}
                    style={[
                      styles.optionButton,
                      userAnswer === index && styles.selectedOption
                    ]}
                    onPress={() => handleAnswerSelect(index)}
                    disabled={showResults}
                  >
                    <Text style={styles.optionText}>{option}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            )}
          </View>
        );

      default:
        return (
          <View style={styles.exerciseContainer}>
            <Text style={styles.exerciseTitle}>Training Module</Text>
            <Text style={styles.exerciseDescription}>
              This training module is being prepared...
            </Text>
          </View>
        );
    }
  };

  return (
    <LinearGradient
      colors={['rgba(255, 195, 113, 0.3)', 'rgba(255, 95, 109, 0.35)']}
      start={[0, 0]}
      end={[1, 1]}
      style={{ flex: 1 }}
    >
      <SafeAreaView style={styles.safeArea}>
        <ScrollView 
          style={styles.content} 
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: 95 }}
        >
          {/* Header */}
          <View style={styles.header}>
            <View style={styles.iconContainer}>
              <Ionicons name="school-outline" size={32} color="#FFFFFF" />
              <View style={styles.sparkleIcon}>
                <Ionicons name="sparkles-outline" size={16} color="#A78BFA" />
              </View>
            </View>
            <Text style={styles.title}>AI Learning Center</Text>
            <Text style={styles.subtitle}>
              Improve face recognition with personalized AI training
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
              <Ionicons name="flash-outline" size={24} color="#FFFFFF" />
              <Text style={styles.quickPracticeText}>Quick AI Practice</Text>
            </TouchableOpacity>
          </View>

          {/* Learning Modules */}
          <View style={styles.modulesSection}>
            <Text style={styles.sectionTitle}>AI Training Modules</Text>
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

        {/* Training Module Modal */}
        <Modal
          visible={showModuleModal}
          transparent={true}
          animationType="slide"
          onRequestClose={() => setShowModuleModal(false)}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>AI Training Exercise</Text>
                <TouchableOpacity
                  onPress={() => setShowModuleModal(false)}
                  style={styles.closeButton}
                >
                  <Ionicons name="close" size={24} color="#64748B" />
                </TouchableOpacity>
              </View>

              <ScrollView style={styles.modalBody} showsVerticalScrollIndicator={false}>
                {renderModuleExercise()}
              </ScrollView>

              <View style={styles.modalFooter}>
                {!showResults ? (
                  <TouchableOpacity
                    style={[
                      styles.submitButton,
                      userAnswer === null && styles.submitButtonDisabled
                    ]}
                    onPress={handleSubmitAnswer}
                    disabled={userAnswer === null}
                  >
                    <Text style={styles.submitButtonText}>Submit Answer</Text>
                  </TouchableOpacity>
                ) : (
                  <View style={styles.resultsContainer}>
                    <View style={styles.resultHeader}>
                      <Ionicons 
                        name={userAnswer === currentModuleData?.data.correct_index ? "checkmark-circle" : "close-circle"} 
                        size={24} 
                        color={userAnswer === currentModuleData?.data.correct_index ? "#10B981" : "#EF4444"} 
                      />
                      <Text style={[
                        styles.resultText,
                        { color: userAnswer === currentModuleData?.data.correct_index ? "#10B981" : "#EF4444" }
                      ]}>
                        {userAnswer === currentModuleData?.data.correct_index ? "Correct!" : "Try Again"}
                      </Text>
                    </View>
                    <TouchableOpacity
                      style={styles.nextButton}
                      onPress={handleNextExercise}
                    >
                      <Text style={styles.nextButtonText}>Continue Training</Text>
                    </TouchableOpacity>
                  </View>
                )}
              </View>
            </View>
          </View>
        </Modal>
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
    backgroundColor: '#FF5F6D',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
    shadowColor: '#FF5F6D',
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
    color: '#FF5F6D',
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
    borderRadius: 20,
    padding: 24,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.1,
    shadowRadius: 24,
    elevation: 8,
  },
  progressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  progressTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1E293B',
  },
  progressPercentage: {
    fontSize: 28,
    fontWeight: '800',
    color: '#FF5F6D',
  },
  progressBar: {
    height: 8,
    backgroundColor: '#E2E8F0',
    borderRadius: 4,
    marginBottom: 12,
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#FF5F6D',
    borderRadius: 4,
  },
  progressText: {
    fontSize: 14,
    color: '#64748B',
  },
  quickPracticeButton: {
    backgroundColor: '#FF5F6D',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 18,
    borderRadius: 16,
    shadowColor: '#FF5F6D',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 8,
  },
  quickPracticeText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '600',
    marginLeft: 8,
  },
  modulesSection: {
    marginBottom: 32,
  },
  sectionTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#1E293B',
    marginBottom: 20,
  },
  moduleCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 24,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.1,
    shadowRadius: 24,
    elevation: 8,
  },
  moduleContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  moduleIcon: {
    width: 64,
    height: 64,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 4,
  },
  moduleInfo: {
    flex: 1,
  },
  moduleTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1E293B',
    marginBottom: 6,
  },
  moduleDescription: {
    fontSize: 14,
    color: '#64748B',
    marginBottom: 16,
    lineHeight: 20,
  },
  progressContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  progressStats: {
    fontSize: 12,
    color: '#64748B',
    marginRight: 12,
    minWidth: 70,
  },
  moduleProgressBar: {
    flex: 1,
    height: 6,
    backgroundColor: '#E2E8F0',
    borderRadius: 3,
    marginRight: 12,
  },
  moduleProgressFill: {
    height: '100%',
    borderRadius: 3,
  },
  achievementsSection: {
    marginBottom: 32,
  },
  achievementsHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  achievementsTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#1E293B',
    marginLeft: 8,
  },
  achievementsList: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.1,
    shadowRadius: 24,
    elevation: 8,
  },
  achievementItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  achievementItemLocked: {
    opacity: 0.6,
  },
  achievementIcon: {
    width: 48,
    height: 48,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  achievementContent: {
    flex: 1,
  },
  achievementTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1E293B',
    marginBottom: 4,
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
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    width: '90%',
    maxHeight: '80%',
    overflow: 'hidden',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 24,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1E293B',
  },
  closeButton: {
    padding: 4,
  },
  modalBody: {
    flex: 1,
    padding: 24,
  },
  modalFooter: {
    padding: 24,
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
  },
  loadingContainer: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  loadingText: {
    fontSize: 16,
    color: '#64748B',
    marginTop: 16,
  },
  exerciseContainer: {
    alignItems: 'center',
  },
  exerciseTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#1E293B',
    marginBottom: 12,
    textAlign: 'center',
  },
  exerciseDescription: {
    fontSize: 16,
    color: '#64748B',
    textAlign: 'center',
    marginBottom: 24,
    lineHeight: 24,
  },
  exerciseImage: {
    width: 200,
    height: 200,
    borderRadius: 16,
    marginBottom: 24,
  },
  traitsContainer: {
    width: '100%',
    marginBottom: 24,
  },
  traitsTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1E293B',
    marginBottom: 12,
  },
  traitItem: {
    fontSize: 16,
    color: '#64748B',
    marginBottom: 8,
    lineHeight: 24,
  },
  traitButton: {
    backgroundColor: '#F8FAFC',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 12,
    marginBottom: 8,
    borderWidth: 2,
    borderColor: '#E2E8F0',
  },
  selectedTrait: {
    backgroundColor: '#EEF2FF',
    borderColor: '#6366F1',
  },
  traitButtonText: {
    fontSize: 16,
    color: '#1E293B',
    textAlign: 'center',
  },
  optionsContainer: {
    width: '100%',
  },
  optionButton: {
    backgroundColor: '#F8FAFC',
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderRadius: 12,
    marginBottom: 12,
    borderWidth: 2,
    borderColor: '#E2E8F0',
  },
  selectedOption: {
    backgroundColor: '#EEF2FF',
    borderColor: '#6366F1',
  },
  optionText: {
    fontSize: 16,
    color: '#1E293B',
    textAlign: 'center',
    fontWeight: '500',
  },
  submitButton: {
    backgroundColor: '#6366F1',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  submitButtonDisabled: {
    backgroundColor: '#94A3B8',
  },
  submitButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  resultsContainer: {
    alignItems: 'center',
  },
  resultHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  resultText: {
    fontSize: 18,
    fontWeight: '600',
    marginLeft: 8,
  },
  nextButton: {
    backgroundColor: '#10B981',
    paddingVertical: 16,
    paddingHorizontal: 32,
    borderRadius: 12,
  },
  nextButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
});