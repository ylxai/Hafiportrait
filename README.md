# 📸 HafiPortrait Photography

> **Professional Photography Management System with Real-time Features**

[![Next.js](https://img.shields.io/badge/Next.js-15.4.6-black?style=for-the-badge&logo=next.js)](https://nextjs.org/)
[![React](https://img.shields.io/badge/React-19.1.1-blue?style=for-the-badge&logo=react)](https://reactjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.9.2-blue?style=for-the-badge&logo=typescript)](https://www.typescriptlang.org/)
[![Socket.IO](https://img.shields.io/badge/Socket.IO-4.8.1-green?style=for-the-badge&logo=socket.io)](https://socket.io/)
[![Docker](https://img.shields.io/badge/Docker-Ready-blue?style=for-the-badge&logo=docker)](https://www.docker.com/)

## ✨ Features

### 🎯 **Core Features**
- **📱 Responsive Design** - Mobile-first approach with touch-friendly interface
- **🔐 Admin Dashboard** - Complete event and photo management system
- **📸 Photo Gallery** - Interactive lightbox with optimized loading
- **💬 Real-time Messaging** - Live guestbook with reactions and hearts
- **🔄 Live Updates** - Real-time notifications via Socket.IO
- **📊 Analytics** - Comprehensive stats and performance monitoring

### 🚀 **Advanced Features**
- **☁️ Multi-tier Storage** - Cloudflare R2, Google Drive, Local storage
- **🤖 DSLR Integration** - Automated photo upload from camera
- **🎨 Dynamic Themes** - Multiple color palettes
- **📱 PWA Support** - Progressive Web App capabilities
- **🔍 QR Code Generation** - Easy event sharing
- **💾 Smart Backup** - Automated backup system

### 🛠️ **Technical Features**
- **⚡ Performance Optimized** - Code splitting, lazy loading, image optimization
- **🔒 Security First** - JWT authentication, CORS protection, input validation
- **📈 Scalable Architecture** - Microservices ready, Docker containerized
- **🔧 Developer Experience** - TypeScript, ESLint, Hot reload

## 🏗️ Architecture

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Frontend      │    │   Backend API   │    │   Socket.IO     │
│   Next.js 15    │◄──►│   Route Handlers│◄──►│   Real-time     │
│   React 19      │    │   Supabase DB   │    │   Port 3001     │
│   Port 3000     │    │   Multi Storage │    │   PM2 Managed   │
└─────────────────┘    └─────────────────┘    └─────────────────┘
         │                       │                       │
         └───────────────────────┼───────────────────────┘
                                 │
                    ┌─────────────────┐
                    │   DSLR System   │
                    │   Auto Upload   │
                    │   Watermarking  │
                    └─────────────────┘
```

## 🚀 Quick Start

### 📋 Prerequisites

- **Node.js** 22.x or higher
- **pnpm** package manager
- **Docker** (optional)
- **Supabase** account
- **Cloudflare R2** (optional)

### 🔧 Installation

1. **Clone the repository**
   ```bash
   git clone https://gitlab.com/your-username/hafiportrait.git
   cd hafiportrait
   ```

2. **Install dependencies**
   ```bash
   pnpm install
   ```

3. **Environment setup**
   ```bash
   cp .env.example .env.local
   # Edit .env.local with your configuration
   ```

4. **Start development server**
   ```bash
   pnpm run dev
   ```

5. **Start Socket.IO server**
   ```bash
   pnpm run socketio:start
   ```

Visit [http://localhost:3000](http://localhost:3000) to see the application.

## 🐳 Docker Deployment

### **Quick Start with Docker Compose**

```bash
# Build and start all services
docker-compose up -d

# View logs
docker-compose logs -f

# Stop services
docker-compose down
```

### **Manual Docker Build**

```bash
# Build the image
docker build -t hafiportrait .

# Run the container
docker run -p 3000:3000 --env-file .env.local hafiportrait
```

### **Multi-Stage Build Benefits**
- ✅ **Optimized size** - Production image ~200MB
- ✅ **Security** - Non-root user, minimal attack surface
- ✅ **Reliability** - Health checks, graceful fallbacks
- ✅ **Performance** - Production optimizations

## 📁 Project Structure

```
hafiportrait/
├── 📁 src/
│   ├── 📁 app/                 # Next.js App Router
│   │   ├── 📁 api/            # API Routes
│   │   ├── 📁 admin/          # Admin Dashboard
│   │   └── 📁 event/          # Event Pages
│   ├── 📁 components/         # React Components
│   │   ├── 📁 ui/             # UI Components
│   │   ├── 📁 admin/          # Admin Components
│   │   └── 📁 event/          # Event Components
│   ├── 📁 lib/                # Utilities & Services
│   ├── 📁 hooks/              # Custom React Hooks
│   └── 📁 types/              # TypeScript Types
├── 📁 DSLR-System/            # Camera Integration
├── 📁 scripts/                # Automation Scripts
├── 📁 public/                 # Static Assets
├── 🐳 Dockerfile              # Multi-stage Docker build
├── 🐳 docker-compose.yml      # Container orchestration
├── ⚙️ ecosystem.config.js     # PM2 Configuration
└── 📋 HAFIPORTRAIT_SYSTEM_STATUS.md
```

## 🔧 Available Scripts

### **Development**
```bash
pnpm run dev              # Start development server
pnpm run dev:socketio     # Start with Socket.IO
pnpm run lint             # Run ESLint
```

### **Production**
```bash
pnpm run build            # Build for production
pnpm run start            # Start production server
pnpm run pm2:start        # Start with PM2
```

### **Environment Management**
```bash
pnpm run env:dev          # Setup development environment
pnpm run env:prod         # Setup production environment
pnpm run env:status       # Check environment status
```

### **Docker**
```bash
docker-compose up -d      # Start all services
docker-compose logs -f    # View logs
docker-compose down       # Stop services
```

## 🌐 Environment Variables

Create `.env.local` file with the following variables:

```env
# Database
DATABASE_URL="your-supabase-url"
SUPABASE_ANON_KEY="your-supabase-anon-key"

# Authentication
JWT_SECRET="your-jwt-secret"
ADMIN_PASSWORD="your-admin-password"

# Storage (Optional)
CLOUDFLARE_R2_ACCESS_KEY="your-r2-access-key"
CLOUDFLARE_R2_SECRET_KEY="your-r2-secret-key"
CLOUDFLARE_R2_BUCKET="your-bucket-name"

# Google Drive (Optional)
GOOGLE_DRIVE_CLIENT_ID="your-client-id"
GOOGLE_DRIVE_CLIENT_SECRET="your-client-secret"
GOOGLE_DRIVE_REFRESH_TOKEN="your-refresh-token"

# Socket.IO
NEXT_PUBLIC_SOCKETIO_URL="http://localhost:3001"
```

## 📊 Performance Optimizations

### **Build Optimizations**
- ✅ **Code Splitting** - Dynamic imports for admin dashboard
- ✅ **Tree Shaking** - Remove unused code
- ✅ **Image Optimization** - WebP conversion, lazy loading
- ✅ **Bundle Analysis** - Webpack bundle analyzer

### **Runtime Optimizations**
- ✅ **Caching Strategy** - Smart caching for API responses
- ✅ **Database Indexing** - Optimized queries
- ✅ **CDN Integration** - Static asset delivery
- ✅ **Compression** - Gzip/Brotli compression

### **Current Metrics**
- 📦 **Build Size**: 568MB (34% reduction from 865MB)
- 💾 **Memory Usage**: ~150MB production
- ⚡ **Load Time**: <2s first load
- 🔄 **PM2 Stability**: 99.9% uptime

## 🛡️ Security Features

- 🔐 **JWT Authentication** - Secure admin access
- 🛡️ **CORS Protection** - Configured origins
- 🔒 **Input Validation** - Sanitized user inputs
- 👤 **Non-root Docker** - Security best practices
- 🔍 **Health Checks** - Automated monitoring

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- **Next.js Team** - Amazing React framework
- **Socket.IO** - Real-time communication
- **Supabase** - Backend as a Service
- **Radix UI** - Accessible UI components
- **Tailwind CSS** - Utility-first CSS framework

---

<div align="center">

**Built with ❤️ for Professional Photography**

[🌐 Live Demo](https://hafiportrait.photography) • [📧 Contact](mailto:contact@hafiportrait.photography) • [📱 Mobile App](https://hafiportrait.photography)

</div>