export * from '@/types/authTypes';
export * from '@/lib/auth/authUtils';
export * from '@/lib/auth/authRegistration';
export * from '@/lib/auth/authVerification';

import { 
  verifyCredentials, 
  getUserById, 
  updateLastLogin 
} from './authUtils';

import { 
  register, 
  registerCompanyAdmin, 
  registerDeveloper 
} from './authRegistration';

import { 
  verifyEmailToken, 
  generatePasswordResetToken, 
  resetPassword, 
  resendVerificationEmail 
} from './authVerification';

// Main authentication helpers object
export const authHelpers = {
  // User management
  verifyCredentials,
  getUserById,
  updateLastLogin,
  
  // Registration functions
  register,
  registerCompanyAdmin,
  registerDeveloper,
  
  // Email and password verification
  verifyEmailToken,
  generatePasswordResetToken,
  resetPassword,
  resendVerificationEmail,
};