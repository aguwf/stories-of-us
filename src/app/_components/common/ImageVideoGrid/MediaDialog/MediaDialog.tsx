import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import type { MediaItem, StoryType } from "@/types";
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
			<DialogContent className="max-w-7xl w-[95vw] h-[95vh] p-0 border-none bg-white/95 backdrop-blur-sm overflow-hidden flex flex-col">
				<div className="flex-1 overflow-y-auto">
					<div className="flex flex-col gap-6 p-6">
						{/* User Info Header */}
						<div className="flex items-center gap-3">
							<Avatar className="h-12 w-12 border-2 border-gray-200">
								<AvatarImage src={story?.user?.avatar ?? ""} />
								<AvatarFallback>
									<Icon className="h-6 w-6" name="user-outline" />
								</AvatarFallback>
							</Avatar>
							<div className="flex flex-col">
								<span className="font-semibold text-base">{story?.user?.name}</span>
								<div className="flex items-center gap-1 text-muted-foreground">
									<span className="text-sm">
										{month} {formattedDate.getDate()}, {formattedDate.getFullYear()}
									</span>
								</div>
							</div>
						</div>

						{/* Story Content */}
						<div className="space-y-3">
							<h3 className="text-2xl font-bold">{story?.name}</h3>
							{story?.description && (
								<p className="text-muted-foreground leading-relaxed">
									{story.description}
								</p>
							)}
						</div>

						{/* Media Carousel */}
						<div className="w-full -mx-6">
							<MediaCarousel items={items} initialIndex={selectedIndex ?? index} />
						</div>

						{/* Comment Section - Uncomment when ready */}
						{/* <div className="border-t pt-6">
							<CommentSection
								comments={[]}
								onAddComment={(content) => {
									console.log("New comment:", content);
								}}
							/>
						</div> */}
					</div>
				</div>
			</DialogContent>
		</Dialog>
	);
};
