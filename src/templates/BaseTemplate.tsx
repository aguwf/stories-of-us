import NavigationBar from "@/app/_components/common/NavigationBar";
import { AppConfig } from "@/utils/appConfig";
import { useTranslations } from "next-intl";
import type React from "react";

const BaseTemplate = (props: {
  leftNav: React.ReactNode;
  rightNav?: React.ReactNode;
  children: React.ReactNode;
}) => {
  const t = useTranslations("BaseTemplate");

  return (
    <div className="w-full bg-cover bg-no-repeat px-1 text-gray-700 antialiased">
      <header className="border-gray-300 border-b mx-auto max-w-screen-sm">
        <div className="flex justify-between">
          <NavigationBar />
        </div>
      </header>

      <main className="min-h-[580px]">{props.children}</main>

      <footer className="border-gray-300 border-t py-2 text-center text-sm mx-auto max-w-screen-sm">
        © Copyright {new Date().getFullYear()} {AppConfig.name}.
        {` ${t("made_with")} `}
        <a
          href="https://aguwf.com"
          className="text-blue-700 hover:border-blue-700 hover:border-b-2"
        >
          AGuwf
        </a>
        .
        {/*
         * PLEASE READ THIS SECTION
         * I'm an indie maker with limited resources and funds, I'll really appreciate if you could have a link to my website.
         * The link doesn't need to appear on every pages, one link on one page is enough.
         * For example, in the `About` page. Thank you for your support, it'll mean a lot to me.
         */}
      </footer>
    </div>
  );
};

export { BaseTemplate };
