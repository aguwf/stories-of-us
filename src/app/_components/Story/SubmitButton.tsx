import { Button } from "@nextui-org/react";
import type { Story } from "./ListStory";

interface SubmitButtonProps {
    handleSubmit: () => void;
    isUploading: boolean;
    createStory: any;
    updateStory: any;
    selectedStory?: Story;
}

const SubmitButton = ({
    handleSubmit,
    isUploading,
    createStory,
    updateStory,
    selectedStory,
}: SubmitButtonProps) => {
    return (
        <Button
            color="primary"
            onPress={handleSubmit}
            isLoading={
                isUploading || createStory.isPending || updateStory.isPending
            }
        >
            {selectedStory ? "Update" : "Create"}
        </Button>
    );
}

export default SubmitButton;