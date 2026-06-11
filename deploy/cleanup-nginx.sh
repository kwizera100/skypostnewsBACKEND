#!/usr/bin/env bash
# Remove manual/Certbot leftovers for api.skypostnews.com so CloudPanel can manage it cleanly.
set -euo pipefail

echo "Removing manual skypostnews-api vhost + symlink..."
rm -f /etc/nginx/sites-enabled/skypostnews-api
rm -f /etc/nginx/sites-available/skypostnews-api

echo "Restoring clean catch-all default.conf (removing Certbot's api.skypostnews.com block)..."
cp /etc/nginx/sites-enabled/default.conf /etc/nginx/sites-enabled/default.conf.bak.$(date +%s)
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

echo "Removing Certbot cert for api.skypostnews.com (CloudPanel will issue its own)..."
certbot delete --cert-name api.skypostnews.com --non-interactive 2>/dev/null || true

echo "Testing + reloading nginx..."
nginx -t
systemctl reload nginx
echo "=== CLEANUP DONE — ready for CloudPanel ==="
