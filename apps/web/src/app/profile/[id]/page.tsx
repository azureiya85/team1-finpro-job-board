import { redirect } from 'next/navigation';
import { auth } from '@/auth';
import { UserRole } from '@prisma/client';
import ProfileViewTemplate from '@/components/templates/profile/ProfileViewTemplate';
import { getApplicantProfile } from '@/lib/applicantProfileService';

interface ProfilePageProps {
  params: {
    id: string;
  };
}

export default async function ProfilePage({ params }: ProfilePageProps) {
  const session = await auth();
  
  if (!session?.user?.id) {
    redirect('/auth/login');
  }

  if (session.user.role !== UserRole.COMPANY_ADMIN) {
    redirect('/dashboard');
  }

  const { id: applicantId } = params;

  try {
    const { user, viewerRole } = await getApplicantProfile(session.user.id, applicantId);
    
    return <ProfileViewTemplate user={user} viewerRole={viewerRole} />;

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : "An unknown error occurred";
    return <ProfileViewTemplate error={errorMessage} />;
  }
}