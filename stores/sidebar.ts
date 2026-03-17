import { create } from 'zustand';

interface SidebarState {
  /** Desktop: sidebar collapsed to icons only */
  collapsed: boolean;
  /** Mobile: sidebar overlay open */
  mobileOpen: boolean;
  toggleCollapse: () => void;
  openMobile: () => void;
  closeMobile: () => void;
}

export const useSidebarStore = create<SidebarState>((set) => ({
  collapsed: false,
  mobileOpen: false,
  toggleCollapse: () => set((s) => ({ collapsed: !s.collapsed })),
  openMobile: () => set({ mobileOpen: true }),
  closeMobile: () => set({ mobileOpen: false }),
}));
