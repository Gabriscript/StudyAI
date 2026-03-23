# StudyAI

StudyAI is a web application that transforms study materials (PDFs, handwritten notes, and screenshots) into interactive learning experiences powered by AI.

Instead of passive reading, users actively reconstruct knowledge step by step through questions, improving understanding and long-term retention.

---

## 🚀 Features (MVP)

* Upload PDF, images, or screenshots
* AI-generated concept nodes from content
* Progressive learning (unlock knowledge step by step)
* Open-ended questions with semantic evaluation
* Study companion system (anxious → relaxed state)
* Simple progress tracking

---

## 🧠 How It Works

1. Upload your study material
2. AI extracts key concepts and generates structured nodes
3. You start from the root concept
4. Answer questions to unlock deeper knowledge
5. Help your study companion move from **anxious → relaxed**
6. Complete the session by answering a final synthesis question

---

## 🎯 Goal

StudyAI is designed to improve learning efficiency by combining:

* Active recall
* Structured repetition
* Visual learning
* AI-assisted feedback

---

## 🛠 Tech Stack

### Frontend

* React + Vite
* Tailwind CSS
* Axios

### Backend

* ASP.NET Core (.NET 8)
* Minimal APIs
* Entity Framework Core

### AI

* Claude API (for content analysis and answer evaluation)

### Database

* SQLite (MVP)
* PostgreSQL (future)

---

## 📦 Project Structure

```
/frontend   → React application
/backend    → ASP.NET Core API
/docs       → project documentation
```

---

## ⚙️ Getting Started

### Prerequisites

* Node.js
* .NET 8 SDK
* API key for AI provider

---

### Run Frontend

```bash
cd frontend
npm install
npm run dev
```

---

### Run Backend

```bash
cd backend
dotnet run
```

---

## 🔑 Environment Variables

Create a `.env` file (or use secrets):

```
AI_API_KEY=your_api_key_here
```

---

## 📌 MVP Scope

The current version focuses on:

* Core learning flow
* Basic AI integration
* Simple UI and interaction

The goal is to validate the idea with real users before adding complexity.

---

## 🧪 Future Improvements

* User authentication
* Session history
* Advanced diagrams (graph view)
* Better AI evaluation
* Export study summaries
* Mobile optimization

---

## 💡 Vision

To build a tool that makes studying more effective, structured, and engaging — helping students truly understand what they learn, not just memorize it.

---

## 👤 Author

Gabri
Aspiring solo founder building StudyAI in Finland.

---

## 📄 License

MIT License (or to be defined)

