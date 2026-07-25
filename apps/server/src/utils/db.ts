// In-memory store - replaces Redis + MongoDB for demo
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET || "velio_jwt_secret_2024";

interface UserData {
  _id: string;
  email: string;
  password?: string;
  name: string;
  avatar: string;
  gender: string;
  age: number;
  country: string;
  bio: string;
  interests: string[];
  credits: number;
  isPremium: boolean;
  reportCount: number;
  isBanned: boolean;
  friends: string[];
  createdAt: Date;
  updatedAt: Date;
}

interface ReportData {
  _id: string;
  reporter: string;
  reported: string;
  reason: string;
  description: string;
  status: string;
  createdAt: Date;
}

interface TransactionData {
  _id: string;
  userId: string;
  amount: number;
  type: string;
  description: string;
  createdAt: Date;
}

// Collections
const users = new Map<string, UserData>();
const reports = new Map<string, ReportData>();
const transactions = new Map<string, TransactionData>();
const waitingQueue: any[] = [];
const rooms = new Map<string, any>();
const clientRooms = new Map<string, string>();

let idCounter = 1;
function genId() { return `id_${Date.now()}_${idCounter++}`; }

// ===== USER operations =====
export const db = {
  users: {
    async create(data: Partial<UserData>): Promise<UserData> {
      const id = genId();
      const hashedPw = data.password ? await bcrypt.hash(data.password, 10) : undefined;
      const user: UserData = {
        _id: id,
        email: data.email || "",
        password: hashedPw,
        name: data.name || "",
        avatar: data.avatar || "/default-avatar.png",
        gender: data.gender || "other",
        age: data.age || 18,
        country: data.country || "IN",
        bio: data.bio || "",
        interests: data.interests || [],
        credits: data.credits ?? 10,
        isPremium: data.isPremium || false,
        reportCount: 0,
        isBanned: false,
        friends: [],
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      users.set(id, user);
      return user;
    },
    async findByEmail(email: string): Promise<UserData | undefined> {
      for (const u of users.values()) {
        if (u.email === email) return u;
      }
      return undefined;
    },
    async findById(id: string): Promise<UserData | undefined> {
      return users.get(id);
    },
    async update(id: string, data: Partial<UserData>): Promise<UserData | undefined> {
      const user = users.get(id);
      if (!user) return undefined;
      Object.assign(user, data, { updatedAt: new Date() });
      return user;
    },
    async incrementCredits(id: string, amount: number): Promise<void> {
      const user = users.get(id);
      if (user) user.credits += amount;
    },
    async addFriend(userId: string, friendId: string): Promise<void> {
      const user = users.get(userId);
      if (user && !user.friends.includes(friendId)) {
        user.friends.push(friendId);
      }
    },
    async removeFriend(userId: string, friendId: string): Promise<void> {
      const user = users.get(userId);
      if (user) {
        user.friends = user.friends.filter(f => f !== friendId);
      }
    },
    async getFriends(userId: string): Promise<any[]> {
      const user = users.get(userId);
      if (!user) return [];
      return user.friends.map(fid => {
        const f = users.get(fid);
        return f ? { _id: f._id, name: f.name, avatar: f.avatar, gender: f.gender, country: f.country } : null;
      }).filter(Boolean);
    }
  },

  // ===== REPORT operations =====
  reports: {
    async create(data: Partial<ReportData>): Promise<ReportData> {
      const id = genId();
      const report: ReportData = {
        _id: id,
        reporter: data.reporter || "",
        reported: data.reported || "",
        reason: data.reason || "",
        description: data.description || "",
        status: "pending",
        createdAt: new Date(),
      };
      reports.set(id, report);
      return report;
    },
    async countByReported(reportedId: string): Promise<number> {
      let count = 0;
      for (const r of reports.values()) {
        if (r.reported === reportedId) count++;
      }
      return count;
    },
    async findByReporterAndReported(reporterId: string, reportedId: string): Promise<ReportData | undefined> {
      for (const r of reports.values()) {
        if (r.reporter === reporterId && r.reported === reportedId) return r;
      }
      return undefined;
    }
  },

  // ===== TRANSACTION operations =====
  transactions: {
    async create(data: Partial<TransactionData>): Promise<TransactionData> {
      const id = genId();
      const tx: TransactionData = {
        _id: id,
        userId: data.userId || "",
        amount: data.amount || 0,
        type: data.type || "spend",
        description: data.description || "",
        createdAt: new Date(),
      };
      transactions.set(id, tx);
      return tx;
    },
    async findByUserId(userId: string): Promise<TransactionData[]> {
      const result: TransactionData[] = [];
      for (const t of transactions.values()) {
        if (t.userId === userId) result.push(t);
      }
      return result.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime()).slice(0, 50);
    }
  },

  // ===== QUEUE operations (replaces Redis) =====
  queue: {
    push(entry: any) { waitingQueue.push(entry); },
    remove(socketId: string) {
      const idx = waitingQueue.findIndex(e => e.socketId === socketId);
      if (idx !== -1) waitingQueue.splice(idx, 1);
    },
    getAll() { return [...waitingQueue]; },
    popTwo(): [any, any] | null {
      if (waitingQueue.length < 2) return null;
      const a = waitingQueue.shift();
      const b = waitingQueue.shift();
      return [a, b];
    }
  },

  // ===== ROOM operations =====
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

  // ===== TOKEN =====
  generateToken(userId: string): string {
    return jwt.sign({ userId }, JWT_SECRET, { expiresIn: "30d" });
  },
  verifyToken(token: string): { userId: string } | null {
    try {
      return jwt.verify(token, JWT_SECRET) as { userId: string };
    } catch {
      return null;
    }
  }
};
