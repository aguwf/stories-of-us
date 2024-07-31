import ImageKit from "imagekit"

const imageKit = new ImageKit({
  publicKey: process.env.IMAGEKIT_PUBLIC_KEY!,
  privateKey: process.env.IMAGEKIT_PRIVATE_KEY!,
  urlEndpoint: process.env.IMAGEKIT_URL_ENDPOINT!,
})


export const handleUploadImage = async (images: File[]) => {
  "use server"

  if (!images.length) {
    return [];
  }

  const uploadedImages = await Promise.all(
    images.map((image) => uploadImage(image))
  )

  return uploadedImages;
}

const uploadImage = async (image: File) => {
  const arrayBuffer = await image.arrayBuffer()
  const buffer = Buffer.from(arrayBuffer)

  const response = await imageKit.upload({
    file: buffer,
    fileName: image.name,
  })

  return response;
}