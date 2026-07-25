import { Router, Response } from "express";
import { db } from "../utils/db";

const router = Router();

function authMiddleware(req: any, res: Response, next: any) {
  const token = req.headers.authorization?.replace("Bearer ", "");
  if (!token) return res.status(401).json({ error: "No token" });
  const decoded = db.verifyToken(token);
  if (!decoded) return res.status(401).json({ error: "Invalid token" });
  req.userId = decoded.userId;
  next();
}

router.post("/", authMiddleware, async (req: any, res: Response) => {
  try {
    const { reportedId, reason, description } = req.body;
    if (!reportedId || !reason) return res.status(400).json({ error: "reportedId and reason required" });
    const existing = await db.reports.findByReporterAndReported(req.userId, reportedId);
    if (existing) return res.status(400).json({ error: "Already reported" });
    await db.reports.create({ reporter: req.userId, reported: reportedId, reason, description });
    const count = await db.reports.countByReported(reportedId);
    if (count >= 5) await db.users.update(reportedId, { isBanned: true });
    res.json({ success: true });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
