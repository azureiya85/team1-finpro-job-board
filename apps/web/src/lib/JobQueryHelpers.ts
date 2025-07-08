import { Prisma } from '@prisma/client';
import type { GetJobsParams } from '@/types';

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
    companyQuery,
    companyLocationQuery,
    startDate, 
    endDate,   
  } = params;

  const where: Prisma.JobPostingWhereInput = { isActive: true, publishedAt: { not: null } };
  const andConditions: Prisma.JobPostingWhereInput[] = [];

  if (startDate || endDate) {
    const dateFilter: Prisma.DateTimeFilter = {};
    if (startDate) {
      dateFilter.gte = new Date(startDate);
    }
    if (endDate) {
      const endOfDay = new Date(endDate);
      endOfDay.setUTCHours(23, 59, 59, 999);
      dateFilter.lte = endOfDay;
    }
    andConditions.push({ publishedAt: dateFilter });
  }

  if (userLatitude !== undefined && userLongitude !== undefined) {
    const { minLat, maxLat, minLon, maxLon } = getBoundingBox(userLatitude, userLongitude, radiusKm);
    andConditions.push({
      AND: [
        { latitude: { gte: minLat, lte: maxLat } },
        { longitude: { gte: minLon, lte: maxLon } },
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
  
  // --- Search Logic ---
  if (jobTitle) {
    andConditions.push({
      OR: [
        { title: { contains: jobTitle, mode: 'insensitive' } },
        { description: { contains: jobTitle, mode: 'insensitive' } },
        { tags: { has: jobTitle } }
      ],
    });
  }

  // --- Direct Filter Logic ---
  if (categories?.length) andConditions.push({ category: { in: categories } });
  if (employmentTypes?.length) andConditions.push({ employmentType: { in: employmentTypes } });
  if (experienceLevels?.length) andConditions.push({ experienceLevel: { in: experienceLevels } });
  if (typeof isRemote === 'boolean') andConditions.push({ isRemote });

   const companyAndConditions: Prisma.CompanyWhereInput[] = [];

  if (companyQuery) {
    companyAndConditions.push({ name: { contains: companyQuery, mode: 'insensitive' } });
  }
  if (companySizes?.length) {
    companyAndConditions.push({ size: { in: companySizes } });
  }
  if (companyLocationQuery) {
    companyAndConditions.push({
      OR: [
        { city: { is: { name: { equals: companyLocationQuery, mode: 'insensitive' } } } },
        { province: { is: { name: { equals: companyLocationQuery, mode: 'insensitive' } } } },
      ],
    });
  }

  if (companyAndConditions.length > 0) {
    andConditions.push({
      company: {
        is: {
          AND: companyAndConditions,
        },
      },
    });
  }
  
  if (companyId) {
    andConditions.push({ companyId });
  }

  if (andConditions.length > 0) {
    where.AND = andConditions;
  }

  return where;
};