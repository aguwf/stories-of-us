import MapContainer from "@/app/_containers/MapContainer";
import { buildLocalizedMetadata } from "@/utils/seo";
import { HydrateClient } from "@/trpc/server";
import { getTranslations } from "next-intl/server";

export async function generateMetadata(props: { params: { locale: string } }) {
	const t = await getTranslations({
		locale: props.params.locale,
		namespace: "Index",
	});

	return buildLocalizedMetadata({
		locale: props.params.locale,
		path: "/",
		title: t("meta_title"),
		description: t("meta_description"),
	});
}

export default function Index() {
	return (
		<HydrateClient>
			<MapContainer />
		</HydrateClient>
	);
}
