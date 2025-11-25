import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { SyntheticEvent } from "react";
import type { StoryType } from "@/types";

interface SubmitButtonProps {
	handleSubmit?: (event?: SyntheticEvent) => void;
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
	const isSubmitType = !type || type === "submit";

	return (
		<Button
			className={cn(
				selectedStory
					? "bg-pastel-blue hover:bg-pastel-blue"
				: "bg-brandPurple hover:bg-brandPurple",
				isUploading || isPending ? "loading" : ""
			)}
			variant={selectedStory ? "outline" : "default"}
			onClick={isSubmitType ? undefined : handleSubmit}
			isLoading={isUploading || isPending}
			type={type}
		>
			{selectedStory ? "Update" : "Create"}
		</Button>
	);
};

export default SubmitButton;
