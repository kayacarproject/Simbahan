import { create } from 'zustand';

type ToastMessage = {
  text: string;
  type: 'success' | 'error' | 'info';
} | null;

type UiState = {
  activeTab: string;
  toastMessage: ToastMessage;
  sidebarOpen: boolean;
  setActiveTab: (tab: string) => void;
  showToast: (text: string, type?: ToastMessage['type']) => void;
  hideToast: () => void;
  openSidebar: () => void;
  closeSidebar: () => void;
};

export const useUiStore = create<UiState>((set) => ({
  activeTab: 'index',
  toastMessage: null,
  sidebarOpen: false,

  setActiveTab: (tab) => set({ activeTab: tab }),
  showToast: (text, type = 'info') => set({ toastMessage: { text, type } }),
  hideToast: () => set({ toastMessage: null }),
  openSidebar: () => set({ sidebarOpen: true }),
  closeSidebar: () => set({ sidebarOpen: false }),
}));
