 // client/lib/api.ts
export async function generateFacialCue(image_name: string, user_id: string): Promise<{ description: string; mnemonic: string }> {
  const backendUrl = process.env.EXPO_PUBLIC_BACKEND_URL;
  
  // If no backend URL is available, return mock data for now
  if (!backendUrl) {
    console.warn('No backend URL configured, returning mock data');
    return {
      description: "This person has distinctive features and a friendly demeanor.",
      mnemonic: "Remember: Focus on their smile and bright eyes - think warmth and kindness."
    };
  }
  
  try {
    const res = await fetch(`${backendUrl}/generate-cue`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ image_name, user_id }),
    });

    if (!res.ok) {
      console.error(await res.text());
      throw new Error('Failed to generate facial cue');
    }

    // Assuming backend returns { description, mnemonic }
    return await res.json();
  } catch (error) {
    console.error('Backend request failed:', error);
    // Return mock data as fallback
    return {
      description: "This person has distinctive features and a friendly demeanor.",
      mnemonic: "Remember: Focus on their smile and bright eyes - think warmth and kindness."
    };
  }
}

