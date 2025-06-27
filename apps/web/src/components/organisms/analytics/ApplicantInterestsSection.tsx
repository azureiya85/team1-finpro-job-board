'use client';

import { useApplicantInterestChart } from '@/hooks/analytics/useApplicantInterestChart';
import ApplicantInterestChart from '@/components/molecules/analytics/ApplicantInterestChart';
import { Skeleton } from '@/components/ui/skeleton';

export default function ApplicantInterestsSection() {
  const { data, isLoading } = useApplicantInterestChart();

  return (
    <section className="space-y-4">
      {isLoading ? (
        <Skeleton className="w-full h-[300px] rounded-xl" />
      ) : (
        <ApplicantInterestChart data={data} />
      )}
    </section>
  );
}
