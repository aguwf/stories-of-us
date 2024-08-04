/* eslint-disable import/no-extraneous-dependencies, import/extensions */
import { fileURLToPath } from "node:url";

import withBundleAnalyzer from "@next/bundle-analyzer";
import createJiti from "jiti";
import withNextIntl from "next-intl/plugin";

const jiti = createJiti(fileURLToPath(import.meta.url));

jiti("./src/libs/Env");

const withNextIntlConfig = withNextIntl("./src/libs/i18n.ts");

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
    domains: ["localhost", "127.0.0.1", "ik.imagekit.io"],
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
};

export default bundleAnalyzer(withNextIntlConfig(config));
