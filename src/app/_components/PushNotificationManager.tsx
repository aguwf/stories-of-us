"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Bell, BellOff } from "lucide-react";
import { toast } from "sonner";

function urlBase64ToUint8Array(base64String: string) {
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding)
    .replace(/\-/g, "+")
    .replace(/_/g, "/");

  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);

  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}

export function PushNotificationManager() {
  const [isSupported, setIsSupported] = useState(false);
  const [subscription, setSubscription] = useState<PushSubscription | null>(
    null
  );

  useEffect(() => {
    if ("serviceWorker" in navigator && "PushManager" in window) {
      setIsSupported(true);
      registerServiceWorker();
    }
  }, []);

  async function registerServiceWorker() {
    const registration = await navigator.serviceWorker.ready;
    const sub = await registration.pushManager.getSubscription();
    setSubscription(sub);
  }

  async function subscribeToPush() {
    try {
      const registration = await navigator.serviceWorker.ready;
      const sub = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(
          process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY!
        ),
      });

      setSubscription(sub);

      await fetch("/api/web-push/subscribe", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(sub),
      });

      toast.success("Subscribed to notifications!");
    } catch (error) {
      console.error("Error subscribing to push", error);
      toast.error("Failed to subscribe to notifications.");
    }
  }

  async function unsubscribeFromPush() {
    try {
      await subscription?.unsubscribe();
      setSubscription(null);
      toast.info("Unsubscribed from notifications.");
    } catch (error) {
      console.error("Error unsubscribing from push", error);
    }
  }

  if (!isSupported) {
    return null;
  }

  return (
    <div className="fixed bottom-4 right-4 z-50">
      {subscription ? (
        <Button
          variant="outline"
          size="icon"
          onClick={unsubscribeFromPush}
          title="Disable Notifications"
          className="rounded-full shadow-lg bg-background/80 backdrop-blur-sm"
        >
          <BellOff className="h-5 w-5" />
        </Button>
      ) : (
        <Button
          variant="default"
          size="icon"
          onClick={subscribeToPush}
          title="Enable Notifications"
          className="rounded-full shadow-lg"
        >
          <Bell className="h-5 w-5" />
        </Button>
      )}
    </div>
  );
}
