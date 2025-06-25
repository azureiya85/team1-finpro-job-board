'use client';

import { useAnalyticsFilters } from '@/hooks/analytics/useAnalyticsFilters';
import DateRangePicker from '@/components/atoms/analytics/DateRangePicker';
import FilterGroup from '@/components/molecules/analytics/FilterGroup';
import StatCardGroup from '@/components/molecules/analytics/StatCardGroup';
import SalaryTrendsSection from '@/components/organisms/analytics/SalaryTrendsSection';
import DemographicsSection from '@/components/organisms/analytics/DemographicsSection';
import ApplicantInterestsSection from '@/components/organisms/analytics/ApplicantInterestsSection';
import LocationMapSection from '@/components/organisms/analytics/LocationMapSection';

export default function AnalyticsDashboardTemplate() {
  const { filters, setLocation, setDateRange } = useAnalyticsFilters();

  const filtersWithCompany = {
    ...filters,
  };

  return (
    <div className="space-y-6 m-20">
      {/* Filter Controls */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <DateRangePicker
          onChange={(start, end) => setDateRange(start, end)}
        />
        <FilterGroup
          onDateChange={setDateRange}
          onLocationChange={setLocation}
        />
      </div>

      {/* Stat Cards */}
      <StatCardGroup filters={filtersWithCompany} />

      {/* Sections */}
      <SalaryTrendsSection filters={filters} />
      <DemographicsSection filters={filters} />
      <LocationMapSection filters={filters} />
      <ApplicantInterestsSection filters={filters} />
    </div>
  );
}
