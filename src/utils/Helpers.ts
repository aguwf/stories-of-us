import { env } from "@/env";
import { AppConfig } from "./AppConfig";
import crypto from "crypto";
import { v4 as uuidv4 } from "uuid";

export const getBaseUrl = () => {
  if (process.env.NEXT_PUBLIC_APP_URL) {
    return process.env.NEXT_PUBLIC_APP_URL;
  }

  if (typeof window !== "undefined") {
    return window.location.origin;
  }

  if (process.env.VERCEL_URL) {
    return `https://${process.env.VERCEL_URL}`;
  }

  return `http://localhost:${process.env.PORT ?? 3000}`;
};

export const getI18nPath = (url: string, locale: string) => {
  if (locale === AppConfig.defaultLocale) {
    return url;
  }

  return `/${locale}${url}`;
};

interface ImageKitSignatureOptions {
  fileName?: string;
  expireTime?: number;
}

export function generateImageKitSignature({
  expireTime = 3600,
}: ImageKitSignatureOptions): {
  signature: string;
  expire: number;
  token: string;
} {
  // Private key
  const privateKey = env.NEXT_PUBLIC_IMAGEKIT_PRIVATE_KEY;

  if (!privateKey) {
    throw new Error("Missing ImageKit private key");
  }

  // Tạo token
  const token = uuidv4();

  // Tính thời gian hết hạn
  const expire = Math.floor(Date.now() / 1000) + expireTime;

  // Tạo chuỗi để tính toán signature
  const data = token + expire;

  // Tính toán signature bằng HMAC-SHA1
  const signature = crypto
    .createHmac("sha1", privateKey)
    .update(data)
    .digest("hex");

  return {
    signature: signature.toLowerCase(),
    expire,
    token,
  };
}
