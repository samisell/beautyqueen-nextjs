import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { PageRoute } from '@/types';

interface NavigationStore {
  currentPage: PageRoute;
  pageParams: Record<string, string>;
  previousPages: PageRoute[];
  navigate: (page: PageRoute, params?: Record<string, string>) => void;
  goBack: () => void;
}

export const useNavigationStore = create<NavigationStore>()(
  persist(
    (set, get) => ({
      currentPage: 'home',
      pageParams: {},
      previousPages: [],
      navigate: (page, params = {}) => {
        const { currentPage, previousPages } = get();
        if (page !== currentPage) {
          set({
            previousPages: [...previousPages.slice(-10), currentPage],
            currentPage: page,
            pageParams: params,
          });
        } else if (Object.keys(params).length > 0) {
          set({ pageParams: params });
        }
        window.scrollTo(0, 0);
      },
      goBack: () => {
        const { previousPages } = get();
        if (previousPages.length > 0) {
          const prevPage = previousPages[previousPages.length - 1];
          set({
            currentPage: prevPage,
            previousPages: previousPages.slice(0, -1),
            pageParams: {},
          });
          window.scrollTo(0, 0);
        }
      },
    }),
    {
      name: 'navigation-store',
      partialize: (state) => ({ currentPage: state.currentPage }),
    }
  )
);
