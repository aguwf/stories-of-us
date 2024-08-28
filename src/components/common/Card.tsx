import ImageK from "@/app/_components/common/ImageK";
import { api } from "@/trpc/react";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
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

const actionMenuOptions: {
	key: string;
	label: string;
	color?:
		| "danger"
		| "default"
		| "success"
		| "primary"
		| "secondary"
		| "warning";
}[] = [
	{ key: "copy", label: "Copy link" },
	{ key: "edit", label: "Edit" },
	{ key: "delete", label: "Delete", color: "danger" },
];

export const StoryCard = ({
	item,
	setSelectedStory,
	onOpen,
	setSelectedImages,
}: any) => {
	const { attributes, listeners, setNodeRef, transform } = useSortable({
		id: item.id,
	});
	const formattedDate = new Date(item.createdAt || new Date());
	const month = formattedDate
		.toLocaleString("en-US", { month: "long" })
		.slice(0, 3);

	const style = {
		margin: "10px",
		opacity: 1,
		color: "#333",
		background: "white",
		padding: "10px",
		transform: CSS.Transform.toString(transform),
	};

	const handleActionMenu = (key: any, story: Story) => {
		switch (key) {
			case "delete":
				message.info("Deleting...");
				deleteStory.mutate({ id: story.id });
				break;
			case "edit":
				setSelectedStory(story);
				break;
			default:
				break;
		}
	};

	const utils = api.useUtils();

	const deleteStory = api.story.delete.useMutation({
		onSuccess: async () => {
			message.success("Delete successfully");
			await utils.story.invalidate();
		},
	});

	return (
		<Card
			className="mt-12 flex w-full flex-row gap-8 p-4 first:mt-0"
			key={item.id}
			id={`${item.id}`}
			ref={setNodeRef}
			{...attributes}
			{...listeners}
			style={style}
		>
			<div className="mx-4 flex flex-col items-center">
				<div className="font-medium text-[#9f9f9f]">{month}</div>
				<div className="font-bold">{formattedDate.getDate()}</div>
				<div className="font-medium text-[#9f9f9f]">
					{formattedDate.getFullYear()}
				</div>
			</div>
			<div>
				<ImageK
					width={500}
					height={300}
					quality={80}
					className="rounded-2xl"
					src={item.coverImage.split("/").pop()}
					alt={item.name}
					onClick={() => {
						onOpen();
						setSelectedImages(item);
					}}
				/>
				<div className="flex items-center justify-between">
					<div>
						<h3 className="mt-4 font-bold">{item.name}</h3>
						<p className="mt-2 line-clamp-5">{item.description}</p>
					</div>
					<Dropdown>
						<DropdownTrigger>
							<Button
								variant="flat"
								className="rounded-full bg-transparent"
								isIconOnly
							>
								<MoreVerticalCircle01Icon />
							</Button>
						</DropdownTrigger>
						<DropdownMenu
							aria-label="Static Actions"
							onAction={(key) => handleActionMenu(key, item)}
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
};
