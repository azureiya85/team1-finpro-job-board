import React, { useEffect, useState } from 'react';
import Image from 'next/image';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { 
  Loader2, 
  Check, 
  X, 
  Calendar, 
  User, 
  DollarSign,
  FileText,
  AlertCircle,
  CreditCard
} from 'lucide-react';
import { Subscription } from '@/stores/subscriptionMgtStores';
import { format } from 'date-fns';
import { Alert, AlertDescription } from '@/components/ui/alert';

interface PaymentProofModalProps {
  subscription: Subscription;
  onApprove: () => void;
  onReject: (reason?: string) => void;
  approving: boolean;
  rejecting: boolean;
}

const PaymentProofModal: React.FC<PaymentProofModalProps> = ({ 
  subscription, 
  onApprove, 
  onReject, 
  approving, 
  rejecting 
}) => {
  const [rejectionReason, setRejectionReason] = useState('');
  const [showRejectForm, setShowRejectForm] = useState(false);
  const [imageError, setImageError] = useState(false);

  useEffect(() => {
    setImageError(false);
    setShowRejectForm(false);
    setRejectionReason('');
  }, [subscription]);

  const handleReject = () => {
    onReject(rejectionReason.trim() === '' ? undefined : rejectionReason.trim());
  };

  const FallbackUI = () => (
    <div className="p-4 text-center text-gray-500 flex flex-col items-center justify-center h-full">
      <FileText className="w-12 h-12 mx-auto mb-2" />
      <p>Unable to display image preview.</p>
      {subscription.paymentProof && (
        <a 
          href={subscription.paymentProof}
          target="_blank"
          rel="noopener noreferrer"
          className="text-blue-600 hover:underline mt-2 text-sm"
        >
          Open proof in new tab
        </a>
      )}
    </div>
  );

  return (
    <DialogContent className="max-w-md md:max-w-2xl lg:max-w-4xl max-h-[90vh] overflow-y-auto">
      <DialogHeader>
        <DialogTitle className="flex items-center gap-2">
          <FileText className="w-5 h-5" />
          Payment Review - {subscription.user.name}
        </DialogTitle>
        <DialogDescription>
          Review payment proof and approve or reject the subscription
        </DialogDescription>
      </DialogHeader>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 pt-4">
        {/* Subscription Details */}
        <div className="space-y-4">
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
                <span className="font-medium">${subscription.plan.price.toFixed(2)}</span>
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
                  {subscription.paymentMethod.replace('_', ' ')}
                </Badge>
              </div>

              {/* Payment Method Specific Information */}
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

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Plan Features</CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2">
                {subscription.plan.features.length > 0 ? (
                  subscription.plan.features.map((feature, index) => (
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
        </div>

        {/* Payment Proof & Actions */}
        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Payment Proof</CardTitle>
            </CardHeader>
            <CardContent>
              {/* Conditional rendering based on payment method */}
              {subscription.paymentMethod === 'BANK_TRANSFER' ? (
                // Bank Transfer - Show proof upload section
                subscription.paymentProof ? (
                  <div className="space-y-4">
                    <div className="relative border rounded-lg h-80 sm:h-96">
                      {imageError ? (
                        <FallbackUI />
                      ) : (
                        <Image
                          src={subscription.paymentProof}
                          alt="Payment Proof"
                          fill
                          className="object-contain"
                          onError={() => setImageError(true)}
                          unoptimized 
                        />
                      )}
                    </div>
                    
                    <div className="flex flex-col sm:flex-row gap-2">
                      <Button
                        onClick={onApprove}
                        disabled={approving || rejecting || showRejectForm}
                        className="flex-1 bg-green-600 hover:bg-green-700"
                      >
                        {approving ? (
                          <Loader2 className="w-4 h-4 animate-spin mr-2" />
                        ) : (
                          <Check className="w-4 h-4 mr-2" />
                        )}
                        Approve Payment
                      </Button>
                      
                      <Button
                        onClick={() => setShowRejectForm(true)}
                        disabled={approving || rejecting || showRejectForm}
                        variant="destructive"
                        className="flex-1"
                      >
                        <X className="w-4 h-4 mr-2" />
                        Reject Payment
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <Alert>
                      <AlertCircle className="h-4 w-4" />
                      <AlertDescription>
                        No payment proof has been uploaded by the user yet.
                      </AlertDescription>
                    </Alert>
                    
                    {/* Still allow rejection even without proof for bank transfers */}
                    <div className="flex flex-col sm:flex-row gap-2">
                      <Button
                        disabled
                        className="flex-1 bg-gray-400"
                      >
                        <Check className="w-4 h-4 mr-2" />
                        Approve Payment (Proof Required)
                      </Button>
                      
                      <Button
                        onClick={() => setShowRejectForm(true)}
                        disabled={approving || rejecting || showRejectForm}
                        variant="destructive"
                        className="flex-1"
                      >
                        <X className="w-4 h-4 mr-2" />
                        Reject Payment
                      </Button>
                    </div>
                  </div>
                )
              ) : (
                // Midtrans Payment - No proof required
                <div className="space-y-4">
                  <div className="p-6 text-center border-2 border-dashed border-gray-300 rounded-lg">
                    <CreditCard className="w-12 h-12 mx-auto text-gray-400 mb-2" />
                    <p className="text-gray-600 font-medium">Midtrans Payment</p>
                    <p className="text-sm text-gray-500 mt-1">No proof upload required for this payment method.</p>
                  </div>
                  
                  <div className="flex flex-col sm:flex-row gap-2">
                    <Button
                      onClick={onApprove}
                      disabled={approving || rejecting || showRejectForm}
                      className="flex-1 bg-green-600 hover:bg-green-700"
                    >
                      {approving ? (
                        <Loader2 className="w-4 h-4 animate-spin mr-2" />
                      ) : (
                        <Check className="w-4 h-4 mr-2" />
                      )}
                      Approve Payment
                    </Button>
                    
                    <Button
                      onClick={() => setShowRejectForm(true)}
                      disabled={approving || rejecting || showRejectForm}
                      variant="destructive"
                      className="flex-1"
                    >
                      <X className="w-4 h-4 mr-2" />
                      Reject Payment
                    </Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {showRejectForm && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg text-red-600">Reject Payment</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="rejectionReason">Rejection Reason (Optional)</Label>
                  <Textarea
                    id="rejectionReason"
                    value={rejectionReason}
                    onChange={(e) => setRejectionReason(e.target.value)}
                    placeholder="Provide a reason for rejecting this payment..."
                    className="mt-1"
                    rows={3}
                  />
                </div>
                
                <div className="flex flex-col sm:flex-row gap-2">
                  <Button
                    onClick={handleReject}
                    disabled={approving || rejecting}
                    variant="destructive"
                    className="flex-1"
                  >
                    {rejecting ? (
                      <Loader2 className="w-4 h-4 animate-spin mr-2" />
                    ) : (
                      <X className="w-4 h-4 mr-2" />
                    )}
                    Confirm Rejection
                  </Button>
                  
                  <Button
                    onClick={() => setShowRejectForm(false)}
                    variant="outline"
                    className="flex-1"
                    disabled={approving || rejecting}
                  >
                    Cancel
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </DialogContent>
  );
};

export default PaymentProofModal;