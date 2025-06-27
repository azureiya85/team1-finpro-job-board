'use client';

import { ArrowDown, ArrowUp } from 'lucide-react';
import { cn } from '@/lib/utils';

interface PercentageIndicatorProps {
  value: number;
}

export default function PercentageIndicator({ value }: PercentageIndicatorProps) {
  const isPositive = value >= 0;

  return (
    <div
      className={cn(
        'flex items-center gap-1 text-sm font-medium',
        isPositive ? 'text-green-600' : 'text-red-600'
      )}
    >
      {isPositive ? (
        <ArrowUp className="w-4 h-4" />
      ) : (
        <ArrowDown className="w-4 h-4" />
      )}
      <span>{Math.abs(value)}%</span>
    </div>
  );
}
