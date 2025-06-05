'use server';

import { signIn as nextAuthServerSignIn, signOut as nextAuthServerSignOut } from '@/auth'; 
import { LoginFormData, RegisterFormData, CompanyRegisterFormData } from '@/lib/validations/zodAuthValidation';
import { AuthError } from 'next-auth';
import { UserRole } from '@prisma/client'; 
import { authHelpers, RegisterResult } from '@/lib/authHelpers'; 

export interface LoggedInUser {
  id: string;
  email: string;
  name?: string;
  role: UserRole; 
  avatar?: string;
  isVerified: boolean;
}

interface LoginActionResult {
  success: boolean;
  error?: string;
  errorType?: string;
  user?: LoggedInUser;
}

export async function loginWithCredentialsAction(data: LoginFormData): Promise<LoginActionResult> {
  try {
    console.log(`LOGIN_ACTION: Starting login for email: ${data.email}`);
    
    try {
      await nextAuthServerSignOut({ redirect: false });
      console.log('LOGIN_ACTION: Successfully signed out existing session');
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (signOutError) {
      console.log('LOGIN_ACTION: No existing session to sign out');
    }

    // Small delay to ensure session is properly cleared
    await new Promise(resolve => setTimeout(resolve, 100));

    const result = await nextAuthServerSignIn('credentials', {
      email: data.email,
      password: data.password,
      redirect: false,
    });

    console.log(`LOGIN_ACTION: SignIn result:`, result);

    if (result?.error) {
      console.log(`LOGIN_ACTION: SignIn failed with error: ${result.error}`);
      return {
        success: false,
        error: 'Invalid credentials. Please check your email and password.',
        errorType: 'CredentialsSignin',
      };
    }
    
    // Get user data from your helper for the response
    const userFromHelper = await authHelpers.verifyCredentials(data.email, data.password);
    
    if (!userFromHelper) {
      return {
        success: false,
        error: 'Failed to retrieve user data after login.',
        errorType: 'UserDataError',
      };
    }

    // Map the user data
    const loggedInUser: LoggedInUser = {
      id: userFromHelper.id,
      email: userFromHelper.email,
      name: userFromHelper.name,
      role: userFromHelper.role as UserRole,
      avatar: userFromHelper.avatar,
      isVerified: userFromHelper.isVerified,
    };

    console.log(`LOGIN_ACTION: About to update last login for user ID: ${loggedInUser.id}`);
    
    // Update last login time 
    await authHelpers.updateLastLogin(loggedInUser.id);

    console.log(`LOGIN_ACTION: Login successful for user: ${loggedInUser.email}`);
    return { success: true, user: loggedInUser };

  } catch (error) {
    console.error('LOGIN_ACTION: Unexpected error:', error);
    
    // Ensure we sign out on any error to prevent stale sessions
    try {
      await nextAuthServerSignOut({ redirect: false });
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (signOutError) {
      console.log('LOGIN_ACTION: Failed to sign out after error');
    }

    if (error instanceof AuthError) {
      if (error.type === 'CredentialsSignin') {
        return {
          success: false,
          error: 'Invalid credentials. Please check your email and password.',
          errorType: error.type,
        };
      }
      console.error('AuthError in loginAction:', error);
      return {
        success: false,
        error: error.message || 'An authentication error occurred.',
        errorType: error.type,
      };
    }
    
    return {
      success: false,
      error: 'An unexpected error occurred during login. Please try again.',
      errorType: 'UnknownError',
    };
  }
}

// Server action for logout
export async function logoutAction(): Promise<{ success: boolean }> {
  try {
    console.log('LOGOUT_ACTION: Starting logout process');
    await nextAuthServerSignOut({ redirect: false });
    console.log('LOGOUT_ACTION: Successfully signed out');
    return { success: true };
  } catch (error) {
    console.error('LOGOUT_ACTION: Error during logout:', error);
    return { success: true };
  }
}

// Directly calls the Node.js specific registration logic
export async function registerUserAction(data: RegisterFormData): Promise<RegisterResult> {
  try {
    const result = await authHelpers.register(data);
    return result;
  } catch (error) {
    console.error('Unexpected error in registerUserAction:', error);
    return {
      success: false,
      message: 'An unexpected server error occurred during registration. Please try again.',
    };
  }
}

// Server Actions
export async function verifyEmailTokenAction(token: string): Promise<{ success: boolean; message: string }> {
    return authHelpers.verifyEmailToken(token);
}

export async function generatePasswordResetTokenAction(email: string): Promise<{ success: boolean; message: string }> {
    return authHelpers.generatePasswordResetToken(email);
}

export async function resetPasswordAction(token: string, newPassword: string):Promise<{ success: boolean; message: string }> {
    return authHelpers.resetPassword(token, newPassword);
}

export async function resendVerificationEmailAction(email: string): Promise<{ success: boolean; message: string }> {
    return authHelpers.resendVerificationEmail(email);
}

export async function registerCompanyAdminAction(data: CompanyRegisterFormData): Promise<RegisterResult> {
  try {
    const result = await authHelpers.registerCompanyAdmin(data);
    return result;
  } catch (error) {
    console.error('Unexpected error in registerCompanyAdminAction:', error);
    return {
      success: false,
      message: 'An unexpected server error occurred during company registration. Please try again.',
    };
  }
}