"use client";

import { AnimatePresence, motion } from "framer-motion";
import { MenuIcon } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useLocale } from "next-intl";
import React from "react";

import { SignedIn, SignedOut, UserButton } from "@clerk/nextjs";

import { Logo } from "@/app/_assets/logos/Logo";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  NavigationMenu,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  navigationMenuTriggerStyle,
} from "@/components/ui/navigation-menu";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { getI18nPath } from "@/utils/helpers";

// Types
interface NavItem {
  name: string;
  href: string;
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
  { name: "Timeline", href: "/timelines" },
  { name: "All images", href: "/images", isDisabled: true },
  { name: "Maps", href: "/maps" },
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
  const locale = useLocale();

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex relative justify-between items-center mx-auto h-14 md:justify-normal md:gap-0">
        <div className="flex items-center">
          <MainNav />
          <MobileNav />
        </div>
        <div className="flex flex-1 justify-center items-center md:hidden">
          <Logo />
        </div>
        <div className="hidden md:flex md:flex-1 md:items-center md:justify-end md:gap-4">
          <div className="flex-1 w-full md:w-auto md:flex-none">
            <SearchBar isOpen={isSearchOpen} setIsOpen={setIsSearchOpen} />
          </div>
          <AuthActions locale={locale} />
        </div>
      </div>
    </header>
  );
}

function MainNav() {
  return (
    <div className="hidden md:flex md:mr-4">
      <Link href="/" className="flex items-center mr-6 space-x-2">
        <motion.span
          {...logoAnimation}
          className="hidden font-bold sm:inline-block"
        >
          <Logo />
        </motion.span>
      </Link>
      <NavigationMenu>
        <NavigationMenuList>
          {NAV_ITEMS.map((item, index) => (
            <MenuItem key={`${item.href}-main`} item={item} index={index} />
          ))}
        </NavigationMenuList>
      </NavigationMenu>
    </div>
  );
}

const MenuItem = ({ item, index }: { item: NavItem; index: number }) => {
  const pathname = usePathname();
  const isActive =
    pathname === item.href || pathname?.startsWith(`${item.href}/`);

  return (
    <motion.div {...navItemAnimation(index)}>
      <NavigationMenuItem>
        <Link href={item.href} legacyBehavior={true} passHref={true}>
          <NavigationMenuLink
            className={`${navigationMenuTriggerStyle()} ${
              isActive ? "bg-accent text-accent-foreground" : ""
            } ${item.isDisabled ? "pointer-events-none opacity-50" : ""}`}
          >
            {item.name}
          </NavigationMenuLink>
        </Link>
      </NavigationMenuItem>
    </motion.div>
  );
};

function AuthActions({
  locale,
  onOpenChange,
}: {
  locale: string;
  onOpenChange?: () => void;
}) {
  const signInUrl = getI18nPath("/sign-in", locale);
  const signUpUrl = getI18nPath("/sign-up", locale);
  // const dashboardUrl = getI18nPath("/dashboard", locale);

  return (
    <div className="flex gap-2 items-center">
      <SignedOut>
        <Button
          variant="outline"
          size="sm"
          asChild={true}
          className="w-1/2 md:w-auto md:px-4 border-border text-foreground"
          onClick={onOpenChange}
        >
          <Link href={signInUrl}>Log in</Link>
        </Button>
        <Button
          size="sm"
          asChild={true}
          className="w-1/2 md:w-auto md:px-4 bg-primary text-primary-foreground hover:bg-primary/90"
          onClick={onOpenChange}
        >
          <Link href={signUpUrl}>Sign up</Link>
        </Button>
      </SignedOut>
      <SignedIn>
        <UserButton defaultOpen={false} />
      </SignedIn>
    </div>
  );
}

function MobileNav() {
  const [isOpen, setIsOpen] = React.useState(false);
  const pathname = usePathname();
  const locale = useLocale();

  return (
    <Sheet open={isOpen} onOpenChange={setIsOpen}>
      <SheetTrigger asChild={true}>
        <Button
          variant="ghost"
          className="absolute left-4 top-1/2 px-0 ml-2 text-base -translate-y-1/2 hover:bg-transparent focus-visible:bg-transparent focus-visible:ring-0 focus-visible:ring-offset-0 md:hidden"
        >
          <MenuIcon />
          <span className="sr-only">Toggle Menu</span>
        </Button>
      </SheetTrigger>
      <SheetContent side="left" className="pr-0">
        <MobileLink
          href="/"
          className="flex items-center"
          onOpenChange={() => setIsOpen(false)}
        >
          <Logo size="w-36 h-36" />
        </MobileLink>
        <div className="my-4 h-[calc(100vh-8rem)] pb-10 pl-6">
          <div className="flex flex-col space-y-3">
            {/* Divider */}
            <div className="my-6 mr-6 h-px bg-border" />
            {NAV_ITEMS.map((item) => {
              const isActive =
                pathname === item.href || pathname?.startsWith(`${item.href}/`);
              return (
                <MobileLink
                  key={`${item.href}-mobile`}
                  href={item.href}
                  onOpenChange={() => setIsOpen(false)}
                  className={
                    isActive
                      ? "p-2 rounded-md bg-accent text-accent-foreground"
                      : "p-2"
                  }
                >
                  {item.name}
                </MobileLink>
              );
            })}
          </div>
          <div className="pr-6">
            {/* Divider */}
            <div className="my-6 h-px bg-border" />
            <AuthActions
              locale={locale}
              onOpenChange={() => setIsOpen(false)}
            />
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
      <NavigationMenuLink asChild={true}>
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
