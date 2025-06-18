import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { ShoppingCart, Users, CreditCard, Package, AlertCircle, Loader2 } from 'lucide-react';
import SubscriptionManagementList from '@/components/organisms/dashboard/subscription/developer/SubscriptionManagementList';
import SubscriptionManagementPayment from '@/components/organisms/dashboard/subscription/developer/SubscriptionManagementPayment.tsx';
import SubscriptionManagementPlans from '@/components/organisms/dashboard/subscription/developer/SubscriptionManagementPlans';
import { useSubscriptionManagementStore } from '@/stores/subscriptionMgtStores';

const SubscriptionManagementPageTemplate: React.FC = () => {
  const [activeTab, setActiveTab] = useState('subscriptions');
  const { error, clearError } = useSubscriptionManagementStore();

  return (
    <div className="container mx-auto px-4 py-6 space-y-6">
      {/* Header */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center text-2xl">
            <ShoppingCart className="w-6 h-6 mr-2 text-primary" />
            Subscription Management
          </CardTitle>
          <CardDescription>
            Comprehensive management of user subscriptions, payments, and plans
          </CardDescription>
        </CardHeader>
      </Card>

      {/* Global Error Alert */}
      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription className="flex items-center justify-between">
            <span>{error}</span>
            <button
              onClick={clearError}
              className="ml-2 underline hover:no-underline"
            >
              Dismiss
            </button>
          </AlertDescription>
        </Alert>
      )}

      {/* Main Content Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger 
            value="subscriptions" 
            className="flex items-center gap-2"
          >
            <Users className="w-4 h-4" />
            <span className="hidden sm:inline">Subscription List</span>
            <span className="sm:hidden">List</span>
          </TabsTrigger>
          
          <TabsTrigger 
            value="payments" 
            className="flex items-center gap-2"
          >
            <CreditCard className="w-4 h-4" />
            <span className="hidden sm:inline">Payment Review</span>
            <span className="sm:hidden">Payments</span>
          </TabsTrigger>
          
          <TabsTrigger 
            value="plans" 
            className="flex items-center gap-2"
          >
            <Package className="w-4 h-4" />
            <span className="hidden sm:inline">Plan Management</span>
            <span className="sm:hidden">Plans</span>
          </TabsTrigger>
        </TabsList>

        {/* Subscription List Tab */}
        <TabsContent value="subscriptions" className="space-y-4">
          <SubscriptionManagementList />
        </TabsContent>

        {/* Payment Review Tab */}
        <TabsContent value="payments" className="space-y-4">
          <SubscriptionManagementPayment />
        </TabsContent>

        {/* Plan Management Tab */}
        <TabsContent value="plans" className="space-y-4">
          <SubscriptionManagementPlans />
        </TabsContent>
      </Tabs>

      {/* Quick Stats Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <StatsCard
          title="Total Subscriptions"
          icon={<Users className="w-5 h-5 text-muted-foreground" />}
          description="All active and past subscriptions"
          storePath="subscriptions"
        />
        
        <StatsCard
          title="Pending Payments"
          icon={<CreditCard className="w-5 h-5 text-muted-foreground" />}
          description="Awaiting manual approval"
          storePath="pendingPayments"
        />
        
        <StatsCard
          title="Active Plans"
          icon={<Package className="w-5 h-5 text-muted-foreground" />}
          description="Available for new subscriptions"
          storePath="plans"
        />
      </div>
    </div>
  );
};

const StatsCard: React.FC<{
  title: string;
  icon: React.ReactNode;
  description: string;
  storePath: 'subscriptions' | 'pendingPayments' | 'plans';
}> = ({ title, icon, description, storePath }) => {
  const loading = useSubscriptionManagementStore((state) => state.loading);
  const count = useSubscriptionManagementStore((state) => {
    switch (storePath) {
      case 'subscriptions':
        return state.pagination?.total;
      case 'pendingPayments':
        return state.pendingPayments.length;
      case 'plans':
        return state.plans.length;
      default:
        return 0;
    }
  });

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        {icon}
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">
          {loading && count === undefined ? (
            <Loader2 className="w-6 h-6 animate-spin" />
          ) : (
            count ?? 0
          )}
        </div>
        <p className="text-xs text-muted-foreground">{description}</p>
      </CardContent>
    </Card>
  );
};

export default SubscriptionManagementPageTemplate;