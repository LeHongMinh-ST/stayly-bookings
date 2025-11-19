import { create } from 'zustand'

interface AdminShellState {
  isSidebarCollapsed: boolean
  toggleSidebar: () => void
  setSidebarCollapsed: (value: boolean) => void
}

/**
 * useAdminShellStore keeps layout UI state such as sidebar collapse.
 */
export const useAdminShellStore = create<AdminShellState>((set) => ({
  isSidebarCollapsed: false,
  toggleSidebar: () =>
    set((state) => ({
      isSidebarCollapsed: !state.isSidebarCollapsed
    })),
  setSidebarCollapsed: (value) => set({ isSidebarCollapsed: value })
}))

