# JobTrackr

**Smart AI-powered job application tracker built with Flask and React**

## 🚀 Overview

JobTrackr helps users manage, track, and optimize their job hunt using AI-generated resumes and cover letters, real-time analytics, and a personalized dashboard. Built by Team Infinity 5tack for the CLO900 Capstone Project at Seneca Polytechnic.

---

## 🧱 Architecture

<img src="./POSTER.pdf" alt="JobTrackr+ Architecture Poster" width="100%" />

> ⚠️ GitHub does **not** render PDF files directly as images. To embed it visually, you need to:
> ✅ Convert your `POSTER.pdf` into an image (PNG or JPG)  
> ✅ Save it as `./assets/poster.png`  
> ✅ Then update the embed to:

<img src="./assets/poster.png" alt="JobTrackr+ Poster" width="100%" />

---

## 🧩 Features

- 🔐 Secure sign-up, login, and password reset with OTP
- 📄 AI-powered resume and cover letter generation 
- 🧑‍💼 Multi-step user profile setup
- 📊 Dashboard with personal and community analytics
- 🔍 Job search via Adzuna & Jooble APIs
- 💼 Job tracker with status updates and filtering
- 🧠 Company research tool 
- 📦 Fully containerized using Docker
- ☁️ Deployed on Azure with CI/CD

---

## 🛠️ Tech Stack

| Layer       | Tools Used                      |
|-------------|----------------------------------|
| Frontend    | React, Material UI, Tailwind CSS |
| Backend     | Python Flask, OpenAI API         |
| Database    | MySQL on Azure                   |
| Cloud       | Azure (App Service, DB)          |
| DevOps      | GitHub Actions + Docker          |

---

## 📁 Project Structure

```bash
├── backend/
│   ├── app.py
│   ├── run.py
│   └── tables.sql
├── frontend/
│   ├── src/components/
│   ├── src/pages/
│   ├── App.js
│   └── index.js
├── Dockerfile (Frontend + Backend)
└── README.md


