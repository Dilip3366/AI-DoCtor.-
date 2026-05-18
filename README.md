# 🏥 Doctor AI Agents — Clinic Management & Appointment Booking

A full-stack advanced AI-powered clinic management system with multi-agent AI, real-time scheduling, patient records, and smart recommendations.

---

## 🚀 Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React + Vite + TailwindCSS |
| Backend | Node.js + Express |
| Database | MongoDB (via Mongoose) |
| AI Agents | OpenAI GPT-4 (multi-agent) |
| Auth | JWT + bcrypt |
| Realtime | Socket.io |
| Email | Nodemailer |

---

## 📁 Project Structure

```
doctor-ai-clinic/
├── frontend/         → React Vite app
├── backend/          → Express REST API + AI Agents
├── .env.example      → Environment variables template
└── README.md
```

---

## ⚙️ Setup Instructions (VS Code)

### Prerequisites
- Node.js v18+ → https://nodejs.org
- MongoDB Atlas account (free) → https://mongodb.com/atlas
- OpenAI API Key → https://platform.openai.com

---

### Step 1 — Clone / Open in VS Code
Open the project folder in VS Code:
```
File → Open Folder → select "doctor-ai-clinic"
```

---

### Step 2 — Backend Setup

Open VS Code terminal (`Ctrl + \``) and run:

```bash
cd backend
npm install
```

Create `.env` file inside `backend/`:
```
cp ../.env.example .env
```
Then fill in your keys in `backend/.env`

Start backend:
```bash
npm run dev
```
✅ Backend runs on http://localhost:5000

---

### Step 3 — Frontend Setup

Open a **second terminal** in VS Code:
```bash
cd frontend
npm install
npm run dev
```
✅ Frontend runs on http://localhost:5173

---

### Step 4 — Open in Browser
Visit: **http://localhost:5173**

---

## 🤖 AI Agents Included

| Agent | Role |
|-------|------|
| 🩺 **DiagnosisAgent** | Suggests possible diagnoses from symptoms |
| 📅 **SchedulerAgent** | Optimizes appointment slots intelligently |
| 💊 **PrescriptionAgent** | Reviews prescriptions for interactions |
| 📞 **ReceptionistAgent** | Handles patient queries via chat |
| 📊 **AnalyticsAgent** | Generates clinic performance reports |

---

## 🔑 Default Login Credentials

| Role | Email | Password |
|------|-------|----------|
| Admin | admin@clinic.com | Admin@123 |
| Doctor | doctor@clinic.com | Doctor@123 |
| Patient | patient@clinic.com | Patient@123 |

---

## 🌟 Advanced Features

- Multi-role authentication (Admin / Doctor / Patient)
- AI-powered symptom checker
- Smart appointment scheduling with conflict detection
- Real-time notifications via Socket.io
- Patient history & medical records
- Prescription management
- Analytics dashboard
- Email appointment reminders
