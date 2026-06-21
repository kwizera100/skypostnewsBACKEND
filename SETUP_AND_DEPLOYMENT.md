# 🚀 Sky Post News - Complete Setup & Deployment Guide

## 📋 Table of Contents

1. [Local Development Setup](#local-development-setup)
2. [Admin Login](#admin-login)
3. [Database Setup](#database-setup)
4. [Deployment to Vercel](#deployment-to-vercel)
5. [Server Deployment](#server-deployment)
6. [Troubleshooting](#troubleshooting)

---

## 🛠️ Local Development Setup

### Prerequisites

- Node.js 18+ installed
- PostgreSQL database
- Git

### Backend Setup

```bash
# Clone backend repository
git clone https://github.com/kwizera100/skypostnewsBACKEND.git
cd skypostnewsBACKEND

# Install dependencies
npm install

# Create .env file from example
cp .env.example .env

# Edit .env with your database credentials
nano .env
```

**Add to `.env`:**
```env
DATABASE_URL="postgresql://user:password@localhost:5432/skypostnews"
JWT_SECRET="your-very-long-random-secret-key-here"
FRONTEND_URL=http://localhost:5173
CORS_ORIGIN=http://localhost:5173
PORT=4000
NODE_ENV=development
```

**Generate JWT Secret:**
```bash
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
```

### Database Setup

```bash
# Run migrations
npm run db:migrate

# Seed database with demo data
npm run db:seed

# Create admin account
npm run admin:setup
```

### Start Backend Server

```bash
npm run dev
```

Backend will run at: `http://localhost:4000`

---

### Frontend Setup

```bash
# Clone frontend repository
git clone https://github.com/kwizera100/Skypostnewsfrontent.git
cd Skypostnewsfrontent

# Install dependencies
npm install

# Create .env.local
cat > .env.local << EOF
VITE_API_URL=http://localhost:4000
VITE_APP_ENV=development
EOF

# Start development server
npm run dev
```

Frontend will run at: `http://localhost:5173`

---

## 🔐 Admin Login

### Default Credentials

After running `npm run admin:setup`:

- **Email**: `admin@skypostnews.com`
- **Password**: `Admin@2024!Secure`

### Login Steps

1. Navigate to: `http://localhost:5173/admin`
2. Enter email and password
3. Click "Sign In"
4. Change password immediately in settings

### Forgot Password?

```bash
cd skypostnewsBACKEND
npm run admin:reset-password
```

New password: `Admin@2024!NewPassword`

---

## 🗄️ Database Setup

### Create PostgreSQL Database

```bash
# Using PostgreSQL CLI
createdb skypostnews

# Or using psql
psql
CREATE DATABASE skypostnews;
\q
```

### Connection String Format

```
postgresql://username:password@localhost:5432/skypostnews
```

### Database Commands

```bash
# View database schema
npm run db:studio

# Reset database (WARNING: deletes all data)
npm run db:migrate reset

# Create migration
npm run db:migrate -- --name migration_name

# View pending migrations
npm run db:migrate status
```

---

## 🌐 Deployment to Vercel

### Frontend Deployment

1. **Push to GitHub**
```bash
git add .
git commit -m "Deploy to Vercel"
git push origin main
```

2. **Connect to Vercel**
   - Go to [vercel.com](https://vercel.com)
   - Click "New Project"
   - Select `Skypostnewsfrontent` repository
   - Click "Import"

3. **Configure Environment Variables**
   - Set `VITE_API_URL` to your backend API URL
   - For production: `https://api.skypostnews.com`

4. **Deploy**
   - Click "Deploy"
   - Wait for build to complete
   - Frontend will be live at your Vercel domain

### Backend Deployment

1. **Push to GitHub**
```bash
git add .
git commit -m "Deploy to Vercel"
git push origin main
```

2. **Connect to Vercel**
   - Go to [vercel.com](https://vercel.com)
   - Click "New Project"
   - Select `skypostnewsBACKEND` repository
   - Click "Import"

3. **Configure Environment Variables**
   - `DATABASE_URL`: Your production PostgreSQL URL
   - `JWT_SECRET`: Your JWT secret key
   - `FRONTEND_URL`: Your frontend URL (https://skypostnews.com)
   - `CORS_ORIGIN`: Your frontend URL
   - `NODE_ENV`: production

4. **Deploy**
   - Click "Deploy"
   - Backend will be live at `https://api.skypostnews.com` (or your domain)

### Update Frontend API URL

After backend deployment, update frontend `.env.production`:

```
VITE_API_URL=https://api.skypostnews.com
```

Then redeploy frontend.

---

## 🖥️ Server Deployment (VPS/Dedicated)

### Using Your Server (93.127.186.217)

#### 1. SSH into Server

```bash
ssh root@93.127.186.217
# Password: MISSMICHOU783450859@kwizera
```

#### 2. Install Node.js & PostgreSQL

```bash
# Update system
apt update && apt upgrade -y

# Install Node.js
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
apt install -y nodejs

# Install PostgreSQL
apt install -y postgresql postgresql-contrib

# Install PM2 (process manager)
npm install -g pm2
```

#### 3. Setup Database

```bash
# Start PostgreSQL
systemctl start postgresql
systemctl enable postgresql

# Create database
sudo -u postgres psql
CREATE DATABASE skypostnews;
CREATE USER skypost WITH PASSWORD 'secure_password';
GRANT ALL PRIVILEGES ON DATABASE skypostnews TO skypost;
\q
```

#### 4. Deploy Backend

```bash
# Clone repository
git clone https://github.com/kwizera100/skypostnewsBACKEND.git
cd skypostnewsBACKEND

# Install dependencies
npm install
npm run build

# Create .env
cat > .env << EOF
DATABASE_URL="postgresql://skypost:secure_password@localhost:5432/skypostnews"
JWT_SECRET="your-random-secret-key"
FRONTEND_URL=https://skypostnews.com
CORS_ORIGIN=https://skypostnews.com
PORT=4000
NODE_ENV=production
EOF

# Setup database
npm run db:migrate
npm run admin:setup

# Start with PM2
pm2 start "npm start" --name "skypostnews-api"
pm2 save
pm2 startup
```

#### 5. Setup Nginx Reverse Proxy

```bash
# Install Nginx
apt install -y nginx

# Create config
cat > /etc/nginx/sites-available/skypostnews << 'EOF'
server {
    listen 80;
    server_name api.skypostnews.com;

    location / {
        proxy_pass http://localhost:4000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
EOF

# Enable site
ln -s /etc/nginx/sites-available/skypostnews /etc/nginx/sites-enabled/
rm /etc/nginx/sites-enabled/default

# Test configuration
nginx -t

# Start Nginx
systemctl start nginx
systemctl enable nginx
```

#### 6. Setup SSL (Let's Encrypt)

```bash
# Install Certbot
apt install -y certbot python3-certbot-nginx

# Get certificate
certbot certonly --nginx -d api.skypostnews.com -d skypostnews.com

# Update Nginx config to use HTTPS
certbot --nginx -d api.skypostnews.com -d skypostnews.com

# Enable auto-renewal
systemctl enable certbot.timer
```

#### 7. Deploy Frontend

```bash
# Install and build frontend
git clone https://github.com/kwizera100/Skypostnewsfrontent.git
cd Skypostnewsfrontent

# Set production environment
cat > .env.production << EOF
VITE_API_URL=https://api.skypostnews.com
VITE_APP_ENV=production
EOF

npm install
npm run build

# Setup Nginx for frontend
cat > /etc/nginx/sites-available/frontend << 'EOF'
server {
    listen 80;
    server_name skypostnews.com www.skypostnews.com;

    root /var/www/skypostnews;
    index index.html;

    location / {
        try_files $uri $uri/ /index.html;
    }

    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }
}
EOF

# Enable site
ln -s /etc/nginx/sites-available/frontend /etc/nginx/sites-enabled/

# Copy build files
mkdir -p /var/www/skypostnews
cp -r dist/* /var/www/skypostnews/

# Test and restart Nginx
nginx -t
systemctl restart nginx

# Get SSL certificate
certbot --nginx -d skypostnews.com -d www.skypostnews.com
```

---

## ❓ Troubleshooting

### Backend Issues

#### "Cannot connect to database"
```bash
# Check PostgreSQL status
systemctl status postgresql

# Check connection string in .env
cat .env | grep DATABASE_URL

# Test connection
psql "postgresql://user:password@localhost:5432/skypostnews"
```

#### "JWT_SECRET not configured"
```bash
# Generate new secret
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"

# Add to .env
echo 'JWT_SECRET="your-new-secret"' >> .env
```

#### "Cannot login with admin credentials"
```bash
# Reset admin account
npm run admin:setup
```

### Frontend Issues

#### "Network error / Cannot reach API"
```bash
# Check if backend is running
curl http://localhost:4000/api/health

# Verify VITE_API_URL in .env.local
cat .env.local

# Clear browser cache
# Press Ctrl+Shift+Delete to clear cache
```

#### "CORS errors"
```bash
# Check CORS_ORIGIN in backend .env
cat skypostnewsBACKEND/.env | grep CORS_ORIGIN

# Should match your frontend URL
```

### Server Issues

#### Check PM2 logs
```bash
pm2 logs
pm2 logs skypostnews-api
```

#### Restart services
```bash
pm2 restart skypostnews-api
systemctl restart nginx
systemctl restart postgresql
```

#### Check disk space
```bash
df -h
```

#### Check memory/CPU
```bash
htop
```

---

## 📝 Production Checklist

- [ ] Database is backed up
- [ ] SSL certificates installed (HTTPS)
- [ ] Environment variables secured
- [ ] Admin password changed
- [ ] Database password changed
- [ ] JWT_SECRET is strong and random
- [ ] CORS_ORIGIN set to frontend domain
- [ ] API rate limiting enabled
- [ ] Monitoring set up
- [ ] Backups automated

---

## 📞 Support

For issues or questions:
1. Check the troubleshooting section
2. Review GitHub repository issues
3. Contact the development team

---

## 🔗 Useful Links

- **Frontend Repo**: https://github.com/kwizera100/Skypostnewsfrontent
- **Backend Repo**: https://github.com/kwizera100/skypostnewsBACKEND
- **Production Frontend**: https://skypostnews.com
- **Production API**: https://api.skypostnews.com
- **Admin Dashboard**: https://skypostnews.com/admin
