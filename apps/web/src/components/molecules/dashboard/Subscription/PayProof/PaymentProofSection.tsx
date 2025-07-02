import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Loader2, 
  Check, 
  X, 
  FileText,
  AlertCircle,
  CreditCard
} from 'lucide-react';
import { Subscription } from '@/types/subscription';

interface PaymentProofSectionProps {
  subscription: Subscription;
  onApprove: () => void;
  onReject: () => void;
  approving: boolean;
  rejecting: boolean;
  showRejectForm: boolean;
}

const PaymentProofSection: React.FC<PaymentProofSectionProps> = ({
  subscription,
  onApprove,
  onReject,
  approving,
  rejecting,
  showRejectForm
}) => {
  const [imageError, setImageError] = useState(false);

  useEffect(() => {
    setImageError(false);
  }, [subscription]);

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

  const renderBankTransferProof = () => (
    <div className="space-y-4">
      {subscription.paymentProof ? (
        <>
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
              onClick={onReject}
              disabled={approving || rejecting || showRejectForm}
              variant="destructive"
              className="flex-1"
            >
              <X className="w-4 h-4 mr-2" />
              Reject Payment
            </Button>
          </div>
        </>
      ) : (
        <>
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              No payment proof has been uploaded by the user yet.
            </AlertDescription>
          </Alert>
          
          <div className="flex flex-col sm:flex-row gap-2">
            <Button
              disabled
              className="flex-1 bg-gray-400"
            >
              <Check className="w-4 h-4 mr-2" />
              Approve Payment (Proof Required)
            </Button>
            
            <Button
              onClick={onReject}
              disabled={approving || rejecting || showRejectForm}
              variant="destructive"
              className="flex-1"
            >
              <X className="w-4 h-4 mr-2" />
              Reject Payment
            </Button>
          </div>
        </>
      )}
    </div>
  );

  const renderMidtransPayment = () => (
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
          onClick={onReject}
          disabled={approving || rejecting || showRejectForm}
          variant="destructive"
          className="flex-1"
        >
          <X className="w-4 h-4 mr-2" />
          Reject Payment
        </Button>
      </div>
    </div>
  );

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Payment Proof</CardTitle>
      </CardHeader>
      <CardContent>
        {subscription.paymentMethod === 'BANK_TRANSFER' ? renderBankTransferProof() : renderMidtransPayment()}
      </CardContent>
    </Card>
  );
};

export default PaymentProofSection;