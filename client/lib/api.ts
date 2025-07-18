const API_BASE_URL = process.env.EXPO_PUBLIC_BACKEND_URL || 'http://localhost:8000';

export interface FacialCueResponse {
  description: string;
  mnemonic: string;
}

export const generateFacialCue = async (
  imageName: string,
  userId: string
): Promise<FacialCueResponse> => {
  try {
    const response = await fetch(`${API_BASE_URL}/generate-cue`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        image_name: imageName,
        user_id: userId,
      }),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error generating facial cue:', error);
    throw new Error('Failed to generate facial cue. Please try again.');
  }
};

export const checkBackendHealth = async (): Promise<boolean> => {
  try {
    const response = await fetch(`${API_BASE_URL}/health`);
    return response.ok;
  } catch (error) {
    console.error('Backend health check failed:', error);
    return false;
  }
};