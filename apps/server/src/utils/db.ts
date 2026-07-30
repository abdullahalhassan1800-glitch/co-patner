import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { User } from "../models/User";
import { Report } from "../models/Report";
import { Transaction } from "../models/Transaction";

const JWT_SECRET = process.env.JWT_SECRET || "co_patner_jwt_secret";

function serialize(doc: any) {
  if (!doc) return doc;
  if (Array.isArray(doc)) return doc.map(serialize);
  const obj = { ...doc };
  if (obj._id && typeof obj._id !== "string") obj._id = obj._id.toString();
  return obj;
}

// In-memory stores for ephemeral data
const waitingQueue: any[] = [];
const rooms = new Map<string, any>();
const clientRooms = new Map<string, string>();
const otpStore = new Map<string, { otp: string; expiresAt: number }>();

export const db = {
  users: {
    async create(data: any) {
      if (data.password) data.password = await bcrypt.hash(data.password, 10);
      const user = await User.create({
        ...data,
        credits: data.credits ?? 10,
      });
      return serialize(user.toObject());
    },
    async findByEmail(email: string) {
      if (!email) return undefined;
      const user = await User.findOne({ email }).lean();
      return serialize(user) || undefined;
    },
    async findByPhone(phone: string) {
      if (!phone) return undefined;
      const user = await User.findOne({ phone }).lean();
      return serialize(user) || undefined;
    },
    async findById(id: string) {
      const user = await User.findById(id).lean();
      return serialize(user) || undefined;
    },
    async update(id: string, data: any) {
      const user = await User.findByIdAndUpdate(id, { $set: data }, { new: true }).lean();
      return serialize(user) || undefined;
    },
    async incrementCredits(id: string, amount: number) {
      await User.findByIdAndUpdate(id, { $inc: { credits: amount } });
    },
    async addFriend(userId: string, friendId: string) {
      await User.findByIdAndUpdate(userId, { $addToSet: { friends: friendId } });
    },
    async removeFriend(userId: string, friendId: string) {
      await User.findByIdAndUpdate(userId, { $pull: { friends: friendId } });
    },
    async getAll() {
      return serialize(User.find({}).select("-password").lean());
    },
    async getFriends(userId: string) {
      const user = await User.findById(userId).lean();
      if (!user || !user.friends?.length) return [];
      const friends = await User.find({ _id: { $in: user.friends } })
        .select("_id name avatar gender country")
        .lean();
      return serialize(friends);
    },
  },

  reports: {
    async create(data: any) {
      const report = await Report.create(data);
      return serialize(report.toObject());
    },
    async countByReported(reportedId: string) {
      return Report.countDocuments({ reported: reportedId });
    },
    async findByReporterAndReported(reporterId: string, reportedId: string) {
      const report = await Report.findOne({ reporter: reporterId, reported: reportedId }).lean();
      return serialize(report) || undefined;
    },
  },

  transactions: {
    async create(data: any) {
      const tx = await Transaction.create(data);
      return serialize(tx.toObject());
    },
    async findByUserId(userId: string) {
      return serialize(Transaction.find({ userId }).sort({ createdAt: -1 }).limit(50).lean());
    },
  },

  queue: {
    push(entry: any) { waitingQueue.push(entry); },
    remove(socketId: string) {
      const idx = waitingQueue.findIndex((e: any) => e.socketId === socketId);
      if (idx !== -1) waitingQueue.splice(idx, 1);
    },
    getAll() { return [...waitingQueue]; },
    popTwo(): [any, any] | null {
      if (waitingQueue.length < 2) return null;
      const a = waitingQueue.shift();
      const b = waitingQueue.shift();
      return [a, b];
    },
  },

  rooms: {
    create(roomId: string, data: any) { rooms.set(roomId, data); },
    get(roomId: string) { return rooms.get(roomId); },
    delete(roomId: string) {
      const room = rooms.get(roomId);
      if (room) {
        if (room.user1Socket) clientRooms.delete(room.user1Socket);
        if (room.user2Socket) clientRooms.delete(room.user2Socket);
      }
      rooms.delete(roomId);
    },
    getBySocket(socketId: string): string | undefined { return clientRooms.get(socketId); },
    setClientRoom(socketId: string, roomId: string) { clientRooms.set(socketId, roomId); },
  },

  generateToken(userId: string): string {
    return jwt.sign({ userId }, JWT_SECRET, { expiresIn: "30d" });
  },
  verifyToken(token: string): { userId: string } | null {
    try {
      return jwt.verify(token, JWT_SECRET) as { userId: string };
    } catch {
      return null;
    }
  },

  otp: {
    set(phone: string, otp: string): void {
      otpStore.set(phone, { otp, expiresAt: Date.now() + 5 * 60 * 1000 });
    },
    get(phone: string): string | undefined {
      const entry = otpStore.get(phone);
      if (!entry) return undefined;
      if (Date.now() > entry.expiresAt) {
        otpStore.delete(phone);
        return undefined;
      }
      return entry.otp;
    },
    delete(phone: string): void {
      otpStore.delete(phone);
    },
    cleanup(): void {
      for (const [phone, entry] of otpStore.entries()) {
        if (Date.now() > entry.expiresAt) otpStore.delete(phone);
      }
    },
  },
};
