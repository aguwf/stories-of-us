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
import { Button, Input, Textarea, image } from "@nextui-org/react";
import type { PopconfirmProps, UploadFile } from "antd";
import { Image, Popconfirm, message } from "antd";
// import { PlusSignIcon } from "hugeicons-react";
import { useEffect, useState } from "react";

// const uploadButton = (
// 	<button className="border-0 bg-none" type="button">
// 		<PlusSignIcon className="mx-auto" />
// 		<div className="mt-2">Upload</div>
// 	</button>
// );

// type FileType = Parameters<GetProp<UploadProps, "beforeUpload">>[0];

// const getBase64 = (file: FileType): Promise<string> =>
// 	new Promise((resolve, reject) => {
// 		const reader = new FileReader();
// 		reader.readAsDataURL(file);
// 		reader.onload = () => resolve(reader.result as string);
// 		reader.onerror = (error) => reject(error);
// 	});

interface StoryData {
	title: string;
	description: string;
}

export default function CreateStoryModal({
	isOpen,
	onOpenChange,
	selectedStory,
}: any) {
	const [previewOpen, setPreviewOpen] = useState(false);
	const [previewImage, setPreviewImage] = useState("");
	const [fileList, setFileList] = useState<UploadFile[]>([]);
	const [isUploading, setIsUploading] = useState(false);
	const [data, setData] = useState<StoryData>({ title: "", description: "" });

	const utils = api.useUtils();

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
				title: selectedStory.name,
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

		// const images: any = await handleUploadImage(fileList);
		console.log("🚀 ~ handleSubmit ~ fileList:", fileList);
		// const messageId = await uploadImageBackgroundJob({ images: fileList });
		const messageId = await fetch("/api/start-upload-job", {
			method: "POST",
			body: JSON.stringify({
				data,
				images: fileList,
			}),
		});

		console.log(messageId);
	};

	const createStory = api.story.create.useMutation({
		onSuccess: async () => {
			await utils.story.invalidate();
			onOpenChange(false);
			_resetModal();
		},
		onError: () => {
			setIsUploading(false);
		},
	});

	const _resetModal = () => {
		setFileList([]);
		setIsUploading(false);
		setData({ title: "", description: "" });
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
		>
			<ModalContent>
				{(onClose) => (
					<>
						<ModalHeader className="flex flex-col gap-1">
							Create new memory
						</ModalHeader>
						<ModalBody>
							<Input
								name="title"
								type="text"
								labelPlacement="inside"
								placeholder="Enter your title"
								label="Title"
								onChange={onInputChange}
								value={data.title}
							/>
							<Textarea
								label="Description"
								name="description"
								placeholder="Enter your description"
								onChange={onInputChange}
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
							{data?.title ? (
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
