'use client';

import { useApplicantInterestChart } from '@/hooks/analytics/useApplicantInterestChart';
import ApplicantInterestChart from '@/components/molecules/analytics/ApplicantInterestChart';
import { Skeleton } from '@/components/ui/skeleton';

export default function ApplicantInterestsSection() {
  const { data, isLoading } = useApplicantInterestChart(); // Jika mendukung filter, bisa ditambahkan dari context

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
