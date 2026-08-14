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

router.get("/balance", authMiddleware, async (req: any, res: Response) => {
  try {
    const user = await db.users.findById(req.userId);
    if (!user) return res.status(404).json({ error: "User not found" });
    res.json({ credits: user.credits });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

router.post("/recharge", authMiddleware, async (req: any, res: Response) => {
  try {
    const { amount } = req.body;
    const creditsToAdd = Math.floor(Number(amount));
    if (!Number.isFinite(creditsToAdd) || creditsToAdd <= 0) {
      return res.status(400).json({ error: "Invalid amount" });
    }
    await db.users.incrementCredits(req.userId, creditsToAdd);
    await db.transactions.create({ userId: req.userId, amount: creditsToAdd, type: "recharge", description: `Recharged ${creditsToAdd} coins` });
    const user = await db.users.findById(req.userId);
    res.json({ credits: user?.credits || 0, added: creditsToAdd });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

router.post("/spend", authMiddleware, async (req: any, res: Response) => {
  try {
    const { amount, description } = req.body;
    const numAmount = Number(amount);
    if (!Number.isFinite(numAmount) || numAmount <= 0) {
      return res.status(400).json({ error: "Invalid amount" });
    }
    const user = await db.users.findById(req.userId);
    if (!user) return res.status(404).json({ error: "User not found" });
    if ((user.credits || 0) < numAmount) return res.status(400).json({ error: "Insufficient credits" });
    await db.users.incrementCredits(req.userId, -numAmount);
    await db.transactions.create({ userId: req.userId, amount: numAmount, type: "spend", description: description || "Spent credits" });
    const updated = await db.users.findById(req.userId);
    res.json({ credits: updated?.credits || 0 });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

router.get("/history", authMiddleware, async (req: any, res: Response) => {
  try {
    const transactions = await db.transactions.findByUserId(req.userId);
    res.json({ transactions });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
