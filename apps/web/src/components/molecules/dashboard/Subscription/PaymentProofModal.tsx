import React, { useEffect, useState } from 'react';
import { DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { FileText } from 'lucide-react';
import { Subscription } from '@/types/subscription';

import SubscriptionDetailsCard from '@/components/molecules/dashboard/Subscription/PayProof/SubscriptionDetailsCard';
import PlanFeaturesCard from '@/components/molecules/dashboard/Subscription/PayProof/PlanFeaturesCard';
import PaymentProofSection from '@/components/molecules/dashboard/Subscription/PayProof/PaymentProofSection';
import RejectionFormCard from '@/components/molecules/dashboard/Subscription/PayProof/RejectionFormCard';

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

  useEffect(() => {
    setShowRejectForm(false);
    setRejectionReason('');
  }, [subscription]);

  const handleReject = () => {
    onReject(rejectionReason.trim() === '' ? undefined : rejectionReason.trim());
  };

  const handleShowRejectForm = () => {
    setShowRejectForm(true);
  };

  const handleCancelReject = () => {
    setShowRejectForm(false);
    setRejectionReason('');
  };

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
          <SubscriptionDetailsCard subscription={subscription} />
          <PlanFeaturesCard subscription={subscription} />
        </div>

        {/* Payment Proof & Actions */}
        <div className="space-y-4">
          <PaymentProofSection
            subscription={subscription}
            onApprove={onApprove}
            onReject={handleShowRejectForm}
            approving={approving}
            rejecting={rejecting}
            showRejectForm={showRejectForm}
          />

          {showRejectForm && (
            <RejectionFormCard
              rejectionReason={rejectionReason}
              onReasonChange={setRejectionReason}
              onConfirmReject={handleReject}
              onCancel={handleCancelReject}
              approving={approving}
              rejecting={rejecting}
            />
          )}
        </div>
      </div>
    </DialogContent>
  );
};

export default PaymentProofModal;