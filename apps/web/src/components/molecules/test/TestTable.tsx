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
        {tests.map((test, index) => (
          <TableRow key={test.id || `test-${index}`}>
              <TableCell className="text-center">{test.title}</TableCell>
              <TableCell className="text-center">{test.description}</TableCell>
              <TableCell className="text-center">{test.timeLimit} minutes</TableCell>
              <TableCell className="text-center">{test.passingScore}%</TableCell>
              <TableCell className="text-center">{test.questions.length}</TableCell>
              <TableCell>
                <div className="flex justify-center space-x-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => router.push(`/jobs/${jobId}/test/${test.id}/edit`)}
                  >
                    Edit
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => router.push(`/jobs/${jobId}/test/${test.id}`)}
                  >
                    View
                  </Button>
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => onDelete(test.id)}
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