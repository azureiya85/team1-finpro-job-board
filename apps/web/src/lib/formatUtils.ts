import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"
import { formatDistanceToNowStrict, formatDistanceToNow } from 'date-fns';
import { id as IndonesianLocale } from 'date-fns/locale';
import { Plan } from '@/types/subscription';
import { EmploymentType, ExperienceLevel } from '@prisma/client';
import { employmentTypeLabels, experienceLevelLabels } from '@/lib/jobConstants';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatRelativeDate(date: Date | string | undefined): string {
  if (!date) return '';
  try {
    return formatDistanceToNowStrict(new Date(date), { 
      addSuffix: true,
      locale: IndonesianLocale 
    });
  } catch (error) {
    console.error("Error formatting date:", error);
    return 'Invalid date';
  }
}

export function formatSalary(min?: number | null, max?: number | null, currency?: string | null): string {
  if (min && max) {
    return `${currency || 'IDR'} ${min / 1000000}jt - ${max / 1000000}jt`;
  }
  if (min) {
    return `${currency || 'IDR'} ${min / 1000000}jt`;
  }
  if (max) { 
    return `Up to ${currency || 'IDR'} ${max / 1000000}jt`;
  }
  return "Competitive";
}

export function formatJobSalary(minSalary?: number | null, maxSalary?: number | null): string { 
  const formatNumber = (num: number) => num.toLocaleString('id-ID');

  if (minSalary && maxSalary) {
    if (minSalary === maxSalary) return `Rp ${formatNumber(minSalary)}`;
    return `Rp ${formatNumber(minSalary)} - Rp ${formatNumber(maxSalary)}`;
  }
  if (minSalary) return `Rp ${formatNumber(minSalary)}+`;
  if (maxSalary) return `Up to Rp ${formatNumber(maxSalary)}`;

  return 'Competitive';
}

export function formatJobType(type: EmploymentType): string {
  return employmentTypeLabels[type] || type;
}

export function formatExperienceLevel(level: ExperienceLevel): string {
  return experienceLevelLabels[level] || level;
}

export function formatJobPostedDate(date: Date | string): string {
  return formatDistanceToNow(new Date(date), { addSuffix: true });
}

export function formatDeadlineDate(date: Date | string): string {
  return new Date(date).toLocaleDateString('id-ID', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
}

export function formatEducationLevelDisplay(educationLevel: string | null | undefined): string {
  if (!educationLevel) {
    return 'N/A';
  }
  return educationLevel
    .replace(/_/g, " ")
    .toLowerCase()
    .replace(/\b\w/g, (l) => l.toUpperCase());
}

export function formatEducationLevel(educationLevel: string): string {
  return formatEducationLevelDisplay(educationLevel);
}

export const formatFeatures = (features: Plan['features']): string[] => {
  const featureList: string[] = [];
  
  if (features.cvGenerator) {
    featureList.push("CV Generator Access");
  }
  
  if (features.skillAssessmentLimit) {
    if (features.skillAssessmentLimit === 'unlimited' || features.skillAssessmentLimit === 999) {
      featureList.push("Unlimited Skill Assessments");
    } else {
      featureList.push(`${features.skillAssessmentLimit} Skill Assessments per month`);
    }
  }
  
  if (features.priorityReview) {
    featureList.push("Priority CV Review");
  }
  
  return featureList;
};

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

export const formatEnumKey = (key: string): string => 
  key.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());