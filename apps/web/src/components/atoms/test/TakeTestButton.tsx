'use client'

import { Button } from '@/components/ui/button';
import { ApplicationStatus } from '@prisma/client';

interface TakeTestButtonProps {
  applicationId: string;
  status: ApplicationStatus;
  testCompleted: boolean;
  onTakeTest: () => void;
}

export function TakeTestButton({ applicationId, status, testCompleted, onTakeTest }: TakeTestButtonProps) {
  if (status !== 'TEST_REQUIRED' || testCompleted) return null;

  return (
    <Button 
      onClick={onTakeTest}
      className="w-full mt-2"
      variant="secondary"
    >
      Take Pre-selection Test
    </Button>
  );
}