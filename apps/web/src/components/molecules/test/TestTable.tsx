import { Test } from '@/types/testTypes';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from '@/components/ui/table';
import { useRouter } from 'next/navigation';

interface TestTableProps {
  tests: Test[];
  jobId: string;
  onDelete: (testId: string) => Promise<void>;
}

export function TestTable({ tests, jobId, onDelete }: TestTableProps) {
  const router = useRouter();

  const validTests = tests.filter(test => test && test.id);

  const handleDelete = async (testId: string) => {
    if (!testId) {
      console.error('Test ID is undefined');
      return;
    }
    try {
      await onDelete(testId);
    } catch (error) {
      console.error('Error deleting test:', error);
    }
  };

  // Handler untuk navigasi dengan validasi
  const handleNavigation = (testId: string, action: 'edit' | 'view') => {
    if (!testId) {
      console.error('Test ID is undefined');
      return;
    }
    router.push(`/jobs/${jobId}/test/${testId}${action === 'edit' ? '/edit-test' : ''}`);
  };

  return (
    <Card className="p-6 overflow-x-auto">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-1/6 text-center">Title</TableHead>
            <TableHead className="w-1/6 text-center">Description</TableHead>
            <TableHead className="w-1/6 text-center">Time Limit</TableHead>
            <TableHead className="w-1/6 text-center">Passing Score</TableHead>
            <TableHead className="w-1/6 text-center">Questions</TableHead>
            <TableHead className="w-1/6 text-center">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {validTests.map((test) => (
            <TableRow key={test.id}>
              <TableCell className="text-center">
                <div 
                  className="max-w-[200px] mx-auto whitespace-pre-line" 
                  title={test.title || undefined}
                >
                  {test.title}
                </div>
              </TableCell>
              <TableCell className="text-center">
                <div 
                  className="max-w-[200px] mx-auto whitespace-pre-line" 
                  title={test.description || undefined}
                >
                  {test.description}
                </div>
              </TableCell>
              <TableCell className="text-center">{test.timeLimit} minutes</TableCell>
              <TableCell className="text-center">{test.passingScore}%</TableCell>
              <TableCell className="text-center">{test.questions?.length || 0}</TableCell>
              <TableCell>
                <div className="flex justify-center space-x-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleNavigation(test.id, 'edit')}
                  >
                    Edit
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleNavigation(test.id, 'view')}
                  >
                    View
                  </Button>
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => handleDelete(test.id)}
                  >
                    Delete
                  </Button>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </Card>
  );
}