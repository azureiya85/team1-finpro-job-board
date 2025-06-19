import React from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Calendar, CreditCard } from 'lucide-react';
import { type Subscription } from '@/stores/subscriptionMgtStores';
import { formatDistanceToNow, format } from 'date-fns';

interface SubscriptionTableProps {
  subscriptions: Subscription[];
}

const getStatusBadge = (status: Subscription['status']) => {
  const statusConfig = {
    ACTIVE: { variant: 'default' as const, color: 'bg-green-500 hover:bg-green-600' },
    INACTIVE: { variant: 'secondary' as const, color: 'bg-gray-500 hover:bg-gray-600' },
    CANCELLED: { variant: 'destructive' as const, color: 'bg-red-500 hover:bg-red-600' },
    EXPIRED: { variant: 'outline' as const, color: 'bg-orange-500 hover:bg-orange-600 border-orange-500' },
  };

  const config = statusConfig[status] || statusConfig.INACTIVE;
  return (
    <Badge variant={config.variant} className={`text-white ${config.color}`}>
      {status}
    </Badge>
  );
};

const getPaymentStatusBadge = (status: Subscription['paymentStatus']) => {
  const baseClasses = 'text-white text-xs px-2 py-0.5';
  switch (status) {
    case 'COMPLETED':
      return <Badge className={`${baseClasses} bg-green-500 hover:bg-green-600`}>{status}</Badge>;
    case 'PENDING':
      return <Badge className={`${baseClasses} bg-yellow-500 hover:bg-yellow-600`}>{status}</Badge>;
    case 'FAILED':
      return <Badge className={`${baseClasses} bg-red-500 hover:bg-red-600`}>{status}</Badge>;
    default:
      return <Badge variant="secondary">{status}</Badge>;
  }
};

const getExpirationInfo = (subscription: Subscription) => {
  if (subscription.status !== 'ACTIVE' && subscription.status !== 'EXPIRED') return null;
  if (!subscription.endDate) return <span className="text-sm text-gray-500">-</span>;

  const endDate = new Date(subscription.endDate);
  const now = new Date();
  
  if (endDate < now || subscription.status === 'EXPIRED') {
    return (
      <span className="text-red-600 text-xs">
        Expired {formatDistanceToNow(endDate, { addSuffix: true })}
      </span>
    );
  }
  
  return (
    <span className="text-blue-600 text-xs">
      Expires {formatDistanceToNow(endDate, { addSuffix: true })}
    </span>
  );
};

const SubscriptionTable: React.FC<SubscriptionTableProps> = ({ subscriptions }) => {
  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-[200px]">User</TableHead>
            <TableHead className="w-[150px]">Plan</TableHead>
            <TableHead className="w-[100px]">Status</TableHead>
            <TableHead className="w-[150px]">Payment Status</TableHead>
            <TableHead className="w-[150px]">Start Date</TableHead>
            <TableHead className="w-[180px]">Expiration</TableHead>
            <TableHead className="text-right w-[100px]">Price</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {subscriptions.length === 0 ? (
            <TableRow>
              <TableCell colSpan={7} className="text-center py-8 text-gray-500">
                No subscriptions found for the current filters.
              </TableCell>
            </TableRow>
          ) : (
            subscriptions.map((subscription) => (
              <TableRow key={subscription.id}>
                <TableCell>
                  <div className="flex flex-col">
                    <span className="font-medium truncate max-w-[180px]" title={subscription.user.name}>{subscription.user.name}</span>
                    <span className="text-xs text-gray-500 truncate max-w-[180px]" title={subscription.user.email}>{subscription.user.email}</span>
                  </div>
                </TableCell>
                <TableCell>
                  <div className="flex flex-col">
                    <span className="font-medium">{subscription.plan.name}</span>
                    <span className="text-xs text-gray-500">
                      {subscription.plan.duration} days
                    </span>
                  </div>
                </TableCell>
                <TableCell>{getStatusBadge(subscription.status)}</TableCell>
                <TableCell>
                  <div className="flex items-center gap-1">
                    <CreditCard className="w-3.5 h-3.5 text-gray-500" />
                    {getPaymentStatusBadge(subscription.paymentStatus)}
                  </div>
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-1">
                    <Calendar className="w-3.5 h-3.5 text-gray-500" />
                    <span className="text-xs">
                      {format(new Date(subscription.startDate), 'MMM dd, yyyy')}
                    </span>
                  </div>
                </TableCell>
                <TableCell>
                  {getExpirationInfo(subscription)}
                </TableCell>
                <TableCell className="text-right">
                  <span className="font-medium text-sm">
                    ${subscription.plan.price.toFixed(2)}
                  </span>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  );
};

export default SubscriptionTable;