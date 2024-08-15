"use server";

import { env } from "@/env";
import { Client } from "@upstash/qstash";

const qstashClient = new Client({
	token: env.QSTASH_TOKEN,
});

export const startUploadJob = async (payload) => {
	const images = payload.images;
	console.log("🚀 ~ POST ~ images:", images);
	// If you know the public URL of the email API, you can use it directly
	const url = payload.url;
	const rootDomain = url.split("/").slice(0, 3).join("/");
	const emailAPIURL = `${rootDomain}/api/upload`;

	console.log("🚀 ~ POST ~ emailAPIURL:", emailAPIURL);
	// Tell QStash to start the background job.
	// For proper error handling, refer to the quick start.
	await qstashClient.publishJSON({
		url: "https://creative-hedgehog-open.ngrok-free.app/api/upload",
		body: {
			images,
		},
	});

	return "Job started";
};
