import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import { 
  Calendar, 
  User, 
  DollarSign,
  AlertCircle,
  Check,
  CreditCard
} from 'lucide-react';
import { Subscription } from '@/types/subscription';
import { format } from 'date-fns';

interface SubscriptionDetailsCardProps {
  subscription: Subscription;
}

const SubscriptionDetailsCard: React.FC<SubscriptionDetailsCardProps> = ({ subscription }) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Subscription Details</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="flex items-center gap-2">
          <User className="w-4 h-4 text-gray-500" />
          <div>
            <span className="font-medium">{subscription.user.name}</span>
            <div className="text-sm text-gray-500">{subscription.user.email}</div>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          <CreditCard className="w-4 h-4 text-gray-500" />
          <div>
            <span className="font-medium">{subscription.plan.name}</span>
            <div className="text-sm text-gray-500">{subscription.plan.duration} days</div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <DollarSign className="w-4 h-4 text-gray-500" />
          <span className="font-medium">IDR {subscription.plan.price.toLocaleString()}</span>
        </div>

        <div className="flex items-center gap-2">
          <Calendar className="w-4 h-4 text-gray-500" />
          <span className="text-sm">
            Created: {format(new Date(subscription.createdAt), 'MMM dd, yyyy HH:mm')}
          </span>
        </div>

        <div>
          <Label className="text-sm font-medium">Payment Method</Label>
          <Badge variant="outline" className="ml-2">
            {subscription.paymentMethod.replace(/_/g, ' ')}
          </Badge>
        </div>

        {subscription.paymentMethod === 'BANK_TRANSFER' ? (
          <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
            <div className="flex items-start gap-2">
              <AlertCircle className="w-4 h-4 text-blue-600 mt-0.5" />
              <div className="text-sm">
                <p className="font-medium text-blue-800">Bank Transfer Payment</p>
                <p className="text-blue-600">This payment requires manual verification of uploaded proof.</p>
              </div>
            </div>
          </div>
        ) : (
          <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
            <div className="flex items-start gap-2">
              <Check className="w-4 h-4 text-green-600 mt-0.5" />
              <div className="text-sm">
                <p className="font-medium text-green-800">Midtrans Payment</p>
                <p className="text-green-600">This payment can be approved/rejected without requiring proof upload.</p>
              </div>
            </div>
          </div>
        )}

        <div>
          <Label className="text-sm font-medium">Current Status</Label>
          <div className="flex gap-2 mt-1">
            <Badge variant={subscription.status === 'ACTIVE' ? 'default' : 'secondary'}>
              {subscription.status}
            </Badge>
            <Badge variant={subscription.paymentStatus === 'COMPLETED' ? 'default' : 'secondary'}>
              {subscription.paymentStatus}
            </Badge>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default SubscriptionDetailsCard;