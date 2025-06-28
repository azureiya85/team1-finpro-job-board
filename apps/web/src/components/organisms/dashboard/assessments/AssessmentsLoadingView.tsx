import { Loader2 } from 'lucide-react';

export function AssessmentLoadingView() {
  return (
    <div className="flex flex-col justify-center items-center h-[calc(100vh-200px)]">
      <Loader2 className="w-12 h-12 animate-spin text-primary mb-4" />
      <p className="text-lg text-muted-foreground">Preparing assessment...</p>
    </div>
  );
}