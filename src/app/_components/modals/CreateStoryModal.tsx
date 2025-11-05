"use client";

import { UploadV2 } from "@/app/_components/common/UploadV2";
import { useUserStore } from "@/app/_store/userStore";
import {
	Dialog,
	DialogContent,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import useDisclosure from "@/hooks/useDisclosure";
import { api } from "@/trpc/react";
import type { StoryType } from "@/types";
import { handleUploadImage } from "@/utils/uploadHelper";
import { zodResolver } from "@hookform/resolvers/zod";
import type { TRPCClientErrorLike } from "@trpc/client";
import {
	forwardRef,
	useCallback,
	useEffect,
	useImperativeHandle,
	useState,
} from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";
import CancelButton from "../Story/CancelButton";
import SubmitButton from "../Story/SubmitButton";

interface CreateStoryModalProps {
	selectedStory?: StoryType | null;
	createIndex?: number | null;
	maxIndex?: number | null;
	setCreateIndex: (index: number | null) => void;
}

export interface CreateStoryModalRef {
	openModal: () => void;
}

const storySchema = z.object({
	name: z.string().min(1, "Title is required"),
	description: z.string(),
});

type StoryFormData = z.infer<typeof storySchema>;

const useStoryModal = ({
	selectedStory,
	createIndex,
	maxIndex,
	setCreateIndex,
}: CreateStoryModalProps) => {
	const { isOpen, onClose, onOpen } = useDisclosure(false);
	const [fileList, setFileList] = useState<(File | string)[]>([]);
	const [isUploading, setIsUploading] = useState(false);
	const utils = api.useUtils();
	const { user } = useUserStore();

	const form = useForm<StoryFormData>({
		resolver: zodResolver(storySchema),
		defaultValues: {
			name: selectedStory?.name ?? "",
			description: selectedStory?.description ?? "",
		},
	});

	const resetModal = useCallback(() => {
		setFileList([]);
		setIsUploading(false);
		form.reset();
		setCreateIndex(null);
		onClose();
	}, [onClose, setCreateIndex, form]);

	const handleMutationSuccess = useCallback(
		async (action: string) => {
			setIsUploading(false);
			toast.success(`${action} successfully`);
			await utils.story.invalidate();
			resetModal();
		},
		[utils.story, resetModal],
	);

	const handleMutationError = useCallback((error: TRPCClientErrorLike<any>) => {
		setIsUploading(false);
		toast.error(error.message || "An error occurred");
	}, []);

	const createStory = api.story.create.useMutation({
		onSuccess: () => handleMutationSuccess("Create"),
		onError: handleMutationError,
	});

	const updateStory = api.story.update.useMutation({
		onSuccess: () => handleMutationSuccess("Update"),
		onError: handleMutationError,
	});

	useEffect(() => {
		if (selectedStory) {
			form.reset({
				name: selectedStory.name,
				description: selectedStory.description || "",
			});
			setFileList(selectedStory.images);
			onOpen();
		} else {
			resetModal();
		}
	}, [selectedStory, resetModal, form]);

	const uploadNewImages = async (
		newImages: File[],
		existedImages: string[],
	) => {
		try {
			if (!newImages.length) return existedImages;

			const uploadedImages = await handleUploadImage(newImages);
			const urls = uploadedImages
				?.map((image) => image?.url)
				.filter(Boolean) as string[];
			return [...existedImages, ...urls];
		} catch (error) {
			if (error instanceof Error) {
				handleMutationError({
					message: error.message,
					data: { code: "INTERNAL_SERVER_ERROR" },
					shape: { message: error.message, code: -32603 },
				});
			} else {
				handleMutationError({
					message: "Upload failed",
					data: { code: "INTERNAL_SERVER_ERROR" },
					shape: { message: "Upload failed", code: -32603 },
				});
			}
			throw error;
		}
	};

	const createStoryData = useCallback(
		(allImages: string[]) => ({
			...form.getValues(),
			coverImage: selectedStory?.coverImage || allImages[0] || "",
			images: allImages,
			sort: createIndex ?? maxIndex ? (maxIndex || 0) + 100 : 0,
			userId: user?.id || "default-id",
			...(createIndex !== null && { index: createIndex }),
		}),
		[form, selectedStory, createIndex, maxIndex, user],
	);

	const handleSubmit = useCallback(async () => {
		if (fileList.length === 0) {
			toast.error("You need to select at least one image");
			return;
		}

		setIsUploading(true);
		toast.loading("Uploading...");

		const existedImages = fileList.filter(
			(file): file is string => typeof file === "string",
		);
		const newImages = fileList.filter(
			(file): file is File => file instanceof File,
		);

		try {
			const allImages = await uploadNewImages(newImages, existedImages);
			const storyData = createStoryData(allImages);

			if (selectedStory?.id) {
				await updateStory.mutateAsync({ id: selectedStory.id, ...storyData });
			} else {
				await createStory.mutateAsync(storyData);
			}
		} catch (error) {
			// Error already handled in uploadNewImages
			console.error("Submission failed:", error);
		}
	}, [fileList, createStoryData, selectedStory, createStory, updateStory]);

	return {
		isOpen,
		onClose,
		onOpen,
		fileList,
		setFileList,
		isUploading,
		form,
		handleSubmit: form.handleSubmit(handleSubmit),
		resetModal,
		selectedStory,
	};
};

const CreateStoryModal = forwardRef<CreateStoryModalRef, CreateStoryModalProps>(
	(props, ref) => {
		const {
			isOpen,
			onClose,
			onOpen,
			fileList,
			setFileList,
			isUploading,
			form,
			handleSubmit,
			resetModal,
			selectedStory,
		} = useStoryModal(props);

		useImperativeHandle(
			ref,
			() => ({
				openModal: onOpen,
			}),
			[onOpen],
		);

		const confirm = useCallback(
			({ onClose }: { onClose: () => void }) => {
				onClose();
				resetModal();
			},
			[resetModal],
		);

		const cancel = useCallback(({ onClose }: { onClose: () => void }) => {
			onClose();
		}, []);

		return (
			<Dialog open={isOpen} onOpenChange={onClose}>
				<DialogContent className="pt-16 max-h-[90vh] overflow-y-auto sm:max-w-[425px]">
					<DialogHeader className="mb-4">
						<DialogTitle>
							{props.selectedStory ? "Edit Story" : "Create new memory"}
						</DialogTitle>
					</DialogHeader>

					<form onSubmit={handleSubmit}>
						<div>
							<div className="grid w-full max-w-sm items-center gap-1.5">
								<Label
									htmlFor="name"
									className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
								>
									Title
								</Label>
								<Input
									{...form.register("name")}
									error={form.formState.errors.name?.message}
									placeholder="Enter your title"
									className="mb-4"
									id="name"
								/>
							</div>
							<div className="grid w-full max-w-sm items-center gap-1.5">
								<Label
									htmlFor="description"
									className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
								>
									Description
								</Label>
								<Textarea
									{...form.register("description")}
									error={form.formState.errors.description?.message}
									placeholder="Enter your description"
									className="mb-4"
									id="description"
								/>
							</div>
							<div className="grid w-full max-w-sm items-center gap-1.5">
								<Label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
									Cover Image
								</Label>
								<UploadV2
									className="mb-4"
									fileList={fileList}
									setFileList={setFileList}
								/>
							</div>
						</div>

						<DialogFooter className="gap-2">
							<CancelButton
								dataName={form.getValues("name")}
								onClose={onClose}
								confirm={confirm}
								cancel={cancel}
							/>
							<SubmitButton
								isUploading={isUploading}
								type="submit"
								handleSubmit={handleSubmit}
								selectedStory={selectedStory}
							/>
						</DialogFooter>
					</form>
				</DialogContent>
			</Dialog>
		);
	},
);

export default CreateStoryModal;
