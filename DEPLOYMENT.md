# Deployment Guide - Apna Shehar

This guide covers deployment options for the Apna Shehar application.

---

## 📦 Local Development

### Prerequisites
- Java 21+
- Node.js 18+
- MySQL 8.0+
- Maven 3.8+

### Steps

1. **Database Setup**
```bash
mysql -u root -p
CREATE DATABASE apna_shehar_db;
mysql -u root -p apna_shehar_db < database/schema.sql
mysql -u root -p apna_shehar_db < database/sample-data.sql
```

2. **Backend**
```bash
cd backend
mvn clean install
mvn spring-boot:run
```

3. **Frontend**
```bash
cd frontend
npm install
npm start
```

---

## 🐳 Docker Deployment

### Prerequisites
- Docker 20.10+
- Docker Compose 2.0+

### Steps

1. **Clone Repository**
```bash
git clone https://github.com/yourusername/apna-shehar.git
cd apna-shehar
```

2. **Build and Run**
```bash
docker-compose up -d
```

3. **Check Status**
```bash
docker-compose ps
```

4. **View Logs**
```bash
docker-compose logs -f
```

5. **Stop Services**
```bash
docker-compose down
```

### Access Application
- Frontend: http://localhost:3000
- Backend API: http://localhost:8080
- Swagger UI: http://localhost:8080/swagger-ui.html

---

## ☁️ Cloud Deployment

### AWS Deployment

#### EC2 + RDS

1. **Create RDS MySQL Instance**
```bash
- Engine: MySQL 8.0
- Instance: db.t3.medium
- Storage: 50 GB
- Multi-AZ: No (for development)
```

2. **Launch EC2 Instance**
```bash
- AMI: Ubuntu 22.04 LTS
- Instance Type: t3.medium
- Security Group: Allow 22, 80, 443, 8080
```

3. **Install Dependencies**
```bash
sudo apt update
sudo apt install -y openjdk-21-jdk maven nodejs npm nginx

# Install Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh
```

4. **Deploy Application**
```bash
git clone https://github.com/yourusername/apna-shehar.git
cd apna-shehar

# Update application.properties with RDS endpoint
cd backend
mvn clean package
java -jar target/apna-shehar-backend-1.0.0.jar

# Build frontend
cd ../frontend
npm install
npm run build

# Configure Nginx
sudo cp nginx.conf /etc/nginx/sites-available/apna-shehar
sudo ln -s /etc/nginx/sites-available/apna-shehar /etc/nginx/sites-enabled/
sudo systemctl restart nginx
```

#### Elastic Beanstalk

1. **Install EB CLI**
```bash
pip install awsebcli
```

2. **Initialize**
```bash
cd backend
eb init -p java-21 apna-shehar --region us-east-1
```

3. **Create Environment**
```bash
eb create apna-shehar-prod
```

4. **Deploy**
```bash
mvn clean package
eb deploy
```

---

### Google Cloud Platform (GCP)

#### App Engine + Cloud SQL

1. **Create Cloud SQL Instance**
```bash
gcloud sql instances create apna-shehar-db \
  --database-version=MYSQL_8_0 \
  --tier=db-n1-standard-1 \
  --region=asia-south1
```

2. **Create Database**
```bash
gcloud sql databases create apna_shehar_db --instance=apna-shehar-db
```

3. **Deploy Backend**
```bash
cd backend
gcloud app deploy
```

4. **Deploy Frontend**
```bash
cd frontend
gcloud app deploy
```

---

### Azure Deployment

#### App Service + Azure Database for MySQL

1. **Create Resource Group**
```bash
az group create --name apna-shehar-rg --location eastus
```

2. **Create MySQL Server**
```bash
az mysql server create \
  --resource-group apna-shehar-rg \
  --name apna-shehar-mysql \
  --location eastus \
  --admin-user adminuser \
  --admin-password YourPassword123! \
  --sku-name B_Gen5_1
```

3. **Create Database**
```bash
az mysql db create \
  --resource-group apna-shehar-rg \
  --server-name apna-shehar-mysql \
  --name apna_shehar_db
```

4. **Deploy App Service**
```bash
cd backend
mvn clean package
az webapp deploy --resource-group apna-shehar-rg \
  --name apna-shehar-api \
  --src-path target/apna-shehar-backend-1.0.0.jar
```

---

## 🔐 Environment Variables

### Production Configuration

Create `.env` file:

```bash
# Database
DB_HOST=your-db-host
DB_PORT=3306
DB_NAME=apna_shehar_db
DB_USERNAME=your-username
DB_PASSWORD=your-password

# JWT
JWT_SECRET=your-super-secret-key-min-256-bits
JWT_EXPIRATION=86400000
JWT_REFRESH_EXPIRATION=604800000

# Email (Optional)
MAIL_HOST=smtp.gmail.com
MAIL_PORT=587
MAIL_USERNAME=your-email@gmail.com
MAIL_PASSWORD=your-app-password

# File Upload
FILE_UPLOAD_DIR=/app/uploads
FILE_MAX_SIZE=52428800

# Frontend
REACT_APP_API_URL=https://api.yourdomain.com
REACT_APP_GOOGLE_MAPS_KEY=your-google-maps-api-key
```

---

## 🔒 SSL/TLS Configuration

### Using Let's Encrypt

```bash
sudo apt install certbot python3-certbot-nginx
sudo certbot --nginx -d yourdomain.com -d www.yourdomain.com
sudo systemctl restart nginx
```

---

## 📊 Monitoring & Logging

### Application Monitoring

1. **Spring Boot Actuator**
```properties
management.endpoints.web.exposure.include=health,metrics,info
management.endpoint.health.show-details=always
```

2. **Access Metrics**
```bash
curl http://localhost:8080/actuator/health
curl http://localhost:8080/actuator/metrics
```

### Logging

```bash
# View backend logs
docker-compose logs -f backend

# View database logs
docker-compose logs -f mysql

# Export logs
docker-compose logs --no-color > logs.txt
```

---

## 🔄 CI/CD Pipeline

### GitHub Actions

Create `.github/workflows/deploy.yml`:

```yaml
name: Deploy Apna Shehar

on:
  push:
    branches: [ main ]

jobs:
  build-and-deploy:
    runs-on: ubuntu-latest
    
    steps:
    - uses: actions/checkout@v2
    
    - name: Set up JDK 21
      uses: actions/setup-java@v2
      with:
        java-version: '21'
        
    - name: Build Backend
      run: |
        cd backend
        mvn clean package -DskipTests
        
    - name: Build Frontend
      run: |
        cd frontend
        npm install
        npm run build
        
    - name: Deploy to Server
      uses: appleboy/scp-action@master
      with:
        host: ${{ secrets.SERVER_HOST }}
        username: ${{ secrets.SERVER_USER }}
        key: ${{ secrets.SSH_KEY }}
        source: "."
        target: "/app/apna-shehar"
```

---

## 🆘 Troubleshooting

### Common Issues

1. **Database Connection Failed**
```bash
# Check MySQL is running
sudo systemctl status mysql

# Check connection
mysql -u root -p -h localhost
```

2. **Port Already in Use**
```bash
# Find process using port
lsof -i :8080
kill -9 <PID>
```

3. **Frontend Not Connecting to Backend**
```bash
# Check CORS configuration
# Verify API URL in frontend .env
```

---

## 📞 Support

For deployment issues:
- Email: devops@apnashehar.com
- Create GitHub Issue: https://github.com/yourusername/apna-shehar/issues

---

**Deployment Guide v1.0 - Updated: 2024**