import webpush from "web-push";
import { PushSubscription } from "../models/PushSubscription";

const VAPID_PUBLIC_KEY = process.env.VAPID_PUBLIC_KEY || "";
const VAPID_PRIVATE_KEY = process.env.VAPID_PRIVATE_KEY || "";
const VAPID_SUBJECT = process.env.VAPID_SUBJECT || "mailto:admin@co-patner.com";

if (VAPID_PUBLIC_KEY && VAPID_PRIVATE_KEY) {
  webpush.setVapidDetails(VAPID_SUBJECT, VAPID_PUBLIC_KEY, VAPID_PRIVATE_KEY);
}

export const pushEnabled = Boolean(VAPID_PUBLIC_KEY && VAPID_PRIVATE_KEY);

export async function getVapidPublicKey(): Promise<string> {
  return VAPID_PUBLIC_KEY;
}

export async function saveSubscription(userId: string, subscription: any): Promise<void> {
  if (!subscription || !subscription.endpoint || !subscription.keys) return;
  await PushSubscription.findOneAndUpdate(
    { endpoint: subscription.endpoint },
    {
      $set: {
        userId,
        endpoint: subscription.endpoint,
        keys: {
          p256dh: subscription.keys.p256dh,
          auth: subscription.keys.auth,
        },
        userAgent: subscription.userAgent || "",
      },
    },
    { upsert: true, new: true }
  );
}

export async function removeSubscription(userId: string, endpoint?: string): Promise<void> {
  if (endpoint) {
    await PushSubscription.deleteOne({ userId, endpoint });
  } else {
    await PushSubscription.deleteMany({ userId });
  }
}

export interface PushPayload {
  title?: string;
  body?: string;
  url?: string;
  tag?: string;
}

export async function sendToUser(userId: string, payload: PushPayload): Promise<number> {
  if (!pushEnabled) return 0;
  const subs = await PushSubscription.find({ userId }).lean();
  let sent = 0;
  const deadEndpoints: string[] = [];

  await Promise.all(
    subs.map(async (sub) => {
      try {
        await webpush.sendNotification(
          {
            endpoint: sub.endpoint,
            keys: sub.keys,
          } as any,
          JSON.stringify({
            title: payload.title || "Co-Patner",
            body: payload.body || "",
            url: payload.url || "/dashboard",
            tag: payload.tag || "co-patner",
          })
        );
        sent++;
      } catch (err: any) {
        if (err && (err.statusCode === 404 || err.statusCode === 410)) {
          deadEndpoints.push(sub.endpoint);
        }
      }
    })
  );

  if (deadEndpoints.length) {
    await PushSubscription.deleteMany({ endpoint: { $in: deadEndpoints } });
  }

  return sent;
}
