import { Router, Response } from "express";
import bcrypt from "bcryptjs";
import { db } from "../utils/db";

const router = Router();

router.post("/register", async (req: any, res: Response) => {
  try {
    const { email, password, name, gender, age, country } = req.body;
    if (!email || !password || !name) {
      return res.status(400).json({ error: "Email, password and name are required" });
    }
    const existing = await db.users.findByEmail(email);
    if (existing) {
      return res.status(400).json({ error: "Email already registered" });
    }
    const user = await db.users.create({ email, password, name, gender, age, country });
    const token = db.generateToken(user._id);
    res.status(201).json({
      token,
      user: { id: user._id, email: user.email, name: user.name, avatar: user.avatar, gender: user.gender, age: user.age, country: user.country, credits: user.credits, isPremium: user.isPremium },
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

router.post("/login", async (req: any, res: Response) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) return res.status(400).json({ error: "Email and password required" });
    const user = await db.users.findByEmail(email);
    if (!user || !user.password) return res.status(401).json({ error: "Invalid credentials" });
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(401).json({ error: "Invalid credentials" });
    if (user.isBanned) return res.status(403).json({ error: "Account banned" });
    const token = db.generateToken(user._id);
    res.json({
      token,
      user: { id: user._id, email: user.email, name: user.name, avatar: user.avatar, gender: user.gender, age: user.age, country: user.country, credits: user.credits, isPremium: user.isPremium },
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

router.get("/me", async (req: any, res: Response) => {
  try {
    const token = req.headers.authorization?.replace("Bearer ", "");
    if (!token) return res.status(401).json({ error: "No token" });
    const decoded = db.verifyToken(token);
    if (!decoded) return res.status(401).json({ error: "Invalid token" });
    const user = await db.users.findById(decoded.userId);
    if (!user) return res.status(404).json({ error: "User not found" });
    const { password, ...safe } = user as any;
    res.json({ user: safe });
  } catch {
    res.status(401).json({ error: "Invalid token" });
  }
});

export default router;
