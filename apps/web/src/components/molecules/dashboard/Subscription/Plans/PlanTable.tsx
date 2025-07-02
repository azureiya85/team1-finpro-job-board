import React from 'react';
import { Table, TableBody, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import type { SubscriptionPlan } from '@/types/subscription';
import PlanTableRow from './PlanTableRow';

interface PlansTableProps {
  plans: SubscriptionPlan[];
  onEditPlan: (plan: SubscriptionPlan) => void;
  onDeletePlan: (plan: SubscriptionPlan) => void;
}

const PlansTable: React.FC<PlansTableProps> = ({ plans, onEditPlan, onDeletePlan }) => {
  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Plan Name</TableHead>
            <TableHead>Price</TableHead>
            <TableHead>Duration</TableHead>
            <TableHead>Features</TableHead>
            <TableHead>Created</TableHead>
            <TableHead>Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {plans.map((plan) => (
            <PlanTableRow
              key={plan.id}
              plan={plan}
              onEdit={onEditPlan}
              onDelete={onDeletePlan}
            />
          ))}
        </TableBody>
      </Table>
    </div>
  );
};

export default PlansTable;