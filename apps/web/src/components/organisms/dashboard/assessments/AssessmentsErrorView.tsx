'use client';

import { useRouter } from 'next/navigation';
import { AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { useAssessmentStore } from '@/stores/assessmentPageStores';

export function AssessmentErrorView() {
  const router = useRouter();
  const error = useAssessmentStore((state) => state.error);

  return (
    <Card className="max-w-2xl mx-auto mt-10">
      <CardHeader>
        <CardTitle className="text-destructive flex items-center gap-2">
          <AlertTriangle /> Error
        </CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-destructive-foreground">
          {error || 'An unexpected error occurred.'}
        </p>
      </CardContent>
      <CardFooter>
        <Button onClick={() => router.push('/dashboard/assessments')}>
          Back to Assessments
        </Button>
      </CardFooter>
    </Card>
  );
}