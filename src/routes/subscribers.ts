import { Router, Request, Response } from 'express';
import { body, validationResult } from 'express-validator';
import { prisma } from '../lib/prisma';

const router = Router();

// POST /api/subscribers/subscribe — email-only signup
router.post(
  '/subscribe',
  [
    body('email').isEmail().normalizeEmail().withMessage('Valid email required'),
  ],
  async (req: Request, res: Response): Promise<void> => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      res.status(400).json({ errors: errors.array() });
      return;
    }

    const { email, language } = req.body as { email: string; language?: string };
    const lang = language && ['en', 'fr', 'rw'].includes(language) ? language : 'en';

    try {
      const existing = await prisma.subscriber.findUnique({ where: { email } });
      if (existing) {
        if (!existing.active) {
          await prisma.subscriber.update({ where: { id: existing.id }, data: { active: true, language: lang } });
        }
        res.json({ success: true, message: 'Already subscribed' });
        return;
      }

      await prisma.subscriber.create({ data: { email, language: lang } });
      res.status(201).json({ success: true, message: 'Subscribed successfully' });
    } catch {
      res.status(500).json({ error: 'Internal server error' });
    }
  }
);

// POST /api/subscribers/google — Google signup for subscribers
router.post(
  '/google',
  [
    body('email').isEmail().normalizeEmail().withMessage('Valid email required'),
    body('googleId').notEmpty().withMessage('Google ID required'),
    body('name').optional().trim(),
  ],
  async (req: Request, res: Response): Promise<void> => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      res.status(400).json({ errors: errors.array() });
      return;
    }

    const { email, googleId, name, language } = req.body as { email: string; googleId: string; name?: string; language?: string };
    const lang = language && ['en', 'fr', 'rw'].includes(language) ? language : 'en';

    try {
      const existing = await prisma.subscriber.findUnique({ where: { email } });
      if (existing) {
        if (!existing.active) {
          await prisma.subscriber.update({
            where: { id: existing.id },
            data: { active: true, language: lang, googleId, name: name || existing.name },
          });
        }
        res.json({ success: true, message: 'Already subscribed' });
        return;
      }

      await prisma.subscriber.create({ data: { email, googleId, name, language: lang } });
      res.status(201).json({ success: true, message: 'Subscribed successfully' });
    } catch {
      res.status(500).json({ error: 'Internal server error' });
    }
  }
);

// POST /api/subscribers/unsubscribe
router.post(
  '/unsubscribe',
  [body('email').isEmail().normalizeEmail().withMessage('Valid email required')],
  async (req: Request, res: Response): Promise<void> => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      res.status(400).json({ errors: errors.array() });
      return;
    }

    const { email } = req.body as { email: string };
    try {
      await prisma.subscriber.updateMany({ where: { email }, data: { active: false } });
      res.json({ success: true, message: 'Unsubscribed successfully' });
    } catch {
      res.status(500).json({ error: 'Internal server error' });
    }
  }
);

// GET /api/subscribers/count — public count
router.get('/count', async (_req: Request, res: Response): Promise<void> => {
  try {
    const count = await prisma.subscriber.count({ where: { active: true } });
    res.json({ count });
  } catch {
    res.status(500).json({ error: 'Internal server error' });
  }
});

// POST /api/subscribers/google/exchange — exchange Google OAuth code for subscriber
router.post(
  '/google/exchange',
  async (req: Request, res: Response): Promise<void> => {
    const { code, redirectUri } = req.body as { code: string; redirectUri: string };
    if (!code || !redirectUri) {
      res.status(400).json({ error: 'Missing code or redirectUri' });
      return;
    }

    const clientId = process.env.GOOGLE_CLIENT_ID || '';
    const clientSecret = process.env.GOOGLE_CLIENT_SECRET || '';

    if (!clientId || !clientSecret) {
      res.status(500).json({ error: 'Google OAuth not configured' });
      return;
    }

    try {
      const tokenRes = await fetch('https://oauth2.googleapis.com/token', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams({
          code,
          client_id: clientId,
          client_secret: clientSecret,
          redirect_uri: redirectUri,
          grant_type: 'authorization_code',
        }),
      });

      if (!tokenRes.ok) {
        res.status(400).json({ error: 'Failed to exchange code' });
        return;
      }

      const tokenData = await tokenRes.json() as { access_token: string };

      const userRes = await fetch('https://www.googleapis.com/oauth2/v2/userinfo', {
        headers: { Authorization: `Bearer ${tokenData.access_token}` },
      });

      if (!userRes.ok) {
        res.status(400).json({ error: 'Failed to get user info' });
        return;
      }

      const userInfo = await userRes.json() as { email: string; id: string; name?: string };
      const lang = (req.headers['x-language'] as string || 'en').toLowerCase();

      const existing = await prisma.subscriber.findUnique({ where: { email: userInfo.email } });
      if (existing) {
        if (!existing.active) {
          await prisma.subscriber.update({
            where: { id: existing.id },
            data: { active: true, language: lang, googleId: userInfo.id, name: userInfo.name || existing.name },
          });
        }
        res.json({ success: true, message: 'Already subscribed' });
        return;
      }

      await prisma.subscriber.create({
        data: { email: userInfo.email, googleId: userInfo.id, name: userInfo.name, language: lang },
      });
      res.status(201).json({ success: true, message: 'Subscribed successfully' });
    } catch {
      res.status(500).json({ error: 'Internal server error' });
    }
  }
);

export default router;
