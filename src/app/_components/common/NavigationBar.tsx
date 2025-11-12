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
import { MenuIcon, Search, User } from "lucide-react";

// Types
interface NavItem {
	name: string;
	href: string;
	isActive?: boolean;
	isDisabled?: boolean;
}

interface SearchBarProps {
	isOpen: boolean;
	setIsOpen: (open: boolean) => void;
}

interface MobileLinkProps extends React.PropsWithChildren {
	href: string;
	onOpenChange?: (open: boolean) => void;
	className?: string;
}

// Constants
const EASING = [0.68, -0.55, 0.265, 1.55] as const;
const ANIMATION_DURATION = 0.5;
const ITEM_DELAY_INCREMENT = 0.1;
const SEARCH_ANIMATION_DURATION = 1;

const NAV_ITEMS: NavItem[] = [
	{ name: "Timeline", href: "/timelines", isActive: true },
	{ name: "All images", href: "/images", isDisabled: true },
	{ name: "Maps", href: "/maps", isDisabled: true },
	{ name: "Portfolio", href: "/portfolio" },
];

// Animation variants
const logoAnimation = {
	initial: { opacity: 0, x: -20 },
	animate: { opacity: 1, x: 0 },
	transition: {
		duration: ANIMATION_DURATION,
		ease: EASING,
	},
};

const navItemAnimation = (index: number) => ({
	initial: { opacity: 0, y: -20 },
	animate: { opacity: 1, y: 0 },
	transition: {
		duration: ANIMATION_DURATION,
		delay: index * ITEM_DELAY_INCREMENT,
		ease: EASING,
	},
});

const searchAnimation = {
	initial: { opacity: 0, y: -20 },
	animate: { opacity: 1, y: 0 },
	exit: { opacity: 0, y: -20 },
	transition: {
		duration: SEARCH_ANIMATION_DURATION,
		ease: EASING,
	},
};

const inputWidthAnimation = {
	initial: { width: 0 },
	animate: { width: "100%" },
	transition: {
		duration: SEARCH_ANIMATION_DURATION,
		ease: EASING,
	},
};

export default function NavigationBar() {
	const [isSearchOpen, setIsSearchOpen] = React.useState(false);

	return (
		<header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
			<div className="container flex items-center justify-between h-14 md:justify-normal md:gap-0">
				<div className="flex items-center">
					<MainNav />
					<MobileNav />
				</div>
				<div className="flex flex-1 items-center justify-center md:hidden">
					<TextOnlyLogo size="text-md" />
				</div>
				<div className="flex items-center gap-2 md:hidden">
					<Button
						variant="ghost"
						size="icon"
						className="hover:bg-transparent focus-visible:ring-0"
					>
						<User className="w-5 h-5" />
						<span className="sr-only">User profile</span>
					</Button>
				</div>
				<div className="hidden md:flex md:flex-1 md:justify-end">
					<div className="flex-1 w-full md:w-auto md:flex-none">
						<SearchBar isOpen={isSearchOpen} setIsOpen={setIsSearchOpen} />
					</div>
				</div>
			</div>
		</header>
	);
}

function MainNav() {
	return (
		<div className="hidden mr-4 md:flex">
			<Link href="/" className="flex items-center mr-6 space-x-2">
				<motion.span
					{...logoAnimation}
					className="hidden font-bold sm:inline-block"
				>
					<TextOnlyLogo size="text-md" />
				</motion.span>
			</Link>
			<NavigationMenu>
				<NavigationMenuList>
					{NAV_ITEMS.map((item, index) => (
						<motion.div
							key={`${item.href}-main`}
							{...navItemAnimation(index)}
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

function MobileNav() {
	return (
		<Sheet>
			<SheetTrigger asChild>
				<Button
					variant="ghost"
					className="px-0 ml-2 text-base hover:bg-transparent focus-visible:bg-transparent focus-visible:ring-0 focus-visible:ring-offset-0 md:hidden"
				>
					<MenuIcon />
					<span className="sr-only">Toggle Menu</span>
				</Button>
			</SheetTrigger>
			<SheetContent side="left" className="pr-0">
				<MobileLink href="/" className="flex items-center" onOpenChange={() => {}}>
					<TextOnlyLogo size="text-md" />
				</MobileLink>
				<div className="my-4 h-[calc(100vh-8rem)] pb-10 pl-6">
					<div className="flex flex-col space-y-3">
						{NAV_ITEMS.map((item) => (
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

function MobileLink({
	href,
	onOpenChange,
	className,
	children,
}: MobileLinkProps) {
	return (
		<Link
			href={href}
			onClick={() => onOpenChange?.(false)}
			className={className}
		>
			{children}
		</Link>
	);
}

function SearchBar({ isOpen, setIsOpen }: SearchBarProps) {
	return (
		<AnimatePresence>
			{isOpen && (
				<motion.div
					{...searchAnimation}
					className="absolute left-0 top-full w-full bg-background md:static md:block"
				>
					<div className="container flex justify-between items-center p-4 md:p-0">
						<motion.div {...inputWidthAnimation}>
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
