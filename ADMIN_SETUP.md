# Admin Setup Guide

## Initial Setup

### 1. Create Admin Account

Run the admin setup script:

```bash
npm run admin:setup
```

This creates an admin account with:
- **Email**: `admin@skypostnews.com`
- **Password**: `Admin@2024!Secure`

### 2. First Login

1. Navigate to `https://skypostnews.com/admin`
2. Enter the credentials above
3. Click "Sign In"

### 3. Change Password

Immediately after first login:
1. Go to Admin Dashboard
2. Click your profile (top-right)
3. Change password to a secure one

---

## Troubleshooting

### Can't Login?

**Problem**: "Invalid email or password"

**Solutions**:
1. Verify database is running
2. Check `JWT_SECRET` is set in `.env`
3. Run setup again: `npm run admin:setup`
4. Check database connection in `.env`

### Forgot Password?

Reset it with:

```bash
npm run admin:reset-password
```

### Admin Account Doesn't Exist?

Create it:

```bash
npm run admin:setup
```

---

## Environment Variables

Ensure these are set in `.env`:

```env
DATABASE_URL=postgresql://user:password@host:5432/database
JWT_SECRET=your_very_long_random_secret_key
FRONTEND_URL=https://skypostnews.com
CORS_ORIGIN=https://skypostnews.com
```

---

## NPM Scripts

```bash
# Setup admin account
npm run admin:setup

# Reset admin password
npm run admin:reset-password

# Seed database with demo data
npm run db:seed

# Run migrations
npm run db:migrate

# Start development server
npm run dev

# Build for production
npm run build
```
