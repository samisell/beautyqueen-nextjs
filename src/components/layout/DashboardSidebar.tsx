'use client';

import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  User,
  Vote,
  ShoppingCart,
  Users,
  Settings,
  Trophy,
  Shield,
  BarChart3,
  UserPlus,
  Crown,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAuthStore } from '@/stores/auth-store';
import { useNavigationStore } from '@/stores/navigation-store';

const userMenuItems = [
  {
    label: 'Overview',
    page: 'dashboard',
    icon: LayoutDashboard,
  },
  {
    label: 'My Profile',
    page: 'dashboard-profile',
    icon: User,
  },
  {
    label: 'My Votes',
    page: 'dashboard-votes',
    icon: Vote,
  },
  {
    label: 'Purchases',
    page: 'dashboard-purchases',
    icon: ShoppingCart,
  },
  {
    label: 'Referrals',
    page: 'dashboard-referrals',
    icon: Users,
  },
  {
    label: 'Settings',
    page: 'dashboard-settings',
    icon: Settings,
  },
];

const adminMenuItems = [
  {
    label: 'Admin Panel',
    page: 'admin',
    icon: Shield,
  },
  {
    label: 'Overview',
    page: 'admin',
    icon: BarChart3,
  },
  {
    label: 'Contestants',
    page: 'admin',
    icon: Crown,
    sublabel: 'manage',
  },
  {
    label: 'Users',
    page: 'admin',
    icon: UserPlus,
  },
  {
    label: 'My Profile',
    page: 'dashboard-profile',
    icon: User,
  },
  {
    label: 'Settings',
    page: 'dashboard-settings',
    icon: Settings,
  },
];

export default function DashboardSidebar() {
  const { currentPage, navigate } = useNavigationStore();
  const { user } = useAuthStore();

  const isAdmin = user?.role === 'admin';
  const menuItems = isAdmin ? adminMenuItems : userMenuItems;

  return (
    <aside className="w-full lg:w-64 shrink-0">
      <nav className="space-y-1">
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = currentPage === item.page;

          return (
            <button
              key={item.label}
              onClick={() => navigate(item.page)}
              className={cn(
                'w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all',
                isActive
                  ? 'bg-primary text-primary-foreground shadow-lg shadow-primary/25'
                  : 'text-muted-foreground hover:text-foreground hover:bg-muted'
              )}
            >
              <Icon className="w-4 h-4" />
              <div className="flex flex-col items-start">
                <span>{item.label}</span>
                {item.sublabel && (
                  <span className="text-[10px] opacity-70">{item.sublabel}</span>
                )}
              </div>
            </button>
          );
        })}
      </nav>
    </aside>
  );
}
