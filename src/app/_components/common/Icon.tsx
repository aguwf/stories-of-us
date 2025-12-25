import type { SVGProps } from "react";

import { cn } from "@/lib/utils";
import type { IconName } from "../../../../types/name";

export type { IconName };

export function Icon({
	name,
	childClassName,
	className,
	children,
	...props
}: SVGProps<SVGSVGElement> & {
	name: IconName;
	childClassName?: string;
}) {
	if (children) {
		return (
			<span
				className={cn("inline-flex items-center font gap-1.5", childClassName)}
			>
				<Icon name={name} className={className} {...props} />
				{children}
			</span>
		);
	}
	return (
		// biome-ignore lint/a11y/noSvgWithoutTitle: <explanation>
		<svg
			{...props}
			className={cn("inline self-center w-[1em] h-[1em]", className)}
		>
			<use href={`/icons/sprite.svg#${name}`} />
		</svg>
	);
}
