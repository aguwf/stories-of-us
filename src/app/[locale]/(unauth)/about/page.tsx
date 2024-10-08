import { useTranslations } from "next-intl";
import { getTranslations } from "next-intl/server";
import Image from "next/image";

export async function generateMetadata(props: { params: { locale: string } }) {
	const t = await getTranslations({
		locale: props.params.locale,
		namespace: "About",
	});

	return {
		title: t("meta_title"),
		description: t("meta_description"),
	};
}

export default function About() {
	const t = useTranslations("About");

	return (
		<>
			<p>{t("about_paragraph")}</p>

			<div className="mt-2 text-center text-sm">
				{`${t("translation_powered_by")} `}
				<a
					className="text-blue-700 hover:border-blue-700 hover:border-b-2"
					href="https://l.crowdin.com/next-js"
					target="_blank"
					rel="noreferrer"
				>
					Crowdin
				</a>
			</div>

			<a href="https://l.crowdin.com/next-js" target="_blank" rel="noreferrer">
				<Image
					className="mx-auto mt-2"
					src="https://support.crowdin.com/assets/logos/core-logo/svg/crowdin-core-logo-cDark.svg"
					alt="Crowdin Translation Management System"
					width={130}
					height={112}
				/>
			</a>
		</>
	);
}
