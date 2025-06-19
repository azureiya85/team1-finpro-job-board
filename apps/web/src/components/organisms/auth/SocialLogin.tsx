'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { signIn } from 'next-auth/react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { 
  Chrome, 
  Facebook, 
  Twitter 
} from 'lucide-react';
import { Loader2 } from 'lucide-react';

interface SocialProvider {
  id: string;
  name: string;
  icon: React.ComponentType<{ className?: string }>;
  bgColor: string;
  hoverColor: string;
  textColor: string;
}

export function SocialLogin() {
  const [loadingProvider, setLoadingProvider] = useState<string | null>(null);

  const socialProviders: SocialProvider[] = [
    {
      id: 'google',
      name: 'Google',
      icon: Chrome,
      bgColor: 'bg-white dark:bg-gray-800',
      hoverColor: 'cursor-pointer hover:bg-orange-500 dark:hover:bg-orange-700',
      textColor: 'text-gray-900 dark:text-gray-100',
    },
    {
      id: 'facebook',
      name: 'Facebook',
      icon: Facebook,
      bgColor: 'bg-[#1877F2]',
      hoverColor: 'cursor-pointer hover:bg-[#166FE5]',
      textColor: 'text-white',
    },
    {
      id: 'twitter',
      name: 'Twitter',
      icon: Twitter,
      bgColor: 'bg-[#1DA1F2]',
      hoverColor: 'cursor-pointer hover:bg-[#0C8CE6]',
      textColor: 'text-white',
    },
  ];

  const handleSocialLogin = async (providerId: string) => {
    try {
      setLoadingProvider(providerId);
      
      const result = await signIn(providerId, {
        callbackUrl: '/dashboard',
        redirect: false,
      });

      if (result?.error) {
        toast.error('Login failed', {
          description: 'An error occurred during social login. Please try again.',
        });
      } else if (result?.ok) {
        toast.success('Login successful!', {
          description: 'Redirecting to your dashboard...',
        });
        
        // Redirect after successful login
        window.location.href = result.url || '/dashboard';
      }
    } catch (error) {
      console.error(`${providerId} login error:`, error);
      toast.error('Login failed', {
        description: 'An unexpected error occurred. Please try again.',
      });
    } finally {
      setLoadingProvider(null);
    }
  };

  return (
    <div className="space-y-3">
      {/* Header */}
      <div className="text-center">
        <p className="text-sm text-muted-foreground">
          Continue with your social account
        </p>
      </div>

      {/* Social provider buttons */}
      <div className="space-y-3">
        {socialProviders.map((provider, index) => {
          const Icon = provider.icon;
          const isLoading = loadingProvider === provider.id;
          
          return (
            <motion.div
              key={provider.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ 
                duration: 0.3, 
                delay: index * 0.1 
              }}
            >
              <Button
                type="button"
                variant="outline"
                size="lg"
                onClick={() => handleSocialLogin(provider.id)}
                disabled={loadingProvider !== null}
                className={`
                  w-full relative transition-all duration-200
                  ${provider.bgColor} 
                  ${provider.hoverColor} 
                  ${provider.textColor}
                  border-2 border-gray-200 dark:border-gray-600
                  hover:border-gray-300 dark:hover:border-gray-500
                  focus:ring-2 focus:ring-offset-2 focus:ring-blue-500
                  disabled:opacity-50 disabled:cursor-not-allowed
                  ${isLoading ? 'opacity-70' : ''}
                `}
              >
                {isLoading ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <Icon className="mr-2 h-4 w-4" />
                )}
                
                <span className="font-medium">
                  {isLoading ? 'Connecting...' : `Continue with ${provider.name}`}
                </span>

                {/* Loading overlay */}
                {isLoading && (
                  <div className="absolute inset-0 bg-white/20 dark:bg-black/20 rounded-md" />
                )}
              </Button>
            </motion.div>
          );
        })}
      </div>

      {/* Privacy notice */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
        className="text-center"
      >
        <p className="text-xs text-muted-foreground">
          By continuing, you agree to our{' '}
          <a 
            href="/terms" 
            className="text-primary hover:underline"
          >
            Terms of Service
          </a>{' '}
          and{' '}
          <a 
            href="/privacy" 
            className="text-primary hover:underline"
          >
            Privacy Policy
          </a>
        </p>
      </motion.div>
    </div>
  );
}