'use client';

import { Clock, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { useAssessmentStore } from '@/stores/assessmentPageStores';
import { AssessmentLoadingView } from './AssessmentsLoadingView';

// Helper function
const formatTime = (totalSeconds: number | null): string => {
  if (totalSeconds === null) return '00:00';
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
};

interface AssessmentQuestionViewProps {
    onNext: () => void;
}

export function AssessmentQuestionView({ onNext }: AssessmentQuestionViewProps) {
  const {
    assessmentData,
    currentQuestionIndex,
    timeLeft,
    selectedOption,
    stage,
    setSelectedOption
  } = useAssessmentStore();

  if (!assessmentData || !assessmentData.questions[currentQuestionIndex]) {
    return <AssessmentLoadingView />;
  }

  const currentQuestion = assessmentData.questions[currentQuestionIndex];
  const progress = ((currentQuestionIndex + 1) / assessmentData.questions.length) * 100;
  const options = [
    { label: currentQuestion.optionA, value: 'A' },
    { label: currentQuestion.optionB, value: 'B' },
    { label: currentQuestion.optionC, value: 'C' },
    { label: currentQuestion.optionD, value: 'D' },
  ];
  const isLastQuestion = currentQuestionIndex === assessmentData.questions.length - 1;
  const isSubmitting = stage === 'submitting';

  return (
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
        <RadioGroup value={selectedOption} onValueChange={setSelectedOption} className="space-y-3" disabled={isSubmitting}>
          {options.map((opt) => (
            <div key={opt.value} className="flex items-center space-x-2 p-3 border rounded-md hover:bg-muted has-[:checked]:bg-primary has-[:checked]:text-primary-foreground transition-colors">
              <RadioGroupItem value={opt.value} id={`option-${opt.value}`} />
              <Label htmlFor={`option-${opt.value}`} className="flex-1 cursor-pointer text-base">{opt.label}</Label>
            </div>
          ))}
        </RadioGroup>
      </CardContent>
      <CardFooter className="flex justify-end">
        <Button onClick={onNext} disabled={!selectedOption || isSubmitting}>
          {isSubmitting && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
          {isLastQuestion ? 'Submit Answers' : 'Next Question'}
        </Button>
      </CardFooter>
    </Card>
  );
}