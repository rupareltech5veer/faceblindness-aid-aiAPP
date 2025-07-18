"""
AI Training Modules for Memora Learn Page
Implements adaptive difficulty training for prosopagnosia assistance
"""
import cv2
import numpy as np
import base64
import io
from PIL import Image
import random
import math
from typing import Dict, List, Tuple, Optional, Any
import logging
from sklearn.metrics.pairwise import cosine_similarity

logger = logging.getLogger(__name__)

class AdaptiveDifficultyManager:
    """Manages adaptive difficulty progression for training modules"""
    
    def __init__(self):
        self.accuracy_threshold = 0.8  # 80% accuracy to advance
        self.max_level = 10
        self.min_level = 1
    
    def calculate_next_level(self, current_level: int, accuracy: float, 
                           completed_lessons: int) -> int:
        """Calculate next difficulty level based on performance"""
        if accuracy >= self.accuracy_threshold:
            # Advance to next level if accuracy is high enough
            return min(current_level + 1, self.max_level)
        elif accuracy < 0.5 and current_level > self.min_level:
            # Drop level if accuracy is very low
            return max(current_level - 1, self.min_level)
        else:
            # Stay at current level
            return current_level
    
    def get_difficulty_params(self, module_type: str, level: int) -> Dict[str, Any]:
        """Get difficulty parameters for specific module and level"""
        params = {
            "caricature": {
                "exaggeration_factor": max(0.1, 0.8 - (level - 1) * 0.07),  # 0.8 to 0.17
                "show_hints": level <= 3,
                "num_distractors": min(2 + level // 3, 4),  # 2 to 4
            },
            "spacing": {
                "distortion_magnitude": max(0.05, 0.3 - (level - 1) * 0.025),  # 0.3 to 0.075
                "num_options": min(2 + level // 2, 5),  # 2 to 5
                "show_original": level <= 2,
            },
            "trait_identification": {
                "num_traits_shown": max(1, 4 - level // 3),  # 4 to 1
                "include_distractors": level > 3,
                "show_hints": level <= 5,
            },
            "morph_matching": {
                "morph_percentage": max(30, 90 - (level - 1) * 6),  # 90% to 36%
                "num_options": min(2 + level // 2, 4),  # 2 to 4
                "show_percentage": level <= 4,
            }
        }
        return params.get(module_type, {})

class TrainingAI:
    """Main AI class for generating training exercises"""
    
    def __init__(self):
        self.difficulty_manager = AdaptiveDifficultyManager()
        
        # Facial landmark indices for different features
        self.landmark_indices = {
            'left_eye': [36, 37, 38, 39, 40, 41],
            'right_eye': [42, 43, 44, 45, 46, 47],
            'nose': [27, 28, 29, 30, 31, 32, 33, 34, 35],
            'mouth': [48, 49, 50, 51, 52, 53, 54, 55, 56, 57, 58, 59],
            'jaw': [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16],
            'eyebrows': [17, 18, 19, 20, 21, 22, 23, 24, 25, 26]
        }
    
    def encode_image_to_base64(self, image: np.ndarray) -> str:
        """Convert OpenCV image to base64 string"""
        try:
            _, buffer = cv2.imencode('.jpg', image)
            return base64.b64encode(buffer).decode('utf-8')
        except Exception as e:
            logger.error(f"Error encoding image to base64: {e}")
            return ""
    
    def decode_base64_to_image(self, base64_str: str) -> Optional[np.ndarray]:
        """Convert base64 string to OpenCV image"""
        try:
            if ',' in base64_str:
                base64_str = base64_str.split(',')[1]
            
            image_bytes = base64.b64decode(base64_str)
            image = Image.open(io.BytesIO(image_bytes))
            return cv2.cvtColor(np.array(image), cv2.COLOR_RGB2BGR)
        except Exception as e:
            logger.error(f"Error decoding base64 to image: {e}")
            return None
    
    def apply_facial_warping(self, image: np.ndarray, landmarks: List[List[float]], 
                           feature: str, intensity: float) -> np.ndarray:
        """Apply facial warping to exaggerate specific features"""
        try:
            if not landmarks or len(landmarks) < 68:
                return image
            
            height, width = image.shape[:2]
            warped_image = image.copy()
            
            # Convert landmarks to pixel coordinates
            points = []
            for landmark in landmarks:
                x = int(landmark[0] * width) if landmark[0] <= 1.0 else int(landmark[0])
                y = int(landmark[1] * height) if landmark[1] <= 1.0 else int(landmark[1])
                points.append([x, y])
            
            points = np.array(points, dtype=np.float32)
            
            if feature == "eyes" and len(points) > 47:
                # Exaggerate eye size
                left_eye = points[36:42]
                right_eye = points[42:48]
                
                # Calculate eye centers
                left_center = np.mean(left_eye, axis=0)
                right_center = np.mean(right_eye, axis=0)
                
                # Scale eyes outward from center
                scale_factor = 1.0 + intensity
                for i in range(36, 42):
                    direction = points[i] - left_center
                    points[i] = left_center + direction * scale_factor
                
                for i in range(42, 48):
                    direction = points[i] - right_center
                    points[i] = right_center + direction * scale_factor
            
            elif feature == "nose" and len(points) > 35:
                # Exaggerate nose length
                nose_tip = points[30]
                nose_bridge = points[27]
                
                direction = nose_tip - nose_bridge
                points[30] = nose_bridge + direction * (1.0 + intensity)
                
                # Adjust surrounding nose points
                for i in [31, 32, 33, 34, 35]:
                    if i < len(points):
                        direction = points[i] - nose_bridge
                        points[i] = nose_bridge + direction * (1.0 + intensity * 0.5)
            
            elif feature == "jaw" and len(points) > 16:
                # Exaggerate jaw width
                jaw_center = np.mean(points[6:11], axis=0)
                
                for i in range(17):
                    if i < 6 or i > 10:  # Exclude chin area
                        direction = points[i] - jaw_center
                        points[i] = jaw_center + direction * (1.0 + intensity)
            
            # Apply thin plate spline warping
            original_points = np.array(landmarks[:68], dtype=np.float32)
            if original_points.shape[0] > 0:
                # Convert normalized coordinates to pixel coordinates
                for i in range(len(original_points)):
                    if original_points[i][0] <= 1.0:
                        original_points[i][0] *= width
                        original_points[i][1] *= height
                
                # Create transformation
                tps = cv2.createThinPlateSplineShapeTransformer()
                matches = [cv2.DMatch(i, i, 0) for i in range(len(points))]
                tps.estimateTransformation(original_points.reshape(1, -1, 2), 
                                         points.reshape(1, -1, 2), matches)
                
                # Apply transformation
                warped_image = tps.warpImage(image)
            
            return warped_image
            
        except Exception as e:
            logger.error(f"Error applying facial warping: {e}")
            return image
    
    def apply_spacing_distortion(self, image: np.ndarray, landmarks: List[List[float]], 
                               distortion_type: str, magnitude: float) -> np.ndarray:
        """Apply geometric distortions for spacing awareness training"""
        try:
            if not landmarks or len(landmarks) < 68:
                return image
            
            height, width = image.shape[:2]
            distorted_image = image.copy()
            
            # Convert landmarks to pixel coordinates
            points = []
            for landmark in landmarks:
                x = int(landmark[0] * width) if landmark[0] <= 1.0 else int(landmark[0])
                y = int(landmark[1] * height) if landmark[1] <= 1.0 else int(landmark[1])
                points.append([x, y])
            
            points = np.array(points, dtype=np.float32)
            original_points = points.copy()
            
            if distortion_type == "eye_spacing" and len(points) > 47:
                # Adjust distance between eyes
                left_eye_center = np.mean(points[36:42], axis=0)
                right_eye_center = np.mean(points[42:48], axis=0)
                eye_center = (left_eye_center + right_eye_center) / 2
                
                # Move eyes closer or farther apart
                direction_left = left_eye_center - eye_center
                direction_right = right_eye_center - eye_center
                
                adjustment = 1.0 + magnitude * (1 if random.random() > 0.5 else -1)
                
                new_left_center = eye_center + direction_left * adjustment
                new_right_center = eye_center + direction_right * adjustment
                
                # Update eye points
                left_offset = new_left_center - left_eye_center
                right_offset = new_right_center - right_eye_center
                
                for i in range(36, 42):
                    points[i] += left_offset
                for i in range(42, 48):
                    points[i] += right_offset
            
            elif distortion_type == "mouth_position" and len(points) > 67:
                # Adjust mouth vertical position
                mouth_center = np.mean(points[48:68], axis=0)
                nose_tip = points[30]
                
                # Move mouth up or down
                adjustment = magnitude * height * 0.05 * (1 if random.random() > 0.5 else -1)
                
                for i in range(48, 68):
                    points[i][1] += adjustment
            
            elif distortion_type == "face_width":
                # Adjust overall face width
                face_center_x = np.mean(points[:17, 0])
                adjustment = 1.0 + magnitude * (1 if random.random() > 0.5 else -1)
                
                for i in range(17):
                    direction = points[i][0] - face_center_x
                    points[i][0] = face_center_x + direction * adjustment
            
            # Apply transformation if points changed significantly
            if np.linalg.norm(points - original_points) > 5:
                tps = cv2.createThinPlateSplineShapeTransformer()
                matches = [cv2.DMatch(i, i, 0) for i in range(len(points))]
                tps.estimateTransformation(original_points.reshape(1, -1, 2), 
                                         points.reshape(1, -1, 2), matches)
                distorted_image = tps.warpImage(image)
            
            return distorted_image
            
        except Exception as e:
            logger.error(f"Error applying spacing distortion: {e}")
            return image
    
    def create_face_morph(self, image1: np.ndarray, image2: np.ndarray, 
                         landmarks1: List[List[float]], landmarks2: List[List[float]], 
                         alpha: float) -> np.ndarray:
        """Create morphed face between two images"""
        try:
            # Resize images to same size
            target_size = (256, 256)
            img1_resized = cv2.resize(image1, target_size)
            img2_resized = cv2.resize(image2, target_size)
            
            # Simple alpha blending (in production, use Delaunay triangulation)
            morphed = cv2.addWeighted(img1_resized, alpha, img2_resized, 1-alpha, 0)
            
            return morphed
            
        except Exception as e:
            logger.error(f"Error creating face morph: {e}")
            return image1
    
    def generate_caricature_exercise(self, face_data: Dict, level: int, 
                                   all_faces: List[Dict]) -> Dict[str, Any]:
        """Generate caricature training exercise"""
        try:
            params = self.difficulty_manager.get_difficulty_params("caricature", level)
            
            # Load face image
            image_url = face_data.get("image_url", "")
            landmarks = face_data.get("landmark_data", {}).get("points", [])
            name = face_data.get("name", "Unknown")
            traits = face_data.get("trait_descriptions", []) or face_data.get("traits", [])
            
            # Use actual image URL if available, otherwise use placeholder
            if image_url:
                original_image_b64 = image_url
                exaggerated_image_b64 = image_url  # In production, apply warping
            else:
                # Use Pexels placeholder images
                original_image_b64 = "https://images.pexels.com/photos/1239291/pexels-photo-1239291.jpeg"
                exaggerated_image_b64 = "https://images.pexels.com/photos/1040880/pexels-photo-1040880.jpeg"
            
            # Select distinctive feature to exaggerate
            features = ["eyes", "nose", "jaw"]
            selected_feature = random.choice(features)
            
            # Generate options
            correct_answer = name
            distractors = []
            
            # Add distractor names from other faces
            other_faces = [f for f in all_faces if f.get("id") != face_data.get("id")]
            if other_faces:
                distractor_names = [f.get("name", "Unknown") for f in other_faces]
                distractors = random.sample(distractor_names, 
                                          min(params["num_distractors"], len(distractor_names)))
            
            # Add generic distractors if not enough faces
            if len(distractors) < params["num_distractors"]:
                generic_names = ["Alex", "Jordan", "Taylor", "Casey", "Morgan", "Riley"]
                needed = params["num_distractors"] - len(distractors)
                available_generic = [name for name in generic_names if name != correct_answer and name not in distractors]
                distractors.extend(random.sample(available_generic, min(needed, len(available_generic))))
            
            options = [correct_answer] + distractors
            random.shuffle(options)
            correct_index = options.index(correct_answer)
            
            # Prepare hints
            hints = []
            if params["show_hints"] and traits:
                hints = traits[:2]  # Show first 2 traits as hints
            elif params["show_hints"]:
                hints = [f"Look for distinctive {selected_feature}", "Focus on facial proportions"]
            
            return {
                "exercise_type": "caricature",
                "level": level,
                "original_image": original_image_b64,
                "modified_image": exaggerated_image_b64,
                "exaggerated_feature": selected_feature,
                "question": f"Who is this person? (Focus on the {selected_feature})",
                "options": options,
                "correct_index": correct_index,
                "hints": hints,
                "show_hints": params["show_hints"]
            }
            
        except Exception as e:
            logger.error(f"Error generating caricature exercise: {e}")
            return {"error": "Failed to generate caricature exercise"}
    
    def generate_spacing_exercise(self, face_data: Dict, level: int, 
                                all_faces: List[Dict]) -> Dict[str, Any]:
        """Generate spacing awareness exercise"""
        try:
            params = self.difficulty_manager.get_difficulty_params("spacing", level)
            
            name = face_data.get("name", "Unknown")
            landmarks = face_data.get("landmark_data", {}).get("points", [])
            
            # Create original and distorted versions
            original_image_b64 = "data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAABAAEDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAUEAEAAAAAAAAAAAAAAAAAAAAA/8QAFQEBAQAAAAAAAAAAAAAAAAAAAAX/xAAUEQEAAAAAAAAAAAAAAAAAAAAA/9oADAMBAAIRAxEAPwCdABmX/9k="
            
            # Generate distorted options
            distortion_types = ["eye_spacing", "mouth_position", "face_width"]
            selected_distortion = random.choice(distortion_types)
            
            options = []
            correct_index = 0
            
            # Add original as one option
            if params["show_original"]:
                options.append({
                    "image": original_image_b64,
                    "label": "Original",
                    "is_correct": True
                })
            
            # Generate distorted versions
            for i in range(params["num_options"] - (1 if params["show_original"] else 0)):
                distorted_image_b64 = original_image_b64  # In production, apply distortion
                options.append({
                    "image": distorted_image_b64,
                    "label": f"Option {i + 1}",
                    "is_correct": False
                })
            
            # If not showing original, mark one random option as correct
            if not params["show_original"]:
                correct_index = random.randint(0, len(options) - 1)
                options[correct_index]["is_correct"] = True
                options[correct_index]["label"] = "Correct"
            
            random.shuffle(options)
            
            # Find new correct index after shuffle
            for i, option in enumerate(options):
                if option["is_correct"]:
                    correct_index = i
                    break
            
            return {
                "exercise_type": "spacing",
                "level": level,
                "target_name": name,
                "distortion_type": selected_distortion,
                "question": f"Which image shows {name} with correct facial proportions?",
                "options": [opt["image"] for opt in options],
                "option_labels": [opt["label"] for opt in options],
                "correct_index": correct_index,
                "show_original": params["show_original"]
            }
            
        except Exception as e:
            logger.error(f"Error generating spacing exercise: {e}")
            return {"error": "Failed to generate spacing exercise"}
    
    def generate_trait_identification_exercise(self, face_data: Dict, level: int, 
                                             all_faces: List[Dict]) -> Dict[str, Any]:
        """Generate trait identification exercise"""
        try:
            params = self.difficulty_manager.get_difficulty_params("trait_identification", level)
            
            name = face_data.get("name", "Unknown")
            traits = face_data.get("trait_descriptions", []) or face_data.get("traits", [])
            image_url = face_data.get("image_url", "")
            
            # Use actual image URL if available
            if image_url:
                face_image_b64 = image_url
            else:
                face_image_b64 = "https://images.pexels.com/photos/1239291/pexels-photo-1239291.jpeg"
            
            if not traits:
                traits = ["expressive eyes", "defined jawline", "distinctive nose", "strong features"]
            
            # Select traits to show
            num_traits = min(params["num_traits_shown"], len(traits))
            selected_traits = traits[:num_traits]
            
            # Add distractor traits if needed
            options = selected_traits.copy()
            
            if params["include_distractors"]:
                # Get traits from other faces as distractors
                all_traits = []
                for face in all_faces:
                    if face.get("id") != face_data.get("id"):
                        face_traits = face.get("trait_descriptions", []) or face.get("traits", [])
                        all_traits.extend(face_traits)
                
                # Add generic trait distractors
                generic_traits = [
                    "round face", "square jaw", "thin eyebrows", "wide smile",
                    "small eyes", "large nose", "full lips", "high cheekbones"
                ]
                all_traits.extend(generic_traits)
                
                # Remove duplicates and select distractors
                unique_traits = list(set(all_traits) - set(selected_traits))
                if unique_traits:
                    num_distractors = min(2, len(unique_traits))
                    distractors = random.sample(unique_traits, num_distractors)
                    options.extend(distractors)
            
            random.shuffle(options)
            
            # Mark correct answers
            correct_indices = []
            for i, option in enumerate(options):
                if option in selected_traits:
                    correct_indices.append(i)
            
            # Prepare hints
            hints = []
            if params["show_hints"]:
                hints = [f"Look for {trait}" for trait in selected_traits[:2]]
            
            return {
                "exercise_type": "trait_identification",
                "level": level,
                "face_image": face_image_b64,
                "target_name": name,
                "question": f"Which traits best describe {name}?",
                "options": options,
                "correct_indices": correct_indices,
                "is_multiple_choice": len(correct_indices) > 1,
                "hints": hints,
                "show_hints": params["show_hints"]
            }
            
        except Exception as e:
            logger.error(f"Error generating trait identification exercise: {e}")
            return {"error": "Failed to generate trait identification exercise"}
    
    def generate_morph_matching_exercise(self, face_data: Dict, level: int, 
                                       all_faces: List[Dict]) -> Dict[str, Any]:
        """Generate morph matching exercise"""
        try:
            params = self.difficulty_manager.get_difficulty_params("morph_matching", level)
            
            name = face_data.get("name", "Unknown")
            
            # Select another face for morphing
            other_faces = [f for f in all_faces if f.get("id") != face_data.get("id")]
            if not other_faces:
                return {"error": "Need at least 2 faces for morph matching"}
            
            morph_partner = random.choice(other_faces)
            morph_partner_name = morph_partner.get("name", "Unknown")
            
            # Create morphed image (mocked for demo)
            morphed_image_b64 = "data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAABAAEDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAUEAEAAAAAAAAAAAAAAAAAAAAA/8QAFQEBAQAAAAAAAAAAAAAAAAAAAAX/xAAUEQEAAAAAAAAAAAAAAAAAAAAA/9oADAMBAAIRAxEAPwCdABmX/9k="
            
            # Generate options
            options = [name, morph_partner_name]
            
            # Add more distractors if needed
            remaining_faces = [f for f in other_faces if f.get("id") != morph_partner.get("id")]
            if remaining_faces and params["num_options"] > 2:
                additional_names = [f.get("name", "Unknown") for f in remaining_faces]
                num_additional = min(params["num_options"] - 2, len(additional_names))
                options.extend(random.sample(additional_names, num_additional))
            
            random.shuffle(options)
            correct_index = options.index(name)
            
            # Prepare question
            morph_percentage = params["morph_percentage"]
            question = f"This face is {morph_percentage}% one person and {100-morph_percentage}% another. Who is the primary person?"
            
            if not params["show_percentage"]:
                question = "Who is the primary person in this morphed face?"
            
            return {
                "exercise_type": "morph_matching",
                "level": level,
                "morphed_image": morphed_image_b64,
                "morph_percentage": morph_percentage,
                "primary_person": name,
                "secondary_person": morph_partner_name,
                "question": question,
                "options": options,
                "correct_index": correct_index,
                "show_percentage": params["show_percentage"]
            }
            
        except Exception as e:
            logger.error(f"Error generating morph matching exercise: {e}")
            return {"error": "Failed to generate morph matching exercise"}
    
    def calculate_lesson_progress(self, training_progress: Dict, module_type: str) -> Dict[str, Any]:
        """Calculate lesson progress for a specific module"""
        try:
            module_progress = training_progress.get(module_type, {})
            current_level = module_progress.get("level", 1)
            accuracy = module_progress.get("accuracy", 0)
            completed_lessons = module_progress.get("completed_lessons", 0)
            
            # Calculate percentage complete (10 lessons per module)
            percentage = min(int((completed_lessons / 10) * 100), 100)
            
            return {
                "current_level": current_level,
                "accuracy": accuracy,
                "completed_lessons": completed_lessons,
                "total_lessons": 10,
                "percentage_complete": percentage,
                "next_lesson_available": completed_lessons < 10
            }
            
        except Exception as e:
            logger.error(f"Error calculating lesson progress: {e}")
            return {
                "current_level": 1,
                "accuracy": 0,
                "completed_lessons": 0,
                "total_lessons": 10,
                "percentage_complete": 0,
                "next_lesson_available": True
            }