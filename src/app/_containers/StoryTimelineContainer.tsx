"use client";

import ListStory from "@/app/_components/Story/ListStory";
import Toolbar from "@/app/_components/common/Toolbar";
import CreateStoryModal from "@/app/_components/modals/CreateStoryModal";
import useDisclosure from "@/hooks/useDisclosure";
import type { StoryType } from "@/types";
import {
	Add01Icon,
	Moon02Icon,
	Settings01Icon,
	Sun03Icon,
} from "hugeicons-react";
import { useState } from "react";
import {
	FloatButton,
	FloatButtonGroup,
} from "../_components/common/FloatButton";
import { useThemeStore } from "../_store/clientStore";

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

	// useEffect(() => {
	//     if (selectedStory) {
	//         onOpenCreateModal();
	//     }
	// }, [selectedStory, onOpenCreateModal]);

	return (
		<div className="container mx-auto px-4">
			<Toolbar />
			<ListStory
				setSelectedStory={setSelectedStory}
				openModal={onOpenCreateModal}
				setCreateIndex={setCreateIndex}
				setMaxIndex={setMaxIndex}
			/>
			<FloatButton onClick={onOpenCreateModal}>
				<Add01Icon size={16} />
			</FloatButton>
			<FloatButtonGroup
				openIcon={<Settings01Icon size={16} />}
				closeIcon={<Settings01Icon size={16} />}
				buttons={[
					{
						children:
							theme === "light" ? (
								<Moon02Icon size={16} />
							) : (
								<Sun03Icon size={16} />
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
