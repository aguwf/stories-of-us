import Image from "next/image";

type ImageKitLoaderProps = {
  src: string;
  width: number;
  quality?: number;
};

const imageKitLoader = ({ src, width, quality }: ImageKitLoaderProps) => {
  if (src[0] === "/") src = src.slice(1);
  const params = [`w-${width}`];
  if (quality) {
    params.push(`q-${quality}`);
  }
  const paramsString = params.join(",");
  var urlEndpoint = "https://ik.imagekit.io/aguwf/stories-of-us";
  if (urlEndpoint[urlEndpoint.length - 1] === "/")
    urlEndpoint = urlEndpoint.substring(0, urlEndpoint.length - 1);
  return `${urlEndpoint}/${src}?tr=${paramsString}`;
};

const ImageK = (props: any) => {
  return (
    <Image
      loader={imageKitLoader}
      src={props.src || "default-image.jpg"}
      alt={props.alt || "Sample image"}
      width={props.width || 400}
      height={props.height || 400}
      { ...props }
    />
  );
};

export default ImageK;
