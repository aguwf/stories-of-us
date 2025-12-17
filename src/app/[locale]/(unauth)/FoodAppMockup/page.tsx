import type * as React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  ChevronLeft,
  Search,
  Star,
  Phone,
  MessageCircle,
  MoreHorizontal,
} from "lucide-react";

const bgPattern = "bg-[radial-gradient(circle_at_top,_#1c1c1f,_#050509_60%)]";

export default function FoodAppMockup() {
  return (
    <div
      className={`min-h-screen ${bgPattern} text-slate-900 flex items-center justify-center px-4 py-10`}
    >
      <div className="flex flex-col gap-8 md:flex-row md:gap-10 max-w-6xl">
        <DiscoverScreen />
        <UltimatePackScreen />
        <TrackingScreen />
      </div>
    </div>
  );
}

/* --------------------------- 1. Discover screen --------------------------- */

const DiscoverScreen: React.FC = () => {
  return (
    <PhoneFrame>
      <div className="flex items-center justify-between gap-3 mb-6">
        <div>
          <p className="text-xs text-slate-400 font-medium">Hi John,</p>
          <p className="text-xs text-slate-400">Welcome back!</p>
        </div>
        <Avatar className="w-9 h-9 border border-slate-200">
          <AvatarFallback className="text-xs bg-amber-400 text-slate-900">
            J
          </AvatarFallback>
        </Avatar>
      </div>

      <div className="mb-4">
        <h2 className="text-xl font-semibold tracking-tight">Discover</h2>
        <p className="text-[11px] text-slate-400">
          The delicious taste of our Fast Food!
        </p>
      </div>

      <div className="relative mb-5">
        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
        <Input
          className="pl-9 pr-3 py-2 h-9 text-xs rounded-2xl bg-slate-50 border-0 shadow-sm placeholder:text-slate-400"
          placeholder="Search for Food..."
        />
      </div>

      {/* Deal of the day card */}
      <Card className="relative mb-5 rounded-2xl border-0 bg-[#4f7df7] text-white shadow-lg">
        <CardContent className="p-4">
          <p className="text-[11px] mb-1 opacity-90">Deal of The Day</p>
          <p className="text-2xl font-extrabold leading-tight mb-1">25% OFF</p>
          <p className="text-[11px] opacity-90 mb-3">For Candy</p>

          <div className="flex items-end justify-between">
            <div className="h-7 w-16 rounded-full bg-[#ffcc4d] shadow-md flex items-center justify-center text-[10px] text-slate-900 font-semibold">
              Order Now
            </div>
            {/* khu vực art (placeholder) */}
            <div className="relative">
              <div className="w-20 h-14 rounded-2xl bg-[#ffcc4d] rotate-[-6deg] shadow-md flex items-center justify-center text-lg">
                🍕
              </div>
              <div className="absolute -top-3 -left-3 text-xl">🍭</div>
              <div className="absolute -bottom-4 right-2 text-xl">🌭</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Fast order list */}
      <div className="flex items-center justify-between mb-2">
        <p className="text-sm font-semibold">Fast Order</p>
        <button
          type="button"
          className="text-[11px] text-slate-400 flex items-center gap-1"
        >
          See More
          <span className="text-xs">›</span>
        </button>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <FoodTile
          title="Cheese Burger"
          desc="Meat, Cheese, Tomato"
          price="$10.55"
          emoji="🍔"
        />
        <FoodTile
          title="Hot Dog"
          desc="Hot dog, Onion, Tomato"
          price="$8.36"
          emoji="🌭"
        />
      </div>

      {/* bottom nav */}
      <div className="mt-auto pt-4 flex items-center justify-between text-[11px] text-slate-500">
        <div className="flex flex-col items-center gap-1">
          <span className="w-8 h-8 rounded-full bg-[#ffc94d] flex items-center justify-center text-lg">
            🏠
          </span>
          <span>Home</span>
        </div>
        <div className="flex flex-col items-center gap-1">
          <span className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-lg">
            🔍
          </span>
          <span>Search</span>
        </div>
        <div className="flex flex-col items-center gap-1">
          <span className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-lg">
            🛒
          </span>
          <span>Cart</span>
        </div>
      </div>
    </PhoneFrame>
  );
};

interface FoodTileProps {
  title: string;
  desc: string;
  price: string;
  emoji: string;
}

const FoodTile: React.FC<FoodTileProps> = ({ title, desc, price, emoji }) => (
  <Card className="rounded-2xl border border-slate-100 shadow-sm">
    <CardContent className="p-3 flex flex-col gap-2">
      <div className="w-full rounded-xl bg-[#fff3cc] flex items-center justify-center text-3xl">
        {emoji}
      </div>
      <div>
        <p className="text-xs font-semibold">{title}</p>
        <p className="text-[10px] text-slate-400 leading-tight">{desc}</p>
      </div>
      <div className="flex items-center justify-between mt-1">
        <span className="text-xs font-semibold">{price}</span>
        <Button className="h-7 w-7 rounded-full p-0 bg-[#ffc94d] hover:bg-[#f7b936] text-slate-900 text-lg">
          +
        </Button>
      </div>
    </CardContent>
  </Card>
);

/* --------------------------- 2. Ultimate Pack ---------------------------- */

const UltimatePackScreen: React.FC = () => {
  return (
    <PhoneFrame>
      <header className="flex items-center justify-between mb-4">
        <Button
          size="icon"
          className="h-8 w-8 rounded-full bg-[#ffe0a8] hover:bg-[#ffd593] text-slate-900"
        >
          <ChevronLeft className="w-4 h-4" />
        </Button>
        <span className="text-[11px] text-slate-400">Fast Food</span>
        <Button
          size="icon"
          variant="ghost"
          className="h-8 w-8 rounded-full text-slate-400 hover:bg-slate-50"
        >
          <MoreHorizontal className="w-4 h-4" />
        </Button>
      </header>

      {/* big illustration */}
      <div className="relative mb-5">
        <div className="w-full h-40 rounded-3xl bg-[#eef2ff] flex items-center justify-center">
          <div className="relative w-40 h-32 rounded-3xl bg-[#fdd36a] shadow-xl flex items-center justify-center">
            <span className="text-5xl">🍕</span>
            <span className="absolute -top-4 left-1 text-3xl">🥤</span>
            <span className="absolute -top-5 right-4 text-3xl">🍟</span>
          </div>
        </div>
      </div>

      <div className="mb-2">
        <h2 className="text-lg font-semibold">The Ultimate Pack</h2>
        <p className="text-[10px] text-slate-400">
          A BIG slice of Pizza, Potato and Soda
        </p>
      </div>

      <div className="flex items-center justify-between mb-3">
        {/* quantity selector */}
        <div className="flex items-center gap-2">
          <Button
            size="icon"
            className="h-8 w-8 rounded-full bg-[#ffe0a8] hover:bg-[#ffd18b] text-slate-900"
          >
            -
          </Button>
          <div className="w-10 h-8 rounded-full bg-[#ffc94d] flex items-center justify-center text-sm font-semibold text-slate-900">
            3
          </div>
          <Button
            size="icon"
            className="h-8 w-8 rounded-full bg-[#ffe0a8] hover:bg-[#ffd18b] text-slate-900"
          >
            +
          </Button>
        </div>
        <div className="text-right">
          <p className="text-xs text-slate-400 mb-0.5">Price</p>
          <p className="text-lg font-semibold">$22.99</p>
        </div>
      </div>

      <div className="flex items-center justify-between text-[11px] text-slate-500 mb-3">
        <div className="flex items-center gap-1.5">
          <Star className="w-3.5 h-3.5 fill-[#ffc94d] text-[#ffc94d]" />
          <span>4.6</span>
        </div>
        <span>Fast Delivery</span>
      </div>

      <p className="text-[10px] text-slate-400 mb-4 leading-snug">
        Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod
        tempor incididunt ut labore et dolore magna aliqua.
      </p>

      <div className="flex items-center justify-between text-[11px] text-slate-500 mb-3">
        <button type="button" className="underline underline-offset-2">
          Give it a Rate
        </button>
        <button type="button" className="underline underline-offset-2">
          Write a Comment
        </button>
      </div>

      <Button className="mt-auto w-full h-11 rounded-2xl bg-[#ffc94d] hover:bg-[#f7b936] text-slate-900 text-sm font-semibold shadow-md">
        Add to Cart
      </Button>
    </PhoneFrame>
  );
};

/* ----------------------------- 3. Tracking ------------------------------- */

const TrackingScreen: React.FC = () => {
  return (
    <PhoneFrame>
      <header className="flex items-center justify-between mb-4">
        <Button
          size="icon"
          className="h-8 w-8 rounded-full bg-[#ffe0a8] hover:bg-[#ffd593] text-slate-900"
        >
          <ChevronLeft className="w-4 h-4" />
        </Button>
        <span className="text-xs font-semibold">Track Order</span>
        <div className="w-8" />
      </header>

      {/* Map area */}
      <div className="relative mb-5">
        <div className="w-full h-40 rounded-3xl overflow-hidden bg-[#f3f4f6]">
          {/* fake map blocks */}
          <div className="grid grid-cols-4 gap-1 p-2 opacity-90">
            <div className="h-10 rounded-md bg-white" />
            <div className="h-10 rounded-md bg-[#fcdca4]" />
            <div className="h-10 rounded-md bg-white" />
            <div className="h-10 rounded-md bg-white" />
            <div className="h-10 rounded-md bg-[#fcdca4]" />
            <div className="h-10 rounded-md bg-white" />
            <div className="h-10 rounded-md bg-white" />
            <div className="h-10 rounded-md bg-[#fcdca4]" />
            <div className="h-10 rounded-md bg-white" />
            <div className="h-10 rounded-md bg-white" />
            <div className="h-10 rounded-md bg-[#fcdca4]" />
            <div className="h-10 rounded-md bg-white" />
          </div>
          {/* route line */}
          <svg
            className="absolute inset-0 w-full h-full"
            viewBox="0 0 100 100"
            role="img"
            aria-label="Route path"
          >
            <title>Route path</title>
            <polyline
              points="12,15 20,35 60,35 70,55 30,70 80,85"
              fill="none"
              stroke="#111827"
              strokeWidth="3"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>

          {/* start marker */}
          <div className="absolute top-5 left-6 w-6 h-6 rounded-full bg-white flex items-center justify-center">
            <div className="w-3.5 h-3.5 rounded-full bg-[#111827]" />
          </div>
          {/* rider marker */}
          <div className="absolute top-[54%] left-[68%] -translate-y-1/2 w-7 h-7 rounded-full bg-[#ffc94d] flex items-center justify-center text-lg">
            🛵
          </div>
          {/* destination marker */}
          <div className="absolute bottom-4 right-8 w-7 h-7 rounded-full bg-white flex items-center justify-center border border-slate-900 text-[15px]">
            📍
          </div>
        </div>
      </div>

      {/* bottom status card */}
      <Card className="mt-auto rounded-3xl border-0 bg-[#111111] text-white shadow-xl">
        <CardContent className="p-4 flex flex-col gap-3">
          <div>
            <p className="text-xs font-semibold mb-0.5">
              Your Order is on the way to you.
            </p>
            <p className="text-[11px] text-slate-300">
              You will receive your order less than{" "}
              <span className="text-[#ffc94d] font-semibold">5 Min.</span>
            </p>
          </div>

          <div className="flex items-center justify-between text-[11px] text-slate-300">
            <span className="flex items-center gap-1">
              ⏱ <span>Est. 4:32 PM</span>
            </span>
            <span className="flex items-center gap-1">
              🚴‍♂️ <span>Courier On The Way</span>
            </span>
          </div>

          <div className="h-px bg-slate-800" />

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Avatar className="w-9 h-9 border border-slate-700">
                <AvatarFallback className="bg-[#ffc94d] text-slate-900 text-xs">
                  T
                </AvatarFallback>
              </Avatar>
              <div>
                <p className="text-xs font-semibold">Tony Sopprano</p>
                <p className="text-[10px] text-slate-400">Your Courier</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Button
                size="icon"
                className="h-8 w-8 rounded-full bg-[#ffc94d] hover:bg-[#f7b936] text-slate-900"
              >
                <Phone className="w-4 h-4" />
              </Button>
              <Button
                size="icon"
                className="h-8 w-8 rounded-full bg-slate-800 hover:bg-slate-700 text-white"
              >
                <MessageCircle className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </PhoneFrame>
  );
};

/* ----------------------------- Phone frame ------------------------------- */

const PhoneFrame: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <div className="relative w-[300px] h-[620px] bg-transparent flex items-stretch justify-center">
      <div className="relative w-full h-full rounded-[38px] bg-white shadow-[0_25px_60px_rgba(0,0,0,0.45)] px-5 pt-5 pb-4 flex flex-col overflow-hidden">
        {/* top status bar notch */}
        <div className="absolute left-1/2 -translate-x-1/2 top-3 w-24 h-4 bg-black/90 rounded-full opacity-80" />
        <div className="mt-5 flex flex-col h-full">{children}</div>
      </div>
    </div>
  );
};
