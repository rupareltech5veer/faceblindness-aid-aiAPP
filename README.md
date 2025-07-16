# Face Blindness Aid App

An AI-powered assistive app for people with face blindness (prosopagnosia). Built with React Native (Expo), Node.js/Express, and Supabase.

## 🚀 Quick Start

### Prerequisites
- Node.js (v16+)
- Expo CLI: `npm install -g @expo/cli`
- Supabase account

### 1. Install Dependencies
```bash
npm run install-all
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
EXPO_PUBLIC_BACKEND_URL=http://localhost:8000
```

### 4. Run the App
```bash
# Terminal 1 - Start Node.js backend
npm run backend

# Terminal 2 - Start React Native app
npm start
```

## 📁 Project Structure
```
├── client/          # React Native (Expo) app
├── server/          # Node.js Express backend
├── supabase/        # Database migrations
└── README.md
```

## 🛠 Features
- Upload photos using Expo Image Picker
- Generate AI facial memory cues (mock implementation)
- Store faces in Supabase with descriptions
- Browse uploaded faces in a clean directory
- Cross-platform mobile app (iOS/Android/Web)

## 🔧 Tech Stack
- **Frontend**: React Native, Expo, TypeScript
- **Backend**: Node.js, Express
- **Database**: Supabase (PostgreSQL)
- **Storage**: Supabase Storage
- **Navigation**: Expo Router