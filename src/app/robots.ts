import type { MetadataRoute } from "next";
import { getBaseUrl } from "@/utils/Helpers";

export default function robots(): MetadataRoute.Robots {
	const baseUrl = getBaseUrl();

	return {
		rules: [
			{
				userAgent: "*",
				allow: "/",
				disallow: ["/private/", "/admin/"],
			},
			{
				userAgent: "Googlebot",
				allow: "/",
				crawlDelay: 2,
			},
		],
		sitemap: `${baseUrl}/sitemap.xml`,
		host: baseUrl,
	};
}
