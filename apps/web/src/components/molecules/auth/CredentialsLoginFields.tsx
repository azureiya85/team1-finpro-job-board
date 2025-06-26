'use client';

import { motion } from 'framer-motion';
import { UseFormReturn } from 'react-hook-form';
import { LoginFormData } from '@/lib/validations/zodAuthValidation';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Mail,
  Lock,
  Eye,
  EyeOff,
} from 'lucide-react';

interface CredentialsLoginFieldsProps {
  form: UseFormReturn<LoginFormData>;
  showPassword: boolean;
  setShowPassword: (show: boolean) => void;
}

export function CredentialsLoginFields({
  form,
  showPassword,
  setShowPassword,
}: CredentialsLoginFieldsProps) {
  return (
    <>
      {/* Email field */}
      <motion.div
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 0.3 }}
      >
        <Label htmlFor="email" className="text-sm font-medium text-foreground">
          Email Address
        </Label>
        <div className="relative mt-2">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Mail className="h-4 w-4 text-muted-foreground" />
          </div>
          <Input
            id="email"
            type="email"
            placeholder="Enter your email"
            className="pl-10 h-12 border-2 focus:ring-2 focus:ring-primary/90 transition-all duration-300"
            {...form.register('email')}
          />
        </div>
        {form.formState.errors.email && (
          <motion.p
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-sm text-red-600 mt-1"
          >
            {form.formState.errors.email.message}
          </motion.p>
        )}
      </motion.div>

      {/* Password field */}
      <motion.div
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 0.4 }}
      >
        <Label htmlFor="password" className="text-sm font-medium text-foreground">
          Password
        </Label>
        <div className="relative mt-2">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Lock className="h-4 w-4 text-muted-foreground" />
          </div>
          <Input
            id="password"
            type={showPassword ? 'text' : 'password'}
            placeholder="Enter your password"
            className="pl-10 pr-10 h-12 border-2 focus:ring-2 focus:ring-primary/90 transition-all duration-300"
            {...form.register('password')}
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute inset-y-0 right-0 pr-3 flex items-center hover:text-primary transition-colors duration-200"
          >
            {showPassword ? (
              <EyeOff className="h-4 w-4" />
            ) : (
              <Eye className="h-4 w-4" />
            )}
          </button>
        </div>
        {form.formState.errors.password && (
          <motion.p
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-sm text-red-600 mt-1"
          >
            {form.formState.errors.password.message}
          </motion.p>
        )}
      </motion.div>
    </>
  );
}