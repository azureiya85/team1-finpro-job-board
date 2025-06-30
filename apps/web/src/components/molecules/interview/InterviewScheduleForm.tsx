import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { DateTimeField, DurationField, InterviewTypeField } from './InterviewFormFields';
import { InterviewFormData, InterviewScheduleFormProps, interviewFormSchema } from '@/types/interviewTypes';

const defaultFormValues: Partial<InterviewFormData> = {
  scheduledAt: new Date(),
  duration: 60,
  interviewType: 'ONLINE',
  location: '',
  notes: '',
};

export function InterviewScheduleForm({
  applicationId, jobId, candidateId, defaultValues,
  onSubmit, onDelete, isSubmitting, mode
}: InterviewScheduleFormProps) {
  const form = useForm<InterviewFormData>({
    resolver: zodResolver(interviewFormSchema),
    defaultValues: { ...defaultFormValues, ...defaultValues }
  });

  const handleSubmit = form.handleSubmit((data: InterviewFormData) => {
    onSubmit({ ...data, jobApplicationId: applicationId, jobPostingId: jobId, candidateId });
  });

  return (
    <>
      <DialogTitle>{mode === 'create' ? 'Schedule Interview' : 'Reschedule Interview'}</DialogTitle>
      <Form {...form}>
        <form onSubmit={handleSubmit} className="space-y-4">
          <FormField control={form.control} name="scheduledAt" render={({ field }) => <DateTimeField field={field} />} />
          <FormField control={form.control} name="duration" render={({ field }) => <DurationField field={field} />} />
          <FormField control={form.control} name="interviewType" render={({ field }) => <InterviewTypeField field={field} />} />
          <FormField
            control={form.control}
            name="location"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Location</FormLabel>
                <FormControl>
                  <Input placeholder="Meeting link or physical location" {...field} />
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
                  <Textarea placeholder="Additional notes or instructions" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <div className="flex gap-2 justify-end">
            {mode === 'edit' && onDelete && (
              <Button type="button" variant="destructive" onClick={onDelete} disabled={isSubmitting}>
                Delete Interview
              </Button>
            )}
            <Button type="submit" className="flex-1" disabled={isSubmitting}>
              {isSubmitting 
                ? (mode === 'create' ? "Scheduling..." : "Rescheduling...") 
                : (mode === 'create' ? "Schedule Interview" : "Reschedule Interview")
              }
            </Button>
          </div>
        </form>
      </Form>
    </>
  );
}