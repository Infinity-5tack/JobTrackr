# JobTrackr

**Smart AI-powered job application tracker built with Flask and React**

## 🚀 Overview

JobTrackr helps users manage, track, and optimize their job hunt using AI-generated resumes and cover letters, real-time analytics, and a personalized dashboard. Built by Team Infinity 5tack for the CLO900 Capstone Project at Seneca Polytechnic.

---

## 🧱 Architecture

<img src="./JobTrackr_Architecture.png" alt="JobTrackr Poster" width="60%" />

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

## Team Members

| Name                   | Role                           |
|------------------------|--------------------------------|
| **Poonam Agarwal**     | Backend Developer (Auth, APIs) |
| **Dhairya Soni**       | Resume Generator, DB Mapping   |
| **Krishna Katira**     | Frontend Lead, UI/UX           |
| **Smriti Banjade**     | Cover Letter & Job Search UI   |
| **Ishan Sohal**        | DevOps & Cloud Deployment      |

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


