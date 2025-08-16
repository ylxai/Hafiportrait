# 🌐 HafiPortrait Web Dashboard - Vercel Deployment

## 🚀 Quick Deploy to Vercel:

### 1. **Connect Repository:**
```bash
# Push to GitHub first
git add .
git commit -m "Prepare Vercel deployment"
git push origin main
```

### 2. **Deploy to Vercel:**
1. Go to [Vercel Dashboard](https://vercel.com/dashboard)
2. Click "New Project"
3. Import your GitHub repository
4. Framework: **Next.js** (auto-detected)
5. Click "Deploy"

### 3. **Set Environment Variables:**
In Vercel Dashboard → Project → Settings → Environment Variables:
```
NEXT_PUBLIC_SUPABASE_URL = your-supabase-url
NEXT_PUBLIC_SUPABASE_ANON_KEY = your-supabase-anon-key
SUPABASE_SERVICE_ROLE_KEY = your-supabase-service-role-key
JWT_SECRET = your-jwt-secret
NEXT_PUBLIC_APP_URL = https://your-domain.vercel.app
```

### 4. **Custom Domain (Optional):**
1. Vercel Dashboard → Project → Settings → Domains
2. Add: `hafiportrait.photography`
3. Configure DNS records as instructed

## 📊 **What's Included:**
- ✅ Next.js web application
- ✅ Admin dashboard
- ✅ API endpoints
- ✅ Real-time photo gallery
- ✅ Event management
- ✅ QR code generation
- ✅ Mobile-optimized UI

## 🔗 **Integration:**
- **Database**: Supabase (shared with local DSLR service)
- **Storage**: Cloudflare R2 + Google Drive (managed by local service)
- **Real-time**: WebSocket updates from local uploads

## 🎯 **Access:**
- **Public Gallery**: `https://your-domain.vercel.app/event/[event-id]`
- **Admin Dashboard**: `https://your-domain.vercel.app/admin`
- **API**: `https://your-domain.vercel.app/api/*`
