from fastapi import FastAPI, HTTPException, UploadFile, File, Form
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import cv2
import numpy as np
import mediapipe as mp
import face_recognition
from sklearn.metrics.pairwise import cosine_similarity
import base64
import io
from PIL import Image
import json
import os
from typing import List, Dict, Optional, Tuple
import logging
from supabase import create_client, Client
from anthropic import Anthropic
import tensorflow as tf
from tensorflow import keras
import random
import math
import time
from training_ai import TrainingAI, AdaptiveDifficultyManager

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = FastAPI(
    title="Memora AI Backend",
    description="AI-powered face recognition and training system for prosopagnosia",
    version="1.0.0"
)

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Initialize services
supabase_url = os.getenv("SUPABASE_URL")
supabase_key = os.getenv("SUPABASE_ANON_KEY")
anthropic_key = os.getenv("ANTHROPIC_API_KEY")

supabase: Client = create_client(supabase_url, supabase_key) if supabase_url and supabase_key else None
anthropic_client = Anthropic(api_key=anthropic_key) if anthropic_key else None

# Initialize AI training system
training_ai = TrainingAI()

# Initialize MediaPipe
mp_face_mesh = mp.solutions.face_mesh
mp_face_detection = mp.solutions.face_detection
face_mesh = mp_face_mesh.FaceMesh(static_image_mode=True, max_num_faces=10)
face_detection = mp_face_detection.FaceDetection(model_selection=0, min_detection_confidence=0.5)

# Load emotion detection model (placeholder - you'd load a real model)
try:
    # emotion_model = keras.models.load_model('emotion_model.h5')
    emotion_model = None  # Placeholder
except:
    emotion_model = None
    logger.warning("Emotion detection model not found")

# Pydantic models
class FaceData(BaseModel):
    id: str
    user_id: str
    name: str
    role: Optional[str] = None
    context: Optional[str] = None
    traits: List[str] = []
    embedding: List[float]
    landmark_data: Dict
    caricature_highlights: Dict[str, float] = {}
    training_progress: Dict = {}

class TrainingRequest(BaseModel):
    user_id: str
    module_type: str
    difficulty_level: int = 1

class ScanRequest(BaseModel):
    user_id: str
    image_data: str  # base64 encoded
    show_caricature: bool = True
    show_emotion: bool = True

class TrainingResponse(BaseModel):
    success: bool
    data: Dict
    next_difficulty: int

class ScanResponse(BaseModel):
    faces: List[Dict]
    processing_time: float

# Utility functions
def decode_base64_image(image_data: str) -> np.ndarray:
    """Decode base64 image to OpenCV format"""
    try:
        # Remove data URL prefix if present
        if ',' in image_data:
            image_data = image_data.split(',')[1]
        
        image_bytes = base64.b64decode(image_data)
        image = Image.open(io.BytesIO(image_bytes))
        return cv2.cvtColor(np.array(image), cv2.COLOR_RGB2BGR)
    except Exception as e:
        logger.error(f"Error decoding image: {e}")
        raise HTTPException(status_code=400, detail="Invalid image data")

def encode_image_to_base64(image: np.ndarray) -> str:
    """Encode OpenCV image to base64"""
    _, buffer = cv2.imencode('.jpg', image)
    return base64.b64encode(buffer).decode('utf-8')

def extract_face_embedding(image: np.ndarray) -> Optional[List[float]]:
    """Extract face embedding using face_recognition library"""
    try:
        rgb_image = cv2.cvtColor(image, cv2.COLOR_BGR2RGB)
        face_encodings = face_recognition.face_encodings(rgb_image)
        if face_encodings:
            return face_encodings[0].tolist()
        return None
    except Exception as e:
        logger.error(f"Error extracting embedding: {e}")
        return None

def extract_facial_landmarks(image: np.ndarray) -> Optional[Dict]:
    """Extract facial landmarks using MediaPipe"""
    try:
        rgb_image = cv2.cvtColor(image, cv2.COLOR_BGR2RGB)
        results = face_mesh.process(rgb_image)
        
        if results.multi_face_landmarks:
            landmarks = results.multi_face_landmarks[0]
            points = []
            for landmark in landmarks.landmark:
                points.append([landmark.x, landmark.y, landmark.z])
            return {"points": points}
        return None
    except Exception as e:
        logger.error(f"Error extracting landmarks: {e}")
        return None

def calculate_caricature_highlights(landmarks: Dict) -> Dict[str, float]:
    """Calculate caricature highlights based on facial landmarks"""
    if not landmarks or "points" not in landmarks:
        return {}
    
    points = np.array(landmarks["points"])
    
    # Calculate distinctive features (simplified)
    highlights = {}
    
    # Eye size (distance between eye corners)
    if len(points) > 130:
        left_eye_width = np.linalg.norm(points[33] - points[133])
        right_eye_width = np.linalg.norm(points[362] - points[263])
        avg_eye_width = (left_eye_width + right_eye_width) / 2
        highlights["eyes"] = min(avg_eye_width * 10, 1.0)  # Normalize
    
    # Jaw width
    if len(points) > 150:
        jaw_width = np.linalg.norm(points[172] - points[397])
        highlights["jaw"] = min(jaw_width * 5, 1.0)  # Normalize
    
    # Nose length
    if len(points) > 19:
        nose_length = np.linalg.norm(points[19] - points[1])
        highlights["nose"] = min(nose_length * 8, 1.0)  # Normalize
    
    return highlights

def generate_traits_with_claude(image_data: str, landmarks: Dict) -> List[str]:
    """Generate facial traits using Claude AI"""
    if not anthropic_client:
        return ["distinctive eyes", "defined jawline", "prominent nose"]
    
    try:
        prompt = f"""
        Analyze this face and provide 3-5 distinctive facial traits that would help someone with face blindness remember this person. 
        Focus on permanent features like:
        - Eye shape, size, or spacing
        - Nose shape or size
        - Jaw shape or prominence
        - Eyebrow shape or thickness
        - Cheek structure
        - Overall face shape
        
        Provide traits as a simple list, each trait should be 2-4 words maximum.
        Example: ["almond-shaped eyes", "strong jawline", "aquiline nose"]
        """
        
        response = anthropic_client.messages.create(
            model="claude-3-sonnet-20240229",
            max_tokens=200,
            messages=[{"role": "user", "content": prompt}]
        )
        
        # Parse the response to extract traits
        traits_text = response.content[0].text
        # Simple parsing - in production, you'd want more robust parsing
        traits = [trait.strip().strip('"').strip("'") for trait in traits_text.split(",")]
        return traits[:5]  # Limit to 5 traits
        
    except Exception as e:
        logger.error(f"Error generating traits with Claude: {e}")
        return ["distinctive features", "memorable appearance"]

def detect_emotion(face_image: np.ndarray) -> str:
    """Detect emotion from face image"""
    if not emotion_model:
        return random.choice(["neutral", "happy", "focused", "thoughtful"])
    
    try:
        # Preprocess face for emotion detection
        face_resized = cv2.resize(face_image, (48, 48))
        face_gray = cv2.cvtColor(face_resized, cv2.COLOR_BGR2GRAY)
        face_normalized = face_gray / 255.0
        face_reshaped = face_normalized.reshape(1, 48, 48, 1)
        
        # Predict emotion
        predictions = emotion_model.predict(face_reshaped)
        emotions = ['angry', 'disgust', 'fear', 'happy', 'sad', 'surprise', 'neutral']
        emotion_idx = np.argmax(predictions[0])
        return emotions[emotion_idx]
    except Exception as e:
        logger.error(f"Error detecting emotion: {e}")
        return "neutral"

def create_caricature_overlay(image: np.ndarray, highlights: Dict[str, float]) -> np.ndarray:
    """Create caricature overlay highlighting distinctive features"""
    overlay = image.copy()
    height, width = image.shape[:2]
    
    # Create colored overlays for highlighted features
    for feature, intensity in highlights.items():
        if intensity > 0.3:  # Only highlight significant features
            color = (0, int(255 * intensity), 0)  # Green overlay
            alpha = 0.3 * intensity
            
            if feature == "eyes":
                # Highlight eye region
                cv2.rectangle(overlay, (int(width*0.2), int(height*0.3)), 
                            (int(width*0.8), int(height*0.5)), color, -1)
            elif feature == "jaw":
                # Highlight jaw region
                cv2.rectangle(overlay, (int(width*0.1), int(height*0.6)), 
                            (int(width*0.9), int(height*0.9)), color, -1)
            elif feature == "nose":
                # Highlight nose region
                cv2.rectangle(overlay, (int(width*0.4), int(height*0.4)), 
                            (int(width*0.6), int(height*0.7)), color, -1)
    
    # Blend overlay with original image
    result = cv2.addWeighted(image, 0.7, overlay, 0.3, 0)
    return result

def generate_morphed_faces(face1: np.ndarray, face2: np.ndarray, alpha: float = 0.5) -> np.ndarray:
    """Generate morphed face between two faces"""
    try:
        # Resize faces to same size
        height, width = 256, 256
        face1_resized = cv2.resize(face1, (width, height))
        face2_resized = cv2.resize(face2, (width, height))
        
        # Simple alpha blending (in production, use more sophisticated morphing)
        morphed = cv2.addWeighted(face1_resized, alpha, face2_resized, 1-alpha, 0)
        return morphed
    except Exception as e:
        logger.error(f"Error generating morphed face: {e}")
        return face1

# API Endpoints

@app.get("/")
async def root():
    return {
        "message": "Memora AI Backend",
        "status": "healthy",
        "version": "1.0.0"
    }

@app.post("/faces/add")
async def add_face(
    user_id: str = Form(...),
    name: str = Form(...),
    role: str = Form(""),
    context: str = Form(""),
    file: UploadFile = File(...)
):
    """Add a new face to the user's database"""
    try:
        # Read and process image
        image_data = await file.read()
        image = cv2.imdecode(np.frombuffer(image_data, np.uint8), cv2.IMREAD_COLOR)
        
        # Extract features
        embedding = extract_face_embedding(image)
        if not embedding:
            raise HTTPException(status_code=400, detail="No face detected in image")
        
        landmarks = extract_facial_landmarks(image)
        caricature_highlights = calculate_caricature_highlights(landmarks) if landmarks else {}
        
        # Generate traits using Claude
        image_b64 = encode_image_to_base64(image)
        traits = generate_traits_with_claude(image_b64, landmarks)
        
        # Store in Supabase
        face_data = {
            "user_id": user_id,
            "name": name,
            "role": role if role else None,
            "context": context if context else None,
            "traits": traits,
            "embedding": embedding,
            "landmark_data": landmarks,
            "caricature_highlights": caricature_highlights,
            "training_progress": {
                "spacing": {"level": 1, "accuracy": 0},
                "matching": {"level": 1, "accuracy": 0},
                "trait_tagging": {"level": 1, "accuracy": 0}
            }
        }
        
        if supabase:
            result = supabase.table("faces").insert(face_data).execute()
            return {"success": True, "face_id": result.data[0]["id"]}
        else:
            return {"success": True, "face_id": "mock_id", "data": face_data}
            
    except Exception as e:
        logger.error(f"Error adding face: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/learn/caricature")
async def caricature_training(request: TrainingRequest):
    """Generate caricature training exercise"""
    try:
        # Get user's faces from faces table
        faces = []
        if supabase:
            faces_result = supabase.table("faces").select("*").eq("user_id", request.user_id).execute()
            faces = faces_result.data or []
        
        # Select a face for training
        target_face = random.choice(faces) if faces else None
        
        # Generate caricature exercise using AI
        exercise_data = training_ai.generate_caricature_exercise(
            target_face, request.difficulty_level, faces
        )
        
        if "error" in exercise_data:
            return TrainingResponse(
                success=False,
                data=exercise_data,
                next_difficulty=request.difficulty_level
            )
        
        # Calculate next difficulty
        next_difficulty = training_ai.difficulty_manager.calculate_next_level(
            request.difficulty_level, 0.8, 0  # Default values, will be updated on completion
        )
        
        return TrainingResponse(
            success=True,
            data=exercise_data,
            next_difficulty=next_difficulty
        )
        
    except Exception as e:
        logger.error(f"Error in caricature training: {e}")
        return TrainingResponse(
            success=False,
            data={"error": f"Training generation failed: {str(e)}"},
            next_difficulty=request.difficulty_level
        )

@app.post("/learn/spacing")
async def spacing_training(request: TrainingRequest):
    """Generate spacing awareness training exercise"""
    try:
        # Get user's faces from faces table
        if supabase:
            faces_result = supabase.table("faces").select("*").eq("user_id", request.user_id).execute()
        else:
            # Mock data for development
            faces_result = type('obj', (object,), {
                'data': [{
                    'id': 'mock_id',
                    'name': 'Sample Person',
                    'image_url': 'https://images.pexels.com/photos/1239291/pexels-photo-1239291.jpeg',
                    'landmark_data': {'points': [[0.5, 0.3], [0.6, 0.4]]},
                    'trait_descriptions': ['expressive eyes', 'defined jawline'],
                    'training_progress': {'spacing': {'level': 1, 'accuracy': 0}}
                }]
            })()
            
        faces = faces_result.data
        
        if not faces:
            return TrainingResponse(
                success=False, 
                data={"error": "No faces found. Please add some connections first."}, 
                next_difficulty=1
            )
        
        target_face = random.choice(faces)
        
        # Generate spacing exercise using AI
        exercise_data = training_ai.generate_spacing_exercise(
            target_face, request.difficulty_level, faces
        )
        
        if "error" in exercise_data:
            return TrainingResponse(
                success=False,
                data=exercise_data,
                next_difficulty=request.difficulty_level
            )
        
        next_difficulty = training_ai.difficulty_manager.calculate_next_level(
            request.difficulty_level, 0.8, 0
        )
        
        return TrainingResponse(
            success=True,
            data=exercise_data,
            next_difficulty=next_difficulty
        )
        
    except Exception as e:
        logger.error(f"Error in spacing training: {e}")

@app.post("/learn/trait-tagging")
async def trait_tagging_training(request: TrainingRequest):
    """Generate trait tagging training exercise"""
    try:
        # Get user's faces from faces table
        if supabase:
            faces_result = supabase.table("faces").select("*").eq("user_id", request.user_id).execute()
        else:
            # Mock data for development
            faces_result = type('obj', (object,), {
                'data': [{
                    'id': 'mock_id',
                    'name': 'Sample Person',
                    'image_url': 'https://images.pexels.com/photos/1239291/pexels-photo-1239291.jpeg',
                    'landmark_data': {'points': [[0.5, 0.3], [0.6, 0.4]]},
                    'trait_descriptions': ['expressive eyes', 'defined jawline', 'strong nose'],
                    'training_progress': {'trait_tagging': {'level': 1, 'accuracy': 0}}
                }]
            })()
            
        faces = faces_result.data
        
        if not faces:
            return TrainingResponse(
                success=False, 
                data={"error": "No faces found. Please add some connections first."}, 
                next_difficulty=1
            )
        
        target_face = random.choice(faces)
        
        # Generate trait identification exercise using AI
        exercise_data = training_ai.generate_trait_identification_exercise(
            target_face, request.difficulty_level, faces
        )
        
        if "error" in exercise_data:
            return TrainingResponse(
                success=False,
                data=exercise_data,
                next_difficulty=request.difficulty_level
            )
        
        next_difficulty = training_ai.difficulty_manager.calculate_next_level(
            request.difficulty_level, 0.8, 0
        )
        
        return TrainingResponse(
            success=True,
            data=exercise_data,
            next_difficulty=next_difficulty
        )
        
    except Exception as e:
        logger.error(f"Error in trait tagging training: {e}")

@app.post("/learn/morph-matching")
async def morph_matching_training(request: TrainingRequest):
    """Generate morph-based matching training exercise"""
    try:
        # Get user's faces from faces table
        if supabase:
            faces_result = supabase.table("faces").select("*").eq("user_id", request.user_id).execute()
        else:
            # Mock data for development
            faces_result = type('obj', (object,), {
                'data': [{
                    'id': 'mock_id_1',
                    'name': 'Sample Person 1',
                    'image_url': 'https://images.pexels.com/photos/1239291/pexels-photo-1239291.jpeg',
                    'landmark_data': {'points': [[0.5, 0.3], [0.6, 0.4]]},
                    'trait_descriptions': ['expressive eyes', 'defined jawline'],
                    'training_progress': {'morph_matching': {'level': 1, 'accuracy': 0}}
                }, {
                    'id': 'mock_id_2',
                    'name': 'Sample Person 2',
                    'image_url': 'https://images.pexels.com/photos/1040880/pexels-photo-1040880.jpeg',
                    'landmark_data': {'points': [[0.4, 0.3], [0.5, 0.4]]},
                    'trait_descriptions': ['gentle smile', 'soft features'],
                    'training_progress': {'morph_matching': {'level': 1, 'accuracy': 0}}
                }]
            })()
            
        faces = faces_result.data
        
        if len(faces) < 2:
            return TrainingResponse(
                success=False, 
                data={"error": "Need at least 2 faces for morph training. Please add more connections."}, 
                next_difficulty=1
            )
        
        target_face = random.choice(faces)
        
        # Generate morph matching exercise using AI
        exercise_data = training_ai.generate_morph_matching_exercise(
            target_face, request.difficulty_level, faces
        )
        
        if "error" in exercise_data:
            return TrainingResponse(
                success=False,
                data=exercise_data,
                next_difficulty=request.difficulty_level
            )
        
        next_difficulty = training_ai.difficulty_manager.calculate_next_level(
            request.difficulty_level, 0.8, 0
        )
        
        return TrainingResponse(
            success=True,
            data=exercise_data,
            next_difficulty=next_difficulty
        )
        
    except Exception as e:
        logger.error(f"Error in morph matching training: {e}")

@app.post("/learn/update-progress")
async def update_training_progress(
    user_id: str = Form(...),
    connection_id: str = Form(...),
    module_type: str = Form(...),
    accuracy: float = Form(...),
    current_level: int = Form(...),
    completed_lessons: int = Form(0)
):
    """Update training progress for a specific face and module"""
    try:
        if not supabase:
            return {"success": True, "message": "Progress updated (mock)"}
        
        # Get current progress from connections table
        connection_result = supabase.table("connections").select("*").eq("id", connection_id).execute()
        if not connection_result.data:
            raise HTTPException(status_code=404, detail="Connection not found")
        
        connection_data = connection_result.data[0]
        current_progress = connection_data.get("training_progress", {})
        
        # Calculate next level using AI
        next_level = training_ai.difficulty_manager.calculate_next_level(
            current_level, accuracy, completed_lessons
        )
        
        # Update progress for the specific module  
        if module_type not in current_progress:
            current_progress[module_type] = {
                "level": 1, 
                "accuracy": 0, 
                "completed_lessons": 0
            }
        
        current_progress[module_type]["accuracy"] = accuracy
        current_progress[module_type]["level"] = next_level
        current_progress[module_type]["completed_lessons"] = completed_lessons
        
        # If accuracy is high enough, increment completed lessons
        if accuracy >= 0.8:
            current_progress[module_type]["completed_lessons"] = min(
                completed_lessons + 1, 10
            )
        
        # Update in database
        supabase.table("connections").update({
            "training_progress": current_progress
        }).eq("id", connection_id).execute()
        
        return {
            "success": True, 
            "message": "Progress updated successfully",
            "new_level": next_level,
            "completed_lessons": current_progress[module_type]["completed_lessons"]
        }
        
    except Exception as e:
        logger.error(f"Error updating progress: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/scan/identify")
async def scan_and_identify(request: ScanRequest):
    """Scan image and identify faces in real-time"""
    import time
    start_time = time.time()
    
    try:
        # Decode image
        image = decode_base64_image(request.image_data)
        
        # Extract face embedding from the image
        face_embedding = face_ai.extract_face_embedding(image)
        
        if not supabase:
            # Mock response for development
            if face_embedding is not None:
                mock_faces = [{
                    "bbox": [100, 100, 300, 300],
                    "name": "Mock Person",
                    "description": "Test Connection",
                    "confidence": 0.85,
                    "emotion": "neutral",
                    "traits": ["distinctive eyes", "strong jawline"],
                    "notes": "This is a mock identification"
                }]
            else:
                mock_faces = []
            
            return ScanResponse(
                faces=mock_faces,
                processing_time=time.time() - start_time
            )
        
        if face_embedding is None:
            return ScanResponse(faces=[], processing_time=time.time() - start_time)
        
        # Get user's stored connections
        connections_result = supabase.table("connections").select("*").eq("user_id", request.user_id).execute()
        stored_connections = connections_result.data or []
        
        # Prepare stored embeddings for comparison
        stored_embeddings = []
        for connection in stored_connections:
            if connection.get("face_embedding"):
                embedding_array = np.array(connection["face_embedding"])
                stored_embeddings.append((
                    connection["id"],
                    embedding_array,
                    {
                        "name": connection["name"],
                        "description": connection.get("description", ""),
                        "notes": connection.get("notes", ""),
                        "traits": connection.get("trait_descriptions", []),
                        "facial_traits": connection.get("facial_traits", {})
                    }
                ))
        
        # Find best match
        match_result = face_ai.find_best_match(face_embedding, stored_embeddings)
        
        identified_faces = []
        if match_result:
            connection_id, confidence, connection_data = match_result
            
            # Get emotion (simplified)
            emotion = detect_emotion(image) if request.show_emotion else "neutral"
            
            # Create face data with bounding box (simplified - using full image)
            height, width = image.shape[:2]
            face_data = {
                "bbox": [int(width*0.2), int(height*0.2), int(width*0.8), int(height*0.8)],  # Approximate face location
                "name": connection_data["name"],
                "description": connection_data["description"],
                "confidence": float(confidence),
                "emotion": emotion,
                "traits": connection_data["traits"],
                "notes": connection_data["notes"]
            }
            identified_faces.append(face_data)
        
        processing_time = time.time() - start_time
        
        return ScanResponse(
            faces=identified_faces,
            processing_time=processing_time
        )
        
    except Exception as e:
        logger.error(f"Error in scan and identify: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/connections/{user_id}")
async def get_user_connections(user_id: str):
    """Get all connections for a user"""
    try:
        if not supabase:
            return {"connections": [], "count": 0}
        
        result = supabase.table("connections").select("*").eq("user_id", user_id).execute()
        return {"connections": result.data, "count": len(result.data)}
        
    except Exception as e:
        logger.error(f"Error getting user connections: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.delete("/connections/{connection_id}")
async def delete_connection(connection_id: str):
    """Delete a connection from the database"""
    try:
        if not supabase:
            return {"success": True, "message": "Connection deleted (mock)"}
        
        supabase.table("connections").delete().eq("id", connection_id).execute()
        return {"success": True, "message": "Connection deleted successfully"}
        
    except Exception as e:
        logger.error(f"Error deleting connection: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/health")
async def health_check():
    """Health check endpoint"""
    return {
        "status": "healthy",
        "services": {
            "supabase": "connected" if supabase else "not configured",
            "anthropic": "connected" if anthropic_client else "not configured",
            "facenet": "available",
            "mediapipe": "available",
            "pytorch": "available"
        }
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)