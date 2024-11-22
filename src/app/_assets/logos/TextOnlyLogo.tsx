import { AppConfig } from "@/utils/AppConfig";
import React from "react";

export const TextOnlyLogo = ({ size }: { size: string }) => (
	<h2
		className={`bg-gradient-to-r from-[#ae86e7] via-[#8dbad3] to-[#79d7cf] bg-clip-text py-12 text-center ${size} font-bold text-transparent drop-shadow`}
	>
		{AppConfig.name}
	</h2>
);
