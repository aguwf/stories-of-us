import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { StoryType } from "@/types";

interface SubmitButtonProps {
	handleSubmit: () => void;
	isUploading: boolean;
	selectedStory?: StoryType | null;
	type?: "submit" | "reset" | "button" | undefined;
	isPending?: boolean;
}

const SubmitButton = ({
	handleSubmit,
	isUploading,
	selectedStory,
	type,
	isPending,
}: SubmitButtonProps) => {
	return (
		<Button
			className={cn(
				selectedStory ? "bg-pastel-blue hover:bg-pastel-blue" : "bg-purple hover:bg-purple",
				isUploading || isPending ? "loading" : "",
			)}
			variant={selectedStory ? "outline" : "default"}
			onClick={handleSubmit}
			isLoading={isUploading || isPending}
			type={type}
		>
			{selectedStory ? "Update" : "Create"}
		</Button>
	);
};

export default SubmitButton;
