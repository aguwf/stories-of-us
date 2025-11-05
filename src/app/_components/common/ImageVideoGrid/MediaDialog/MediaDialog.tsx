import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import type { MediaItem, StoryType } from "@/types";
import CommentSection from "../../CommentSection/CommentSection";
import { Icon } from "../../icon";
import MediaCarousel from "../MediaCarousel";

interface MediaDialogProps {
	item: MediaItem;
	index: number;
	items: MediaItem[];
	story?: StoryType;
	itemCount: number;
	children: React.ReactNode;
	onOpenChange: (open: boolean) => void;
	selectedIndex: number | null;
}

export const MediaDialog: React.FC<MediaDialogProps> = ({
	index,
	items,
	story,
	children,
	onOpenChange,
	selectedIndex,
}) => {
	const formattedDate = new Date(story?.createdAt || new Date());
	const month = formattedDate
		.toLocaleString("en-US", { month: "long" })
		.slice(0, 3);

	return (
		<Dialog onOpenChange={onOpenChange}>
			<DialogTrigger asChild>{children}</DialogTrigger>
			<DialogContent className="w-full p-0 h-full border-none overflow-auto">
				<div className="mt-16 px-4 flex items-center gap-2">
					<Avatar className="border-1 border-gray-200">
						<AvatarImage src={story?.user.avatar ?? ""} />
						<AvatarFallback>
							<Icon className="h-6 w-6" name="user-outline" />
						</AvatarFallback>
					</Avatar>
					<div className="flex flex-col">
						<span className="font-semibold text-sm">{story?.user.name}</span>
						<div className="flex gap-1">
							<span className="font-medium text-[#9f9f9f] text-sm">
								{month}
							</span>
							<span className="font-medium text-[#9f9f9f] text-sm">
								{formattedDate.getDate()}
							</span>
							<span className="font-medium text-[#9f9f9f] text-sm">
								{formattedDate.getFullYear()}
							</span>
							<hr className="my-2 border-r border-gray-200 w-full rotate-90" />
						</div>
					</div>
				</div>
				<div className="mx-auto w-full max-w-screen-md px-4">
					<h3 className="font-bold">{story?.name}</h3>
					<p className="mt-2">{story?.description}</p>
				</div>
				<MediaCarousel items={items} initialIndex={selectedIndex ?? index} />
				<CommentSection
					comments={[]} // Pass your comments data here
					onAddComment={(content) => {
						// Implement your comment adding logic here
						console.log("New comment:", content);
					}}
				/>
			</DialogContent>
		</Dialog>
	);
};
