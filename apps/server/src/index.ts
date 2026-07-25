import dotenv from "dotenv";
dotenv.config();

import express from "express";
import { createServer } from "http";
import { Server } from "socket.io";
import cors from "cors";
import authRoutes from "./routes/auth";
import userRoutes from "./routes/user";
import walletRoutes from "./routes/wallet";
import reportRoutes from "./routes/report";
import { setupSocketHandlers } from "./socket/handlers";

const app = express();
const httpServer = createServer(app);

const io = new Server(httpServer, {
  cors: {
    origin: process.env.CLIENT_URL || "http://localhost:3000",
    methods: ["GET", "POST"],
    credentials: true,
  },
});

app.use(cors({ origin: process.env.CLIENT_URL || "http://localhost:3000", credentials: true }));
app.use(express.json());

app.use("/api/auth", authRoutes);
app.use("/api/user", userRoutes);
app.use("/api/wallet", walletRoutes);
app.use("/api/report", reportRoutes);

app.get("/api/health", (_req, res) => {
  res.json({ status: "ok", timestamp: Date.now() });
});

const PORT = process.env.PORT || 4000;

setupSocketHandlers(io);

httpServer.listen(PORT, () => {
  console.log(`🚀 Velio server running on http://localhost:${PORT}`);
  console.log(`📡 Socket.IO ready`);
  console.log(`💾 Using in-memory database (no Redis/MongoDB needed)`);
});
