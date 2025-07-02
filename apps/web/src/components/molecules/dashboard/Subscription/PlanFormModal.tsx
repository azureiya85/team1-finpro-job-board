import React, { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Loader2, Save, Package } from 'lucide-react';
import { SubscriptionPlan } from '@/types/subscription';

import BasicInfoForm from '@/components/molecules/dashboard/Subscription/Plans/PlanBasicInfoForm';
import FeaturesForm from '@/components/molecules/dashboard/Subscription/Plans/PlanFeatureForm';
import { PlanFormData, PlanFeatures, convertLegacyFeatures } from '@/lib/planFeaturesUtils';

// Re-export types for backward compatibility
export type { PlanFormData, PlanFeatures };

interface PlanFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  plan?: SubscriptionPlan | null;
  onSubmit: (data: PlanFormData) => void;
  isSubmitting: boolean;
  mode: 'create' | 'edit';
}

const PlanFormModal: React.FC<PlanFormModalProps> = ({ 
  isOpen, 
  onClose, 
  plan, 
  onSubmit, 
  isSubmitting, 
  mode 
}) => {
  const [formData, setFormData] = useState<PlanFormData>({
    name: '',
    price: 0,
    duration: 30,
    description: '',
    features: {
      cvGenerator: false,
      skillAssessmentLimit: 0,
      priorityReview: false,
    },
  });

  useEffect(() => {
    if (plan && mode === 'edit') {
      setFormData({
        name: plan.name,
        price: plan.price,
        duration: plan.duration,
        description: plan.description,
        features: convertLegacyFeatures(plan.features),
      });
    } else {
      setFormData({
        name: '',
        price: 0,
        duration: 30,
        description: '',
        features: {
          cvGenerator: false,
          skillAssessmentLimit: 0,
          priorityReview: false,
        },
      });
    }
  }, [plan, mode, isOpen]);

  const handleFormDataChange = (updates: Partial<PlanFormData>) => {
    setFormData(prev => ({ ...prev, ...updates }));
  };

  const handleFeatureChange = (feature: keyof PlanFeatures, value: boolean | number | 'unlimited') => {
    setFormData(prev => ({
      ...prev,
      features: {
        ...prev.features,
        [feature]: value,
      },
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Package className="w-5 h-5" />
            {mode === 'create' ? 'Create New Plan' : 'Edit Plan'}
          </DialogTitle>
          <DialogDescription>
            {mode === 'create' 
              ? 'Create a new subscription plan with custom features and pricing.'
              : 'Update the subscription plan details and features.'
            }
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          <BasicInfoForm 
            formData={formData} 
            onFormDataChange={handleFormDataChange}
          />

          <FeaturesForm 
            features={formData.features}
            onFeatureChange={handleFeatureChange}
          />

          <div className="flex gap-3 pt-4">
            <Button
              type="submit"
              disabled={isSubmitting}
              className="flex-1"
              onClick={handleSubmit}
            >
              {isSubmitting ? (
                <Loader2 className="w-4 h-4 animate-spin mr-2" />
              ) : (
                <Save className="w-4 h-4 mr-2" />
              )}
              {mode === 'create' ? 'Create Plan' : 'Update Plan'}
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={isSubmitting}
              className="flex-1"
            >
              Cancel
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default PlanFormModal;