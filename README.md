# 🧠 LearnVault AI

> **"Learn it your way. Answer it your way. Remember it your way."**

[![Hackathon](https://img.shields.io/badge/Hackathon-AI%20FOR%20LEARNING-6366f1?style=for-the-badge&logo=sparkles)](.)
[![Stack](https://img.shields.io/badge/Stack-React%20%2B%20Express%20%2B%20Gemini-0ea5e9?style=for-the-badge)](.)
[![License](https://img.shields.io/badge/License-MIT-22c55e?style=for-the-badge)](.)

---

## 📌 The Problem

Traditional e-learning platforms measure whether students got the **right answer** — but not *how* they understood it, *why* they struggled, or *what* resonated with them personally.

Students forget because nothing is personalized to **their** voice, **their** analogy, or **their** reasoning style. Teachers get raw scores but no insight into *what kind of mistakes* their class is making.

---

## 💡 The Solution — The LearnVault Learning Cycle

LearnVault AI wraps every learning session in a **6-step AI-powered cycle**:

```
📖 LEARN  →  🏋️ PRACTICE  →  🤖 AI FEEDBACK  →  📊 TRACK  →  🔒 REMEMBER  →  🔄 REVISE
```

| Step | What Happens |
|------|-------------|
| **LEARN** | AI generates structured explanations grounded in teacher-uploaded material |
| **PRACTICE** | Students answer via Text, Voice Recording, or Image/Diagram upload |
| **AI FEEDBACK** | Rubric-based evaluation: score, mistake classification, improvement tips |
| **TRACK** | Progress analytics, streak counters, gamified leaderboard |
| **REMEMBER** | Save personal insights to a **private, encrypted Memory Vault** |
| **REVISE** | Smart revision queue surfaces weakest topics at the right time |

---

## ✨ Key Features

### 📚 Structured AI Explanations
- AI explanations are **grounded in teacher-uploaded material** — not hallucinated from thin air
- Each topic yields: Concept Summary → Step-by-step Breakdown → Real-world Examples → Key Takeaways
- Teachers control the curriculum; AI enhances comprehension

### 🎙️ Multi-Format Assessment
Answer the way *you* think best:

| Mode | Description |
|------|-------------|
| **✍️ Text** | Type your answer — supports one-line, multi-part, essay, code editor, and math formats |
| **🎤 Voice** | Record a spoken explanation; AI transcribes and evaluates your verbal reasoning |
| **🖼️ Image / Diagram** | Upload a photo of hand-drawn diagrams or whiteboards with annotations |

### 🤖 AI Evaluation Engine
Rubric-based evaluation for every answer type:

- **5 Mistake Types**: Conceptual Gap · Terminology Error · Incomplete Answer · Reasoning Flaw · Calculation Error
- **Multi-part scoring**: Each part graded independently with a weakest-part highlight
- **Code analysis**: Identifies what works, what's buggy, why it's wrong, and provides a corrected version
- **Math evaluation**: Checks methodology and intermediate steps, not just the final number
- **Voice transcript analysis**: Evaluates spoken explanations for logical flow and key concept coverage

### 🔒 Personal Memory Vault *(Your Private Space)*
> The Memory Vault is **100% private by design**.

- Save personal notes, "aha moments", mnemonic devices, voice memos, and hand-drawn concept maps
- **Never visible to teachers** — enforced at the database layer with session-token-bound ownership
- **AI explicitly excluded** — vault items are never sent to any AI model for analysis
- Students must give **explicit consent** before any answer is AI-evaluated

### 🏫 Teacher Studio
- **Curriculum Builder**: Create subjects, topics, and upload learning materials
- **AI Quiz Generator**: Describe a topic → AI generates a full quiz → Teacher reviews and publishes
- **Class Analytics**: View per-student performance, score trends, and mistake-type distribution
- **Student Roster**: Live roster with real-time quiz stats (vault contents remain hidden)

### 🏆 Gamification
- 🔥 **Daily Streaks** — maintained across sessions, shown in the navbar
- ⚡ **Daily Challenges** — AI-generated challenge questions with XP rewards
- 🏅 **Badges** — unlocked for milestones (First Quiz, 7-Day Streak, Perfect Score, etc.)
- 🥇 **Leaderboard** — class-wide XP ranking with position tracking

---

## 🎭 Demo Credentials

| Role | User ID | Password | Account |
|------|---------|----------|---------|
| 👩‍🎓 Student | `STU1001` | `student123` | Jamie Chen (Demo Student) |
| 👩‍🎓 Student | `STU1002` | `student123` | Alex Rivera (Second Student) |
| 👨‍🏫 Teacher | `TCH1001` | `teacher123` | Prof. Katherine Vance |

> **Try this demo flow:**
> 1. Log in as `STU1001` → Open a topic → Save something to Memory Vault
> 2. Log in as `TCH1001` → Student Roster → Click **"Test Vault Privacy"** → See the `403 FORBIDDEN` response
> 3. Log in as `STU1002` → Memory Vault → Confirm you see **zero** items from STU1001's vault

---

## 🛠️ Tech Stack

| Layer | Technology |
|-------|-----------|
| **Frontend** | React 18, TypeScript, Tailwind CSS, Vite |
| **Backend** | Node.js 20, Express, TypeScript (ESM) |
| **AI** | Google Gemini 1.5 Flash (with deterministic fallback) |
| **Database** | JSON flat-file with in-memory cache (zero-dependency, hackathon-ready) |
| **Auth** | Bearer token session management with role-based guards |
| **Bundler** | Vite (dev HMR + production build) |
| **Runtime** | `tsx` for zero-compile TypeScript execution |

---

## 🚀 Getting Started

### Prerequisites

- **Node.js 20+** — [nodejs.org](https://nodejs.org)
- **npm 10+** (bundled with Node)
- *(Optional)* A Google Gemini API key for live AI — without it, the deterministic fallback engine runs automatically

### Installation

```bash
# Clone the repository
git clone https://github.com/your-username/learnvault-ai.git
cd learnvault-ai

# Install all dependencies
npm install
```

### Running in Production Mode

```bash
# 1. Build the frontend
npm run build

# 2. Start the full-stack server (API + static frontend)
npx tsx server/src/index.ts
```

Then open **http://localhost:5000** 🎉

### Running in Development Mode (with Hot Reload)

```bash
# Terminal 1 — Backend API server
npx tsx server/src/index.ts

# Terminal 2 — Vite frontend (HMR, proxies /api → port 5000)
npm run dev
```

Then open **http://localhost:3000**

### (Optional) Enable Live Gemini AI

```bash
# Create a .env file in the project root
echo "GEMINI_API_KEY=your_api_key_here" > .env

# Then start the server as normal
npx tsx server/src/index.ts
```

Get your free API key at [aistudio.google.com](https://aistudio.google.com).

> **Without the API key**, the platform runs fully using the built-in deterministic evaluation engine — all demo flows work identically.

---

## 📁 Project Structure

```
learnvault-ai/
├── server/
│   └── src/
│       ├── index.ts                  # Express app — all routes, CORS, static serving
│       ├── types/
│       │   └── index.ts              # Shared TypeScript types (User, Topic, Vault, etc.)
│       ├── db/
│       │   ├── database.ts           # Persistent JSON database with owner-scoped vault
│       │   └── seedData.ts           # Demo seed data (users, subjects, questions, vault items)
│       ├── services/
│       │   ├── aiService.ts          # Gemini API integration + fallback AI engine
│       │   └── evaluationEngine.ts   # Multi-format rubric evaluation engine
│       ├── middleware/
│       │   ├── auth.ts               # authenticate, requireAuth, requireStudent/Teacher
│       │   └── ownership.ts          # enforceStudentOwner — vault privacy guard
│       └── controllers/
│           ├── authController.ts     # POST /api/auth/login, GET /api/auth/me, POST /api/auth/logout
│           ├── studentController.ts  # Dashboard, subjects, quiz submit, progress, challenges
│           ├── vaultController.ts    # Memory Vault CRUD (private, owner-scoped)
│           ├── teacherController.ts  # Teacher portal endpoints
│           └── aiController.ts       # AI explain, short-notes, quiz generate, evaluate
│
├── src/
│   ├── main.tsx                      # React entry point
│   ├── App.tsx                       # BrowserRouter + all protected routes
│   ├── index.css                     # Global dark theme, animations
│   ├── context/
│   │   ├── AuthContext.tsx           # Auth state, session persistence, demo login helpers
│   │   └── ToastContext.tsx          # Floating toast notification system
│   ├── components/
│   │   ├── common/                   # Navbar, Sidebar, Badge, Modal, ProtectedRoute
│   │   ├── answers/                  # TextAnswer, VoiceRecorder, ImageUploader
│   │   └── evaluation/               # ScoreGauge, MistakePill, RubricBreakdown, CodingReview
│   └── pages/
│       ├── public/                   # LandingPage, StudentLogin, TeacherLogin, AccessDenied
│       ├── student/                  # Dashboard, Subjects, TopicDetail, PracticeQuiz,
│       │                             # EvaluationFeedback, MemoryVault, Assignments,
│       │                             # ProgressAnalytics, SmartRevision, Challenges,
│       │                             # Leaderboard, StudentProfile
│       └── teacher/                  # TeacherDashboard, ManageTopics, ManageAssignments,
│                                     # ManageQuizzes, StudentRoster, TeacherAnalytics
│
├── dist/                             # Vite production build output (served by Express)
├── learnvault-data.json              # Persistent database file (auto-created on first run)
├── test_hackathon_flow.ps1           # 25-step automated test suite
├── package.json
├── vite.config.ts
├── tailwind.config.js
└── tsconfig.json
```

---

## 🔌 API Reference

### Authentication
| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/api/auth/login` | Login with userId + password, returns session token |
| `GET` | `/api/auth/me` | Get current user info from session token |
| `POST` | `/api/auth/logout` | Invalidate session token |

### Student Endpoints *(requires student role)*
| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/api/student/dashboard` | Stats, streak, recent activity, daily challenge |
| `GET` | `/api/student/subjects` | All enrolled subjects with topics |
| `GET` | `/api/student/topics/:topicId` | Topic detail with AI explanation and quiz questions |
| `POST` | `/api/student/quiz/submit` | Submit a quiz attempt for AI evaluation |
| `GET` | `/api/student/progress` | Subject-by-subject progress analytics |
| `GET` | `/api/student/revision` | Smart revision queue (weakest topics first) |
| `GET` | `/api/student/challenges` | Daily challenge question |
| `POST` | `/api/student/challenges/complete` | Submit daily challenge answer |
| `GET` | `/api/student/leaderboard` | Class leaderboard with XP rankings |
| `GET` | `/api/student/assignments` | All assigned assignments |
| `GET` | `/api/student/assignments/:id` | Assignment detail with questions |
| `POST` | `/api/student/assignments/:id/submit` | Submit assignment for evaluation |

### Memory Vault *(strictly private — owner-only access)*
| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/api/vault` | Get all vault items for the authenticated student |
| `POST` | `/api/vault` | Save a new vault item (note, voice, image, etc.) |
| `PUT` | `/api/vault/:id` | Update a vault item |
| `DELETE` | `/api/vault/:id` | Delete a vault item |

### Teacher Endpoints *(requires teacher role)*
| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/api/teacher/dashboard` | Class overview, recent submissions, alerts |
| `GET` | `/api/teacher/subjects` | All subjects managed by this teacher |
| `POST` | `/api/teacher/topics` | Create a new topic with learning material |
| `GET` | `/api/teacher/assignments` | All assignments created by this teacher |
| `POST` | `/api/teacher/assignments` | Create a new assignment |
| `GET` | `/api/teacher/quizzes` | Quiz bank with publish status |
| `POST` | `/api/teacher/quizzes/publish/:id` | Publish a generated quiz |
| `GET` | `/api/teacher/students` | Student roster with quiz performance stats |
| `GET` | `/api/teacher/students/:id/analytics` | Per-student academic analytics |
| `GET` | `/api/teacher/students/:studentId/vault` | **Returns 403 FORBIDDEN** — vault is always private |
| `GET` | `/api/teacher/analytics` | Aggregated class analytics and mistake trends |

### AI Endpoints *(authenticated)*
| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/api/ai/explain` | Generate structured AI explanation for a topic |
| `POST` | `/api/ai/short-notes` | Generate concise study notes |
| `POST` | `/api/ai/generate-quiz` | Generate a quiz from a topic description |
| `POST` | `/api/ai/evaluate` | Evaluate a student answer with rubric scoring |

---

## 🔐 Privacy & Security Architecture

```
Client Request
      │
      ▼
[authenticate]          ← Validates Bearer token, attaches req.user
      │
      ▼
[requireAuth]           ← 401 if no valid session
      │
      ▼
[requireStudent/Teacher]← 403 if wrong role
      │
      ▼
[enforceStudentOwner]   ← For vault routes only:
      │                    Binds studentId from SESSION TOKEN
      │                    Ignores any studentId in query/body
      ▼
[Controller]            ← DB query: getStudentVault(res.locals.studentId)
```

### Key Privacy Guarantees

| Guarantee | How It's Enforced |
|-----------|------------------|
| Teachers **cannot** read vault items | GET /vault always returns 403 — hardcoded, no bypass |
| Students **cannot** read each other's vaults | `enforceStudentOwner` uses session token, ignores client IDs |
| AI **never** analyzes vault content | Vault endpoints never call aiService — no code path exists |
| Students consent before AI evaluation | Privacy confirmation modal shown before every quiz submission |
| Session tokens are server-side only | Tokens stored in Map<token, session> — not JWTs readable by client |

---

## 🧪 Automated Tests

Run the full 25-step hackathon demo verification:

```powershell
.\test_hackathon_flow.ps1
```

This verifies:
- ✅ All login flows (student + teacher)
- ✅ Subject and topic API responses
- ✅ Multi-format quiz submission and AI evaluation
- ✅ Memory Vault CRUD and strict ownership isolation
- ✅ Teacher 403 FORBIDDEN on vault access attempt
- ✅ Cross-student vault isolation (STU1002 sees zero STU1001 items)
- ✅ Daily challenge submission
- ✅ Leaderboard and progress endpoints
- ✅ AI explanation and short-notes generation

---

## 🏗️ Architecture Decisions

### Why a JSON flat-file database?
Zero external dependencies for a hackathon. The `Database` class provides the same interface as a real ORM — it can be swapped for PostgreSQL or Firestore by changing `database.ts` alone.

### Why deterministic AI fallback?
Ensures the demo works **100% reliably** without an API key, network access, or rate limits. Judges can evaluate all AI features offline.

### Why ESM throughout?
Node.js 20 native ESM + `tsx` gives zero-compile TypeScript execution with full type safety. No `tsc` build step needed for the backend.

### Why Tailwind dark theme?
A learning platform used at night (students study late) benefits from a dark-first design. Tailwind's utility classes kept the UI iteration speed fast during the hackathon.

---

## 📄 License

MIT © 2025 LearnVault AI Team

---

## 👥 Team

Built with ❤️ for the **AI FOR LEARNING** Hackathon.

> *"The best way to remember something is to own it in your own words. LearnVault AI makes that possible — privately, powerfully, and personally."*
