import { Button } from "@/components/ui/button";
import { Plus, X } from "lucide-react";
import Image from "next/image";
import { memo, useCallback, useEffect, useMemo, useRef, useState } from "react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

// Constants
const DEFAULT_MAX_FILES = 9;
const IMAGE_SIZE = 102;
const ACCEPTED_IMAGE_TYPES = "image/*";

// Types
interface UploadV2Props {
	fileList: (File | string)[];
	setFileList: React.Dispatch<React.SetStateAction<(File | string)[]>>;
	maxFiles?: number;
	className?: string;
	accept?: string;
	disabled?: boolean;
	onMaxFilesReached?: () => void;
}

interface FilePreviewProps {
	file: File | string;
	index: number;
	objectURL: string;
	onRemove: (index: number) => void;
	disabled?: boolean;
}

// Helper functions
const getFileKey = (file: File | string): string => {
	return typeof file === "string" ? file : `${file.name}-${file.size}`;
};

const getFileName = (file: File | string): string => {
	return typeof file === "string" ? file : file.name;
};

const createObjectURL = (file: File | string): string => {
	return typeof file === "string" ? file : URL.createObjectURL(file);
};

const isBlobURL = (url: string): boolean => {
	return url.startsWith("blob:");
};

// Components
const FilePreview = memo<FilePreviewProps>(
	({ file, index, objectURL, onRemove, disabled = false }) => {
		const fileName = getFileName(file);

		return (
			<div className="upload-select relative w-[calc((100%-16px)/3)] text-center transition-all duration-300 ease-in-out">
				<Image
					src={objectURL}
					alt={fileName}
					width={IMAGE_SIZE}
					height={IMAGE_SIZE}
					className="object-cover rounded-lg w-full h-[102px]"
				/>
				{!disabled && (
					<span className="absolute -top-2 -right-2 cursor-pointer close">
						<Button
							size="icon"
							type="button"
							className="w-5 h-5 rounded-full min-h-5 min-w-5"
							onClick={() => onRemove(index)}
							aria-label={`Remove ${fileName}`}
						>
							<X size={12} />
						</Button>
					</span>
				)}
			</div>
		);
	},
);

FilePreview.displayName = "FilePreview";

export const UploadV2: React.FC<UploadV2Props> = ({
	fileList,
	setFileList,
	maxFiles = DEFAULT_MAX_FILES,
	className,
	accept = ACCEPTED_IMAGE_TYPES,
	disabled = false,
	onMaxFilesReached,
}) => {
	const inputFileRef = useRef<HTMLInputElement>(null);
	const [objectURLs, setObjectURLs] = useState<string[]>([]);

	// Check if max files limit is reached
	const isMaxFilesReached = useMemo(
		() => fileList.length >= maxFiles,
		[fileList.length, maxFiles],
	);

	// Handle upload button click
	const handleClickUpload = useCallback(() => {
		if (disabled) return;

		if (isMaxFilesReached) {
			toast.error(`Maximum ${maxFiles} files allowed`);
			onMaxFilesReached?.();
			return;
		}

		inputFileRef.current?.click();
	}, [disabled, isMaxFilesReached, maxFiles, onMaxFilesReached]);

	// Handle file selection
	const handleChangeFile = useCallback(
		(event: React.ChangeEvent<HTMLInputElement>) => {
			const files = event.target.files;
			if (!files || files.length === 0) return;

			const remainingSlots = maxFiles - fileList.length;
			const newFiles = Array.from(files).slice(0, remainingSlots);

			if (newFiles.length < files.length) {
				toast.warning(
					`Only ${newFiles.length} file(s) added. Maximum ${maxFiles} files allowed.`,
				);
			}

			if (newFiles.length > 0) {
				setFileList((prevList) => [...prevList, ...newFiles]);
			}

			// Reset input value to allow uploading the same file again
			event.target.value = "";
		},
		[setFileList, fileList.length, maxFiles],
	);

	// Handle file removal
	const handleRemoveFile = useCallback(
		(index: number) => {
			if (disabled) return;

			setFileList((prevList) => prevList.filter((_, i) => i !== index));
		},
		[setFileList, disabled],
	);

	// Manage object URLs for file previews
	useEffect(() => {
		const newObjectURLs = fileList.map(createObjectURL);
		setObjectURLs(newObjectURLs);

		return () => {
			// Only revoke URLs that we created (blob URLs)
			newObjectURLs.forEach((url) => {
				if (isBlobURL(url)) {
					URL.revokeObjectURL(url);
				}
			});
		};
	}, [fileList]);

	const showUploadButton = !isMaxFilesReached && !disabled;

	return (
		<div className={cn("upload-container", className)}>
			<div className="upload-wrapper">
				<div className="flex flex-wrap gap-2 transition-all duration-300 upload-list">
					{showUploadButton && (
						<div className="upload-select h-[102px] w-[calc((100%-16px)/3)] cursor-pointer rounded-lg border-1 border-[#d9d9d9] border-dashed bg-black/[.02] text-center align-top transition-border-color duration-300 ease-in-out hover:border-[#4096ff]">
							<label
								htmlFor="file-upload"
								className="flex flex-col justify-center items-center h-full cursor-pointer upload"
							>
								<input
									id="file-upload"
									accept={accept}
									multiple={true}
									type="file"
									className="hidden"
									ref={inputFileRef}
									onChange={handleChangeFile}
									disabled={disabled}
									aria-label="Upload images"
								/>
								<button
									type="button"
									onClick={handleClickUpload}
									className="flex flex-col items-center"
									aria-label="Select files to upload"
								>
									<Plus className="mx-auto" />
									<div className="mt-2">Upload</div>
								</button>
							</label>
						</div>
					)}
					{fileList.map((file, index) => (
						<FilePreview
							key={getFileKey(file)}
							file={file}
							index={index}
							objectURL={objectURLs[index] || ""}
							onRemove={handleRemoveFile}
							disabled={disabled}
						/>
					))}
				</div>
			</div>
		</div>
	);
};
