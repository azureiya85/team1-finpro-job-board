import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Dialog } from '@/components/ui/dialog';
import { Loader2, CreditCard } from 'lucide-react';
import { useSubscriptionManagementStore, Subscription } from '@/stores/subscriptionMgtStores';

import PaymentProofModal from '@/components/molecules/dashboard/Subscription/PaymentProofModal';
import PendingPaymentsTable from '@/components/molecules/dashboard/Subscription/PendingPaymentsTable';

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
  
  useEffect(() => {
    if (selectedPayment && !pendingPayments.find(p => p.id === selectedPayment.id)) {
      setDialogOpen(false);
    }
  }, [pendingPayments, selectedPayment]);

  const handleViewPayment = (payment: Subscription) => {
    selectPayment(payment);
    setDialogOpen(true);
  };

  const handleApprove = async () => {
    if (!selectedPayment) return;
    await approvePayment(selectedPayment.id);
    // Dialog closing and selectedPayment clearing is handled by useEffect and onOpenChange
  };

  const handleReject = async (reason?: string) => {
    if (!selectedPayment) return;
    await rejectPayment(selectedPayment.id, reason);
  };

  const handleDialogChange = (open: boolean) => {
    setDialogOpen(open);
    if (!open) {
      selectPayment(null); // Clear selected payment when dialog is closed
    }
  };
  
  const handleRetryFetch = () => {
    clearError();
    fetchPendingPayments();
  };

  if (error) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="text-center text-red-600">
            <p>Error loading pending payments: {error}</p>
            <Button onClick={handleRetryFetch} variant="outline" className="mt-2">
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
          Review and approve pending subscription payments. Refresh if needed.
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
            {pendingPayments.length === 0 && !loading ? (
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
                  Refresh List
                </Button>
              </div>
            ) : (
              <Dialog open={dialogOpen} onOpenChange={handleDialogChange}>
                <PendingPaymentsTable 
                  pendingPayments={pendingPayments}
                  onViewPayment={handleViewPayment}
                />
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