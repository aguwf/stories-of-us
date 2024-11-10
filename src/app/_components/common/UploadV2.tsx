import { Button } from "@nextui-org/react";
import { Image } from "antd";
import { Cancel01Icon, PlusSignIcon } from "hugeicons-react";
import { useCallback, useEffect, useRef, useState } from "react";

interface UploadV2Props {
	fileList: (File | string)[];
	setFileList: React.Dispatch<React.SetStateAction<(File | string)[]>>;
}

export const UploadV2: React.FC<UploadV2Props> = ({
	fileList,
	setFileList,
}) => {
	const inputFileRef = useRef<HTMLInputElement>(null);
	const [objectURLs, setObjectURLs] = useState<string[]>([]);
	const [isLoading, setIsLoading] = useState(false);

	const handleClickUpload = () => {
		inputFileRef.current?.click();
	};

	const handleChangeFile = useCallback(
		(event: React.ChangeEvent<HTMLInputElement>) => {
			const files = event.target.files;
			if (files) {
				setFileList((prevList) => [...prevList, ...Array.from(files)]);
			}
		},
		[setFileList],
	);

	const handleRemoveFile = useCallback(
		(index: number) => {
			setFileList((prevList) => {
				const newList = [...prevList];
				newList.splice(index, 1);
				return newList;
			});
		},
		[setFileList],
	);

	const createObjectURL = useCallback((file: File | string) => {
		return typeof file === "string" ? file : URL.createObjectURL(file);
	}, []);

	useEffect(() => {
		const timeoutId = setTimeout(() => {
			setIsLoading(true);
			const newObjectURLs = fileList.map(createObjectURL);
			setObjectURLs(newObjectURLs);
			setIsLoading(false);
		}, 300);

		return () => {
			clearTimeout(timeoutId);
			for (const url of objectURLs) {
				if (url.startsWith("blob:")) {
					URL.revokeObjectURL(url);
				}
			}
		};
	}, [fileList, createObjectURL, objectURLs]);

	const renderFilePreview = useCallback(
		(file: File | string, index: number) => {
			const key = typeof file === "string" ? file : file.name + file.size;
			return (
				<div
					className="upload-select relative w-[calc((100%-16px)/3)] text-center transition-all duration-300 ease-in-out"
					key={key}
				>
					{isLoading ? (
						<div className="h-full w-full animate-pulse rounded-lg bg-gray-300" />
					) : (
						<Image
							src={objectURLs[index]}
							alt={typeof file === "string" ? file : file.name}
							height={102}
							className="rounded-lg object-cover"
						/>
					)}
					<span className="close -right-2 -top-2 absolute cursor-pointer">
						<Button
							isIconOnly
							className="h-5 min-h-5 w-5 min-w-5 rounded-full"
							onClick={() => handleRemoveFile(index)}
						>
							<Cancel01Icon size={12} />
						</Button>
					</span>
				</div>
			);
		},
		[isLoading, objectURLs, handleRemoveFile],
	);

	return (
		<div>
			<span className="upload-wrapper">
				<div className="upload-list flex flex-wrap gap-2 transition-all duration-300">
					<div className="upload-select h-[102px] w-[calc((100%-16px)/3)] cursor-pointer rounded-lg border-1 border-[#d9d9d9] border-dashed bg-black/[.02] text-center align-top transition-border-color duration-300 ease-in-out">
						<span className="upload flex h-full flex-col items-center justify-center">
							<input
								accept="image/*"
								multiple={true}
								type="file"
								className="hidden"
								ref={inputFileRef}
								onChange={handleChangeFile}
							/>
							<button type="button" onClick={handleClickUpload}>
								<PlusSignIcon className="mx-auto" />
								<div className="mt-2">Upload</div>
							</button>
						</span>
					</div>
					<Image.PreviewGroup>
						{fileList.map(renderFilePreview)}
					</Image.PreviewGroup>
				</div>
			</span>
		</div>
	);
};
