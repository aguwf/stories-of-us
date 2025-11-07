import { create } from "zustand";
import { persist } from "zustand/middleware";
import { immer } from "zustand/middleware/immer";

interface ThemeSlice {
	theme: string;
	setTheme: (theme: string) => void;
	toggleTheme: () => void;
}

const createThemeSlice = (
	set: (fn: (state: ThemeSlice) => void) => void,
): ThemeSlice => ({
	theme: "",
	setTheme: (theme) =>
		set((state) => {
			state.theme = theme;
		}),
	toggleTheme: () =>
		set((state) => {
			state.theme = state.theme === "light" ? "dark" : "light";
		}),
});

export const useThemeStore = create<ThemeSlice>()(
	persist(
		immer((set) => ({
			...createThemeSlice(set),
		})),
		{
			name: "theme-store",
			version: 1,
		},
	),
);
