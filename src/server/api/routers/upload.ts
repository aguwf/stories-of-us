import {
  createTRPCRouter,
  protectedProcedure,
  publicProcedure,
} from "@/server/api/trpc";
import ImageKit from "imagekit";
import z from "zod";

const imageKit = new ImageKit({
  publicKey: process.env.IMAGEKIT_PUBLIC_KEY!,
  privateKey: process.env.IMAGEKIT_PRIVATE_KEY!,
  urlEndpoint: process.env.IMAGEKIT_URL_ENDPOINT!,
});

const uploadImage = async (image: File) => {
  const arrayBuffer = await image.arrayBuffer();
  const buffer = Buffer.from(arrayBuffer);

  const response = await imageKit.upload({
    file: buffer,
    fileName: image.name,
  });

  return response;
};

export const uploadRouter = createTRPCRouter({
  uploadImage: publicProcedure
    .input(z.object({ images: z.array(z.any()) }))
    .mutation(async ({ input }) => {
      const uploadedImages = await Promise.all(
        input.images.map((image) => uploadImage(image)),
      );

      return uploadedImages;
    }),
});
