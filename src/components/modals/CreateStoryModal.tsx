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
	const [messageApi] = message.useMessage();
	const utils = api.useUtils();

	const creating = () => {
		messageApi.open({
			type: "loading",
			content: "Action in progress..",
			duration: 0,
		});
		// Dismiss manually and asynchronously
		setTimeout(messageApi.destroy, 2500);
	};

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

			const selectedFile = selectedStory.images.map((image: string) => {
				return {
					uid: image,
					name: image,
					status: "done",
					url: image,
				};
			});
			setFileList(selectedFile);
		}
	}, [selectedStory]);

	const onInputChange = (e: any) => {
		const { name, value } = e.target;
		setData({ ...data, [name]: value });
		localStorage.setItem("data", JSON.stringify(data));
	};

	const handleSubmit = async () => {
		if (fileList.length === 0) {
			message.error("You need to select at least one image");
			return;
		}

		setIsUploading(true);

		handleUploadImage(fileList)
			.then((images) => {
				const urls = images ? images.map((image) => image?.url || "") : [];
				const createStoryData = {
					name: data.name,
					description: data.description,
					coverImage: urls?.[0] || "",
					images: urls,
					userId: "test",
				};

				createStory.mutate(createStoryData);
			})
			.catch((err) => {
				console.log("🚀 ~ err:", err);
			});

		onOpenChange(false);
		creating();
	};

	const createStory = api.story.create.useMutation({
		onSuccess: async () => {
			await utils.story.invalidate();
			_resetModal();
		},
		onError: () => {
			setIsUploading(false);
		},
	});

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
								isLoading={isUploading}
							>
								Save
							</Button>
						</ModalFooter>
					</>
				)}
			</ModalContent>
		</Modal>
	);
}
