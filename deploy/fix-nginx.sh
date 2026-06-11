#!/usr/bin/env bash
# Fix Nginx after Certbot mis-edited default.conf for api.skypostnews.com.
set -euo pipefail

echo "Backing up default.conf..."
cp /etc/nginx/sites-enabled/default.conf /etc/nginx/sites-enabled/default.conf.bak.$(date +%s)

echo "Restoring clean catch-all default.conf (removes Certbot's bad api block)..."
cat > /etc/nginx/sites-enabled/default.conf <<'EOF'
server {
  listen 80 default_server;
  listen [::]:80 default_server;
  listen 443 quic reuseport default_server;
  listen 443 default_server ssl;
  listen [::]:443 quic reuseport default_server;
  listen [::]:443 default_server ssl;
  ssl_reject_handshake on;
  server_name _;
  return 444;
}
EOF

echo "Writing proper api.skypostnews.com SSL vhost..."
cat > /etc/nginx/sites-available/skypostnews-api <<'EOF'
server {
    listen 80;
    listen [::]:80;
    server_name api.skypostnews.com;
    return 301 https://$host$request_uri;
}

server {
    listen 443 ssl;
    listen [::]:443 ssl;
    server_name api.skypostnews.com;

    ssl_certificate /etc/letsencrypt/live/api.skypostnews.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/api.skypostnews.com/privkey.pem;

    client_max_body_size 10M;

    location / {
        proxy_pass http://127.0.0.1:4000;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
EOF

ln -sf /etc/nginx/sites-available/skypostnews-api /etc/nginx/sites-enabled/skypostnews-api

echo "Testing nginx config..."
nginx -t

echo "Reloading nginx..."
systemctl reload nginx

echo "=== DONE. Testing HTTPS locally ==="
curl -sk https://api.skypostnews.com/api/health || true
echo ""
