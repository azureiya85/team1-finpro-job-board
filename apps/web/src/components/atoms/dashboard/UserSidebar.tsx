'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect } from 'react';
import { Cog, User, LogOut, ChevronRight, Award, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { useUserBadges } from '@/hooks/useUserBadges';
import { logoutAction } from '@/lib/actions/authActions';
import { useState } from 'react';
import { useAuthStore } from '@/stores/authStores';
import { useSidebarStore } from '@/stores/sidebarStores';
import { userNavItems } from '@/lib/SidebarNavItems';

export default function UserSidebar() {
  const pathname = usePathname();
  const { badges, isLoading: badgesLoading, error: badgesError } = useUserBadges();
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const { setActiveTab, setIsMobile } = useSidebarStore();

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };

    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, [setIsMobile]);

  useEffect(() => {
    setActiveTab(pathname);
  }, [pathname, setActiveTab]);

  const handleLogout = async () => {
    if (isLoggingOut) return;
    
    try {
      setIsLoggingOut(true);
      const { logout: clearAuthStore } = useAuthStore.getState();
      clearAuthStore();    
      const result = await logoutAction();
      
      if (result.success) {
        window.location.href = '/auth/login';
      } else {
        window.location.href = '/auth/login';
      }
    } catch (error) {
      console.error('Logout error:', error);
      const { logout: clearAuthStore } = useAuthStore.getState();
      clearAuthStore();
      window.location.href = '/auth/login';
    } finally {
      setIsLoggingOut(false);
    }
  };

  const handleNavClick = (href: string) => {
    setActiveTab(href);
  };

  return (
    <div className="hidden md:flex w-64 bg-card border-r border-border min-h-screen flex-col fixed shadow-sm">
      {/* Header */}
      <div className="p-6 border-b border-border/50">
        <Link href="/" className="flex items-center gap-3 group">
          <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center group-hover:bg-primary/90 transition-colors">
            <Cog className="w-5 h-5 text-primary-foreground" />
          </div>
          <div className="flex flex-col">
            <h1 className="text-lg font-bold text-foreground">WorkVault</h1>
            <p className="text-xs text-muted-foreground">Dashboard</p>
          </div>
        </Link>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-2">
        <div className="mb-4">
          <h2 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3 px-3">
            Navigation
          </h2>
          {userNavItems.map((item) => {
            const isActive = pathname === item.href || (item.href !== '/dashboard' && pathname.startsWith(item.href));
            const IconComponent = item.icon;

            return (
              <div key={item.name} className="relative">
                <Link
                  href={item.comingSoon ? '#' : item.href}
                  onClick={() => !item.comingSoon && handleNavClick(item.href)}
                  className={cn(
                    "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 group relative",
                    isActive
                      ? "bg-primary text-primary-foreground shadow-sm"
                      : "text-foreground hover:bg-accent hover:text-accent-foreground",
                    item.comingSoon && "cursor-not-allowed opacity-60"
                  )}
                >
                  <IconComponent className={cn(
                    "w-4 h-4 shrink-0",
                    isActive ? "text-primary-foreground" : "text-muted-foreground group-hover:text-accent-foreground"
                  )} />
                  <div className="flex flex-col min-w-0 flex-1">
                    <span className="truncate">{item.name}</span>
                    {!isActive && (
                      <span className="text-xs text-muted-foreground truncate">
                        {item.description}
                      </span>
                    )}
                  </div>
                  {item.comingSoon && (
                    <Badge variant="secondary" className="text-xs px-1.5 py-0.5 h-auto">
                      Soon
                    </Badge>
                  )}
                  {isActive && item.href !== '/dashboard' && (
                    <ChevronRight className="w-4 h-4 text-primary-foreground" />
                  )}
                </Link>
              </div>
            );
          })}
        </div>
      </nav>

      {/* Badges Section */}
      <div className="p-4 border-t border-border/50">
        <h2 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3 px-3">
          My Badges
        </h2>
        {badgesLoading ? (
          <div className="flex justify-center items-center h-10">
            <Loader2 className="w-5 h-5 animate-spin text-muted-foreground" />
          </div>
        ) : badgesError ? (
          <p className="text-xs text-destructive px-3">Error loading badges.</p>
        ) : badges && badges.length > 0 ? (
          <>
            <div className="flex flex-wrap gap-2 px-3">
              {badges.slice(0, 5).map(badge => (
                <div key={badge.id} title={`${badge.assessmentTitle}\nEarned: ${new Date(badge.earnedAt).toLocaleDateString()}`} className="cursor-default">
                  <Badge variant="outline" className="p-1.5 text-lg border-yellow-400 text-yellow-600 bg-yellow-50">
                    {badge.assessmentIcon ? (
                      <span>{badge.assessmentIcon}</span>
                    ) : (
                      <Award className="w-4 h-4" />
                    )}
                  </Badge>
                </div>
              ))}
            </div>
            {badges.length > 5 && (
              <Link 
                href="/dashboard/profile#badges" 
                className="text-xs text-primary hover:underline px-3 mt-2 block"
              >
                View all badges...
              </Link>
            )}
          </>
        ) : (
          <p className="text-xs text-muted-foreground px-3">No badges earned yet.</p>
        )}
      </div>

      {/* Footer */}
      <div className="p-4 border-t border-border/50 mt-auto">
        <div className="space-y-2">
          <Separator className="my-2" />
          <Button
            variant="ghost"
            size="sm"
            onClick={handleLogout}
            disabled={isLoggingOut}
            className="w-full justify-start gap-3 text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors"
          >
            {isLoggingOut ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <LogOut className="w-4 h-4" />
            )}
            <span>{isLoggingOut ? 'Signing Out...' : 'Sign Out'}</span>
          </Button>
        </div>

        <div className="mt-4 p-3 bg-muted/50 rounded-lg">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 bg-primary rounded-full flex items-center justify-center">
              <User className="w-3 h-3 text-primary-foreground" />
            </div>
            <div className="flex flex-col min-w-0 flex-1">
              <span className="text-xs font-medium text-foreground truncate">Welcome back!</span>
              <span className="text-xs text-muted-foreground truncate">Manage your job search</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}