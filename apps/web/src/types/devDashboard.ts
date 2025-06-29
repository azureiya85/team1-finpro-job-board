export interface Subscription {
  id: string;
  status: string;
  paymentStatus: string;
  user: { id: string; email: string; name: string };
  plan: { id: string; name: string; price: number; duration: number; features: string[] };
  createdAt: string;
}

export interface SubscriptionPlan {
  id: string;
  name: string;
  price: number;
  duration: number;
  description: string;
  features: string[];
  createdAt: string;
}

export interface SkillCategory {
  id: string;
  name: string;
  description: string;
  createdAt: string;
}

export interface SkillAssessment {
  id: string;
  title: string;
  description: string;
  categoryId: string;
  category: SkillCategory;
  _count: { questions: number };
  createdAt: string;
}

export interface DashboardData {
  subscriptions: { data: Subscription[]; meta: { total: number } };
  plans: SubscriptionPlan[];
  categories: SkillCategory[];
  assessments: SkillAssessment[];
}

export interface DashboardStats {
  activeSubscriptions: number;
  pendingSubscriptions: number;
  cancelledSubscriptions: number;
  totalRevenue: number;
  totalQuestions: number;
  avgQuestionsPerAssessment: number;
}

export interface SubscriptionStatusData {
  status: string;
  count: number;
  color: string;
  icon: React.ComponentType<{ className?: string }>;
}