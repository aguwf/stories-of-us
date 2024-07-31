import Image from "next/image";

type ImageKitLoaderProps = {
  src: string;
  width: number;
  quality?: number;
};

type ImageKProps = {

}

const imageKitLoader = ({ src, width, quality }: ImageKitLoaderProps) => {
  if (src[0] === "/") src = src.slice(1);
  const params = [`w-${width}`];
  if (quality) {
    params.push(`q-${quality}`);
  }
  const paramsString = params.join(",");
  var urlEndpoint = "https://ik.imagekit.io/your_imagekit_id";
  if (urlEndpoint[urlEndpoint.length - 1] === "/")
    urlEndpoint = urlEndpoint.substring(0, urlEndpoint.length - 1);
  return `${urlEndpoint}/${src}?tr=${paramsString}`;
};

const ImageK = (props: any) => {
  return (
    <Image
      loader={imageKitLoader}
      src="default-image.jpg"
      alt="Sample image"
      width={400}
      height={400}
    />
  );
};

export default ImageK;
