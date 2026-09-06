# 🚀 Render Deployment Configuration Guide

## Required Environment Variables for Email Service

### Step 1: Gmail App Password Setup

1. **Enable 2-Step Verification:**
   - Go to [Google Account Security](https://myaccount.google.com/security)
   - Enable 2-Step Verification if not already enabled

2. **Generate App Password:**
   - Visit: [App Passwords](https://myaccount.google.com/apppasswords)
   - Select "Other (Custom name)" → Enter "Apna Shehar"
   - Copy the 16-character password (format: `abcd-efgh-ijkl-mnop`)

### Step 2: Render Environment Variables

**Backend Service → Environment Tab:**

```bash
# 🔑 JWT Configuration (REQUIRED)
JWT_SECRET=uyON4ZFfFChZlvh9FTSdMWFEpIP7AGxpNybSXXT+m+kQXJppjLGKFxTQPDesfY8RnTDjoYJmtXWILJRq6WPcqw==

# 📧 Email Configuration (REQUIRED for OTP)
MAIL_USERNAME=your-gmail@gmail.com
MAIL_PASSWORD=abcd-efgh-ijkl-mnop
MAIL_FROM=your-gmail@gmail.com

# 🌐 CORS Configuration (REQUIRED)
CORS_ALLOWED_ORIGINS=https://apna-shehar-frontend.onrender.com

# 👤 Admin Account (Optional - has defaults)
ADMIN_EMAIL=admin@apnashehar.com
ADMIN_PASSWORD=Admin@123
ADMIN_FULLNAME=System Administrator

# 🗄️ Database (Optional - H2 works fine)
DB_URL=jdbc:h2:file:./data/apnashehar;DB_CLOSE_DELAY=-1;DB_CLOSE_ON_EXIT=FALSE;MODE=MySQL
DB_USERNAME=sa
DB_PASSWORD=
```

### Step 3: Verification Checklist

**After adding environment variables:**

1. ✅ **Redeploy Service** - Render auto-redeploys when env vars change
2. ✅ **Check Logs** - Look for "OTP email sent successfully" in logs
3. ✅ **Test Registration** - Try registering with real email
4. ✅ **Check Email** - Should receive OTP within 1-2 minutes

### 🔍 Troubleshooting Common Issues

**1. 500 Error on /send-otp:**
```
Solution: Check MAIL_USERNAME, MAIL_PASSWORD environment variables
Logs will show: "Email service authentication failed"
```

**2. Gmail Authentication Failed:**
```
Solution: 
- Use App Password (not regular password)
- Enable 2-Step Verification first
- Double-check 16-character format: abcd-efgh-ijkl-mnop
```

**3. CORS Issues:**
```
Solution: Set CORS_ALLOWED_ORIGINS=https://apna-shehar-frontend.onrender.com
```

**4. JWT Errors:**
```
Solution: Set JWT_SECRET to a strong 64-byte base64 string
Generate: node -e "console.log(require('crypto').randomBytes(64).toString('base64'))"
```

### 📊 Monitoring Deployment

**Check Render Logs for these success messages:**
```
✅ Started ApnaSheharApplication in X.XX seconds
✅ OTP email sent successfully to: user@example.com
✅ Email verified successfully: user@example.com
```

**Common Error Messages:**
```
❌ Mail server connection failed
❌ Authentication failed
❌ Email service not properly configured
```

### 🔧 Local Testing

**Test email configuration locally:**
```bash
# In backend folder
cp .env.example .env
# Edit .env with your Gmail credentials
./mvnw spring-boot:run
```

**Test with curl:**
```bash
curl -X POST https://apna-shehar-backend.onrender.com/api/auth/send-otp \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","fullName":"Test User"}'
```

### 📞 Support

If still facing issues:
1. Share Render logs from Backend Service
2. Verify Gmail App Password setup
3. Check CORS configuration for frontend domain

**Live URLs:**
- Frontend: https://apna-shehar-frontend.onrender.com
- Backend: https://apna-shehar-backend.onrender.com
- API Docs: https://apna-shehar-backend.onrender.com/swagger-ui.html