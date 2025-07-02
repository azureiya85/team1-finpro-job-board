import React, { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Loader2, Save, Package, Calendar, Settings, Zap, Target, Crown } from 'lucide-react';
import { SubscriptionPlan } from '@/types/subscription';

// Define the structured features interface
export interface PlanFeatures {
  cvGenerator: boolean;
  skillAssessmentLimit: number | 'unlimited';
  priorityReview: boolean;
}

export interface PlanFormData {
  name: string;
  price: number;
  duration: number;
  description: string;
  features: PlanFeatures;
}

interface PlanFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  plan?: SubscriptionPlan | null;
  onSubmit: (data: PlanFormData) => void;
  isSubmitting: boolean;
  mode: 'create' | 'edit';
}

// Helper function to convert legacy string array features to structured features
const convertLegacyFeatures = (features: unknown): PlanFeatures => {
  if (Array.isArray(features)) {
    return {
      cvGenerator: features.includes('CV Generator') || features.includes('cvGenerator'),
      skillAssessmentLimit: features.includes('Unlimited Skill Assessments') ? 'unlimited' : 
                           features.includes('Limited Skill Assessments') ? 5 : 0,
      priorityReview: features.includes('Priority CV Review') || features.includes('priorityReview'),
    };
  } else if (typeof features === 'object' && features !== null) {
    const f = features as Partial<PlanFeatures>;
    return {
      cvGenerator: f.cvGenerator || false,
      skillAssessmentLimit: f.skillAssessmentLimit || 0,
      priorityReview: f.priorityReview || false,
    };
  }
  
  // Default features
  return {
    cvGenerator: false,
    skillAssessmentLimit: 0,
    priorityReview: false,
  };
};

const PlanFormModal: React.FC<PlanFormModalProps> = ({ isOpen, onClose, plan, onSubmit, isSubmitting, mode }) => {
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

  const handleFeatureChange = (feature: keyof PlanFeatures, value: boolean | number | 'unlimited') => {
    setFormData(prev => ({
      ...prev,
      features: {
        ...prev.features,
        [feature]: value,
      },
    }));
  };

  const handleSkillAssessmentLimitChange = (value: string) => {
    const numericValue = value === 'unlimited' ? 'unlimited' : parseInt(value, 10) || 0;
    handleFeatureChange('skillAssessmentLimit', numericValue);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  const getFeatureSummary = () => {
    const { features } = formData;
    const summary = [];
    
    if (features.cvGenerator) summary.push('CV Generator');
    if (features.skillAssessmentLimit === 'unlimited') {
      summary.push('Unlimited Skill Assessments');
    } else if (features.skillAssessmentLimit > 0) {
      summary.push(`${features.skillAssessmentLimit} Skill Assessments`);
    }
    if (features.priorityReview) summary.push('Priority CV Review');
    
    return summary.length > 0 ? summary.join(', ') : 'No features enabled';
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
          {/* Basic Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="name">Plan Name *</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="e.g., Premium Plan"
                required
                className="mt-1"
              />
            </div>

            <div>
              <Label htmlFor="price">Price (IDR) *</Label>
              <div className="relative mt-1">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-gray-500">
                  IDR
                </span>
                <Input
                  id="price"
                  type="number"
                  min="0"
                  step="1"
                  value={formData.price}
                  onChange={(e) => setFormData({ ...formData, price: parseInt(e.target.value, 10) || 0 })}
                  placeholder="50000"
                  required
                  className="pl-12"
                />
              </div>
            </div>
          </div>

          <div>
            <Label htmlFor="duration">Duration (Days) *</Label>
            <div className="relative mt-1">
              <Calendar className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
              <Input
                id="duration"
                type="number"
                min="1"
                value={formData.duration}
                onChange={(e) => setFormData({ ...formData, duration: parseInt(e.target.value) || 30 })}
                placeholder="30"
                required
                className="pl-10"
              />
            </div>
          </div>

          <div>
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Describe what this plan includes..."
              className="mt-1"
              rows={3}
            />
          </div>

          {/* Features Section */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 mb-4">
              <Settings className="w-5 h-5" />
              <Label className="text-base font-semibold">Plan Features</Label>
            </div>

            {/* CV Generator Feature */}
            <div className="flex items-center justify-between p-4 border rounded-lg">
              <div className="flex items-center gap-3">
                <Zap className="w-5 h-5 text-blue-500" />
                <div>
                  <Label className="font-medium">CV Generator</Label>
                  <p className="text-sm text-gray-500">Allow users to generate CV using AI</p>
                </div>
              </div>
              <Switch
                checked={formData.features.cvGenerator}
                onCheckedChange={(checked) => handleFeatureChange('cvGenerator', checked)}
              />
            </div>

            {/* Skill Assessment Limit Feature */}
            <div className="p-4 border rounded-lg space-y-3">
              <div className="flex items-center gap-3">
                <Target className="w-5 h-5 text-green-500" />
                <div>
                  <Label className="font-medium">Skill Assessment Limit</Label>
                  <p className="text-sm text-gray-500">Number of skill assessments allowed</p>
                </div>
              </div>
              <div className="ml-8">
                <Select
                  value={formData.features.skillAssessmentLimit.toString()}
                  onValueChange={handleSkillAssessmentLimitChange}
                >
                  <SelectTrigger className="w-48">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="0">Disabled (0)</SelectItem>
                    <SelectItem value="1">1 Assessment</SelectItem>
                    <SelectItem value="3">3 Assessments</SelectItem>
                    <SelectItem value="5">5 Assessments</SelectItem>
                    <SelectItem value="10">10 Assessments</SelectItem>
                    <SelectItem value="unlimited">Unlimited</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Priority Review Feature */}
            <div className="flex items-center justify-between p-4 border rounded-lg">
              <div className="flex items-center gap-3">
                <Crown className="w-5 h-5 text-yellow-500" />
                <div>
                  <Label className="font-medium">Priority CV Review</Label>
                  <p className="text-sm text-gray-500">Fast-track CV review process</p>
                </div>
              </div>
              <Switch
                checked={formData.features.priorityReview}
                onCheckedChange={(checked) => handleFeatureChange('priorityReview', checked)}
              />
            </div>

            {/* Feature Summary */}
            <div className="p-3 bg-gray-50 rounded-lg">
              <Label className="text-sm font-medium text-gray-700">Feature Summary:</Label>
              <p className="text-sm text-gray-600 mt-1">{getFeatureSummary()}</p>
            </div>
          </div>

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