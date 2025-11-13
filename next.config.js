/* eslint-disable import/no-extraneous-dependencies, import/extensions */
import { fileURLToPath } from "node:url";

import withBundleAnalyzer from "@next/bundle-analyzer";
import withSerwistInit from "@serwist/next";
import createJiti from "jiti";
import withNextIntl from "next-intl/plugin";

const withSerwist = withSerwistInit({
	// Note: This is only an example. If you use Pages Router,
	// use something else that works, such as "service-worker/index.ts".
	swSrc: "src/app/sw.ts",
	swDest: "public/sw.js",
	disable: process.env.NODE_ENV === "development",
	reloadOnOnline: true,
	cacheOnNavigation: true,
	register: true,
});

const jiti = createJiti(fileURLToPath(import.meta.url));

jiti("./src/env.js");

const withNextIntlConfig = withNextIntl("./src/lib/i18n.ts");

const bundleAnalyzer = withBundleAnalyzer({
	enabled: process.env.ANALYZE === "true",
});

/**
 * Run `build` or `dev` with `SKIP_ENV_VALIDATION` to skip env validation. This is especially useful
 * for Docker builds.
 */
await import("./src/env.js");

/** @type {import("next").NextConfig} */
const config = {
	images: {
		remotePatterns: [
			{ hostname: "localhost" },
			{ hostname: "127.0.0.1" },
			{ hostname: "ik.imagekit.io" },
		],
	},
	eslint: {
		dirs: ["."],
	},
	poweredByHeader: false,
	reactStrictMode: true,
	experimental: {
		// Related to Pino error with RSC: https://github.com/orgs/vercel/discussions/3150
		serverComponentsExternalPackages: ["pino"],
	},
	redirects: async () => {
		return [
			{
				source: "/",
				destination: "/timelines",
				permanent: true,
			},
		];
	},
};

function defineNextConfig() {
	return config;
}

export default withSerwist(
	bundleAnalyzer(withNextIntlConfig(defineNextConfig()))
);
