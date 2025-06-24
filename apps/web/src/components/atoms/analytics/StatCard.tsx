'use client';

import { ArrowDownRight, ArrowUpRight } from 'lucide-react';
import { cn } from '@/lib/utils';

interface StatCardProps {
  label: string;
  value: number | string;
  change?: number; // persen
  positive?: boolean; // arah tren
  icon?: React.ReactNode;
  className?: string;
}

export default function StatCard({
  label,
  value,
  change,
  positive = true,
  icon,
  className,
}: StatCardProps) {
  return (
    <div
      className={cn(
        'bg-white dark:bg-gray-900 rounded-xl shadow px-5 py-4 flex items-center justify-between',
        className
      )}
    >
      <div>
        <p className="text-sm text-gray-500 dark:text-gray-400">{label}</p>
        <h3 className="text-2xl font-bold text-gray-900 dark:text-white">
          {value}
        </h3>
        {typeof change === 'number' && (
          <div
            className={cn(
              'flex items-center gap-1 mt-1 text-sm',
              positive ? 'text-green-600' : 'text-red-600'
            )}
          >
            {positive ? <ArrowUpRight size={16} /> : <ArrowDownRight size={16} />}
            <span>{change}%</span>
          </div>
        )}
      </div>
      {icon && (
        <div className="text-gray-400 dark:text-gray-300">{icon}</div>
      )}
    </div>
  );
}
