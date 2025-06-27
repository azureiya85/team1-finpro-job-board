"use client";

import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { AlertCircle, Upload, CheckCircle } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useSubscriptionStore } from '@/stores/subscriptionStores';
import { toast } from "sonner"; 
import { subscriptionApi } from '@/services/subscription.service';

interface UploadResponse {
  success: boolean;
  url: string;
  publicId: string;
  originalName: string;
  size: number;
  type: string;
  fileType: 'image' | 'document';
  error?: string;
}

export default function SubscriptionPageBankUploadHandler() {
  const {
    subscription, 
    setSubscription, 
    proofFile,
    uploading,
    setUploading,
  } = useSubscriptionStore();

  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadStatus, setUploadStatus] = useState<'idle' | 'uploading' | 'success' | 'error'>('idle');
  const [uploadedFileInfo, setUploadedFileInfo] = useState<UploadResponse | null>(null);

  // Upload file to server
  const handleUploadAndSubmitProof = async () => {
    if (!proofFile) {
      toast.error("Please select a file first");
      return;
    }
    if (!subscription || subscription.status !== 'PENDING') {
        toast.error("Could not find a pending subscription to submit proof for.");
        return;
    }

    setUploading(true);
    setUploadStatus('uploading');
    setUploadProgress(0); // Reset progress

    try {
      // STEP 1: Upload the file to Cloudinary 
      toast.info("Uploading file to secure storage...");
      const formData = new FormData();
      formData.append('file', proofFile);
      formData.append('folder', 'payment-proofs');

      const uploadResponse = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });

      const uploadResult = await uploadResponse.json();

      if (!uploadResponse.ok || !uploadResult.success) {
        throw new Error(uploadResult.error || 'File upload failed');
      }
      
      toast.success("File uploaded successfully. Submitting for review...");
      setUploadProgress(100);

      // STEP 2: Send the Cloudinary URL to backend to link it
      const linkResponse = await subscriptionApi.uploadPaymentProof({
        subscriptionId: subscription.id,
        paymentProofUrl: uploadResult.url,
      });

      // Update the entire UI by setting the new subscription state
      setSubscription(linkResponse.subscription);
      setUploadStatus('success');
      setUploadedFileInfo(uploadResult);
      toast.success("Payment proof submitted! The admin will review it shortly.");

    } catch (error) {
      console.error('Proof Submission Error:', error);
      setUploadStatus('error');
      setUploadProgress(0);
      toast.error(error instanceof Error ? error.message : "Proof submission failed. Please try again.");
    } finally {
      setUploading(false);
    }
  };

  // Don't render if no file is selected
  if (!proofFile) {
    return null;
  }

  return (
    <Card className="mt-4">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Upload className="h-5 w-5" />
          Upload Proof of Payment
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Upload Progress */}
        {uploadStatus === 'uploading' && (
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Uploading...</span>
              <span className="text-sm text-gray-500">{uploadProgress}%</span>
            </div>
            <Progress value={uploadProgress} className="h-2" />
          </div>
        )}

        {/* Upload Status Messages */}
        {uploadStatus === 'success' && uploadedFileInfo && (
          <Alert className="border-green-200 bg-green-50">
            <CheckCircle className="h-4 w-4 text-green-600" />
            <AlertDescription className="text-green-800">
              File uploaded successfully! Your payment proof has been submitted for review.
            </AlertDescription>
          </Alert>
        )}

        {uploadStatus === 'error' && (
          <Alert className="border-red-200 bg-red-50">
            <AlertCircle className="h-4 w-4 text-red-600" />
            <AlertDescription className="text-red-800">
              Upload failed. Please check your file and try again.
            </AlertDescription>
          </Alert>
        )}

        {/* Upload Button */}
        <Button
          onClick={handleUploadAndSubmitProof}
          disabled={!proofFile || uploading || uploadStatus === 'success'}
          className="w-full"
          size="lg"
        >
          {uploading ? (
            <>
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
              Uploading...
            </>
          ) : uploadStatus === 'success' ? (
            <>
              <CheckCircle className="h-4 w-4 mr-2" />
              Uploaded Successfully
            </>
          ) : (
            <>
              <Upload className="h-4 w-4 mr-2" />
              Upload Proof of Payment
            </>
          )}
        </Button>
      </CardContent>
    </Card>
  );
}