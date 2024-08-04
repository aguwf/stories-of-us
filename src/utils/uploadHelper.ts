// import ImageKit from "imagekit";
import { env } from "@/env";
import { generateImageKitSignature } from "./Helpers";
import { logger } from "@/libs/Logger";
import axios from "axios";
import { v2 as cloudinary } from "cloudinary";
import ImageKit from "imagekit-javascript"
import { UploadOptions } from "imagekit-javascript/dist/src/interfaces";

const imageKit = new ImageKit({
  publicKey: env.NEXT_PUBLIC_IMAGEKIT_PUBLIC_KEY!,
  urlEndpoint: env.NEXT_PUBLIC_IMAGEKIT_URL_ENDPOINT!,
});

export const handleUploadImage = async (images?: any[]) => {
  if (!images) return;

  if (!images.length) {
    return [];
  }

  const uploadedImages = await Promise.all(
    images.map((image) => uploadImage(image)),
  );

  return uploadedImages;
};

// const uploadImageToCloudinary = async (image: File) => {
//   try {
//     const arrayBuffer = await image.arrayBuffer();
//     const buffer = Buffer.from(arrayBuffer);

//     cloudinary.config({
//       cloud_name: "dtyfwhsr4",
//       api_key: "835969351159931",
//       api_secret: "A7DIPMwd7Ui34yvOYbGS0Iq5aq0",
//     });

//     const result = await cloudinary.uploader.upload(buffer, {
//       resource_type: "image",
//       upload_preset: "stories-of-us",
//       moderation: "duplicate: 0.8",
//       moderation_status: "approved",
//     });

//     return result.secure_url;
//   } catch (error) {
//     logger.error(error);
//     return null;
//   }
// };

const uploadImage = async (image: File) => {
  try {
    // !Old
    // const arrayBuffer = await image.arrayBuffer();
    // const buffer = Buffer.from(arrayBuffer);
    // const response = await imageKit.upload({
    //   file: buffer,
    //   fileName: image.name,
    // });
    // return response.url;

    // *New
    const folder = "stories-of-us";

    const ikSign = generateImageKitSignature({
      expireTime: 1000,
    });

    const ikPayload: UploadOptions = {
      file: image,
      fileName: image.name,
      signature: ikSign.signature,
      expire: ikSign.expire,
      token: ikSign.token,
      folder,
    };

    const imageRes = await imageKit.upload(ikPayload);

    return imageRes.url;
  } catch (error) {
    logger.error(error);
    return null;
  }
};
