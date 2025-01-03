import { useTranslations } from "next-intl";
import React from "react";
import NavigationBar from "@/app/_components/common/NavigationBar";
import { AppConfig } from "@/utils/AppConfig";

const BaseTemplate = (props: {
	leftNav: React.ReactNode;
	rightNav?: React.ReactNode;
	children: React.ReactNode;
}) => {
	const t = useTranslations("BaseTemplate");

	return (
		// bg-main
		<div className="w-full bg-cover bg-no-repeat px-1 text-gray-700 antialiased">
			<div className="mx-auto max-w-screen-sm">
				<header className="border-gray-300 border-b">
					{/* <div>
            <h1 className="sha bg-gradient-to-r from-[#ae86e7] via-[#8dbad3] to-[#79d7cf] bg-clip-text py-12 text-center text-6xl font-bold text-transparent drop-shadow">
              {AppConfig.name}
            </h1>
            <h2 className="text-xl">{t('description')}</h2>
          </div> */}

					<div className="flex justify-between">
						<NavigationBar />
					</div>
				</header>

				<main className="min-h-[580px]">{props.children}</main>

				<footer className="border-gray-300 border-t py-8 text-center text-sm">
					© Copyright {new Date().getFullYear()} {AppConfig.name}.
					{` ${t("made_with")} `}
					<a
						href="https://aguwf.com"
						className="text-blue-700 hover:border-blue-700 hover:border-b-2"
					>
						AGuwf
					</a>
					.{/*
					 * PLEASE READ THIS SECTION
					 * I'm an indie maker with limited resources and funds, I'll really appreciate if you could have a link to my website.
					 * The link doesn't need to appear on every pages, one link on one page is enough.
					 * For example, in the `About` page. Thank you for your support, it'll mean a lot to me.
					 */}
				</footer>
			</div>
		</div>
	);
};

export { BaseTemplate };
