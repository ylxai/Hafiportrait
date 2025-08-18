# 🧪 Simple Test Guide - HafiPortrait Monitoring

**Panduan sederhana untuk test sistem monitoring (tanpa ribet!)**

---

## 🚀 **3 CARA TEST (PILIH SALAH SATU)**

### **1. Quick Test (2 menit) - RECOMMENDED** ⚡
```bash
# Test cepat tanpa start server
chmod +x scripts/quick-test.sh
./scripts/quick-test.sh
```

### **2. Full Test (5-10 menit)** 🎯
```bash
# Test lengkap dengan start server
chmod +x scripts/test-all.sh
./scripts/test-all.sh
```

### **3. Manual Test** 🎮
```bash
# Start server manual
pnpm dev

# Buka browser: http://localhost:3000/admin
# Klik: System & Monitoring
```

---

## 🧹 **KALAU ADA MASALAH**

### **Cleanup semua proses:**
```bash
chmod +x scripts/cleanup.sh
./scripts/cleanup.sh
```

### **Kalau stuck di "Starting Services":**
```bash
# 1. Stop semua
./scripts/cleanup.sh

# 2. Coba quick test dulu
./scripts/quick-test.sh

# 3. Kalau quick test PASS, baru coba full test
./scripts/test-all.sh
```

---

## 📊 **HASIL YANG DIHARAPKAN**

### **Quick Test:**
```
🎉 QUICK TEST PASSED!
Basic monitoring system is ready
Success Rate: 100%
```

### **Full Test:**
```
🎉 OVERALL RESULT: PASSED
System is ready for production!
Success Rate: ≥ 80%
```

---

## 🎯 **KALAU TEST PASS**

**Sistem monitoring Anda SIAP!**
- Buka: `http://localhost:3000/admin`
- Klik: "System & Monitoring"
- Test: Real-time Monitor, Alert Dashboard

---

## ❌ **KALAU TEST FAIL**

**Kasih tau saya error messagenya, saya bantu fix!**

Common fixes:
```bash
# Install dependencies
pnpm install

# Check Node.js version
node --version  # Harus 18+

# Clean dan coba lagi
./scripts/cleanup.sh
./scripts/quick-test.sh
```

---

## 🎉 **KESIMPULAN**

**Yang penting:**
- ✅ Sistem monitoring sudah jadi
- ✅ Tinggal test aja
- ✅ Kalau bingung, tanya saya

**Start dengan:**
```bash
./scripts/quick-test.sh
```

**Simple kan?** 😊