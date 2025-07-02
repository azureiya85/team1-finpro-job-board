import React from 'react';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Settings, Zap, Target, Crown } from 'lucide-react';
import { PlanFeatures, getFeatureSummary } from '@/lib/planFeaturesUtils';

interface FeaturesFormProps {
  features: PlanFeatures;
  onFeatureChange: (feature: keyof PlanFeatures, value: boolean | number | 'unlimited') => void;
}

const FeaturesForm: React.FC<FeaturesFormProps> = ({ features, onFeatureChange }) => {
  const handleSkillAssessmentLimitChange = (value: string) => {
    const numericValue = value === 'unlimited' ? 'unlimited' : parseInt(value, 10) || 0;
    onFeatureChange('skillAssessmentLimit', numericValue);
  };

  return (
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
          checked={features.cvGenerator}
          onCheckedChange={(checked) => onFeatureChange('cvGenerator', checked)}
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
            value={features.skillAssessmentLimit.toString()}
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
          checked={features.priorityReview}
          onCheckedChange={(checked) => onFeatureChange('priorityReview', checked)}
        />
      </div>

      {/* Feature Summary */}
      <div className="p-3 bg-gray-50 rounded-lg">
        <Label className="text-sm font-medium text-gray-700">Feature Summary:</Label>
        <p className="text-sm text-gray-600 mt-1">{getFeatureSummary(features)}</p>
      </div>
    </div>
  );
};

export default FeaturesForm;