import prisma from '@/lib/prisma';
import bcrypt from 'bcryptjs';
import { emailService } from '@/services/email.service';
import { RegisterFormData, CompanyRegisterFormData, DeveloperRegisterFormData } from '@/lib/validations/zodAuthValidation';
import { universalCrypto } from '@/lib/crypto';
import { UserRole } from '@prisma/client';

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

export interface RegisterResult {
  success: boolean;
  message: string;
  user?: Omit<AuthUser, 'password'>;
}

const generateSecureToken = (): string => {
  return universalCrypto.generateToken(32);
};

interface DatabaseUser {
  id: string;
  email: string;
  name: string | null;
  firstName: string | null;
  lastName: string | null;
  role: string;
  image: string | null;
  isEmailVerified: boolean;
}

const createUserResponse = (user: DatabaseUser): AuthUser => ({
  id: user.id,
  email: user.email,
  name: user.name || undefined,
  firstName: user.firstName || undefined,
  lastName: user.lastName || undefined,
  role: user.role,
  avatar: user.image || undefined,
  isVerified: user.isEmailVerified,
});

// Updated to handle email service return values
const sendEmailSafely = async (
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

export const authHelpers = {
  register: async (data: RegisterFormData): Promise<RegisterResult> => {
    try {
      const { firstName, lastName, email, password } = data;
      
      const existingUser = await prisma.user.findUnique({ where: { email } });
      if (existingUser) {
        return { success: false, message: 'User with this email already exists' };
      }

      const hashedPassword = await bcrypt.hash(password, 12);
      const emailVerificationToken = generateSecureToken();
      const emailVerificationExpires = new Date(Date.now() + 24 * 60 * 60 * 1000);

      const newUser = await prisma.user.create({
        data: {
          firstName,
          lastName,
          name: `${firstName} ${lastName}`,
          email,
          password: hashedPassword,
          role: 'USER',
          provider: 'EMAIL',
          isEmailVerified: false,
          emailVerificationToken,
          emailVerificationExpires,
        },
      });

      await sendEmailSafely(
        emailService.sendVerificationEmail(newUser.email, newUser.firstName || 'User', emailVerificationToken),
        'verification email'
      );

      return {
        success: true,
        message: 'Registration successful! Please check your email to verify your account.',
        user: createUserResponse(newUser),
      };
    } catch (error) {
      console.error('Registration error:', error);
      return { success: false, message: 'An unexpected error occurred during registration' };
    }
  },

  registerCompanyAdmin: async (data: CompanyRegisterFormData): Promise<RegisterResult> => {
    try {
      const existingUser = await prisma.user.findUnique({ where: { email: data.email } });
      if (existingUser) {
        return { success: false, message: 'A user with this email already exists.' };
      }

      const existingCompany = await prisma.company.findFirst({ where: { email: data.companyEmail } });
      if (existingCompany) {
        return { success: false, message: 'A company with this company email already exists.' };
      }

      const hashedPassword = await bcrypt.hash(data.password, 12);
      const emailVerificationToken = generateSecureToken();
      const emailVerificationExpires = new Date(Date.now() + 24 * 60 * 60 * 1000);

      const result = await prisma.$transaction(async (tx) => {
        const user = await tx.user.create({
          data: {
            email: data.email,
            password: hashedPassword,
            firstName: data.firstName,
            lastName: data.lastName,
            name: data.companyName,
            role: UserRole.COMPANY_ADMIN,
            provider: 'EMAIL',
            isEmailVerified: false,
            emailVerificationToken,
            emailVerificationExpires,
          },
        });

        const company = await tx.company.create({
          data: {
            name: data.companyName,
            email: data.companyEmail,
            industry: data.industry,
            website: data.website || null,
            phone: data.phone || null,
            adminId: user.id,
          },
        });

        return { user, company };
      });

      await sendEmailSafely(
        emailService.sendVerificationEmail(data.email, data.companyName, emailVerificationToken),
        'verification email'
      );

      return {
        success: true,
        message: 'Company registration successful! Please check your email to verify your account.',
        user: createUserResponse(result.user),
      };
    } catch (error) {
      console.error('Error in registerCompanyAdmin:', error);
      return {
        success: false,
        message: 'An error occurred during company registration. Please try again.',
      };
    }
  },

  verifyCredentials: async (email: string, password: string): Promise<AuthUser | null> => {
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
  },

  verifyEmailToken: async (token: string): Promise<{ success: boolean; message: string }> => {
    try {
      const user = await prisma.user.findFirst({
        where: { emailVerificationToken: token },
      });

      if (!user) {
        return { success: false, message: 'Invalid verification token.' };
      }

      const currentTime = new Date();
      
      if (!user.emailVerificationExpires || user.emailVerificationExpires <= currentTime) {
        return { success: false, message: 'Verification token has expired.' };
      }

      if (user.isEmailVerified) {
        return { success: true, message: 'Email address is already verified.' };
      }

      await prisma.user.update({
        where: { id: user.id },
        data: {
          isEmailVerified: true,
          emailVerified: currentTime,
          emailVerificationToken: null,
          emailVerificationExpires: null,
        },
      });

      await sendEmailSafely(
        emailService.sendWelcomeEmail(user.email, user.firstName || user.name || 'User'),
        'welcome email'
      );

      return { success: true, message: 'Email verified successfully! Welcome to our platform.' };
    } catch (error) {
      console.error('Email verification error:', error);
      return { success: false, message: 'An error occurred during email verification' };
    }
  },

  generatePasswordResetToken: async (email: string): Promise<{ success: boolean; message: string }> => {
    try {
      const user = await prisma.user.findUnique({ where: { email } });
      
      // Always return success to prevent email enumeration
      if (!user) {
        return {
          success: true,
          message: 'If an account with this email exists, a password reset link has been sent.'
        };
      }

      const resetToken = generateSecureToken();
      const resetTokenExpires = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

      await prisma.user.update({
        where: { id: user.id },
        data: { resetPasswordToken: resetToken, resetPasswordExpires: resetTokenExpires },
      });

      try {
        await emailService.sendPasswordResetEmail(user.email, user.firstName || user.name || 'User', resetToken);
        return { success: true, message: 'Password reset link has been sent to your email.' };
      } catch (error) {
        console.error('Failed to send password reset email:', error);
        return { success: false, message: 'Failed to send password reset email. Please try again.' };
      }
    } catch (error) {
      console.error('Password reset token generation error:', error);
      return { success: false, message: 'An error occurred while processing your request' };
    }
  },

  resetPassword: async (token: string, newPassword: string): Promise<{ success: boolean; message: string }> => {
    try {
      const user = await prisma.user.findFirst({
        where: { 
          resetPasswordToken: token, 
          resetPasswordExpires: { gt: new Date() } 
        },
      });
      
      if (!user) {
        return { success: false, message: 'Invalid or expired reset token' };
      }

      const hashedPassword = await bcrypt.hash(newPassword, 12);
      
      await prisma.user.update({
        where: { id: user.id },
        data: { 
          password: hashedPassword, 
          resetPasswordToken: null, 
          resetPasswordExpires: null 
        },
      });

      return { success: true, message: 'Password has been reset successfully' };
    } catch (error) {
      console.error('Password reset error:', error);
      return { success: false, message: 'An error occurred while resetting your password' };
    }
  },

  resendVerificationEmail: async (email: string): Promise<{ success: boolean; message: string }> => {
    try {
      const user = await prisma.user.findUnique({ where: { email } });
      
      if (!user) {
        return { success: false, message: 'User not found' };
      }
      
      if (user.isEmailVerified && user.emailVerified) {
        return { success: false, message: 'Email is already verified' };
      }

      const emailVerificationToken = generateSecureToken();
      const emailVerificationExpires = new Date(Date.now() + 24 * 60 * 60 * 1000);

      await prisma.user.update({
        where: { id: user.id },
        data: {
          emailVerificationToken,
          emailVerificationExpires,
          isEmailVerified: false,
          emailVerified: null,
        },
      });

      await emailService.sendVerificationEmail(user.email, user.firstName || user.name || 'User', emailVerificationToken);
      
      return { success: true, message: 'Verification email has been resent' };
    } catch (error) {
      console.error('Resend verification email error:', error);
      return { success: false, message: 'Failed to resend verification email' };
    }
  },

  getUserById: async (id: string): Promise<AuthUser | null> => {
    try {
      const user = await prisma.user.findUnique({ where: { id } });
      return user ? createUserResponse(user) : null;
    } catch (error) {
      console.error('Get user by ID error:', error);
      return null;
    }
  },

  updateLastLogin: async (userId: string): Promise<void> => {
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
  },

    registerDeveloper: async (data: DeveloperRegisterFormData): Promise<RegisterResult> => {
    try {
      const { email, password } = data;
      
      // Check if a developer already exists
      const existingDeveloper = await prisma.user.findFirst({
        where: { role: 'Developer' }
      });
      
      if (existingDeveloper) {
        return { 
          success: false, 
          message: 'A developer account already exists in the system. Only one developer account is allowed.' 
        };
      }
      
      const existingUser = await prisma.user.findUnique({ where: { email } });
      if (existingUser) {
        return { success: false, message: 'User with this email already exists' };
      }

      const hashedPassword = await bcrypt.hash(password, 12);
      const emailVerificationToken = generateSecureToken();
      const emailVerificationExpires = new Date(Date.now() + 24 * 60 * 60 * 1000);

      const newUser = await prisma.user.create({
        data: {
          email,
          password: hashedPassword,
          name: 'Developer',
          role: 'Developer',
          provider: 'EMAIL',
          isEmailVerified: false,
          emailVerificationToken,
          emailVerificationExpires,
        },
      });

      await sendEmailSafely(
        emailService.sendVerificationEmail(newUser.email, 'Developer', emailVerificationToken),
        'developer verification email'
      );

      return {
        success: true,
        message: 'Developer registration successful! Please check your email to verify your account.',
        user: createUserResponse(newUser),
      };
    } catch (error) {
      console.error('Developer registration error:', error);
      return { success: false, message: 'An unexpected error occurred during developer registration' };
    }
  },
};

