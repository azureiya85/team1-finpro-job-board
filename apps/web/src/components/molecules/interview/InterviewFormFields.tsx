import { FormControl, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Calendar } from '@/components/ui/calendar';
import { TimePicker } from '@/components/ui/time-picker';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { CalendarIcon } from 'lucide-react';
import { cn } from '@/lib/utils';
import { formatDateTime } from '@/lib/dateTimeUtils';
import { addDays } from 'date-fns';
import { ControllerRenderProps } from 'react-hook-form';
import { InterviewFormData } from '@/types/interviewTypes';

export const DateTimeField = ({ field }: { field: ControllerRenderProps<InterviewFormData, 'scheduledAt'> }) => (
  <FormItem className="flex flex-col">
    <FormLabel>Interview Date & Time</FormLabel>
    <FormControl>
      <Popover>
        <PopoverTrigger asChild>
          <Button variant="outline" className={cn("w-full pl-3 text-left font-normal", !field.value && "text-muted-foreground")}>
            {field.value ? formatDateTime(field.value) : "Select date and time"}
            <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align="start">
          <Calendar
            mode="single"
            selected={field.value}
            onSelect={field.onChange}
            disabled={date => date < new Date() || date > addDays(new Date(), 30)}
            className="rounded-t-md"
          />
          <div className="p-3 border-t border-border">
            <TimePicker date={field.value} setDate={field.onChange} />
          </div>
        </PopoverContent>
      </Popover>
    </FormControl>
    <FormMessage />
  </FormItem>
);

export const DurationField = ({ field }: { field: ControllerRenderProps<InterviewFormData, 'duration'> }) => (
  <FormItem>
    <FormLabel>Duration (minutes)</FormLabel>
    <FormControl>
      <Input
        type="number"
        onChange={e => field.onChange(parseInt(e.target.value, 10) || 60)}
        value={field.value}
      />
    </FormControl>
    <FormMessage />
  </FormItem>
);

export const InterviewTypeField = ({ field }: { field: ControllerRenderProps<InterviewFormData, 'interviewType'> }) => (
  <FormItem>
    <FormLabel>Interview Type</FormLabel>
    <FormControl>
      <Select value={field.value} onValueChange={field.onChange}>
        <SelectTrigger><SelectValue /></SelectTrigger>
        <SelectContent>
          <SelectItem value="ONLINE">Online</SelectItem>
          <SelectItem value="ONSITE">Onsite</SelectItem>
        </SelectContent>
      </Select>
    </FormControl>
    <FormMessage />
  </FormItem>
);