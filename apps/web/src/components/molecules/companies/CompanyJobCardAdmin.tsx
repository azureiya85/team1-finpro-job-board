'use client';

import type { JobPostingInStore } from '@/types';
import { useCompanyProfileStore } from '@/stores/companyProfileStores'; 
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Briefcase, Calendar, Users, Edit, Trash2, Eye, AlertTriangle, Plus } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { employmentTypeLabels } from '@/lib/jobConstants';
import { useRouter } from 'next/navigation';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { toast } from "sonner";

interface CompanyJobCardAdminProps {
  job: JobPostingInStore;
  companyId: string;
}

export default function CompanyJobCardAdmin({ job, companyId }: CompanyJobCardAdminProps) {
  const router = useRouter();
  const {
    setSelectedJobForApplicants,
    removeJobFromManagement,    
    updateJobInManagement,     
    decrementTotalJobs
  } = useCompanyProfileStore();

  const applicantCount = job._count?.applications ?? 0;

  const handleViewApplicants = () => {
    setSelectedJobForApplicants(job);
  };

  const handleEditJob = () => {
    router.push(`/jobs/create-jobs/edit-jobs/${job.id}`);
  };

  const handleCreateTest = () => {
    router.push(`/jobs/${job.id}/create-test`);
  };

  const handleDeleteJob = async () => {
    try {
      const response = await fetch(`/api/companies/${companyId}/jobs/${job.id}`, {
        method: 'DELETE',
      });
      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Failed to delete job posting.');
      }

      toast.success(result.message || 'Job posting processed successfully.');
      if (result.job && result.job.isActive === false) { // Soft delete
        updateJobInManagement(result.job as JobPostingInStore); 
      } else { // Hard delete
        removeJobFromManagement(job.id); 
        decrementTotalJobs();
      }

    } catch (error) {
      console.error('Error deleting job:', error);
      toast.error(error instanceof Error ? error.message : 'An unknown error occurred.');
    }
  };

  return (
    <Card className="flex flex-col h-full"> 
      <CardHeader>
        <div className="flex justify-between items-start">
          <CardTitle className="text-lg">{job.title}</CardTitle>
          {!job.isActive && (
            <span className="text-xs bg-yellow-100 text-yellow-700 px-2 py-1 rounded-full flex items-center">
              <AlertTriangle className="w-3 h-3 mr-1" /> Inactive
            </span>
          )}
        </div>
        <CardDescription className="text-sm text-gray-500">
          Posted {formatDistanceToNow(new Date(job.createdAt), { addSuffix: true })}
        </CardDescription>
      </CardHeader>
      <CardContent className="flex-grow space-y-2"> 
        <div className="text-sm text-gray-600">
          <div className="flex items-center">
            <Briefcase className="w-4 h-4 mr-2 text-gray-400" />
            <span>{employmentTypeLabels[job.employmentType] || job.employmentType}</span>
          </div>
          <div className="flex items-center">
            <Users className="w-4 h-4 mr-2 text-gray-400" />
            <span>{applicantCount} Applicant{applicantCount !== 1 ? 's' : ''}</span>
          </div>
          {job.applicationDeadline && (
            <div className="flex items-center">
              <Calendar className="w-4 h-4 mr-2 text-gray-400" />
              <span>Deadline: {new Date(job.applicationDeadline).toLocaleDateString('en-CA')}</span> 
            </div>
          )}
        </div>
      </CardContent>
      <CardFooter className="flex flex-wrap justify-end space-x-2"> 
        <Button
          variant="outline"
          size="sm"
          onClick={handleCreateTest}
          disabled={!job.isActive}
        >
          <Plus className="w-4 h-4 mr-1" /> Create Test
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={handleViewApplicants}
          disabled={!job.isActive && applicantCount === 0}
        >
          <Eye className="w-4 h-4 mr-1" /> Applicants
        </Button>
        <Button 
          variant="outline" 
          size="sm" 
          onClick={handleEditJob}
          disabled={!job.isActive}
        >
          <Edit className="w-4 h-4 mr-1" /> Edit
        </Button>
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button variant="destructive" size="sm">
              <Trash2 className="w-4 h-4 mr-1" /> Delete
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Are you sure?</AlertDialogTitle>
              <AlertDialogDescription>
                This action will {job._count && job._count.applications > 0 ? "mark the job as inactive." : "permanently delete the job posting."} This cannot be undone.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction onClick={handleDeleteJob} className="bg-destructive hover:bg-destructive/90">
                Confirm Delete
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </CardFooter>
    </Card>
  );
}