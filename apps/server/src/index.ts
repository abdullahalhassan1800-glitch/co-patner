import dotenv from "dotenv";
dotenv.config();

import path from "path";
import express from "express";
import http, { createServer } from "http";
import { Server } from "socket.io";
import cors from "cors";
import mongoose from "mongoose";
import { spawn } from "child_process";
import httpProxy from "http-proxy";
import authRoutes from "./routes/auth";
import userRoutes from "./routes/user";
import walletRoutes from "./routes/wallet";
import reportRoutes from "./routes/report";
import pushRoutes from "./routes/push";
import turnRoutes from "./routes/turn";
import { db } from "./utils/db";
import { setupSocketHandlers } from "./socket/handlers";
import { initTelegramBot } from "./services/telegram";

const NEXTJS_PORT = 3000;
const nextProxy = httpProxy.createProxyServer({ target: `http://localhost:${NEXTJS_PORT}` });
nextProxy.on("error", (err, req, res: any) => {
  if (typeof res.writeHead === "function" && !res.headersSent) {
    res.writeHead(502, { "Content-Type": "application/json" });
    res.end(JSON.stringify({ error: "Upstream not ready" }));
  }
});

function waitForPort(port: number, timeout = 60000): Promise<void> {
  return new Promise((resolve, reject) => {
    const start = Date.now();
    const check = () => {
      const req = http.get(`http://localhost:${port}`, (res) => {
        res.resume();
        resolve();
      });
      req.on("error", (err: any) => {
        if (err.code === "ECONNREFUSED") {
          if (Date.now() - start > timeout) {
            reject(new Error(`Timeout waiting for port ${port}`));
          } else {
            setTimeout(check, 500);
          }
        } else {
          reject(err);
        }
      });
      req.end();
    };
    check();
  });
}

function startNextJS(): Promise<void> {
  return new Promise((resolve, reject) => {
    const nextBin = path.resolve(__dirname, "../../web/node_modules/next/dist/bin/next");
    const nextServer = spawn("node", [nextBin, "start", "-p", String(NEXTJS_PORT)], {
      cwd: path.resolve(__dirname, "../../web"),
      stdio: "inherit",
      env: { ...process.env, NODE_ENV: "production" },
    });
    nextServer.on("error", (err) => { console.error("Next.js error:", err); reject(err); });
    const cleanup = () => nextServer.kill();
    process.on("exit", cleanup);
    process.on("SIGTERM", cleanup);
    process.on("SIGINT", cleanup);
    waitForPort(NEXTJS_PORT).then(resolve).catch(reject);
  });
}

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
  "https://co-patner.onrender.com",
  process.env.CLIENT_URL,
].filter(Boolean) as string[];
allowedOrigins.push(...(process.env.CORS_ORIGINS || "").split(",").filter(Boolean));

const app = express();
const httpServer = createServer(app);

// Same-origin CORS: allow any request whose Origin matches the request Host
// (needed for <link rel="manifest" crossorigin="use-credentials"> fetches).
app.use((req, res, next) => {
  const origin = req.headers.origin;
  const host = req.headers.host;
  if (origin && host && origin.replace(/^https?:\/\//, "") === host) {
    res.setHeader("Access-Control-Allow-Origin", origin);
    res.setHeader("Access-Control-Allow-Credentials", "true");
    res.setHeader("Access-Control-Allow-Methods", "GET, POST, PUT, PATCH, DELETE, OPTIONS");
    res.setHeader("Access-Control-Allow-Headers", req.headers["access-control-request-headers"] || "Content-Type, Authorization");
    if (req.method === "OPTIONS") return res.sendStatus(204);
  }
  next();
});

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
app.use("/api/push", pushRoutes);
app.use("/api/turn", turnRoutes);

app.get("/api/health", (_req, res) => {
  res.json({ status: "ok", timestamp: Date.now() });
});

app.get("*", (req, res) => {
  nextProxy.web(req, res, { target: `http://localhost:${NEXTJS_PORT}` });
});

async function seedUsers() {
  const users = [
    { _id: "user_hassan_001", email: "hassan@test.com", password: "Test1234", name: "Hassan", gender: "male", age: 25, country: "IN", avatar: "https://i.pravatar.cc/300?img=11", bio: "Tech enthusiast", interests: ["Music", "Gaming", "Travel"], credits: 100000 },
    { _id: "user_chaman_001", email: "chaman@test.com", password: "Test1234", name: "Chaman", gender: "female", age: 24, country: "IN", avatar: "https://i.pravatar.cc/300?img=5", bio: "Creative soul", interests: ["Art", "Music", "Travel"], credits: 100000 },
    { _id: "user_dev_001", email: "dev@test.com", password: "Test1234", name: "DEV", gender: "male", age: 22, country: "IN", avatar: "https://i.pravatar.cc/300?img=12", bio: "DEV host", interests: ["Gaming", "Music", "Tech"], credits: 100000 },
  ];
  for (const u of users) {
    try {
      const existing = await db.users.findById(u._id);
      if (existing) continue;
      await db.users.create(u);
      console.log(`✅ Seeded user: ${u.email}`);
    } catch (err: any) {
      console.error(`⚠️ Skipped seed for ${u.email}: ${err.message}`);
    }
  }
}

const PORT = process.env.PORT || 4000;
const MONGODB_URI = process.env.MONGODB_URI || "";

setupSocketHandlers(io);

async function start() {
  if (MONGODB_URI) {
    try {
      await mongoose.connect(MONGODB_URI, {
        serverSelectionTimeoutMS: 10000,
        connectTimeoutMS: 10000,
      });
      console.log(`🍃 MongoDB connected`);
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      console.error(`⚠️  MongoDB connection failed (${message}) — falling back to in-memory storage`);
    }
  } else {
    console.log(`⚠️  No MONGODB_URI set — using in-memory storage`);
  }

  if (process.env.NODE_ENV === "production") {
    console.log(`🚀 Starting Next.js...`);
    await startNextJS();
    console.log(`✅ Next.js ready on port ${NEXTJS_PORT}`);
  }

  httpServer.listen(PORT, () => {
    console.log(`🚀 Co-Patner server running on http://localhost:${PORT}`);
    console.log(`📡 Socket.IO ready`);
    seedUsers().catch((err) => console.error(`⚠️ Seed error: ${err.message}`));
    try { initTelegramBot(); } catch (err: any) { console.error(`⚠️ Telegram bot error: ${err.message}`); }
  });
}

start();
