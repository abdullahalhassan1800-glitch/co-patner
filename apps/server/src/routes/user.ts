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

router.get("/profile/:id", authMiddleware, async (req: any, res: Response) => {
  try {
    const user = await db.users.findById(req.params.id);
    if (!user) return res.status(404).json({ error: "User not found" });
    const { password, ...safe } = user as any;
    res.json({ user: safe });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

router.put("/profile", authMiddleware, async (req: any, res: Response) => {
  try {
    const { name, avatar, gender, age, country, bio, interests } = req.body;
    const user = await db.users.update(req.userId, { name, avatar, gender, age, country, bio, interests });
    if (!user) return res.status(404).json({ error: "User not found" });
    const { password, ...safe } = user as any;
    res.json({ user: safe });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

router.post("/friends/add/:friendId", authMiddleware, async (req: any, res: Response) => {
  try {
    await db.users.addFriend(req.userId, req.params.friendId);
    res.json({ success: true });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

router.post("/friends/remove/:friendId", authMiddleware, async (req: any, res: Response) => {
  try {
    await db.users.removeFriend(req.userId, req.params.friendId);
    res.json({ success: true });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

router.get("/friends", authMiddleware, async (req: any, res: Response) => {
  try {
    const friends = await db.users.getFriends(req.userId);
    res.json({ friends });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
