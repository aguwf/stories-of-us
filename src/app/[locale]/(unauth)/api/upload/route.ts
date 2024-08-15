import { env } from "@/env";
import { createCaller } from "@/server/api/root";
import { createTRPCContext } from "@/server/api/trpc";
import { generateImageKitSignature } from "@/utils/Helpers";
import { TRPCError } from "@trpc/server";
import type { CreateNextContextOptions } from "@trpc/server/adapters/next";
import { getHTTPStatusCodeFromError } from "@trpc/server/unstable-core-do-not-import";
import ImageKit from "imagekit-javascript";
import type { UploadOptions } from "imagekit-javascript/dist/src/interfaces";
import type { NextRequest } from "next/server";

const imageKit = new ImageKit({
	publicKey: env.NEXT_PUBLIC_IMAGEKIT_PUBLIC_KEY,
	urlEndpoint: env.NEXT_PUBLIC_IMAGEKIT_URL_ENDPOINT,
});

function createContext(_opts: CreateNextContextOptions) {
	return {};
}

export type Context = Awaited<ReturnType<typeof createContext>>;

export async function POST(req: NextRequest) {
	const ctx = await createTRPCContext({ headers: req.headers });
	const caller = createCaller(ctx);
	try {
		const json = await req.json();
		console.log("🚀 ~ POST ~ json:", json);
		const {
			data,
			images,
			folder = "stories-of-us",
		}: { images?: File[]; folder?: string; data: any } = json;
		if (!images || !images.length)
			return new Response("No images provided", { status: 400 });

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
		console.log("🚀 ~ POST ~ createStoryData:", createStoryData);

		await caller.story.create(createStoryData);

		return new Response("Success", { status: 200 });
	} catch (cause) {
		if (cause instanceof TRPCError) {
			// An error from tRPC occurred
			const httpCode = getHTTPStatusCodeFromError(cause);
			return new Response(cause.message, { status: httpCode });
		}
		// Another error occurred
		console.error(cause);
		return new Response("Something went wrong", { status: 500 });
	}
}
