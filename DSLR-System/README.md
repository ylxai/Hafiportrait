# 🚀 DSLR Auto Upload System

## 📁 Folder Structure:
- **Core/**: File utama sistem
- **Config/**: Konfigurasi dan credentials
- **Storage/**: Management storage
- **Testing/**: Tools untuk testing
- **Backup/**: Local backup photos
- **Logs/**: Log files

## 🚀 Quick Start:
1. Run `./start-system.sh` untuk start sistem
2. Run `./manage-events.sh` untuk kelola event
3. Run `./check-storage.sh` untuk monitor storage
4. Run `./test-system.sh` untuk test sistem

## 💾 Storage Capacity:
- Cloudflare R2: 10GB
- Google Drive: 2TB+
- Local Backup: 50GB+
- **TOTAL: 2.1TB+ storage!**

## 📋 Core Commands:
```bash
# Event Management
cd Core && node dslr-hybrid-cli.js list
cd Core && node dslr-hybrid-cli.js quick "Event Name" 2025-01-15

# Storage Management
cd Storage && node storage-optimization-cli.js test
cd Storage && node storage-optimization-cli.js status

# System Testing
cd Testing && node test-cloudflare-r2-connection.js
cd Testing && node debug-tier-selection.js
```

## 🎯 Production Workflow:
1. Create event: `node dslr-hybrid-cli.js quick "Wedding Name" 2025-01-15`
2. Start system: `./start-system.sh`
3. Connect DSLR camera
4. Photos auto-upload to cloud storage
5. Monitor: `./check-storage.sh`
