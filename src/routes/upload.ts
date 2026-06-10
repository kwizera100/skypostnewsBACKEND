import { Router, Request, Response } from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import crypto from 'crypto';
import { authenticate, AuthRequest } from '../middleware/auth';

const router = Router();

const UPLOAD_DIR = path.join(__dirname, '..', '..', 'uploads');
if (!fs.existsSync(UPLOAD_DIR)) fs.mkdirSync(UPLOAD_DIR, { recursive: true });

const storage = multer.diskStorage({
  destination(_req, _file, cb) { cb(null, UPLOAD_DIR); },
  filename(_req, file, cb) {
    const ext = path.extname(file.originalname).toLowerCase().replace(/[^a-z0-9.]/g, '');
    const name = crypto.randomBytes(12).toString('hex');
    cb(null, `${name}${ext}`);
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB
  fileFilter(_req, file, cb) {
    const allowed = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
    cb(null, allowed.includes(file.mimetype));
  },
});

// POST /api/upload
router.post('/', authenticate, upload.single('file'), (req: AuthRequest, res: Response): void => {
  if (!req.file) {
    res.status(400).json({ error: 'No valid image file provided' });
    return;
  }
  res.json({ url: `/uploads/${req.file.filename}` });
});

// GET /api/upload/list
router.get('/list', authenticate, (_req: Request, res: Response): void => {
  try {
    const files = fs.readdirSync(UPLOAD_DIR)
      .filter(f => /\.(jpg|jpeg|png|webp|gif)$/i.test(f))
      .map(f => ({
        name: f,
        url: `/uploads/${f}`,
        size: fs.statSync(path.join(UPLOAD_DIR, f)).size,
      }))
      .reverse();
    res.json(files);
  } catch {
    res.json([]);
  }
});

export default router;
