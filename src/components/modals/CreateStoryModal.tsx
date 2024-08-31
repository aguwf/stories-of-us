"use client";

import { UploadV2 } from "@/app/_components/common/UploadV2";
import { api } from "@/trpc/react";
import { handleUploadImage } from "@/utils/uploadHelper";
import {
	Modal,
	ModalBody,
	ModalContent,
	ModalFooter,
	ModalHeader,
} from "@nextui-org/modal";
import { Button, Input, Textarea } from "@nextui-org/react";
import type { PopconfirmProps } from "antd";
import { Popconfirm, message } from "antd";
import { useEffect, useState, useCallback } from "react";
import { Story } from "../common/ListStory";

interface StoryData {
	name: string;
	description: string;
}

const defaultStoryData: StoryData = { name: "", description: "" };

interface CreateStoryModalProps {
	isOpen: boolean;
	onOpenChange: (open: boolean) => void;
	selectedStory?: Story;
	createIndex?: number | null;
	maxIndex?: number | null;
}

export default function CreateStoryModal({
	isOpen,
	onOpenChange,
	selectedStory,
	createIndex,
	maxIndex,
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

	const onInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
		const { name, value } = e.target;
		setData((prevData) => {
			const newData = { ...prevData, [name]: value };
			localStorage.setItem("data", JSON.stringify(newData));
			return newData;
		});
	}, []);

	const handleSubmit = async () => {
		if (fileList.length === 0) {
			message.error("You need to select at least one image");
			return;
		}

		setIsUploading(true);
		message.loading("Uploading...");

		const existedImages = fileList.filter((file): file is string => typeof file === "string");
		const newImages = fileList.filter((file): file is File => file instanceof File);

		try {
			if (newImages.length > 0) {
				const uploadedImages = await handleUploadImage(newImages);
				const urls = uploadedImages ? uploadedImages.map((image) => image?.url || "") : [];
				const allImages = [...existedImages, ...urls];
				const newStoryData = {
					name: data.name,
					description: data.description,
					coverImage: selectedStory?.coverImage || urls[0] || "",
					images: allImages,
					sort: createIndex ? createIndex : maxIndex ? maxIndex + 100 : 0,
					userId: "default-id",
				};

				if (selectedStory) {
					updateStory.mutate({ ...newStoryData, id: selectedStory.id });
				} else {
					createStory.mutate(newStoryData);
				}
			} else if (selectedStory) {
				updateStory.mutate({
					id: selectedStory.id,
					name: data.name,
					description: data.description,
					coverImage: selectedStory.coverImage,
					images: existedImages
				});
			}
		} catch (error) {
			console.error("Error during image upload:", error);
			message.error("Failed to upload images");
			setIsUploading(false);
		}

		onOpenChange(false);
	};

	const resetModal = useCallback(() => {
		setFileList([]);
		setIsUploading(false);
		setData(defaultStoryData);
		localStorage.removeItem("data");
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
			}}
		>
			<ModalContent>
				{(onClose) => (
					<>
						<ModalHeader className="flex flex-col gap-1">
							{selectedStory ? "Edit Story" : "Create new memory"}
						</ModalHeader>
						<ModalBody>
							<Input
								classNames={{
									input: "text-base",
								}}
								label="Title"
								labelPlacement="inside"
								name="name"
								onChange={onInputChange}
								placeholder="Enter your title"
								type="text"
								value={data.name}
							/>
							<Textarea
								classNames={{
									input: "text-base",
								}}
								label="Description"
								labelPlacement="inside"
								name="description"
								onChange={onInputChange}
								placeholder="Enter your description"
								type="text"
								value={data.description}
							/>
							<UploadV2 fileList={fileList} setFileList={setFileList} />
						</ModalBody>
						<ModalFooter>
							{data?.name ? (
								<Popconfirm
									title="Discard changes?"
									description="Are you sure to discard this story?"
									onConfirm={(e) => confirm({ e, onClose } as any)}
									onCancel={(e) => cancel({ e, onClose } as any)}
									okText="Yes"
									cancelText="No"
								>
									<Button color="danger" variant="light">
										Cancel
									</Button>
								</Popconfirm>
							) : (
								<Button color="danger" variant="light" onClick={onClose}>
									Cancel
								</Button>
							)}
							<Button
								color="primary"
								onPress={handleSubmit}
								isLoading={
									isUploading || createStory.isPending || updateStory.isPending
								}
							>
								{selectedStory ? "Update" : "Create"}
							</Button>
						</ModalFooter>
					</>
				)}
			</ModalContent>
		</Modal>
	);
}
