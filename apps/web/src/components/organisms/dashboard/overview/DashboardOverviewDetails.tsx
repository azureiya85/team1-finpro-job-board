"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { 
  BookOpen, 
  Target, 
  TrendingUp, 
  CheckCircle,
  Calendar,
  BarChart3,
  Zap
} from "lucide-react";

import { useDevDashboardOverviewStore, type TabValue } from "@/stores/devDashboardOverviewStores";
import { DashboardData, DashboardStats, SubscriptionStatusData } from "@/types/devDashboard";

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
      </TabsContent>

      <TabsContent value="plans" className="space-y-4">
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {data.plans.map((plan) => (
            <Card key={plan.id} className="relative">
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  {plan.name}
                  <Badge variant="outline">${plan.price}</Badge>
                </CardTitle>
                <CardDescription>{plan.description}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex items-center text-sm">
                    <Calendar className="w-4 h-4 mr-2 text-muted-foreground" />
                    {plan.duration} days duration
                  </div>
                  <Separator />
                  <div className="space-y-1">
                    <p className="text-sm font-medium">Features:</p>
                    {plan.features.map((feature, index) => (
                      <div key={index} className="flex items-center text-sm">
                        <CheckCircle className="w-3 h-3 mr-2 text-green-500" />
                        {feature}
                      </div>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </TabsContent>

      <TabsContent value="assessments" className="space-y-4">
        <div className="grid gap-4 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <BookOpen className="w-5 h-5 mr-2" />
                Skill Categories
              </CardTitle>
              <CardDescription>{data.categories.length} categories available</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {data.categories.map((category) => (
                  <div key={category.id} className="flex items-center justify-between p-2 border rounded">
                    <div>
                      <p className="font-medium">{category.name}</p>
                      <p className="text-sm text-muted-foreground">{category.description}</p>
                    </div>
                    <Badge variant="secondary">
                      {data.assessments.filter((a) => a.categoryId === category.id).length} assessments
                    </Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Target className="w-5 h-5 mr-2" />
                Assessment Overview
              </CardTitle>
              <CardDescription>Questions and assessment statistics</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm">Total Questions</span>
                  <span className="font-bold">{stats.totalQuestions}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">Average per Assessment</span>
                  <span className="font-bold">{stats.avgQuestionsPerAssessment}</span>
                </div>
                <Separator />
                <div className="space-y-2">
                  {data.assessments.slice(0, 5).map((assessment) => (
                    <div key={assessment.id} className="flex items-center justify-between">
                      <div className="flex-1">
                        <p className="text-sm font-medium">{assessment.title}</p>
                        <p className="text-xs text-muted-foreground">{assessment.category.name}</p>
                      </div>
                      <Badge variant="outline">{assessment._count.questions} questions</Badge>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </TabsContent>

      <TabsContent value="analytics" className="space-y-4">
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
      </TabsContent>
    </Tabs>
  );
}