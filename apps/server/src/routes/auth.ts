import { Router, Response } from "express";
import bcrypt from "bcryptjs";
import { db } from "../utils/db";

const router = Router();

function generateOtp(): string {
  return String(Math.floor(100000 + Math.random() * 900000));
}

router.post("/google", async (req: any, res: Response) => {
  try {
    const { email, name, avatar, firebaseUid } = req.body;
    if (!email) return res.status(400).json({ error: "Email required" });
    let user = await db.users.findByEmail(email);
    if (!user) {
      user = await db.users.create({
        email,
        password: "",
        name: name || email.split("@")[0],
        avatar: avatar || "/default-avatar.png",
      });
    }
    const token = db.generateToken(user._id);
    const { password, ...safe } = user as any;
    safe.id = safe._id;
    res.json({ token, user: safe });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

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

router.post("/phone/check", async (req: any, res: Response) => {
  try {
    const { phone } = req.body;
    if (!phone) return res.status(400).json({ error: "Phone number required" });
    const user = await db.users.findByPhone(phone);
    res.json({ exists: !!user });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

router.post("/phone/send-otp", async (req: any, res: Response) => {
  try {
    const { phone } = req.body;
    if (!phone) return res.status(400).json({ error: "Phone number required" });
    const phoneClean = phone.replace(/[^+\d]/g, "");
    if (phoneClean.length < 10) return res.status(400).json({ error: "Invalid phone number" });

    const otp = generateOtp();
    db.otp.set(phoneClean, otp);
    console.log(`OTP for ${phoneClean}: ${otp}`);

    res.json({
      success: true,
      message: "OTP generated. Send your phone number to @CoPatnerBot on Telegram to receive it.",
      botUsername: "CoPatnerBot",
      otp, // dev mode: show OTP directly for testing
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

router.post("/phone/verify-otp", async (req: any, res: Response) => {
  try {
    const { phone, otp, name } = req.body;
    if (!phone || !otp) return res.status(400).json({ error: "Phone and OTP required" });
    const phoneClean = phone.replace(/[^+\d]/g, "");

    const storedOtp = db.otp.get(phoneClean);
    if (!storedOtp) return res.status(400).json({ error: "OTP expired or not requested. Please send OTP again." });
    if (storedOtp !== otp) return res.status(400).json({ error: "Invalid OTP" });

    db.otp.delete(phoneClean);

    let user = await db.users.findByPhone(phoneClean);
    if (!user) {
      user = await db.users.create({
        phone: phoneClean,
        email: "",
        name: name || "User",
        password: "",
      });
    }

    if (user.isBanned) return res.status(403).json({ error: "Account banned" });

    const token = db.generateToken(user._id);
    const { password: _, ...safe } = user as any;
    safe.id = safe._id;
    res.json({ token, user: safe });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

router.post("/phone/signin", async (req: any, res: Response) => {
  try {
    const { phone, name } = req.body;
    if (!phone) return res.status(400).json({ error: "Phone number required" });
    const phoneClean = phone.replace(/[^+\d]/g, "");
    if (phoneClean.length < 10) return res.status(400).json({ error: "Invalid phone number" });
    let user = await db.users.findByPhone(phoneClean);
    if (!user) {
      user = await db.users.create({
        phone: phoneClean,
        email: "",
        name: name || "User",
        password: "",
      });
    }
    if (user.isBanned) return res.status(403).json({ error: "Account banned" });
    const token = db.generateToken(user._id);
    const { password: _, ...safe } = user as any;
    safe.id = safe._id;
    res.json({ token, user: safe });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

router.get("/sockets", (req: any, res: Response) => {
  try {
    const io = req.app.get("io");
    if (!io) return res.json({ error: "Socket.IO not available" });
    const sockets: any[] = [];
    io.sockets.sockets.forEach((s: any) => {
      sockets.push({ id: s.id, connected: s.connected });
    });
    res.json({ total: sockets.length, sockets });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

router.get("/online-users", (req: any, res: Response) => {
  try {
    const io = req.app.get("io");
    if (!io) return res.json({ error: "Socket.IO not available" });
    const sockets: any[] = [];
    io.sockets.sockets.forEach((s: any) => {
      sockets.push({ id: s.id, connected: s.connected });
    });
    const onlineUsers = (io as any).__onlineUsers;
    const users = onlineUsers ? [...onlineUsers.entries()].map(([sid, uid]) => ({ socketId: sid, userId: uid })) : [];
    res.json({ totalSockets: sockets.length, sockets, totalOnline: users.length, onlineUsers: users });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
