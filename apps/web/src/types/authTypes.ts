import { UserRole } from '@prisma/client';

// Core user interfaces
export interface AuthUser {
  id: string;
  email: string;
  name?: string;
  firstName?: string;
  lastName?: string;
  role: string;
  avatar?: string;
  isVerified: boolean;
}

export interface LoggedInUser {
  id: string;
  email: string;
  name?: string;
  role: UserRole;
  avatar?: string;
  isVerified: boolean;
}

export interface User {
  id: string;
  email: string | null;
  firstName: string | null;
  lastName: string | null;
  role: UserRole;
  name?: string | null;
  image?: string | null;
  isEmailVerified: boolean;
}

// Database user interface
export interface DatabaseUser {
  id: string;
  email: string;
  name: string | null;
  firstName: string | null;
  lastName: string | null;
  role: string;
  image: string | null;
  isEmailVerified: boolean;
}

// Company interfaces
export interface Company {
  id: string;
  name: string;
  logo?: string | null;
  adminId: string;
  admin: {
    id: string;
    email: string | null;
    firstName: string | null;
    lastName: string | null;
    role: UserRole;
  };
}

// Authentication result interfaces
export interface RegisterResult {
  success: boolean;
  message: string;
  user?: Omit<AuthUser, 'password'>;
}

export interface LoginActionResult {
  success: boolean;
  error?: string;
  errorType?: string;
  user?: LoggedInUser;
}

export interface CompanyAuthResult {
  isAuthenticated: boolean;
  isCompanyAdmin: boolean;
  isOwner: boolean;
  user: {
    id: string;
    email: string;
    name?: string;
    role: string;
  } | null;
  error?: string;
}

// Generic service response interface
export interface ServiceResponse {
  success: boolean;
  message: string;
}

// Auth helper user interface (for mapping)
export interface AuthHelperUser {
  id: string;
  email: string;
  name?: string;
  role: string;
  avatar?: string;
  isVerified: boolean;
}