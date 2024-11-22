"use client";

import ListStory from "@/app/_components/Story/ListStory";
import Toolbar from "@/app/_components/common/Toolbar";
import CreateStoryModal from "@/app/_components/modals/CreateStoryModal";
import useDisclosure from "@/hooks/useDisclosure";
import type { StoryType } from "@/types";
import { useState } from "react";
import {
	FloatButton,
	FloatButtonGroup,
} from "../_components/common/FloatButton";
import { useThemeStore } from "../_store/clientStore";
import { Moon, Plus, Settings, Sun } from "lucide-react";
import Greeting from "../_components/greeting";

const StoryTimelineContainer = () => {
	const {
		isOpen: isOpenCreateModal,
		onOpen: onOpenCreateModal,
		toggle: toggleCreateModal,
	} = useDisclosure(false);

	const { theme, setTheme } = useThemeStore();

	const [selectedStory, setSelectedStory] = useState<StoryType | null>(null);
	const [createIndex, setCreateIndex] = useState<number | null>(null);
	const [maxIndex, setMaxIndex] = useState<number | null>(null);
	const [showSearch, setShowSearch] = useState<boolean>(false);

	// useEffect(() => {
	//     if (selectedStory) {
	//         onOpenCreateModal();
	//     }
	// }, [selectedStory, onOpenCreateModal]);

	return (
		<div className="container mx-auto px-4">
			<Greeting showSearch={showSearch} setShowSearch={setShowSearch} />
			<Toolbar showSearch={showSearch} />
			<ListStory
				setSelectedStory={setSelectedStory}
				openModal={onOpenCreateModal}
				setCreateIndex={setCreateIndex}
				setMaxIndex={setMaxIndex}
			/>
			<FloatButton onClick={onOpenCreateModal}>
				<Plus size={16} />
			</FloatButton>
			<FloatButtonGroup
				openIcon={<Settings size={16} />}
				closeIcon={<Settings size={16} />}
				buttons={[
					{
						children:
							theme === "light" ? (
								<Moon size={16} />
							) : (
								<Sun size={16} />
							),
						onClick: () => setTheme(theme === "light" ? "dark" : "light"),
					},
				]}
			/>
			<CreateStoryModal
				isOpen={isOpenCreateModal}
				onOpenChange={toggleCreateModal}
				selectedStory={selectedStory}
				createIndex={createIndex}
				maxIndex={maxIndex}
				setCreateIndex={setCreateIndex}
			/>
		</div>
	);
};

export default StoryTimelineContainer;
