"use client";

import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";

import { useDevOverview } from "@/hooks/useDevOverview";
import DevDashboardOverviewHeader from "@/components/organisms/dashboard/overview/DashboardOverviewHeader";
import DevDashboardOverviewDetails from "@/components/organisms/dashboard/overview/DashboardOverviewDetails";

export default function DevDashboardOverviewTemplate() {
  const { data, loading, error, stats, subscriptionStatusData } = useDevOverview();

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {[...Array(4)].map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardHeader className="pb-2">
                <div className="h-4 bg-muted rounded w-3/4"></div>
              </CardHeader>
              <CardContent>
                <div className="h-8 bg-muted rounded w-1/2 mb-2"></div>
                <div className="h-3 bg-muted rounded w-full"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <Alert variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>Error</AlertTitle>
        <AlertDescription>{error}</AlertDescription>
      </Alert>
    );
  }

  if (!data || !stats) return null;

  return (
    <div className="space-y-6">
      <DevDashboardOverviewHeader data={data} stats={stats} />
      <DevDashboardOverviewDetails 
        data={data} 
        stats={stats} 
        subscriptionStatusData={subscriptionStatusData} 
      />
    </div>
  );
}