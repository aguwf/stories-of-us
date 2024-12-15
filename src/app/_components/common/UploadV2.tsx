import { Button } from "@nextui-org/react";
import { Image } from "antd";
import { Plus, X } from "lucide-react";
import { useCallback, useEffect, useRef, useState, memo } from "react";

interface UploadV2Props {
  fileList: (File | string)[];
  setFileList: React.Dispatch<React.SetStateAction<(File | string)[]>>;
  maxFiles?: number;
  className?: string;
}

const FilePreview = memo(({ 
  file, 
  index, 
  objectURL, 
  onRemove 
}: { 
  file: File | string; 
  index: number; 
  objectURL: string;
  onRemove: (index: number) => void;
}) => (
  <div
    className="upload-select relative w-[calc((100%-16px)/3)] text-center transition-all duration-300 ease-in-out"
    key={typeof file === "string" ? file : `${file.name}-${file.size}`}
  >
    <Image
      src={objectURL}
      alt={typeof file === "string" ? file : file.name}
      height={102}
      className="rounded-lg object-cover"
    />
    <span className="close -right-2 -top-2 absolute cursor-pointer">
      <Button
        isIconOnly
        className="h-5 min-h-5 w-5 min-w-5 rounded-full"
        onClick={() => onRemove(index)}
      >
        <X size={12} />
      </Button>
    </span>
  </div>
));

FilePreview.displayName = 'FilePreview';

export const UploadV2: React.FC<UploadV2Props> = ({
  fileList,
  setFileList,
  maxFiles = 9,
  className,
}) => {
  const inputFileRef = useRef<HTMLInputElement>(null);
  const [objectURLs, setObjectURLs] = useState<string[]>([]);

  const handleClickUpload = useCallback(() => {
    if (fileList.length >= maxFiles) {
      alert(`Maximum ${maxFiles} files allowed`);
      return;
    }
    inputFileRef.current?.click();
  }, [fileList.length, maxFiles]);

  const handleChangeFile = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      const files = event.target.files;
      if (!files) return;

      const remainingSlots = maxFiles - fileList.length;
      const newFiles = Array.from(files).slice(0, remainingSlots);
      
      if (newFiles.length > 0) {
        setFileList((prevList) => [...prevList, ...newFiles]);
      }
      
      // Reset input value to allow uploading the same file again
      event.target.value = '';
    },
    [setFileList, fileList.length, maxFiles],
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
    const newObjectURLs = fileList.map(createObjectURL);
    setObjectURLs(newObjectURLs);

    return () => {
      // Only revoke URLs that we created (blob URLs)
      newObjectURLs.forEach(url => {
        if (url.startsWith('blob:')) {
          URL.revokeObjectURL(url);
        }
      });
    };
  }, [fileList, createObjectURL]);

  return (
    <div className={className}>
      <span className="upload-wrapper">
        <div className="upload-list flex flex-wrap gap-2 transition-all duration-300">
          {fileList.length < maxFiles && (
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
                  <Plus className="mx-auto" />
                  <div className="mt-2">Upload</div>
                </button>
              </span>
            </div>
          )}
          <Image.PreviewGroup>
            {fileList.map((file, index) => (
              <FilePreview
                key={typeof file === "string" ? file : `${file.name}-${file.size}`}
                file={file}
                index={index}
                objectURL={objectURLs[index] || ""}
                onRemove={handleRemoveFile}
              />
            ))}
          </Image.PreviewGroup>
        </div>
      </span>
    </div>
  );
};
