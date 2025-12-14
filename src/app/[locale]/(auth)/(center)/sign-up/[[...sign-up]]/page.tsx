"use client";

import * as Clerk from "@clerk/elements/common";
import * as SignUp from "@clerk/elements/sign-up";
import { useTranslations } from "next-intl";

import { GoogleIcon } from "@/app/_assets/svg-icon/GoogleIcon";
import { FacebookIcon } from "@/app/_assets/svg-icon/FacebookIcon";
import { AppleIcon } from "@/app/_assets/svg-icon/AppleIcon";

export default function SignUpPage() {
  const t = useTranslations("SignUp");

  return (
    <div className="min-h-[600px] bg-[#FFF7EB] flex flex-col justify-center px-6">
      <SignUp.Root>
        <SignUp.Step name="start">
          <h1 className="text-center text-2xl font-semibold text-[#6B3F2E] mb-8">
            {t("title")}
          </h1>

          <Clerk.Field name="firstName">
            <Clerk.Label className="label">{t("name_label")}</Clerk.Label>
            <Clerk.Input className="input" />
          </Clerk.Field>

          <Clerk.Field name="phoneNumber">
            <Clerk.Label className="label">{t("phone_label")}</Clerk.Label>
            <Clerk.Input className="input" />
          </Clerk.Field>

          <Clerk.Field name="password">
            <Clerk.Label className="label">{t("password_label")}</Clerk.Label>
            <Clerk.Input type="password" className="input" />
          </Clerk.Field>

          <Clerk.Field name="confirmPassword">
            <Clerk.Label className="label">
              {t("confirm_password_label")}
            </Clerk.Label>
            <Clerk.Input type="password" className="input" />
          </Clerk.Field>

          <SignUp.Action submit className="primary-btn mt-6">
            {t("submit_label")}
          </SignUp.Action>

          {/* Divider */}
          <div className="flex items-center my-4">
            <div className="flex-1 h-[1px] bg-[#E97E4E]"></div>
            <div className="px-4 text-sm text-[#E97E4E]">{t("or")}</div>
            <div className="flex-1 h-[1px] bg-[#E97E4E]"></div>
          </div>

          <div className="mt-8 text-center text-sm text-[#E97E4E]">
            {t("social_title")}
          </div>

          <div className="flex justify-center gap-4 mt-4">
            <Clerk.Connection name="google" className="social-btn">
              <GoogleIcon />
            </Clerk.Connection>
            <Clerk.Connection name="facebook" className="social-btn">
              <FacebookIcon />
            </Clerk.Connection>
            <Clerk.Connection name="apple" className="social-btn">
              <AppleIcon />
            </Clerk.Connection>
          </div>
        </SignUp.Step>
      </SignUp.Root>
    </div>
  );
}
