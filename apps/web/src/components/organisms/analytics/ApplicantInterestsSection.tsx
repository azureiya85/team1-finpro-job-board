'use client';

import { AnalyticsFilters } from '@/types/analyticsTypes';
import ApplicantInterestChart from '@/components/molecules/analytics/ApplicantInterestChart';
import { useApplicantInterestChart } from '@/hooks/analytics/useApplicantInterestChart';
import { Skeleton } from '@/components/ui/skeleton';

interface ApplicantInterestsSectionProps {
  filters: AnalyticsFilters;
}

export default function ApplicantInterestsSection({ filters }: ApplicantInterestsSectionProps) {
  const { data, isLoading } = useApplicantInterestChart(); // Pastikan hook mendukung props

  return (
    <section className="space-y-4">
      <h2 className="text-xl font-semibold">Applicant Interests</h2>
      {isLoading ? (
        <Skeleton className="w-full h-[300px] rounded-xl" />
      ) : (
        <ApplicantInterestChart data={data} />
      )}
    </section>
  );
}
