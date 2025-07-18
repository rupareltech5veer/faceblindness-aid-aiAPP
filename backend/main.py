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
        if not supabase:
            # Mock response for development
            return TrainingResponse(
                success=True,
                data={
                    "target_face": "base64_image_data",
                    "caricature_face": "base64_caricature_data",
                    "traits": ["distinctive eyes", "strong jawline"],
                    "highlights": {"eyes": 0.8, "jaw": 0.6}
                },
                next_difficulty=request.difficulty_level + 1
            )
        
        # Get user's faces
        faces_result = supabase.table("faces").select("*").eq("user_id", request.user_id).execute()
        faces = faces_result.data
        
        if not faces:
            raise HTTPException(status_code=404, detail="No faces found for user")
        
        # Select a random face for training
        target_face = random.choice(faces)
        
        # Create caricature version (simplified)
        caricature_data = {
            "target_face": target_face["image_url"],
            "traits": target_face["traits"],
            "highlights": target_face["caricature_highlights"],
            "name": target_face["name"]
        }
        
        return TrainingResponse(
            success=True,
            data=caricature_data,
            next_difficulty=min(request.difficulty_level + 1, 5)
        )
        
    except Exception as e:
        logger.error(f"Error in caricature training: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/learn/spacing")
async def spacing_training(request: TrainingRequest):
    """Generate spacing awareness training exercise"""
    try:
        if not supabase:
            return TrainingResponse(
                success=True,
                data={
                    "target_image": "base64_target",
                    "options": ["base64_option1", "base64_option2", "base64_option3"],
                    "correct_index": 1,
                    "distortion_type": "eye_spacing"
                },
                next_difficulty=request.difficulty_level + 1
            )
        
        faces_result = supabase.table("faces").select("*").eq("user_id", request.user_id).execute()
        faces = faces_result.data
        
        if len(faces) < 2:
            raise HTTPException(status_code=400, detail="Need at least 2 faces for spacing training")
        
        target_face = random.choice(faces)
        distractor_faces = random.sample([f for f in faces if f["id"] != target_face["id"]], 
                                       min(2, len(faces) - 1))
        
        # Generate training data
        training_data = {
            "target_name": target_face["name"],
            "target_traits": target_face["traits"],
            "options": [target_face] + distractor_faces,
            "correct_index": 0,
            "difficulty": request.difficulty_level
        }
        
        return TrainingResponse(
            success=True,
            data=training_data,
            next_difficulty=min(request.difficulty_level + 1, 5)
        )
        
    except Exception as e:
        logger.error(f"Error in spacing training: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/learn/trait-tagging")
async def trait_tagging_training(request: TrainingRequest):
    """Generate trait tagging training exercise"""
    try:
        if not supabase:
            return TrainingResponse(
                success=True,
                data={
                    "face_image": "base64_image",
                    "suggested_traits": ["distinctive eyes", "strong jaw"],
                    "name": "Alex",
                    "context": "Chemistry TA"
                },
                next_difficulty=request.difficulty_level + 1
            )
        
        faces_result = supabase.table("faces").select("*").eq("user_id", request.user_id).execute()
        faces = faces_result.data
        
        if not faces:
            raise HTTPException(status_code=404, detail="No faces found for user")
        
        target_face = random.choice(faces)
        
        training_data = {
            "face_image": target_face["image_url"],
            "name": target_face["name"],
            "role": target_face.get("role"),
            "context": target_face.get("context"),
            "existing_traits": target_face["traits"],
            "suggested_traits": target_face["traits"][:3]  # Show first 3 as suggestions
        }
        
        return TrainingResponse(
            success=True,
            data=training_data,
            next_difficulty=request.difficulty_level
        )
        
    except Exception as e:
        logger.error(f"Error in trait tagging training: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/learn/morph-matching")
async def morph_matching_training(request: TrainingRequest):
    """Generate morph-based matching training exercise"""
    try:
        if not supabase:
            return TrainingResponse(
                success=True,
                data={
                    "morphed_image": "base64_morphed",
                    "options": ["Alex", "Jordan", "Sam"],
                    "correct_answer": "Alex",
                    "morph_percentage": 70
                },
                next_difficulty=request.difficulty_level + 1
            )
        
        faces_result = supabase.table("faces").select("*").eq("user_id", request.user_id).execute()
        faces = faces_result.data
        
        if len(faces) < 2:
            raise HTTPException(status_code=400, detail="Need at least 2 faces for morph training")
        
        # Select target and distractor
        target_face = random.choice(faces)
        distractor_face = random.choice([f for f in faces if f["id"] != target_face["id"]])
        
        # Calculate morph percentage based on difficulty
        morph_percentage = max(30, 100 - (request.difficulty_level * 15))
        
        training_data = {
            "target_name": target_face["name"],
            "distractor_name": distractor_face["name"],
            "morph_percentage": morph_percentage,
            "options": [target_face["name"], distractor_face["name"]],
            "correct_answer": target_face["name"]
        }
        
        return TrainingResponse(
            success=True,
            data=training_data,
            next_difficulty=min(request.difficulty_level + 1, 5)
        )
        
    except Exception as e:
        logger.error(f"Error in morph matching training: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/learn/update-progress")
async def update_training_progress(
    user_id: str = Form(...),
    face_id: str = Form(...),
    module_type: str = Form(...),
    accuracy: float = Form(...),
    difficulty_level: int = Form(...)
):
    """Update training progress for a specific face and module"""
    try:
        if not supabase:
            return {"success": True, "message": "Progress updated (mock)"}
        
        # Get current progress
        face_result = supabase.table("faces").select("training_progress").eq("id", face_id).execute()
        if not face_result.data:
            raise HTTPException(status_code=404, detail="Face not found")
        
        current_progress = face_result.data[0]["training_progress"] or {}
        
        # Update progress for the specific module
        if module_type not in current_progress:
            current_progress[module_type] = {"level": 1, "accuracy": 0}
        
        current_progress[module_type]["accuracy"] = accuracy
        current_progress[module_type]["level"] = difficulty_level
        
        # Update in database
        supabase.table("faces").update({
            "training_progress": current_progress
        }).eq("id", face_id).execute()
        
        return {"success": True, "message": "Progress updated successfully"}
        
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
        
        # Detect faces
        rgb_image = cv2.cvtColor(image, cv2.COLOR_BGR2RGB)
        face_locations = face_recognition.face_locations(rgb_image)
        face_encodings = face_recognition.face_encodings(rgb_image, face_locations)
        
        if not supabase:
            # Mock response for development
            mock_faces = []
            for i, (top, right, bottom, left) in enumerate(face_locations):
                mock_faces.append({
                    "bbox": [left, top, right, bottom],
                    "name": f"Person {i+1}",
                    "role": "Unknown",
                    "context": "Unknown",
                    "confidence": 0.85,
                    "emotion": "neutral",
                    "traits": ["distinctive features"],
                    "caricature_data": None
                })
            
            return ScanResponse(
                faces=mock_faces,
                processing_time=time.time() - start_time
            )
        
        # Get user's known faces
        faces_result = supabase.table("faces").select("*").eq("user_id", request.user_id).execute()
        known_faces = faces_result.data
        
        # Extract known embeddings
        known_embeddings = []
        known_face_data = []
        for face_data in known_faces:
            if face_data["embedding"]:
                known_embeddings.append(face_data["embedding"])
                known_face_data.append(face_data)
        
        identified_faces = []
        
        for i, (face_encoding, face_location) in enumerate(zip(face_encodings, face_locations)):
            top, right, bottom, left = face_location
            
            # Find best match
            best_match = None
            best_confidence = 0
            
            if known_embeddings:
                # Calculate similarities
                similarities = cosine_similarity([face_encoding], known_embeddings)[0]
                best_idx = np.argmax(similarities)
                best_confidence = similarities[best_idx]
                
                # Threshold for positive identification
                if best_confidence > 0.6:  # Adjust threshold as needed
                    best_match = known_face_data[best_idx]
            
            # Extract face for emotion detection
            face_image = image[top:bottom, left:right]
            emotion = detect_emotion(face_image) if request.show_emotion else "neutral"
            
            # Prepare face data
            face_data = {
                "bbox": [left, top, right, bottom],
                "confidence": float(best_confidence),
                "emotion": emotion
            }
            
            if best_match:
                face_data.update({
                    "name": best_match["name"],
                    "role": best_match.get("role", ""),
                    "context": best_match.get("context", ""),
                    "traits": best_match["traits"],
                    "caricature_highlights": best_match["caricature_highlights"] if request.show_caricature else None
                })
            else:
                face_data.update({
                    "name": "Unknown",
                    "role": "",
                    "context": "",
                    "traits": [],
                    "caricature_highlights": None
                })
            
            identified_faces.append(face_data)
        
        processing_time = time.time() - start_time
        
        return ScanResponse(
            faces=identified_faces,
            processing_time=processing_time
        )
        
    except Exception as e:
        logger.error(f"Error in scan and identify: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/faces/{user_id}")
async def get_user_faces(user_id: str):
    """Get all faces for a user"""
    try:
        if not supabase:
            return {"faces": [], "count": 0}
        
        result = supabase.table("faces").select("*").eq("user_id", user_id).execute()
        return {"faces": result.data, "count": len(result.data)}
        
    except Exception as e:
        logger.error(f"Error getting user faces: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.delete("/faces/{face_id}")
async def delete_face(face_id: str):
    """Delete a face from the database"""
    try:
        if not supabase:
            return {"success": True, "message": "Face deleted (mock)"}
        
        supabase.table("faces").delete().eq("id", face_id).execute()
        return {"success": True, "message": "Face deleted successfully"}
        
    except Exception as e:
        logger.error(f"Error deleting face: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/health")
async def health_check():
    """Health check endpoint"""
    return {
        "status": "healthy",
        "services": {
            "supabase": "connected" if supabase else "not configured",
            "anthropic": "connected" if anthropic_client else "not configured",
            "opencv": "available",
            "mediapipe": "available",
            "face_recognition": "available"
        }
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)