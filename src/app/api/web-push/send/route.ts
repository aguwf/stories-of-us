import { pushSubscriptions } from "@/server/db/schema";
import { db } from "@/server/db";
import webpush from "web-push";
import { env } from "@/env";

webpush.setVapidDetails(
  "mailto:example@yourdomain.org",
  env.NEXT_PUBLIC_VAPID_PUBLIC_KEY,
  env.VAPID_PRIVATE_KEY
);

export async function POST(req: Request) {
  try {
    const { title, body, url } = await req.json();

    const subscriptions = await db.select().from(pushSubscriptions);

    const notifications = subscriptions.map((sub) => {
      const pushSubscription = {
        endpoint: sub.endpoint,
        keys: {
          p256dh: sub.p256dh,
          auth: sub.auth,
        },
      };

      const payload = JSON.stringify({
        title: title || "New Notification",
        body: body || "You have a new update!",
        url: url || "/",
      });

      return webpush
        .sendNotification(pushSubscription, payload)
        .catch((err: any) => {
          console.error("Error sending notification", err);
          if (err.statusCode === 410) {
            // Subscription has expired or is no longer valid
            // In a real app, you should delete this subscription from the DB
          }
        });
    });

    await Promise.all(notifications);

    return new Response(JSON.stringify({ success: true }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Error sending notifications:", error);
    return new Response(JSON.stringify({ error: "Internal Server Error" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}
