'use client';

import { CreateJobForm } from '@/components/organisms/jobs/CreateJobForm';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

interface CreateJobTemplateProps {
  jobId?: string;
  isEditing?: boolean;
}

export function CreateJobTemplate({ jobId, isEditing }: CreateJobTemplateProps) {
  const [companyId, setCompanyId] = useState<string>('');
  const router = useRouter();

  useEffect(() => {
    const getCompanyId = async () => {
      try {
        const response = await fetch('/api/auth/session');
        const session = await response.json();

        if (!session?.user) {
          router.push('/auth/login');
          return;
        }

        // Fetch user's company data
        const companyResponse = await fetch(`/api/users/${session.user.id}/company`);
        if (!companyResponse.ok) {
          throw new Error('Failed to fetch company data');
        }
        const data = await companyResponse.json();
        setCompanyId(data.id);
      } catch (error) {
        console.error('Error fetching company data:', error);
      }
    };

    getCompanyId();
  }, [router]);

  if (!companyId) {
    return <div>Loading...</div>;
  }

  return (
    <div className="container mx-auto max-w-2xl py-8">
      <h1 className="text-2xl font-bold mb-6">
        {isEditing ? 'Edit Job Posting' : 'Create New Job Posting'}
      </h1>
      <CreateJobForm jobId={jobId} isEditing={isEditing} companyId={companyId} />
    </div>
  );
}