import { env } from "@/env";
import { Client } from "@upstash/qstash";
import type { NextRequest } from "next/server";

const qstashClient = new Client({
	token: env.QSTASH_TOKEN,
});

export async function POST(request: NextRequest) {
	// const body = await request.json();
	// Get formdata
	console.log("🚀 ~ POST ~ request.json():", request);
	const formData = await request.json();
	// const data = Object.fromEntries(formData);
	console.log("🚀 ~ POST ~ body:", formData);
	const images = formData.images;
	console.log("🚀 ~ POST ~ images:", images);
	// If you know the public URL of the email API, you can use it directly
	// const rootDomain = request.url.split("/").slice(0, 3).join("/");
	const rootDomain = "https://creative-hedgehog-open.ngrok-free.app";
	const emailAPIURL = `${rootDomain}/api/upload`; // ie: https://yourapp.com/api/send-email

	console.log("🚀 ~ POST ~ emailAPIURL:", emailAPIURL);
	// Tell QStash to start the background job.
	// For proper error handling, refer to the quick start.
	await qstashClient.publishJSON({
		url: "https://creative-hedgehog-open.ngrok-free.app/api/upload",
		body: {
			images,
		},
	});

	return new Response("Job started", { status: 200 });
}
