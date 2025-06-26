'use client';

import { useState, useTransition } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { motion } from 'framer-motion';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useAuthStore } from '@/stores/authStores';
import { loginSchema, LoginFormData } from '@/lib/validations/zodAuthValidation';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import {
  Shield,
  TrendingUp,
  CheckCircle,
} from 'lucide-react';
import { toast } from 'sonner';
import { loginWithCredentialsAction } from '@/lib/actions/authActions';
import { CredentialsLoginFields } from '@/components/molecules/auth/CredentialsLoginFields';
import { CredentialsLoginActions } from '@/components/molecules/auth/CredentialsLoginActions';

export function CredentialsLogin() {
  const [showPassword, setShowPassword] = useState(false);
  const [isPending, startTransition] = useTransition();
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get('callbackUrl') || '/';

  const { login: loginToStore, logout: logoutFromStore, setLoading } = useAuthStore();

  const form = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  });

  const onSubmit = async (formData: LoginFormData) => { 
    startTransition(async () => {
      try {
        setLoading(true);

        // Clear any existing user data from store first
        console.log('CLIENT: Clearing existing auth state before login');
        logoutFromStore();

        // Small delay to ensure store is cleared
        await new Promise(resolve => setTimeout(resolve, 100));

        // Call the server action
        console.log('CLIENT: Calling login server action');
        const result = await loginWithCredentialsAction(formData);

        if (!result.success || !result.user) {
          // Handle errors based on the action's response
          const errorMessage = result.error || 'An unknown error occurred.';
          const errorDescription = result.errorType === 'CredentialsSignin'
            ? 'Please check your email and password and try again.'
            : errorMessage;
            
          toast.error(result.errorType === 'CredentialsSignin' ? 'Invalid credentials' : 'Login failed', {
            description: errorDescription,
          });
          return;
        }

        // If action is successful and user data is returned
        console.log('CLIENT: Login successful, updating store with user:', result.user);
        loginToStore({
          id: result.user.id,
          email: result.user.email,
          name: result.user.name,
          role: result.user.role,
          avatar: result.user.avatar,
          isVerified: result.user.isVerified,
        });

        toast.success('Welcome back!', {
          description: 'You have successfully signed in.',
        });

        // Force a hard refresh to ensure all components get the new session
        console.log('CLIENT: Redirecting and refreshing');
        router.push(callbackUrl);
        setTimeout(() => {
          window.location.href = callbackUrl;
        }, 100);
        
      } catch (error) {
        console.error('Login submission client-side error:', error);
        
        // Clear any partial state on error
        logoutFromStore();
        
        toast.error('Something went wrong', {
          description: 'An unexpected client-side error occurred. Please try again later.',
        });
      } finally {
        setLoading(false);
      }
    });
  };

  return (
    <Card className="relative overflow-hidden bg-gradient-to-br from-white to-gray-50/50 dark:from-gray-900 dark:to-gray-800/50 border-0 shadow-md mt-16">
      {/* Gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent" />
      
      {/* Floating decorative element */}
      <div className="absolute top-4 right-4">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
          className="opacity-20"
        >
          <TrendingUp className="h-4 w-4 text-primary" />
        </motion.div>
      </div>

      <CardHeader className="space-y-4 text-center relative z-10 pb-8">
        {/* Logo/Icon */}
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ 
            delay: 0.2, 
            type: "spring", 
            stiffness: 200 
          }}
          className="mx-auto"
        >
          <div className="relative">
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl border-2 border-white bg-gradient-to-br from-primary/20 to-primary/5 shadow-lg mx-auto">
              <Shield className="h-8 w-8 text-primary" />
            </div>
            <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-green-400 rounded-full border-2 border-white flex items-center justify-center">
              <CheckCircle className="h-3 w-3 text-white" />
            </div>
          </div>
        </motion.div>

        <div className="space-y-2">
          <CardTitle className="text-2xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 dark:from-white dark:to-gray-300 bg-clip-text text-transparent">
            Welcome back
          </CardTitle>
          <CardDescription className="text-base text-muted-foreground">
            Sign in to your account to continue
          </CardDescription>
        </div>
      </CardHeader>

      <CardContent className="space-y-6 relative z-10">
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <CredentialsLoginFields
            form={form}
            showPassword={showPassword}
            setShowPassword={setShowPassword}
          />
          
          <CredentialsLoginActions
            isPending={isPending}
          />
        </form>
      </CardContent>

      {/* Bottom gradient effect */}
      <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-primary/50 to-transparent" />
    </Card>
  );
}