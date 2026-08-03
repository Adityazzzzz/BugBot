# AI-Powered Code Grading & Doubt Resolution Portal

A full-stack, AI-enabled LMS module built to practice coding assignments in a safe execution sandbox, get qualitative AI reviews, ask doubts on a shared moderated board, and review posts using a teacher approval state machine.

---

## Technical Architecture

### 1. Frontend (Next.js & React)
- **Design System**: Vanilla CSS with modern custom properties, custom fonts (Outfit, JetBrains Mono), glassmorphism styles, and animated layouts.
- **Code Workspace**: Integrates Monaco Editor (`@monaco-editor/react`) supporting code formatting, syntax highlighting, and state retention.
- **Shared Context**: Client-side role selection context (`UserContext`) to switch between STUDENT and TEACHER views instantly.

### 2. Backend (Express.js)
- **Native ESM**: Utilizes ES Modules (`"type": "module"`) for clean import/export syntax without build-step overhead.
- **ORM**: Prisma ORM with SQLite database mapping for rapid, self-contained development and test runs.
- **Sandbox Runner**: An execution environment with timeout limits (2000ms), restricted globals, and static analysis keyword blocks to ensure safe Python and JavaScript runtimes.
- **AI Service**: Direct Google Gemini API integration using the official `@google/genai` SDK with fallback mock intelligence.

---

## Project Structure

```
/KPMG/
├── backend/
│   ├── prisma/
│   │   ├── schema.prisma   # SQLite Database Schema
│   │   └── seed.js         # Seed Coding Problems and Default Users
│   ├── src/
│   │   ├── config/
│   │   │   └── db.js       # Centralized Prisma Client
│   │   ├── controllers/    # API Controllers (Problems, Submissions, Doubts)
│   │   ├── routes/         # Express Router Middlewares
│   │   ├── services/
│   │   │   ├── aiService.js     # Google Gemini API & Guard Moderation
│   │   │   └── sandboxRunner.js # Sandboxed Code execution (JS / Python)
│   │   ├── app.js          # Express app settings
│   │   └── server.js       # Server execution entry point
│   ├── .env.example        # Environment variables template
│   └── package.json
├── frontend/
│   ├── src/
│   │   ├── app/            # Next.js App Router Pages
│   │   │   ├── components/ # Reusable components (Navbar)
│   │   │   ├── context/    # UserContext for role-switching
│   │   │   ├── doubt/      # Doubt Board Hub page
│   │   │   ├── teacher/    # Teacher dashboard and review page
│   │   │   ├── workspace/  # Interactive Monaco coding editor page
│   │   │   ├── globals.css # CSS styling tokens and classes
│   │   │   └── layout.js   # HTML head and frame layout
│   └── package.json
└── README.md
```

---

## Setup & Running Instructions

### Prerequisites
- **Node.js**: v22.0.0 or later recommended.
- **Python**: Installed and in environment PATH (needed to execute Python coding assignments).

### Backend Configuration
1. Navigate to backend:
   ```bash
   cd backend
   ```
2. Copy env template and set credentials:
   ```bash
   copy .env.example .env
   ```
3. (Optional) Put your Gemini API Key in `GEMINI_API_KEY`. If left empty, the application will default to Mock Mode.
4. Synchronize database and run seeding:
   ```bash
   npm run prisma:migrate
   npm run prisma:seed
   ```
5. Start in development mode:
   ```bash
   npm run dev
   ```

### Frontend Configuration
1. Navigate to frontend:
   ```bash
   cd ../frontend
   ```
2. Start the dev server:
   ```bash
   npm run dev
   ```
3. Open [http://localhost:3000](http://localhost:3000) in your web browser.
