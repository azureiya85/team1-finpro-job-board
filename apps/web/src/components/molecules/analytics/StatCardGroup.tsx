'use client';

import StatCard from '@/components/atoms/analytics/StatCard';
import { StatCardItem } from '@/types/analyticsTypes';

interface StatCardGroupProps {
  stats: StatCardItem[];
}

export default function StatCardGroup({ stats }: StatCardGroupProps) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      {stats.map((stat, index) => (
        <StatCard
          key={index}
          label={stat.label}
          value={stat.value}
          change={stat.change}
          positive={stat.positive}
          icon={stat.icon}
        />
      ))}
    </div>
  );
}
