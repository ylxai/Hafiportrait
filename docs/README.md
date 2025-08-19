# 📚 HafiPortrait Documentation

## 📋 **DOCUMENTATION INDEX**

### **🚀 Setup & Deployment**
- [`QUICK_START_GUIDE.md`](./QUICK_START_GUIDE.md) - Quick start untuk development
- [`DOCKER_GUIDE.md`](./DOCKER_GUIDE.md) - Docker setup dan management
- [`PRODUCTION_DEPLOYMENT_CHECKLIST.md`](./PRODUCTION_DEPLOYMENT_CHECKLIST.md) - Production deployment checklist
- [`PRODUCTION_TO_DOCKER_CHECKLIST.md`](./PRODUCTION_TO_DOCKER_CHECKLIST.md) - Migration dari PM2 ke Docker

### **🔄 CI/CD & Automation**
- [`CIRCLECI_SETUP.md`](./CIRCLECI_SETUP.md) - CircleCI environment variables setup
- [`CI_CD_SETUP_GUIDE.md`](./CI_CD_SETUP_GUIDE.md) - Complete CI/CD pipeline setup

## 🎯 **QUICK ACCESS**

### **Development Workflow:**
```bash
# 1. Start development
sudo docker-compose up -d hafiportrait-dev
# Access: http://147.251.255.227:3002

# 2. Make changes & test
# Hot reload automatically

# 3. Push to production
git add .
git commit -m "feat: new feature"
git push origin main
# CircleCI auto-deploys if tests pass
```

### **Production Management:**
```bash
# Start production
sudo docker-compose up -d hafiportrait-prod socketio-prod

# Check status
sudo docker ps | grep hafiportrait

# View logs
sudo docker logs hafiportrait-prod -f
```

## 🛡️ **Security & Best Practices**

### **Environment Files:**
- ✅ `.env.dev.public` - Development (port 3002)
- ✅ `.env.production` - Production (port 3000)
- ❌ Never commit `.env*` files to repository

### **Docker Security:**
- ✅ Optimized `.dockerignore` excludes sensitive files
- ✅ Documentation excluded from production builds
- ✅ Environment variables secured in CircleCI

## 📞 **Support**

For issues or questions:
1. Check relevant documentation above
2. Review Docker logs: `sudo docker logs [container-name]`
3. Check CircleCI build status
4. Verify environment variables

---

**🎯 CURRENT STATUS:** Repository cleaned, documentation organized, Docker optimized for production deployment.