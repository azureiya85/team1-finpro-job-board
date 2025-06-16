import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { ShoppingCart, Construction } from "lucide-react";

export default function DeveloperSubscriptionPage() {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center text-2xl">
          <ShoppingCart className="w-6 h-6 mr-2 text-destructive" />
          Manage Subscriptions
        </CardTitle>
        <CardDescription>
          View user subscriptions, manage plans, and approve manual payments.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Alert className="border-green-500 text-green-700 [&>svg]:text-green-700">
          <Construction className="h-5 w-5" />
          <AlertTitle>Under Development</AlertTitle>
          <AlertDescription>
            Subscription management tools, including manual payment approvals, are being developed.
          </AlertDescription>
        </Alert>
      </CardContent>
    </Card>
  );
}