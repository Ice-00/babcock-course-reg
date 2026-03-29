# Babcock University — Paperless Course Registration Platform

A full-stack, multi-role course registration system with a 5-stage approval workflow, real-time tracking, and printable official forms.

---

## 🏗 Project Structure

```
/
├── frontend/          ← React + Vite (runs on Vercel)
└── backend/           ← Node.js + Express + Prisma (runs on Render)
```

---

## 🔁 Approval Workflow (in order)

```
Student Submits
   ↓
Course Adviser     → adviser_approved
   ↓
HOD                → hod_approved       (TEMPORARY approval)
   ↓
School Officer     → officer_approved
   ↓
Academic Planning  → academic_approved
   ↓
Registry           → approved           (PERMANENT — student can now print)
   ↓
🖨 Student prints official form
```

---

## 👥 Demo Accounts

| Role             | Username   | Password |
|------------------|------------|----------|
| Student          | student1   | pass     |
| Student 2        | student2   | pass     |
| Course Adviser   | adviser1   | pass     |
| HOD              | hod1       | pass     |
| School Officer   | officer1   | pass     |
| Academic Planning| academic1  | pass     |
| Registry         | registry1  | pass     |
| Administrator    | admin      | admin    |

---

## 🚀 Running Locally (Frontend only — uses localStorage)

```bash
cd frontend
npm install
npm run dev
# → http://localhost:5173
```

---

## 🚀 Running with Full Backend

### Prerequisites
- Node.js 18+
- PostgreSQL (local or cloud)

### Backend Setup

```bash
cd backend

# 1. Install dependencies
npm install

# 2. Copy and fill environment file
cp .env.example .env
# Edit .env — set DATABASE_URL and JWT_SECRET

# 3. Run database migrations
npx prisma migrate dev --name init

# 4. Seed demo data
npm run db:seed

# 5. Start server
npm run dev
# → http://localhost:5000
```

### Frontend Setup (with backend)

```bash
cd frontend

# Create .env.local
echo "VITE_API_URL=http://localhost:5000/api" > .env.local

npm install
npm run dev
# → http://localhost:5173
```

---

## ☁ Deploying to Cloud (Free Tier)

### Backend → Render

1. Go to **render.com** → New → Web Service
2. Connect your GitHub repo, point to `/backend`
3. Build command: `npm install && npx prisma migrate deploy`
4. Start command: `node src/index.js`
5. Add environment variables:
   - `DATABASE_URL` — from Render PostgreSQL
   - `JWT_SECRET` — any long random string
   - `CLIENT_URL` — your Vercel frontend URL

6. Add a **PostgreSQL** database on Render (free tier)
7. After deploy, run seed: open Render shell → `npm run db:seed`

### Frontend → Vercel

1. Go to **vercel.com** → New Project
2. Import your repo, point to `/frontend`
3. Add environment variable:
   - `VITE_API_URL` = `https://your-backend.onrender.com/api`
4. Deploy

---

## 📡 API Reference

| Method | Endpoint                         | Auth    | Description                    |
|--------|----------------------------------|---------|--------------------------------|
| POST   | /api/auth/register               | None    | Student self-registration      |
| POST   | /api/auth/login                  | None    | Login → returns JWT            |
| GET    | /api/auth/me                     | Token   | Get current user               |
| GET    | /api/courses                     | Token   | List courses                   |
| POST   | /api/courses                     | Admin   | Create course                  |
| GET    | /api/registrations               | Token   | List (filtered by role)        |
| POST   | /api/registrations               | Student | Submit registration            |
| GET    | /api/registrations/:id           | Token   | Get single registration        |
| POST   | /api/registrations/:id/approve   | Approver| Approve registration           |
| POST   | /api/registrations/:id/reject    | Approver| Reject registration            |
| GET    | /api/registrations/stats         | Admin   | System statistics              |
| GET    | /api/users                       | Admin   | List all users                 |
| PATCH  | /api/users/:id/role              | Admin   | Assign role to user            |

---

## 🛠 Tech Stack

| Layer     | Technology                              |
|-----------|-----------------------------------------|
| Frontend  | React 18, Vite, React Router v6         |
| Backend   | Node.js, Express                        |
| Database  | PostgreSQL via Prisma ORM               |
| Auth      | JWT (jsonwebtoken + bcryptjs)           |
| Hosting   | Vercel (frontend) + Render (backend/DB) |
