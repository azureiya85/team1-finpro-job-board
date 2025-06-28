import { Request, Response, NextFunction } from 'express';
import * as locationService from 'src/services/location.service';

export async function getAllLocations(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const locations = await locationService.fetchAllLocations();
    res.json(locations);
  } catch (error) {
    console.error('[CONTROLLER_LOCATIONS_GET_ALL] Error fetching locations:', error);
    next(error);
  }
}