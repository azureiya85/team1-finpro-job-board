'use client';

import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { isInterviewPassed } from '@/lib/dateTimeUtils';
import { InterviewStatus } from '@prisma/client';
import { CalendarCheck, CalendarX, Clock, RefreshCw } from 'lucide-react';

interface InterviewStatusBadgeProps {
  status: InterviewStatus;
  scheduledAt?: Date;
  duration?: number;
  className?: string;
}

const statusConfig = {
  SCHEDULED: {
    label: 'Scheduled',
    icon: Clock,
    variant: 'outline',
  },
  COMPLETED: {
    label: 'Completed',
    icon: CalendarCheck,
    variant: 'success',
  },
  CANCELLED: {
    label: 'Cancelled',
    icon: CalendarX,
    variant: 'destructive',
  },
  RESCHEDULED: {
    label: 'Rescheduled',
    icon: RefreshCw,
    variant: 'warning',
  },
} as const;

export function InterviewStatusBadge({ status, scheduledAt, duration, className }: InterviewStatusBadgeProps) {
  const config = statusConfig[status];
  const Icon = config.icon;
  
  const isOverdue = status === 'SCHEDULED' && 
    scheduledAt && 
    duration && 
    isInterviewPassed(scheduledAt, duration);

  const badgeVariants = {
    outline: 'border-2 border-input bg-background hover:bg-accent hover:text-accent-foreground',
    success: 'border-2 border-green-500/20 bg-green-500/10 text-green-700 dark:text-green-400',
    warning: 'border-2 border-yellow-500/20 bg-yellow-500/10 text-yellow-700 dark:text-yellow-400',
    destructive: 'border-2 border-red-500/20 bg-red-500/10 text-red-700 dark:text-red-400',
  };

  return (
    <Badge
      className={cn(
        'flex items-center gap-1 rounded-md px-2 py-1 text-xs font-medium',
        isOverdue ? badgeVariants.warning : badgeVariants[config.variant],
        className
      )}
    >
      <Icon className="h-3 w-3" />
      <span>{isOverdue ? 'Overdue' : config.label}</span>
    </Badge>
  );
}