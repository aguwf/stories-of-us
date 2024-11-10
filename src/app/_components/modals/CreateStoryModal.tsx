"use client";

import { UploadV2 } from "@/app/_components/common/UploadV2";
import { api } from "@/trpc/react";
import type { StoryType } from "@/types";
import { handleUploadImage } from "@/utils/uploadHelper";
import {
	Modal,
	ModalBody,
	ModalContent,
	ModalFooter,
	ModalHeader,
} from "@nextui-org/modal";
import type { PopconfirmProps } from "antd";
import { message } from "antd";
import { useCallback, useEffect, useState } from "react";
import CancelButton from "../Story/CancelButton";
import StoryInput from "../Story/StoryInput";
import StoryTextarea from "../Story/StoryTextarea";
import SubmitButton from "../Story/SubmitButton";

interface StoryData {
	name: string;
	description: string;
}

const defaultStoryData: StoryData = { name: "", description: "" };

interface CreateStoryModalProps {
	isOpen: boolean;
	onOpenChange: (open: boolean) => void;
	selectedStory?: StoryType | null;
	createIndex?: number | null;
	maxIndex?: number | null;
	setCreateIndex: (index: number | null) => void;
}

export default function CreateStoryModal({
	isOpen,
	onOpenChange,
	selectedStory,
	createIndex,
	maxIndex,
	setCreateIndex,
}: CreateStoryModalProps) {
	const [fileList, setFileList] = useState<(File | string)[]>([]);
	const [isUploading, setIsUploading] = useState(false);
	const [data, setData] = useState<StoryData>(defaultStoryData);
	const utils = api.useUtils();

	const handleMutationSuccess = (action: string) => async () => {
		setIsUploading(false);
		message.success(`${action} successfully`);
		await utils.story.invalidate();
		resetModal();
	};

	const handleMutationError = () => {
		setIsUploading(false);
		message.error("An error occurred");
	};

	const createStory = api.story.create.useMutation({
		onSuccess: handleMutationSuccess("Create"),
		onError: handleMutationError,
	});

	const updateStory = api.story.update.useMutation({
		onSuccess: handleMutationSuccess("Update"),
		onError: handleMutationError,
	});

	useEffect(() => {
		const localData = localStorage.getItem("data");
		if (localData) {
			setData(JSON.parse(localData));
		}

		return () => {
			localStorage.removeItem("data");
		};
	}, []);

	useEffect(() => {
		if (selectedStory) {
			setData({
				name: selectedStory.name,
				description: selectedStory.description,
			});
			setFileList(selectedStory.images);
		} else {
			resetModal();
		}
	}, [selectedStory]);

	const onInputChange = useCallback(
		(e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
			const { name, value } = e.target;
			setData((prevData) => {
				const newData = { ...prevData, [name]: value };
				localStorage.setItem("data", JSON.stringify(newData));
				return newData;
			});
		},
		[],
	);

	const handleSubmit = async () => {
		if (fileList.length === 0) {
			message.error("You need to select at least one image");
			return;
		}

		setIsUploading(true);
		message.loading("Uploading...");

		const existedImages = fileList.filter(
			(file): file is string => typeof file === "string",
		);
		const newImages = fileList.filter(
			(file): file is File => file instanceof File,
		);

		try {
			const allImages = await uploadNewImages(newImages, existedImages);
			const newStoryData = createStoryData(allImages);

			if (selectedStory) {
				updateStory.mutate({ ...newStoryData, id: selectedStory.id });
			} else {
				createStory.mutate(newStoryData);
			}
		} catch (error) {
			handleUploadError(error);
		}

		onOpenChange(false);
	};

	const uploadNewImages = async (
		newImages: File[],
		existedImages: string[],
	) => {
		if (newImages.length > 0) {
			const uploadedImages = await handleUploadImage(newImages);
			const urls = uploadedImages
				? uploadedImages.map((image) => image?.url || "")
				: [];
			return [...existedImages, ...urls];
		}
		return existedImages;
	};

	const createStoryData = (allImages: string[]) => {
		return {
			name: data.name,
			description: data.description,
			coverImage: selectedStory?.coverImage || allImages[0] || "",
			images: allImages,
			sort: createIndex ? createIndex : maxIndex ? maxIndex + 100 : 0,
			userId: "default-id",
		};
	};

	const handleUploadError = (error: any) => {
		console.error("Error during image upload:", error);
		message.error("Failed to upload images");
		setIsUploading(false);
	};

	const resetModal = useCallback(() => {
		setFileList([]);
		setIsUploading(false);
		setData(defaultStoryData);
		localStorage.removeItem("data");
		onOpenChange(false);
		setCreateIndex(null);
	}, []);

	const confirm: PopconfirmProps["onConfirm"] = ({ onClose }: any) => {
		resetModal();
		onClose();
	};

	const cancel: PopconfirmProps["onCancel"] = ({ onClose }: any) => {
		onClose();
	};

	return (
		<Modal
			isOpen={isOpen}
			placement="center"
			onOpenChange={onOpenChange}
			isDismissable={false}
			isKeyboardDismissDisabled
			scrollBehavior="inside"
			classNames={{
				wrapper: "z-[101]",
				backdrop: "z-[100]",
				body: "pl-6",
			}}
		>
			<ModalContent>
				{(onClose) => (
					<>
						<ModalHeader className="flex flex-col gap-1">
							{selectedStory ? "Edit Story" : "Create new memory"}
						</ModalHeader>
						<ModalBody>
							<StoryInput
								label="Title"
								name="name"
								placeholder="Enter your title"
								value={data.name}
								onChange={onInputChange}
							/>
							<StoryTextarea
								label="Description"
								name="description"
								placeholder="Enter your description"
								value={data.description}
								onChange={onInputChange}
							/>
							<UploadV2 fileList={fileList} setFileList={setFileList} />
						</ModalBody>
						<ModalFooter>
							<CancelButton
								dataName={data?.name}
								onClose={onClose}
								confirm={confirm}
								cancel={cancel}
							/>
							<SubmitButton
								isUploading={isUploading}
								createStory={createStory}
								updateStory={updateStory}
								selectedStory={selectedStory}
								handleSubmit={handleSubmit}
							/>
						</ModalFooter>
					</>
				)}
			</ModalContent>
		</Modal>
	);
}
