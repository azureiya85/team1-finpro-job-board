import { Prisma } from '@prisma/client';
import type { GetJobsParams } from '@/types/jobs';

// === Geospatial Helpers ===

const toRadians = (degrees: number): number => degrees * Math.PI / 180;

export const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number): number => {
  const R = 6371; // Earth's radius in km
  const dLat = toRadians(lat2 - lat1);
  const dLon = toRadians(lon2 - lon1);
  const a = 
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(toRadians(lat1)) * Math.cos(toRadians(lat2)) * 
    Math.sin(dLon/2) * Math.sin(dLon/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  return R * c;
};

const getBoundingBox = (latitude: number, longitude: number, radiusKm: number) => {
  const R = 6371; 
  const paddedRadius = radiusKm * 1.2; // 20% padding
  const latDelta = paddedRadius / R * (180 / Math.PI);
  const minLat = latitude - latDelta;
  const maxLat = latitude + latDelta;
  const lonDelta = paddedRadius / (R * Math.cos(toRadians(latitude))) * (180 / Math.PI);
  const minLon = longitude - lonDelta;
  const maxLon = longitude + lonDelta;
  return { minLat, maxLat, minLon, maxLon };
};

// === Prisma Query Builder ===

export const buildWhereClause = (params: GetJobsParams): Prisma.JobPostingWhereInput => {
  const {
    jobTitle, locationQuery, userLatitude, userLongitude, radiusKm = 25, 
    cityId, provinceId, categories, employmentTypes, experienceLevels, 
    companySizes, isRemote, companyId,
  } = params;

  const where: Prisma.JobPostingWhereInput = { isActive: true };
  const andConditions: Prisma.JobPostingWhereInput[] = [];

  // Location Logic
  if (userLatitude !== undefined && userLongitude !== undefined) {
    const { minLat, maxLat, minLon, maxLon } = getBoundingBox(userLatitude, userLongitude, radiusKm);
    andConditions.push({
      AND: [
        { latitude: { gte: minLat, lte: maxLat } },
        { longitude: { gte: minLon, lte: maxLon } },
        { latitude: { not: null } }, { longitude: { not: null } }
      ]
    });
  } else if (cityId) {
    andConditions.push({ cityId });
  } else if (provinceId) {
    andConditions.push({ provinceId });
  } else if (locationQuery) {
    andConditions.push({
      OR: [
        { city: { is: { name: { contains: locationQuery, mode: 'insensitive' } } } },
        { province: { is: { name: { contains: locationQuery, mode: 'insensitive' } } } },
      ],
    });
  }
  
  // Search Logic
  if (jobTitle) {
    andConditions.push({
      OR: [
        { title: { contains: jobTitle, mode: 'insensitive' } },
        { description: { contains: jobTitle, mode: 'insensitive' } },
        { tags: { has: jobTitle } }
      ],
    });
  }

  // Filter Logic
  if (categories?.length) andConditions.push({ category: { in: categories } });
  if (employmentTypes?.length) andConditions.push({ employmentType: { in: employmentTypes } });
  if (experienceLevels?.length) andConditions.push({ experienceLevel: { in: experienceLevels } });
  if (typeof isRemote === 'boolean') andConditions.push({ isRemote });
  if (companySizes?.length) andConditions.push({ company: { is: { size: { in: companySizes } } } });
  if (companyId) andConditions.push({ companyId });

  if (andConditions.length > 0) {
    where.AND = andConditions;
  }

  return where;
};