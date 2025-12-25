"use client";

import ListStory from "@/app/_components/Story/ListStory";
import Toolbar from "@/app/_components/common/Toolbar";
import CreateStoryModal from "@/app/_components/modals/CreateStoryModal";
import type { StoryType } from "@/types";
import { Moon, Map, Plus, Settings, Sun } from "lucide-react";
import { useState } from "react";
import { useRef } from "react";
import {
	FloatButton,
	FloatButtonGroup,
} from "../_components/common/FloatButton";
import Greeting from "../_components/greeting";
import type { CreateStoryModalRef } from "../_components/modals/CreateStoryModal";
import { useThemeStore } from "../_store/clientStore";
import { useRouter } from "next/navigation";

const StoryTimelineContainer = () => {
	const { theme, setTheme } = useThemeStore();
	const router = useRouter();
	const modalRef = useRef<CreateStoryModalRef>(null);

	const [selectedStory, setSelectedStory] = useState<StoryType | null>(null);
	const [createIndex, setCreateIndex] = useState<number | null>(null);
	const [maxIndex, setMaxIndex] = useState<number | null>(null);
	const [showSearch, setShowSearch] = useState<boolean>(false);

	return (
		<div className="container px-4 mx-auto">
			<Greeting showSearch={showSearch} setShowSearch={setShowSearch} />
			<Toolbar showSearch={showSearch} />
			<ListStory
				setSelectedStory={setSelectedStory}
				openModal={() => modalRef.current?.openModal()}
				setCreateIndex={setCreateIndex}
				setMaxIndex={setMaxIndex}
			/>
			<FloatButton onClick={() => modalRef.current?.openModal()}>
				<Plus size={16} suppressHydrationWarning />
			</FloatButton>
			<FloatButtonGroup
				openIcon={<Settings size={16} suppressHydrationWarning />}
				closeIcon={<Settings size={16} suppressHydrationWarning />}
				buttons={[
					{
						children: <Map size={16} />,
						onClick: () => router.push("/"),
					},
					{
						children:
							theme === "light" ? (
								<Moon size={16} suppressHydrationWarning />
							) : (
								<Sun size={16} suppressHydrationWarning />
							),
						onClick: () => setTheme(theme === "light" ? "dark" : "light"),
					},
				]}
			/>
			<CreateStoryModal
				ref={modalRef}
				selectedStory={selectedStory}
				createIndex={createIndex}
				maxIndex={maxIndex}
				setCreateIndex={setCreateIndex}
			/>
		</div>
	);
};

export default StoryTimelineContainer;
