import crypto from "crypto";

const TURN_AUTH_SECRET = process.env.TURN_AUTH_SECRET || "";
const TURN_TTL = 86400;

export function getTurnIceServers(): { urls: string | string[]; username?: string; credential?: string }[] {
  const base = [
    { urls: "stun:stun.l.google.com:19302" },
    { urls: "stun:stun1.l.google.com:19302" },
    { urls: "stun:stun2.l.google.com:19302" },
  ];

  if (!TURN_AUTH_SECRET) {
    return base;
  }

  const timestamp = Math.floor(Date.now() / 1000) + TURN_TTL;
  const username = `${timestamp}:co-patner`;
  const credential = crypto
    .createHmac("sha1", TURN_AUTH_SECRET)
    .update(username)
    .digest("base64url");

  return [
    ...base,
    {
      urls: "stun:stun.cloudflare.com:3478",
    },
    {
      urls: [
        "turn:turn.cloudflare.com:3478?transport=udp",
        "turn:turn.cloudflare.com:3478?transport=tcp",
        "turns:turn.cloudflare.com:5349?transport=tcp",
      ],
      username,
      credential,
    },
  ];
}

export function isTurnConfigured(): boolean {
  return !!TURN_AUTH_SECRET;
}
