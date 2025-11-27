'use client';
import type { FunctionComponent } from "react";
import { useTranslations } from "next-intl";

interface UserLocationButtonProps {
	onClick: () => void;
	isVisible: boolean;
}

export const UserLocationButton: FunctionComponent<UserLocationButtonProps> = ({
	onClick,
	isVisible,
}) => {
	const t = useTranslations("Map");

	if (!isVisible) return null;

	return (
		<button
			type="button"
			onClick={onClick}
			className="absolute bottom-4 right-4 bg-white hover:bg-gray-50 rounded-full shadow-lg p-3 z-10 transition-all hover:scale-105"
			aria-label={t("get_my_location")}
			title={t("get_my_location")}
		>
			{/** biome-ignore lint/a11y/noSvgWithoutTitle: <explanation> */}
			<svg
				width="24"
				height="24"
				viewBox="0 0 24 24"
				fill="none"
				stroke="#B7A3E3"
				strokeWidth="2"
			>
				<path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83" />
				<circle cx="12" cy="12" r="3" />
			</svg>
		</button>
	);
};
