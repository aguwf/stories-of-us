import { logger } from "@/libs/Logger";

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

const uploadImage = async (image: File) => {
	try {
		return image;
	} catch (error) {
		logger.error(error);
		return null;
	}
};
