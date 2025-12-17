"use client";

import * as Clerk from "@clerk/elements/common";
import * as SignIn from "@clerk/elements/sign-in";
import { useTranslations } from "next-intl";

import { GoogleIcon } from "@/app/_assets/svg-icon/GoogleIcon";
import { FacebookIcon } from "@/app/_assets/svg-icon/FacebookIcon";
import { AppleIcon } from "@/app/_assets/svg-icon/AppleIcon";

export default function SignInPage() {
  const t = useTranslations("SignIn");

  return (
    <div className="bg-[#FFF7EB] flex flex-col justify-center px-6">
      <SignIn.Root>
        <SignIn.Step name="start">
          <h1 className="text-center text-2xl font-semibold text-text-secondary mb-8">
            {t("title")}
          </h1>

          {/* Phone */}
          <Clerk.Field name="identifier" className="mt-6">
            <Clerk.Label className="label">{t("identifier_label")}</Clerk.Label>
            <Clerk.Input className="input" />
            <Clerk.FieldError className="error" />
          </Clerk.Field>

          {/* Password */}
          <Clerk.Field name="password" className="mt-6">
            <Clerk.Label className="label">{t("password_label")}</Clerk.Label>
            <Clerk.Input type="password" className="input" />
            <Clerk.FieldError className="error" />
          </Clerk.Field>

          <SignIn.Action submit={true} className="primary-btn mt-6">
            {t("submit_label")}
          </SignIn.Action>

          {/* Divider */}
            <div className="flex items-center my-4">
              <div className="flex-1 h-[1px] bg-[#E97E4E]" />
              <div className="px-4 text-sm text-[#E97E4E]">{t("or")}</div>
              <div className="flex-1 h-[1px] bg-[#E97E4E]" />
            </div>

          {/* Social */}
          <div className="mt-8 text-center text-sm text-primary">
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
        </SignIn.Step>
      </SignIn.Root>
    </div>
  );
}
