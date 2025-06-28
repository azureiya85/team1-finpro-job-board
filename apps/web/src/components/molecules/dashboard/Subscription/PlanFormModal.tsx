import React, { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Loader2, Plus, Save, X, Package, DollarSign, Calendar, List } from 'lucide-react';
import { SubscriptionPlan } from '@/stores/subscriptionMgtStores';

export interface PlanFormData {
  name: string;
  price: number;
  duration: number;
  description: string;
  features: string[];
}

interface PlanFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  plan?: SubscriptionPlan | null;
  onSubmit: (data: PlanFormData) => void;
  isSubmitting: boolean;
  mode: 'create' | 'edit';
}

const PlanFormModal: React.FC<PlanFormModalProps> = ({ isOpen, onClose, plan, onSubmit, isSubmitting, mode }) => {
  const [formData, setFormData] = useState<PlanFormData>({
    name: '',
    price: 0,
    duration: 30,
    description: '',
    features: [''],
  });

  useEffect(() => {
    if (plan && mode === 'edit') {
      setFormData({
        name: plan.name,
        price: plan.price,
        duration: plan.duration,
        description: plan.description,
        features: plan.features.length > 0 ? plan.features : [''],
      });
    } else {
      setFormData({
        name: '',
        price: 0,
        duration: 30,
        description: '',
        features: [''],
      });
    }
  }, [plan, mode, isOpen]); // Added isOpen to dependencies to reset form when modal reopens for create

  const handleFeatureChange = (index: number, value: string) => {
    const newFeatures = [...formData.features];
    newFeatures[index] = value;
    setFormData({ ...formData, features: newFeatures });
  };

  const addFeature = () => {
    setFormData({ ...formData, features: [...formData.features, ''] });
  };

  const removeFeature = (index: number) => {
    if (formData.features.length > 1) {
      const newFeatures = formData.features.filter((_, i) => i !== index);
      setFormData({ ...formData, features: newFeatures });
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const filteredFeatures = formData.features.filter(feature => feature.trim() !== '');
    onSubmit({
      ...formData,
      features: filteredFeatures,
    });
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
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

        <form onSubmit={handleSubmit} className="space-y-6">
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
              <Label htmlFor="price">Price (USD) *</Label>
              <div className="relative mt-1">
                <DollarSign className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  id="price"
                  type="number"
                  min="0"
                  step="0.01"
                  value={formData.price}
                  onChange={(e) => setFormData({ ...formData, price: parseFloat(e.target.value) || 0 })}
                  placeholder="0.00"
                  required
                  className="pl-10"
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

          <div>
            <Label className="flex items-center gap-2 mb-3">
              <List className="w-4 h-4" />
              Features
            </Label>
            <div className="space-y-2">
              {formData.features.map((feature, index) => (
                <div key={index} className="flex gap-2">
                  <Input
                    value={feature}
                    onChange={(e) => handleFeatureChange(index, e.target.value)}
                    placeholder={`Feature ${index + 1}`}
                    className="flex-1"
                  />
                  {formData.features.length > 1 && (
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => removeFeature(index)}
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  )}
                </div>
              ))}
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={addFeature}
                className="w-full"
              >
                <Plus className="w-4 h-4 mr-2" />
                Add Feature
              </Button>
            </div>
          </div>

          <div className="flex gap-3 pt-4">
            <Button
              type="submit"
              disabled={isSubmitting}
              className="flex-1"
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
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default PlanFormModal;