'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect } from 'react';
import { 
  LogOut, 
  ShieldCheck,
  ChevronRight,
  Loader2
} from 'lucide-react';
import { useSession } from 'next-auth/react';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { logoutAction } from '@/lib/actions/authActions';
import { useState } from 'react';
import { useAuthStore } from '@/stores/authStores';
import { useSidebarStore } from '@/stores/sidebarStores';
import { developerNavItems } from '@/lib/SidebarNavItems';

export default function DeveloperSidebar() {
  const pathname = usePathname();
  const { data: session } = useSession();
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

  const getInitials = (name?: string | null) => {
    if (!name) return 'DV';
    return name.split(' ').map(n => n[0]).join('').toUpperCase();
  }

  return (
    <div className="hidden md:flex w-64 bg-card border-r border-border min-h-screen flex-col fixed shadow-sm">
      {/* Header */}
      <div className="p-6 border-b border-border/50">
        <Link href="/" className="flex items-center gap-3 group">
          <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center group-hover:bg-primary/90 transition-colors">
            <ShieldCheck className="w-5 h-5 text-primary-foreground" />
          </div>
          <div className="flex flex-col">
            <h1 className="text-lg font-bold text-foreground">WorkVault</h1>
            <p className="text-xs text-primary">Developer Panel</p>
          </div>
        </Link>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-2">
        <div className="mb-4">
          <h2 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3 px-3">
            Developer Menu
          </h2>
          {developerNavItems.map((item) => {
            const isActive = pathname === item.href || (item.href !== '/dashboard/developer' && pathname.startsWith(item.href));
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
                   {isActive && item.href !== '/dashboard/developer' && (
                    <ChevronRight className="w-4 h-4 text-primary-foreground" />
                  )}
                </Link>
              </div>
            );
          })}
        </div>
      </nav>

      {/* Footer */}
      <div className="p-4 border-t border-border/50 mt-auto">
        <Separator className="my-2" />
        <Button
          variant="ghost"
          size="sm"
          onClick={handleLogout}
          disabled={isLoggingOut}
          className="w-full justify-start gap-3 text-muted-foreground hover:text-primary hover:bg-primary/10 transition-colors"
        >
          {isLoggingOut ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <LogOut className="w-4 h-4" />
          )}
          <span>{isLoggingOut ? 'Signing Out...' : 'Sign Out'}</span>
        </Button>

        <div className="mt-4 p-3 bg-muted/50 rounded-lg">
          <div className="flex items-center gap-2">
            <Avatar className="w-8 h-8">
              <AvatarImage src={session?.user?.image ?? undefined} alt={session?.user?.name ?? "Developer"} />
              <AvatarFallback className="bg-primary text-primary-foreground">
                {getInitials(session?.user?.name)}
              </AvatarFallback>
            </Avatar>
            <div className="flex flex-col min-w-0 flex-1">
              <span className="text-xs font-medium text-foreground truncate">{session?.user?.name || "Developer"}</span>
              <span className="text-xs text-muted-foreground truncate">{session?.user?.email}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}