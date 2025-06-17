import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { FileText, Construction } from "lucide-react";

export default function DeveloperAssessmentPage() {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center text-2xl">
          <FileText className="w-6 h-6 mr-2 text-destructive" />
          Manage Skill Assessments
        </CardTitle>
        <CardDescription>
          Create, edit, and manage skill assessment tests and questions.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Alert variant="destructive" className="bg-orange-50 border-orange-500 text-orange-700 [&>svg]:text-orange-700 dark:bg-orange-900/30 dark:border-orange-700 dark:text-orange-400 dark:[&>svg]:text-orange-400">
          <Construction className="h-5 w-5" />
          <AlertTitle>Work in Progress</AlertTitle>
          <AlertDescription>
            The interface for managing skill assessments is currently being built.
            Soon you&apos;ll be able to manage all aspects of assessments from here.
          </AlertDescription>
        </Alert>
      </CardContent>
    </Card>
  );
}