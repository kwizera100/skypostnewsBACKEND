#!/usr/bin/env bash
# Sky Post News — backend deploy script (run on the server as root).
# Idempotent: safe to re-run.
set -euo pipefail

APP_DIR=/var/www/skypostnews-backend
DB_NAME=skypost_db
DB_USER=skypost_user
DB_PASS="${SKYPOST_DB_PASS:?Set SKYPOST_DB_PASS}"
API_DOMAIN=api.skypostnews.com
FRONTEND_ORIGIN="https://www.skypostnews.com"
PORT=4000

echo "=== 1/7 Ensuring Postgres role + database (skypostnews only) ==="
sudo -u postgres psql -tAc "SELECT 1 FROM pg_roles WHERE rolname='${DB_USER}'" | grep -q 1 \
  || sudo -u postgres psql -c "CREATE ROLE ${DB_USER} LOGIN PASSWORD '${DB_PASS}';"
sudo -u postgres psql -c "ALTER ROLE ${DB_USER} WITH PASSWORD '${DB_PASS}';"
sudo -u postgres psql -tAc "SELECT 1 FROM pg_database WHERE datname='${DB_NAME}'" | grep -q 1 \
  || sudo -u postgres createdb -O ${DB_USER} ${DB_NAME}
sudo -u postgres psql -c "GRANT ALL PRIVILEGES ON DATABASE ${DB_NAME} TO ${DB_USER};"
# Schema-level grants (Postgres 15+ requires explicit public schema grant)
sudo -u postgres psql -d ${DB_NAME} -c "GRANT ALL ON SCHEMA public TO ${DB_USER};"

echo "=== 2/7 Writing .env ==="
cat > "${APP_DIR}/.env" <<EOF
DATABASE_URL="postgresql://${DB_USER}:${DB_PASS}@localhost:5432/${DB_NAME}?schema=public"
JWT_SECRET="$(openssl rand -hex 32)"
PORT=${PORT}
NODE_ENV=production
CORS_ORIGIN=${FRONTEND_ORIGIN}
EOF
# Preserve JWT_SECRET across re-runs if one already exists
if [ -f "${APP_DIR}/.env.jwt" ]; then
  EXISTING_JWT=$(cat "${APP_DIR}/.env.jwt")
  sed -i "s|^JWT_SECRET=.*|JWT_SECRET=\"${EXISTING_JWT}\"|" "${APP_DIR}/.env"
else
  grep '^JWT_SECRET=' "${APP_DIR}/.env" | sed 's/^JWT_SECRET="\(.*\)"$/\1/' > "${APP_DIR}/.env.jwt"
fi

echo "=== 3/7 Installing dependencies ==="
cd "${APP_DIR}"
npm install --no-audit --no-fund

echo "=== 4/7 Prisma generate + db push ==="
npx prisma generate
npx prisma db push --accept-data-loss

echo "=== 5/7 Importing data (only if articles table empty) ==="
ART_COUNT=$(sudo -u postgres psql -tAc "SELECT COUNT(*) FROM articles;" -d ${DB_NAME} 2>/dev/null || echo 0)
if [ "${ART_COUNT}" = "0" ]; then
  node scripts/import-postgres.cjs
else
  echo "articles table already has ${ART_COUNT} rows — skipping import"
fi

echo "=== 6/7 Build + PM2 ==="
npm run build
pm2 delete skypost-api 2>/dev/null || true
pm2 start dist/index.js --name skypost-api
pm2 save

echo "=== 7/7 Nginx reverse proxy (HTTP) ==="
cat > /etc/nginx/sites-available/skypostnews-api <<EOF
server {
    listen 80;
    server_name ${API_DOMAIN};

    client_max_body_size 10M;

    location / {
        proxy_pass http://127.0.0.1:${PORT};
        proxy_http_version 1.1;
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
    }
}
EOF
ln -sf /etc/nginx/sites-available/skypostnews-api /etc/nginx/sites-enabled/skypostnews-api
nginx -t
systemctl reload nginx

echo "=== DONE. API should respond at http://127.0.0.1:${PORT}/api/health ==="
curl -s http://127.0.0.1:${PORT}/api/health || true
echo ""
