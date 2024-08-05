/* eslint-disable */
import { message, type UploadFile } from 'antd';
import { useState } from 'react';

// import { uploadImage } from '../utils/api';

const useFileSelection = () => {
  const [isUploading, setIsUploading] = useState(false);

  const uploadSelection = (files: UploadFile[]) => {
    if (files.length === 0) {
      message.error('You need to select at least one image');
      return;
    }
    setIsUploading(true);
    // const uploadResults = [];
    // files.forEach((file) => {
      // Image upload method
      // uploadImage({
      //   file,
      //   successCallback: (response: any) => {
      //     uploadResults.push(response);
      //     if (uploadResults.length === files.length) {
      //       setIsUploading(false);
      //       message.success('Images uploaded successfully');
      //     }
      //   },
      // });
    // });
  };
  return [isUploading, uploadSelection];
};
export default useFileSelection;
