const express = require('express');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 8000;

// Middleware
app.use(cors({
  origin: '*',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json());

// Mock facial features for demo purposes
// TODO: Replace with real AI analysis (Claude API, OpenCV, etc.)
const FACIAL_FEATURES = [
  "thick eyebrows", "thin eyebrows", "arched eyebrows", "straight eyebrows",
  "square jaw", "round jaw", "pointed chin", "dimpled chin",
  "high cheekbones", "full cheeks", "hollow cheeks",
  "wide nose", "narrow nose", "button nose", "aquiline nose",
  "large eyes", "small eyes", "deep-set eyes", "prominent eyes",
  "full lips", "thin lips", "wide smile", "crooked smile",
  "freckles", "moles", "wrinkles around eyes", "smooth skin",
  "broad forehead", "narrow forehead", "receding hairline",
  "curly hair", "straight hair", "wavy hair", "short hair", "long hair"
];

const DESCRIPTIVE_WORDS = [
  "distinctive", "prominent", "subtle", "striking", "gentle", "sharp",
  "soft", "angular", "rounded", "defined", "expressive", "kind"
];

const MNEMONIC_TEMPLATES = [
  "Think: {feature1} + {feature2} = {name}",
  "Remember: {feature1} like {comparison}",
  "Key feature: {feature1} - think {association}",
  "Focus on: {feature1} and {feature2}",
  "Memorable: {feature1} gives them a {characteristic} look"
];

const COMPARISONS = [
  "a movie star", "your friend", "a family member", "someone famous",
  "a character from TV", "an old photo", "a painting"
];

const ASSOCIATIONS = [
  "strength", "kindness", "wisdom", "youth", "confidence", "warmth",
  "intelligence", "friendliness", "determination", "gentleness"
];

const CHARACTERISTICS = [
  "friendly", "serious", "approachable", "distinguished", "youthful",
  "wise", "confident", "gentle", "strong", "kind"
];

function getRandomElement(array) {
  return array[Math.floor(Math.random() * array.length)];
}

function generateMockFacialDescription() {
  const numFeatures = Math.floor(Math.random() * 3) + 2; // 2-4 features
  const selectedFeatures = [];
  
  // Get unique features
  const shuffled = [...FACIAL_FEATURES].sort(() => 0.5 - Math.random());
  for (let i = 0; i < numFeatures; i++) {
    selectedFeatures.push(shuffled[i]);
  }
  
  // Add descriptive words to some features
  const enhancedFeatures = selectedFeatures.map(feature => {
    if (Math.random() > 0.5) {
      const descriptor = getRandomElement(DESCRIPTIVE_WORDS);
      return `${descriptor} ${feature}`;
    }
    return feature;
  });
  
  if (enhancedFeatures.length === 2) {
    return `This person has ${enhancedFeatures[0]} and ${enhancedFeatures[1]}.`;
  } else if (enhancedFeatures.length === 3) {
    return `This person has ${enhancedFeatures[0]}, ${enhancedFeatures[1]}, and ${enhancedFeatures[2]}.`;
  } else {
    const featuresText = enhancedFeatures.slice(0, -1).join(', ');
    return `This person has ${featuresText}, and ${enhancedFeatures[enhancedFeatures.length - 1]}.`;
  }
}

function generateMockMnemonic(name) {
  const template = getRandomElement(MNEMONIC_TEMPLATES);
  
  // Select random features for the mnemonic
  const feature1 = getRandomElement(FACIAL_FEATURES);
  let feature2 = getRandomElement(FACIAL_FEATURES);
  
  // Ensure features are different
  while (feature2 === feature1) {
    feature2 = getRandomElement(FACIAL_FEATURES);
  }
  
  const comparison = getRandomElement(COMPARISONS);
  const association = getRandomElement(ASSOCIATIONS);
  const characteristic = getRandomElement(CHARACTERISTICS);
  
  return template
    .replace('{feature1}', feature1)
    .replace('{feature2}', feature2)
    .replace('{name}', name)
    .replace('{comparison}', comparison)
    .replace('{association}', association)
    .replace('{characteristic}', characteristic);
}

// Routes
app.get('/', (req, res) => {
  res.json({
    message: "Face Blindness Aid API is running!",
    status: "healthy",
    version: "1.0.0"
  });
});

app.post('/generate-cue', (req, res) => {
  try {
    const { image_name, user_id } = req.body;
    
    // Validate input
    if (!image_name || !user_id) {
      return res.status(400).json({
        error: "Both image_name and user_id are required"
      });
    }
    
    // TODO: Replace this mock implementation with real AI analysis
    // Example implementation steps:
    // 1. Download image from Supabase: supabase.storage.from('face-uploads').download(image_name)
    // 2. Analyze with AI: features = analyzeFacialFeatures(imageData)
    // 3. Generate personalized cues: cues = generateMemoryCues(features, context)
    
    // For now, generate mock data
    const description = generateMockFacialDescription();
    const mnemonic = generateMockMnemonic("this person");
    
    res.json({
      description,
      mnemonic
    });
    
  } catch (error) {
    console.error('Error generating facial cue:', error);
    res.status(500).json({
      error: "Failed to generate facial cue. Please try again."
    });
  }
});

app.get('/health', (req, res) => {
  res.json({
    status: "healthy",
    service: "Face Blindness Aid API",
    version: "1.0.0",
    endpoints: {
      generate_cue: "/generate-cue",
      health: "/health"
    }
  });
});

app.listen(PORT, () => {
  console.log(`🚀 Face Blindness Aid API running on http://localhost:${PORT}`);
  console.log(`📖 Health check: http://localhost:${PORT}/health`);
});