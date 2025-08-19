# NGINX Production Config – HafiPortrait (Mode B: Socket.IO terpisah)

Salin konfigurasi ini ke: /etc/nginx/sites-available/hafiportrait
Lalu aktifkan dengan symlink ke sites-enabled dan reload NGINX (instruksi di bawah).

Catatan:
- Aplikasi Next.js berjalan di port 3000 (PM2: hafiportrait-app)
- Socket.IO berjalan terpisah di port 3001 (PM2: hafiportrait-socketio)
- Domain: hafiportrait.photography (include www)
- Pastikan DNS mengarah ke VPS, dan PM2 proses sudah jalan

## Opsi A (Direkomendasikan): HTTPS langsung di NGINX (Cloudflare SSL: Full/Strict)

```
server {
    listen 80;
    listen [::]:80;
    server_name hafiportrait.photography www.hafiportrait.photography;

    # Redirect HTTP -> HTTPS
    return 301 https://$host$request_uri;
}

server {
    listen 443 ssl http2;
    listen [::]:443 ssl http2;
    server_name hafiportrait.photography www.hafiportrait.photography;

    # Ganti path sertifikat sesuai lokasi sertifikat Anda (Let's Encrypt/certbot atau self-signed)
    ssl_certificate     /etc/letsencrypt/live/hafiportrait.photography/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/hafiportrait.photography/privkey.pem;

    # Security & TLS (opsional, minimal)
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_prefer_server_ciphers on;

    # Proxy ke Next.js (port 3000)
    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_read_timeout 60s;
    }

    # Socket.IO (port 3001 – proses terpisah)
    location /socket.io/ {
        proxy_pass http://localhost:3001;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_read_timeout 86400;
    }

    # (Opsional) Cache untuk static files agar lebih cepat
    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|webp|avif)$ {
        expires 7d;
        add_header Cache-Control "public, immutable";
        proxy_pass http://localhost:3000;
    }
}
```

## Opsi B: Di belakang Cloudflare (Flexible SSL) – hanya listen 80
Gunakan ini hanya jika Cloudflare memakai SSL Mode: Flexible (Cloudflare HTTPS -> Origin HTTP).

```
server {
    listen 80;
    listen [::]:80;
    server_name hafiportrait.photography www.hafiportrait.photography;

    # Proxy ke Next.js (port 3000)
    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_read_timeout 60s;
    }

    # Socket.IO (port 3001 – proses terpisah)
    location /socket.io/ {
        proxy_pass http://localhost:3001;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_read_timeout 86400;
    }

    # (Opsional) Cache untuk static files agar lebih cepat
    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|webp|avif)$ {
        expires 7d;
        add_header Cache-Control "public, immutable";
        proxy_pass http://localhost:3000;
    }
}
```

## Aktivasi & Reload

```
sudo nano /etc/nginx/sites-available/hafiportrait
# paste salah satu opsi (A lebih direkomendasikan) dan simpan

sudo ln -s /etc/nginx/sites-available/hafiportrait /etc/nginx/sites-enabled/
sudo rm -f /etc/nginx/sites-enabled/default

sudo nginx -t
sudo systemctl reload nginx
```

## Firewall
```
sudo ufw allow 80
sudo ufw allow 443
sudo ufw --force enable
```

## Verifikasi
- App: curl -I https://hafiportrait.photography
- API: curl -I https://hafiportrait.photography/api/test-simple
- Socket.IO handshake: curl -I "https://hafiportrait.photography/socket.io/?EIO=4&transport=polling"
- Local health (di VPS):
  - curl -I http://localhost:3000
  - curl -I http://localhost:3001/health

Catatan tambahan:
- Pastikan PM2 proses aktif: pm2 status
- Jika menggunakan Cloudflare, set SSL Mode ke Full/Strict bila Anda sudah mengaktifkan sertifikat valid di origin (LE/certbot). Jika tidak punya sertifikat origin, gunakan Opsi B & SSL Mode Flexible.
