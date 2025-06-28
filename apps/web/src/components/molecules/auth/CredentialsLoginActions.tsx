'use client';

import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import {
  LogIn,
  Loader2,
} from 'lucide-react';
import Link from 'next/link';

interface CredentialsLoginActionsProps {
  isPending: boolean;
}

export function CredentialsLoginActions({
  isPending,
}: CredentialsLoginActionsProps) {
  return (
    <>
      {/* Submit button */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="pt-2"
      >
        <Button
          type="submit"
          disabled={isPending}
          className="w-full h-12 bg-gradient-to-r from-primary to-primary/90 hover:from-primary/90 hover:to-primary text-white font-medium rounded-lg shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-[1.02]"
        >
          {isPending ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Signing in...
            </>
          ) : (
            <>
              <LogIn className="mr-2 h-4 w-4" />
              Sign In
            </>
          )}
        </Button>
      </motion.div>

      {/* Additional interactive elements */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.6 }}
        className="space-y-4"
      >
        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-muted-foreground/20" />
          </div>
          <div className="relative flex justify-center text-xs uppercase">
            <span className="bg-background px-2 text-muted-foreground">
              Need help?
            </span>
          </div>
        </div>

        <div className="flex items-center justify-between text-sm">
          <Link
            href="/auth/reset-password" 
            className="text-primary hover:text-primary/80 transition-colors duration-200 font-medium"
          >
            Forgot password?
          </Link>
          <Link
            href="/auth/register" 
            className="text-muted-foreground hover:text-foreground transition-colors duration-200"
          >
            Create account
          </Link>
        </div>
      </motion.div>
    </>
  );
}