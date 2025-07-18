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
    caricature_highlights?: Record<string, number>;
  }>;
  processing_time: number;
}

export interface LearningModuleData {
  success: boolean;
  data: {
    target_face?: string;
    caricature_face?: string;
    traits?: string[];
    highlights?: Record<string, number>;
    target_image?: string;
    options?: string[] | Array<{ name: string; image_url?: string }>;
    correct_index?: number;
    distortion_type?: string;
    face_image?: string;
    suggested_traits?: string[];
    name?: string;
    role?: string;
    context?: string;
    existing_traits?: string[];
    morphed_image?: string;
    correct_answer?: string;
    morph_percentage?: number;
    target_name?: string;
    distractor_name?: string;
    difficulty?: number;
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
      target_face: "https://images.pexels.com/photos/220453/pexels-photo-220453.jpeg",
      traits: ["distinctive eyebrows", "strong jawline", "warm smile"],
      highlights: { eyes: 0.8, jaw: 0.6, smile: 0.7 },
      name: "Alex"
    },
    next_difficulty: 2
  },
  spacing: {
    success: true,
    data: {
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
      face_image: "https://images.pexels.com/photos/774909/pexels-photo-774909.jpeg",
      name: "Taylor",
      role: "Colleague",
      context: "Marketing team",
      suggested_traits: ["expressive eyes", "defined cheekbones", "gentle smile"],
      existing_traits: ["expressive eyes", "defined cheekbones"]
    },
    next_difficulty: 1
  },
  'morph-matching': {
    success: true,
    data: {
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
        name: "Demo Exercise",
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
      data: {},
      next_difficulty: difficultyLevel
    };
  }
}

export async function updateLearningProgress(
  userId: string,
  faceId: string,
  moduleType: string,
  accuracy: number,
  difficultyLevel: number
): Promise<{ success: boolean; message: string }> {
  try {
    console.log('Updating learning progress:', { userId, faceId, moduleType, accuracy, difficultyLevel });
    
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
    const response = await fetch(`${BACKEND_URL}/learn/update-progress`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        user_id: userId,
        face_id: faceId,
        module_type: moduleType,
        accuracy: accuracy,
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
      faces: [],
      count: 0
    };
    
    // Uncomment below for actual backend integration:
    /*
    const response = await fetch(`${BACKEND_URL}/faces/${userId}`, {
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

// Generate facial cue using backend AI
export async function generateFacialCue(imageName: string, userId: string): Promise<{ description: string; mnemonic: string }> {
  try {
    console.log('Generating facial cue for:', imageName, userId);
    
    // For demo purposes, return mock data
    const mockDescriptions = [
      "This person has distinctive almond-shaped eyes and a warm, genuine smile.",
      "Notable features include strong eyebrows and a defined jawline.",
      "This individual has expressive eyes and gentle facial features.",
      "Key characteristics are high cheekbones and a friendly demeanor."
    ];
    
    const mockMnemonics = [
      "Think: Bright eyes + warm smile = approachable friend",
      "Remember: Strong features like a confident leader",
      "Focus on: Gentle expression shows kindness",
      "Key feature: High cheekbones - think elegant"
    ];
    
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    return {
      description: mockDescriptions[Math.floor(Math.random() * mockDescriptions.length)],
      mnemonic: mockMnemonics[Math.floor(Math.random() * mockMnemonics.length)]
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
        user_id: userId
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