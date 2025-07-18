'use client';

import Link from 'next/link';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import { User, Menu, X, LogOut, Building2 } from 'lucide-react';
import { useAuthStore } from '@/stores/authStores';
import { useNavbarStore } from '@/stores/navbarStore';
import { Button } from '@/components/ui/button';
import { useRouter } from 'next/navigation';
import { useTransition } from 'react';
import { logoutAction } from '@/lib/actions/authActions';
import { toast } from 'sonner';

export function NavbarMobile() {
  const { user, isAuthenticated, logout } = useAuthStore();
  const { 
    isMobileMenuOpen, 
    navigationItems, 
    toggleMobileMenu, 
    closeMobileMenu 
  } = useNavbarStore();
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const handleLogout = () => {
    if (isPending) return;
    
    startTransition(async () => {
      try {
        logout();
        const result = await logoutAction();
        
        if (result.success) {
          toast.success('Logged out successfully');
          window.location.href = '/';
        } else {
          toast.success('Logged out successfully');
          router.push('/');
          router.refresh();
        }
        closeMobileMenu();
      } catch (error) {
        console.error('NAVBAR: Error during logout:', error);
        toast.error('Logout failed. Please try again.');
        router.push('/');
        router.refresh();
        closeMobileMenu();
      }
    });
  };

  // Helper function to get profile link based on user role
  const getProfileLink = () => {
    if (!user) return '/dashboard'; 
    
    switch (user.role) {
      case 'ADMIN':
      case 'Developer': 
        return '/dashboard/developer';
      case 'COMPANY_ADMIN':
        return user.companyId ? `/companies/${user.companyId}` : '/dashboard/company-redirect';
      case 'USER':
        return '/dashboard'; 
      default:
        return '/dashboard'; 
    }
  };

  return (
    <>
      {/* Mobile Menu Button */}
      <div className="md:hidden flex items-center">
        <Button
          variant="ghost"
          size="sm"
          onClick={toggleMobileMenu}
          className="relative z-50 text-white hover:text-white hover:bg-white/10 p-2"
          aria-label="Toggle mobile menu"
        >
          <AnimatePresence mode="wait" initial={false}>
            {isMobileMenuOpen ? (
              <motion.div
                key="close"
                initial={{ rotate: -90, opacity: 0 }}
                animate={{ rotate: 0, opacity: 1 }}
                exit={{ rotate: 90, opacity: 0 }}
                transition={{ duration: 0.2 }}
              >
                <X className="h-6 w-6" />
              </motion.div>
            ) : (
              <motion.div
                key="menu"
                initial={{ rotate: 90, opacity: 0 }}
                animate={{ rotate: 0, opacity: 1 }}
                exit={{ rotate: -90, opacity: 0 }}
                transition={{ duration: 0.2 }}
              >
                <Menu className="h-6 w-6" />
              </motion.div>
            )}
          </AnimatePresence>
        </Button>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3 }}
            className="absolute top-full left-0 right-0 md:hidden bg-white/95 dark:bg-gray-900/95 backdrop-blur-lg border-t border-gray-200/50 dark:border-gray-800/50 shadow-lg"
          >
            <div className="max-w-7xl mx-auto px-4 py-6 space-y-4">
              {/* Navigation Items */}
              {navigationItems
                .filter(item => !item.href.includes('analytics') || user?.role === 'Developer')
                .map((item, index) => (
                <motion.div
                  key={item.href}
                  initial={{ x: -20, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <Link
                    href={item.href}
                    onClick={closeMobileMenu}
                    className="flex items-center space-x-3 py-3 px-4 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors duration-200 text-gray-900 dark:text-gray-100"
                  >
                    <item.icon className="h-5 w-5 text-primary" />
                    <span className="font-medium">{item.label}</span>
                  </Link>
                </motion.div>
              ))}

              {/* Auth Section */}
              <div className="pt-4 border-t border-gray-200 dark:border-gray-800">
                {isAuthenticated && user ? (
                  <div className="space-y-2">
                    <div className="flex items-center space-x-3 px-4 py-2">
                      {user.avatar ? (
                        <Image
                          src={user.avatar}
                          alt={user.name || 'User'}
                          width={32}
                          height={32}
                          className="rounded-full object-cover"
                        />
                      ) : (
                        <div className="h-8 w-8 rounded-full bg-gradient-to-r from-primary to-purple-600 flex items-center justify-center">
                          <User className="h-4 w-4 text-white" />
                        </div>
                      )}
                      <div>
                        <p className="text-sm font-medium text-gray-900 dark:text-gray-100">{user.name || 'User'}</p>
                        <p className="text-xs text-muted-foreground">{user.email}</p>
                        <p className="text-xs text-blue-600 font-medium">{user.role.replace('_', ' ')}</p>
                      </div>
                    </div>
                    <Link
                      href={getProfileLink()}
                      onClick={closeMobileMenu}
                      className="flex items-center space-x-3 py-3 px-4 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors duration-200 text-gray-900 dark:text-gray-100"
                    >
                      {user.role === 'COMPANY_ADMIN' ? (
                        <>
                          <Building2 className="h-5 w-5 text-primary" />
                          <span>Company Dashboard</span>
                        </>
                      ) : (
                        <>
                          <User className="h-5 w-5 text-primary" />
                          <span>Dashboard</span>
                        </>
                      )}
                    </Link>
                    <Button
                      onClick={handleLogout}
                      variant="ghost"
                      disabled={isPending}
                      className="flex items-center space-x-3 py-3 px-4 w-full justify-start text-red-600 hover:text-red-600 hover:bg-red-50"
                    >
                      <LogOut className="h-5 w-5" />
                      <span>Sign Out</span>
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-3">
                    <Button
                      variant="ghost"
                      asChild
                      className="w-full justify-start text-gray-900 dark:text-gray-100 hover:bg-gray-100 dark:hover:bg-gray-800"
                    >
                      <Link href="/auth/login" onClick={closeMobileMenu}>Sign In</Link>
                    </Button>
                    <Button
                      asChild
                      className="w-full bg-accent hover:bg-accent/90"
                    >
                      <Link href="/auth/register" onClick={closeMobileMenu}>Get Started</Link>
                    </Button>
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}