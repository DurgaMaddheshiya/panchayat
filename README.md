# 🏙️ Apna Shehar - Smart Grievance Management System

> **Report. Track. Resolve.** - A complete digital platform for civic complaint management

[![Spring Boot](https://img.shields.io/badge/Spring%20Boot-3.2.0-brightgreen.svg)](https://spring.io/projects/spring-boot)
[![React](https://img.shields.io/badge/React-18.3.1-blue.svg)](https://reactjs.org/)
[![MySQL](https://img.shields.io/badge/MySQL-8.0+-orange.svg)](https://www.mysql.com/)
[![Java](https://img.shields.io/badge/Java-21-red.svg)](https://www.oracle.com/java/)

---

## 📌 About

**Apna Shehar** is a full-stack grievance management system that bridges the gap between citizens and local government. Citizens can report civic issues like potholes, water problems, electricity faults, etc., while officials can track, assign, and resolve complaints efficiently.

### Key Features

✅ **Citizen Portal**
- File complaints with photos and location
- Real-time status tracking
- Upvote community issues
- Comment and discuss

✅ **Official Dashboard**
- View and manage all complaints
- Assign to team members
- Update status with notes
- Priority-based workflow

✅ **Admin Panel**
- User management
- System analytics
- Category management
- Performance reports

✅ **Real-time Features**
- Notifications
- Live status updates
- Comment threads
- Vote tracking

---

## 🏗️ Tech Stack

### Backend
- **Framework:** Spring Boot 3.2.0
- **Language:** Java 21
- **Security:** Spring Security + JWT
- **Database:** MySQL 8.0+
- **ORM:** Spring Data JPA
- **API Docs:** Swagger/OpenAPI
- **Build Tool:** Maven

### Frontend
- **Framework:** React 18.3.1
- **State:** Redux Toolkit
- **UI Library:** Material-UI (MUI)
- **Routing:** React Router v6
- **HTTP Client:** Axios
- **Charts:** Chart.js
- **Notifications:** React Toastify

### Database
- **MySQL 8.0+**
- Normalized schema with indexes
- Sample data included

### DevOps
- **Docker** & Docker Compose
- Multi-stage builds
- Environment-based configs

---

## 📂 Project Structure

```
apna-shehar/
├── backend/                    # Spring Boot Backend
│   ├── src/
│   │   └── main/
│   │       ├── java/com/apnashehar/
│   │       │   ├── config/           # Security, CORS, Swagger
│   │       │   ├── controller/       # REST Controllers (8)
│   │       │   ├── service/          # Business Logic (8)
│   │       │   ├── repository/       # Data Access (8)
│   │       │   ├── entity/           # JPA Entities (9)
│   │       │   ├── dto/              # Request/Response DTOs (16)
│   │       │   ├── mapper/           # Entity-DTO Mappers (5)
│   │       │   ├── security/         # JWT, UserDetails (6)
│   │       │   ├── exception/        # Global Exception Handling
│   │       │   └── enums/            # Constants (5)
│   │       └── resources/
│   │           └── application.properties
│   ├── pom.xml
│   └── Dockerfile
│
├── frontend/                   # React Frontend
│   ├── public/
│   ├── src/
│   │   ├── components/
│   │   │   ├── layout/           # Header, Sidebar, Footer
│   │   │   ├── common/           # Loader, ConfirmDialog, etc.
│   │   │   ├── complaints/       # ComplaintCard, CommentSection
│   │   │   └── charts/           # StatsCard, PieChart, BarChart
│   │   ├── pages/
│   │   │   ├── auth/             # Login, Register
│   │   │   ├── dashboard/        # 3 role-based dashboards
│   │   │   ├── complaints/       # List, Details, Create, Edit
│   │   │   ├── profile/          # Profile, EditProfile
│   │   │   └── public/           # LandingPage
│   │   ├── redux/
│   │   │   ├── slices/           # auth, complaint, notification, dashboard
│   │   │   └── store.js
│   │   ├── services/
│   │   │   └── api.js            # Axios + Interceptors
│   │   ├── utils/                # helpers, constants
│   │   ├── config/               # API endpoints
│   │   ├── App.js
│   │   └── index.js
│   ├── package.json
│   └── .env
│
├── database/
│   ├── schema.sql                # Complete DB schema
│   └── sample-data.sql           # Test users & data
│
├── docker-compose.yml
├── README.md
└── HOW_TO_RUN.md                # 👈 Detailed setup guide
```

**Total Files:**
- Backend: **72 Java files**
- Frontend: **43 React files**
- Database: **2 SQL files**

---

## 🚀 Quick Start

### Prerequisites
- Java 21
- Node.js 18+
- MySQL 8.0+
- Maven 3.6+

### 1. Clone & Navigate
```bash
cd C:\Users\durga\apna-shehar
```

### 2. Setup Database
```sql
mysql -u root -p
CREATE DATABASE apna_shehar;
exit;

cd database
mysql -u root -p apna_shehar < schema.sql
mysql -u root -p apna_shehar < sample-data.sql
```

### 3. Start Backend
```bash
cd backend
mvn spring-boot:run
```
✅ Backend: http://localhost:8080  
✅ Swagger: http://localhost:8080/swagger-ui.html

### 4. Start Frontend
```bash
cd frontend
npm install --legacy-peer-deps
npm start
```
✅ Frontend: http://localhost:3000

---

## 🐳 Docker Setup (Easiest!)

```bash
docker-compose up
```

Everything will start automatically!

---

## 🎯 API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login
- `POST /api/auth/refresh` - Refresh JWT token

### Complaints
- `GET /api/complaints` - List all (with filters)
- `POST /api/complaints` - Create complaint
- `GET /api/complaints/{id}` - Get details
- `PUT /api/complaints/{id}` - Update complaint
- `DELETE /api/complaints/{id}` - Delete complaint
- `GET /api/complaints/my-complaints` - User's complaints
- `GET /api/complaints/trending` - Trending issues

### Comments
- `POST /api/comments` - Add comment
- `GET /api/comments/complaint/{id}` - Get comments
- `PUT /api/comments/{id}` - Update comment
- `DELETE /api/comments/{id}` - Delete comment

### Votes
- `POST /api/votes/complaint/{id}/upvote` - Upvote
- `DELETE /api/votes/complaint/{id}/upvote` - Remove upvote
- `GET /api/votes/complaint/{id}/count` - Vote count

### Dashboard
- `GET /api/dashboard/stats` - System statistics
- `GET /api/dashboard/citizen/{id}` - Citizen stats
- `GET /api/dashboard/social-worker/{id}` - Official stats

**Full API Documentation:** http://localhost:8080/swagger-ui.html

---

## 👥 Default Users

### Citizen
- Email: `citizen@example.com`
- Password: `citizen123`

### Official
- Email: `official@apnashehar.com`
- Password: `official123`

### Admin
- Email: `admin@apnashehar.com`
- Password: `admin123`

---

## 🎨 Screenshots

### Landing Page
Clean, modern landing page with feature highlights

### Citizen Dashboard
- View complaint statistics
- Recent complaints
- Quick actions

### Complaint List
- Search & filter
- Category-wise view
- Status indicators

### Complaint Details
- Full description
- Comments section
- Status timeline
- Upvote functionality

### Official Dashboard
- Pending complaints
- Assignment management
- Performance metrics

---

## 🔐 Security Features

- ✅ JWT-based authentication
- ✅ Role-based access control (RBAC)
- ✅ Password encryption (BCrypt)
- ✅ CORS configuration
- ✅ SQL injection prevention
- ✅ XSS protection
- ✅ Token refresh mechanism

---

## 📊 Database Schema

### Core Tables
- `users` - User accounts
- `complaints` - Complaint records
- `comments` - Comment threads
- `votes` - Upvote tracking
- `notifications` - User notifications
- `categories` - Complaint categories
- `wards` - Administrative wards
- `attachments` - File uploads

**Relationships:**
- One user → Many complaints
- One complaint → Many comments
- One complaint → Many votes
- Many-to-Many: Users ↔ Notifications

---

## 🧪 Testing

### Backend Tests
```bash
cd backend
mvn test
```

### Frontend Tests
```bash
cd frontend
npm test
```

---

## 📦 Build for Production

### Backend JAR
```bash
cd backend
mvn clean package
java -jar target/apna-shehar-backend-1.0.0.jar
```

### Frontend Build
```bash
cd frontend
npm run build
# Build files in: frontend/build/
```

---

## 🌍 Environment Variables

### Backend (`application.properties`)
```properties
spring.datasource.url=jdbc:mysql://localhost:3306/apna_shehar
spring.datasource.username=root
spring.datasource.password=yourpassword

jwt.secret=your-secret-key-here
jwt.expiration=86400000
```

### Frontend (`.env`)
```env
REACT_APP_API_URL=http://localhost:8080/api
REACT_APP_GOOGLE_MAPS_KEY=your_maps_key_here
```

---

## 🤝 Contributing

1. Fork the repository
2. Create feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit changes (`git commit -m 'Add AmazingFeature'`)
4. Push to branch (`git push origin feature/AmazingFeature`)
5. Open Pull Request

---

## 📝 License

This project is built for educational and demonstration purposes.

---

## 🙏 Acknowledgments

- Spring Boot Team
- React Team
- Material-UI
- Chart.js
- All open-source contributors

---

## 📧 Contact & Support

**Project Location:** `C:\Users\durga\apna-shehar`  
**Documentation:** See `HOW_TO_RUN.md` for detailed setup instructions

---

## 🎯 Roadmap

- [ ] Mobile app (React Native)
- [ ] Real-time chat
- [ ] Email notifications
- [ ] SMS integration
- [ ] Advanced analytics
- [ ] Multi-language support
- [ ] PWA support

---

Made with ❤️ for better civic engagement

**Version:** 1.0.0  
**Last Updated:** August 2026