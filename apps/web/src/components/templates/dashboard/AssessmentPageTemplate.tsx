'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useAuthStore } from '@/stores/authStores';
import { AlertTriangle, BookOpen, CheckSquare, Clock, Loader2, Info, FileDown } from 'lucide-react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ListedAssessment } from '@/types/assessments';

export default function AssessmentsPageTemplate() {
  const { user } = useAuthStore();
  const [assessments, setAssessments] = useState<ListedAssessment[]>([]);
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
          const data: ListedAssessment[] = await response.json();
          setAssessments(data);
        } catch (err) {
          console.error(err);
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

  if (isLoading) {
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
          {error.includes("subscription required") && (
            <Link href="/dashboard/subscriptions">
               <Button variant="link" className="text-red-700 p-0 h-auto mt-1">Manage Subscription</Button>
            </Link>
          )}
        </div>
      </div>
    );
  }

  return (
    <div>
      <h1 className="text-3xl font-bold text-gray-800 mb-2">Available Skill Assessments</h1>
      <p className="text-muted-foreground mb-6">
        Test your knowledge and earn badges. You can retake assessments you haven&apos;t passed, or download your certificate for completed ones.
      </p>

      {assessments.length === 0 ? (
        <Card>
          <CardContent className="pt-6 text-center">
            <BookOpen className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-gray-700 mb-2">No Assessments Available</h2>
            <p className="text-gray-500">
              There are currently no assessments available for you. Check back later!
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {assessments.map((assessment) => (
            <Card key={assessment.id} className="flex flex-col">
              <CardHeader>
                <div className="flex justify-between items-start mb-2">
                    <CardTitle className="text-xl">{assessment.title}</CardTitle>
                    {assessment.category.icon ? (
                        <span title={assessment.category.name} className="text-2xl">{assessment.category.icon}</span>
                    ) : (
                        <Badge variant="outline">{assessment.category.name}</Badge>
                    )}
                </div>
                <CardDescription className="text-sm line-clamp-3">
                  {assessment.description || 'No description available.'}
                </CardDescription>
              </CardHeader>
              <CardContent className="flex-grow">
                <div className="space-y-2 text-sm text-muted-foreground">
                  <div className="flex items-center gap-2">
                    <CheckSquare className="w-4 h-4 text-primary" />
                    <span>{assessment._count.questions} questions</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4 text-primary" />
                    <span>{assessment.timeLimit} minutes time limit</span>
                  </div>
                </div>
              </CardContent>
              <CardFooter>
                {assessment.userAssessment?.isPassed ? (
                  <Button 
                    className="w-full bg-green-600 hover:bg-green-700"
                    onClick={() => {
                        if (assessment.userAssessment?.certificate?.certificateUrl) {
                            window.open(assessment.userAssessment.certificate.certificateUrl, '_blank');
                        }
                    }}
                    disabled={!assessment.userAssessment?.certificate?.certificateUrl}
                  >
                    <FileDown className="w-4 h-4 mr-2" />
                    Download Certificate
                  </Button>
                ) : (
                  <Link href={`/dashboard/assessments/${assessment.id}`} passHref>
                    <Button asChild className="w-full" disabled={assessment._count.questions !== 25}>
                      <span> 
                        {assessment._count.questions !== 25 ? "Unavailable (Admin Config)" : "Start Assessment"}
                      </span>
                    </Button>
                  </Link>
                )}
              </CardFooter>
              {assessment._count.questions !== 25 && !assessment.userAssessment?.isPassed && (
                <p className="text-xs text-destructive text-center px-6 pb-2 -mt-2">
                  <Info size={12} className="inline mr-1"/>
                  This assessment is currently unavailable due to incorrect question count.
                </p>
              )}
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}