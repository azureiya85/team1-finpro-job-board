'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useAuthStore } from '@/stores/authStores';
import { AlertTriangle, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ListedAssessment } from '@/types/assessments';
import { UserSubscriptionDetails } from '@/lib/subscription';
import AssessmentContent from '@/components/organisms/dashboard/assessments/AssessmentContent';

type ExtendedListedAssessment = ListedAssessment & {
  userAssessment?: {
    isPassed: boolean;
    score?: number;
    completedAt?: string;
    certificate?: {
      certificateUrl: string | null;
      certificateCode?: string;
    } | null;
  } | null;
};

interface AssessmentPageData {
  assessments: ExtendedListedAssessment[];
  subscription: UserSubscriptionDetails;
}

export default function AssessmentPageTemplate() {
  const { user } = useAuthStore();
  const [pageData, setPageData] = useState<AssessmentPageData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (user?.id) {
      const fetchAssessments = async () => {
        setIsLoading(true);
        setError(null);
        try {
          const response = await fetch(`/api/users/assessments`);
          if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error || `Failed to fetch assessments: ${response.statusText}`);
          }
          const data: AssessmentPageData = await response.json();
          setPageData(data);
        } catch (err) {
          setError(err instanceof Error ? err.message : 'An unknown error occurred.');
        } finally {
          setIsLoading(false);
        }
      };
      fetchAssessments();
    } else {
      setIsLoading(false);
      setError("User not authenticated.");
    }
  }, [user?.id]);

  if (isLoading || !pageData) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="w-12 h-12 animate-spin text-primary" />
        <p className="ml-4 text-lg text-muted-foreground">Loading assessments...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 p-6 rounded-lg shadow-sm border border-red-200 text-red-700 flex items-center gap-3">
        <AlertTriangle className="w-6 h-6 text-red-500" />
        <div>
          <h3 className="font-semibold">Error loading assessments</h3>
          <p>{error}</p>
          {error.includes("subscription") && (
            <Link href="/dashboard/subscription">
               <Button variant="link" className="text-red-700 p-0 h-auto mt-1">Manage Subscription</Button>
            </Link>
          )}
        </div>
      </div>
    );
  }

  return (
    <AssessmentContent 
      assessments={pageData.assessments} 
      subscription={pageData.subscription} 
    />
  );
}