import StoryTimelineContainer from "@/app/_containers/StoryTimelineContainer";
import { buildLocalizedMetadata } from "@/utils/seo";
import { HydrateClient } from "@/trpc/server";
import { getTranslations } from "next-intl/server";

export async function generateMetadata(props: { params: { locale: string } }) {
	const t = await getTranslations({
		locale: props.params.locale,
		namespace: "Timeline",
	});

	return buildLocalizedMetadata({
		locale: props.params.locale,
		path: "/timeline",
		title: t("meta_title"),
		description: t("meta_description"),
	});
}

export default function Timeline() {
	return (
		<HydrateClient>
			<StoryTimelineContainer />
		</HydrateClient>
	);
}
