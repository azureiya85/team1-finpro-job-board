import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Loader2, X } from 'lucide-react';

interface RejectionFormCardProps {
  rejectionReason: string;
  onReasonChange: (reason: string) => void;
  onConfirmReject: () => void;
  onCancel: () => void;
  approving: boolean;
  rejecting: boolean;
}

const RejectionFormCard: React.FC<RejectionFormCardProps> = ({
  rejectionReason,
  onReasonChange,
  onConfirmReject,
  onCancel,
  approving,
  rejecting
}) => {
  return (
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
            onChange={(e) => onReasonChange(e.target.value)}
            placeholder="Provide a reason for rejecting this payment..."
            className="mt-1"
            rows={3}
          />
        </div>
        
        <div className="flex flex-col sm:flex-row gap-2">
          <Button
            onClick={onConfirmReject}
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
            onClick={onCancel}
            variant="outline"
            className="flex-1"
            disabled={approving || rejecting}
          >
            Cancel
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default RejectionFormCard;