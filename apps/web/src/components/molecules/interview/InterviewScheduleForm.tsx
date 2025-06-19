'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Popover, PopoverTrigger } from '@/components/ui/popover';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { cn } from '@/lib/utils';
import { CalendarIcon } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { formatDateTime } from '@/lib/dateTimeUtils';

const interviewFormSchema = z.object({
  scheduledAt: z.date(),
  duration: z.number().min(15, 'Duration must be at least 15 minutes'),
  interviewType: z.enum(['ONLINE', 'ONSITE']),
  location: z.string().optional(),
  notes: z.string().optional(),
});

type InterviewFormData = z.infer<typeof interviewFormSchema>;

interface InterviewSubmitData extends InterviewFormData {
  jobApplicationId: string;
  jobPostingId: string;
  candidateId: string;
}
  
  interface InterviewScheduleFormProps {
    applicationId: string;
    jobId: string;
    candidateId: string;
    defaultValues?: Partial<InterviewFormData>;
    onSubmit: (data: InterviewSubmitData) => void;
    isSubmitting?: boolean;
  }

  export function InterviewScheduleForm({
    applicationId,
    jobId,
    candidateId,
    defaultValues,
    onSubmit,
    isSubmitting
  }: InterviewScheduleFormProps) {
    const form = useForm<InterviewFormData>({
      resolver: zodResolver(interviewFormSchema),
      defaultValues: {
        scheduledAt: new Date(),
        duration: 60,
        interviewType: 'ONLINE',
        ...defaultValues
      }
    });

    const handleSubmit = form.handleSubmit((formData: InterviewFormData) => {
      const submitData: InterviewSubmitData = {
        ...formData,
        jobApplicationId: applicationId,
        jobPostingId: jobId,
        candidateId: candidateId
      };
      onSubmit(submitData);
    });
  
    return (
      <Form {...form}>
      <form onSubmit={handleSubmit} className="space-y-4">
          <FormField
            control={form.control}
            name="scheduledAt"
            render={({ field }) => (
              <FormItem className="flex flex-col">
                <FormLabel>Interview Date & Time</FormLabel>
                <Popover>
                  <PopoverTrigger asChild>
                    <FormControl>
                      <Button
                        variant={"outline"}
                        className={cn(
                          "w-full pl-3 text-left font-normal",
                          !field.value && "text-muted-foreground"
                        )}
                      >
                        {field.value ? (
                          formatDateTime(field.value)
                        ) : (
                          <span>Select date and time</span>
                        )}
                        <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                      </Button>
                    </FormControl>
                  </PopoverTrigger>
                  // ... existing code ...
                </Popover>
                <FormMessage />
              </FormItem>
            )}
          />

        <FormField
          control={form.control}
          name="duration"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Duration (minutes)</FormLabel>
              <FormControl>
                <Input type="number" {...field} onChange={e => field.onChange(+e.target.value)} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="interviewType"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Interview Type</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select interview type" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="ONLINE">Online</SelectItem>
                  <SelectItem value="PHONE">Phone</SelectItem>
                  <SelectItem value="IN_PERSON">In Person</SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="location"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Location</FormLabel>
              <FormControl>
                <Input {...field} placeholder="Meeting link or physical location" />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="notes"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Notes</FormLabel>
              <FormControl>
                <Textarea {...field} placeholder="Additional notes or instructions" />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <Button type="submit" className="w-full" disabled={isSubmitting}>
          {isSubmitting ? "Scheduling..." : "Schedule Interview"}
        </Button>
      </form>
    </Form>
  );
}