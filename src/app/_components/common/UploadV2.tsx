import { Button } from "@nextui-org/react";
import { Image } from "antd";
import { Cancel01Icon, PlusSignIcon } from "hugeicons-react";
import { useEffect, useRef, useState } from "react";

const chunkArray = (array: File[], size: number) => {
	const chunkedArray = [];
	for (let i = 0; i < array.length; i += size) {
		chunkedArray.push(array.slice(i, i + size));
	}
	return chunkedArray;
};

export const UploadV2 = (_props: any) => {
	const [fileList, setFileList] = useState<File[]>([]);
	const inputFileRef = useRef<HTMLInputElement>(null);
	const objectURLsRef = useRef<string[]>([]);

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

	useEffect(() => {
		const fileBatches = chunkArray(fileList, 10); // Chia thành batch 10 file

		for (const batch of fileBatches) {
			for (const file of batch) {
				if (!objectURLsRef.current.includes(createObjectURL(file))) {
					objectURLsRef.current.push(createObjectURL(file));
				}
			}
		}

		return () => {
			for (const url of objectURLsRef.current) URL.revokeObjectURL(url);
			objectURLsRef.current = [];
		};
	}, [fileList]);

	return (
		<div>
			<span className="upload-wrapper">
				<div className="upload-list flex flex-wrap gap-2 transition-all duration-300">
					<div className="upload-select 0, 0, 0.02)] h-[102px] w-[102px] cursor-pointer rounded-lg border-1 border-[#d9d9d9] border-dashed bg-[rgba(0, text-center align-top transition-border-color duration-300 ease-in-out">
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
							? fileList.map((file: File, index: number) => {
									// Lấy objectURL từ danh sách objectURLsRef
									const objectURL = objectURLsRef.current[index];
									return (
										<div
											className="upload-select relative transition-all duration-300 ease-in-out"
											key={file.name + file.size}
										>
											<Image
												src={objectURL}
												alt={file.name}
												width={102}
												height={102}
												className="rounded-lg object-cover"
											/>

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
