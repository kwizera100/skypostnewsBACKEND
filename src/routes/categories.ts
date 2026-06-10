import { Router, Request, Response } from 'express';
import { prisma } from '../lib/prisma';
import { authenticate, requireRole, AuthRequest } from '../middleware/auth';

const router = Router();

// GET /api/categories
router.get('/', async (_req: Request, res: Response): Promise<void> => {
  try {
    const categories = await prisma.category.findMany({
      orderBy: { name: 'asc' },
      include: { _count: { select: { articles: { where: { published: true } } } } },
    });
    res.json(categories);
  } catch {
    res.status(500).json({ error: 'Failed to fetch categories' });
  }
});

// GET /api/categories/:slug
router.get('/:slug', async (req: Request, res: Response): Promise<void> => {
  try {
    const category = await prisma.category.findUnique({
      where: { slug: req.params.slug },
      include: { _count: { select: { articles: { where: { published: true } } } } },
    });
    if (!category) {
      res.status(404).json({ error: 'Category not found' });
      return;
    }
    res.json(category);
  } catch {
    res.status(500).json({ error: 'Failed to fetch category' });
  }
});

// POST /api/categories (Admin only)
router.post(
  '/',
  authenticate,
  requireRole('ADMIN'),
  async (req: AuthRequest, res: Response): Promise<void> => {
    const { name, slug, description, color } = req.body as {
      name: string; slug: string; description?: string; color?: string;
    };
    if (!name || !slug) {
      res.status(400).json({ error: 'Name and slug are required' });
      return;
    }
    try {
      const category = await prisma.category.create({
        data: { name, slug, description, color: color ?? '#DC2626' },
      });
      res.status(201).json(category);
    } catch {
      res.status(500).json({ error: 'Failed to create category' });
    }
  }
);

export default router;
