import type { Metadata } from "next";

import { AppConfig } from "./appConfig";
import { getBaseUrl, getI18nPath } from "./helpers";

const defaultOgImagePath = "/pickme-logo.png";
export const defaultSiteDescription =
	"Stories Of Us lets you capture, share, and revisit memorable moments across languages.";

type BuildMetadataParams = {
	locale: string;
	path: string;
	title: string;
	description?: string;
};

const buildLanguageAlternates = (path: string) => {
	const baseUrl = getBaseUrl();

	return Object.fromEntries(
		AppConfig.locales.map((locale) => [
			locale,
			`${baseUrl}${getI18nPath(path, locale)}`,
		])
	);
};

export const buildLocalizedMetadata = (
	params: BuildMetadataParams
): Metadata => {
	const baseUrl = getBaseUrl();
	const localizedPath = getI18nPath(params.path, params.locale);
	const absoluteUrl = `${baseUrl}${localizedPath}`;
	const imageUrl = `${baseUrl}${defaultOgImagePath}`;
	const description = params.description ?? defaultSiteDescription;

	return {
		title: params.title,
		description,
		alternates: {
			canonical: absoluteUrl,
			languages: {
				...buildLanguageAlternates(params.path),
				"x-default": `${baseUrl}${getI18nPath(params.path, AppConfig.defaultLocale)}`,
			},
		},
		openGraph: {
			title: params.title,
			description,
			url: absoluteUrl,
			siteName: AppConfig.name,
			locale: params.locale,
			type: "website",
			images: [
				{
					url: imageUrl,
					width: 1200,
					height: 630,
					alt: `${AppConfig.name} preview`,
				},
			],
		},
		twitter: {
			card: "summary_large_image",
			title: params.title,
			description,
			images: [imageUrl],
		},
	};
};
