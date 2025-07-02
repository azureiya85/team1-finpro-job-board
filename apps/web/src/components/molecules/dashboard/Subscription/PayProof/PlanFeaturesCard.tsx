import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Check } from 'lucide-react';
import { Subscription } from '@/types/subscription';
import { getDisplayableFeatures } from '@/lib/planFeaturesUtils';

interface PlanFeaturesCardProps {
  subscription: Subscription;
}

const PlanFeaturesCard: React.FC<PlanFeaturesCardProps> = ({ subscription }) => {
  const featuresList = getDisplayableFeatures(subscription.plan.features);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Plan Features</CardTitle>
      </CardHeader>
      <CardContent>
        <ul className="space-y-2">
          {featuresList.length > 0 ? (
            featuresList.map((feature, index) => (
              <li key={index} className="flex items-center gap-2 text-sm">
                <Check className="w-4 h-4 text-green-500" />
                {feature}
              </li>
            ))
          ) : (
            <li className="text-sm text-gray-500">No specific features listed for this plan.</li>
          )}
        </ul>
      </CardContent>
    </Card>
  );
};

export default PlanFeaturesCard;