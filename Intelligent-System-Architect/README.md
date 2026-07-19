# AI Applications in Information Systems — Research Platform

An interactive web platform for the IEEE-accepted research paper **"AI Applications in Information Systems"** by T. Rajitha Madhu Priya, Ramya M, Md Ankushavali, and Ridhi Jain.

Explore 15 AI paradigms, system architectures, performance benchmarks, and use the ML Playground to analyze your own datasets.

---

## Features

- **Overview** — Paper summary, authors, and key contributions
- **Architecture** — Visual breakdown of AI system components
- **Techniques** — All 15 AI paradigms covered in the paper
- **Performance** — Benchmark charts and comparisons
- **Research** — Citations and related work
- **Formulas** — Key mathematical foundations
- **ML Playground** — Upload a CSV dataset, run real ML models, and get a recommendation on which paradigm best fits your data
- **Auth** — Signup / Login with persistent sessions (PostgreSQL-backed)

---

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React 18, Vite, TypeScript, Tailwind CSS, Framer Motion, Recharts, Wouter |
| Backend | Node.js 24, Express 5, TypeScript |
| Database | PostgreSQL + Drizzle ORM |
| Auth | express-session + connect-pg-simple + bcrypt |
| API | OpenAPI spec → Orval codegen (React Query hooks + Zod schemas) |
| Monorepo | pnpm workspaces |

---

## Project Structure

```
├── artifacts/
│   ├── ai-is-platform/   # React + Vite frontend
│   └── api-server/       # Express API server
├── lib/
│   ├── api-spec/         # OpenAPI spec (source of truth)
│   ├── api-client-react/ # Generated React Query hooks
│   ├── api-zod/          # Generated Zod schemas
│   └── db/               # Drizzle ORM schema + migrations
└── scripts/              # Shared build scripts
```

---

## Getting Started (Local)

### Prerequisites

- Node.js 20+ — [nodejs.org](https://nodejs.org)
- pnpm — `npm install -g pnpm`
- PostgreSQL database (local or [Neon free tier](https://neon.tech))
- Git Bash (Windows) or any Unix shell

### 1. Clone & install

```bash
git clone https://github.com/your-username/your-repo.git
cd your-repo
pnpm install
```

### 2. Environment variables

Create a `.env` file in the project root:

```env
DATABASE_URL=postgresql://user:password@host/dbname?sslmode=require
SESSION_SECRET=your_long_random_secret_here
```

Generate a secure SESSION_SECRET:
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

### 3. Push the database schema

```bash
pnpm --filter @workspace/db run push
```

### 4. Run the servers

Open two terminals:

```bash
# Terminal 1 — API server (port 8080)
pnpm --filter @workspace/api-server run dev

# Terminal 2 — Frontend (port 5173)
pnpm --filter @workspace/ai-is-platform run dev
```

Open [http://localhost:5173](http://localhost:5173) in your browser.

---

## Useful Commands

```bash
pnpm run typecheck                          # Full typecheck across all packages
pnpm run build                              # Build all packages
pnpm --filter @workspace/api-spec run codegen   # Regenerate API hooks from OpenAPI spec
pnpm --filter @workspace/db run push        # Push DB schema changes (dev only)
```

---

## ML Playground

1. Sign up / log in
2. Navigate to **ML Playground**
3. Upload any CSV file
4. Select the target column (what you want to predict)
5. The engine runs KNN, Naive Bayes, and Logistic/Linear Regression on your data
6. All 15 paper paradigms are scored and ranked for your dataset

> Max 2,000 rows are used for training. Numeric columns are auto-detected.
