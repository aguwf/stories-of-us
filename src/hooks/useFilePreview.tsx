/* eslint-disable */
import { Modal, type UploadFile } from "antd";
import { useState } from "react";

const useFilePreview = () => {
  const [previewVisibility, setPreviewVisibility] = useState(false);
  const [previewImage, setPreviewImage] = useState("");
  const [previewTitle, setPreviewTitle] = useState("");

  const getBase64Representation = (file: any) =>
    new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result);
      reader.onerror = (error) => reject(error);
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

  const hidePreview = () => {
    setPreviewVisibility(false);
  };

  const previewContent = (
    <Modal
      open={previewVisibility}
      title={previewTitle}
      footer={null}
      onCancel={hidePreview}
    >
      <img alt={previewTitle} className="w-full" src={previewImage} />
    </Modal>
  );

  return [handlePreview, previewContent];
};

export default useFilePreview;
