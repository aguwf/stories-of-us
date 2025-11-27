import { pushSubscriptions } from "@/server/db/schema";
import { db } from "@/server/db";
import { z } from "zod";

const subscriptionSchema = z.object({
  endpoint: z.string(),
  keys: z.object({
    p256dh: z.string(),
    auth: z.string(),
  }),
});

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const subscription = subscriptionSchema.parse(body);

    await db
      .insert(pushSubscriptions)
      .values({
        endpoint: subscription.endpoint,
        p256dh: subscription.keys.p256dh,
        auth: subscription.keys.auth,
      })
      .onConflictDoNothing({ target: pushSubscriptions.endpoint });

    return new Response(JSON.stringify({ success: true }), {
      status: 201,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Error saving subscription:", error);
    return new Response(JSON.stringify({ error: "Invalid request" }), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    });
  }
}
