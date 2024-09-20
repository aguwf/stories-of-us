import type { MetadataRoute } from "next";
import { getBaseUrl } from "@/utils/Helpers";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
	const baseUrl = getBaseUrl();

	// Define your routes
	const routes = ["", "/about", "/contact"];

	return routes.map((route) => ({
		url: `${baseUrl}${route}`,
		lastModified: new Date(),
		changeFrequency: "daily" as const,
		priority: route === "" ? 1 : 0.7,
	}));
}
