"use client";

import ListStory from "@/components/common/ListStory";
import Toolbar from "@/components/common/Toolbar";
import CreateStoryModal from "@/components/modals/CreateStoryModal";
import { useDisclosure } from "@nextui-org/react";
import { FloatButton } from "antd";
import {
	Add01Icon,
	Moon02Icon,
	Settings01Icon,
	Sun03Icon,
} from "hugeicons-react";
import { useEffect, useState } from "react";
import "react-tiny-fab/dist/styles.css";
import { useThemeStore } from "../_store/clientStore";

const StoryTimelineContainer = () => {
	const {
		isOpen: isOpenCreateModal,
		onOpen: onOpenCreateModal,
		onOpenChange: onOpenChangeCreateModal,
	} = useDisclosure();

	const { theme, setTheme } = useThemeStore();

	const [selectedStory, setSelectedStory] = useState<any>(null);
	const [createIndex, setCreateIndex] = useState<number | null>(null);
	const [maxIndex, setMaxIndex] = useState<number | null>(null);

	useEffect(() => {
		if (selectedStory) {
			onOpenCreateModal();
		}
	}, [selectedStory]);

	return (
		<div className="container mx-auto px-4">
			<Toolbar />
			<ListStory 
				setSelectedStory={setSelectedStory} 
				openModal={onOpenCreateModal} 
				setCreateIndex={setCreateIndex}
				setMaxIndex={setMaxIndex}
			/>
			<FloatButton.Group className="end-6">
				<FloatButton
					className="-translate-y-8 [&>div]:bg-primary"
					type="primary"
					icon={<Add01Icon size={16} />}
					onClick={onOpenCreateModal}
				/>
				<FloatButton.Group
					trigger="hover"
					style={{ insetInlineEnd: 24 }}
					icon={<Settings01Icon size={16} />}
				>
					{theme === "light" ? (
						<FloatButton
							icon={<Moon02Icon size={16} />}
							onClick={() => setTheme("dark")}
						/>
					) : (
						<FloatButton
							icon={<Sun03Icon size={16} />}
							onClick={() => setTheme("light")}
						/>
					)}
				</FloatButton.Group>
			</FloatButton.Group>
			<CreateStoryModal
				isOpen={isOpenCreateModal}
				onOpenChange={onOpenChangeCreateModal}
				selectedStory={selectedStory}
				createIndex={createIndex}
				maxIndex={maxIndex}
			/>
		</div>
	);
};

export default StoryTimelineContainer;
