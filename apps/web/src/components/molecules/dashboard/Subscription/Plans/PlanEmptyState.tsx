import React from 'react';
import { Button } from '@/components/ui/button';
import { Package, Plus } from 'lucide-react';

interface EmptyStateProps {
  onCreatePlan: () => void;
}

const EmptyState: React.FC<EmptyStateProps> = ({ onCreatePlan }) => {
  return (
    <div className="text-center py-12">
      <Package className="w-16 h-16 mx-auto text-gray-300 mb-4" />
      <h3 className="text-lg font-medium text-gray-900 mb-2">No Plans Available</h3>
      <p className="text-gray-500 mb-4">Create your first subscription plan to get started.</p>
      <Button onClick={onCreatePlan}>
        <Plus className="w-4 h-4 mr-2" />
        Create First Plan
      </Button>
    </div>
  );
};

export default EmptyState;