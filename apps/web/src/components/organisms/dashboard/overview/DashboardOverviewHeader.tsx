"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  LayoutDashboard, 
  Users, 
  Target,
  CreditCard,
  Activity,
  // Wallet
} from "lucide-react";

import { DashboardData, DashboardStats } from "@/types/devDashboard";

interface DevDashboardOverviewHeaderProps {
  data: DashboardData;
  stats: DashboardStats;
}

export default function DevDashboardOverviewHeader({ data, stats }: DevDashboardOverviewHeaderProps) {
  return (
    <>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight flex items-center">
            <LayoutDashboard className="w-8 h-8 mr-3 text-primary" />
            Developer Dashboard
          </h1>
          <p className="text-muted-foreground mt-2">
            Comprehensive overview of system metrics and performance
          </p>
        </div>
        <Badge variant="outline" className="px-3 py-1">
          <Activity className="w-4 h-4 mr-1" />
          Live Data
        </Badge>
      </div>

      {/* Key Metrics Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <Card className="border-l-4 border-l-blue-500">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Subscriptions</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data.subscriptions.meta.total}</div>
            <p className="text-xs text-muted-foreground">
              {stats.activeSubscriptions} active, {stats.pendingSubscriptions} pending
            </p>
          </CardContent>
        </Card>

        {/* Total Revenue Card - Commented out for demo */}
        {/* <Card className="border-l-4 border-l-green-500">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
            <Wallet className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">Rp {stats.totalRevenue.toLocaleString("id-ID")}</div>
            <p className="text-xs text-muted-foreground">
              From {data.subscriptions.data.filter((sub) => sub.paymentStatus === 'PAID').length} paid subscriptions
            </p>
          </CardContent>
        </Card> */}

        <Card className="border-l-4 border-l-purple-500">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Skill Assessments</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data.assessments.length}</div>
            <p className="text-xs text-muted-foreground">
              {stats.totalQuestions} total questions across {data.categories.length} categories
            </p>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-orange-500">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Subscription Plans</CardTitle>
            <CreditCard className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data.plans.length}</div>
            <p className="text-xs text-muted-foreground">
              ${Math.min(...data.plans.map((p) => p.price))} - ${Math.max(...data.plans.map((p) => p.price))} price range
            </p>
          </CardContent>
        </Card>
      </div>
    </>
  );
}