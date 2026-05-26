
# 🐬 Memora: Faceblindness Aid AI Application

Welcome to Memora!  
This project helps people with faceblindness recognize and remember faces using AI-powered tools.  
Follow this guide to set up and run both the **client (mobile app)** and **backend (API/server)**.

---

## 🚀 Quick Start

### 1. **Clone the Repository**
```sh
git clone https://github.com/your-username/your-repo-name.git
cd your-repo-name
```

---

## 📱 Client Setup (React Native + Expo)

### **Requirements**
- [Node.js](https://nodejs.org/) (v18+ recommended)
- [Expo CLI](https://docs.expo.dev/get-started/installation/)
- npm

### **Install Dependencies**
```sh
cd client
npm install
```

### **Start the App**
```sh
npm start
```
- Scan the QR code with your phone (Expo Go app) or run on an emulator.

---

## 🛠️ Backend Setup (Python FastAPI)

### **Requirements**
- [Python 3.11+](https://www.python.org/downloads/)
- [pip](https://pip.pypa.io/en/stable/installation/)
- [CMake](https://cmake.org/download/) (required for some Python packages with native extensions)

#### **Install CMake**
- **Windows:** Download and install from [CMake Downloads](https://cmake.org/download/).
- **Mac:**  
  ```sh
  brew install cmake
  ```
- **Linux:**  
  ```sh
  sudo apt-get install cmake
  ```

### **Install Dependencies**
```sh
cd backend
python -m venv venv
# On Mac/Linux:
source venv/bin/activate
# On Windows:
venv\Scripts\activate
pip install -r requirements.txt
```

### **Run the Backend**
```sh
uvicorn main:app --reload
```
- The API will be available at `http://localhost:8000`

---

## ⚡ Recommended Python Packages

Your `requirements.txt` should include:
```
fastapi
uvicorn
pydantic
python-dotenv
# Add any other dependencies your backend uses
```

---

## 🧩 Environment Variables

- Copy `.env.example` to `.env` in both `client` and `backend` folders.
- Fill in your API keys, database URLs, etc.

---

## � Troubleshooting

- **Python errors?** Make sure you’re using Python 3.11+ and a fresh virtual environment.
- **Expo errors?** Delete `node_modules` and run `npm install` again.
- **Backend not connecting?** Check your `.env` and make sure the backend is running before starting the client.
- **CMake errors?** Make sure CMake is installed and available in your system PATH.

---

## ✨ Project Structure

```
client/      # React Native Expo app
backend/     # FastAPI backend
.env         # Environment variables
README.md    # This file!
```

---

## 💡 Useful Commands

- **Client:**  
  - `npm start` — Start Expo app
  - `npm run android` / `npm run ios` — Run on emulator

- **Backend:**  
  - `uvicorn main:app --reload` — Start FastAPI server

---

## 🙌 Contributing

Pull requests are welcome!  
Open an issue for bugs or feature requests.

---

## � Resources

- [Expo Docs](https://docs.expo.dev/)
- [FastAPI Docs](https://fastapi.tiangolo.com/)
- [Python Downloads](https://www.python.org/downloads/)
- [CMake Downloads](https://cmake.org/download/)

---

## 🏁 You're Ready!

Enjoy building and using Memora!  
If you run into issues, check the docs above or open an issue.

---
