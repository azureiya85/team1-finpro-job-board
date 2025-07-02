import React from 'react';
import { TableCell, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Edit2, Trash2, Calendar } from 'lucide-react';
import { format } from 'date-fns';
import type { SubscriptionPlan } from '@/types/subscription';
import { getShortDisplayableFeatures } from '@/lib/planFeaturesUtils';

interface PlanTableRowProps {
  plan: SubscriptionPlan;
  onEdit: (plan: SubscriptionPlan) => void;
  onDelete: (plan: SubscriptionPlan) => void;
}

const PlanTableRow: React.FC<PlanTableRowProps> = ({ plan, onEdit, onDelete }) => {
  const featuresList = getShortDisplayableFeatures(plan.features);

  return (
    <TableRow key={plan.id}>
      <TableCell>
        <div className="flex flex-col">
          <span className="font-medium">{plan.name}</span>
          {plan.description && (
            <span className="text-sm text-gray-500 line-clamp-2" title={plan.description}>
              {plan.description}
            </span>
          )}
        </div>
      </TableCell>
      <TableCell>
        <div className="flex items-baseline gap-1">
          <span className="text-sm font-semibold">IDR</span>
          <span className="font-medium">{plan.price.toLocaleString('id-ID')}</span>
        </div>
      </TableCell>
      <TableCell>
        <div className="flex items-center gap-1">
          <Calendar className="w-4 h-4" />
          <span>{plan.duration} days</span>
        </div>
      </TableCell>
      <TableCell>
        <div className="flex flex-wrap gap-1">
          {featuresList.slice(0, 2).map((feature, index) => (
            <Badge key={index} variant="secondary" className="text-xs">
              {feature}
            </Badge>
          ))}
          {featuresList.length > 2 && (
            <Badge variant="outline" className="text-xs">
              +{featuresList.length - 2} more
            </Badge>
          )}
          {featuresList.length === 0 && (
            <span className="text-xs text-gray-500">No features</span>
          )}
        </div>
      </TableCell>
      <TableCell>
        <span className="text-sm">
          {format(new Date(plan.createdAt), 'MMM dd, yyyy')}
        </span>
      </TableCell>
      <TableCell>
        <div className="flex gap-2">
          <Button
            size="sm"
            variant="outline"
            onClick={() => onEdit(plan)}
          >
            <Edit2 className="w-4 h-4" />
          </Button>
          <Button
            size="sm"
            variant="destructive"
            onClick={() => onDelete(plan)}
          >
            <Trash2 className="w-4 h-4" />
          </Button>
        </div>
      </TableCell>
    </TableRow>
  );
};

export default PlanTableRow;