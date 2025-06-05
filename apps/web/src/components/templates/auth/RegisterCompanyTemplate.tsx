'use client';

import { useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { companyRegisterSchema, CompanyRegisterFormData } from '@/lib/validations/zodAuthValidation';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Building2, Loader2, ChevronsRight } from 'lucide-react';
import { toast } from 'sonner';
import Link from 'next/link';
import { registerCompanyAdminAction } from '@/lib/actions/authActions';
import RegisterCompanyDetails from '@/components/organisms/auth/RegisterCompanyDetails';
import RegisterCompanyPersonal from '@/components/organisms/auth/RegisterCompanyPersonal';

export default function RegisterCompanyTemplate() {
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  const form = useForm<CompanyRegisterFormData>({
    resolver: zodResolver(companyRegisterSchema),
    defaultValues: {
      companyName: '',
      companyEmail: '',
      industry: '', 
      website: '',
      phone: '',
      firstName: '',
      lastName: '',
      email: '',
      password: '',
      confirmPassword: '',
    },
  });

  const onSubmit = async (formData: CompanyRegisterFormData) => {
    startTransition(async () => {
      try {
        const payload = {
            ...formData,
            website: formData.website || undefined,
            phone: formData.phone || undefined,
        };
        const result = await registerCompanyAdminAction(payload);

        if (!result.success) {
          if (result.message.includes('already exists')) {
            toast.error('Registration failed', {
              description: 'This email is already registered. Please try signing in instead.',
            });
            if (result.message.includes('company email')) {
              form.setError('companyEmail', {
                type: 'manual',
                message: 'This company email is already registered.',
              });
            } else {
              form.setError('email', {
                type: 'manual',
                message: 'This email for the admin user is already registered.',
              });
            }
          } else {
            toast.error('Registration failed', {
              description: result.message || 'An unexpected error occurred.',
            });
          }
          return;
        }

        toast.success('Company registration successful!', {
          description: result.message || 'Please check your email to verify your account.',
        });

        if (typeof window !== 'undefined') {
          sessionStorage.setItem('pendingVerificationEmail', formData.email);
        }

        router.push('/auth/verify-email');
      } catch (error) {
        console.error('Company registration submission client-side error:', error);
        toast.error('Something went wrong', {
          description: 'Could not complete registration. Please try again later.',
        });
      }
    });
  };

  return (
    <Card className="w-full max-w-2xl mx-auto bg-gradient-to-br from-white to-gray-50/50 dark:from-gray-900 dark:to-gray-800/50 border-0 shadow-2xl overflow-hidden my-8">
      {/* Header */}
      <CardHeader className="space-y-3 text-center relative z-10 pb-6 pt-8 bg-gradient-to-b from-primary/5 to-transparent">
        <motion.div
          initial={{ scale: 0, y: -20 }}
          animate={{ scale: 1, y: 0 }}
          transition={{ delay: 0.1, type: "spring", stiffness: 200 }}
          className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl border-2 border-white bg-gradient-to-br from-primary/10 to-primary/5 shadow-lg"
        >
          <Building2 className="h-8 w-8 text-primary-600" />
        </motion.div>
        <CardTitle className="text-3xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 dark:from-white dark:to-gray-300 bg-clip-text text-transparent">
          Register Your Company
        </CardTitle>
        <CardDescription className="text-muted-foreground">
          Create your company account and start hiring the best talent.
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-6 p-6 sm:p-8 relative z-10">
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          {/* Company Details Section */}
          <RegisterCompanyDetails form={form} isPending={isPending} />

          {/* Admin Personal Details Section */}
          <RegisterCompanyPersonal form={form} isPending={isPending} />

          {/* Submit Button */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.7 }} className="pt-3">
            <Button 
              type="submit" 
              disabled={isPending} 
              className="w-full cursor-pointer h-12 bg-gradient-to-r from-primary to-primary/90 hover:from-accent hover:to-accent/90 text-white font-semibold shadow-lg hover:shadow-xl disabled:opacity-50"
            >
              {isPending ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <Building2 className="mr-2 h-4 w-4" />
              )}
              {isPending ? 'Creating Company Account...' : 'Register Company'}
            </Button>
          </motion.div>
        </form>

        {/* Footer Links */}
        <motion.div 
          initial={{ opacity: 0 }} 
          animate={{ opacity: 1 }} 
          transition={{ delay: 0.75 }} 
          className="text-center text-sm text-muted-foreground pt-3"
        >
          Already have a company account?{' '}
          <Link 
            href="/auth/login" 
            className="font-medium text-primary-500 hover:underline"
          >
            Sign In <ChevronsRight className="inline h-4 w-4 -mt-0.5" />
          </Link>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0 }} 
          animate={{ opacity: 1 }} 
          transition={{ delay: 0.8 }} 
          className="text-center text-sm text-muted-foreground"
        >
          Seeking Jobs?{' '}
          <Link 
            href="/auth/register" 
            className="font-medium text-emerald-600 hover:underline" 
          >
            Register Here as a Job Seeker
          </Link>
        </motion.div>
      </CardContent>
    </Card>
  );
}