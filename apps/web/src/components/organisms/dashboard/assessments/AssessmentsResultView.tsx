'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { CheckCircle, XCircle, FileDown, Award, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { useAssessmentStore } from '@/stores/assessmentPageStores';
import { AssessmentErrorView } from './AssessmentsErrorView';
import { toast } from 'sonner'; 

export function AssessmentResultsView() {
  const router = useRouter();
  const { submissionResult, assessmentData } = useAssessmentStore();
  const [isGenerating, setIsGenerating] = useState(false);

  if (!submissionResult) return <AssessmentErrorView />;

  const handleDownload = async () => {
    if (!submissionResult.certificate?.certificateCode) {
        toast.error('Certificate details are missing.');
        return;
    }
    
    setIsGenerating(true);
    try {
        const response = await fetch(`/api/users/certificates/${submissionResult.certificate.certificateCode}/generate`, {
            method: 'POST',
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error || 'Failed to generate certificate.');
        }

        const data = await response.json();
        if (data.url) {
            window.open(data.url, '_blank');
        } else {
            throw new Error('Could not retrieve certificate URL.');
        }

    } catch (error) {
        console.error('Download error:', error);
        toast.error((error as Error).message);
    } finally {
        setIsGenerating(false);
    }
  };

  return (
    <Card className="max-w-2xl mx-auto mt-10 shadow-lg">
      <CardHeader className="text-center">
        <div className="mx-auto w-fit mb-4">
          {submissionResult.isPassed ? <CheckCircle className="w-16 h-16 text-green-500" /> : <XCircle className="w-16 h-16 text-red-500" />}
        </div>
        <CardTitle className="text-2xl">Assessment Completed!</CardTitle>
        <CardDescription>{assessmentData?.title} - Results</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
         <div className={`p-4 rounded-md text-center font-semibold text-lg ${submissionResult.isPassed ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
          You {submissionResult.isPassed ? 'Passed' : 'Failed'}
        </div>
        <div className="flex justify-between items-center p-3 bg-muted rounded-md">
          <span className="text-muted-foreground">Your Score:</span>
          <span className="font-bold text-2xl">{submissionResult.score}%</span>
        </div>
        <div className="flex justify-between items-center p-3 bg-muted rounded-md">
          <span className="text-muted-foreground">Passing Score:</span>
          <span className="font-bold text-xl">{submissionResult.passingScore}%</span>
        </div>
        {submissionResult.badgeEarned && (
          <div className="flex items-center justify-center p-3 bg-yellow-100 text-yellow-700 rounded-md gap-2">
            <Award className="w-6 h-6"/> 
            <span className="font-semibold">Congratulations! You&apos;ve earned a new badge!</span>
          </div>
        )}
        {submissionResult.isPassed && submissionResult.certificate && (
          <div className="pt-4 border-t">
            <h3 className="font-semibold mb-2 text-center">Your Certificate</h3>
            <p className="text-sm text-muted-foreground text-center mb-3">
              Certificate Code: {submissionResult.certificate.certificateCode}
            </p>
            <Button className="w-full" onClick={handleDownload} disabled={isGenerating}>
              {isGenerating ? (
                <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Generating...</>
              ) : (
                <><FileDown className="w-4 h-4 mr-2" /> Download Certificate</>
              )}
            </Button>
          </div>
        )}
      </CardContent>
      <CardFooter className="flex flex-col gap-3">
        <Button onClick={() => router.push('/dashboard/assessments')} className="w-full">Back to Assessments</Button>
        <Button variant="outline" onClick={() => router.push('/dashboard')} className="w-full">Go to Dashboard</Button>
      </CardFooter>
    </Card>
  );
}