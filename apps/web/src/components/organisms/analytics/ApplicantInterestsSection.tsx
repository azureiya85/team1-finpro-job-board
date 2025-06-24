'use client';

import ApplicantInterestChart from '@/components/molecules/analytics/ApplicantInterestChart';
import { useApplicantInterestChart } from '@/hooks/analytics/useApplicantInterestChart';
import { Skeleton } from '@/components/ui/skeleton';

export default function ApplicantInterestsSection() {
  const { data, isLoading } = useApplicantInterestChart();

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
