import { Router, Response } from "express";
import { db } from "../utils/db";
import { saveSubscription, removeSubscription, getVapidPublicKey, pushEnabled } from "../services/push";

const router = Router();

function authMiddleware(req: any, res: Response, next: any) {
  const token = req.headers.authorization?.replace("Bearer ", "");
  if (!token) return res.status(401).json({ error: "No token" });
  const decoded = db.verifyToken(token);
  if (!decoded) return res.status(401).json({ error: "Invalid token" });
  req.userId = decoded.userId;
  next();
}

router.get("/vapid-key", (_req: any, res: Response) => {
  res.json({ publicKey: getVapidPublicKey(), enabled: pushEnabled });
});

router.post("/subscribe", authMiddleware, async (req: any, res: Response) => {
  try {
    const { subscription, userAgent } = req.body;
    if (!subscription || !subscription.endpoint || !subscription.keys) {
      return res.status(400).json({ error: "Invalid subscription" });
    }
    if (!pushEnabled) return res.status(400).json({ error: "Push not configured on server" });
    await saveSubscription(req.userId, { ...subscription, userAgent });
    res.json({ success: true });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

router.post("/unsubscribe", authMiddleware, async (req: any, res: Response) => {
  try {
    const { endpoint } = req.body;
    await removeSubscription(req.userId, endpoint);
    res.json({ success: true });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
