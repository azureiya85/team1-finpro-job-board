'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { developerRegisterSchema, DeveloperRegisterFormData } from '@/lib/validations/zodAuthValidation';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Mail,
  Lock,
  Eye,
  EyeOff,
  Code,
  Loader2,
  ChevronsRight,
} from 'lucide-react';
import { toast } from 'sonner';
import Link from 'next/link';
import { registerDeveloperAction } from '@/lib/actions/authActions';

export default function RegisterDeveloperTemplate() {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  const form = useForm<DeveloperRegisterFormData>({
    resolver: zodResolver(developerRegisterSchema),
    defaultValues: {
      email: '',
      password: '',
      confirmPassword: '',
    },
  });

  const onSubmit = async (formData: DeveloperRegisterFormData) => { 
    startTransition(async () => {
      try {
        const result = await registerDeveloperAction(formData);

        if (!result.success) {
          if (result.message.includes('developer account already exists')) {
            toast.error('Registration not allowed', {
              description: 'A developer account already exists in the system. Only one developer account is permitted.',
            });
          } else if (result.message.includes('already exists')) {
            toast.error('Registration failed', {
              description: 'This email is already registered. Please try signing in instead.',
            });
            form.setError('email', {
              type: 'manual',
              message: 'This email is already registered.',
            });
          } else {
            toast.error('Registration failed', {
              description: result.message || 'An unexpected error occurred.',
            });
          }
          return;
        }

        toast.success('Developer registration successful!', {
          description: result.message || 'Please check your email to verify your account.',
        });

        if (typeof window !== 'undefined') {
          sessionStorage.setItem('pendingVerificationEmail', formData.email);
        }

        router.push('/auth/verify-email');
      } catch (error) {
        console.error('Developer registration submission client-side error:', error);
        toast.error('Something went wrong', {
          description: 'Could not complete registration. Please try again later.',
        });
      }
    });
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 p-4">
      <Card className="w-full max-w-md mx-auto bg-gradient-to-br from-white to-gray-50/50 dark:from-gray-900 dark:to-gray-800/50 border-0 shadow-2xl overflow-hidden">
        <CardHeader className="space-y-3 text-center relative z-10 pb-6 pt-8 bg-gradient-to-b from-primary/5 to-transparent">
          <motion.div
            initial={{ scale: 0, y: -20 }}
            animate={{ scale: 1, y: 0 }}
            transition={{ delay: 0.1, type: "spring", stiffness: 200 }}
            className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl border-2 border-white bg-gradient-to-br from-primary/20 to-primary/5 shadow-lg"
          >
            <Code className="h-8 w-8 text-primary" />
          </motion.div>
          <CardTitle className="text-3xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 dark:from-white dark:to-gray-300 bg-clip-text text-transparent">
            Developer Access
          </CardTitle>
          <CardDescription className="text-muted-foreground">
            Create your developer account to access platform administration.
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-5 p-6 sm:p-8 relative z-10">
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            
            {/* Email */}
            <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.2 }}>
              <Label htmlFor="email">Email Address</Label>
              <div className="relative mt-1">
                <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input 
                  id="email" 
                  type="email" 
                  placeholder="developer@example.com" 
                  {...form.register('email')} 
                  className="pl-10 h-11"
                  disabled={isPending}
                />
              </div>
              {form.formState.errors.email && (
                <p className="text-sm text-red-600 mt-1">
                  {form.formState.errors.email.message}
                </p>
              )}
            </motion.div>

            {/* Password */}
            <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.3 }}>
              <Label htmlFor="password">Password</Label>
              <div className="relative mt-1">
                <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="••••••••"
                  {...form.register('password')}
                  className="pl-10 pr-10 h-11"
                  disabled={isPending}
                />
                <button 
                  type="button" 
                  onClick={() => setShowPassword(!showPassword)} 
                  className="absolute right-3 top-1/2 -translate-y-1/2 hover:text-primary disabled:opacity-50"
                  disabled={isPending}
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
              {form.formState.errors.password && (
                <p className="text-sm text-red-600 mt-1">
                  {form.formState.errors.password.message}
                </p>
              )}
            </motion.div>

            {/* Confirm Password */}
            <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.35 }}>
              <Label htmlFor="confirmPassword">Confirm Password</Label>
              <div className="relative mt-1">
                <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  id="confirmPassword"
                  type={showConfirmPassword ? 'text' : 'password'}
                  placeholder="••••••••"
                  {...form.register('confirmPassword')}
                  className="pl-10 pr-10 h-11"
                  disabled={isPending}
                />
                <button 
                  type="button" 
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)} 
                  className="absolute right-3 top-1/2 -translate-y-1/2 hover:text-primary disabled:opacity-50"
                  disabled={isPending}
                >
                  {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
              {form.formState.errors.confirmPassword && (
                <p className="text-sm text-red-600 mt-1">
                  {form.formState.errors.confirmPassword.message}
                </p>
              )}
            </motion.div>

            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }} className="pt-3">
              <Button 
                type="submit" 
                disabled={isPending} 
                className="w-full h-11 bg-gradient-to-r from-primary to-primary/90 hover:from-primary/90 hover:to-primary text-white font-semibold shadow-lg hover:shadow-xl disabled:opacity-50"
              >
                {isPending ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <Code className="mr-2 h-4 w-4" />
                )}
                {isPending ? 'Creating Account...' : 'Create Developer Account'}
              </Button>
            </motion.div>
          </form>

          <motion.div 
            initial={{ opacity: 0 }} 
            animate={{ opacity: 1 }} 
            transition={{ delay: 0.45 }} 
            className="text-center text-sm text-muted-foreground pt-3"
          >
            Already have an account?{' '}
            <Link 
              href="/auth/login" 
              className="font-medium text-primary hover:underline"
            >
              Sign In <ChevronsRight className="inline h-4 w-4 -mt-0.5" />
            </Link>
          </motion.div>

        </CardContent>
      </Card>
    </div>
  );
}