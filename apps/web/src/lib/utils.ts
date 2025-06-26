import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"
import { formatDistanceToNowStrict, formatDistanceToNow } from 'date-fns';
import { id as IndonesianLocale } from 'date-fns/locale';
import { Plan } from '@/types/subscription';
import { Subscription as PrismaSubscription, SubscriptionPlan, EmploymentType, ExperienceLevel } from '@prisma/client';
import prisma from '@/lib/prisma';
import { v4 as uuidv4 } from 'uuid';
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

// Job-specific formatting functions
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

export function generateShareLinks(jobId: string, jobTitle: string) {
  if (typeof window === 'undefined') return null;
  
  const jobUrl = `${window.location.origin}/jobs/${jobId}`;
  const shareText = `Check out this job opportunity: ${jobTitle}`;
  const encodedUrl = encodeURIComponent(jobUrl);
  const encodedText = encodeURIComponent(shareText);

  return {
    linkedin: `https://www.linkedin.com/shareArticle?mini=true&url=${encodedUrl}&title=${encodedText}`,
    facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`,
    twitter: `https://twitter.com/intent/tweet?url=${encodedUrl}&text=${encodedText}`,
    whatsapp: `https://api.whatsapp.com/send?text=${encodedText}%20${encodedUrl}`,
  };
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
  return educationLevel
    .replace(/_/g, " ")
    .toLowerCase()
    .replace(/\b\w/g, (l) => l.toUpperCase());
}

// Helper function to convert features object to readable array
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
  
  if (features.priorityCvReview) {
    featureList.push("Priority CV Review");
  }
  
  return featureList;
};

// ====== ASSESSMENT & CERTIFICATE UTILITIES ======

export async function generateCertificate(userId: string, userAssessmentId: string, assessmentTitle: string) {
    const certificateCode = uuidv4(); // Unique code
    // TODO: Implement actual PDF generation and upload to a storage (e.g., S3)
    const certificateUrl = `/certificates/placeholder/${certificateCode}.pdf`;
    const qrCodeUrl = `/certificates/qr/${certificateCode}.png`; // Placeholder for QR

    return prisma.certificate.create({
        data: {
            userId,
            userAssessmentId,
            title: `${assessmentTitle} Completion Certificate`,
            certificateCode,
            certificateUrl,
            qrCodeUrl,
            issueDate: new Date(),
        }
    });
}

// ====== SUBSCRIPTION UTILITIES ======

export interface RefundCalculation {
  daysUsed: number;
  daysRemaining: number;
  totalDays: number;
  refundAmount: number;
  refundPercentage: number;
}

export interface SubscriptionWithPlan extends PrismaSubscription {
  plan: SubscriptionPlan;
}

export function calculateRefund(
  subscription: SubscriptionWithPlan,
  cancellationDate: Date = new Date()
): RefundCalculation {
  const startDate = subscription.startDate;
  const endDate = subscription.endDate;
  const planPrice = subscription.plan.price;

  // Calculate days
  const daysUsed = Math.floor((cancellationDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));
  const totalDays = Math.floor((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));
  const daysRemaining = Math.max(0, totalDays - daysUsed);

  // Calculate refund
  const refundPercentage = totalDays > 0 ? (daysRemaining / totalDays) : 0;
  const refundAmount = Math.max(0, planPrice * refundPercentage);

  return {
    daysUsed: Math.max(0, daysUsed),
    daysRemaining,
    totalDays,
    refundAmount: Math.round(refundAmount * 100) / 100, // Round to 2 decimal places
    refundPercentage: Math.round(refundPercentage * 100 * 100) / 100, // Percentage with 2 decimal places
  };
}

export function canCancelSubscription(subscription: PrismaSubscription): { canCancel: boolean; reason?: string } {
  if (subscription.status === 'CANCELLED') {
    return { canCancel: false, reason: 'Subscription is already cancelled' };
  }

  if (subscription.status === 'EXPIRED') {
    return { canCancel: false, reason: 'Cannot cancel an expired subscription' };
  }

  return { canCancel: true };
}

export function getRefundPolicy(subscription: SubscriptionWithPlan): {
  eligibleForRefund: boolean;
  refundType: 'full' | 'partial' | 'none';
  reason?: string;
} {
  const now = new Date();
  const daysSinceStart = Math.floor((now.getTime() - subscription.startDate.getTime()) / (1000 * 60 * 60 * 24));

  if (daysSinceStart <= 3) {
    return { eligibleForRefund: true, refundType: 'full' };
  } else if (daysSinceStart <= 30) {
    return { eligibleForRefund: true, refundType: 'partial' };
  } else {
    return { 
      eligibleForRefund: false, 
      refundType: 'none',
      reason: 'Refund period has expired (30 days)'
    };
  }
}

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

export function generateCancellationMessage(
  subscription: SubscriptionWithPlan,
  refundInfo: RefundCalculation,
  immediateCancel: boolean
): string {
  const planName = subscription.plan.name;
  const endDate = subscription.endDate.toLocaleDateString('id-ID');
  
  if (immediateCancel) {
    if (refundInfo.refundAmount > 0) {
      return `Your ${planName} subscription has been cancelled immediately. You will receive a refund of ${formatCurrency(refundInfo.refundAmount)} for the unused ${refundInfo.daysRemaining} days.`;
    } else {
      return `Your ${planName} subscription has been cancelled immediately.`;
    }
  } else {
    return `Your ${planName} subscription will be cancelled at the end of the current period (${endDate}). You will continue to have access until then.`;
  }
}

export function calculateDistance(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  if (lat1 == null || lon1 == null || lat2 == null || lon2 == null) {
    return Infinity; // Or handle as an error, or a very large number
  }
  const R = 6371; // Radius of the Earth in km
  const dLat = deg2rad(lat2 - lat1);
  const dLon = deg2rad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const distance = R * c; // Distance in km
  return distance;
}

function deg2rad(deg: number): number {
  return deg * (Math.PI / 180);
}