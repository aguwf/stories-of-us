import { api } from "@/trpc/server";
import { getTranslations } from "next-intl/server";
import { buildLocalizedMetadata } from "@/utils/seo";
import StoryDetail from "@/app/_components/Story/StoryDetail";

export async function generateMetadata(props: {
  params: { locale: string; id: string };
}) {
  const story = await api.story.getById({ id: Number(props.params.id) });
  const t = await getTranslations({
    locale: props.params.locale,
    namespace: "Story",
  });

  if (!story) {
    return buildLocalizedMetadata({
      locale: props.params.locale,
      path: `/story/${props.params.id}`,
      title: t("not_found"),
    });
  }

  return buildLocalizedMetadata({
    locale: props.params.locale,
    path: `/story/${props.params.id}`,
    title: story.name,
    description: story.description ?? undefined,
    image: story.coverImage,
  });
}

export default async function StoryPage({
  params,
}: {
  params: { id: string };
}) {
  const storyId = Number(params.id);
  const story = await api.story.getById({ id: storyId });

  if (!story) {
    return <div>Story not found</div>;
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-2xl">
      <StoryDetail story={story} />
    </div>
  );
}
