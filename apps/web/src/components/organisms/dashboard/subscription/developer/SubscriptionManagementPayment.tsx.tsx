import React, { useEffect, useState } from 'react';
import Image from 'next/image'; 
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { 
  Loader2, 
  CreditCard, 
  Eye, 
  Check, 
  X, 
  Calendar, 
  User, 
  DollarSign,
  FileText,
  AlertCircle
} from 'lucide-react';
import { useSubscriptionManagementStore, Subscription } from '@/stores/subscriptionMgtStores';
import { format } from 'date-fns';
import { Alert, AlertDescription } from '@/components/ui/alert';

const PaymentProofModal: React.FC<{
  subscription: Subscription;
  onApprove: () => void;
  onReject: (reason?: string) => void;
  approving: boolean;
  rejecting: boolean;
}> = ({ subscription, onApprove, onReject, approving, rejecting }) => {
  const [rejectionReason, setRejectionReason] = useState('');
  const [showRejectForm, setShowRejectForm] = useState(false);
  const [imageError, setImageError] = useState(false);

  useEffect(() => {
    // Reset state when modal opens with a new subscription
    setImageError(false);
    setShowRejectForm(false);
    setRejectionReason('');
  }, [subscription]);

  const handleReject = () => {
    onReject(rejectionReason);
    setRejectionReason('');
    setShowRejectForm(false);
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
    <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
      <DialogHeader>
        <DialogTitle className="flex items-center gap-2">
          <FileText className="w-5 h-5" />
          Payment Review - {subscription.user.name}
        </DialogTitle>
        <DialogDescription>
          Review payment proof and approve or reject the subscription
        </DialogDescription>
      </DialogHeader>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
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

          {/* Plan Features */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Plan Features</CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2">
                {subscription.plan.features.map((feature, index) => (
                  <li key={index} className="flex items-center gap-2 text-sm">
                    <Check className="w-4 h-4 text-green-500" />
                    {feature}
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        </div>

        {/* Payment Proof */}
        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Payment Proof</CardTitle>
            </CardHeader>
            <CardContent>
              {subscription.paymentProof ? (
                <div className="space-y-4">
                  <div className="relative border rounded-lg h-96">
                    {imageError ? (
                      <FallbackUI />
                    ) : (
                      <Image
                        src={subscription.paymentProof}
                        alt="Payment Proof"
                        fill
                        className="object-contain"
                        onError={() => setImageError(true)}
                      />
                    )}
                  </div>
                  
                  <div className="flex gap-2">
                    <Button
                      onClick={onApprove}
                      disabled={approving || rejecting}
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
                <Alert>
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>
                    No payment proof has been uploaded by the user yet.
                  </AlertDescription>
                </Alert>
              )}
            </CardContent>
          </Card>

          {/* Rejection Form */}
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
                  />
                </div>
                
                <div className="flex gap-2">
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

const SubscriptionManagementPayment: React.FC = () => {
  const {
    pendingPayments,
    loading,
    error,
    selectedPayment,
    approving,
    rejecting,
    fetchPendingPayments,
    selectPayment,
    approvePayment,
    rejectPayment,
    clearError,
  } = useSubscriptionManagementStore();

  const [dialogOpen, setDialogOpen] = useState(false);

  useEffect(() => {
    fetchPendingPayments();
  }, [fetchPendingPayments]);
  
  // Close dialog if the selected payment is removed from the list
  useEffect(() => {
      if (selectedPayment && !pendingPayments.find(p => p.id === selectedPayment.id)) {
          setDialogOpen(false);
          selectPayment(null);
      }
  }, [pendingPayments, selectedPayment, selectPayment]);

  const handleViewPayment = (payment: Subscription) => {
    selectPayment(payment);
    setDialogOpen(true);
  };

  const handleApprove = async () => {
    if (!selectedPayment) return;
    await approvePayment(selectedPayment.id);
  };

  const handleReject = async (reason?: string) => {
    if (!selectedPayment) return;
    await rejectPayment(selectedPayment.id, reason);
  };

  if (error) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="text-center text-red-600">
            <p>Error loading pending payments: {error}</p>
            <Button onClick={clearError} variant="outline" className="mt-2">
              Try Again
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center text-xl">
          <CreditCard className="w-5 h-5 mr-2" />
          Subscription Payments
        </CardTitle>
        <CardDescription>
          Review and approve pending subscription payments
        </CardDescription>
      </CardHeader>
      <CardContent>
        {loading && pendingPayments.length === 0 ? (
          <div className="flex justify-center items-center py-12">
            <Loader2 className="w-8 h-8 animate-spin" />
            <span className="ml-2">Loading pending payments...</span>
          </div>
        ) : (
          <>
            {pendingPayments.length === 0 ? (
              <div className="text-center py-12">
                <CreditCard className="w-16 h-16 mx-auto text-gray-300 mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No Pending Payments</h3>
                <p className="text-gray-500">All subscription payments have been processed.</p>
                <Button 
                  onClick={fetchPendingPayments} 
                  variant="outline" 
                  className="mt-4"
                  disabled={loading}
                >
                  {loading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
                  Refresh
                </Button>
              </div>
            ) : (
              <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
                <div className="rounded-md border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>User</TableHead>
                        <TableHead>Plan</TableHead>
                        <TableHead>Amount</TableHead>
                        <TableHead>Payment Method</TableHead>
                        <TableHead>Created</TableHead>
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
                              <span className="text-sm text-gray-500">{payment.user.email}</span>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex flex-col">
                              <span className="font-medium">{payment.plan.name}</span>
                              <span className="text-sm text-gray-500">
                                {payment.plan.duration} days
                              </span>
                            </div>
                          </TableCell>
                          <TableCell>
                            <span className="font-medium">${payment.plan.price.toFixed(2)}</span>
                          </TableCell>
                          <TableCell>
                            <Badge variant="outline">
                              {payment.paymentMethod.replace('_', ' ')}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <Calendar className="w-4 h-4" />
                              <span className="text-sm">
                                {format(new Date(payment.createdAt), 'MMM dd, yyyy')}
                              </span>
                            </div>
                          </TableCell>
                          <TableCell>
                            {payment.paymentProof ? (
                              <Badge variant="default" className="bg-green-500">
                                <FileText className="w-3 h-3 mr-1" />
                                Uploaded
                              </Badge>
                            ) : (
                              <Badge variant="secondary">
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
                                  onClick={() => handleViewPayment(payment)}
                                >
                                  <Eye className="w-4 h-4 mr-2" />
                                  Review
                                </Button>
                              </DialogTrigger>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
                 {selectedPayment && (
                    <PaymentProofModal
                      subscription={selectedPayment}
                      onApprove={handleApprove}
                      onReject={handleReject}
                      approving={approving}
                      rejecting={rejecting}
                    />
                  )}
              </Dialog>
            )}
          </>
        )}
      </CardContent>
    </Card>
  );
};

export default SubscriptionManagementPayment;