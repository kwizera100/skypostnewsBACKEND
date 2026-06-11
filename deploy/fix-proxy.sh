#!/usr/bin/env bash
# Point ONLY the skypostnews vhost proxy to the backend on port 5055.
# Does not touch any other project.
set -euo pipefail

F=$(readlink -f /etc/nginx/sites-enabled/api.skypostnews.com.conf)
echo "Editing ONLY: $F"
cp "$F" "$F.bak.$(date +%s)"

sed -i 's/127.0.0.1:8000/127.0.0.1:5055/g' "$F"

echo "--- proxy_pass now ---"
grep -n 'proxy_pass' "$F"

nginx -t 2>&1 | grep -E 'successful|emerg' || true
systemctl reload nginx

echo "=== HTTPS test ==="
curl -s https://api.skypostnews.com/api/health
echo ""
