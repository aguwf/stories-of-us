import { Upload } from 'antd';
// import upload from 'antd/es/upload';
// import { or } from 'drizzle-orm';
import { PlusSignIcon } from 'hugeicons-react';

import useFilePreview from '../../hooks/useFilePreview';

const { Dragger } = Upload;

const DragAndDrop = ({ addFile, removeFile }) => {
  const [handlePreview, previewContent] = useFilePreview();

  const beforeUploadHandler = (file: any) => {
    addFile(file);
    return false;
  };

  return (
    <>
      <Dragger
        multiple
        onRemove={removeFile}
        showUploadList
        listType="picture-card"
        beforeUpload={beforeUploadHandler}
        onPreview={handlePreview}
        accept="image/*"
      >
        <p className="ant-upload-drag-icon">
          <PlusSignIcon />
        </p>
        <p className="ant-upload-text">
          Click this area or drag files to upload
        </p>
      </Dragger>
      {previewContent}
    </>
  );
};

export default DragAndDrop;
