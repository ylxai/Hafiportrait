# 🚀 CircleCI Environment Variables Setup - HafiPortrait

## 🎯 **OVERVIEW**
Setup environment variables di CircleCI untuk automated deployment yang aman.

## 🔑 **REQUIRED ENVIRONMENT VARIABLES**

### **1. Docker Hub Credentials**
```bash
DOCKER_USER=your_dockerhub_username
DOCKER_PASS=your_dockerhub_password
```

### **2. Server Access**
```bash
SERVER_HOST=147.251.255.227
SERVER_USER=ubuntu
SSH_PRIVATE_KEY=-----BEGIN OPENSSH PRIVATE KEY-----
...your private key content...
-----END OPENSSH PRIVATE KEY-----
```

### **3. Application Environment**
```bash
NODE_ENV=production
NEXT_PUBLIC_APP_URL=https://hafiportrait.photography
```

### **4. Database (Supabase)**
```bash
NEXT_PUBLIC_SUPABASE_URL=https://azspktldiblhrwebzmwq.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImF6c3BrdGxkaWJsaHJ3ZWJ6bXdxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTM5NDQwNDQsImV4cCI6MjA2OTUyMDA0NH0.uKHB4K9hxUDTc0ZkwidCJv_Ev-oa99AflFvrFt_8MG8
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImF6c3BrdGxkaWJsaHJ3ZWJ6bXdxIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1Mzk0NDA0NCwiZXhwIjoyMDY5NTIwMDQ0fQ.hk8vOgFoW3PJZxhw40sHiNyvNxbD4_c4x6fqBynvlmE
```

### **5. Storage (Cloudflare R2)**
```bash
CLOUDFLARE_R2_ACCOUNT_ID=b14090010faed475102a62eca152b67f
CLOUDFLARE_R2_ACCESS_KEY_ID=51c66dbac26827b84132186428eb3492
CLOUDFLARE_R2_SECRET_ACCESS_KEY=65fe1143600bd9ef97a5c76b4ae924259779e0d0815ce44f09a1844df37fe3f1
CLOUDFLARE_R2_BUCKET_NAME=hafiportrait-photos
CLOUDFLARE_R2_PUBLIC_URL=https://photos.hafiportrait.photography
```

### **6. Authentication**
```bash
JWT_SECRET=hafiportrait-production-secure-2025
```

### **7. Notifications (Optional)**
```bash
SLACK_WEBHOOK_URL=https://hooks.slack.com/services/YOUR/SLACK/WEBHOOK
DISCORD_WEBHOOK_URL=https://discord.com/api/webhooks/YOUR/WEBHOOK
```

## 🛠️ **SETUP STEPS**

### **Step 1: Access CircleCI Project Settings**
1. Go to https://app.circleci.com/
2. Select your HafiPortrait project
3. Click **Project Settings**
4. Navigate to **Environment Variables**

### **Step 2: Add Environment Variables**
Copy-paste each variable from the list above:

```bash
# Example:
Name: DOCKER_USER
Value: your_dockerhub_username

Name: SERVER_HOST  
Value: 147.251.255.227

Name: SSH_PRIVATE_KEY
Value: -----BEGIN OPENSSH PRIVATE KEY-----
...paste your private key...
-----END OPENSSH PRIVATE KEY-----
```

### **Step 3: Generate SSH Key (if needed)**
```bash
# On your local machine:
ssh-keygen -t rsa -b 4096 -C "circleci@hafiportrait"

# Copy public key to server:
ssh-copy-id ubuntu@147.251.255.227

# Copy private key content for CircleCI:
cat ~/.ssh/id_rsa
```

### **Step 4: Test Connection**
```bash
# Push to trigger CircleCI build:
git add .
git commit -m "test: CircleCI setup"
git push origin main
```

## 🔍 **VERIFICATION**

### **Check CircleCI Build:**
1. Go to CircleCI dashboard
2. Watch build progress
3. Check for successful deployment

### **Test Production:**
```bash
# Test website
curl -I https://hafiportrait.photography

# Test API
curl -I https://hafiportrait.photography/api/health

# Test admin
curl -I https://hafiportrait.photography/admin
```

## 🚨 **SECURITY NOTES**

### **Sensitive Variables:**
- ✅ All secrets stored in CircleCI (encrypted)
- ✅ No secrets in code repository
- ✅ SSH key access only for deployment
- ✅ Database credentials secured

### **Access Control:**
- ✅ Only authorized team members can access CircleCI
- ✅ SSH access limited to deployment user
- ✅ Production environment isolated

## 🔄 **CI/CD WORKFLOW**

### **Automated Process:**
```bash
1. Developer pushes code → GitHub
2. CircleCI detects push → Triggers build
3. Run tests → ESLint, Build validation
4. Build Docker images → Multi-stage build
5. Deploy to production → SSH deployment
6. Health check → Verify deployment
7. Notifications → Slack/Discord alerts
```

### **Protection Mechanism:**
```bash
✅ Tests PASS → Deploy to production
❌ Tests FAIL → STOP (production safe)
❌ Build FAIL → STOP (production safe)  
❌ Deploy FAIL → Rollback automatically
```

## 📋 **TROUBLESHOOTING**

### **Common Issues:**

#### **SSH Connection Failed:**
```bash
# Check SSH key format in CircleCI
# Ensure no extra spaces/newlines
# Verify public key on server: ~/.ssh/authorized_keys
```

#### **Docker Build Failed:**
```bash
# Check Docker Hub credentials
# Verify DOCKER_USER and DOCKER_PASS
# Check Docker Hub repository exists
```

#### **Environment Variables Missing:**
```bash
# Verify all required variables set in CircleCI
# Check variable names (case sensitive)
# Ensure no typos in variable values
```

## 🎯 **NEXT STEPS**

After setup complete:
1. ✅ Test automated deployment
2. ✅ Monitor build performance  
3. ✅ Setup notifications
4. ✅ Document deployment process
5. ✅ Train team on CI/CD workflow

---

**🔒 SECURITY:** Never commit sensitive environment variables to code repository. Always use CircleCI environment variables for production secrets.

**📞 SUPPORT:** Check CircleCI build logs for detailed error messages and troubleshooting information.