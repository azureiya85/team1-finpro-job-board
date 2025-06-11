"use client";

import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Progress } from "@/components/ui/progress";
import { AlertCircle, Upload, CheckCircle, X, File, Image as ImageIcon } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useSubscriptionStore } from '@/stores/subscriptionStores';
import { toast } from "sonner"; 
import Image from "next/image"; 

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

export default function SubscriptionPageBankPayment() {
  const {
    paymentDetails,
    proofFile,
    setProofFile,
    uploading,
    setUploading,
  } = useSubscriptionStore();

  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadStatus, setUploadStatus] = useState<'idle' | 'uploading' | 'success' | 'error'>('idle');
  const [uploadedFileInfo, setUploadedFileInfo] = useState<UploadResponse | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  // Handle file selection
  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    setProofFile(file);
    setUploadStatus('idle');
    setUploadedFileInfo(null);
    
    // Create preview for images
    if (file && file.type.startsWith('image/')) {
      const url = URL.createObjectURL(file);
      setPreviewUrl(url);
    } else {
      setPreviewUrl(null);
    }
  };

  // Remove selected file
  const handleRemoveFile = () => {
    setProofFile(null);
    setUploadStatus('idle');
    setUploadedFileInfo(null);
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
      setPreviewUrl(null);
    }
  };

  // Upload file to server
  const handleUpload = async () => {
    if (!proofFile) {
      toast.error("Please select a file first");
      return;
    }

    setUploading(true);
    setUploadStatus('uploading');
    setUploadProgress(0);

    try {
      const formData = new FormData();
      formData.append('file', proofFile);
      formData.append('folder', 'payment-proofs'); 

      // Simulate progress
      const progressInterval = setInterval(() => {
        setUploadProgress(prev => {
          if (prev >= 90) {
            clearInterval(progressInterval);
            return 90;
          }
          return prev + 10;
        });
      }, 200);

      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });

      clearInterval(progressInterval);
      setUploadProgress(100);

      const result: UploadResponse = await response.json();

      if (response.ok && result.success) {
        setUploadStatus('success');
        setUploadedFileInfo(result);
        toast.success("Payment proof uploaded successfully!");

      } else {
        throw new Error(result.error || 'Upload failed');
      }

    } catch (error) {
      console.error('Upload error:', error);
      setUploadStatus('error');
      setUploadProgress(0);
      toast.error(error instanceof Error ? error.message : "Upload failed. Please try again.");
    } finally {
      setUploading(false);
    }
  };

  // Get file icon based on type
  const getFileIcon = (file: File) => {
    if (file.type.startsWith('image/')) {
      return <ImageIcon className="h-4 w-4" />;
    }
    return <File className="h-4 w-4" />;
  };

  // Format file size
  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <>
      {/* File Upload Section */}
      <Card className="border-2 border-dashed border-gray-300 hover:border-gray-400 transition-colors">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Upload className="h-5 w-5" />
            Upload Proof of Transfer
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* File Input */}
          <div>
            <Label htmlFor="proof-upload" className="cursor-pointer">
              <div className="flex items-center justify-center w-full h-32 border-2 border-dashed border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
                {proofFile ? (
                  <div className="text-center">
                    <div className="flex items-center justify-center gap-2 mb-2">
                      {getFileIcon(proofFile)}
                      <span className="font-medium">{proofFile.name}</span>
                    </div>
                    <p className="text-sm text-gray-500">{formatFileSize(proofFile.size)}</p>
                  </div>
                ) : (
                  <div className="text-center">
                    <Upload className="mx-auto h-8 w-8 text-gray-400 mb-2" />
                    <p className="text-sm text-gray-600">Click to select file or drag and drop</p>
                  </div>
                )}
              </div>
            </Label>
            <Input
              id="proof-upload"
              type="file"
              accept=".png,.jpg,.jpeg,.pdf"
              onChange={handleFileSelect}
              className="hidden"
            />
            <p className="text-sm text-muted-foreground mt-2">
              Accepted formats: PNG, JPG, JPEG, PDF (Max 5MB)
            </p>
          </div>

          {/* File Preview/Info */}
          {proofFile && (
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <div className="flex items-center gap-3">
                {previewUrl ? (
                  <Image
                    src={previewUrl}
                    alt={`Preview of ${proofFile.name}`}
                    width={48}
                    height={48}
                    className="object-cover rounded"
                  />
                ) : (
                  <div className="w-12 h-12 bg-gray-200 rounded flex items-center justify-center">
                    <File className="h-6 w-6 text-gray-500" />
                  </div>
                )}
                <div>
                  <p className="font-medium text-sm">{proofFile.name}</p>
                  <p className="text-xs text-gray-500">{formatFileSize(proofFile.size)}</p>
                </div>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleRemoveFile}
                className="text-red-500 hover:text-red-700"
                aria-label="Remove file"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          )}

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
            onClick={handleUpload}
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

      {/* Payment Details for Bank Transfer */}
      {paymentDetails && (
        <Card className="bg-blue-50 border-blue-200 mt-6">
          <CardHeader>
            <CardTitle className="text-lg text-blue-800">Bank Transfer Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label className="text-sm font-medium">Bank</Label>
                <p className="font-mono">{paymentDetails.bankName}</p>
              </div>
              <div>
                <Label className="text-sm font-medium">Account Number</Label>
                <p className="font-mono text-lg">{paymentDetails.accountNumber}</p>
              </div>
              <div>
                <Label className="text-sm font-medium">Account Holder</Label>
                <p>{paymentDetails.accountHolder}</p>
              </div>
              <div>
                <Label className="text-sm font-medium">Amount</Label>
                <p className="font-semibold">IDR {paymentDetails.amount.toLocaleString()}</p>
              </div>
            </div>
            <Separator />
            <div>
              <Label className="text-sm font-medium">Unique Code</Label>
              <p className="font-mono text-xl font-bold text-blue-600">{paymentDetails.uniqueCode}</p>
            </div>
            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{paymentDetails.instructions}</AlertDescription>
            </Alert>
          </CardContent>
        </Card>
      )}
    </>
  );
}