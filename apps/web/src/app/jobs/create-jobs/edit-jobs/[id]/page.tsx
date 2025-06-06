import { CreateJobTemplate } from '@/components/templates/jobs/CreateJobTemplate';

interface EditJobPageProps {
  params: {
    id: string;
  };
}

export default function EditJobPage({ params }: EditJobPageProps) {
  return <CreateJobTemplate jobId={params.id} isEditing={true} />;
}