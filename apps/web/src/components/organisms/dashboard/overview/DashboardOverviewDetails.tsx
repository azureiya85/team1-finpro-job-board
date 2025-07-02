"use client";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useDevDashboardOverviewStore, type TabValue } from "@/stores/devDashboardOverviewStores";
import { DashboardData, DashboardStats, SubscriptionStatusData } from "@/types/devDashboard";

import SubscriptionsTab from "./tabs/SubscriptionsTab";
import PlansTab from "./tabs/PlansTab";
import AssessmentsTab from "./tabs/AssessmentsTab";
import AnalyticsTab from "./tabs/AnalyticsTab";

interface DevDashboardOverviewDetailsProps {
  data: DashboardData;
  stats: DashboardStats;
  subscriptionStatusData: SubscriptionStatusData[];
}

export default function DevDashboardOverviewDetails({ 
  data, 
  stats, 
  subscriptionStatusData 
}: DevDashboardOverviewDetailsProps) {
  const { activeTab, setActiveTab } = useDevDashboardOverviewStore();

  return (
    <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as TabValue)} className="space-y-4">
      <TabsList className="grid w-full grid-cols-4">
        <TabsTrigger value="subscriptions">Subscriptions</TabsTrigger>
        <TabsTrigger value="plans">Plans</TabsTrigger>
        <TabsTrigger value="assessments">Assessments</TabsTrigger>
        <TabsTrigger value="analytics">Analytics</TabsTrigger>
      </TabsList>

      <TabsContent value="subscriptions" className="space-y-4">
        <SubscriptionsTab data={data} subscriptionStatusData={subscriptionStatusData} />
      </TabsContent>

      <TabsContent value="plans" className="space-y-4">
        <PlansTab plans={data.plans} />
      </TabsContent>

      <TabsContent value="assessments" className="space-y-4">
        <AssessmentsTab data={data} stats={stats} />
      </TabsContent>

      <TabsContent value="analytics" className="space-y-4">
        <AnalyticsTab data={data} stats={stats} />
      </TabsContent>
    </Tabs>
  );
}