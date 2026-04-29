import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface UIStore {
  theme: 'light' | 'dark';
  mobileMenuOpen: boolean;
  searchQuery: string;
  selectedCategory: string;
  setTheme: (theme: 'light' | 'dark') => void;
  toggleTheme: () => void;
  setMobileMenuOpen: (open: boolean) => void;
  setSearchQuery: (query: string) => void;
  setSelectedCategory: (category: string) => void;
}

export const useUIStore = create<UIStore>()(
  persist(
    (set, get) => ({
      theme: 'light',
      mobileMenuOpen: false,
      searchQuery: '',
      selectedCategory: 'all',
      setTheme: (theme) => {
        set({ theme });
        document.documentElement.classList.toggle('dark', theme === 'dark');
      },
      toggleTheme: () => {
        const newTheme = get().theme === 'light' ? 'dark' : 'light';
        set({ theme: newTheme });
        document.documentElement.classList.toggle('dark', newTheme === 'dark');
      },
      setMobileMenuOpen: (mobileMenuOpen) => set({ mobileMenuOpen }),
      setSearchQuery: (searchQuery) => set({ searchQuery }),
      setSelectedCategory: (selectedCategory) => set({ selectedCategory }),
    }),
    {
      name: 'ui-store',
      partialize: (state) => ({ theme: state.theme }),
    }
  )
);
