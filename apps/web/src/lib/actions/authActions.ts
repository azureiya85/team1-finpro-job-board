'use server';

import { signIn as nextAuthServerSignIn, signOut as nextAuthServerSignOut } from '@/auth';
import { LoginFormData, RegisterFormData, CompanyRegisterFormData, DeveloperRegisterFormData } from '@/lib/validations/zodAuthValidation';
import { AuthError } from 'next-auth';
import { UserRole } from '@prisma/client';
import { redirect } from 'next/navigation';

import { 
  LoggedInUser, 
  LoginActionResult, 
  RegisterResult, 
  AuthHelperUser, 
  ServiceResponse 
} from '@/types/authTypes';

import { 
  verifyCredentials, 
  updateLastLogin 
} from '@/lib/auth/authUtils';

import { 
  register, 
  registerCompanyAdmin, 
  registerDeveloper 
} from '@/lib/auth/authRegistration';

import { 
  verifyEmailToken, 
  generatePasswordResetToken, 
  resetPassword, 
  resendVerificationEmail 
} from '@/lib/auth/authVerification';

const cleanupSession = async (): Promise<void> => {
  try {
    await nextAuthServerSignOut({ redirect: false });
  } catch {
    // Ignore cleanup errors
  }
};

const mapToLoggedInUser = (user: AuthHelperUser): LoggedInUser => ({
  id: user.id,
  email: user.email,
  name: user.name,
  role: user.role as UserRole,
  avatar: user.avatar,
  isVerified: user.isVerified,
});

export async function loginWithCredentialsAction(data: LoginFormData): Promise<LoginActionResult> {
  try {
    // Clean up any existing session
    await cleanupSession();
    await new Promise(resolve => setTimeout(resolve, 100));

    const result = await nextAuthServerSignIn('credentials', {
      email: data.email,
      password: data.password,
      redirect: false,
    });

    if (result?.error) {
      return {
        success: false,
        error: 'Invalid credentials. Please check your email and password.',
        errorType: 'CredentialsSignin',
      };
    }

    const user = await verifyCredentials(data.email, data.password);
    
    if (!user) {
      return {
        success: false,
        error: 'Failed to retrieve user data after login.',
        errorType: 'UserDataError',
      };
    }

    const loggedInUser = mapToLoggedInUser(user);
    
    // Update last login time
    await updateLastLogin(loggedInUser.id);

    return { success: true, user: loggedInUser };
  } catch (error) {
    console.error('Login error:', error);
    
    // Cleanup on error
    await cleanupSession();

    if (error instanceof AuthError) {
      const errorMessage = error.type === 'CredentialsSignin' 
        ? 'Invalid credentials. Please check your email and password.'
        : error.message || 'An authentication error occurred.';
        
      return {
        success: false,
        error: errorMessage,
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

export async function socialLoginAction(provider: 'google' | 'facebook' | 'twitter'): Promise<void> {
  try {
    await nextAuthServerSignIn(provider, { 
      redirectTo: '/dashboard',
    });
  } catch (error) {
    console.error(`${provider} login error:`, error);
    
    if (error instanceof AuthError) {
      // Redirect to login page with error
      redirect(`/auth/login?error=${encodeURIComponent(error.message || 'Social login failed')}`);
    }
    
    // Redirect to login page with generic error
    redirect('/auth/login?error=Social login failed. Please try again.');
  }
  
  // This line should never be reached due to redirects above
  redirect('/dashboard');
}

export async function logoutAction(): Promise<{ success: boolean }> {
  try {
    await nextAuthServerSignOut({ redirect: false });
    return { success: true };
  } catch (error) {
    console.error('Logout error:', error);
    return { success: true }; // Always return success for logout
  }
}

export async function registerUserAction(data: RegisterFormData): Promise<RegisterResult> {
  try {
    return await register(data);
  } catch (error) {
    console.error('Registration error:', error);
    return {
      success: false,
      message: 'An unexpected server error occurred during registration. Please try again.',
    };
  }
}

export async function verifyEmailTokenAction(token: string): Promise<ServiceResponse> {
  return verifyEmailToken(token);
}

export async function generatePasswordResetTokenAction(email: string): Promise<ServiceResponse> {
  return generatePasswordResetToken(email);
}

export async function resetPasswordAction(token: string, newPassword: string): Promise<ServiceResponse> {
  return resetPassword(token, newPassword);
}

export async function resendVerificationEmailAction(email: string): Promise<ServiceResponse> {
  return resendVerificationEmail(email);
}

export async function registerCompanyAdminAction(data: CompanyRegisterFormData): Promise<RegisterResult> {
  try {
    const result = await registerCompanyAdmin(data);
    return result;
  } catch (error) {
    console.error('Unexpected error in registerCompanyAdminAction:', error);
    return {
      success: false,
      message: 'An unexpected server error occurred during company registration. Please try again.',
    };
  }
}

export async function registerDeveloperAction(data: DeveloperRegisterFormData): Promise<RegisterResult> {
  try {
    return await registerDeveloper(data);
  } catch (error) {
    console.error('Developer registration error:', error);
    return {
      success: false,
      message: 'An unexpected server error occurred during developer registration. Please try again.',
    };
  }
}