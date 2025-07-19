"""
AI Training System for Memora
Generates face recognition training exercises with auto-generated content
"""
import cv2
import numpy as np
import random
import base64
import io
from PIL import Image, ImageDraw, ImageFilter
from typing import Dict, List, Optional, Tuple
import logging
import requests
from urllib.parse import urlparse

logger = logging.getLogger(__name__)

class AdaptiveDifficultyManager:
    """Manages adaptive difficulty for training modules"""
    
    def __init__(self):
        self.min_accuracy_threshold = 0.6
        self.max_accuracy_threshold = 0.85
        self.min_level = 1
        self.max_level = 5
    
    def calculate_next_level(self, current_level: int, accuracy: float, completed_lessons: int = 0) -> int:
        """Calculate next difficulty level based on performance"""
        
        # Increase difficulty if accuracy is high
        if accuracy >= self.max_accuracy_threshold and completed_lessons > 2:
            return min(current_level + 1, self.max_level)
        
        # Decrease difficulty if accuracy is low
        elif accuracy < self.min_accuracy_threshold:
            return max(current_level - 1, self.min_level)
        
        # Maintain current level if performance is moderate
        return current_level

class FaceGenerator:
    """Generates sample faces for training when user has no connections"""
    
    def __init__(self):
        self.sample_faces = [
            {
                "id": "sample_1",
                "name": "Alex Chen",
                "image_url": "https://images.pexels.com/photos/2379004/pexels-photo-2379004.jpeg?auto=compress&cs=tinysrgb&w=400",
                "traits": ["expressive eyes", "defined jawline", "warm smile"],
                "description": "Friendly colleague with distinctive features"
            },
            {
                "id": "sample_2", 
                "name": "Jordan Smith",
                "image_url": "https://images.pexels.com/photos/1222271/pexels-photo-1222271.jpeg?auto=compress&cs=tinysrgb&w=400",
                "traits": ["gentle features", "kind eyes", "soft smile"],
                "description": "Approachable person with memorable characteristics"
            },
            {
                "id": "sample_3",
                "name": "Taylor Johnson", 
                "image_url": "https://images.pexels.com/photos/1239291/pexels-photo-1239291.jpeg?auto=compress&cs=tinysrgb&w=400",
                "traits": ["strong features", "confident expression", "distinctive nose"],
                "description": "Professional with striking facial structure"
            },
            {
                "id": "sample_4",
                "name": "Casey Williams",
                "image_url": "https://images.pexels.com/photos/1681010/pexels-photo-1681010.jpeg?auto=compress&cs=tinysrgb&w=400", 
                "traits": ["bright eyes", "friendly smile", "oval face"],
                "description": "Cheerful individual with memorable features"
            },
            {
                "id": "sample_5",
                "name": "Morgan Davis",
                "image_url": "https://images.pexels.com/photos/1043471/pexels-photo-1043471.jpeg?auto=compress&cs=tinysrgb&w=400",
                "traits": ["angular features", "intense gaze", "prominent cheekbones"], 
                "description": "Distinguished person with sharp characteristics"
            },
            {
                "id": "sample_6",
                "name": "Riley Brown",
                "image_url": "https://images.pexels.com/photos/1212984/pexels-photo-1212984.jpeg?auto=compress&cs=tinysrgb&w=400",
                "traits": ["round face", "cheerful expression", "dimpled smile"],
                "description": "Warm personality with distinctive smile"
            }
        ]
    
    def get_sample_faces(self) -> List[Dict]:
        """Return list of sample faces for training"""
        return self.sample_faces
    
    def download_and_encode_image(self, image_url: str) -> Optional[str]:
        """Download image from URL and encode as base64"""
        try:
            response = requests.get(image_url, timeout=10)
            if response.status_code == 200:
                # Convert to PIL Image
                image = Image.open(io.BytesIO(response.content))
                
                # Resize to standard size
                image = image.resize((256, 256), Image.Resampling.LANCZOS)
                
                # Convert to RGB if needed
                if image.mode != 'RGB':
                    image = image.convert('RGB')
                
                # Encode to base64
                buffer = io.BytesIO()
                image.save(buffer, format='JPEG', quality=85)
                img_str = base64.b64encode(buffer.getvalue()).decode()
                return f"data:image/jpeg;base64,{img_str}"
            
        except Exception as e:
            logger.error(f"Error downloading image {image_url}: {e}")
        
        return None
    
    def create_distorted_image(self, base64_image: str, distortion_type: str, intensity: float = 0.3) -> Optional[str]:
        """Create a distorted version of the image"""
        try:
            # Decode base64 image
            if base64_image.startswith('data:image'):
                base64_image = base64_image.split(',')[1]
            
            image_data = base64.b64decode(base64_image)
            image = Image.open(io.BytesIO(image_data))
            
            # Apply distortion based on type
            if distortion_type == "eye_spacing":
                # Simulate wider eye spacing by stretching horizontally
                width, height = image.size
                new_width = int(width * (1 + intensity * 0.5))
                image = image.resize((new_width, height), Image.Resampling.LANCZOS)
                image = image.crop((int((new_width - width) / 2), 0, int((new_width + width) / 2), height))
                
            elif distortion_type == "face_width":
                # Make face appear wider
                width, height = image.size
                new_width = int(width * (1 + intensity))
                image = image.resize((new_width, height), Image.Resampling.LANCZOS)
                image = image.crop((int((new_width - width) / 2), 0, int((new_width + width) / 2), height))
                
            elif distortion_type == "brightness":
                # Adjust brightness
                from PIL import ImageEnhance
                enhancer = ImageEnhance.Brightness(image)
                image = enhancer.enhance(1 + intensity)
                
            elif distortion_type == "blur":
                # Apply slight blur
                image = image.filter(ImageFilter.GaussianBlur(radius=intensity * 2))
            
            # Encode back to base64
            buffer = io.BytesIO()
            image.save(buffer, format='JPEG', quality=85)
            img_str = base64.b64encode(buffer.getvalue()).decode()
            return f"data:image/jpeg;base64,{img_str}"
            
        except Exception as e:
            logger.error(f"Error creating distorted image: {e}")
            return None

class TrainingAI:
    """Main AI training system"""
    
    def __init__(self):
        self.face_generator = FaceGenerator()
        self.difficulty_manager = AdaptiveDifficultyManager()
    
    def generate_caricature_exercise(self, target_face: Dict, difficulty_level: int, available_faces: List[Dict]) -> Dict:
        """Generate caricature training exercise"""
        try:
            # Use sample faces if no user faces available
            if not available_faces:
                available_faces = self.face_generator.get_sample_faces()
            
            if not available_faces:
                return {"error": "No faces available for training"}
            
            target_face = random.choice(available_faces)
            
            # Download and encode original image
            original_image_b64 = self.face_generator.download_and_encode_image(target_face["image_url"])
            if not original_image_b64:
                return {"error": "Failed to load training image"}
            
            # Create exaggerated version
            distortion_types = ["eye_spacing", "face_width", "brightness"]
            distortion_type = random.choice(distortion_types)
            modified_image_b64 = self.face_generator.create_distorted_image(
                original_image_b64, distortion_type, 0.4
            )
            
            if not modified_image_b64:
                modified_image_b64 = original_image_b64  # Fallback to original
            
            # Generate question and options
            feature_focus = {
                "eye_spacing": "eye spacing",
                "face_width": "face width", 
                "brightness": "lighting"
            }.get(distortion_type, "facial features")
            
            question = f"Which version of {target_face['name']} shows exaggerated {feature_focus}?"
            
            options = [
                "Original version",
                "Exaggerated version",
                "Both look the same",
                "Cannot determine"
            ]
            
            correct_index = 1  # Exaggerated version
            
            return {
                "exercise_type": "caricature",
                "question": question,
                "original_image": original_image_b64,
                "modified_image": modified_image_b64,
                "options": options,
                "correct_index": correct_index,
                "level": difficulty_level,
                "hints": [
                    f"Focus on the {feature_focus} differences",
                    "Compare the two images carefully",
                    "Look for subtle but noticeable changes"
                ],
                "show_hints": difficulty_level <= 2
            }
            
        except Exception as e:
            logger.error(f"Error generating caricature exercise: {e}")
            return {"error": f"Exercise generation failed: {str(e)}"}
    
    def generate_spacing_exercise(self, target_face: Dict, difficulty_level: int, available_faces: List[Dict]) -> Dict:
        """Generate spacing awareness exercise"""
        try:
            # Use sample faces if no user faces available
            if not available_faces:
                available_faces = self.face_generator.get_sample_faces()
            
            if not available_faces:
                return {"error": "No faces available for training"}
            
            target_face = random.choice(available_faces)
            
            # Download original image
            original_image_b64 = self.face_generator.download_and_encode_image(target_face["image_url"])
            if not original_image_b64:
                return {"error": "Failed to load training image"}
            
            # Create variations with different spacing
            variations = []
            distortion_types = ["eye_spacing", "face_width", "brightness", "blur"]
            
            # Add original as one option
            variations.append(original_image_b64)
            
            # Create distorted versions
            for i in range(3):
                distortion_type = random.choice(distortion_types)
                intensity = 0.2 + (i * 0.1)  # Varying intensities
                distorted = self.face_generator.create_distorted_image(
                    original_image_b64, distortion_type, intensity
                )
                variations.append(distorted or original_image_b64)
            
            # Shuffle and track correct answer
            correct_index = 0  # Original is always correct
            random.shuffle(variations)
            
            # Find where original ended up after shuffle
            for i, variation in enumerate(variations):
                if variation == original_image_b64:
                    correct_index = i
                    break
            
            question = f"Which image shows {target_face['name']} with the most natural facial proportions?"
            
            option_labels = [f"Option {i+1}" for i in range(len(variations))]
            
            return {
                "exercise_type": "spacing",
                "question": question,
                "options": variations,
                "option_labels": option_labels,
                "correct_index": correct_index,
                "level": difficulty_level,
                "target_name": target_face["name"]
            }
            
        except Exception as e:
            logger.error(f"Error generating spacing exercise: {e}")
            return {"error": f"Exercise generation failed: {str(e)}"}
    
    def generate_trait_identification_exercise(self, target_face: Dict, difficulty_level: int, available_faces: List[Dict]) -> Dict:
        """Generate trait identification exercise"""
        try:
            # Use sample faces if no user faces available
            if not available_faces:
                available_faces = self.face_generator.get_sample_faces()
            
            if not available_faces:
                return {"error": "No faces available for training"}
            
            target_face = random.choice(available_faces)
            
            # Download image
            face_image_b64 = self.face_generator.download_and_encode_image(target_face["image_url"])
            if not face_image_b64:
                return {"error": "Failed to load training image"}
            
            # Get target traits
            target_traits = target_face.get("traits", ["distinctive features"])
            
            # Generate distractor traits
            all_possible_traits = [
                "round eyes", "almond eyes", "deep-set eyes", "prominent eyes",
                "straight nose", "aquiline nose", "button nose", "wide nose",
                "full lips", "thin lips", "wide smile", "subtle smile",
                "square jaw", "round jaw", "pointed chin", "soft jawline",
                "high cheekbones", "full cheeks", "angular face", "round face",
                "thick eyebrows", "thin eyebrows", "arched eyebrows", "straight eyebrows"
            ]
            
            # Create options with correct traits and distractors
            options = target_traits[:2]  # Take first 2 correct traits
            
            # Add distractors
            distractors = [trait for trait in all_possible_traits if trait not in target_traits]
            random.shuffle(distractors)
            options.extend(distractors[:4])  # Add 4 distractors
            
            # Shuffle all options
            random.shuffle(options)
            
            # Find correct indices
            correct_indices = []
            for i, option in enumerate(options):
                if option in target_traits:
                    correct_indices.append(i)
            
            question = f"Which facial traits best describe {target_face['name']}? (Select all that apply)"
            
            return {
                "exercise_type": "trait_identification",
                "question": question,
                "face_image": face_image_b64,
                "options": options,
                "correct_indices": correct_indices,
                "is_multiple_choice": True,
                "level": difficulty_level,
                "hints": [
                    "Look carefully at the facial features",
                    "Consider the shape and size of different features",
                    "Multiple answers may be correct"
                ],
                "show_hints": difficulty_level <= 2
            }
            
        except Exception as e:
            logger.error(f"Error generating trait identification exercise: {e}")
            return {"error": f"Exercise generation failed: {str(e)}"}
    
    def generate_morph_matching_exercise(self, target_face: Dict, difficulty_level: int, available_faces: List[Dict]) -> Dict:
        """Generate morph matching exercise"""
        try:
            # Use sample faces if no user faces available
            if not available_faces:
                available_faces = self.face_generator.get_sample_faces()
            
            if len(available_faces) < 2:
                return {"error": "Need at least 2 faces for morph matching"}
            
            # Select two different faces
            face1 = random.choice(available_faces)
            face2 = random.choice([f for f in available_faces if f["id"] != face1["id"]])
            
            # Download images
            image1_b64 = self.face_generator.download_and_encode_image(face1["image_url"])
            image2_b64 = self.face_generator.download_and_encode_image(face2["image_url"])
            
            if not image1_b64 or not image2_b64:
                return {"error": "Failed to load training images"}
            
            # Create a simple "morph" by blending
            morphed_image_b64 = self.create_simple_morph(image1_b64, image2_b64)
            
            # Generate options
            options = [
                face1["name"],
                face2["name"],
                f"Blend of {face1['name']} and {face2['name']}",
                "Unknown person"
            ]
            
            correct_index = 2  # Blend option
            
            question = "This image appears to be a combination of which people?"
            
            return {
                "exercise_type": "morph_matching",
                "question": question,
                "morphed_image": morphed_image_b64,
                "options": options,
                "correct_index": correct_index,
                "level": difficulty_level,
                "source_faces": [face1["name"], face2["name"]]
            }
            
        except Exception as e:
            logger.error(f"Error generating morph matching exercise: {e}")
            return {"error": f"Exercise generation failed: {str(e)}"}
    
    def create_simple_morph(self, image1_b64: str, image2_b64: str, alpha: float = 0.5) -> Optional[str]:
        """Create a simple morph by blending two images"""
        try:
            # Decode both images
            if image1_b64.startswith('data:image'):
                image1_b64 = image1_b64.split(',')[1]
            if image2_b64.startswith('data:image'):
                image2_b64 = image2_b64.split(',')[1]
            
            image1_data = base64.b64decode(image1_b64)
            image2_data = base64.b64decode(image2_b64)
            
            image1 = Image.open(io.BytesIO(image1_data))
            image2 = Image.open(io.BytesIO(image2_data))
            
            # Ensure same size
            size = (256, 256)
            image1 = image1.resize(size, Image.Resampling.LANCZOS)
            image2 = image2.resize(size, Image.Resampling.LANCZOS)
            
            # Convert to RGBA for blending
            image1 = image1.convert('RGBA')
            image2 = image2.convert('RGBA')
            
            # Blend images
            blended = Image.blend(image1, image2, alpha)
            blended = blended.convert('RGB')
            
            # Encode back to base64
            buffer = io.BytesIO()
            blended.save(buffer, format='JPEG', quality=85)
            img_str = base64.b64encode(buffer.getvalue()).decode()
            return f"data:image/jpeg;base64,{img_str}"
            
        except Exception as e:
            logger.error(f"Error creating morph: {e}")
            return None