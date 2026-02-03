# 🚀 TaskFlow: Modern AI Task Orchestrator
### *Intelligence for Productivity*

---

## 📖 Project Overview
**TaskFlow** is an advanced, AI-driven task management system designed to transform how individuals and teams organize work. By integrating a **Neural AI Engine** (Llama 3.3 via Groq), it doesn't just store to-do lists—it actively schedules your day, coaches you on productivity habits, and protects you from burnout.

---

## ✨ Key Features

*   **🧠 Neural Roadmap:** An AI agent that intelligently schedules your day based on task priority, complexity, and your energy levels.
*   **🤖 AI Productivity Coach:** Analyzes your historical data to provide personalized, actionable advice and identify bottlenecks.
*   **🔥 Burnout Guard:** Real-time workload monitoring that alerts you when your "High Priority" load exceeds sustainable limits.
*   **⚡ Real-Time Collaboration:** Instant updates across all devices using **Socket.io**—see team changes as they happen.
*   **🧘 Focus Mode:** A distraction-free, full-screen Pomodoro environment with integrated task tracking.
*   **📊 Mission Control:** A unified dashboard for Personal, Team, and AI-generated insights.

---

## 🛠️ Tech Stack

| Layer | Technologies |
| :--- | :--- |
| **Frontend** | React (Vite), TypeScript, Tailwind CSS, Shadcn/UI, Framer Motion |
| **Backend** | Node.js, Express.js, Socket.io |
| **AI Layer** | Groq API (Llama 3.3 70B Versatile) |
| **Database** | MongoDB (Mongoose ORM) |
| **State** | TanStack Query, React Context API |

---

## 🚀 Installation Guide

Follow these steps to deploy the system locally.

### 1. Clone the Repository
```bash
git clone https://github.com/yourusername/taskflow.git
cd taskflow
```

### 2. Backend Setup
Navigate to the backend directory and install dependencies.
```bash
cd backend
npm install
```

Start the backend server.
```bash
npm run dev
# Server running on http://localhost:5000
```

### 3. Frontend Setup
Navigate to the frontend directory and install dependencies.
```bash
cd ../frontend
npm install
```

Start the frontend application.
```bash
npm run dev
# Application running on http://localhost:5173
```

---

## � Environment Variables

Create a `.env` file in the **backend** directory with the following keys:

```env
PORT=5000
MONGO_URI=mongodb://localhost:27017/taskflow  # Or your MongoDB Atlas Connection String
JWT_SECRET=your_super_secret_jwt_key
GROQ_API_KEY=gsk_xxxxxxxxxxxxxxxxxxxxxx       # Get from console.groq.com
PING_MESSAGE=pong
```

Create a `.env` file in the **frontend** directory:

```env
VITE_API_URL=http://localhost:5000
```

---

## 🏗️ System Architecture

1.  **User Interaction:** The Client (React) sends a request (e.g., "Generate Schedule").
2.  **API Gateway:** The Backend (Express) validates the request via JWT Middleware.
3.  **AI Orchestration:** The Backend constructs a prompt context (Tasks + History) and streams it to the **Groq API**.
4.  **Inference:** Groq (Llama 3.3) returns a structured JSON roadmap.
5.  **State Update:** The Backend validates the AI response, saves it to **MongoDB**, and broadcasts a `SCHEDULE_READY` event via **Socket.io**.
6.  **UI Refresh:** The Client receives the socket event and optimistically updates the Neural Roadmap view.

---

## 🗺️ Future Roadmap

- [ ] 📱 **Mobile Application:** Native React Native app for iOS/Android.
- [ ] 🗣️ **Voice Command:** "Hey TaskFlow, schedule a meeting for 2 PM" functionality.
- [ ] 🔗 **Integrations:** Slack and GitHub bidirectional sync.
- [ ] 📈 **Advanced Analytics:** Long-term productivity trend visualization.

---

*Built with ❤️ by Deepthi*
