import * as React from "react";
import { Input } from "./input";

interface TimePickerProps {
  date: Date;
  setDate: (date: Date) => void;
}

export function TimePicker({ date, setDate }: TimePickerProps) {
  // Format time untuk input
  const timeString = date.toLocaleTimeString('en-US', {
    hour12: false,
    hour: '2-digit',
    minute: '2-digit'
  });

  const handleTimeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const [hours, minutes] = e.target.value.split(':');
    const newDate = new Date(date);
    newDate.setHours(parseInt(hours));
    newDate.setMinutes(parseInt(minutes));
    setDate(newDate);
  };

  return (
    <Input
      type="time"
      value={timeString}
      onChange={handleTimeChange}
      className="w-full"
    />
  );
}