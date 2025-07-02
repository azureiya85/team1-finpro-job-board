'use client';

import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { MessageSquare } from 'lucide-react';

interface ApplicationListCoverLetterPreviewProps {
  coverLetter: string | null;
  isOpen: boolean;
  onClose: () => void;
}

export default function ApplicationListCoverLetterPreview({
  coverLetter,
  isOpen,
  onClose
}: ApplicationListCoverLetterPreviewProps) {
  if (!coverLetter) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl h-[85vh] p-0">
        <DialogHeader className="p-2 border-b bg-gray-50/50 mt-2">
          <DialogTitle className="flex items-center">
            <MessageSquare className="w-5 h-5 mr-2" />
            Cover Letter Preview
          </DialogTitle>
        </DialogHeader>
        <div className="p-6 overflow-y-auto h-[calc(85vh-4rem)]">
          <div className="prose prose-sm max-w-none">
            {coverLetter.split('\n').map((paragraph, index) => (
              <p key={index}>{paragraph}</p>
            ))}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}