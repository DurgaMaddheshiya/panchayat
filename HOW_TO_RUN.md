# 🚀 Apna Shehar - Kaise Run Karein

## 📍 Project Location
```
C:\Users\durga\apna-shehar
```

---

## ⚡ Quick Start (Sabse Easy Method)

### 1️⃣ Backend Start Karo
```powershell
cd C:\Users\durga\apna-shehar\backend
mvn spring-boot:run
```
✅ Backend chal jayega: **http://localhost:8080**  
✅ API Docs: **http://localhost:8080/swagger-ui.html**

### 2️⃣ Frontend Start Karo (Dusri Terminal Mein)
```powershell
cd C:\Users\durga\apna-shehar\frontend
npm start
```
✅ Frontend chal jayega: **http://localhost:3000**

---

## 📝 Detailed Steps

### Backend Setup

#### Step 1: MySQL Database Start
```powershell
# Option A: Agar MySQL already installed hai
mysql -u root -p

# Database create karo
CREATE DATABASE apna_shehar;
exit;
```

#### Step 2: Database Schema Load
```powershell
cd C:\Users\durga\apna-shehar\database
mysql -u root -p apna_shehar < schema.sql
mysql -u root -p apna_shehar < sample-data.sql
```

#### Step 3: application.properties Configure
File: `backend/src/main/resources/application.properties`
```properties
spring.datasource.url=jdbc:mysql://localhost:3306/apna_shehar
spring.datasource.username=root
spring.datasource.password=YOUR_PASSWORD_HERE
```

#### Step 4: Backend Run
```powershell
cd C:\Users\durga\apna-shehar\backend
mvn clean install
mvn spring-boot:run
```

**✅ Backend Running:**
- Main API: http://localhost:8080/api
- Swagger UI: http://localhost:8080/swagger-ui.html
- Health Check: http://localhost:8080/actuator/health

---

### Frontend Setup

#### Step 1: Dependencies Install (Agar pehle se nahi hai)
```powershell
cd C:\Users\durga\apna-shehar\frontend
npm install --legacy-peer-deps
```

#### Step 2: Environment Configure
File: `frontend/.env` (already created)
```env
REACT_APP_API_URL=http://localhost:8080/api
```

#### Step 3: Frontend Run
```powershell
cd C:\Users\durga\apna-shehar\frontend
npm start
```

**✅ Frontend Running:**
- App URL: http://localhost:3000
- Auto-opens in browser

---

## 🐳 Docker Se Run Karna (Optional - Sabse Easy!)

Agar Docker installed hai:

```powershell
cd C:\Users\durga\apna-shehar
docker-compose up
```

Ye automatically sab kuch start kar dega:
- MySQL Database
- Backend API
- Frontend App

---

## 🧪 Test Karne Ke Liye

### Default Users (Sample Data)

**Admin Login:**
```
Email: admin@apnashehar.com
Password: admin123
```

**Citizen Login:**
```
Email: citizen@example.com
Password: citizen123
```

**Official Login:**
```
Email: official@apnashehar.com
Password: official123
```

---

## 📍 Important URLs

| Service | URL | Description |
|---------|-----|-------------|
| Frontend | http://localhost:3000 | Main App |
| Backend API | http://localhost:8080/api | REST APIs |
| Swagger | http://localhost:8080/swagger-ui.html | API Docs |
| Health | http://localhost:8080/actuator/health | Backend Status |

---

## 🔧 Common Commands

### Backend Commands
```powershell
# Clean build
mvn clean install

# Run tests
mvn test

# Package as JAR
mvn package

# Run JAR directly
java -jar target/apna-shehar-backend-1.0.0.jar
```

### Frontend Commands
```powershell
# Development server
npm start

# Production build
npm run build

# Run tests
npm test
```

### Docker Commands
```powershell
# Start all services
docker-compose up

# Start in background
docker-compose up -d

# Stop all services
docker-compose down

# View logs
docker-compose logs -f
```

---

## ❌ Troubleshooting

### Port Already in Use

**Backend (8080):**
```powershell
# Check karo kaun use kar raha hai
netstat -ano | findstr :8080

# Process kill karo
taskkill /PID <PID_NUMBER> /F
```

**Frontend (3000):**
```powershell
# Check karo
netstat -ano | findstr :3000

# Kill process
taskkill /PID <PID_NUMBER> /F
```

### MySQL Connection Error
```
Error: Access denied for user 'root'@'localhost'
```
**Solution:** `application.properties` mein password check karo

### NPM Install Errors
```powershell
# Cache clear karo
npm cache clean --force

# Phir install
npm install --legacy-peer-deps
```

---

## 📂 Project Structure

```
C:\Users\durga\apna-shehar\
├── backend\               ← Spring Boot Backend
│   ├── src\
│   ├── pom.xml
│   └── Dockerfile
├── frontend\              ← React Frontend  
│   ├── src\
│   ├── package.json
│   └── public\
├── database\              ← SQL Scripts
│   ├── schema.sql
│   └── sample-data.sql
├── docker-compose.yml     ← Docker Setup
├── README.md
└── HOW_TO_RUN.md         ← Ye file!
```

---

## 🎯 Features Available

### Citizen Features
- ✅ Register/Login
- ✅ File Complaints (with photos)
- ✅ Track Complaint Status
- ✅ Upvote Issues
- ✅ Add Comments
- ✅ View Dashboard

### Official Features
- ✅ View All Complaints
- ✅ Update Status
- ✅ Assign Complaints
- ✅ Official Comments
- ✅ Analytics Dashboard

### Admin Features
- ✅ Full System Access
- ✅ User Management
- ✅ Category Management
- ✅ Reports & Analytics
- ✅ System Statistics

---

## 📞 Quick Reference

**Backend Port:** 8080  
**Frontend Port:** 3000  
**Database:** MySQL 8.0+  
**Java Version:** 21  
**Node Version:** 18+ recommended

---

## 🚀 Ab Chalu Karo!

### Ek Command Mein (PowerShell)

**Terminal 1 - Backend:**
```powershell
cd C:\Users\durga\apna-shehar\backend ; mvn spring-boot:run
```

**Terminal 2 - Frontend:**
```powershell
cd C:\Users\durga\apna-shehar\frontend ; npm start
```

**Done! 🎉**

Visit: http://localhost:3000

---

## 📧 Test Login Credentials

Try these in the app:

**Citizen Account:**
- Email: `citizen@example.com`
- Password: `citizen123`

**Admin Account:**
- Email: `admin@apnashehar.com`  
- Password: `admin123`

---

**Happy Coding! 🚀**

Last Updated: 2026-08-07