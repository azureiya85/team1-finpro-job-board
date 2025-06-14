'use client';

import { CreateTestTemplate } from '@/components/templates/test/CreateTestTemplate';
import { useParams } from 'next/navigation';

export default function EditTestPage() {
  const params = useParams();
  const testId = params.testId as string;

  return <CreateTestTemplate mode="edit" testId={testId} />;
}