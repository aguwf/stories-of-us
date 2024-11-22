"use client";

import { TextOnlyLogo } from "@/app/_assets/logos/TextOnlyLogo";
import {
	Button,
	Navbar,
	NavbarBrand,
	NavbarContent,
	NavbarItem,
	NavbarMenu,
	NavbarMenuItem,
	NavbarMenuToggle,
} from "@nextui-org/react";
import { useTranslations } from "next-intl";
import Link from "next/link";
import React from "react";

export default function NavigationBar() {
	const t = useTranslations("RootLayout");
	const [isMenuOpen, setIsMenuOpen] = React.useState(false);

	const menuItems = [
		{ name: "Timeline", href: "/timelines", isActive: true },
		{ name: "All images", href: "/images", isDisabled: true },
		{ name: "Maps", href: "/maps", isDisabled: true },
		{ name: "Portfolio", href: "/portfolio" },
	];

	return (
		<Navbar onMenuOpenChange={setIsMenuOpen}>
			<NavbarContent>
				<NavbarMenuToggle
					aria-label={isMenuOpen ? "Close menu" : "Open menu"}
					className="sm:hidden"
				/>
				<NavbarBrand>
					<TextOnlyLogo size="text-md" />
				</NavbarBrand>
			</NavbarContent>

			<NavbarContent className="hidden gap-4 sm:flex" justify="center">
				{menuItems.map((item) => (
					<NavbarItem
						key={item.name}
						isActive={item.isActive}
						className={item.isDisabled ? "cursor-not-allowed" : ""}
					>
						<Link
							className={
								item.isDisabled ? "pointer-events-none cursor-not-allowed" : ""
							}
							color={item.isDisabled ? "disable" : "foreground"}
							href={item.href}
						>
							{item.name}
						</Link>
					</NavbarItem>
				))}
			</NavbarContent>
			<NavbarContent justify="end">
				<NavbarItem>
					<Button as={Link} color="primary" href="/sign-in/" variant="flat">
						{t("sign_in_link")}
					</Button>
				</NavbarItem>
			</NavbarContent>
			<NavbarMenu>
				{menuItems.map((item, index) => (
					<NavbarMenuItem key={item.name}>
						<Link
							color={
								index === 0
									? "primary"
									: index === menuItems.length - 1
										? "danger"
										: "foreground"
							}
							className={`w-full ${item.isDisabled ? "cursor-not-allowed" : ""}`}
							href={item.href}
						>
							{item.name}
						</Link>
					</NavbarMenuItem>
				))}
			</NavbarMenu>
		</Navbar>
	);
}
