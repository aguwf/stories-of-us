import { generateImageKitSignature } from "@/app/actions/imagekit";
import { env } from "@/env";
import { logger } from "@/lib/logger";
import ImageKit from "imagekit-javascript";
import type { UploadOptions } from "imagekit-javascript/dist/src/interfaces";

const imageKit = new ImageKit({
	publicKey: env.NEXT_PUBLIC_IMAGEKIT_PUBLIC_KEY,
	urlEndpoint: env.NEXT_PUBLIC_IMAGEKIT_URL_ENDPOINT,
});

export const handleUploadImage = async (images?: any[]) => {
	if (!images) return;

	if (!images.length) {
		return [];
	}

	const uploadedImages = await Promise.all(
		images.map(image => uploadImage(image))
	);

	return uploadedImages;
};

const uploadImage = async (image: File, folder = "stories-of-us") => {
	try {
		const ikSign = await generateImageKitSignature({
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

		return await imageKit.upload(ikPayload);
	} catch (error) {
		logger.error(error);
		return null;
	}
};
