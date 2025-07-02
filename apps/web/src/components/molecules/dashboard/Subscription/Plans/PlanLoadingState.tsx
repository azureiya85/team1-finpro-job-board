import React from 'react';
import { Loader2 } from 'lucide-react';

const LoadingState: React.FC = () => {
  return (
    <div className="flex justify-center items-center py-12">
      <Loader2 className="w-8 h-8 animate-spin" />
      <span className="ml-2">Loading plans...</span>
    </div>
  );
};

export default LoadingState;