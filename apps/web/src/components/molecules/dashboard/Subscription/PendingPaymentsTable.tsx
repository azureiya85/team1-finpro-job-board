import React from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { DialogTrigger } from '@/components/ui/dialog';
import { Calendar, FileText, AlertCircle, Eye } from 'lucide-react';
import { Subscription } from '@/types/subscription';
import { format } from 'date-fns';

interface PendingPaymentsTableProps {
  pendingPayments: Subscription[];
  onViewPayment: (payment: Subscription) => void;
}

const PendingPaymentsTable: React.FC<PendingPaymentsTableProps> = ({ pendingPayments, onViewPayment }) => {
  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>User</TableHead>
            <TableHead>Plan</TableHead>
            <TableHead className="hidden sm:table-cell">Amount</TableHead>
            <TableHead className="hidden md:table-cell">Method</TableHead>
            <TableHead className="hidden lg:table-cell">Created</TableHead>
            <TableHead>Proof</TableHead>
            <TableHead>Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {pendingPayments.map((payment) => (
            <TableRow key={payment.id}>
              <TableCell>
                <div className="flex flex-col">
                  <span className="font-medium">{payment.user.name}</span>
                  <span className="text-sm text-gray-500 truncate max-w-[150px]">{payment.user.email}</span>
                </div>
              </TableCell>
              <TableCell>
                <div className="flex flex-col">
                  <span className="font-medium">{payment.plan.name}</span>
                  <span className="text-sm text-gray-500 hidden sm:inline">
                    {payment.plan.duration} days
                  </span>
                </div>
              </TableCell>
              <TableCell className="hidden sm:table-cell">
                <span className="font-medium">${payment.plan.price.toFixed(2)}</span>
              </TableCell>
              <TableCell className="hidden md:table-cell">
                <Badge variant="outline" className="whitespace-nowrap">
                  {payment.paymentMethod.replace('_', ' ')}
                </Badge>
              </TableCell>
              <TableCell className="hidden lg:table-cell">
                <div className="flex items-center gap-1 text-sm">
                  <Calendar className="w-3.5 h-3.5" />
                  {format(new Date(payment.createdAt), 'MMM dd, yyyy')}
                </div>
              </TableCell>
              <TableCell>
                {payment.paymentProof ? (
                  <Badge variant="default" className="bg-green-100 text-green-700 hover:bg-green-200">
                    <FileText className="w-3 h-3 mr-1" />
                    Uploaded
                  </Badge>
                ) : (
                  <Badge variant="secondary" className="bg-yellow-100 text-yellow-700 hover:bg-yellow-200">
                    <AlertCircle className="w-3 h-3 mr-1" />
                    Missing
                  </Badge>
                )}
              </TableCell>
              <TableCell>
                <DialogTrigger asChild>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => onViewPayment(payment)}
                  >
                    <Eye className="w-4 h-4 sm:mr-2" />
                    <span className="hidden sm:inline">Review</span>
                  </Button>
                </DialogTrigger>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};

export default PendingPaymentsTable;