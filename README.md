# BugBot LMS — AI-Enabled Code Grading & Moderated Doubt Portal

**BugBot LMS** is a full-stack learning management system and coding challenge platform built by **Aditya Singh**. It provides a secure, sandboxed environment for running student code, AI-backed grading and feedback, and a moderated doubt board for student questions.

---

## 🚀 Key Features

- Algorithmic Challenge Directory: curated collection of programming problems with keyword search and difficulty filters (EASY, MEDIUM, HARD).
- Multi-language Secure Sandbox: runs submissions for C++, JavaScript, and Python inside an isolated execution environment with strict resource limits (2s timeout, memory caps).
- AI Grading & Feedback: uses LangChain + Google Gemini to produce structured, Zod-validated feedback on correctness, complexity, and style.
- Shared Doubt Board & Moderation: students post doubts that an AI drafts answers for; teacher moderation before publishing.
- LeetCode-style Workspace: split-pane editor (Monaco), language selector tabs, and a fast, direct-DOM resizer for smooth UX.

---

## 🛠️ Technology Stack

- Frontend: Next.js (React), Tailwind CSS, Monaco Editor, Lucide Icons
- Backend: Node.js, Express.js
- Database & ORM: PostgreSQL, Prisma
- AI & Parsing: LangChain, Google Gemini (Gemini API), Zod schema validation
- Execution Engine: Judge0 / sandboxed runtime

---

## 📂 Project Structure

```text
bugbot-lms/
├── frontend/               # Next.js frontend application
│   ├── src/app/            # App router pages (Challenges, Workspace, Doubts, Teacher Panel)
│   ├── public/             # Static assets (logo, images)
│   └── ...
├── backend/                # Express.js backend server
│   ├── prisma/             # Database schema and seed scripts
│   ├── src/controllers/    # Route handlers for problems, submissions, and doubts
│   ├── src/services/       # Sandbox runner and LangChain AI grading integration
│   └── ...
└── README.md
```

---

## ⚙️ Getting Started

### Prerequisites

- Node.js v18+ (recommended)
- PostgreSQL instance
- Optional: a Judge0 instance or other sandbox runtime

### 1) Clone the repository

```bash
git clone https://github.com/Adityazzzzz/BugBot.git
cd BugBot
```

### 2) Backend setup

```bash
cd backend
npm install
```

Create a `.env` file in `backend/` with these (example):

```env
DATABASE_URL="postgresql://user:password@localhost:5432/bugbot_db?schema=public"
PORT=5000
GEMINI_API_KEY="your-google-gemini-api-key"
JUDGE0_API_URL="https://judge0.example.com" # or your Judge0 endpoint
```

Run database migrations / push schema and seed the problem bank:

```bash
npx prisma db push
node prisma/seed.js
```

Start the backend dev server:

```bash
npm run dev
```

### 3) Frontend setup

Open a separate terminal:

```bash
cd frontend
npm install
```

Create `.env.local` in `frontend/` if needed:

```env
NEXT_PUBLIC_API_URL="http://localhost:5000/api"
```

Start the frontend dev server:

```bash
npm run dev
```

Open http://localhost:3000 to view the app.

---

## 🔒 Security & Design Notes

- Sandbox Isolation: student code is executed in an isolated runtime (Judge0 or equivalent) — never via `eval()` on the server.
- Prompt Injection: LangChain prompts include strict instruction boundaries and Zod validation to mitigate prompt leakage.
- UI Performance: the split-pane resizer updates the DOM directly for a 60fps experience without re-rendering the heavy Monaco instance.

---

## Contributing

Contributions, bug reports, and feature requests are welcome. Please open an issue or a pull request.

---

## License

This project is open-source. Add your preferred license file if you want to apply a specific license.
