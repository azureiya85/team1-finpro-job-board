import React from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Calendar } from 'lucide-react';
import { PlanFormData } from '@/lib/planFeaturesUtils';

interface BasicInfoFormProps {
  formData: PlanFormData;
  onFormDataChange: (data: Partial<PlanFormData>) => void;
}

const BasicInfoForm: React.FC<BasicInfoFormProps> = ({ formData, onFormDataChange }) => {
  return (
    <div className="space-y-6">
      {/* Basic Information */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <Label htmlFor="name">Plan Name *</Label>
          <Input
            id="name"
            value={formData.name}
            onChange={(e) => onFormDataChange({ name: e.target.value })}
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
              onChange={(e) => onFormDataChange({ price: parseInt(e.target.value, 10) || 0 })}
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
            onChange={(e) => onFormDataChange({ duration: parseInt(e.target.value) || 30 })}
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
          onChange={(e) => onFormDataChange({ description: e.target.value })}
          placeholder="Describe what this plan includes..."
          className="mt-1"
          rows={3}
        />
      </div>
    </div>
  );
};

export default BasicInfoForm;