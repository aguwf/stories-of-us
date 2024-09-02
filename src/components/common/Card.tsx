import ImageK from "@/app/_components/common/ImageK";
import { api } from "@/trpc/react";
import {
	Button,
	Card,
	Dropdown,
	DropdownItem,
	DropdownMenu,
	DropdownTrigger,
} from "@nextui-org/react";
import { message } from "antd";
import { MoreVerticalCircle01Icon } from "hugeicons-react";
import type { Story } from "./ListStory";
import clsx from "clsx";
import { memo } from "react";

const actionMenuOptions = [
	{ key: "copy", label: "Copy link" },
	{ key: "edit", label: "Edit" },
	{ key: "delete", label: "Delete", color: "danger" as const },
];

interface StoryCardProps {
	item: Story;
	setSelectedStory: (story: Story) => void;
	onOpen: () => void;
	setSelectedImages: (story: Story) => void;
}

export const StoryCard: React.FC<StoryCardProps> = memo(({
	item,
	setSelectedStory,
	onOpen,
	setSelectedImages,
}) => {

	const formattedDate = new Date(item.createdAt || new Date());
	const month = formattedDate
		.toLocaleString("en-US", { month: "long" })
		.slice(0, 3);

	const handleActionMenu = (key: any) => {
		switch (key) {
			case "delete":
				message.info("Deleting...");
				deleteStory.mutate({ id: item.id });
				break;
			case "edit":
				setSelectedStory(item);
				break;
			case "copy":
				// Implement copy link functionality
				break;
		}
	};

	const utils = api.useUtils();

	const deleteStory = api.story.delete.useMutation({
		onSuccess: async () => {
			message.success("Deleted successfully");
			await utils.story.invalidate();
		},
		onError: () => {
			message.error("Failed to delete story");
		},
	});

	return (
		<Card
			className={clsx(
				"flex w-full flex-row gap-8 p-4 first:mt-0"
			)}
			key={item.id}
			id={`${item.id}`}
		>
			<div className="mx-4 flex flex-col items-center">
				<div className="font-medium text-[#9f9f9f]">{month}</div>
				<div className="font-bold">{formattedDate.getDate()}</div>
				<div className="font-medium text-[#9f9f9f]">
					{formattedDate.getFullYear()}
				</div>
			</div>
			<div className="flex-1">
				<ImageK
					width={500}
					height={300}
					quality={80}
					className="w-full rounded-2xl object-cover"
					src={item.coverImage.split("/").pop()}
					alt={item.name}
					onClick={() => {
						onOpen();
						setSelectedImages(item);
					}}
				/>
				<div className="mt-4 flex items-start justify-between">
					<div>
						<h3 className="font-bold">{item.name}</h3>
						<p className="mt-2 line-clamp-3 text-sm text-gray-600">{item.description}</p>
					</div>
					<Dropdown>
						<DropdownTrigger>
							<Button
								variant="light"
								isIconOnly
								className="rounded-full"
							>
								<MoreVerticalCircle01Icon />
							</Button>
						</DropdownTrigger>
						<DropdownMenu
							aria-label="Story actions"
							onAction={handleActionMenu}
						>
							{actionMenuOptions.map((option) => (
								<DropdownItem
									key={option.key}
									className={option.color ? `text-${option.color}` : ""}
									color={option.color}
								>
									{option.label}
								</DropdownItem>
							))}
						</DropdownMenu>
					</Dropdown>
				</div>
			</div>
		</Card>
	);
});

StoryCard.displayName = 'StoryCard';
