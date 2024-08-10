import Image from "next/image";
import React from "react";

type ImageKitLoaderProps = {
	src: string;
	width: number;
	quality?: number;
};

const imageKitLoader = ({ src, width, quality }: ImageKitLoaderProps) => {
	if (src.startsWith("/")) src = src.slice(1);
	const params = [`w-${width}`];
	if (quality) {
		params.push(`q-${quality}`);
	}
	const paramsString = params.join(",");
	let urlEndpoint = "https://ik.imagekit.io/aguwf/stories-of-us";
	if (urlEndpoint.endsWith("/"))
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
			{...props}
		/>
	);
};

export default ImageK;
