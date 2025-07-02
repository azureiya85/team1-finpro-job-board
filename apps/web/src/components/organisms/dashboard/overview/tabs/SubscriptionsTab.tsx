"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { TrendingUp } from "lucide-react";
import { DashboardData, SubscriptionStatusData } from "@/types/devDashboard";

interface SubscriptionsTabProps {
  data: DashboardData;
  subscriptionStatusData: SubscriptionStatusData[];
}

export default function SubscriptionsTab({ data, subscriptionStatusData }: SubscriptionsTabProps) {
  return (
    <>
      <div className="grid gap-4 md:grid-cols-3">
        {subscriptionStatusData.map(({ status, count, color, icon: Icon }) => (
          <Card key={status}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{status} Subscriptions</CardTitle>
              <Icon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{count}</div>
              <div className="w-full bg-secondary rounded-full h-2 mt-2">
                <div 
                  className={`h-2 rounded-full ${color}`}
                  style={{ width: `${(count / data.subscriptions.meta.total) * 100}%` }}
                ></div>
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                {((count / data.subscriptions.meta.total) * 100).toFixed(1)}% of total
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <TrendingUp className="w-5 h-5 mr-2" />
            Recent Subscriptions
          </CardTitle>
          <CardDescription>Latest subscription activities</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {data.subscriptions.data.slice(0, 5).map((subscription) => (
              <div key={subscription.id} className="flex items-center justify-between p-3 border rounded-lg">
                <div className="flex items-center space-x-3">
                  <div className="flex-1">
                    <p className="font-medium">{subscription.user.name || subscription.user.email}</p>
                    <p className="text-sm text-muted-foreground">{subscription.plan.name}</p>
                  </div>
                </div>
                <div className="text-right">
                  <Badge variant={subscription.status === 'ACTIVE' ? 'default' : subscription.status === 'PENDING' ? 'secondary' : 'destructive'}>
                    {subscription.status}
                  </Badge>
                  <p className="text-sm text-muted-foreground mt-1">${subscription.plan.price}</p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </>
  );
}