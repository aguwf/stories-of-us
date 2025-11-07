"use client";

import greetings from "@/app/_utils/greeting";
import { getWeather } from "@/app/_utils/weather";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { motion } from "framer-motion";
import React, { useEffect, useState } from "react";
import { Icon } from "../common/Icon";

type WeatherData = {
	current: {
		condition: {
			text: string;
			icon: string;
		};
		temp_c: number;
	};
};

const Greeting = ({
	showSearch,
	setShowSearch,
}: {
	showSearch: boolean;
	setShowSearch: (show: boolean) => void;
}) => {
	const [weather, setWeather] = useState<WeatherData | null>(null);
	const [error, setError] = useState<string | null>(null);
	const [greeting, setGreeting] = useState<string | undefined>(undefined);
	const [loading, setLoading] = useState<boolean>(true);

	useEffect(() => {
		const fetchWeather = async () => {
			setLoading(true);
			try {
				const weatherData = await getWeather();
				setWeather(weatherData);
			} catch (err) {
				setError("Failed to fetch weather data. Please try again later.");
			} finally {
				setLoading(false);
			}
		};
		fetchWeather();
	}, []);

	useEffect(() => {
		const randomGreeting =
			greetings[Math.floor(Math.random() * greetings.length)];
		setGreeting(randomGreeting);
	}, []);

	return (
		<section className="container mx-auto px-4">
			<div className="flex items-center justify-between">
				<div>
					<h1 className="text-2xl font-bold text-[#0c2b36]">{greeting}</h1>
					{loading ? (
						<Skeleton className="w-full h-4" />
					) : error ? (
						<p className="text-sm text-red-500">{JSON.stringify(error)}</p>
					) : (
						<p className="text-base text-[#a6aeb2] mt-2 flex items-center">
							{weather?.current.condition.text},{" "}
							{Math.round(weather?.current.temp_c ?? 0)}°C
						</p>
					)}
				</div>
				<div className="flex items-center justify-between">
					<Button variant="ghost" onClick={() => setShowSearch(!showSearch)}>
						<Icon className="!h-7 !w-7" name="magnifer-outline" />
					</Button>
				</div>
			</div>
			<motion.div
				animate={{
					opacity: showSearch ? 1 : 0,
					height: showSearch ? "auto" : 0,
				}}
				transition={{ duration: 0.5, ease: "easeInOut" }}
			>
				<Input placeholder="Search" className="w-full mt-4 rounded-xl h-10" />
			</motion.div>
		</section>
	);
};

export default Greeting;
