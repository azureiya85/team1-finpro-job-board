'use client';

import { use } from 'react';
import AnalyticsTemplate from '@/components/templates/analytics/AnalyticsTemplate';

interface PageProps {
  params: Promise<{
    period: 'salary' | 'demographics' | 'interests' | 'location' | 'applications';
  }>;
}

export default function AnalyticsDetailPage({ params }: PageProps) {
  const { period } = use(params);

  const titleMap: Record<typeof period, string> = {
    salary: 'Salary Trends',
    demographics: 'Applicant Demographics',
    interests: 'Applicant Interests',
    location: 'Location Distribution',
    applications: 'Applications Per Job',
  };

  return (
    <AnalyticsTemplate
      title={titleMap[period]}
      metricType={period}
    />
  );
}
