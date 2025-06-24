'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import PercentageIndicator from './PercentageIndicator';

interface StatCardProps {
  title: string;
  value: number | string;
  percentage?: number;
  icon?: React.ReactNode;
}

export default function StatCard({ title, value, percentage, icon }: StatCardProps) {
  return (
    <Card className="w-full">
      <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
        <CardTitle className="text-sm font-medium text-muted-foreground">
          {title}
        </CardTitle>
        {icon}
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
        {percentage !== undefined && (
          <div className="mt-1">
            <PercentageIndicator value={percentage} />
          </div>
        )}
      </CardContent>
    </Card>
  );
}
