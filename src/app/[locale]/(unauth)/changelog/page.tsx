"use client";

import type { Metadata } from "next";

export const metadata: Metadata = {
	title: "Changelog",
};

export default function Changelog() {
	return (
		<div className="container mx-auto px-4 py-8">
			<h1 className="mb-8 text-center font-bold text-3xl">{"Changelog"}</h1>
			<div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
				{/* Add your changelog entries here */}
			</div>
		</div>
	);
}
