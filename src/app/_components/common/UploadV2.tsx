import { Button } from "@nextui-org/react";
import { Image } from "antd";
import { Cancel01Icon, PlusSignIcon } from "hugeicons-react";
import { useEffect, useRef, useState } from "react";

export const UploadV2 = (_props: any) => {
	const { fileList, setFileList } = _props;
	const inputFileRef = useRef<HTMLInputElement>(null);
	const [objectURLs, setObjectURLs] = useState<string[]>([]);
	const [isLoading, setIsLoading] = useState(false); // Track loading state

	const handleClickUpload = () => {
		inputFileRef.current?.click();
	};

	const handleChangeFile = (event: React.ChangeEvent<HTMLInputElement>) => {
		const files = event.target.files;
		if (files) {
			setFileList([...fileList, ...Array.from(files)]);
		}
	};

	const handleRemoveFile = (index: number) => {
		const newFileList = [...fileList];
		newFileList.splice(index, 1);
		setFileList(newFileList);
	};

	const createObjectURL = (file: File) => {
		return URL.createObjectURL(file);
	};

	// Lazy Loading and Throttling
	useEffect(() => {
		const timeoutId = setTimeout(() => {
			setIsLoading(true); // Start loading
			const newObjectURLs = fileList.map((file: any) => {
				console.log("🚀 ~ newObjectURLs ~ file:", file);
				if (typeof file === "string") {
					return file;
				}
				return createObjectURL(file);
			});
			setObjectURLs(newObjectURLs);
			setIsLoading(false); // Finish loading
		}, 500); // Adjust delay as needed

		return () => clearTimeout(timeoutId);
	}, [fileList]);

	return (
		<div>
			<span className="upload-wrapper">
				<div className="upload-list flex flex-wrap gap-2 transition-all duration-300">
					<div className="upload-select h-[102px] w-[calc((100%-16px)/3)] cursor-pointer rounded-lg border-1 border-[#d9d9d9] border-dashed bg-black/[.02] text-center align-top transition-border-color duration-300 ease-in-out">
						<span className="upload flex h-full flex-col items-center justify-center">
							<input
								accept=""
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
						{fileList.length
							? fileList.map((file: any, index: number) => {
									if (typeof file === "string") {
										return (
											<div
												className="upload-select relative w-[calc((100%-16px)/3)] text-center transition-all duration-300 ease-in-out"
												key={file}
											>
												{isLoading ? (
													<div className="h-full w-full animate-pulse rounded-lg bg-gray-300" />
												) : (
													<Image
														src={file} // Use objectURLs
														alt={file}
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
									}
									return (
										<div
											className="upload-select relative w-[calc((100%-16px)/3)] text-center transition-all duration-300 ease-in-out"
											key={file.name + file.size}
										>
											{isLoading ? (
												<div className="h-full w-full animate-pulse rounded-lg bg-gray-300" />
											) : (
												<Image
													src={objectURLs[index]} // Use objectURLs
													alt={file.name}
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
								})
							: null}
					</Image.PreviewGroup>
				</div>
			</span>
		</div>
	);
};
