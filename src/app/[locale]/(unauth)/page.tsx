import { getTranslations } from "next-intl/server";
import { HydrateClient } from "@/trpc/server";
import StoryTimelineContainer from "@/app/_containers/StoryTimelineContainer";

export async function generateMetadata(props: { params: { locale: string } }) {
  const t = await getTranslations({
    locale: props.params.locale,
    namespace: "Index",
  });

  return {
    title: t("meta_title"),
    description: t("meta_description"),
  };
}

export default async function Index() {
  return (
    <HydrateClient>
      <StoryTimelineContainer />
    </HydrateClient>
  );
}
