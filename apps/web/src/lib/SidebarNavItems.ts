import { 
  LayoutDashboard, 
  User, 
  FileText, 
  ShoppingCart, 
  Home 
} from 'lucide-react';
import { LucideIcon } from 'lucide-react';

export interface NavItem {
  name: string;
  href: string;
  icon: LucideIcon;
  description: string;
  mobileLabel: string;
  comingSoon?: boolean;
}

export const userNavItems: NavItem[] = [
  {
    name: 'Dashboard',
    href: '/dashboard',
    icon: Home,
    description: 'Track your job application',
    mobileLabel: 'Home'
  },
  {
    name: 'Assessments',
    href: '/dashboard/assessments',
    icon: FileText,
    description: 'Take skill assessments',
    mobileLabel: 'Tests'
  },
  {
    name: 'Subscriptions',
    href: '/dashboard/subscription',
    icon: ShoppingCart,
    description: 'Manage your plan',
    comingSoon: false,
    mobileLabel: 'Plans'
  },
  {
    name: 'Profile',
    href: '/dashboard/profile',
    icon: User,
    description: 'Manage your profile',
    mobileLabel: 'Profile'
  },
];

export const developerNavItems: NavItem[] = [
  {
    name: 'Overview',
    href: '/dashboard/developer',
    icon: LayoutDashboard,
    description: 'Developer dashboard home',
    mobileLabel: 'Home'
  },
  {
    name: 'Assessments Mgt.',
    href: '/dashboard/developer/assessment',
    icon: FileText,
    description: 'Manage skill assessments',
    comingSoon: false,
    mobileLabel: 'Tests'
  },
  {
    name: 'Subscriptions Mgt.',
    href: '/dashboard/developer/subscription',
    icon: ShoppingCart,
    description: 'Manage user subscriptions',
    comingSoon: false,
    mobileLabel: 'Subs'
  },
];