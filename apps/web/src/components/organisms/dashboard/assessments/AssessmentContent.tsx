'use client';

import Link from 'next/link';
import { BookOpen, CheckSquare, Clock, Info, FileDown, Trophy, Star } from 'lucide-react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ListedAssessment } from '@/types/assessments';
import { UserSubscriptionDetails } from '@/lib/subscription';

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

interface Props {
  assessments: ExtendedListedAssessment[];
  subscription: UserSubscriptionDetails;
}

export default function AssessmentContent({ assessments, subscription }: Props) {
  const handleCertificateDownload = (certificateUrl: string) => {
    if (certificateUrl) {
      window.open(certificateUrl, '_blank');
    }
  };

  const completedAssessments = assessments.filter(assessment => assessment.userAssessment?.isPassed);
  const incompleteAssessments = assessments.filter(assessment => !assessment.userAssessment?.isPassed);

  return (
    <div>
      <h1 className="text-3xl font-bold text-gray-800 mb-2">Skill Assessments</h1>
      <p className="text-muted-foreground mb-6">
        Test your knowledge and earn badges. You can retake assessments you haven&apos;t passed, or download your certificate for completed ones.
      </p>

      {subscription.isActive && (
        <div className={`mb-6 p-4 border rounded-lg flex items-center gap-3 ${subscription.planName === 'PROFESSIONAL' ? 'bg-purple-50 border-purple-200 text-purple-800' : 'bg-blue-50 border-blue-200 text-blue-800'}`}>
          {subscription.planName === 'PROFESSIONAL' ? <Star className="w-5 h-5 text-purple-600" /> : <Info className="w-5 h-5 text-blue-600" />}
          <p className="text-sm">
            You are on the <strong>{subscription.planName}</strong> plan.
            {subscription.limit !== 'unlimited' && (
              <>
                {' '}You have <span className="font-bold">{Math.max(0, subscription.limit - subscription.assessmentsTaken)} / {subscription.limit}</span> assessments remaining in your current period.
              </>
            )}
            {subscription.planName === 'PROFESSIONAL' && ' You have unlimited access to all assessments.'}
          </p>
        </div>
      )}

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
        <>
          {completedAssessments.length > 0 && (
            <div className="mb-8">
              <div className="flex items-center gap-2 mb-4">
                <Trophy className="w-5 h-5 text-green-600" />
                <h2 className="text-xl font-semibold text-gray-800">Completed Assessments</h2>
                <Badge variant="secondary">{completedAssessments.length}</Badge>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {completedAssessments.map((assessment) => (
                  <Card key={assessment.id} className="flex flex-col border-green-200 bg-green-50">
                    <CardHeader>
                      <div className="flex justify-between items-start mb-2">
                          <CardTitle className="text-xl">{assessment.title}</CardTitle>
                          {assessment.category.icon ? <span title={assessment.category.name} className="text-2xl">{assessment.category.icon}</span> : <Badge variant="outline">{assessment.category.name}</Badge>}
                      </div>
                      <CardDescription className="text-sm line-clamp-3">{assessment.description || 'No description available.'}</CardDescription>
                    </CardHeader>
                    <CardContent className="flex-grow">
                      <div className="space-y-2 text-sm text-muted-foreground">
                        <div className="flex items-center gap-2"><CheckSquare className="w-4 h-4 text-primary" /><span>{assessment._count.questions} questions</span></div>
                        <div className="flex items-center gap-2"><Clock className="w-4 h-4 text-primary" /><span>{assessment.timeLimit} minutes time limit</span></div>
                        {assessment.userAssessment?.score && (<div className="flex items-center gap-2"><Trophy className="w-4 h-4 text-green-600" /><span className="text-green-700 font-medium">Score: {assessment.userAssessment.score}%</span></div>)}
                        {assessment.userAssessment?.completedAt && (<div className="text-xs text-muted-foreground">Completed: {new Date(assessment.userAssessment.completedAt).toLocaleDateString()}</div>)}
                      </div>
                    </CardContent>
                    <CardFooter>
                      <Button className="w-full bg-green-600 hover:bg-green-700" onClick={() => handleCertificateDownload(assessment.userAssessment?.certificate?.certificateUrl || '')} disabled={!assessment.userAssessment?.certificate?.certificateUrl}><FileDown className="w-4 h-4 mr-2" />Download Certificate</Button>
                    </CardFooter>
                  </Card>
                ))}
              </div>
            </div>
          )}

          {incompleteAssessments.length > 0 && (
            <div>
              <div className="flex items-center gap-2 mb-4">
                <BookOpen className="w-5 h-5 text-primary-600" />
                <h2 className="text-xl font-semibold text-gray-800">Available Assessments</h2>
                <Badge variant="secondary">{incompleteAssessments.length}</Badge>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {incompleteAssessments.map((assessment) => {
                  const isQuotaExceeded = !subscription.isActive || (subscription.limit !== 'unlimited' && subscription.assessmentsTaken >= subscription.limit);
                  return (
                    <Card key={assessment.id} className="flex flex-col">
                      <CardHeader>
                        <div className="flex justify-between items-start mb-2">
                          <CardTitle className="text-xl">{assessment.title}</CardTitle>
                          {assessment.category.icon ? <span title={assessment.category.name} className="text-2xl">{assessment.category.icon}</span> : <Badge variant="outline">{assessment.category.name}</Badge>}
                        </div>
                        <CardDescription className="text-sm line-clamp-3">{assessment.description || 'No description available.'}</CardDescription>
                      </CardHeader>
                      <CardContent className="flex-grow">
                        <div className="space-y-2 text-sm text-muted-foreground">
                          <div className="flex items-center gap-2"><CheckSquare className="w-4 h-4 text-primary" /><span>{assessment._count.questions} questions</span></div>
                          <div className="flex items-center gap-2"><Clock className="w-4 h-4 text-primary" /><span>{assessment.timeLimit} minutes time limit</span></div>
                          {assessment.userAssessment && !assessment.userAssessment.isPassed && (<div className="flex items-center gap-2"><Info className="w-4 h-4 text-orange-500" /><span className="text-orange-700 font-medium">Previous attempt: {assessment.userAssessment.score}% (Retake available)</span></div>)}
                        </div>
                      </CardContent>
                      <CardFooter>
                        {assessment._count.questions !== 25 ? (
                          <Button disabled className="w-full">
                            Unavailable (Admin Config)
                          </Button>
                        ) : (
                          <Button asChild className={`w-full ${isQuotaExceeded || !subscription.isActive ? 'bg-accent hover:bg-accent/90' : ''}`}>
                            <Link href={
                              isQuotaExceeded || !subscription.isActive
                                ? '/dashboard/subscriptions'
                                : `/dashboard/assessments/${assessment.id}`
                            }>
                              {!subscription.isActive
                                ? 'Subscribe To Take Assessment'
                                : isQuotaExceeded
                                  ? 'Upgrade to Pro to Continue'
                                  : assessment.userAssessment && !assessment.userAssessment.isPassed
                                    ? "Retake Assessment"
                                    : "Start Assessment"
                              }
                            </Link>
                          </Button>
                        )}
                      </CardFooter>
                      {assessment._count.questions !== 25 && (
                        <p className="text-xs text-destructive text-center px-6 pb-2 -mt-2"><Info size={12} className="inline mr-1"/>This assessment is currently unavailable due to incorrect question count.</p>
                      )}
                    </Card>
                  );
                })}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}