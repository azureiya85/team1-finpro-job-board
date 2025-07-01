import prisma from '@/lib/prisma';
import bcrypt from 'bcryptjs';
import { emailService } from '@/services/email.service';
import { RegisterFormData, CompanyRegisterFormData, DeveloperRegisterFormData } from '@/lib/validations/zodAuthValidation';
import { UserRole } from '@prisma/client';
import { RegisterResult } from '@/types/authTypes';
import { generateSecureToken, createUserResponse, sendEmailSafely } from './authUtils';

/**
 * Registers a regular user
 */
export const register = async (data: RegisterFormData): Promise<RegisterResult> => {
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
};

/**
 * Registers a company admin with associated company
 */
export const registerCompanyAdmin = async (data: CompanyRegisterFormData): Promise<RegisterResult> => {
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
};

/**
 * Registers a developer (limited to one per system)
 */
export const registerDeveloper = async (data: DeveloperRegisterFormData): Promise<RegisterResult> => {
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
};