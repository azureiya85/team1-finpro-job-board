import React from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Loader2, Trash2 } from 'lucide-react';
import { SubscriptionPlan } from '@/types/subscription';
import { Alert, AlertDescription } from '@/components/ui/alert';

interface DeleteConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  plan: SubscriptionPlan | null;
  onConfirm: () => void;
  isDeleting: boolean;
}

const DeleteConfirmModal: React.FC<DeleteConfirmModalProps> = ({ isOpen, onClose, plan, onConfirm, isDeleting }) => {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-red-600">
            <Trash2 className="w-5 h-5" />
            Delete Plan
          </DialogTitle>
          <DialogDescription>
            Are you sure you want to delete this plan? This action cannot be undone.
          </DialogDescription>
        </DialogHeader>

        {plan && (
          <div className="py-4">
            <Alert>
              <AlertDescription>
                <strong>Plan:</strong> {plan.name}<br />
                <strong>Price:</strong> ${plan.price.toFixed(2)}<br />
                <strong>Duration:</strong> {plan.duration} days
              </AlertDescription>
            </Alert>
          </div>
        )}

        <div className="flex gap-3">
          <Button
            variant="destructive"
            onClick={onConfirm}
            disabled={isDeleting}
            className="flex-1"
          >
            {isDeleting ? (
              <Loader2 className="w-4 h-4 animate-spin mr-2" />
            ) : (
              <Trash2 className="w-4 h-4 mr-2" />
            )}
            Delete Plan
          </Button>
          <Button
            variant="outline"
            onClick={onClose}
            disabled={isDeleting}
            className="flex-1"
          >
            Cancel
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default DeleteConfirmModal;