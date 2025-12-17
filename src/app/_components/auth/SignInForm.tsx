"use client";

import { useSignIn } from "@clerk/nextjs";
import { Eye, EyeOff, Loader2 } from "lucide-react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useMemo, useState, useTransition } from "react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { getI18nPath } from "@/utils/helpers";

type SignInFormProps = {
	locale: string;
};

type FormState = {
	identifier: string;
	password: string;
	remember: boolean;
};

export function SignInForm({ locale }: SignInFormProps) {
	const router = useRouter();
	const searchParams = useSearchParams();
	const redirectTo = useMemo(
		() => searchParams.get("redirect_url") ?? getI18nPath("/dashboard", locale),
		[locale, searchParams]
	);

	const { isLoaded, signIn, setActive } = useSignIn();
	const [formState, setFormState] = useState<FormState>({
		identifier: "",
		password: "",
		remember: true,
	});
	const [showPassword, setShowPassword] = useState(false);
	const [error, setError] = useState<string | null>(null);
	const [info, setInfo] = useState<string | null>(null);
	const [isPending, startTransition] = useTransition();

	useEffect(() => {
		const savedIdentifier = window.localStorage.getItem("lastIdentifier");
		if (savedIdentifier) {
			setFormState(prev => ({ ...prev, identifier: savedIdentifier }));
		}
	}, []);

	const handleChange =
		(key: keyof FormState) => (event: React.ChangeEvent<HTMLInputElement>) => {
			const value =
				key === "remember" ? event.target.checked : event.target.value;
			setFormState(prev => ({ ...prev, [key]: value }));
		};

	const getClerkError = (err: unknown, fallback: string) => {
		const longMessage = (
			err as { errors?: Array<{ longMessage?: string }> }
		)?.errors?.[0]?.longMessage;
		return longMessage ?? fallback;
	};

	const handleSubmit = (event: React.FormEvent) => {
		event.preventDefault();
		if (!isLoaded) return;

		setError(null);
		setInfo(null);

		startTransition(async () => {
			try {
				const attempt = await signIn?.create({
					identifier: formState.identifier,
					password: formState.password,
					strategy: "password",
				});

				if (attempt?.status === "complete" && attempt.createdSessionId) {
					if (formState.remember) {
						window.localStorage.setItem(
							"lastIdentifier",
							formState.identifier.trim()
						);
					} else {
						window.localStorage.removeItem("lastIdentifier");
					}

					await setActive?.({ session: attempt.createdSessionId });
					router.push(redirectTo);
					router.refresh();
					return;
				}

				setError("We couldn’t complete the sign in. Please try again.");
			} catch (err: unknown) {
				setError(
					getClerkError(err, "Invalid credentials. Please try again.")
				);
			}
		});
	};

	const handleForgotPassword = () => {
		if (!isLoaded) return;
		if (!formState.identifier) {
			setError("Enter your email to reset your password.");
			return;
		}

		setError(null);
		setInfo(null);
		startTransition(async () => {
			try {
				await signIn?.create({
					identifier: formState.identifier,
					strategy: "reset_password_email_code",
				});
				setInfo("Check your inbox for reset instructions.");
			} catch (err: unknown) {
				setError(
					getClerkError(
						err,
						"Unable to start password reset right now."
					)
				);
			}
		});
	};

	return (
		<div className="w-full max-w-md px-4">
			<Card className="shadow-lg border-border bg-card/80 backdrop-blur">
				<CardHeader className="space-y-1">
					<CardTitle className="text-2xl font-semibold text-foreground">
						Welcome back
					</CardTitle>
					<p className="text-sm text-muted-foreground">
						Sign in to continue your story journey.
					</p>
				</CardHeader>

				<CardContent>
					<form className="space-y-6" onSubmit={handleSubmit}>
						<div className="space-y-2">
							<Label htmlFor="identifier">Email or username</Label>
							<Input
								id="identifier"
								autoComplete="username"
								placeholder="you@example.com"
								value={formState.identifier}
								onChange={handleChange("identifier")}
								required={true}
							/>
						</div>

						<div className="space-y-2">
							<div className="flex items-center justify-between">
								<Label htmlFor="password">Password</Label>
								<button
									type="button"
									className="text-sm text-muted-foreground hover:text-foreground inline-flex items-center gap-2"
									onClick={() => setShowPassword(prev => !prev)}
								>
									{showPassword ? (
										<>
											<EyeOff className="h-4 w-4" />
											Hide
										</>
									) : (
										<>
											<Eye className="h-4 w-4" />
											Show
										</>
									)}
								</button>
							</div>
							<div className="relative">
								<Input
									id="password"
									type={showPassword ? "text" : "password"}
									autoComplete="current-password"
									placeholder="••••••••"
									value={formState.password}
									onChange={handleChange("password")}
									required={true}
									className="pr-10"
								/>
							</div>
						</div>

						<div className="flex items-center justify-between gap-4 text-sm">
							<label className="inline-flex items-center gap-2 cursor-pointer">
								<input
									type="checkbox"
									className="h-4 w-4 rounded border-border text-primary focus:ring-2 focus:ring-ring"
									checked={formState.remember}
									onChange={handleChange("remember")}
								/>
								<span className="text-foreground">Remember me</span>
							</label>
							<button
								type="button"
								className="text-accent-foreground hover:underline"
								onClick={handleForgotPassword}
								disabled={isPending}
							>
								Forgot password?
							</button>
						</div>

						{error ? (
							<div className="rounded-md border border-destructive/60 bg-destructive/10 px-3 py-2 text-sm text-destructive-foreground">
								{error}
							</div>
						) : null}

						{info ? (
							<div className="rounded-md border border-accent/60 bg-accent/10 px-3 py-2 text-sm text-foreground">
								{info}
							</div>
						) : null}

						<Button
							type="submit"
							className="w-full bg-primary text-primary-foreground hover:bg-primary/90"
							disabled={isPending || !isLoaded}
						>
							{isPending ? (
								<>
									<Loader2 className="h-4 w-4 animate-spin" />
									<span className="ml-2">Signing in...</span>
								</>
							) : (
								"Sign in"
							)}
						</Button>
					</form>

					<div className="mt-6 text-center text-sm text-muted-foreground">
						Don&apos;t have an account?{" "}
						<Link
							href={getI18nPath("/sign-up", locale)}
							className="text-primary underline-offset-4 hover:underline"
						>
							Create one
						</Link>
					</div>
				</CardContent>
			</Card>
		</div>
	);
}
