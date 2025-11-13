"use client";

import { Button } from "@/components/ui/button";
import {
	Dialog,
	DialogContent,
	DialogHeader,
	DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { api } from "@/trpc/react";
import { useEffect, useState } from "react";
import { useUserStore } from "../_store/userStore";

interface UserFormData {
	name: string;
	email: string;
	gender: string;
}

// Define types for avatar configuration
type AvatarConfig = {
	[key: string]: string | undefined; // Allow additional parameters
};

// Utility function to generate avatar URL parameters
const generateAvatarParams = (config: AvatarConfig): string => {
	return Object.entries(config)
		.filter(([_, value]) => value !== undefined)
		.map(([key, value]) => `${key}=${encodeURIComponent(value!)}`)
		.join("&");
};

const AVATAR_BASE_CONFIG = {
	mouth: "smile",
	eyebrows: "defaultNatural",
} as const;

const AVATAR_GENDER_CONFIG = {
	male: {
		top: "shaggy",
		accessories: "round",
		hairColor: "2c1b18",
		clothing: "blazerAndShirt",
		clothesColor: "2c1b18",
		eyes: "hearts",
	},
	female: {
		top: "straight01",
		accessories: "prescription01",
		hairColor: "c3b1e1",
		clothing: "overall",
		clothesColor: "fff6e3",
		eyes: "happy",
	},
};

export function InitializeUser() {
	const { user, setUser } = useUserStore();
	const [open, setOpen] = useState(false);
	const [userInfo, setUserInfo] = useState<UserFormData>({
		name: "",
		email: "",
		gender: "",
	});
	const [errors, setErrors] = useState<Partial<UserFormData>>({});

	const { mutate, isPending } = api.user.create.useMutation();

	useEffect(() => {
		if (!user) {
			setOpen(true);
		} else {
			setOpen(false);
		}
	}, [user]);

	const validateForm = (): boolean => {
		const newErrors: Partial<UserFormData> = {};

		if (!userInfo.name.trim()) newErrors.name = "Name is required";
		if (!userInfo.email.trim()) {
			newErrors.email = "Email is required";
		} else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(userInfo.email)) {
			newErrors.email = "Invalid email format";
		}
		if (!userInfo.gender) newErrors.gender = "Please select a gender";

		setErrors(newErrors);
		return Object.keys(newErrors).length === 0;
	};

	const handleSubmit = () => {
		if (!validateForm()) return;

		mutate(
			{
				name: userInfo.name.trim(),
				email: userInfo.email.trim(),
				emailVerified: new Date(),
				avatar: generateAvatarUrl(userInfo.name, userInfo.gender),
			},
			{
				onSuccess: newUser => {
					setUser({
						id: newUser?.id ?? "",
						name: newUser?.name ?? "",
						email: newUser?.email ?? "",
						avatar: newUser?.avatar ?? "",
					});
					setOpen(false);
				},
				onError: error => {
					console.error("Failed to create user:", error);
				},
			}
		);
	};

	const generateAvatarUrl = (name: string, gender: string) => {
		const genderConfig =
			gender === "male"
				? AVATAR_GENDER_CONFIG.male
				: AVATAR_GENDER_CONFIG.female;
		const avatarConfig = {
			...AVATAR_BASE_CONFIG,
			...genderConfig,
			seed: name,
		};

		return `https://api.dicebear.com/7.x/avataaars/svg?${generateAvatarParams(avatarConfig)}`;
	};

	return (
		<Dialog open={open} onOpenChange={setOpen}>
			<DialogContent>
				<DialogHeader>
					<DialogTitle>Welcome! Please enter your information</DialogTitle>
				</DialogHeader>
				<div className="grid gap-4 py-4">
					<div className="space-y-2">
						<Input
							placeholder="Name"
							value={userInfo.name}
							onChange={e =>
								setUserInfo(prev => ({ ...prev, name: e.target.value }))
							}
							className={errors.name ? "border-red-500" : ""}
						/>
						{errors.name && (
							<p className="text-sm text-red-500">{errors.name}</p>
						)}
					</div>

					<div className="space-y-2">
						<Input
							type="email"
							placeholder="Email"
							value={userInfo.email}
							onChange={e =>
								setUserInfo(prev => ({ ...prev, email: e.target.value }))
							}
							className={errors.email ? "border-red-500" : ""}
						/>
						{errors.email && (
							<p className="text-sm text-red-500">{errors.email}</p>
						)}
					</div>

					<div className="space-y-2">
						<RadioGroup
							value={userInfo.gender}
							onValueChange={value =>
								setUserInfo(prev => ({
									...prev,
									gender: value as UserFormData["gender"],
								}))
							}
							className={errors.gender ? "border-red-500 rounded p-2" : ""}
						>
							<RadioGroupLabel>Gender</RadioGroupLabel>
							<div className="flex flex-col gap-2">
								<div className="flex items-center space-x-2">
									<RadioGroupItem value="male" id="male" />
									<Label htmlFor="male">Male</Label>
								</div>
								<div className="flex items-center space-x-2">
									<RadioGroupItem value="female" id="female" />
									<Label htmlFor="female">Female</Label>
								</div>
								<div className="flex items-center space-x-2">
									<RadioGroupItem value="other" id="other" />
									<Label htmlFor="other">Other</Label>
								</div>
							</div>
						</RadioGroup>
						{errors.gender && (
							<p className="text-sm text-red-500">{errors.gender}</p>
						)}
					</div>
				</div>
				<Button
					className="bg-slate-800"
					onClick={handleSubmit}
					disabled={isPending}
				>
					{isPending ? "Submitting..." : "Submit"}
				</Button>
			</DialogContent>
		</Dialog>
	);
}

const RadioGroupLabel = ({ children }: { children: any }) => {
	return <div className="text-lg font-semibold">{children}</div>;
};
