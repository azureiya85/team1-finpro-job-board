'use client';

import { use } from 'react';
import AnalyticsTemplate from '@/components/templates/analytics/AnalyticsTemplate';

interface PageProps {
  params: Promise<{
    period: 'salary' | 'demographics' | 'interests' | 'location';
  }>;
}

export default function AnalyticsDetailPage({ params }: PageProps) {
  const { period } = use(params); // ✅ Gunakan use()

  const titleMap: Record<typeof period, string> = {
    salary: 'Salary Trends',
    demographics: 'Applicant Demographics',
    interests: 'Applicant Interests',
    location: 'Location Distribution',
  };

  return (
    <AnalyticsTemplate
      title={titleMap[period]}
      metricType={period}
    />
  );
}
