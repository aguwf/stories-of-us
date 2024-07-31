// import { v2 as cloudinary } from "cloudinary";
// import { uploadPreset } from "./cloudinaryConfig";
// type UploadPayload = {
//   file: File;
//   successCallback: (res: any) => void;
// };

// export const uploadImageToCloudinary = async ({
//   file,
//   successCallback,
// }: UploadPayload) => {
//   const arrayBuffer = await file.arrayBuffer();
//   const buffer = Buffer.from(arrayBuffer);

//   cloudinary.config({
//     cloud_name: "dtyfwhsr4",
//     api_key: "835969351159931",
//     api_secret: "A7DIPMwd7Ui34yvOYbGS0Iq5aq0",
//   });

//   await new Promise((resolve, reject) => {
//     cloudinary.uploader
//       .upload_stream(
//         {
//           resource_type: "image",
//           upload_preset: uploadPreset,
//           moderation: "duplicate: 0.8",
//           moderation_status: "approved",
//         },
//         (error: any, result: any) => {
//           if (error) {
//             console.log("🚀 ~ error:", error);
//             reject(error);
//           } else {
//             successCallback(result);
//             resolve(result);
//           }
//         }
//       )
//       .end(buffer);
//   });
// };
