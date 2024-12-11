"use client";

import { TextOnlyLogo } from "@/app/_assets/logos/TextOnlyLogo";
import {
  NavigationMenu,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  navigationMenuTriggerStyle,
} from "@/components/ui/navigation-menu";

import Link from "next/link";
import React from "react";
import { Button } from "@/components/ui/button";
import { AnimatePresence, motion } from "framer-motion";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Input } from "@/components/ui/input";

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
      <div className="container flex h-14 items-center">
        <MainNav navItems={navItems} />
        <MobileNav navItems={navItems} />
        <div className="flex flex-1 items-center justify-between space-x-2 md:justify-end">
          <div className="w-full flex-1 md:w-auto md:flex-none">
            <SearchBar isOpen={isSearchOpen} setIsOpen={setIsSearchOpen} />
          </div>
          <nav className="flex items-center space-x-1">
            <Button
              variant="ghost"
              size="icon"
              className="h-9 w-9 md:hidden"
              onClick={() => setIsSearchOpen(!isSearchOpen)}
            >
              {/* <Search className="h-4 w-4" /> */}
              <span className="sr-only">Toggle search</span>
            </Button>
          </nav>
        </div>
      </div>
    </header>
  );
}

function MainNav({ navItems }: any) {
  return (
    <div className="mr-4 hidden md:flex">
      <Link href="/" className="mr-6 flex items-center space-x-2">
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
          className="mr-2 px-0 text-base hover:bg-transparent focus-visible:bg-transparent focus-visible:ring-0 focus-visible:ring-offset-0 md:hidden"
        >
          {/* <Menu className="h-5 w-5" /> */}
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
              <MobileLink key={`${item.href}-mobile`} href={item.href} onOpenChange={() => {}}>
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
          <div className="container flex items-center justify-between p-4 md:p-0">
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
              className="h-9 w-9 shrink-0 md:hidden"
              onClick={() => setIsOpen(false)}
            >
              {/* <X className="h-4 w-4" /> */}
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
          className={`block select-none space-y-1 rounded-md p-3 leading-none no-underline outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground ${className}`}
          {...props}
        >
          <div className="text-sm font-medium leading-none">{title}</div>
          <p className="line-clamp-2 text-sm leading-snug text-muted-foreground">
            {children}
          </p>
        </a>
      </NavigationMenuLink>
    </li>
  );
});
ListItem.displayName = "ListItem";

