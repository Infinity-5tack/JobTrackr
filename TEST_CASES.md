# 🧪 API Testing Documentation – JobTrackr

## 📦 Tool Used
All backend APIs were tested using **Postman**.

## 🧪 Key Endpoints Tested
| Endpoint               | Method | Purpose                     | Auth Required |
|------------------------|--------|-----------------------------|---------------|
| /signup                | POST   | User registration           | ❌            |
| /signin                | POST   | Login & JWT retrieval       | ❌            |
| /profile               | POST   | Create profile              | ✅            |
| /getProfile            | GET    | Fetch profile               | ✅            |
| /addJob                | POST   | Add job to tracker          | ✅            |
| /updateJob             | PUT    | Edit job status             | ✅            |
| /analytics             | GET    | Load personal analytics     | ✅            |
| /reset-password-email  | POST   | Start password reset flow   | ❌            |
| /reset-password-verify | POST   | Complete password reset     | ❌            |

## ✅ Results
All endpoints returned expected status codes (200, 401, 400) based on valid and invalid inputs.

📎 Download full test matrix:  
[JobTrackr__QA_Test_Cases.csv](./JobTrackr__QA_Test_Cases.csv)
