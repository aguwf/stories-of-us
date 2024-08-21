"use client";

import ListStory from "@/components/common/ListStory";
import Toolbar from "@/components/common/Toolbar";
import CreateStoryModal from "@/components/modals/CreateStoryModal";
import { useDisclosure } from "@nextui-org/react";
// import { FloatButton } from "antd";
import {
	Add01Icon,
	Moon02Icon,
	Settings01Icon,
	Sun03Icon,
} from "hugeicons-react";
// import { useTheme } from "next-themes";
import { useEffect, useState } from "react";
import { Action, Fab } from "react-tiny-fab";
import "react-tiny-fab/dist/styles.css";
import { useClientStore } from "../_store/clientStore";

const StoryTimelineContainer = () => {
	const {
		isOpen: isOpenCreateModal,
		onOpen: onOpenCreateModal,
		onOpenChange: onOpenChangeCreateModal,
	} = useDisclosure();

	const { theme, setTheme } = useClientStore();

	const [selectedStory, setSelectedStory] = useState<any>(null);

	useEffect(() => {
		if (selectedStory) {
			onOpenCreateModal();
		}
	}, [selectedStory]);

	return (
		<div className="container mx-auto px-4">
			<Toolbar />
			<ListStory setSelectedStory={setSelectedStory} />
			<Fab
				style={{
					bottom: "5.5rem",
					right: "1.5rem",
				}}
				mainButtonStyles={{
					width: "48px",
					height: "48px",
				}}
				icon={<Add01Icon />}
				alwaysShowTitle={true}
				onClick={onOpenCreateModal}
			/>
			<Fab
				mainButtonStyles={{
					width: "48px",
					height: "48px",
				}}
				icon={<Settings01Icon />}
				alwaysShowTitle={true}
				onClick={onOpenCreateModal}
			>
				{theme === "light" ? (
					<Action text="Dark Mode" onClick={() => setTheme("dark")}>
						<Moon02Icon size={18} />
					</Action>
				) : (
					<Action text="Light Mode" onClick={() => setTheme("light")}>
						<Sun03Icon size={18} />
					</Action>
				)}
			</Fab>
			{/* <FloatButton.Group className="end-6">
				<FloatButton
					className="-translate-y-8 [&>div]:bg-primary"
					type="primary"
					icon={<Add01Icon size={18} />}
					onClick={onOpenCreateModal}
				/>
				<FloatButton.Group
					trigger="hover"
					style={{ insetInlineEnd: 24 }}
					icon={<Settings01Icon size={18} />}
				>
					{theme === "light" ? (
						<FloatButton
							icon={<Moon02Icon size={18} />}
							onClick={() => setTheme("dark")}
						/>
					) : (
						<FloatButton
							icon={<Sun03Icon size={18} />}
							onClick={() => setTheme("light")}
						/>
					)}
				</FloatButton.Group>
			</FloatButton.Group> */}
			<CreateStoryModal
				isOpen={isOpenCreateModal}
				onOpenChange={onOpenChangeCreateModal}
				selectedStory={selectedStory}
			/>
		</div>
	);
};

export default StoryTimelineContainer;
