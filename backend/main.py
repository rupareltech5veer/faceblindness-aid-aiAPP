from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import random
from typing import Dict, Any

app = FastAPI(
    title="Face Blindness Aid API",
    description="Backend API for generating facial memory cues",
    version="1.0.0"
)

# Configure CORS to allow requests from React Native app
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # In production, specify your app's domain
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class GenerateCueRequest(BaseModel):
    image_name: str
    user_id: str

class GenerateCueResponse(BaseModel):
    description: str
    mnemonic: str

# Mock facial features for demo purposes
# TODO: Replace with real AI analysis (Claude API, OpenCV, etc.)
FACIAL_FEATURES = [
    "thick eyebrows", "thin eyebrows", "arched eyebrows", "straight eyebrows",
    "square jaw", "round jaw", "pointed chin", "dimpled chin",
    "high cheekbones", "full cheeks", "hollow cheeks",
    "wide nose", "narrow nose", "button nose", "aquiline nose",
    "large eyes", "small eyes", "deep-set eyes", "prominent eyes",
    "full lips", "thin lips", "wide smile", "crooked smile",
    "freckles", "moles", "wrinkles around eyes", "smooth skin",
    "broad forehead", "narrow forehead", "receding hairline",
    "curly hair", "straight hair", "wavy hair", "short hair", "long hair"
]

DESCRIPTIVE_WORDS = [
    "distinctive", "prominent", "subtle", "striking", "gentle", "sharp",
    "soft", "angular", "rounded", "defined", "expressive", "kind"
]

MNEMONIC_TEMPLATES = [
    "Think: {feature1} + {feature2} = {name}",
    "Remember: {feature1} like {comparison}",
    "Key feature: {feature1} - think {association}",
    "Focus on: {feature1} and {feature2}",
    "Memorable: {feature1} gives them a {characteristic} look"
]

COMPARISONS = [
    "a movie star", "your friend", "a family member", "someone famous",
    "a character from TV", "an old photo", "a painting"
]

ASSOCIATIONS = [
    "strength", "kindness", "wisdom", "youth", "confidence", "warmth",
    "intelligence", "friendliness", "determination", "gentleness"
]

CHARACTERISTICS = [
    "friendly", "serious", "approachable", "distinguished", "youthful",
    "wise", "confident", "gentle", "strong", "kind"
]

def generate_mock_facial_description() -> str:
    """Generate a mock facial description using random features."""
    num_features = random.randint(2, 4)
    selected_features = random.sample(FACIAL_FEATURES, num_features)
    
    # Add descriptive words to some features
    enhanced_features = []
    for feature in selected_features:
        if random.choice([True, False]):
            descriptor = random.choice(DESCRIPTIVE_WORDS)
            enhanced_features.append(f"{descriptor} {feature}")
        else:
            enhanced_features.append(feature)
    
    if len(enhanced_features) == 2:
        return f"This person has {enhanced_features[0]} and {enhanced_features[1]}."
    elif len(enhanced_features) == 3:
        return f"This person has {enhanced_features[0]}, {enhanced_features[1]}, and {enhanced_features[2]}."
    else:
        features_text = ", ".join(enhanced_features[:-1])
        return f"This person has {features_text}, and {enhanced_features[-1]}."

def generate_mock_mnemonic(name: str) -> str:
    """Generate a mock mnemonic using the person's name."""
    template = random.choice(MNEMONIC_TEMPLATES)
    
    # Select random features for the mnemonic
    feature1 = random.choice(FACIAL_FEATURES)
    feature2 = random.choice(FACIAL_FEATURES)
    
    # Ensure features are different
    while feature2 == feature1:
        feature2 = random.choice(FACIAL_FEATURES)
    
    comparison = random.choice(COMPARISONS)
    association = random.choice(ASSOCIATIONS)
    characteristic = random.choice(CHARACTERISTICS)
    
    return template.format(
        feature1=feature1,
        feature2=feature2,
        name=name,
        comparison=comparison,
        association=association,
        characteristic=characteristic
    )

@app.get("/")
async def root():
    """Health check endpoint."""
    return {
        "message": "Face Blindness Aid API is running!",
        "status": "healthy",
        "version": "1.0.0"
    }

@app.post("/generate-cue", response_model=GenerateCueResponse)
async def generate_facial_cue(request: GenerateCueRequest):
    """
    Generate a facial memory cue for the uploaded image.
    
    This is currently a mock implementation that generates random
    facial descriptions and mnemonics. In production, this would:
    
    1. Download the image from Supabase storage
    2. Use AI (Claude API, OpenCV, etc.) to analyze facial features
    3. Generate personalized memory cues based on actual features
    4. Return structured data for the mobile app
    """
    try:
        # Validate input
        if not request.image_name or not request.user_id:
            raise HTTPException(
                status_code=400, 
                detail="Both image_name and user_id are required"
            )
        
        # TODO: Replace this mock implementation with real AI analysis
        # Example implementation steps:
        # 1. Download image from Supabase: supabase.storage.from_('face-uploads').download(request.image_name)
        # 2. Analyze with AI: features = analyze_facial_features(image_data)
        # 3. Generate personalized cues: cues = generate_memory_cues(features, context)
        
        # For now, generate mock data
        description = generate_mock_facial_description()
        
        # Extract name from user context (in real app, this would come from the request)
        # For demo, we'll create a simple mnemonic
        mnemonic = generate_mock_mnemonic("this person")
        
        return GenerateCueResponse(
            description=description,
            mnemonic=mnemonic
        )
        
    except Exception as e:
        print(f"Error generating facial cue: {str(e)}")
        raise HTTPException(
            status_code=500,
            detail="Failed to generate facial cue. Please try again."
        )

@app.get("/health")
async def health_check():
    """Detailed health check endpoint."""
    return {
        "status": "healthy",
        "service": "Face Blindness Aid API",
        "version": "1.0.0",
        "endpoints": {
            "generate_cue": "/generate-cue",
            "health": "/health",
            "docs": "/docs"
        }
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)