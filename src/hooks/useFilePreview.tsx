import {
	Dialog,
	DialogContent,
	DialogHeader,
	DialogTitle,
} from "@/components/ui/dialog";
import type { UploadFile } from "@/types/base";
/* eslint-disable */
import { useState } from "react";

const useFilePreview = () => {
	const [previewVisibility, setPreviewVisibility] = useState(false);
	const [previewImage, setPreviewImage] = useState("");
	const [previewTitle, setPreviewTitle] = useState("");

	const getBase64Representation = (file?: File) =>
		new Promise<string | ArrayBuffer | null>((resolve, reject) => {
			if (!file) {
				resolve(null);
				return;
			}
			const reader = new FileReader();
			reader.readAsDataURL(file);
			reader.onload = () => resolve(reader.result);
			reader.onerror = error => reject(error);
		});

	const handlePreview = async (file: UploadFile) => {
		if (!file.url && !file.preview) {
			file.preview = (await getBase64Representation(
				file.originFileObj
			)) as string;
		}
		setPreviewImage(file.url || file.preview || "");
		setPreviewVisibility(true);
		setPreviewTitle(
			file.name || file?.url?.substring(file.url.lastIndexOf("/") + 1) || ""
		);
	};

	const previewContent = (
		<Dialog open={previewVisibility} onOpenChange={setPreviewVisibility}>
			<DialogContent>
				<DialogHeader>
					<DialogTitle>{previewTitle}</DialogTitle>
				</DialogHeader>
				<img alt={previewTitle} className="w-full" src={previewImage} />
			</DialogContent>
		</Dialog>
	);

	return [handlePreview, previewContent];
};

export default useFilePreview;
