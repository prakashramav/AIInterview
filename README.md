# InterviewAI 🚀

**InterviewAI** is a production-grade, AI-powered mock interview platform designed to simulate a real-world video interview experience. It features a realistic AI interviewer with voice, video, and real-time streaming capabilities to help candidates prepare for their dream jobs.

---

## ✨ Key Features

- 🎭 **Real-Time AI Avatar**: A photorealistic AI interviewer that reacts to your answers. Includes D-ID integration for lip-synced video and a high-quality animated fallback.
- 🎙️ **Voice Interaction**: Completely verbal interview flow using native browser Web Speech APIs (STT & TTS) for zero-latency, free interaction.
- ⚡ **Low-Latency Streaming**: AI responses are streamed sentence-by-sentence using Server-Sent Events (SSE), ensuring the interviewer starts speaking within milliseconds.
- 🧠 **Smart Evaluation**: Deep analytical feedback using Google Gemini AI, providing scores (out of 10), specific strengths, weaknesses, and actionable study suggestions.
- 🇮🇳 **Localized Experience**: Optimized for Indian English accents and standard tech roles (SDE, Frontend, Data Science, etc.).
- 🛡️ **Production Hardened**: Secured with JWT authentication, HTTP security headers (Helmet), and intelligent rate limiting.
- ⏳ **Inactivity Detection**: Automatically ends the interview after 2 minutes of silence to simulate real-world call behavior.

---

## 🛠️ Tech Stack

### Frontend
- **Framework**: Next.js 14+ (App Router)
- **Styling**: Tailwind CSS
- **Animations**: Framer Motion
- **Icons**: Lucide React
- **State Management**: React Hooks & Context API

### Backend
- **Runtime**: Node.js / Express
- **Database**: MongoDB (Mongoose)
- **AI Models**: Google Gemini (Pro & Flash)
- **Security**: JWT, Helmet, Express-Rate-Limit, Morgan

---

## 🚀 Getting Started

### Prerequisites
- Node.js (v18+)
- MongoDB Atlas or local MongoDB instance
- Google AI Studio API Key (Gemini)

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
   Create a `.env` file in the `backend` folder:
   ```env
   PORT=5000
   MONGO_URI=your_mongodb_uri
   JWT_SECRET=your_secret_key
   GEMINI_API_KEY=your_gemini_api_key
   DID_API_KEY=your_did_key (optional)
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
   Create a `.env.local` file in the `frontend` folder:
   ```env
   NEXT_PUBLIC_API_URL=http://localhost:5000
   ```
   Start the frontend:
   ```bash
   npm run dev
   ```

---

## 📸 Screenshots
*(Add your screenshots here)*

---

## 📜 License
Distributed under the MIT License. See `LICENSE` for more information.

---

Developed with ❤️ by Antigravity AI.
