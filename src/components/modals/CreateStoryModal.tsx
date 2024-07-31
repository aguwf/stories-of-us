"use client";

import { api } from "@/trpc/react";
import {
  Modal,
  ModalBody,
  ModalContent,
  ModalFooter,
  ModalHeader,
} from "@nextui-org/modal";
import { Button, Input, Textarea } from "@nextui-org/react";
import type { GetProp, PopconfirmProps, UploadFile, UploadProps } from "antd";
import { message, Popconfirm, Upload } from "antd";
import { PlusSignIcon } from "hugeicons-react";
import { useTranslations } from "next-intl";
import { useEffect, useState } from "react";

const uploadButton = (
  <button className="border-0 bg-none" type="button">
    <PlusSignIcon className="mx-auto" />
    <div className="mt-2">Upload</div>
  </button>
);

type FileType = Parameters<GetProp<UploadProps, "beforeUpload">>[0];

const getBase64 = (file: FileType): Promise<string> =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = (error) => reject(error);
  });

export default function CreateStoryModal({ isOpen, onOpenChange }: any) {
  // const t = useTranslations("Index");
  // const [previewOpen, setPreviewOpen] = useState(false);
  // const [previewImage, setPreviewImage] = useState("");
  const [fileList, setFileList] = useState<UploadFile[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [data, setData] = useState<any>();

  useEffect(() => {
    const localData = localStorage.getItem("data");
    if (localData) {
      setData(JSON.parse(localData));
    } else {
      setData({ title: "", description: "" });
    }
    // Before reload browser
    window.addEventListener("beforeunload", () => {
      localStorage.removeItem("data");
    });
  }, []);

  // const handlePreview = (file: UploadFile) => {
  //   if (!file.url && !file.preview) {
  //     getBase64(file.originFileObj as FileType).then(
  //       (res) => (file.preview = res),
  //     );
  //   }
  //   setPreviewImage(file.url || (file.preview as string));
  //   setPreviewOpen(true);
  // };

  const handleChange: UploadProps["onChange"] = ({ fileList: newFileList }) =>
    setFileList(newFileList);

  const onInputChange = (e: any) => {
    const { name, value } = e.target;
    setData({ ...data, [name]: value });
    localStorage.setItem("data", JSON.stringify(data));
  };

  const handleSubmit = () => {
    if (fileList.length === 0) {
      message.error("You need to select at least one image");
      return;
    }

    const filesConverted = fileList.map(
      (file) => file.originFileObj as FileType,
    );
    uploadImage.mutate({ images: filesConverted });
  };

  const createStory = api.story.create.useMutation({
    onSuccess: () => {
      onOpenChange(false);
    },
  });

  const uploadImage = api.upload.uploadImage.useMutation({
    onSuccess: (images) => {
      const imageUrls = images.map((image) => image.url);
      const uploadData = {
        name: data.title,
        description: data.description,
        coverImage: imageUrls[0] || "",
        images: imageUrls,
        userId: "Thai test",
      };

      createStory.mutate(uploadData);

      onOpenChange(false);
    },
  });

  const _resetModal = () => {
    // setPreviewOpen(false);
    // setUploadResults([]);
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
                <Upload
                  listType="picture-card"
                  fileList={fileList}
                  onChange={handleChange}
                  multiple
                >
                  {uploadButton}
                </Upload>
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
