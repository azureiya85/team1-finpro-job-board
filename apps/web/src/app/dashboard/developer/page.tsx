import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Construction, LayoutDashboard } from "lucide-react";

export default function DeveloperDashboardPage() {
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center text-2xl">
            <LayoutDashboard className="w-6 h-6 mr-2 text-destructive" />
            Developer Dashboard Overview
          </CardTitle>
          <CardDescription>
            Welcome to the Developer Control Panel.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Alert className="border-yellow-500 text-yellow-700 [&>svg]:text-yellow-700">
            <Construction className="h-5 w-5" />
            <AlertTitle>Under Construction!</AlertTitle>
            <AlertDescription>
              This section is currently under development. More features and statistics will be available soon.
            </AlertDescription>
          </Alert>
          <div className="mt-6 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {/* Placeholder cards for future stats */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Total Skill Assessments</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-3xl font-bold">N/A</p>
                <p className="text-xs text-muted-foreground">Coming Soon</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Active Subscriptions</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-3xl font-bold">N/A</p>
                <p className="text-xs text-muted-foreground">Coming Soon</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Pending Approvals</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-3xl font-bold">N/A</p>
                <p className="text-xs text-muted-foreground">Coming Soon</p>
              </CardContent>
            </Card>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}