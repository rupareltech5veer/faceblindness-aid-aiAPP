const BACKEND_URL = process.env.EXPO_PUBLIC_BACKEND_URL || 'https://memora-production-36a1.up.railway.app';

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
    target_face?: string;
    caricature_face?: string;
    target_image?: string;
    options?: string[] | Array<{ name: string; image_url: string }>;
    correct_index?: number;
    correct_answer?: string;
    traits?: string[];
    highlights?: { [key: string]: number };
    name?: string;
    role?: string;
    context?: string;
    difficulty?: number;
    morph_percentage?: number;
    distortion_type?: string;
    suggested_traits?: string[];
    existing_traits?: string[];
  };
  next_difficulty: number;
}

export interface ProgressUpdate {
  success: boolean;
  message: string;
}

export async function scanAndIdentify(
  imageData: string,
  userId: string,
  showCaricature: boolean = true,
  showEmotion: boolean = true
): Promise<ScanResult> {
  try {
    const response = await fetch(`${BACKEND_URL}/scan/identify`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        user_id: userId,
        image_data: imageData,
        show_caricature: showCaricature,
        show_emotion: showEmotion,
      }),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Error scanning and identifying faces:', error);
    throw error;
  }
}

export async function getLearningModuleData(
  moduleType: string,
  userId: string,
  difficultyLevel: number = 1
): Promise<LearningModuleData> {
  try {
    const response = await fetch(`${BACKEND_URL}/learn/${moduleType}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        user_id: userId,
        module_type: moduleType,
        difficulty_level: difficultyLevel,
      }),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error(`Error fetching ${moduleType} module data:`, error);
    throw error;
  }
}

export async function updateLearningProgress(
  userId: string,
  faceId: string,
  moduleType: string,
  accuracy: number,
  difficultyLevel: number
): Promise<ProgressUpdate> {
  try {
    const formData = new FormData();
    formData.append('user_id', userId);
    formData.append('face_id', faceId);
    formData.append('module_type', moduleType);
    formData.append('accuracy', accuracy.toString());
    formData.append('difficulty_level', difficultyLevel.toString());

    const response = await fetch(`${BACKEND_URL}/learn/update-progress`, {
      method: 'POST',
      body: formData,
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Error updating learning progress:', error);
    throw error;
  }
}

export async function addFaceToDatabase(
  userId: string,
  name: string,
  role: string,
  context: string,
  imageFile: Blob
): Promise<{ success: boolean; face_id?: string }> {
  try {
    const formData = new FormData();
    formData.append('user_id', userId);
    formData.append('name', name);
    formData.append('role', role);
    formData.append('context', context);
    formData.append('file', imageFile, 'face.jpg');

    const response = await fetch(`${BACKEND_URL}/faces/add`, {
      method: 'POST',
      body: formData,
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Error adding face to database:', error);
    throw error;
  }
}

export async function getUserFaces(userId: string): Promise<{ faces: any[]; count: number }> {
  try {
    const response = await fetch(`${BACKEND_URL}/faces/${userId}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Error fetching user faces:', error);
    throw error;
  }
}