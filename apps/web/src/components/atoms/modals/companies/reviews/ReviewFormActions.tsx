import { CheckCircle2 } from 'lucide-react';

interface CompanyReviewFormActionProps {
  isEditMode: boolean;
  isSubmitting: boolean;
  isValid: boolean;
  onCancel: () => void;
}

export default function CompanyReviewFormAction({ 
  isEditMode, 
  isSubmitting, 
  isValid, 
  onCancel 
}: CompanyReviewFormActionProps) {
  return (
    <div className="flex justify-end gap-3 pt-6 border-t">
      <button 
        type="button" 
        onClick={onCancel}
        disabled={isSubmitting}
        className="px-6 py-2.5 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50"
      >
        Cancel
      </button>
      <button 
        type="submit" 
        disabled={isSubmitting || !isValid}
        className="inline-flex items-center px-6 py-2.5 text-sm font-medium text-white bg-primary-600 border border-transparent rounded-lg hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors shadow-sm"
      >
        {isSubmitting ? (
          <>
            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
            {isEditMode ? 'Updating...' : 'Submitting...'}
          </>
        ) : (
          <>
            <CheckCircle2 className="w-4 h-4 mr-2" />
            {isEditMode ? 'Update Review' : 'Submit Review'}
          </>
        )}
      </button>
    </div>
  );
}