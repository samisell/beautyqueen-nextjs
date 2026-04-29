'use client';

import { useEffect, useState } from 'react';
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
  Bell,
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
    label: 'Notifications',
    page: 'dashboard-notifications',
    icon: Bell,
    showBadge: true,
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
    label: 'Notifications',
    page: 'dashboard-notifications',
    icon: Bell,
    showBadge: true,
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
  const { user, token } = useAuthStore();
  const [unreadCount, setUnreadCount] = useState(0);

  const isAdmin = user?.role === 'admin';
  const menuItems = isAdmin ? adminMenuItems : userMenuItems;

  // Fetch unread count on mount
  useEffect(() => {
    async function fetchUnread() {
      if (!token) return;
      try {
        const res = await fetch('/api/user/notifications?limit=1', {
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
        });
        const data = await res.json();
        if (data.success) {
          setUnreadCount(data.unreadCount ?? 0);
        }
      } catch {
        // Ignore
      }
    }
    fetchUnread();
  }, [token]);

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
              <div className="relative">
                <Icon className="w-4 h-4" />
                {item.showBadge && unreadCount > 0 && (
                  <span className="absolute -top-1.5 -right-1.5 w-4 h-4 rounded-full bg-red-500 text-white text-[9px] font-bold flex items-center justify-center leading-none">
                    {unreadCount > 9 ? '9+' : unreadCount}
                  </span>
                )}
              </div>
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
