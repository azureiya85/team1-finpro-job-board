import { format, formatDistanceToNow, isAfter, isBefore, addMinutes, addHours } from 'date-fns';

// Format tanggal dan waktu untuk ditampilkan
export function formatDateTime(date: Date): string {
  return format(date, 'EEEE, d MMMM yyyy HH:mm');
}

export function formatDateTimeForAPI(date: Date): string {
  return date.toISOString();
}

interface ValidationResult {
  isValid: boolean;
  error?: string;
}

export function validateInterviewTime(scheduledAt: Date): ValidationResult {
  const now = new Date();
  const minimumScheduleTime = addHours(now, 1);

  if (!isAfter(scheduledAt, now)) {
    return {
      isValid: false,
      error: 'interview time must be in the future'
    };
  }

  if (!isAfter(scheduledAt, minimumScheduleTime)) {
    return {
      isValid: false,
      error: 'Interview time must be at least 1 hour from now'
    };
  }

  return { isValid: true };
}

export function formatDuration(minutes: number): string {
  return `${minutes} minutes`;
}

export function isInterviewPassed(scheduledAt: Date, duration: number): boolean {
  const endTime = addMinutes(scheduledAt, duration);
  return isAfter(new Date(), endTime);
}

export function isInterviewUpcoming(scheduledAt: Date): boolean {
  return isBefore(new Date(), scheduledAt);
}

export function formatRelativeTime(date: Date): string {
  return formatDistanceToNow(date, { addSuffix: true });
}