# InterviewAI 🚀

**InterviewAI** is a production-grade, AI-powered career readiness platform. It combines a realistic **Technical Interviewer** with a comprehensive **60-Day English Communication Coach** to help candidates master both technical and soft skills.

---

## ✨ Key Features

### 🎓 AI English Coach (New!)
- 📅 **60-Day Fluency Program**: A structured roadmap from Beginner to Advanced levels.
- 1️⃣2️⃣ **12-Step State-Based Pedagogy**: Lessons follow a professional teaching flow: Intro → Explanation → Examples → Tasks → Evaluation → Mastery.
- 🇮🇳 **Indian English Teacher Persona**: A warm, supportive female persona with a professional Indian English accent.
- 🧠 **Adaptive Clarification**: If you're confused, the AI rephrases and simplifies automatically—never repeating the same robotic lines.

### 🎭 Technical Interviewer
- 🎙️ **Voice Interaction**: Completely verbal interview flow using Web Speech APIs for zero-latency.
- 🛰️ **Adaptive Questioning**: Questions dynamically evolve based on your technical depth and previous answers.
- ⚡ **Low-Latency Streaming**: AI responses are streamed using SSE, ensuring an interactive experience.
- 🛡️ **Production Resilient**: Multi-tier fallback system (Gemini → OpenAI → Offline Mock) ensures the session never crashes due to API quotas.

### 📊 Advanced Evaluation
- 🔍 **Granular Analysis**: Deep feedback on grammar, technical accuracy, and pronunciation.
- 📈 **Mastery Progress**: Tracks your 60-day journey with fluency scores and daily milestones.

---

## 🛠️ Tech Stack

### Frontend
- **Framework**: Next.js 14+ (App Router, JavaScript)
- **Styling**: Tailwind CSS (Premium Glassmorphism Design)
- **Animations**: Framer Motion
- **Icons**: Lucide React

### Backend
- **Runtime**: Node.js / Express
- **Database**: MongoDB (Mongoose)
- **AI Engine**: Google Gemini 2.0 Flash (Primary), OpenAI GPT-4o (Fallback)
- **Voice**: Web Speech API (Browser) & OpenAI TTS-1 (Nova/Female Fallback)

---

## 🚀 Getting Started

### Prerequisites
- Node.js (v18+)
- MongoDB Atlas or local instance
- Google AI Studio API Key
- OpenAI API Key (for fallback/TTS)

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd AIInterview
   ```

2. **Backend Setup**
   ```bash
   cd backend
   npm install
   ```
   Create a `.env` file:
   ```env
   PORT=5000
   MONGO_URI=your_mongodb_uri
   JWT_SECRET=your_secret_key
   GEMINI_API_KEY=your_gemini_api_key
   OPENAI_API_KEY=your_openai_api_key
   ```
   Start the backend:
   ```bash
   npm run dev
   ```

3. **Frontend Setup**
   ```bash
   cd ../frontend
   npm install
   ```
   Create a `.env.local` file:
   ```env
   NEXT_PUBLIC_API_URL=http://localhost:5000
   ```
   Start the frontend:
   ```bash
   npm run dev
   ```

---

## 📜 License
Distributed under the MIT License.

---

Developed with ❤️ by Prakash Ramavath.
