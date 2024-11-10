import { getTranslations } from "next-intl/server";
import dynamic from "next/dynamic";

const IslandScene = dynamic(
	() => import("@/app/_components/Scene/IslandScene"),
	{
		ssr: false,
	},
);

export async function generateMetadata(props: { params: { locale: string } }) {
	const t = await getTranslations({
		locale: props.params.locale,
		namespace: "Portfolio",
	});

	return {
		title: t("meta_title"),
		description: t("meta_description"),
	};
}

const Portfolio = () => {
	return (
		<section className="relative h-[80vh] w-full">
			<IslandScene />
		</section>
	);
};

export default Portfolio;
