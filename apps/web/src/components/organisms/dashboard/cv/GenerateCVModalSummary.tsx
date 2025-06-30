import { FileText, AlertCircle, CheckCircle2} from 'lucide-react';
import { Textarea } from '@/components/ui/textarea';
import { cn } from '@/lib/utils';
import { UseFormRegister, FieldErrors, UseFormWatch } from 'react-hook-form';
import { ExtendedGenerateCvPayload } from './GenerateCVModalForm';

interface GenerateCVModalSummaryProps {
  register: UseFormRegister<ExtendedGenerateCvPayload>;
  errors: FieldErrors<ExtendedGenerateCvPayload>;
  watch: UseFormWatch<ExtendedGenerateCvPayload>;
}

export default function GenerateCVModalSummary({ 
  register, 
  errors, 
  watch 
}: GenerateCVModalSummaryProps) {
  const professionalSummary = watch('professionalSummary');
  const summaryLength = professionalSummary?.length || 0;

  return (
    <div className="space-y-2">
      <div className="flex justify-between items-center">
        <label htmlFor="professionalSummary" className="flex items-center gap-2 text-sm font-medium text-gray-700">
          <FileText className="w-4 h-4" />
          Professional Summary <span className="text-red-500">*</span>
        </label>
        <span className={cn(
          "text-xs px-2 py-1 rounded-full",
          summaryLength < 50 ? "bg-red-100 text-red-600" :
          summaryLength > 1000 ? "bg-red-100 text-red-600" :
          "bg-green-100 text-green-600"
        )}>
          {summaryLength}/1000
        </span>
      </div>
      <Textarea
        id="professionalSummary"
        {...register('professionalSummary')}
        rows={6}
        placeholder="Write a compelling summary of your professional experience, key skills, and career objectives. This will be the first thing employers see on your CV."
        className={cn(
          "resize-none transition-colors",
          errors.professionalSummary ? 'border-red-500 focus:border-red-500' : 'focus:border-primary-500'
        )}
      />
      {errors.professionalSummary && (
        <div className="flex items-center gap-2 text-red-600 text-sm">
          <AlertCircle className="w-4 h-4" />
          {errors.professionalSummary.message}
        </div>
      )}
      {!errors.professionalSummary && summaryLength >= 50 && (
        <div className="flex items-center gap-2 text-green-600 text-sm">
          <CheckCircle2 className="w-4 h-4" />
          Great! Your summary looks good.
        </div>
      )}
    </div>
  );
}