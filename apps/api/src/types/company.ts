import { UserRole } from '@prisma/client';

export interface AuthUser {
  id: string;
  email: string | null;
  name: string | null;
  firstName: string | null;
  lastName: string | null;
  role: UserRole;
  isEmailVerified: boolean;
  profileImage: string | null;
}

export interface CompanyAuthResult {
  isAuthenticated: boolean;
  isCompanyAdmin: boolean;
  isOwner: boolean;
  user: {
    id: string;
    email: string | null;
    name: string | null;
    role: UserRole;
  } | null;
  error?: string;
}

export interface CompanyStats {
  activeJobs: number;
  totalReviews: number;
  averageRating: number;
  ratings: {
    culture: number;
    workLifeBalance: number;
    facilities: number;
    career: number;
  };
}

export interface CompanyWithStats {
  id: string;
  name: string;
  description: string | null;
  banner: string | null;
  website: string | null;
  logo: string | null;
  industry: string | null;
  size: string | null;
  foundedYear: number | null;
  email: string | null;
  phone: string | null;
  address: string | null;
  latitude: number | null;
  longitude: number | null;
  provinceId: string | null;
  cityId: string | null;
  country: string | null;
  linkedinUrl: string | null;
  facebookUrl: string | null;
  twitterUrl: string | null;
  instagramUrl: string | null;
  adminId: string;
  createdAt: Date;
  updatedAt: Date;
  province: {
    id: string;
    name: string;
    code: string;
  } | null;
  city: {
    id: string;
    name: string;
    type: string;
  } | null;
  admin: {
    id: string;
    name: string | null;
    email: string | null;
    profileImage: string | null;
  };
  stats: CompanyStats;
}

export interface UpdateCompanyData {
  name?: string;
  description?: string | null;
  banner?: string | null;
  website?: string | null;
  logo?: string | null;
  industry?: string | null;
  size?: string | null;
  foundedYear?: number | null;
  email?: string | null;
  phone?: string | null;
  address?: string | null;
  latitude?: number | null;
  longitude?: number | null;
  provinceId?: string | null;
  cityId?: string | null;
  country?: string | null;
  linkedinUrl?: string | null;
  facebookUrl?: string | null;
  twitterUrl?: string | null;
  instagramUrl?: string | null;
}

export interface JWTPayload {
  sub?: string;
  uid?: string;
  id?: string;
  email?: string;
  role?: UserRole;
  isEmailVerified?: boolean;
  iat?: number;
  exp?: number;
}

// Express.js request extension
declare global {
  namespace Express {
    interface Request {
      user?: AuthUser;
    }
  }
}