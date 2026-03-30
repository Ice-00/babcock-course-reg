# 📄 Paperless Course Registration System

A full-stack course registration system built for university workflows.  
Supports role-based access for students, advisers, HODs, and administrators.

---

## 🚀 Features

- Student course registration
- Multi-level approval system (Adviser → HOD → Registry)
- Role-based dashboards
- Authentication using JWT
- Admin controls (courses, users, roles)
- Real-time status tracking

---

## 👥 Demo Accounts

| Role              | Username   | Password |
|------------------|-----------|----------|
| Student          | student1  | pass     |
| Student 2        | student2  | pass     |
| Course Adviser   | adviser1  | pass     |
| HOD              | hod1      | pass     |
| School Officer   | officer1  | pass     |
| Academic Planning| academic1 | pass     |
| Registry         | registry1 | pass     |
| Administrator    | admin     | admin    |

---

## 🧪 Running Locally (Frontend Only)

\`\`\`bash
cd frontend
npm install
npm run dev
\`\`\`

App runs on:
http://localhost:5173

---

## 🧪 Running with Full Backend

### 📌 Prerequisites
- Node.js 18+
- PostgreSQL (local or cloud)

---

### 🔧 Backend Setup

\`\`\`bash
cd backend
npm install
npx prisma migrate dev
npm run dev
\`\`\`

Runs on:
http://localhost:5000

---

### 💻 Frontend Setup (Connected to Backend)

\`\`\`bash
cd frontend

# Create env file
echo "VITE_API_URL=http://localhost:5000/api" > .env.local

npm install
npm run dev
\`\`\`

---

## ☁️ Deploying to Cloud (Free Tier)

### Backend → Render

1. Go to https://render.com  
2. Create new Web Service  
3. Connect your GitHub repo → select /backend  

Build Command:
npm install && npx prisma migrate deploy

Start Command:
node src/index.js

---

### 🔑 Environment Variables

- DATABASE_URL → from Render PostgreSQL  
- JWT_SECRET → any long random string  
- CLIENT_URL → your frontend URL  

---

### 🗄️ Database

- Add PostgreSQL database on Render (free tier)  
- Copy connection string → use as DATABASE_URL  

---

## 🔌 API Reference

| Method | Endpoint                          | Auth     | Description                  |
|--------|----------------------------------|----------|------------------------------|
| POST   | /api/auth/register               | None     | Student self-registration     |
| POST   | /api/auth/login                  | None     | Login (returns JWT)           |
| GET    | /api/auth/me                     | Token    | Get current user              |
| GET    | /api/courses                     | Token    | List courses                  |
| POST   | /api/courses                     | Admin    | Create course                 |
| GET    | /api/registrations               | Token    | List registrations            |
| POST   | /api/registrations               | Student  | Submit registration           |
| GET    | /api/registrations/:id           | Token    | Get single registration       |
| POST   | /api/registrations/:id/approve   | Approver | Approve registration          |
| POST   | /api/registrations/:id/reject    | Approver | Reject registration           |
| GET    | /api/registrations/stats         | Admin    | System statistics             |
| GET    | /api/users                       | Admin    | List users                    |
| PATCH  | /api/users/:id/role              | Admin    | Assign role                   |

---

## 🛠️ Tech Stack

| Layer     | Technology                          |
|----------|-------------------------------------|
| Frontend | React 18, Vite, React Router v6     |
| Backend  | Node.js, Express                    |
| Database | PostgreSQL (Prisma ORM)             |
| Auth     | JWT (jsonwebtoken + bcryptjs)       |
| Hosting  | Vercel (frontend) + Render (backend)|

---

## 📌 Notes

- Frontend-only mode uses localStorage  
- Backend mode uses full database + authentication  
- Designed for scalability and role-based workflows  

---

## 👨‍💻 Author

Built for academic and practical use in university systems.
