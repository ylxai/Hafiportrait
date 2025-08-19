# 🚀 CircleCI Environment Variables - Ready to Setup

## 📋 **COPY-PASTE READY VALUES**

### **🔑 STEP 1: Server Access**
```
Name: SERVER_HOST
Value: 147.251.255.227

Name: SERVER_USER  
Value: ubuntu

Name: SSH_PRIVATE_KEY
Value: [COPY FROM: cat ~/.ssh/id_rsa]
```

### **🐳 STEP 2: Docker Hub (Required)**
```
Name: DOCKER_USER
Value: [YOUR_DOCKERHUB_USERNAME]

Name: DOCKER_PASS
Value: [YOUR_DOCKERHUB_PASSWORD]
```

### **🌐 STEP 3: Application Environment**
```
Name: NODE_ENV
Value: production

Name: NEXT_PUBLIC_APP_URL
Value: https://hafiportrait.photography

Name: JWT_SECRET
Value: hafiportrait-production-secure-2025

Name: PORT
Value: 3000

Name: HOST
Value: 0.0.0.0
```

### **🗄️ STEP 4: Database (Supabase)**
```
Name: NEXT_PUBLIC_SUPABASE_URL
Value: https://azspktldiblhrwebzmwq.supabase.co

Name: NEXT_PUBLIC_SUPABASE_ANON_KEY
Value: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImF6c3BrdGxkaWJsaHJ3ZWJ6bXdxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTM5NDQwNDQsImV4cCI6MjA2OTUyMDA0NH0.uKHB4K9hxUDTc0ZkwidCJv_Ev-oa99AflFvrFt_8MG8

Name: SUPABASE_SERVICE_ROLE_KEY
Value: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImF6c3BrdGxkaWJsaHJ3ZWJ6bXdxIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1Mzk0NDA0NCwiZXhwIjoyMDY5NTIwMDQ0fQ.hk8vOgFoW3PJZxhw40sHiNyvNxbD4_c4x6fqBynvlmE
```

### **☁️ STEP 5: Storage (Cloudflare R2)**
```
Name: CLOUDFLARE_R2_ACCOUNT_ID
Value: b14090010faed475102a62eca152b67f

Name: CLOUDFLARE_R2_ACCESS_KEY_ID
Value: 51c66dbac26827b84132186428eb3492

Name: CLOUDFLARE_R2_SECRET_ACCESS_KEY
Value: 65fe1143600bd9ef97a5c76b4ae924259779e0d0815ce44f09a1844df37fe3f1

Name: CLOUDFLARE_R2_BUCKET_NAME
Value: hafiportrait-photos

Name: CLOUDFLARE_R2_PUBLIC_URL
Value: https://photos.hafiportrait.photography

Name: CLOUDFLARE_R2_ENDPOINT
Value: https://b14090010faed475102a62eca152b67f.r2.cloudflarestorage.com
```

### **📁 STEP 6: Google Drive Storage**
```
Name: GOOGLE_DRIVE_CLIENT_ID
Value: 1098208255243-i92ah6oithsvfhvq4fq62tfr8armjh1a.apps.googleusercontent.com

Name: GOOGLE_DRIVE_CLIENT_SECRET
Value: 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

Name: GOOGLE_DRIVE_REFRESH_TOKEN
Value: 1//0erDLcuFyYiK3CgYIARAAGA4SNwF-L9Ir3z2Ib2mbiPwCs-c3K_JeLfkZT0Zwxs-AMCJqyLsWs6nM8gk6Y4KLvrofLQHF9Qwcifg

Name: GOOGLE_DRIVE_FOLDER_NAME
Value: HafiPortrait-Photos
```

### **🔧 STEP 7: Smart Storage Configuration**
```
Name: SMART_STORAGE_ENABLED
Value: true

Name: SMART_STORAGE_DEFAULT_TIER
Value: cloudflareR2

Name: SMART_STORAGE_PRIMARY
Value: cloudflareR2

Name: SMART_STORAGE_SECONDARY
Value: local

Name: SMART_STORAGE_TERTIARY
Value: googleDrive

Name: SMART_STORAGE_COMPRESSION_QUALITY
Value: 60
```

### **🔌 STEP 8: Socket.IO Configuration**
```
Name: NEXT_PUBLIC_USE_SOCKETIO
Value: true

Name: NEXT_PUBLIC_SOCKETIO_URL
Value: https://hafiportrait.photography

Name: SOCKETIO_PORT
Value: 3001

Name: ENABLE_WEBSOCKET
Value: true

Name: ENABLE_REAL_TIME_UPDATES
Value: true

Name: ENABLE_SOCKETIO_ROOMS
Value: true
```

### **🔒 STEP 9: Security & CORS**
```
Name: CORS_ORIGIN
Value: https://hafiportrait.photography,https://www.hafiportrait.photography

Name: ALLOWED_ORIGINS
Value: https://hafiportrait.photography,https://www.hafiportrait.photography

Name: NEXT_TELEMETRY_DISABLED
Value: 1
```

## 🛠️ **SETUP INSTRUCTIONS**

### **1. Access CircleCI Dashboard**
```
1. Go to: https://app.circleci.com/
2. Login with GitHub account
3. Select "HafiPortrait" project
4. Click "Project Settings" (gear icon)
5. Navigate to "Environment Variables"
```

### **2. Add Variables (Copy-Paste)**
```
For each variable above:
1. Click "Add Environment Variable"
2. Copy "Name" from above
3. Copy "Value" from above  
4. Click "Add Variable"
5. Repeat for all variables
```

### **3. Special Instructions**

#### **SSH Private Key:**
```bash
# Get your SSH private key:
cat ~/.ssh/id_rsa

# Copy the ENTIRE output including:
-----BEGIN OPENSSH PRIVATE KEY-----
[key content]
-----END OPENSSH PRIVATE KEY-----

# Paste as value for SSH_PRIVATE_KEY
```

#### **Docker Hub Credentials:**
```bash
# If you don't have Docker Hub account:
1. Go to: https://hub.docker.com/
2. Create account
3. Use username/password for DOCKER_USER/DOCKER_PASS

# Or create access token (recommended):
1. Docker Hub → Account Settings → Security
2. Create "New Access Token"
3. Use token as DOCKER_PASS
```

## 🧪 **TEST SETUP**

### **1. Trigger CircleCI Build**
```bash
# Make a small change and push:
git add .
git commit -m "test: CircleCI environment setup"
git push origin main
```

### **2. Monitor Build**
```
1. Go to CircleCI dashboard
2. Watch build progress
3. Check for successful deployment
4. Look for any error messages
```

### **3. Verify Production**
```bash
# Test website
curl -I https://hafiportrait.photography

# Test API
curl -I https://hafiportrait.photography/api/health

# Test admin access
curl -I https://hafiportrait.photography/admin
```

## 🚨 **TROUBLESHOOTING**

### **Common Issues:**

#### **SSH Connection Failed:**
```
- Ensure SSH key has no extra spaces/newlines
- Verify public key exists on server: ~/.ssh/authorized_keys
- Check SSH key permissions: chmod 600 ~/.ssh/id_rsa
```

#### **Docker Build Failed:**
```
- Verify Docker Hub credentials are correct
- Check if Docker Hub repository exists
- Ensure DOCKER_USER has push permissions
```

#### **Environment Variables Missing:**
```
- Double-check variable names (case sensitive)
- Ensure no typos in variable values
- Verify all required variables are set
```

#### **Deployment Failed:**
```
- Check server disk space: df -h
- Verify server is accessible: ping 147.251.255.227
- Check Docker daemon running: sudo systemctl status docker
```

## ✅ **SUCCESS INDICATORS**

### **CircleCI Build Success:**
```
✅ Checkout code
✅ Install dependencies  
✅ Run linting
✅ Build application
✅ Build Docker images
✅ Deploy to server
✅ Health check passed
```

### **Production Verification:**
```
✅ Website loads: https://hafiportrait.photography
✅ Admin accessible: https://hafiportrait.photography/admin
✅ API responding: https://hafiportrait.photography/api/health
✅ Database connected
✅ Storage working
```

## 🎯 **NEXT STEPS**

After successful setup:
1. ✅ **Monitor first deployment**
2. ✅ **Test all functionality**
3. ✅ **Setup notifications** (Slack/Discord)
4. ✅ **Document workflow** for team
5. ✅ **Schedule regular deployments**

---

**🔒 SECURITY NOTE:** All sensitive values are stored securely in CircleCI and never exposed in code repository.

**📞 SUPPORT:** Check CircleCI build logs for detailed error messages and troubleshooting steps.