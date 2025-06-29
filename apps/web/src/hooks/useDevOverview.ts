import { useState, useEffect } from "react";
import { CheckCircle, Clock, XCircle } from "lucide-react";
import type { DashboardData, DashboardStats, SubscriptionStatusData } from "../types/devDashboard";

export const useDevOverview = () => {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const [subscriptionsRes, plansRes, categoriesRes, assessmentsRes] = await Promise.all([
        fetch('/api/admin/subscription?limit=100'),
        fetch('/api/admin/subscription/plan'),
        fetch('/api/admin/skill/categories'),
        fetch('/api/admin/skill/assessments')
      ]);

      if (!subscriptionsRes.ok || !plansRes.ok || !categoriesRes.ok || !assessmentsRes.ok) {
        throw new Error('Failed to fetch dashboard data');
      }

      const [subscriptions, plans, categories, assessments] = await Promise.all([
        subscriptionsRes.json(),
        plansRes.json(),
        categoriesRes.json(),
        assessmentsRes.json()
      ]);

      setData({ subscriptions, plans, categories, assessments });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  // Calculate statistics
  const calculateStats = (): DashboardStats | null => {
    if (!data) return null;

    const activeSubscriptions = data.subscriptions.data.filter(sub => sub.status === 'ACTIVE').length;
    const pendingSubscriptions = data.subscriptions.data.filter(sub => sub.status === 'PENDING').length;
    const cancelledSubscriptions = data.subscriptions.data.filter(sub => sub.status === 'CANCELLED').length;
    const totalRevenue = data.subscriptions.data
      .filter(sub => sub.paymentStatus === 'PAID')
      .reduce((sum, sub) => sum + sub.plan.price, 0);
    
    const totalQuestions = data.assessments.reduce((sum, assessment) => sum + assessment._count.questions, 0);
    const avgQuestionsPerAssessment = data.assessments.length > 0 ? Math.round(totalQuestions / data.assessments.length) : 0;

    return {
      activeSubscriptions,
      pendingSubscriptions,
      cancelledSubscriptions,
      totalRevenue,
      totalQuestions,
      avgQuestionsPerAssessment
    };
  };

  // Get subscription status data for charts
  const getSubscriptionStatusData = (): SubscriptionStatusData[] => {
    const stats = calculateStats();
    if (!stats || !data) return [];

    return [
      { status: 'Active', count: stats.activeSubscriptions, color: 'bg-green-500', icon: CheckCircle },
      { status: 'Pending', count: stats.pendingSubscriptions, color: 'bg-yellow-500', icon: Clock },
      { status: 'Cancelled', count: stats.cancelledSubscriptions, color: 'bg-red-500', icon: XCircle }
    ];
  };

  return {
    data,
    loading,
    error,
    stats: calculateStats(),
    subscriptionStatusData: getSubscriptionStatusData(),
    refetch: fetchDashboardData
  };
};