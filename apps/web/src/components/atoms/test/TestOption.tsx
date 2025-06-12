'use client'

import { ChangeEvent } from 'react';
import { cn } from '@/lib/utils';

interface TestOptionProps {
  id: string;
  label: string;
  value: string;
  isSelected: boolean;
  onChange: (value: string) => void;
  disabled?: boolean;
}

export function TestOption({ 
  id, 
  label, 
  value, 
  isSelected, 
  onChange,
  disabled = false 
}: TestOptionProps) {
  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    onChange(e.target.value);
  };

  return (
    <div className={cn(
      "flex items-center space-x-2 p-3 rounded-lg transition-colors",
      isSelected ? "bg-primary/5 border border-primary/20" : "hover:bg-gray-50",
      disabled && "opacity-50 cursor-not-allowed"
    )}>
      <input
        type="radio"
        id={id}
        name={id}
        value={value}
        checked={isSelected}
        onChange={handleChange}
        disabled={disabled}
        className="h-4 w-4 text-primary border-gray-300 focus:ring-primary"
      />
      <label 
        htmlFor={id} 
        className={cn(
          "text-sm flex-1 cursor-pointer",
          isSelected ? "text-primary font-medium" : "text-gray-700",
          disabled && "cursor-not-allowed"
        )}
      >
        {label}
      </label>
    </div>
  );
}