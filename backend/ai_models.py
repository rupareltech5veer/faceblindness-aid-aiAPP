"""
AI Models and utilities for Memora
"""
import cv2
import numpy as np
import tensorflow as tf
from tensorflow import keras
import mediapipe as mp
from typing import Dict, List, Tuple, Optional
import logging

logger = logging.getLogger(__name__)

class EmotionDetector:
    """Emotion detection using CNN model"""
    
    def __init__(self, model_path: Optional[str] = None):
        self.model = None
        self.emotions = ['angry', 'disgust', 'fear', 'happy', 'sad', 'surprise', 'neutral']
        
        if model_path:
            try:
                self.model = keras.models.load_model(model_path)
                logger.info("Emotion detection model loaded successfully")
            except Exception as e:
                logger.error(f"Failed to load emotion model: {e}")
    
    def detect_emotion(self, face_image: np.ndarray) -> str:
        """Detect emotion from face image"""
        if self.model is None:
            return "neutral"
        
        try:
            # Preprocess image
            face_gray = cv2.cvtColor(face_image, cv2.COLOR_BGR2GRAY)
            face_resized = cv2.resize(face_gray, (48, 48))
            face_normalized = face_resized.astype('float32') / 255.0
            face_reshaped = face_normalized.reshape(1, 48, 48, 1)
            
            # Predict emotion
            predictions = self.model.predict(face_reshaped, verbose=0)
            emotion_idx = np.argmax(predictions[0])
            confidence = predictions[0][emotion_idx]
            
            if confidence > 0.5:
                return self.emotions[emotion_idx]
            else:
                return "neutral"
                
        except Exception as e:
            logger.error(f"Error detecting emotion: {e}")
            return "neutral"

class FacialLandmarkAnalyzer:
    """Advanced facial landmark analysis for trait extraction"""
    
    def __init__(self):
        self.mp_face_mesh = mp.solutions.face_mesh
        self.face_mesh = self.mp_face_mesh.FaceMesh(
            static_image_mode=True,
            max_num_faces=1,
            refine_landmarks=True,
            min_detection_confidence=0.5
        )
        
        # Key landmark indices for different facial features
        self.landmark_indices = {
            'left_eye': [33, 7, 163, 144, 145, 153, 154, 155, 133, 173, 157, 158, 159, 160, 161, 246],
            'right_eye': [362, 382, 381, 380, 374, 373, 390, 249, 263, 466, 388, 387, 386, 385, 384, 398],
            'nose': [1, 2, 5, 4, 6, 19, 20, 94, 125, 141, 235, 236, 237, 238, 239, 240, 241, 242],
            'mouth': [61, 84, 17, 314, 405, 320, 307, 375, 321, 308, 324, 318],
            'jaw': [172, 136, 150, 149, 176, 148, 152, 377, 400, 378, 379, 365, 397, 288, 361, 323],
            'eyebrows': [70, 63, 105, 66, 107, 55, 65, 52, 53, 46, 296, 334, 293, 300, 276, 283, 282, 295, 285]
        }
    
    def extract_landmarks(self, image: np.ndarray) -> Optional[Dict]:
        """Extract detailed facial landmarks"""
        try:
            rgb_image = cv2.cvtColor(image, cv2.COLOR_BGR2RGB)
            results = self.face_mesh.process(rgb_image)
            
            if results.multi_face_landmarks:
                landmarks = results.multi_face_landmarks[0]
                height, width = image.shape[:2]
                
                # Convert normalized coordinates to pixel coordinates
                points = []
                for landmark in landmarks.landmark:
                    x = int(landmark.x * width)
                    y = int(landmark.y * height)
                    z = landmark.z
                    points.append([x, y, z])
                
                return {
                    "points": points,
                    "width": width,
                    "height": height,
                    "feature_points": self._extract_feature_points(points)
                }
            
            return None
            
        except Exception as e:
            logger.error(f"Error extracting landmarks: {e}")
            return None
    
    def _extract_feature_points(self, points: List[List[float]]) -> Dict:
        """Extract specific feature points for analysis"""
        feature_points = {}
        
        for feature_name, indices in self.landmark_indices.items():
            feature_points[feature_name] = []
            for idx in indices:
                if idx < len(points):
                    feature_points[feature_name].append(points[idx])
        
        return feature_points
    
    def analyze_facial_proportions(self, landmarks: Dict) -> Dict[str, float]:
        """Analyze facial proportions and distinctive features"""
        if not landmarks or "feature_points" not in landmarks:
            return {}
        
        feature_points = landmarks["feature_points"]
        proportions = {}
        
        try:
            # Eye analysis
            if "left_eye" in feature_points and "right_eye" in feature_points:
                left_eye_points = np.array(feature_points["left_eye"])
                right_eye_points = np.array(feature_points["right_eye"])
                
                # Eye width
                left_eye_width = np.linalg.norm(left_eye_points[0] - left_eye_points[8])
                right_eye_width = np.linalg.norm(right_eye_points[0] - right_eye_points[8])
                avg_eye_width = (left_eye_width + right_eye_width) / 2
                proportions["eye_width"] = avg_eye_width / landmarks["width"]
                
                # Eye spacing
                eye_distance = np.linalg.norm(left_eye_points[0] - right_eye_points[0])
                proportions["eye_spacing"] = eye_distance / landmarks["width"]
            
            # Nose analysis
            if "nose" in feature_points:
                nose_points = np.array(feature_points["nose"])
                nose_length = np.linalg.norm(nose_points[0] - nose_points[6])
                nose_width = np.linalg.norm(nose_points[12] - nose_points[15])
                proportions["nose_length"] = nose_length / landmarks["height"]
                proportions["nose_width"] = nose_width / landmarks["width"]
            
            # Jaw analysis
            if "jaw" in feature_points:
                jaw_points = np.array(feature_points["jaw"])
                jaw_width = np.linalg.norm(jaw_points[0] - jaw_points[-1])
                proportions["jaw_width"] = jaw_width / landmarks["width"]
            
            # Face shape analysis
            if "jaw" in feature_points and "nose" in feature_points:
                face_length = np.linalg.norm(feature_points["nose"][0] - feature_points["jaw"][7])
                face_width = proportions.get("jaw_width", 0) * landmarks["width"]
                if face_width > 0:
                    proportions["face_ratio"] = face_length / face_width
            
        except Exception as e:
            logger.error(f"Error analyzing proportions: {e}")
        
        return proportions

class CaricatureGenerator:
    """Generate caricature highlights for distinctive features"""
    
    def __init__(self):
        self.landmark_analyzer = FacialLandmarkAnalyzer()
        
        # Average facial proportions (baseline for comparison)
        self.average_proportions = {
            "eye_width": 0.06,
            "eye_spacing": 0.25,
            "nose_length": 0.15,
            "nose_width": 0.08,
            "jaw_width": 0.45,
            "face_ratio": 1.3
        }
    
    def generate_highlights(self, image: np.ndarray) -> Dict[str, float]:
        """Generate caricature highlights based on distinctive features"""
        landmarks = self.landmark_analyzer.extract_landmarks(image)
        if not landmarks:
            return {}
        
        proportions = self.landmark_analyzer.analyze_facial_proportions(landmarks)
        highlights = {}
        
        # Compare to average proportions and highlight distinctive features
        for feature, value in proportions.items():
            if feature in self.average_proportions:
                avg_value = self.average_proportions[feature]
                deviation = abs(value - avg_value) / avg_value
                
                # Convert deviation to highlight intensity (0-1)
                intensity = min(deviation * 2, 1.0)
                
                # Map feature names to highlight categories
                if feature in ["eye_width", "eye_spacing"]:
                    highlights["eyes"] = max(highlights.get("eyes", 0), intensity)
                elif feature in ["nose_length", "nose_width"]:
                    highlights["nose"] = max(highlights.get("nose", 0), intensity)
                elif feature in ["jaw_width"]:
                    highlights["jaw"] = max(highlights.get("jaw", 0), intensity)
                elif feature == "face_ratio":
                    highlights["face_shape"] = intensity
        
        return highlights
    
    def create_caricature_overlay(self, image: np.ndarray, highlights: Dict[str, float]) -> np.ndarray:
        """Create visual caricature overlay"""
        overlay = image.copy()
        height, width = image.shape[:2]
        
        # Create colored overlays for highlighted features
        for feature, intensity in highlights.items():
            if intensity > 0.3:  # Only highlight significant features
                # Use different colors for different features
                if feature == "eyes":
                    color = (0, int(255 * intensity), 0)  # Green
                elif feature == "nose":
                    color = (int(255 * intensity), 0, 0)  # Blue
                elif feature == "jaw":
                    color = (0, 0, int(255 * intensity))  # Red
                else:
                    color = (int(128 * intensity), int(128 * intensity), 0)  # Yellow
                
                alpha = 0.2 * intensity
                
                # Create feature-specific overlays
                if feature == "eyes":
                    cv2.rectangle(overlay, (int(width*0.15), int(height*0.25)), 
                                (int(width*0.85), int(height*0.55)), color, -1)
                elif feature == "nose":
                    cv2.rectangle(overlay, (int(width*0.35), int(height*0.35)), 
                                (int(width*0.65), int(height*0.75)), color, -1)
                elif feature == "jaw":
                    cv2.rectangle(overlay, (int(width*0.1), int(height*0.6)), 
                                (int(width*0.9), int(height*0.95)), color, -1)
        
        # Blend overlay with original image
        result = cv2.addWeighted(image, 0.8, overlay, 0.2, 0)
        return result

class AdaptiveDifficultyManager:
    """Manage adaptive difficulty for training modules"""
    
    def __init__(self):
        self.min_accuracy_threshold = 0.7
        self.max_accuracy_threshold = 0.9
        self.min_level = 1
        self.max_level = 5
    
    def calculate_next_difficulty(self, current_level: int, recent_accuracy: float, 
                                session_count: int = 1) -> int:
        """Calculate next difficulty level based on performance"""
        
        # Increase difficulty if accuracy is high
        if recent_accuracy >= self.max_accuracy_threshold:
            return min(current_level + 1, self.max_level)
        
        # Decrease difficulty if accuracy is low
        elif recent_accuracy < self.min_accuracy_threshold:
            return max(current_level - 1, self.min_level)
        
        # Maintain current level if performance is moderate
        else:
            return current_level
    
    def get_training_parameters(self, module_type: str, difficulty_level: int) -> Dict:
        """Get training parameters based on module type and difficulty"""
        
        base_params = {
            "spacing": {
                1: {"distortion_amount": 0.1, "num_distractors": 2},
                2: {"distortion_amount": 0.15, "num_distractors": 3},
                3: {"distortion_amount": 0.2, "num_distractors": 4},
                4: {"distortion_amount": 0.25, "num_distractors": 5},
                5: {"distortion_amount": 0.3, "num_distractors": 6}
            },
            "matching": {
                1: {"similarity_threshold": 0.8, "num_options": 3},
                2: {"similarity_threshold": 0.75, "num_options": 4},
                3: {"similarity_threshold": 0.7, "num_options": 5},
                4: {"similarity_threshold": 0.65, "num_options": 6},
                5: {"similarity_threshold": 0.6, "num_options": 7}
            },
            "morph": {
                1: {"morph_percentage": 80, "num_options": 2},
                2: {"morph_percentage": 70, "num_options": 3},
                3: {"morph_percentage": 60, "num_options": 3},
                4: {"morph_percentage": 50, "num_options": 4},
                5: {"morph_percentage": 40, "num_options": 4}
            }
        }
        
        return base_params.get(module_type, {}).get(difficulty_level, base_params[module_type][1])