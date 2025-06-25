'use client';

import { useEffect, useState } from 'react';
import { useAuthStore } from '@/stores/authStores';
import { useApplicationListStore } from '@/stores/ApplicationListStores';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { FileText, Bookmark } from 'lucide-react';

// Application Components
import ApplicationCard, { ApplicationWithDetails } from '@/components/atoms/dashboard/ApplicationCard';
import ApplicationDetailModal from '@/components/atoms/modals/dashboard/ApplicationDetailsModal';

// Saved Job Components
import SavedJobCard, { SavedJobWithDetails } from '@/components/atoms/dashboard/SavedJobCard';
import { Skeleton } from '@/components/ui/skeleton';


// Generic Empty State Component
const EmptyState = ({ icon: Icon, title, message }: { icon: React.ElementType, title: string, message: string }) => (
  <div className="bg-white p-8 rounded-lg shadow-sm border text-center">
    <Icon className="w-16 h-16 text-gray-300 mx-auto mb-4" />
    <h2 className="text-xl font-semibold text-gray-700 mb-2">{title}</h2>
    <p className="text-gray-500">{message}</p>
  </div>
);

// Generic Loading Skeleton
const ListSkeleton = () => (
  <div className="space-y-4">
    <Skeleton className="h-32 w-full rounded-lg" />
    <Skeleton className="h-32 w-full rounded-lg" />
  </div>
);

// Component for Applied Jobs List
function AppliedJobsList() {
  const { user } = useAuthStore();
  const [applications, setApplications] = useState<ApplicationWithDetails[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedApplication, setSelectedApplication] = useState<ApplicationWithDetails | null>(null);

  useEffect(() => {
    if (!user?.id) {
      setIsLoading(false);
      return;
    }
    const fetchApplications = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const response = await fetch(`/api/users/${user.id}/applications`);
        if (!response.ok) throw new Error(`Failed to fetch applications: ${response.statusText}`);
        setApplications(await response.json());
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An unknown error occurred.');
      } finally {
        setIsLoading(false);
      }
    };
    fetchApplications();
  }, [user?.id]);

  if (isLoading) return <ListSkeleton />;
  if (error) return <p className="text-red-500">Error: {error}</p>;

  return (
    <>
      {applications.length === 0 ? (
        <EmptyState icon={FileText} title="No Applications Yet" message="You haven't applied for any jobs. Start exploring!" />
      ) : (
        <div className="space-y-4">
          {applications.map((app) => (
            <ApplicationCard key={app.id} application={app} onViewDetails={setSelectedApplication} />
          ))}
        </div>
      )}
      <ApplicationDetailModal
        application={selectedApplication}
        onClose={() => setSelectedApplication(null)}
        isOpen={selectedApplication !== null}
      />
    </>
  );
}

// Component for Saved Jobs List
function SavedJobsList() {
  const { user } = useAuthStore();
  const [savedJobs, setSavedJobs] = useState<SavedJobWithDetails[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!user?.id) {
      setIsLoading(false);
      return;
    }
    const fetchSavedJobs = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const response = await fetch(`/api/users/${user.id}/saved-jobs`);
        if (!response.ok) throw new Error(`Failed to fetch saved jobs: ${response.statusText}`);
        setSavedJobs(await response.json());
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An unknown error occurred.');
      } finally {
        setIsLoading(false);
      }
    };
    fetchSavedJobs();
  }, [user?.id]);

  const handleUnsave = (jobId: string) => {
    setSavedJobs(prev => prev.filter(job => job.jobPostingId !== jobId));
  };

  if (isLoading) return <ListSkeleton />;
  if (error) return <p className="text-red-500">Error: {error}</p>;

  return (
    <div className="space-y-4">
      {savedJobs.length === 0 ? (
        <EmptyState icon={Bookmark} title="No Saved Jobs" message="Click the bookmark icon on a job to save it for later." />
      ) : (
        savedJobs.map((savedJob) => (
          <SavedJobCard key={savedJob.id} savedJob={savedJob} onUnsave={handleUnsave} />
        ))
      )}
    </div>
  );
}

// Main Dashboard Page Component
export default function DashboardPage() {
  const { activeTab, setActiveTab } = useApplicationListStore();

  return (
    <div>
      <h1 className="text-3xl font-bold text-gray-800 mb-6">My Dashboard</h1>
      <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as 'applied' | 'saved')} className="w-full">
        <TabsList className="grid w-full grid-cols-2 max-w-md">
          <TabsTrigger value="applied">
            <FileText className="mr-2 h-4 w-4" /> Applied Jobs
          </TabsTrigger>
          <TabsTrigger value="saved">
            <Bookmark className="mr-2 h-4 w-4" /> Saved Jobs
          </TabsTrigger>
        </TabsList>
        <TabsContent value="applied" className="mt-6">
          <AppliedJobsList />
        </TabsContent>
        <TabsContent value="saved" className="mt-6">
          <SavedJobsList />
        </TabsContent>
      </Tabs>
    </div>
  );
}