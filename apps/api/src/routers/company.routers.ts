import express from 'express';
import { CompanyController } from '../controllers/company.controller';

const router = express.Router();

// GET /api/companies/:id - Get company by ID (public route)
router.get('/:id', CompanyController.getCompany);

export default router;