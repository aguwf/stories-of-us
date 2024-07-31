import { getTranslations } from "next-intl/server";
import { HydrateClient } from "@/trpc/server";

import ListStory from "@/components/common/ListStory";
import Toolbar from "@/components/common/Toolbar";

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
      <div className="container px-4">
        <Toolbar />
        <ListStory />
      </div>
    </HydrateClient>
  );
}
