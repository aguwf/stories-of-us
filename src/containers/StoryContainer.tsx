import ListStory from "@/components/common/ListStory";
import Toolbar from "@/components/common/Toolbar";
import { api } from "@/trpc/react";

export default async function StoryContainer() {
  const storiesData = await api.story.getAll.useQuery();

  return (
    <></>
  );
}
