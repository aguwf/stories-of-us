"use client";

import { TextOnlyLogo } from "@/app/_assets/logos/TextOnlyLogo";
import {
	NavigationMenu,
	NavigationMenuItem,
	NavigationMenuLink,
	NavigationMenuList,
	navigationMenuTriggerStyle,
} from "@/components/ui/navigation-menu";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { AnimatePresence, motion } from "framer-motion";
import Link from "next/link";
import React from "react";

export default function NavigationBar() {
	const [isSearchOpen, setIsSearchOpen] = React.useState(false);

	const navItems = [
		{ name: "Timeline", href: "/timelines", isActive: true },
		{ name: "All images", href: "/images", isDisabled: true },
		{ name: "Maps", href: "/maps", isDisabled: true },
		{ name: "Portfolio", href: "/portfolio" },
	];

	return (
		<header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
			<div className="container flex items-center h-14">
				<MainNav navItems={navItems} />
				<MobileNav navItems={navItems} />
				<div className="flex flex-1 justify-between items-center space-x-2 md:justify-end">
					<div className="flex-1 w-full md:w-auto md:flex-none">
						<SearchBar isOpen={isSearchOpen} setIsOpen={setIsSearchOpen} />
					</div>
					<nav className="flex items-center space-x-1"></nav>
				</div>
			</div>
		</header>
	);
}

function MainNav({ navItems }: any) {
	return (
		<div className="hidden mr-4 md:flex">
			<Link href="/" className="flex items-center mr-6 space-x-2">
				<motion.span
					initial={{ opacity: 0, x: -20 }}
					animate={{ opacity: 1, x: 0 }}
					transition={{
						duration: 0.5,
						ease: [0.68, -0.55, 0.265, 1.55],
					}}
					className="hidden font-bold sm:inline-block"
				>
					<TextOnlyLogo size="text-md" />
				</motion.span>
			</Link>
			<NavigationMenu>
				<NavigationMenuList>
					{navItems.map((item: any, index: any) => (
						<motion.div
							key={`${item.href}-main`}
							initial={{ opacity: 0, y: -20 }}
							animate={{ opacity: 1, y: 0 }}
							transition={{
								duration: 0.5,
								delay: index * 0.1,
								ease: [0.68, -0.55, 0.265, 1.55],
							}}
						>
							<NavigationMenuItem>
								<Link href={item.href} legacyBehavior passHref>
									<NavigationMenuLink className={navigationMenuTriggerStyle()}>
										{item.name}
									</NavigationMenuLink>
								</Link>
							</NavigationMenuItem>
						</motion.div>
					))}
				</NavigationMenuList>
			</NavigationMenu>
		</div>
	);
}

function MobileNav({ navItems }: any) {
	return (
		<Sheet>
			<SheetTrigger asChild>
				<Button
					variant="ghost"
					className="px-0 mr-2 text-base hover:bg-transparent focus-visible:bg-transparent focus-visible:ring-0 focus-visible:ring-offset-0 md:hidden"
				>
					{/* <Menu className="w-5 h-5" /> */}
					<span className="sr-only">Toggle Menu</span>
				</Button>
			</SheetTrigger>
			<SheetContent side="left" className="pr-0">
				<MobileLink
					href="/"
					className="flex items-center"
					onOpenChange={() => {}}
				>
					<TextOnlyLogo size="text-md" />
				</MobileLink>
				<div className="my-4 h-[calc(100vh-8rem)] pb-10 pl-6">
					<div className="flex flex-col space-y-3">
						{navItems.map((item: any) => (
							<MobileLink
								key={`${item.href}-mobile`}
								href={item.href}
								onOpenChange={() => {}}
							>
								{item.name}
							</MobileLink>
						))}
					</div>
				</div>
			</SheetContent>
		</Sheet>
	);
}

interface MobileLinkProps extends React.PropsWithChildren {
	href: string;
	onOpenChange?: (open: boolean) => void;
	className?: string;
}

function MobileLink({
	href,
	onOpenChange,
	className,
	children,
}: MobileLinkProps) {
	return (
		<Link
			href={href}
			onClick={() => {
				onOpenChange?.(false);
			}}
			className={className}
		>
			{children}
		</Link>
	);
}

function SearchBar({
	isOpen,
	setIsOpen,
}: {
	isOpen: boolean;
	setIsOpen: (open: boolean) => void;
}) {
	return (
		<AnimatePresence>
			{isOpen && (
				<motion.div
					initial={{ opacity: 0, y: -20 }}
					animate={{ opacity: 1, y: 0 }}
					exit={{ opacity: 0, y: -20 }}
					transition={{
						duration: 0.3,
						ease: [0.68, -0.55, 0.265, 1.55],
					}}
					className="absolute left-0 top-full w-full bg-background md:static md:block"
				>
					<div className="container flex justify-between items-center p-4 md:p-0">
						<motion.div
							initial={{ width: 0 }}
							animate={{ width: "100%" }}
							transition={{
								duration: 0.3,
								ease: [0.68, -0.55, 0.265, 1.55],
							}}
						>
							<Input
								type="search"
								placeholder="Search..."
								className="w-full md:w-[200px] lg:w-[300px]"
							/>
						</motion.div>
						<Button
							variant="ghost"
							size="icon"
							className="w-9 h-9 shrink-0 md:hidden"
							onClick={() => setIsOpen(false)}
						>
							{/* <X className="w-4 h-4" /> */}
							<span className="sr-only">Close search</span>
						</Button>
					</div>
				</motion.div>
			)}
		</AnimatePresence>
	);
}

const ListItem = React.forwardRef<
	React.ElementRef<"a">,
	React.ComponentPropsWithoutRef<"a">
>(({ className, title, children, ...props }, ref) => {
	return (
		<li>
			<NavigationMenuLink asChild>
				<a
					ref={ref}
					className={`block p-3 space-y-1 leading-none no-underline rounded-md transition-colors outline-none select-none hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground ${className}`}
					{...props}
				>
					<div className="text-sm font-medium leading-none">{title}</div>
					<p className="text-sm leading-snug line-clamp-2 text-muted-foreground">
						{children}
					</p>
				</a>
			</NavigationMenuLink>
		</li>
	);
});
ListItem.displayName = "ListItem";
