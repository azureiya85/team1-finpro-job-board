import prisma from '@/lib/prisma';
import bcrypt from 'bcryptjs';
import { universalCrypto } from '@/lib/crypto';
import { AuthUser, DatabaseUser } from '@/types/authTypes';

/**
 * Generates a secure token for email verification and password reset
 */
export const generateSecureToken = (): string => {
  return universalCrypto.generateToken(32);
};

/**
 * Creates a standardized user response object from database user
 */
export const createUserResponse = (user: DatabaseUser): AuthUser => ({
  id: user.id,
  email: user.email,
  name: user.name || undefined,
  firstName: user.firstName || undefined,
  lastName: user.lastName || undefined,
  role: user.role,
  avatar: user.image || undefined,
  isVerified: user.isEmailVerified,
});

/**
 * Safely sends emails with error handling and logging
 */
export const sendEmailSafely = async (
  emailPromise: Promise<{ success: boolean; messageId: string; }>, 
  errorContext: string
): Promise<void> => {
  try {
    const result = await emailPromise;
    console.log(`${errorContext} sent successfully:`, result.messageId);
  } catch (error) {
    console.error(`Failed to send ${errorContext}:`, error);
  }
};

/**
 * Verifies user credentials for login
 */
export const verifyCredentials = async (email: string, password: string): Promise<AuthUser | null> => {
  try {
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user?.password) return null;

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) return null;

    return createUserResponse(user);
  } catch (error) {
    console.error('Credential verification error:', error);
    return null;
  }
};

/**
 * Gets user by ID
 */
export const getUserById = async (id: string): Promise<AuthUser | null> => {
  try {
    const user = await prisma.user.findUnique({ where: { id } });
    return user ? createUserResponse(user) : null;
  } catch (error) {
    console.error('Get user by ID error:', error);
    return null;
  }
};

/**
 * Updates user's last login timestamp
 */
export const updateLastLogin = async (userId: string): Promise<void> => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { id: true }
    });

    if (!user) {
      console.warn(`User with ID ${userId} not found`);
      return;
    }

    await prisma.user.update({
      where: { id: userId },
      data: { lastLoginAt: new Date() }
    });
  } catch (error) {
    console.error('Update last login error:', error);
  }
};