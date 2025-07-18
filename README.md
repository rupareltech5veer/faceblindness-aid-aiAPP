
# Face Blindness Aid App

An AI-powered assistive app for people with face blindness (prosopagnosia). Built with React Native (Expo), FastAPI (Python), and Supabase.

## 🚀 Quick Start

### Prerequisites
- Node.js (v16+)
- Expo CLI: `npm install -g expo-cli`
- Python 3.11+
- pip
- Supabase account

### 1. Install Dependencies
```bash
# Install JS dependencies
cd client
npm install

# Install Python dependencies
cd ../backend
pip install -r requirements.txt
```

### 2. Setup Supabase
1. Create a new Supabase project
2. Run the migration in `supabase/migrations/`
3. Create a storage bucket named `face-uploads`
4. Copy your Supabase URL and anon key

### 3. Environment Setup
Create `client/.env`:
```
EXPO_PUBLIC_SUPABASE_URL=your_supabase_url
EXPO_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
EXPO_PUBLIC_BACKEND_URL=http://192.168.1.100:8000
```

**Important**: Replace `192.168.1.100` with your actual computer's IP address. To find your IP:
- **Windows**: Run `ipconfig` in Command Prompt, look for "IPv4 Address"
- **macOS/Linux**: Run `ifconfig` or `ip addr show` in Terminal
- **Alternative**: Check your router's admin panel or network settings

The backend URL cannot use `localhost` because mobile devices/emulators cannot reach your development machine's localhost.

### 4. Run the App
```bash
# Terminal 1 - Start FastAPI backend
cd backend
uvicorn main:app --reload --host 0.0.0.0

# Terminal 2 - Start React Native app
cd client
npm start
```

## 📁 Project Structure
```
├── client/          # React Native (Expo) app
│   ├── app/         # App screens (upload, directory, etc)
│   ├── lib/         # API and Supabase helpers
│   └── ...
├── backend/         # FastAPI Python backend
│   └── main.py      # Backend API
├── supabase/        # Database migrations
└── README.md
```

## 🛠 Features
- Upload photos using Expo Image Picker (with correct permissions)
- Generate AI facial memory cues (mock implementation, backend returns description & mnemonic)
- Store faces in Supabase with descriptions and mnemonics
- Browse uploaded faces in a clean directory
- Cross-platform mobile app (iOS/Android/Web)

## 📝 How it Works
1. User uploads a photo and enters a name
2. Photo is uploaded to Supabase Storage
3. The backend generates a facial cue (description & mnemonic) for the image
4. The face, cue, and metadata are saved in Supabase
5. User can browse all faces and cues in the directory

## 🔗 Tech Stack
- React Native (Expo Router, TypeScript)
- FastAPI (Python)
- Supabase (DB & Storage)
- Expo Image Picker

## ⚠️ Notes
- The AI cue generation is currently a mock (randomized) implementation
- User authentication is not yet implemented (uses a demo user)
- Make sure your Supabase storage bucket is public or has correct policies

## 🔧 Tech Stack
- **Frontend**: React Native, Expo, TypeScript
- **Backend**: FastAPI, Python
- **Database**: Supabase (PostgreSQL)
- **Storage**: Supabase Storage
- **Navigation**: Expo Router
