import prisma from '@/lib/prisma';
import bcrypt from 'bcryptjs';
import { emailService } from '@/services/email.service';
import { ServiceResponse } from '@/types/authTypes';
import { generateSecureToken, sendEmailSafely } from './authUtils';


// Verifies email token and activates user account
export const verifyEmailToken = async (token: string): Promise<ServiceResponse> => {
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
};


// Generates password reset token and sends reset email
export const generatePasswordResetToken = async (email: string): Promise<ServiceResponse> => {
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
};


// Resets user password using reset token
export const resetPassword = async (token: string, newPassword: string): Promise<ServiceResponse> => {
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
};


// Resends verification email to user
export const resendVerificationEmail = async (email: string): Promise<ServiceResponse> => {
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
};