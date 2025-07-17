 // client/lib/api.ts
export async function generateFacialCue(image_name: string, user_id: string): Promise<{ description: string; mnemonic: string }> {
  const backendUrl = process.env.EXPO_PUBLIC_BACKEND_URL;
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
}

