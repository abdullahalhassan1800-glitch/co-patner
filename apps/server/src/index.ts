import dotenv from "dotenv";
dotenv.config();

import express from "express";
import { createServer } from "http";
import { Server } from "socket.io";
import cors from "cors";
import mongoose from "mongoose";
import authRoutes from "./routes/auth";
import userRoutes from "./routes/user";
import walletRoutes from "./routes/wallet";
import reportRoutes from "./routes/report";
import { db } from "./utils/db";
import { setupSocketHandlers } from "./socket/handlers";
import { initTelegramBot } from "./services/telegram";

const allowedOrigins = [
  "http://localhost:3000",
  "http://localhost:3001",
  "http://127.0.0.1:3000",
  "http://127.0.0.1:3001",
  "http://10.210.53.3:3000",
  "http://10.210.53.3:3001",
  "http://192.168.1.42:3000",
  "http://192.168.1.42:3001",
  "http://192.168.1.14:3000",
  "http://192.168.1.14:3001",
  "https://localhost:3000",
  "https://localhost:3001",
  "https://192.168.1.14:3443",
  "http://10.252.186.3:3000",
  "http://10.252.186.3:3001",
  "https://10.252.186.3:3443",
  "https://co-patner.vercel.app",
  "https://co-patner-backend.onrender.com",
  process.env.CLIENT_URL,
].filter(Boolean) as string[];
allowedOrigins.push(...(process.env.CORS_ORIGINS || "").split(",").filter(Boolean));

const app = express();
const httpServer = createServer(app);

const io = new Server(httpServer, {
  cors: {
    origin: allowedOrigins,
    methods: ["GET", "POST"],
    credentials: true,
  },
});

app.set("io", io);
app.use(cors({ origin: allowedOrigins, credentials: true }));
app.use(express.json());

app.use("/api/auth", authRoutes);
app.use("/api/user", userRoutes);
app.use("/api/wallet", walletRoutes);
app.use("/api/report", reportRoutes);

app.get("/api/health", (_req, res) => {
  res.json({ status: "ok", timestamp: Date.now() });
});

async function seedUsers() {
  const users = [
    { _id: "user_hassan_001", email: "hassan@test.com", password: "Test1234", name: "Hassan", gender: "male", age: 25, country: "IN", avatar: "https://i.pravatar.cc/300?img=11", bio: "Tech enthusiast", interests: ["Music", "Gaming", "Travel"], credits: 100000 },
    { _id: "user_chaman_001", email: "chaman@test.com", password: "Test1234", name: "Chaman", gender: "female", age: 24, country: "IN", avatar: "https://i.pravatar.cc/300?img=5", bio: "Creative soul", interests: ["Art", "Music", "Travel"], credits: 100000 },
    { _id: "user_dev_001", email: "dev@test.com", password: "Test1234", name: "DEV", gender: "male", age: 22, country: "IN", avatar: "https://i.pravatar.cc/300?img=12", bio: "DEV host", interests: ["Gaming", "Music", "Tech"], credits: 100000 },
  ];
  for (const u of users) {
    const existing = await db.users.findByEmail(u.email);
    if (!existing) {
      await db.users.create(u);
      console.log(`✅ Seeded user: ${u.email}`);
    }
  }
}

const PORT = process.env.PORT || 4000;
const MONGODB_URI = process.env.MONGODB_URI || "";

setupSocketHandlers(io);

async function start() {
  if (MONGODB_URI) {
    try {
      await mongoose.connect(MONGODB_URI);
      console.log(`🍃 MongoDB connected`);
    } catch (err) {
      console.error(`MongoDB connection failed:`, err);
      process.exit(1);
    }
  } else {
    console.log(`⚠️  No MONGODB_URI set — using in-memory storage`);
  }

  httpServer.listen(PORT, () => {
    console.log(`🚀 Co-Patner server running on http://localhost:${PORT}`);
    console.log(`📡 Socket.IO ready`);
    seedUsers();
    initTelegramBot();
  });
}

start();
