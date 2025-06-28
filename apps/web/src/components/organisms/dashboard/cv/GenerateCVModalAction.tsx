import { 
  Loader2, 
  FileText
} from 'lucide-react';
import { Button } from '@/components/ui/button';

interface GenerateCVModalActionProps {
  isSubmitting: boolean;
  isValid: boolean;
  onCancel: () => void;
}

export default function GenerateCVModalAction({ 
  isSubmitting, 
  isValid, 
  onCancel 
}: GenerateCVModalActionProps) {
  return (
    <div className="flex justify-end gap-3 pt-6 border-t">
      <Button 
        type="button" 
        variant="outline" 
        onClick={onCancel} 
        disabled={isSubmitting}
        className="min-w-[100px]"
      >
        Cancel
      </Button>
      <Button 
        type="submit" 
        disabled={isSubmitting || !isValid}
        className="min-w-[140px] bg-primary-600 hover:bg-primary-700"
      >
        {isSubmitting ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Generating...
          </>
        ) : (
          <>
            <FileText className="mr-2 h-4 w-4" />
            Generate CV
          </>
        )}
      </Button>
    </div>
  );
}