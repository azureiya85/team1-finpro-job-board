import express from 'express';
import { CompanyController } from '../controllers/company.controller';
import { authMiddleware } from '../middleware/auth.middleware';

const router = express.Router();

// GET /api/companies/:id - Get company by ID (public route)
router.get('/:id', CompanyController.getCompany);

// PUT /api/companies/:id - Update company (protected route)
router.put('/:id', authMiddleware, CompanyController.updateCompany as any);

export default router;