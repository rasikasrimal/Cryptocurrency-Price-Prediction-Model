import { create } from "zustand";
import { devtools } from "zustand/middleware";

interface UIState {
  theme: "dark" | "light";
  isToolDrawerOpen: boolean;
  setTheme: (theme: UIState["theme"]) => void;
  toggleToolDrawer: () => void;
}

export const useUIStore = create<UIState>()(
  devtools((set) => ({
    theme: "dark",
    isToolDrawerOpen: false,
    setTheme: (theme) => set({ theme }),
    toggleToolDrawer: () => set((state) => ({ isToolDrawerOpen: !state.isToolDrawerOpen }))
  }))
);
