import { Request, Response } from 'express';
import { CompanyService } from '../services/company.service';
import { updateCompanySchema } from '@/lib/validations/zodCompanyValidation';

interface CompanyParams {
  id: string;
}

export class CompanyController {
  static async getCompany(
    req: Request<CompanyParams>,
    res: Response
  ): Promise<void> {
    try {
      const { id } = req.params;

      if (!id) {
        res.status(400).json({
          error: 'Company ID is required'
        });
        return;
      }

      const company = await CompanyService.getCompanyById(id);

      if (!company) {
        res.status(404).json({ 
          error: 'Company not found' 
        });
        return;
      }

      res.json(company);
    } catch (error) {
      console.error('Error in getCompany controller:', error);
      res.status(500).json({ 
        error: 'Internal server error',
        message: 'Failed to fetch company information'
      });
    }
  }

  static async updateCompany(
    req: Request<CompanyParams>,
    res: Response
  ): Promise<void> {
    try {
      const { id } = req.params;

      if (!id) {
        res.status(400).json({
          error: 'Company ID is required'
        });
        return;
      }

      // Validate company admin access
      const authResult = await CompanyService.validateCompanyAccess(id, req.user);
      
      if (!authResult.isAuthenticated) {
        res.status(401).json({
          error: 'Authentication required'
        });
        return;
      }

      if (!authResult.isCompanyAdmin || !authResult.isOwner) {
        res.status(403).json({
          error: 'Unauthorized. Only company administrators can update company information.'
        });
        return;
      }

      // Validate request body
      const validationResult = updateCompanySchema.safeParse(req.body);

      if (!validationResult.success) {
        res.status(400).json({
          error: 'Invalid input data',
          details: validationResult.error.format(),
        });
        return;
      }

      const updateData = validationResult.data;

      // Ensure user exists (TypeScript guard)
      if (!req.user) {
        res.status(401).json({
          error: 'Authentication required'
        });
        return;
      }

      // Update company
      const updatedCompany = await CompanyService.updateCompany(
        id, 
        updateData, 
        req.user.id
      );

      res.json({
        message: 'Company updated successfully',
        company: updatedCompany
      });

    } catch (error) {
      console.error('Error in updateCompany controller:', error);
      
      if (error instanceof Error) {
        if (error.message === 'Company not found') {
          res.status(404).json({ error: error.message });
          return;
        }
        
        if (error.message.includes('Unauthorized')) {
          res.status(403).json({ error: error.message });
          return;
        }
      }

      res.status(500).json({ 
        error: 'Internal server error',
        message: 'Failed to update company information'
      });
    }
  }
}