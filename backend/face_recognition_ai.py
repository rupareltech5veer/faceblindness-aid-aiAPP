"""
Advanced Face Recognition AI using FaceNet and MediaPipe
"""
import cv2
import numpy as np
import mediapipe as mp
import torch
import torch.nn.functional as F
from facenet_pytorch import MTCNN, InceptionResnetV1
from PIL import Image
from typing import Dict, List, Tuple, Optional
import logging
from sklearn.metrics.pairwise import cosine_similarity

logger = logging.getLogger(__name__)

class FaceRecognitionAI:
    """Advanced face recognition using FaceNet embeddings and MediaPipe landmarks"""
    
    def __init__(self):
        # Initialize FaceNet model
        self.device = torch.device('cuda' if torch.cuda.is_available() else 'cpu')
        self.mtcnn = MTCNN(
            image_size=160, 
            margin=0, 
            min_face_size=20,
            thresholds=[0.6, 0.7, 0.7],
            factor=0.709,
            post_process=True,
            device=self.device
        )
        self.resnet = InceptionResnetV1(pretrained='vggface2').eval().to(self.device)
        
        # Initialize MediaPipe
        self.mp_face_mesh = mp.solutions.face_mesh
        self.face_mesh = self.mp_face_mesh.FaceMesh(
            static_image_mode=True,
            max_num_faces=10,
            refine_landmarks=True,
            min_detection_confidence=0.5
        )
        
        # Facial landmark indices for different features
        self.landmark_indices = {
            'left_eye': [33, 7, 163, 144, 145, 153, 154, 155, 133, 173, 157, 158, 159, 160, 161, 246],
            'right_eye': [362, 382, 381, 380, 374, 373, 390, 249, 263, 466, 388, 387, 386, 385, 384, 398],
            'nose': [1, 2, 5, 4, 6, 19, 20, 94, 125, 141, 235, 236, 237, 238, 239, 240, 241, 242],
            'mouth': [61, 84, 17, 314, 405, 320, 307, 375, 321, 308, 324, 318],
            'jaw': [172, 136, 150, 149, 176, 148, 152, 377, 400, 378, 379, 365, 397, 288, 361, 323],
            'eyebrows': [70, 63, 105, 66, 107, 55, 65, 52, 53, 46, 296, 334, 293, 300, 276, 283, 282, 295, 285],
            'face_oval': [10, 338, 297, 332, 284, 251, 389, 356, 454, 323, 361, 288, 397, 365, 379, 378, 400, 377, 152, 148, 176, 149, 150, 136, 172, 58, 132, 93, 234, 127, 162, 21, 54, 103, 67, 109]
        }
    
    def extract_face_embedding(self, image: np.ndarray) -> Optional[np.ndarray]:
        """Extract FaceNet embedding from face image"""
        try:
            # Convert BGR to RGB
            if len(image.shape) == 3 and image.shape[2] == 3:
                image_rgb = cv2.cvtColor(image, cv2.COLOR_BGR2RGB)
            else:
                image_rgb = image
            
            # Convert to PIL Image
            pil_image = Image.fromarray(image_rgb)
            
            # Detect and crop face
            face_tensor = self.mtcnn(pil_image)
            
            if face_tensor is None:
                logger.warning("No face detected in image")
                return None
            
            # Add batch dimension and move to device
            face_tensor = face_tensor.unsqueeze(0).to(self.device)
            
            # Extract embedding
            with torch.no_grad():
                embedding = self.resnet(face_tensor)
                embedding = F.normalize(embedding, p=2, dim=1)
            
            return embedding.cpu().numpy().flatten()
            
        except Exception as e:
            logger.error(f"Error extracting face embedding: {e}")
            return None
    
    def extract_facial_landmarks(self, image: np.ndarray) -> Optional[Dict]:
        """Extract facial landmarks using MediaPipe"""
        try:
            # Convert BGR to RGB
            if len(image.shape) == 3 and image.shape[2] == 3:
                image_rgb = cv2.cvtColor(image, cv2.COLOR_BGR2RGB)
            else:
                image_rgb = image
            
            results = self.face_mesh.process(image_rgb)
            
            if not results.multi_face_landmarks:
                return None
            
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
    
    def analyze_facial_traits(self, landmarks: Dict) -> Dict[str, any]:
        """Analyze facial traits from landmarks"""
        if not landmarks or "feature_points" not in landmarks:
            return {}
        
        feature_points = landmarks["feature_points"]
        traits = {}
        
        try:
            # Eye analysis
            if "left_eye" in feature_points and "right_eye" in feature_points:
                left_eye_points = np.array(feature_points["left_eye"])
                right_eye_points = np.array(feature_points["right_eye"])
                
                # Eye width
                left_eye_width = np.linalg.norm(left_eye_points[0] - left_eye_points[8])
                right_eye_width = np.linalg.norm(right_eye_points[0] - right_eye_points[8])
                avg_eye_width = (left_eye_width + right_eye_width) / 2
                traits["eye_width"] = float(avg_eye_width / landmarks["width"])
                
                # Eye spacing (distance between inner corners)
                eye_distance = np.linalg.norm(left_eye_points[0] - right_eye_points[0])
                traits["eye_spacing"] = float(eye_distance / landmarks["width"])
                
                # Eye shape analysis
                left_eye_height = np.linalg.norm(left_eye_points[1] - left_eye_points[5])
                right_eye_height = np.linalg.norm(right_eye_points[1] - right_eye_points[5])
                avg_eye_height = (left_eye_height + right_eye_height) / 2
                eye_aspect_ratio = avg_eye_height / avg_eye_width
                traits["eye_aspect_ratio"] = float(eye_aspect_ratio)
            
            # Nose analysis
            if "nose" in feature_points:
                nose_points = np.array(feature_points["nose"])
                nose_length = np.linalg.norm(nose_points[0] - nose_points[6])
                nose_width = np.linalg.norm(nose_points[12] - nose_points[15]) if len(nose_points) > 15 else 0
                traits["nose_length"] = float(nose_length / landmarks["height"])
                if nose_width > 0:
                    traits["nose_width"] = float(nose_width / landmarks["width"])
                    traits["nose_aspect_ratio"] = float(nose_length / nose_width)
            
            # Jaw analysis
            if "jaw" in feature_points:
                jaw_points = np.array(feature_points["jaw"])
                if len(jaw_points) > 1:
                    jaw_width = np.linalg.norm(jaw_points[0] - jaw_points[-1])
                    traits["jaw_width"] = float(jaw_width / landmarks["width"])
            
            # Face shape analysis
            if "face_oval" in feature_points:
                face_points = np.array(feature_points["face_oval"])
                if len(face_points) > 10:
                    # Calculate face length (top to bottom)
                    face_top = min(face_points, key=lambda p: p[1])
                    face_bottom = max(face_points, key=lambda p: p[1])
                    face_length = np.linalg.norm(np.array(face_top) - np.array(face_bottom))
                    
                    # Calculate face width (left to right)
                    face_left = min(face_points, key=lambda p: p[0])
                    face_right = max(face_points, key=lambda p: p[0])
                    face_width = np.linalg.norm(np.array(face_left) - np.array(face_right))
                    
                    if face_width > 0:
                        traits["face_aspect_ratio"] = float(face_length / face_width)
            
            # Eyebrow analysis
            if "eyebrows" in feature_points:
                eyebrow_points = np.array(feature_points["eyebrows"])
                if len(eyebrow_points) > 10:
                    # Calculate eyebrow angle (simplified)
                    left_brow = eyebrow_points[:len(eyebrow_points)//2]
                    right_brow = eyebrow_points[len(eyebrow_points)//2:]
                    
                    if len(left_brow) > 2 and len(right_brow) > 2:
                        left_angle = np.arctan2(left_brow[-1][1] - left_brow[0][1], 
                                              left_brow[-1][0] - left_brow[0][0])
                        right_angle = np.arctan2(right_brow[-1][1] - right_brow[0][1], 
                                               right_brow[-1][0] - right_brow[0][0])
                        avg_eyebrow_angle = (left_angle + right_angle) / 2
                        traits["eyebrow_angle"] = float(avg_eyebrow_angle)
            
            # Mouth analysis
            if "mouth" in feature_points:
                mouth_points = np.array(feature_points["mouth"])
                if len(mouth_points) > 6:
                    mouth_width = np.linalg.norm(mouth_points[0] - mouth_points[6])
                    mouth_height = np.linalg.norm(mouth_points[3] - mouth_points[9]) if len(mouth_points) > 9 else 0
                    traits["mouth_width"] = float(mouth_width / landmarks["width"])
                    if mouth_height > 0:
                        traits["mouth_aspect_ratio"] = float(mouth_height / mouth_width)
            
        except Exception as e:
            logger.error(f"Error analyzing facial traits: {e}")
        
        return traits
    
    def generate_trait_description(self, traits: Dict[str, float]) -> List[str]:
        """Generate human-readable trait descriptions"""
        descriptions = []
        
        try:
            # Eye descriptions
            if "eye_spacing" in traits:
                if traits["eye_spacing"] > 0.3:
                    descriptions.append("wide-set eyes")
                elif traits["eye_spacing"] < 0.25:
                    descriptions.append("close-set eyes")
                else:
                    descriptions.append("well-spaced eyes")
            
            if "eye_aspect_ratio" in traits:
                if traits["eye_aspect_ratio"] > 0.4:
                    descriptions.append("round eyes")
                elif traits["eye_aspect_ratio"] < 0.3:
                    descriptions.append("narrow eyes")
                else:
                    descriptions.append("almond-shaped eyes")
            
            # Nose descriptions
            if "nose_aspect_ratio" in traits:
                if traits["nose_aspect_ratio"] > 1.5:
                    descriptions.append("long nose")
                elif traits["nose_aspect_ratio"] < 1.0:
                    descriptions.append("button nose")
                else:
                    descriptions.append("proportioned nose")
            
            if "nose_width" in traits:
                if traits["nose_width"] > 0.08:
                    descriptions.append("wide nose")
                elif traits["nose_width"] < 0.06:
                    descriptions.append("narrow nose")
            
            # Jaw descriptions
            if "jaw_width" in traits:
                if traits["jaw_width"] > 0.5:
                    descriptions.append("strong jawline")
                elif traits["jaw_width"] < 0.4:
                    descriptions.append("narrow jaw")
                else:
                    descriptions.append("defined jawline")
            
            # Face shape descriptions
            if "face_aspect_ratio" in traits:
                if traits["face_aspect_ratio"] > 1.4:
                    descriptions.append("oval face")
                elif traits["face_aspect_ratio"] < 1.2:
                    descriptions.append("round face")
                else:
                    descriptions.append("balanced face shape")
            
            # Eyebrow descriptions
            if "eyebrow_angle" in traits:
                if abs(traits["eyebrow_angle"]) > 0.2:
                    descriptions.append("angled eyebrows")
                else:
                    descriptions.append("straight eyebrows")
            
            # Mouth descriptions
            if "mouth_width" in traits:
                if traits["mouth_width"] > 0.12:
                    descriptions.append("wide smile")
                elif traits["mouth_width"] < 0.08:
                    descriptions.append("narrow mouth")
                else:
                    descriptions.append("proportioned mouth")
            
        except Exception as e:
            logger.error(f"Error generating trait descriptions: {e}")
        
        return descriptions[:5]  # Return top 5 most distinctive traits
    
    def compare_embeddings(self, embedding1: np.ndarray, embedding2: np.ndarray) -> float:
        """Compare two face embeddings using cosine similarity"""
        try:
            if embedding1 is None or embedding2 is None:
                return 0.0
            
            # Ensure embeddings are 2D arrays
            if embedding1.ndim == 1:
                embedding1 = embedding1.reshape(1, -1)
            if embedding2.ndim == 1:
                embedding2 = embedding2.reshape(1, -1)
            
            similarity = cosine_similarity(embedding1, embedding2)[0][0]
            return float(similarity)
            
        except Exception as e:
            logger.error(f"Error comparing embeddings: {e}")
            return 0.0
    
    def find_best_match(self, query_embedding: np.ndarray, stored_embeddings: List[Tuple[str, np.ndarray, Dict]]) -> Optional[Tuple[str, float, Dict]]:
        """Find the best matching face from stored embeddings"""
        try:
            if not stored_embeddings or query_embedding is None:
                return None
            
            best_match = None
            best_similarity = 0.0
            best_traits = {}
            
            for connection_id, stored_embedding, traits in stored_embeddings:
                similarity = self.compare_embeddings(query_embedding, stored_embedding)
                
                if similarity > best_similarity:
                    best_similarity = similarity
                    best_match = connection_id
                    best_traits = traits
            
            # Only return matches above threshold
            if best_similarity > 0.6:  # Adjustable threshold
                return (best_match, best_similarity, best_traits)
            
            return None
            
        except Exception as e:
            logger.error(f"Error finding best match: {e}")
            return None