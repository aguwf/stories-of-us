"use client";

import React from "react";
import {
  Navbar,
  NavbarBrand,
  NavbarContent,
  NavbarItem,
  NavbarMenuToggle,
  NavbarMenu,
  NavbarMenuItem,
  Button,
} from "@nextui-org/react";
import { TextOnlyLogo } from "@/app/_assets/logo/TextOnlyLogo";
import Link from "next/link";
import { useTranslations } from "next-intl";

export default function NavigationBar() {
  const t = useTranslations("RootLayout");
  const [isMenuOpen, setIsMenuOpen] = React.useState(false);

  const menuItems = [
    "Timeline",
    "All images",
    "Maps",
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
        <NavbarItem isActive>
          <Link color="foreground" href="#timeline">
            Timeline
          </Link>
        </NavbarItem>
        <NavbarItem className="cursor-not-allowed">
          <Link color="disable" href="#">
            All images
          </Link>
        </NavbarItem>
        <NavbarItem className="cursor-not-allowed">
          <Link color="disable" href="#">
            Maps
          </Link>
        </NavbarItem>
      </NavbarContent>
      <NavbarContent justify="end">
        <NavbarItem>
          <Button as={Link} color="primary" href="/sign-in/" variant="flat">
            {t("sign_in_link")}
          </Button>
        </NavbarItem>
        {/* <NavbarItem>
          <Button as={Link} color="primary" href="/sign-up/" variant="flat">
            {t("sign_up_link")}
          </Button>
        </NavbarItem> */}
      </NavbarContent>
      <NavbarMenu>
        {menuItems.map((item, index) => (
          <NavbarMenuItem key={`${item}-${index}`}>
            <Link
              color={
                index === 2
                  ? "primary"
                  : index === menuItems.length - 1
                    ? "danger"
                    : "foreground"
              }
              className="w-full"
              href="#"
            >
              {item}
            </Link>
          </NavbarMenuItem>
        ))}
      </NavbarMenu>
    </Navbar>
  );
}
