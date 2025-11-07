import { getBaseUrl } from "@/utils/helpers";
import type { MetadataRoute } from "next";

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
