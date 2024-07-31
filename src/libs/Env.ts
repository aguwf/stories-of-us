// import { createEnv } from '@t3-oss/env-nextjs';
// import { z } from 'zod';

// // Don't add NODE_ENV into T3 Env, it changes the tree-shaking behavior
// export const Env = createEnv({
//   server: {
//     CLERK_SECRET_KEY: z.string().min(1),
//     DATABASE_URL: z.string().min(1),
//     DATABASE_AUTH_TOKEN: z.string().optional(),
//     LOGTAIL_SOURCE_TOKEN: z.string().optional(),
//     CLOUDINARY_API_SECRET: z.string().optional(),
//   },
//   client: {
//     NEXT_PUBLIC_APP_URL: z.string().optional(),
//     NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY: z.string().min(1),
//     NEXT_PUBLIC_CLERK_SIGN_IN_URL: z.string().min(1),
//     NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME: z.string().optional(),
//     NEXT_PUBLIC_CLOUDINARY_API_KEY: z.string().optional(),
//     NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET: z.string().optional(),
//   },
//   // You need to destructure all the keys manually
//   runtimeEnv: {
//     CLERK_SECRET_KEY: process.env.CLERK_SECRET_KEY,
//     DATABASE_URL: process.env.DATABASE_URL,
//     DATABASE_AUTH_TOKEN: process.env.DATABASE_AUTH_TOKEN,
//     LOGTAIL_SOURCE_TOKEN: process.env.LOGTAIL_SOURCE_TOKEN,
//     NEXT_PUBLIC_APP_URL: process.env.NEXT_PUBLIC_APP_URL,
//     CLOUDINARY_API_SECRET: process.env.CLOUDINARY_API_SECRET,
//     NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY:
//       process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY,
//     NEXT_PUBLIC_CLERK_SIGN_IN_URL: process.env.NEXT_PUBLIC_CLERK_SIGN_IN_URL,
//     NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME:
//       process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
//     NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET:
//       process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET,
//     NEXT_PUBLIC_CLOUDINARY_API_KEY: process.env.NEXT_PUBLIC_CLOUDINARY_API_KEY,
//   },
// });
