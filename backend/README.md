# Memora AI Backend

AI-powered backend for Memora, an assistive app for people with prosopagnosia (face blindness).

## Features

### Core AI Components
- **Face Recognition**: Real-time face detection and identification using face_recognition library
- **Facial Landmark Analysis**: Detailed facial feature extraction using MediaPipe
- **Emotion Detection**: Real-time emotion recognition from facial expressions
- **Caricature Generation**: Highlight distinctive facial features for better memorization
- **Adaptive Learning**: Dynamic difficulty adjustment based on user performance

### Training Modules
1. **Caricature & Distinctiveness Training**: Exaggerate distinctive traits for better recognition
2. **Spacing Awareness**: Geometric distortion exercises with adaptive difficulty
3. **Trait Tagging**: AI-assisted facial trait identification and description
4. **Context Association**: Link faces with contextual information
5. **Morph-Based Matching**: Progressive face morphing exercises

### Real-time Scanning
- Face detection and identification with confidence scores
- Emotion detection overlay
- Caricature highlighting of distinctive features
- Sub-100ms processing latency per face

## Technology Stack

- **FastAPI**: High-performance web framework
- **OpenCV**: Computer vision and image processing
- **MediaPipe**: Facial landmark detection
- **face_recognition**: Face encoding and matching
- **TensorFlow/Keras**: Emotion detection model
- **Supabase**: Database and real-time subscriptions
- **Anthropic Claude**: AI-powered trait description generation

## Installation

1. Install dependencies:
```bash
pip install -r requirements.txt
```

2. Set up environment variables:
```bash
cp .env.example .env
# Edit .env with your API keys
```

3. Run the server:
```bash
uvicorn main:app --reload
```

## API Endpoints

### Face Management
- `POST /faces/add` - Add new face to database
- `GET /faces/{user_id}` - Get all faces for user
- `DELETE /faces/{face_id}` - Delete face

### Training Modules
- `POST /learn/caricature` - Caricature training exercise
- `POST /learn/spacing` - Spacing awareness training
- `POST /learn/trait-tagging` - Trait tagging exercise
- `POST /learn/morph-matching` - Morph-based matching
- `POST /learn/update-progress` - Update training progress

### Real-time Scanning
- `POST /scan/identify` - Identify faces in image
- `GET /health` - Health check and service status

## Database Schema

The backend extends the existing Supabase schema with AI-specific fields:

### faces table additions:
- `embedding`: 128-dimensional face encoding vector
- `landmark_data`: Facial landmark coordinates
- `caricature_highlights`: Distinctive feature intensity scores
- `training_progress`: Per-module learning progress

### New tables:
- `training_sessions`: Individual training session records
- `face_recognition_logs`: Real-time scan history

## Configuration

### Environment Variables
- `SUPABASE_URL`: Your Supabase project URL
- `SUPABASE_ANON_KEY`: Supabase anonymous key
- `ANTHROPIC_API_KEY`: Claude AI API key for trait generation

### Model Files
Place pre-trained models in the backend directory:
- `emotion_model.h5`: Emotion detection model (FER-2013 based)

## Performance Optimization

- Face embeddings are cached in database for fast similarity matching
- Landmark analysis is optimized for real-time processing
- Adaptive difficulty reduces unnecessary computation
- Database indexes optimize query performance

## Security

- All endpoints require user authentication
- Row Level Security (RLS) enforced on all user data
- No raw video/image storage - only processed embeddings
- API rate limiting and input validation

## Development

### Adding New Training Modules
1. Create endpoint in `main.py`
2. Implement training logic in `ai_models.py`
3. Add database schema updates if needed
4. Update frontend integration

### Extending AI Models
1. Add model class to `ai_models.py`
2. Integrate with existing pipeline
3. Update requirements.txt for new dependencies
4. Add model file to deployment

## Deployment

The backend is designed for deployment on Railway, Heroku, or similar platforms:

1. Set environment variables in deployment platform
2. Upload pre-trained model files
3. Configure database connection
4. Set up monitoring and logging

## Monitoring

- Health check endpoint: `/health`
- Performance metrics logged for all operations
- Error tracking and alerting recommended
- Database query performance monitoring

## License

MIT License - see LICENSE file for details