import Image from "next/image";
import type { ImageProps } from "next/image";
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

const ImageK = (props: Omit<ImageProps, "loader">) => {
	const { fill, width, height, src, alt, ...restProps } = props;

	return (
		<Image
			loader={imageKitLoader}
			src={src || "default-image.jpg"}
			alt={alt || "Sample image"}
			{...(fill
				? { fill: true }
				: {
						width: width || 400,
						height: height || 400,
					})}
			{...restProps}
		/>
	);
};

export default ImageK;
