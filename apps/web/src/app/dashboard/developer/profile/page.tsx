import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { UserCog, Construction } from "lucide-react";

export default function DeveloperProfilePage() {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center text-2xl">
          <UserCog className="w-6 h-6 mr-2 text-destructive" />
          Developer Profile
        </CardTitle>
        <CardDescription>
          Manage your developer account settings.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Alert variant="default" className="border-blue-500 text-blue-700 [&>svg]:text-blue-700">
          <Construction className="h-5 w-5" />
          <AlertTitle>Feature Coming Soon!</AlertTitle>
          <AlertDescription>
            The developer profile management section is under construction.
            You&apos;ll soon be able to update your details here.
          </AlertDescription>
        </Alert>
      </CardContent>
    </Card>
  );
}