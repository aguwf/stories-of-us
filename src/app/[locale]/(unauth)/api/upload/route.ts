import { env } from "@/env";
import { createCaller } from "@/server/api/root";
import { createTRPCContext } from "@/server/api/trpc";
import { generateImageKitSignature } from "@/utils/Helpers";
import { TRPCError } from "@trpc/server";
import type { NextApiRequest, NextApiResponse } from "next";
import type { CreateNextContextOptions } from "@trpc/server/adapters/next";
import { getHTTPStatusCodeFromError } from "@trpc/server/unstable-core-do-not-import";
import ImageKit from "imagekit-javascript";
import type { UploadOptions } from "imagekit-javascript/dist/src/interfaces";

const imageKit = new ImageKit({
	publicKey: env.NEXT_PUBLIC_IMAGEKIT_PUBLIC_KEY,
	urlEndpoint: env.NEXT_PUBLIC_IMAGEKIT_URL_ENDPOINT,
});

function createContext(_opts: CreateNextContextOptions) {
	return {};
}

export type Context = Awaited<ReturnType<typeof createContext>>;

export async function POST(req: NextApiRequest, res: NextApiResponse) {
	const ctx = await createTRPCContext({ headers: req.headers });
	const caller = createCaller(ctx);
	try {
		const {
			data,
			images,
			folder = "stories-of-us",
		}: { images?: File[]; folder?: string; data: any } = await req.body;
		console.log(images);
		if (!images || !images.length)
			return res.status(400).json({ message: "No images provided" });

		const uploadedImages = await Promise.all(
			images.map(async (image: File) => {
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

				return await imageKit.upload(ikPayload);
			}),
		);

		const imageUrls = uploadedImages.map((image) => image.url);

		const createStoryData = {
			name: data.title,
			description: data.description,
			coverImage: imageUrls[0] || "",
			images: imageUrls,
			userId: "test",
		};
		// createStory.mutate(uploadData);

		await caller.story.create(createStoryData);

		return res.status(200).json(uploadedImages);
	} catch (cause) {
		if (cause instanceof TRPCError) {
			// An error from tRPC occurred
			const httpCode = getHTTPStatusCodeFromError(cause);
			return res.status(httpCode).json(cause);
		}
		// Another error occurred
		console.error(cause);
		return res.status(500).json({ message: "Internal server error" });
	}
}
