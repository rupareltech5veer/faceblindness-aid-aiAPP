// API functions for Memora AI backend integration
import { supabase } from './supabase';

const BACKEND_URL = process.env.EXPO_PUBLIC_BACKEND_URL || 'http://localhost:8000';

export interface ScanResult {
  faces: Array<{
    bbox: [number, number, number, number]; // [left, top, right, bottom]
    name: string;
    role?: string;
    context?: string;
    confidence: number;
    emotion: string;
    traits: string[];
    caricature_highlights?: { [key: string]: number };
  }>;
  processing_time: number;
}

export interface LearningModuleData {
  success: boolean;
  data: {
    exercise_type: string;
    level: number;
    question: string;
    options: string[];
    correct_index?: number;
    distortion_type?: string;
    face_image?: string;
    correct_indices?: number[];
    original_image?: string;
    modified_image?: string;
    morphed_image?: string;
    hints?: string[];
    show_hints?: boolean;
    is_multiple_choice?: boolean;
    morph_percentage?: number;
    target_name?: string;
    distractor_name?: string;
    difficulty?: number;
    traits?: string[];
    highlights?: { [key: string]: number };
    name?: string;
    role?: string;
    context?: string;
    suggested_traits?: string[];
    existing_traits?: string[];
    correct_answer?: string;
  };
  next_difficulty: number;
}

// Mock data for when backend is not available
const mockScanResult: ScanResult = {
  faces: [
    {
      bbox: [100, 150, 200, 300],
      name: "Demo Person",
      role: "Friend",
      context: "College",
      confidence: 0.85,
      emotion: "happy",
      traits: ["friendly smile", "bright eyes"],
      caricature_highlights: { eyes: 0.7, smile: 0.8 }
    }
  ],
  processing_time: 0.5
};

const mockLearningData: Record<string, LearningModuleData> = {
  caricature: {
    success: true,
    data: {
      exercise_type: "caricature",
      level: 1,
      question: "Identify the caricature features",
      options: [],
      target_name: "Alex",
      face_image: "https://images.pexels.com/photos/220453/pexels-photo-220453.jpeg",
      traits: ["distinctive eyebrows", "strong jawline", "warm smile"],
      highlights: { eyes: 0.8, jaw: 0.6, smile: 0.7 }
    },
    next_difficulty: 2
  },
  spacing: {
    success: true,
    data: {
      exercise_type: "spacing",
      level: 1,
      question: "Which face matches the original?",
      target_name: "Jordan",
      options: ["Jordan", "Sam", "Casey"],
      correct_index: 0,
      distortion_type: "eye_spacing",
      difficulty: 1
    },
    next_difficulty: 2
  },
  'trait-tagging': {
    success: true,
    data: {
      exercise_type: "trait-tagging",
      level: 1,
      question: "Tag the facial traits",
      options: [],
      face_image: "https://images.pexels.com/photos/774909/pexels-photo-774909.jpeg",
      name: "Taylor",
      role: "Colleague",
      context: "Marketing team",
      suggested_traits: ["expressive eyes", "defined cheekbones", "gentle smile"],
      existing_traits: ["expressive eyes", "defined cheekbones"]
    },
    next_difficulty: 2
  },
  'morph-matching': {
    success: true,
    data: {
      exercise_type: "morph-matching",
      level: 1,
      question: "Which face is the target?",
      target_name: "Morgan",
      distractor_name: "Riley",
      morph_percentage: 70,
      options: ["Morgan", "Riley"],
      correct_answer: "Morgan"
    },
    next_difficulty: 2
  }
};

export async function scanAndIdentify(
  imageData: string,
  userId: string,
  showCaricature: boolean = true,
  showEmotion: boolean = true
): Promise<ScanResult> {
  try {
    // For demo purposes, return mock data
    // In production, this would call the actual backend
    console.log('Scanning image for user:', userId);
    
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Return mock data with some randomization
    const mockResult = {
      ...mockScanResult,
      faces: mockScanResult.faces.map(face => ({
        ...face,
        confidence: 0.7 + Math.random() * 0.3, // Random confidence 0.7-1.0
        emotion: ['happy', 'neutral', 'focused', 'thoughtful'][Math.floor(Math.random() * 4)]
      }))
    };
    
    return mockResult;
    
    // Uncomment below for actual backend integration:
    /*
    const response = await fetch(`${BACKEND_URL}/scan/identify`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        user_id: userId,
        image_data: imageData,
        show_caricature: showCaricature,
        show_emotion: showEmotion
      })
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const result = await response.json();
    return result;
    */
  } catch (error) {
    console.error('Error scanning and identifying faces:', error);
    // Return mock data as fallback
    return mockScanResult;
  }
}

export async function getLearningModuleData(
  moduleType: string,
  userId: string,
  difficultyLevel: number = 1
): Promise<LearningModuleData> {
  try {
    console.log(`Fetching ${moduleType} module data for user:`, userId, 'difficulty:', difficultyLevel);
    
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 800));
    
    // Return mock data based on module type
    const mockData = mockLearningData[moduleType];
    if (mockData) {
      return {
        ...mockData,
        data: {
          ...mockData.data,
          difficulty: difficultyLevel
        }
      };
    }
    
    // Fallback for unknown module types
    return {
      success: true,
      data: {
        exercise_type: moduleType,
        level: difficultyLevel,
        question: "Demo Exercise",
        options: ["Option 1", "Option 2", "Option 3"],
        correct_index: 0
      },
      next_difficulty: difficultyLevel + 1
    };
    
    // Uncomment below for actual backend integration:
    /*
    const response = await fetch(`${BACKEND_URL}/learn/${moduleType}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        user_id: userId,
        module_type: moduleType,
        difficulty_level: difficultyLevel
      })
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const result = await response.json();
    return result;
    */
  } catch (error) {
    console.error(`Error fetching ${moduleType} module data:`, error);
    // Return mock data as fallback
    return mockLearningData[moduleType] || {
      success: false,
      data: {
        exercise_type: moduleType,
        level: difficultyLevel,
        question: "",
        options: []
      },
      next_difficulty: difficultyLevel
    };
  }
}

export async function updateLearningProgress(
  userId: string,
  moduleId: string, // Changed from connectionId to moduleId
  moduleType: string,
  accuracy: number,
  currentLevel: number,
  completedLessons: number,
  totalLessons: number // Added totalLessons
): Promise<{ success: boolean; message: string }> {
  try {
    console.log('Updating learning progress:', { userId, moduleId, moduleType, accuracy, currentLevel });
    
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 500));
    
    // For demo purposes, always return success
    // In production, this would update the backend and Supabase
    
    // Update local Supabase progress
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      const { error } = await supabase
        .from('learning_progress')
        .upsert({
          user_id: user.id,
          module_id: moduleType,
          progress_percentage: Math.min(100, Math.floor(accuracy * 100)),
          completed_lessons: Math.floor(accuracy * 10),
          total_lessons: 10,
          last_accessed: new Date().toISOString()
        });
      
      if (error) {
        console.error('Error updating Supabase progress:', error);
      }
    }
    
    return {
      success: true,
      message: "Progress updated successfully"
    };
    
    // Uncomment below for actual backend integration:
    /*
    const formData = new FormData();
    formData.append('user_id', userId);
    formData.append('connection_id', connectionId);
    formData.append('module_type', moduleType);
    formData.append('accuracy', accuracy.toString());
    formData.append('current_level', currentLevel.toString());
    formData.append('completed_lessons', completedLessons.toString());

    const response = await fetch(`${BACKEND_URL}/learn/update-progress`, {
      method: 'POST',
      body: formData
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const result = await response.json();
    return result;
    */
  } catch (error) {
    console.error('Error updating learning progress:', error);
    return {
      success: false,
      message: "Failed to update progress"
    };
  }
}

export async function addFaceToDatabase(
  userId: string,
  name: string,
  imageFile: File,
  role?: string,
  context?: string
): Promise<{ success: boolean; face_id?: string; data?: any }> {
  try {
    console.log('Adding face to database:', { userId, name, role, context });
    
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // For demo purposes, return mock success
    return {
      success: true,
      face_id: `mock_face_${Date.now()}`,
      data: {
        name,
        role,
        context,
        traits: ["distinctive features", "memorable appearance"],
        embedding: Array(128).fill(0).map(() => Math.random()),
        caricature_highlights: { eyes: 0.6, nose: 0.4, jaw: 0.5 }
      }
    };
    
    // Uncomment below for actual backend integration:
    /*
    const formData = new FormData();
    formData.append('user_id', userId);
    formData.append('name', name);
    formData.append('file', imageFile);
    if (role) formData.append('role', role);
    if (context) formData.append('context', context);

    const response = await fetch(`${BACKEND_URL}/faces/add`, {
      method: 'POST',
      body: formData
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const result = await response.json();
    return result;
    */
  } catch (error) {
    console.error('Error adding face to database:', error);
    return {
      success: false
    };
  }
}

export async function getUserFaces(userId: string): Promise<{ faces: any[]; count: number }> {
  try {
    console.log('Getting user faces for:', userId);
    
    // For demo purposes, return mock data
    // In production, this would fetch from the backend
    return {
      faces: [
        {
          id: "mock_face_1",
          name: "Demo Person",
          role: "Friend",
          context: "College",
          traits: ["friendly smile", "bright eyes"],
          image_url: "https://images.pexels.com/photos/220453/pexels-photo-220453.jpeg"
        }
      ],
      count: 1
    };
    
    // Uncomment below for actual backend integration:
    /*
    const response = await fetch(`${BACKEND_URL}/faces/user/${userId}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      }
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const result = await response.json();
    return result;
    */
  } catch (error) {
    console.error('Error getting user faces:', error);
    return {
      faces: [],
      count: 0
    };
  }
}

export async function generateFacialCue(
  imageName: string,
  userId: string
): Promise<{ description: string; mnemonic: string }> {
  try {
    console.log('Generating facial cue for:', imageName);
    
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 800));
    
    // For demo purposes, return mock data
    return {
      description: "This person has distinctive facial features that make them memorable.",
      mnemonic: "Focus on their unique characteristics to help remember them."
    };
    
    // Uncomment below for actual backend integration:
    /*
    const response = await fetch(`${BACKEND_URL}/generate-cue`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        image_name: imageName,
        module_id: moduleId, // Changed from connection_id to module_id
        total_lessons: totalLessons, // Added total_lessons
      })
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const result = await response.json();
    return result;
    */
  } catch (error) {
    console.error('Error generating facial cue:', error);
    // Return fallback data
    return {
      description: "This person has distinctive facial features that make them memorable.",
      mnemonic: "Focus on their unique characteristics to help remember them."
    };
  }
}