import type { UserType } from "@/types";
import { create } from "zustand";
import { persist } from "zustand/middleware";
import { immer } from "zustand/middleware/immer";

interface UserSlice {
	user: UserType | null;
	setUser: (user: UserType) => void;
	clearUser: () => void;
}

const createUserSlice = (
	set: (fn: (state: UserSlice) => void) => void
): UserSlice => ({
	user: null,
	setUser: user =>
		set(state => {
			state.user = user;
		}),
	clearUser: () =>
		set(state => {
			state.user = null;
		}),
});

export const useUserStore = create<UserSlice>()(
	persist(
		immer(set => ({
			...createUserSlice(set),
		})),
		{
			name: "user-storage",
			version: 1,
			partialize: state => ({ user: state.user }),
		}
	)
);
