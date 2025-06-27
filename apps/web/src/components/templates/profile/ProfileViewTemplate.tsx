'use client';

import React from 'react';
import ProfileViewLayout from '../../organisms/companies/applicants-profile/ProfileViewLayout'; 
import { AlertCircle } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { ProfileUser } from '@/lib/applicantProfileService'; 
import { UserRole } from '@prisma/client';

interface ProfileViewTemplateProps {
  user?: ProfileUser;
  viewerRole?: UserRole;
  error?: string;
}

export default function ProfileViewTemplate({ user, viewerRole, error }: ProfileViewTemplateProps) {

  if (error) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            <span>{error}</span>
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  if (!user || !viewerRole) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <Alert>
          <AlertDescription>No profile data available.</AlertDescription>
        </Alert>
      </div>
    );
  }
  
  return <ProfileViewLayout user={user} viewerRole={viewerRole} />;
}