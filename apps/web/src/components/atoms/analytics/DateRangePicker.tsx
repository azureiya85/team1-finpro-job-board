'use client';

import { useState } from 'react';

interface DateRangePickerProps {
  startDate?: Date;
  endDate?: Date;
  onChange?: (start: Date, end: Date) => void;
}

export default function DateRangePicker({ onChange }: DateRangePickerProps) {
  const [start, setStart] = useState('');
  const [end, setEnd] = useState('');

  const handleChange = () => {
    if (start && end) {
      onChange?.(new Date(start), new Date(end));
    }
  };

  return (
    <div className="flex items-center gap-1">
      <input
        type="date"
        value={start}
        onChange={(e) => {
          setStart(e.target.value);
          handleChange();
        }}
        className="border rounded px-2 py-1 text-sm"
      />
      <span>to</span>
      <input
        type="date"
        value={end}
        onChange={(e) => {
          setEnd(e.target.value);
          handleChange();
        }}
        className="border rounded px-2 py-1 text-sm"
      />
    </div>
  );
}
