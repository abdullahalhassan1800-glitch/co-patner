import { Router, Response } from "express";
import { db } from "../utils/db";
import { getTurnIceServers, isTurnConfigured } from "../services/turn";

const router = Router();

router.get("/credentials", async (req: any, res: Response) => {
  try {
    const token = req.headers.authorization?.replace("Bearer ", "");
    if (!token) return res.status(401).json({ error: "No token" });
    const decoded = db.verifyToken(token);
    if (!decoded) return res.status(401).json({ error: "Invalid token" });
    res.json({ iceServers: getTurnIceServers(), turnConfigured: isTurnConfigured() });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
