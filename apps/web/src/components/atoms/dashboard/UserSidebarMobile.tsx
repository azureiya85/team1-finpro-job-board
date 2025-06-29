'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LogOut, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { userNavItems } from '@/lib/SidebarNavItems';
import { logoutAction } from '@/lib/actions/authActions';
import { useState } from 'react';
import { useAuthStore } from '@/stores/authStores';
import { useSidebarStore } from '@/stores/sidebarStores';

export default function UserSidebarMobile() {
  const pathname = usePathname();
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const { setActiveTab } = useSidebarStore();

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
    <div className="md:hidden fixed bottom-0 left-0 right-0 bg-card border-t border-border shadow-lg z-50">
      <div className="flex items-center justify-around px-2 py-2">
        {userNavItems.filter(item => !item.comingSoon).map((item) => {
          const isActive = pathname === item.href || (item.href !== '/dashboard' && pathname.startsWith(item.href));
          const IconComponent = item.icon;

          return (
            <Link
              key={item.name}
              href={item.href}
              onClick={() => handleNavClick(item.href)}
              className={cn(
                "flex flex-col items-center gap-1 px-3 py-2 rounded-lg transition-all duration-200 min-w-0 flex-1",
                isActive
                  ? "bg-primary/10 text-primary"
                  : "text-muted-foreground hover:text-foreground hover:bg-accent"
              )}
            >
              <IconComponent className="w-5 h-5 shrink-0" />
              <span className="text-xs font-medium truncate">{item.mobileLabel}</span>
            </Link>
          );
        })}
        
        {/* Logout button for mobile */}
        <button
          onClick={handleLogout}
          disabled={isLoggingOut}
          className={cn(
            "flex flex-col items-center gap-1 px-3 py-2 rounded-lg transition-all duration-200 min-w-0 flex-1",
            "text-muted-foreground hover:text-destructive hover:bg-destructive/10"
          )}
        >
          {isLoggingOut ? (
            <Loader2 className="w-5 h-5 animate-spin" />
          ) : (
            <LogOut className="w-5 h-5" />
          )}
          <span className="text-xs font-medium">
            {isLoggingOut ? 'Wait...' : 'Logout'}
          </span>
        </button>
      </div>
    </div>
  );
}