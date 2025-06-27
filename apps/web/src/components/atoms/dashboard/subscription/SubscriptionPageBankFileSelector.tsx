"use client";

import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Upload, X, File, Image as ImageIcon } from "lucide-react";
import { useSubscriptionStore } from '@/stores/subscriptionStores';
import Image from "next/image"; 

export default function SubscriptionPageBankFileSelector() {
  const { proofFile, setProofFile } = useSubscriptionStore();
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  // Handle file selection
  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    setProofFile(file);
    
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
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
      setPreviewUrl(null);
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
    <Card className="border-2 border-dashed border-gray-300 hover:border-gray-400 transition-colors">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Upload className="h-5 w-5" />
          Select Proof of Transfer
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
      </CardContent>
    </Card>
  );
}