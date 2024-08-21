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
import { Image, Popconfirm, message } from "antd";
import { useEffect, useState } from "react";
interface StoryData {
	name: string;
	description: string;
}

export default function CreateStoryModal({
	isOpen,
	onOpenChange,
	selectedStory,
}: any) {
	const [previewOpen, setPreviewOpen] = useState(false);
	const [previewImage, setPreviewImage] = useState("");
	const [fileList, setFileList] = useState<File[]>([]);
	const [isUploading, setIsUploading] = useState(false);
	const [data, setData] = useState<StoryData>({ name: "", description: "" });
	// const [messageApi] = message.useMessage();
	const utils = api.useUtils();

	const createStory = api.story.create.useMutation({
		onSuccess: async () => {
			setIsUploading(false);
			message.success("Create successfully");
			await utils.story.invalidate();
			_resetModal();
		},
		onError: () => {
			setIsUploading(false);
		},
	});

	const updateStory = api.story.update.useMutation({
		onSuccess: async () => {
			setIsUploading(false);
			message.success("Update successfully");
			await utils.story.invalidate();
			_resetModal();
		},
		onError: () => {
			setIsUploading(false);
		},
	});

	useEffect(() => {
		const localData = localStorage.getItem("data");
		if (localData) {
			setData(JSON.parse(localData));
		}
		// Before reload browser
		window.addEventListener("beforeunload", () => {
			localStorage.removeItem("data");
		});

		return () => {
			window.removeEventListener("beforeunload", () => {
				localStorage.removeItem("data");
			});
		};
	}, []);

	useEffect(() => {
		if (selectedStory) {
			setData({
				name: selectedStory.name,
				description: selectedStory.description,
			});
			setFileList(selectedStory.images);
		}
	}, [selectedStory]);

	const onInputChange = (e: any) => {
		const { name, value } = e.target;
		setData({ ...data, [name]: value });
		localStorage.setItem("data", JSON.stringify(data));
	};

	const handleSubmit = async () => {
		console.log(
			"🚀 ~ handleSubmit ~ newStoryData: any.selectedStory:",
			selectedStory,
		);

		if (fileList.length === 0) {
			message.error("You need to select at least one image");
			return;
		}

		setIsUploading(true);
		message.loading("Uploading...");

		const existedImages = fileList.filter((file) => typeof file === "string");
		const newImages = fileList.filter((file) => typeof file === "object");

		if (newImages.length > 0) {
			handleUploadImage(newImages)
				.then((images) => {
					const urls = images ? images.map((image) => image?.url || "") : [];
					const newStoryData: any = {
						name: data.name,
						description: data.description,
						coverImage: selectedStory?.coverImage || urls?.[0] || "",
						images: [...existedImages, ...urls],
						userId: "defaultid",
					};
					if (selectedStory) {
						newStoryData.id = selectedStory.id;
						updateStory.mutate(newStoryData);
					} else {
						createStory.mutate(newStoryData);
					}
				})
				.catch((err) => console.log(err));
		} else {
			const newStoryData: any = {
				id: selectedStory?.id,
				name: data.name,
				description: data.description,
				coverImage: selectedStory?.coverImage || "",
				images: existedImages,
				userId: "defaultid",
			};
			console.log(
				"🚀 ~ handleSubmit ~ newStoryData: any.selectedStory?.id:",
				newStoryData,
			);

			updateStory.mutate(newStoryData);
		}

		onOpenChange(false);
	};

	const _resetModal = () => {
		setFileList([]);
		setIsUploading(false);
		setData({ name: "", description: "" });
		localStorage.removeItem("data");
	};

	const confirm: PopconfirmProps["onConfirm"] = ({ onClose }: any) => {
		_resetModal();
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
							Create new memory
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
							<div>
								<UploadV2 fileList={fileList} setFileList={setFileList} />
								{previewImage && (
									<Image
										wrapperStyle={{ display: "none" }}
										preview={{
											visible: previewOpen,
											onVisibleChange: (visible) => setPreviewOpen(visible),
											afterOpenChange: (visible) =>
												!visible && setPreviewImage(""),
										}}
										src={previewImage}
									/>
								)}
							</div>
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
