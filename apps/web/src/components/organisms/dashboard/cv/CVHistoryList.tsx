'use client';

import { Download, FileText } from 'lucide-react';
import { format } from 'date-fns';
import { Button } from '@/components/ui/button';

interface CvRecord {
  id: string;
  fileName: string | null;
  createdAt: string;
}

interface CvHistoryListProps {
  cvs: CvRecord[];
  isLoading: boolean;
}

const SkeletonLoader = () => (
  <div className="space-y-3">
    {[...Array(2)].map((_, i) => (
      <div key={i} className="flex items-center justify-between p-3 bg-gray-50 rounded-md animate-pulse">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-gray-200 rounded"></div>
          <div className="space-y-1">
            <div className="h-4 bg-gray-200 rounded w-48"></div>
            <div className="h-3 bg-gray-200 rounded w-32"></div>
          </div>
        </div>
        <div className="w-24 h-9 bg-gray-200 rounded-md"></div>
      </div>
    ))}
  </div>
);

export default function CvHistoryList({ cvs, isLoading }: CvHistoryListProps) {
  if (isLoading) {
    return <SkeletonLoader />;
  }

  if (cvs.length === 0) {
    return (
      <div className="text-center py-8 px-4 border-2 border-dashed rounded-lg text-gray-500">
        <p>You haven&lsquo;t generated any CVs yet.</p>
        <p className="text-sm">Click &ldquo;Generate New CV&ldquo; to create your first one.</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {cvs.map(cv => (
        <div key={cv.id} className="flex items-center justify-between p-3 bg-gray-50 hover:bg-gray-100 rounded-md transition-colors">
          <div className="flex items-center gap-3">
            <FileText className="w-6 h-6 text-primary-500" />
            <div>
              <p className="font-medium text-gray-800">{cv.fileName || `CV-${cv.id}`}</p>
              <p className="text-xs text-gray-500">
                Generated on {format(new Date(cv.createdAt), 'MMM d, yyyy HH:mm')}
              </p>
            </div>
          </div>
          <a href={`/api/users/cv/download/${cv.id}`} download>
            <Button variant="outline" size="sm">
              <Download className="mr-2 h-4 w-4" />
              Download
            </Button>
          </a>
        </div>
      ))}
    </div>
  );
}