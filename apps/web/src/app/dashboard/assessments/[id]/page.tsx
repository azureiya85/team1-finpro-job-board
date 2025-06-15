'use client';

import { useEffect, useState, useCallback, useMemo, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useAuthStore } from '@/stores/authStores';
import { Loader2, Clock, CheckCircle, XCircle, AlertTriangle, FileDown, Award } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Label } from "@/components/ui/label"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"

interface Question {
  id: string;
  question: string;
  optionA: string;
  optionB: string;
  optionC: string;
  optionD: string;
}

interface AssessmentData {
  assessmentId: string;
  title: string;
  timeLimit: number; // minutes
  questions: Question[];
}

interface Answer {
  questionId: string;
  selectedOption: 'A' | 'B' | 'C' | 'D';
}

interface SubmissionResult {
  score: number;
  isPassed: boolean;
  passingScore: number;
  userAssessmentId: string;
  certificate: {
    id: string;
    certificateCode: string;
    certificateUrl: string | null;
    issueDate: string;
  } | null;
  badgeEarned: boolean;
}

type AssessmentStage = 'loading' | 'taking' | 'submitting' | 'results' | 'error';

export default function TakeAssessmentPage() {
  const params = useParams();
  const router = useRouter();
  const assessmentId = params.id as string;
  const { user } = useAuthStore();

  const [stage, setStage] = useState<AssessmentStage>('loading');
  const [assessmentData, setAssessmentData] = useState<AssessmentData | null>(null);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<Answer[]>([]);
  const [selectedOption, setSelectedOption] = useState<string>('');
  
  const [timeLeft, setTimeLeft] = useState<number | null>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  
  const [submissionResult, setSubmissionResult] = useState<SubmissionResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);

  // Memoize localStorage keys to prevent recalculation
  const lsTimerKey = useMemo(() => 
    user?.id && assessmentId ? `assessment_timer_${assessmentId}_${user.id}` : '',
    [assessmentId, user?.id]
  );
  
  const lsAnswersKey = useMemo(() => 
    user?.id && assessmentId ? `assessment_answers_${assessmentId}_${user.id}` : '',
    [assessmentId, user?.id]
  );

  // Stable handleSubmit function
  // FIX 1: Removed unused 'isAutoSubmit' parameter
  const handleSubmit = useCallback(async () => {
    if (!assessmentData || !user?.id) return;
    
    // Clear timer immediately
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
    
    setStage('submitting');
    setError(null);
    setShowConfirmDialog(false);

    // FIX 2: Changed 'let' to 'const' as 'finalAnswers' is not reassigned
    const finalAnswers = [...answers];
    
    // Add current answer if it exists and hasn't been added yet
    if (selectedOption && currentQuestionIndex < assessmentData.questions.length) {
      const currentQuestionId = assessmentData.questions[currentQuestionIndex].id;
      const existingAnswerIndex = finalAnswers.findIndex(a => a.questionId === currentQuestionId);
      
      const newAnswer: Answer = {
        questionId: currentQuestionId,
        selectedOption: selectedOption as 'A' | 'B' | 'C' | 'D',
      };
      
      if (existingAnswerIndex >= 0) {
        finalAnswers[existingAnswerIndex] = newAnswer;
      } else {
        finalAnswers.push(newAnswer);
      }
    }

    const timeSpentInSeconds = (assessmentData.timeLimit * 60) - (timeLeft ?? 0);
    const timeSpentInMinutes = Math.max(1, Math.ceil(timeSpentInSeconds / 60));

    try {
      const response = await fetch(`/api/users/assessments/${assessmentId}/submit`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ answers: finalAnswers, timeSpent: timeSpentInMinutes }),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `Failed to submit assessment: ${response.statusText}`);
      }
      
      const result: SubmissionResult = await response.json();
      setSubmissionResult(result);
      setStage('results');
      
      // Clean up localStorage
      if (lsTimerKey) localStorage.removeItem(lsTimerKey);
      if (lsAnswersKey) localStorage.removeItem(lsAnswersKey);
    } catch (err) {
      console.error(err);
      setError(err instanceof Error ? err.message : 'An unknown error occurred.');
      setStage('error');
    }
  }, [assessmentData, user?.id, answers, assessmentId, timeLeft, lsTimerKey, lsAnswersKey, selectedOption, currentQuestionIndex]);

  // FIX 3: Refactored initialization useEffect to be compliant with exhaustive-deps rule without causing loops.
  useEffect(() => {
    if (!user?.id || !assessmentId) {
      if (!user?.id) setError("User not authenticated. Please log in.");
      if (!assessmentId) setError("Assessment ID is missing.");
      setStage('error');
      return;
    }

    // If we already have the correct data for this assessment, don't refetch.
    // This guard prevents the effect from re-running its logic after successful initialization.
    if (assessmentData?.assessmentId === assessmentId) {
      return;
    }

    console.log(`Initializing assessment for user ${user.id}, assessment ${assessmentId}`);

    const initializeAssessment = async () => {
      try {
        setError(null);

        let restoredTimer = false;
        let restoredAnswers: Answer[] = [];

        if (lsTimerKey) {
          const savedTimerData = localStorage.getItem(lsTimerKey);
          if (savedTimerData) {
            try {
              const { endTime, assessmentId: storedAssessmentId } = JSON.parse(savedTimerData);
              if (storedAssessmentId === assessmentId) {
                const remaining = Math.max(0, Math.floor((endTime - Date.now()) / 1000));
                setTimeLeft(remaining);
                restoredTimer = true;
                console.log("Timer restored from localStorage:", remaining);
              } else {
                localStorage.removeItem(lsTimerKey);
              }
            } catch (e) {
              console.error("Error parsing timer data", e);
              localStorage.removeItem(lsTimerKey);
            }
          }
        }

        if (lsAnswersKey) {
          const savedAnswersData = localStorage.getItem(lsAnswersKey);
          if (savedAnswersData) {
            try {
              const { assessmentId: storedAssessmentId, answers: parsedAnswers } = JSON.parse(savedAnswersData);
              if (storedAssessmentId === assessmentId && Array.isArray(parsedAnswers)) {
                restoredAnswers = parsedAnswers;
                setAnswers(parsedAnswers);
                console.log("Answers restored from localStorage:", parsedAnswers.length);
              } else {
                localStorage.removeItem(lsAnswersKey);
              }
            } catch (e) {
              console.error("Error parsing answers data", e);
              localStorage.removeItem(lsAnswersKey);
            }
          }
        }

        const response = await fetch(`/api/users/assessments/${assessmentId}/start`, { method: 'POST' });
        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || `Failed to start assessment: ${response.statusText}`);
        }
        
        const data: AssessmentData = await response.json();
        setAssessmentData(data); // Set data, which will prevent this effect from re-running due to the guard clause.
        console.log("Fetched assessmentData:", data.title, "Questions:", data.questions.length);

        if (restoredAnswers.length > 0) {
          setCurrentQuestionIndex(Math.min(restoredAnswers.length, data.questions.length - 1));
        } else {
          setCurrentQuestionIndex(0);
        }

        if (!restoredTimer) {
          const newEndTime = Date.now() + data.timeLimit * 60 * 1000;
          if (lsTimerKey) {
            localStorage.setItem(lsTimerKey, JSON.stringify({ 
              endTime: newEndTime, 
              assessmentId: data.assessmentId 
            }));
          }
          setTimeLeft(data.timeLimit * 60);
          console.log("New timer initialized:", data.timeLimit * 60);
        }

        setStage('taking'); // Transition to the main assessment view.
      } catch (err) {
        console.error("Error initializing assessment:", err);
        setError(err instanceof Error ? err.message : 'An unknown error occurred while starting.');
        setStage('error');
      }
    };

    initializeAssessment();
  }, [user?.id, assessmentId, assessmentData, lsTimerKey, lsAnswersKey]);

  // Timer countdown effect
  useEffect(() => {
    if (stage !== 'taking' || timeLeft === null || timeLeft <= 0) {
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
      
      if (timeLeft === 0 && stage === 'taking') {
        console.log("Timer expired, auto-submitting");
        handleSubmit(); // Call without the now-removed parameter
      }
      return;
    }

    console.log(`Starting timer: stage=${stage}, timeLeft=${timeLeft}`);
    
    timerRef.current = setInterval(() => {
      setTimeLeft((prevTime) => {
        if (prevTime === null || prevTime <= 1) {
          return 0;
        }
        return prevTime - 1;
      });
    }, 1000);

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    };
  }, [stage, timeLeft, handleSubmit]);

  // Update current question's selected option when navigating
  useEffect(() => {
    if (!assessmentData || currentQuestionIndex >= assessmentData.questions.length) {
      setSelectedOption('');
      return;
    }

    const currentQuestionId = assessmentData.questions[currentQuestionIndex].id;
    const existingAnswer = answers.find(a => a.questionId === currentQuestionId);
    setSelectedOption(existingAnswer?.selectedOption || '');
  }, [currentQuestionIndex, assessmentData, answers]);

  const handleNextQuestion = useCallback(() => {
    if (!assessmentData || !selectedOption) return;

    const newAnswer: Answer = {
      questionId: assessmentData.questions[currentQuestionIndex].id,
      selectedOption: selectedOption as 'A' | 'B' | 'C' | 'D',
    };
    
    const updatedAnswers = [...answers.filter(a => a.questionId !== newAnswer.questionId), newAnswer];
    setAnswers(updatedAnswers);
    
    if (lsAnswersKey) {
      localStorage.setItem(lsAnswersKey, JSON.stringify({ 
        assessmentId, 
        answers: updatedAnswers 
      }));
    }

    if (currentQuestionIndex < assessmentData.questions.length - 1) {
      setCurrentQuestionIndex(prev => prev + 1);
    } else {
      setShowConfirmDialog(true);
    }
  }, [assessmentData, selectedOption, currentQuestionIndex, answers, lsAnswersKey, assessmentId]);

  // Render logic
  console.log(`Rendering: stage=${stage}, assessmentData=${!!assessmentData}, error=${error}, timeLeft=${timeLeft}`);

  if (stage === 'loading') {
    return (
      <div className="flex flex-col justify-center items-center h-[calc(100vh-200px)]">
        <Loader2 className="w-12 h-12 animate-spin text-primary mb-4" />
        <p className="text-lg text-muted-foreground">
          Preparing assessment...
        </p>
      </div>
    );
  }

  if (stage === 'error') {
    return (
      <Card className="max-w-2xl mx-auto mt-10">
        <CardHeader>
          <CardTitle className="text-destructive flex items-center gap-2">
            <AlertTriangle /> Error
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-destructive-foreground">{error || 'An unexpected error occurred. Could not load assessment.'}</p>
        </CardContent>
        <CardFooter>
          <Button onClick={() => router.push('/dashboard/assessments')}>Back to Assessments</Button>
        </CardFooter>
      </Card>
    );
  }
  
  if (stage === 'results' && submissionResult) {
    return (
      <Card className="max-w-2xl mx-auto mt-10 shadow-lg">
        <CardHeader className="text-center">
          <div className="mx-auto w-fit mb-4">
          {submissionResult.isPassed ? 
            <CheckCircle className="w-16 h-16 text-green-500" /> :
            <XCircle className="w-16 h-16 text-red-500" />
          }
          </div>
          <CardTitle className="text-2xl">Assessment Completed!</CardTitle>
          <CardDescription>
            {assessmentData?.title} - Results 
          </CardDescription>
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
              <Button 
                className="w-full"
                onClick={() => {
                  if (submissionResult.certificate?.certificateUrl) {
                    window.open(submissionResult.certificate.certificateUrl, '_blank');
                  } else {
                    alert('Certificate PDF is not yet available for download. You can use the code to verify.');
                  }
                }}
              >
                <FileDown className="w-4 h-4 mr-2" />
                Download Certificate
              </Button>
            </div>
          )}
        </CardContent>
        <CardFooter className="flex flex-col gap-3">
          <Button onClick={() => router.push('/dashboard/assessments')} className="w-full">
            Back to Assessments
          </Button>
           <Button variant="outline" onClick={() => router.push('/dashboard')} className="w-full">
            Go to Dashboard
          </Button>
        </CardFooter>
      </Card>
    );
  }

  // Ensure assessmentData and currentQuestion are available for "taking" stage
  if (!assessmentData || !assessmentData.questions[currentQuestionIndex]) {
    return (
      <div className="flex flex-col justify-center items-center h-[calc(100vh-200px)]">
        <Loader2 className="w-12 h-12 animate-spin text-primary mb-4" />
        <p className="text-lg text-muted-foreground">Preparing question...</p>
      </div>
    );
  }

  const currentQuestion = assessmentData.questions[currentQuestionIndex];
  const progress = ((currentQuestionIndex + 1) / assessmentData.questions.length) * 100;
  const options = [
    { label: currentQuestion.optionA, value: 'A' },
    { label: currentQuestion.optionB, value: 'B' },
    { label: currentQuestion.optionC, value: 'C' },
    { label: currentQuestion.optionD, value: 'D' },
  ];

  const formatTime = (totalSeconds: number | null): string => {
    if (totalSeconds === null) return '00:00';
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
  };

  return (
    <div className="max-w-3xl mx-auto py-8 px-4">
      <Card className="shadow-xl">
        <CardHeader>
          <div className="flex justify-between items-center mb-2">
            <CardTitle className="text-2xl">{assessmentData.title}</CardTitle>
            <div className="flex items-center gap-2 text-lg font-semibold text-primary">
              <Clock className="w-5 h-5" />
              <span>{formatTime(timeLeft)}</span>
            </div>
          </div>
          <CardDescription>
            Question {currentQuestionIndex + 1} of {assessmentData.questions.length}
          </CardDescription>
          <Progress value={progress} className="w-full mt-1" />
        </CardHeader>
        <CardContent className="space-y-6 min-h-[250px]">
          <p className="text-lg font-medium leading-relaxed">{currentQuestion.question}</p>
          <RadioGroup 
            value={selectedOption} 
            onValueChange={setSelectedOption}
            className="space-y-3"
          >
            {options.map((opt) => (
              <div key={opt.value} className="flex items-center space-x-2 p-3 border rounded-md hover:bg-muted has-[:checked]:bg-primary has-[:checked]:text-primary-foreground transition-colors">
                <RadioGroupItem value={opt.value} id={`option-${opt.value}`} />
                <Label htmlFor={`option-${opt.value}`} className="flex-1 cursor-pointer text-base">
                  {opt.label}
                </Label>
              </div>
            ))}
          </RadioGroup>
        </CardContent>
        <CardFooter className="flex justify-end">
          <Button 
            onClick={handleNextQuestion} 
            disabled={!selectedOption || stage === 'submitting'}
          >
            {stage === 'submitting' && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
            {currentQuestionIndex < assessmentData.questions.length - 1 ? 'Next Question' : 'Submit Answers'}
          </Button>
        </CardFooter>
      </Card>
      
      <AlertDialog open={showConfirmDialog} onOpenChange={setShowConfirmDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirm Submission</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to submit your answers? You cannot change them after submission.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={stage === 'submitting'}>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={() => handleSubmit()} disabled={stage === 'submitting'}>
              {stage === 'submitting' && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              Submit
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}