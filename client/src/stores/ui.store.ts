import { create } from "zustand";

interface UIState {
  sidebarOpen: boolean;
  toggleSidebar: () => void;
  setSidebarOpen: (open: boolean) => void;
  mobileSidebarOpen: boolean;
  toggleMobileSidebar: () => void;
  setMobileSidebarOpen: (open: boolean) => void;
}

export const useUIStore = create<UIState>((set) => ({
  sidebarOpen: true,
  toggleSidebar: () =>
    set((state) => ({ sidebarOpen: !state.sidebarOpen })),
  setSidebarOpen: (open) => set({ sidebarOpen: open }),
  mobileSidebarOpen: false,
  toggleMobileSidebar: () =>
    set((state) => ({
      mobileSidebarOpen: !state.mobileSidebarOpen,
    })),
  setMobileSidebarOpen: (open) => set({ mobileSidebarOpen: open }),
}));
