'use client';

import { SessionProvider, useSession } from 'next-auth/react';
import { usePathname, useRouter } from 'next/navigation';
import { UserRole } from '@prisma/client';
import { Loader2, ShieldAlert } from 'lucide-react';
import UserSidebar from '@/components/atoms/dashboard/UserSidebar';
import DeveloperSidebar from '@/components/atoms/dashboard/DeveloperSidebar'; 
import UserSidebarMobile from '@/components/atoms/dashboard/UserSidebarMobile';
import DeveloperSidebarMobile from '@/components/atoms/dashboard/DeveloperSidebarMobile';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

function DashboardLayoutContent({ children }: { children: React.ReactNode }) {
  const { data: session, status } = useSession();
  const pathname = usePathname();
  const router = useRouter();

  const isDeveloperPath = pathname.startsWith('/dashboard/developer');

  // 1. Handle Loading State
  if (status === 'loading') {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-background">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
        <p className="mt-4 text-lg text-foreground">Loading dashboard...</p>
      </div>
    );
  }

  // 2. Handle Unauthenticated State
  if (status === 'unauthenticated') {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen p-6 bg-background">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle className="flex items-center">
              <ShieldAlert className="h-6 w-6 mr-2 text-destructive" />
              Access Denied
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground mb-4">
              You must be logged in to view this page.
            </p>
            <Button onClick={() => router.push('/auth/login')} className="w-full">
              Go to Login
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  // 3. User is Authenticated, Determine which dashboard/sidebar to show
  const userRole = session?.user?.role;
  const isAuthorizedDeveloper = userRole === UserRole.ADMIN || userRole === UserRole.Developer;

  if (isDeveloperPath) {
    if (!isAuthorizedDeveloper) {
      // Authenticated but NOT authorized for developer section
      return (
        <div className="flex flex-col items-center justify-center min-h-screen p-6 bg-background">
          <Card className="w-full max-w-md">
            <CardHeader>
              <CardTitle className="flex items-center">
                <ShieldAlert className="h-6 w-6 mr-2 text-destructive" />
                Unauthorized Access
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground mb-4">
                You do not have the permissions to access the developer panel.
              </p>
              <Button onClick={() => router.push('/dashboard')} className="w-full">
                Go to User Dashboard
              </Button>
            </CardContent>
          </Card>
        </div>
      );
    }
    // Authorized for developer section: Show Developer Sidebar
    return (
      <div className="flex min-h-screen bg-muted/40 dark:bg-neutral-950">
        <DeveloperSidebar />
        <DeveloperSidebarMobile />
        <main className="flex-1 p-6 md:p-8 md:ml-64 pb-20 md:pb-8">{children}</main>
      </div>
    );
  } else {
    // User dashboard: Show User Sidebar
    return (
      <div className="flex min-h-screen bg-gray-100 dark:bg-neutral-900">
        <UserSidebar />
        <UserSidebarMobile />
        <main className="flex-1 p-6 md:p-8 md:ml-64 pb-20 md:pb-8">{children}</main>
      </div>
    );
  }
}

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <SessionProvider>
      <DashboardLayoutContent>{children}</DashboardLayoutContent>
    </SessionProvider>
  );
}