# BugBot LMS — AI-Enabled Code Grading & Moderated Doubt Portal

**BugBot LMS** is a full-stack, enterprise-grade learning management system and coding challenge platform designed and engineered by **Aditya Singh** (IIIT Bhopal). It combines a secure, sandboxed code execution engine with advanced Gen AI capabilities (powered by LangChain and Gemini) to deliver automated grading, qualitative code feedback, and a fully moderated peer-doubt resolution workflow.

---

## 🚀 Key Features

* **Algorithmic Challenge Directory:** A curated repository of 53+ coding problems complete with real-time keyword search, difficulty filters (`EASY`, `MEDIUM`, `HARD`), and dynamic completion telemetry.
* **Multi-Language Secure Sandbox:** Executes code securely for **C++, JavaScript, and Python** with strict resource limits (2.0s timeout protection against infinite loops) and out-of-process safety boundaries.
* **LangChain & Gen AI Feedback:** Leverages `@langchain/google-genai` and Zod-backed structured parsers to deliver comprehensive code quality evaluations, including readability scores, time/space complexity analysis, and targeted improvement suggestions.
* **Shared Doubt Board & Moderation Workflow:** Students can post assignment doubts, which are automatically analyzed and answered by an AI drafting agent. Every AI-drafted response passes through a strict database state machine (`PENDING` $\rightarrow$ `APPROVED` / `REJECTED`) managed via a dedicated Instructor Moderation Panel.
* **Advanced LeetCode-Style Workspace:** Features a split-pane layout equipped with a **butter-smooth, direct-DOM draggable resizer splitter**, language selector tabs, and a dual-tab execution console.

---

## 🛠️ Technology Stack

* **Frontend:** Next.js (React), Tailwind/CSS Modules, Lucide Icons, Monaco Editor.
* **Backend:** Node.js, Express.js.
* **Database & ORM:** PostgreSQL, Prisma ORM.
* **AI & Parsing:** LangChain, Google Gemini API (`gemini-2.5-flash`), Zod validation schemas.
* **Execution Engine:** Judge0 API / Sandboxed Runtime environment.

---

## 📂 Project Structure

```text
bugbot-lms/
├── frontend/               # Next.js frontend application
│   ├── src/app/            # App router pages (Challenges, Workspace, Doubts, Teacher Panel)
│   ├── public/             # Static assets (logo.jpeg)
│   └── ...
├── backend/                # Express.js backend server
│   ├── prisma/             # Database schema and seed scripts
│   ├── src/controllers/    # Route handlers for problems, submissions, and doubts
│   ├── src/services/       # Sandbox runner and LangChain AI grading integration
│   └── ...
└── README.md


⚙️ Getting Started & Installation
Prerequisites
Node.js (v18+ recommended)

PostgreSQL Database instance

1. Clone the Repository
Bash
git clone [https://github.com/your-username/bugbot-lms.git](https://github.com/your-username/bugbot-lms.git)
cd bugbot-lms
2. Setup the Backend
Navigate to the backend folder, install dependencies, and configure environment variables:

Bash
cd backend
npm install
Create a .env file in the backend directory:

Code snippet
DATABASE_URL="postgresql://user:password@localhost:5432/bugbot_db?schema=public"
PORT=5000
GEMINI_API_KEY="your-google-gemini-api-key"
JUDGE0_API_URL="your-judge0-endpoint-if-applicable"
Run database migrations and seed the initial problem bank:

Bash
npx prisma db push
node prisma/seed.js
Start the Express development server:

Bash
npm run dev
3. Setup the Frontend
Open a new terminal window, navigate to the frontend folder, and install dependencies:

Bash
cd frontend
npm install
Create a .env.local file in the frontend directory if needed:

Code snippet
NEXT_PUBLIC_API_URL="http://localhost:5000/api"
Start the Next.js development server:

Bash
npm run dev
Open http://localhost:3000 in your browser to access the portal.

🔒 Security Architecture & Tradeoffs
Sandbox Execution Isolation: Untrusted student submissions for C++, Python, and JS are never executed directly via unsafe backend eval() statements. Instead, they are routed to isolated sandboxed execution runtimes with enforced memory limits and a 2.0-second timeout ceiling to safeguard against infinite loops or system lockups.

Prompt Injection Resilience: System prompts embedded within the LangChain grading and doubt-drafting pipelines include rigorous instruction boundaries and validation checks to prevent prompt leaking or malicious persona jailbreaks.

Direct-DOM Resizing vs. React State: To achieve a 60fps buttery-smooth split-pane resizing experience (similar to LeetCode) without lagging the heavy Monaco Editor instance, drag events update DOM styles directly via useRef bindings rather than triggering constant React re-renders during motion.