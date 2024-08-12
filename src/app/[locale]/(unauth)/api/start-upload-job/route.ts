import { env } from "@/env";
import { Client } from "@upstash/qstash";

const qstashClient = new Client({
	token: env.QSTASH_TOKEN,
});

export async function POST(request: Request) {
	const body = await request.json();
	const images: string[] = body.images;
	// If you know the public URL of the email API, you can use it directly
	const rootDomain = request.url.split("/").slice(0, 3).join("/");
	const emailAPIURL = `${rootDomain}/api/upload`; // ie: https://yourapp.com/api/send-email

	console.log("🚀 ~ POST ~ emailAPIURL:", emailAPIURL);
	// Tell QStash to start the background job.
	// For proper error handling, refer to the quick start.
	await qstashClient.publishJSON({
		url: emailAPIURL,
		body: {
			images,
		},
	});

	return new Response("Job started", { status: 200 });
}
