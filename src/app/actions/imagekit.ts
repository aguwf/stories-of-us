"use server";

import crypto from "node:crypto";
import { env } from "@/env";
import { v4 as uuidv4 } from "uuid";

interface ImageKitSignatureOptions {
  fileName?: string;
  expireTime?: number;
}

// biome-ignore lint/suspicious/useAwait: <explanation>
export async function generateImageKitSignature({
  expireTime = 3600,
}: ImageKitSignatureOptions = {}): Promise<{
  signature: string;
  expire: number;
  token: string;
}> {
  // Private key
  const privateKey = env.NEXT_PUBLIC_IMAGEKIT_PRIVATE_KEY;

  if (!privateKey) {
    throw new Error("Missing ImageKit private key");
  }

  // Generate token
  const token = uuidv4();

  // Calculate expiration time
  const expire = Math.floor(Date.now() / 1000) + expireTime;

  // Create string for signature calculation
  const data = token + expire;

  // Calculate signature using HMAC-SHA1
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
