import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

// State types
interface States {
	theme: string;
}

interface Actions {
	setTheme: (theme: string) => void;
	toggleTheme: () => void;
}

export const useThemeStore = create(
	persist<States & Actions>(
		(set) => ({
			theme: "",
			setTheme: (theme) => set({ theme }),
			toggleTheme: () =>
				set((state) => ({ theme: state.theme === "light" ? "dark" : "light" })),
		}),
		{
			name: "theme-store",
			storage: createJSONStorage(() => localStorage),
		},
	),
);
