"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { BarChart3, Zap } from "lucide-react";
import { DashboardData, DashboardStats } from "@/types/devDashboard";

interface AnalyticsTabProps {
  data: DashboardData;
  stats: DashboardStats;
}

export default function AnalyticsTab({ data, stats }: AnalyticsTabProps) {
  return (
    <div className="grid gap-4 md:grid-cols-2">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <BarChart3 className="w-5 h-5 mr-2" />
            System Health
          </CardTitle>
          <CardDescription>Key performance indicators</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <div className="flex justify-between text-sm mb-1">
              <span>Active Subscriptions</span>
              <span>{((stats.activeSubscriptions / data.subscriptions.meta.total) * 100).toFixed(1)}%</span>
            </div>
            <Progress value={(stats.activeSubscriptions / data.subscriptions.meta.total) * 100} className="h-2" />
          </div>
          <div>
            <div className="flex justify-between text-sm mb-1">
              <span>Payment Success Rate</span>
              <span>{((data.subscriptions.data.filter((s) => s.paymentStatus === 'PAID').length / data.subscriptions.meta.total) * 100).toFixed(1)}%</span>
            </div>
            <Progress value={(data.subscriptions.data.filter((s) => s.paymentStatus === 'PAID').length / data.subscriptions.meta.total) * 100} className="h-2" />
          </div>
          <div>
            <div className="flex justify-between text-sm mb-1">
              <span>Assessment Coverage</span>
              <span>{data.categories.length > 0 ? ((data.assessments.length / (data.categories.length * 5)) * 100).toFixed(1) : 0}%</span>
            </div>
            <Progress value={data.categories.length > 0 ? (data.assessments.length / (data.categories.length * 5)) * 100 : 0} className="h-2" />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Zap className="w-5 h-5 mr-2" />
            Quick Stats
          </CardTitle>
          <CardDescription>At a glance metrics</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-4">
            <div className="text-center p-3 border rounded">
              <div className="text-2xl font-bold text-blue-600">{data.subscriptions.meta.total}</div>
              <div className="text-xs text-muted-foreground">Total Users</div>
            </div>
            <div className="text-center p-3 border rounded">
              <div className="text-2xl font-bold text-green-600">${stats.totalRevenue.toLocaleString()}</div>
              <div className="text-xs text-muted-foreground">Revenue</div>
            </div>
            <div className="text-center p-3 border rounded">
              <div className="text-2xl font-bold text-purple-600">{data.assessments.length}</div>
              <div className="text-xs text-muted-foreground">Assessments</div>
            </div>
            <div className="text-center p-3 border rounded">
              <div className="text-2xl font-bold text-orange-600">{data.plans.length}</div>
              <div className="text-xs text-muted-foreground">Plans</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}