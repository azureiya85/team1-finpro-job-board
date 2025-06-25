import AnalyticsDetailTemplate from '@/components/templates/analytics/AnalyticsDetailTemplate';
import { AnalyticsFilters } from '@/hooks/analytics/useAnalyticsFilters';

interface PageProps {
  params: {
    id: string;
    period: 'salary' | 'demographics' | 'interests' | 'location';
  };
}

export default function AnalyticsDetailPage({ params }: PageProps) {
  const { period } = params;

  const filters: AnalyticsFilters = {
    location: 'all', 
    dateRange: null,
  };

  const titleMap: Record<typeof period, string> = {
    salary: 'Salary Trends',
    demographics: 'Applicant Demographics',
    interests: 'Applicant Interests',
    location: 'Location Distribution',
  };

  return (
    <AnalyticsDetailTemplate
      title={titleMap[period]}
      filters={filters}
      metricType={period}
    />
  );
}
