# 🚀 CircleCI Quick Setup - Copy Paste Ready

## 📋 **STEP 1: ACCESS CIRCLECI**
```
1. Go to: https://app.circleci.com/
2. Login with GitHub account
3. Find project: ylxai/hafiportrait
4. Click "Set Up Project"
5. Choose "Use existing config"
```

## 🔑 **STEP 2: ENVIRONMENT VARIABLES (COPY-PASTE)**

### **Docker Hub Credentials:**
```
DOCKER_USER
ylxai

DOCKER_PASS
[YOUR_DOCKER_TOKEN_HERE]
```

### **Server Access:**
```
SERVER_HOST
147.251.255.227

SERVER_USER
ubuntu

SSH_PRIVATE_KEY
[COPY YOUR SSH PRIVATE KEY FROM: cat ~/.ssh/id_rsa]
```

### **Application Environment:**
```
NODE_ENV
production

NEXT_PUBLIC_APP_URL
https://hafiportrait.photography

JWT_SECRET
hafiportrait-production-secure-2025
```

### **Database (Supabase):**
```
NEXT_PUBLIC_SUPABASE_URL
https://azspktldiblhrwebzmwq.supabase.co

NEXT_PUBLIC_SUPABASE_ANON_KEY
[YOUR_SUPABASE_ANON_KEY]

SUPABASE_SERVICE_ROLE_KEY
[YOUR_SUPABASE_SERVICE_ROLE_KEY]
```

### **Storage (Cloudflare R2):**
```
CLOUDFLARE_R2_ACCOUNT_ID
b14090010faed475102a62eca152b67f

CLOUDFLARE_R2_ACCESS_KEY_ID
[YOUR_CLOUDFLARE_R2_ACCESS_KEY]

CLOUDFLARE_R2_SECRET_ACCESS_KEY
[YOUR_CLOUDFLARE_R2_SECRET_KEY]

CLOUDFLARE_R2_BUCKET_NAME
hafiportrait-photos

CLOUDFLARE_R2_PUBLIC_URL
https://photos.hafiportrait.photography
```

## 🧪 **STEP 3: TEST DEPLOYMENT**
```bash
git add .
git commit -m "test: CircleCI environment setup"
git push origin main
```

## ✅ **SUCCESS INDICATORS**
- ✅ CircleCI build starts automatically
- ✅ Docker build succeeds  
- ✅ Deployment successful
- ✅ Website: https://hafiportrait.photography

**🎯 TOTAL: 12 environment variables siap copy-paste**