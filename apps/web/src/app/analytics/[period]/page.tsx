'use client';

import { use, useEffect, useState } from 'react';
import { useAuthStore } from '@/stores/authStores'; 
import { UserRole } from '@prisma/client';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Shield, Home, AlertTriangle } from 'lucide-react';
import { useRouter } from 'next/navigation';
import AnalyticsTemplate from '@/components/templates/analytics/AnalyticsTemplate';

interface PageProps {
  params: Promise<{
    period: 'salary' | 'demographics' | 'interests' | 'location' | 'applications';
  }>;
}

export default function AnalyticsDetailPage({ params }: PageProps) {
  const { period } = use(params);
  const { user, isAuthenticated, isLoading } = useAuthStore();
  const [mounted, setMounted] = useState(false);
  const router = useRouter();

  useEffect(() => {
    setMounted(true);
  }, []);

  const titleMap: Record<typeof period, string> = {
    salary: 'Salary Trends',
    demographics: 'Applicant Demographics',
    interests: 'Applicant Interests',
    location: 'Location Distribution',
    applications: 'Applications Per Job',
  };

  // Handle hydration
  if (!mounted) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  // Show loading state
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  // Check if user is authenticated and has proper role
  const hasAccess = isAuthenticated && 
    user && 
    (user.role === UserRole.ADMIN || user.role === UserRole.Developer);

  if (!hasAccess) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardContent className="pt-6">
            <div className="flex flex-col items-center text-center space-y-4">
              <div className="flex items-center justify-center w-16 h-16 bg-red-100 rounded-full">
                <Shield className="w-8 h-8 text-red-600" />
              </div>
              
              <div className="space-y-2">
                <h2 className="text-2xl font-bold text-gray-900">
                  Access Denied
                </h2>
                <p className="text-gray-600">
                  {!isAuthenticated 
                    ? "You need to be logged in to access this page."
                    : "You don't have permission to view analytics. Only administrators can access this section."
                  }
                </p>
              </div>

              <Alert className="w-full">
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription>
                  This page is restricted to authorized personnel only.
                </AlertDescription>
              </Alert>

              <div className="flex flex-col sm:flex-row gap-3 w-full">
                <Button 
                  onClick={() => router.push('/')}
                  className="flex items-center justify-center gap-2 flex-1"
                >
                  <Home className="w-4 h-4" />
                  Go to Home Page
                </Button>
                
                {!isAuthenticated && (
                  <Button 
                    variant="outline"
                    onClick={() => router.push('/auth/login')}
                    className="flex-1"
                  >
                    Sign In
                  </Button>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // User has access, render the analytics page
  return (
    <AnalyticsTemplate
      title={titleMap[period]}
      metricType={period}
    />
  );
}