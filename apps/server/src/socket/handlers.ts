import { Server, Socket } from "socket.io";
import { db } from "../utils/db";

const BOT_NAMES = ["Sophia", "Emma", "Olivia", "Ava", "Mia", "Luna", "Zoe", "Chloe", "Aria", "Lily"];
const BOT_AVATARS = [
  "https://flirtbate-storage.ams3.cdn.digitaloceanspaces.com/carousel-media/model_3_n_compressed.webp",
  "https://flirtbate-storage.ams3.cdn.digitaloceanspaces.com/carousel-media/model_4_n_compressed.webp",
  "https://flirtbate-storage.ams3.cdn.digitaloceanspaces.com/carousel-media/model_5_n_compressed.webp",
  "https://flirtbate-profile-media.ams3.cdn.digitaloceanspaces.com/qu902z6w8gq_1745733478812_compressed.webp",
  "https://flirtbate-profile-media.ams3.cdn.digitaloceanspaces.com/9e4pg47j6g9_1761790088898.webp",
];
const BOT_COUNTRIES = ["US", "GB", "CA", "AU", "DE", "FR", "JP", "BR", "IN", "MX"];
const BOT_INTERESTS = ["Music", "Gaming", "Travel", "Movies", "Photography", "Cooking", "Fitness", "Art"];

const botTimers = new Map<string, NodeJS.Timeout>();

function generateBot() {
  const idx = Math.floor(Math.random() * BOT_NAMES.length);
  return {
    id: `bot_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`,
    name: BOT_NAMES[idx],
    avatar: BOT_AVATARS[idx % BOT_AVATARS.length],
    gender: "female",
    country: BOT_COUNTRIES[Math.floor(Math.random() * BOT_COUNTRIES.length)],
    age: Math.floor(Math.random() * 12) + 20,
    interests: BOT_INTERESTS.sort(() => 0.5 - Math.random()).slice(0, 3),
  };
}

export function setupSocketHandlers(io: Server) {
  const onlineUsers = new Map<string, string>();

  io.on("connection", (socket: Socket) => {
    console.log(`🔌 User connected: ${socket.id}`);

    socket.on("register", (userId: string) => {
      onlineUsers.set(socket.id, userId);
    });

    socket.on("join_queue", async (data: { userId: string; filters: any }) => {
      try {
        const { userId, filters } = data;
        const user = await db.users.findById(userId);
        if (!user) return socket.emit("error", { message: "User not found" });
        if (user.isBanned) return socket.emit("error", { message: "Account banned" });

        const entry = {
          socketId: socket.id,
          userId,
          gender: user.gender,
          country: user.country,
          age: user.age,
          timestamp: Date.now(),
        };

        db.queue.push(entry);
        socket.emit("queue_joined", { position: "searching" });

        const matched = tryMatch(io, filters);
        if (!matched) {
          const timer = setTimeout(() => {
            const stillInQueue = db.queue.getAll().find(e => e.socketId === socket.id);
            if (stillInQueue) {
              db.queue.remove(socket.id);
              const bot = generateBot();
              const roomId = `room_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
              db.rooms.create(roomId, { user1Socket: socket.id, user1Id: userId, user2Socket: "bot", user2Id: bot.id });
              db.rooms.setClientRoom(socket.id, roomId);
              io.to(socket.id).emit("matched", { roomId, role: "caller", partner: bot });
            }
            botTimers.delete(socket.id);
          }, 3000);
          botTimers.set(socket.id, timer);
        }
      } catch (err: any) {
        socket.emit("error", { message: err.message });
      }
    });

    socket.on("leave_queue", () => {
      db.queue.remove(socket.id);
      if (botTimers.has(socket.id)) {
        clearTimeout(botTimers.get(socket.id));
        botTimers.delete(socket.id);
      }
      socket.emit("queue_left");
    });

    socket.on("skip", () => {
      handleDisconnect(io, socket, onlineUsers);
      socket.emit("skipped");
    });

    socket.on("webrtc_offer", (data: { offer: any; roomId: string }) => {
      const room = db.rooms.get(data.roomId);
      if (!room) return;
      const otherSocketId = room.user1Socket === socket.id ? room.user2Socket : room.user1Socket;
      io.to(otherSocketId).emit("webrtc_offer", { offer: data.offer, from: socket.id });
    });

    socket.on("webrtc_answer", (data: { answer: any; roomId: string }) => {
      const room = db.rooms.get(data.roomId);
      if (!room) return;
      const otherSocketId = room.user1Socket === socket.id ? room.user2Socket : room.user1Socket;
      io.to(otherSocketId).emit("webrtc_answer", { answer: data.answer, from: socket.id });
    });

    socket.on("ice_candidate", (data: { candidate: any; roomId: string }) => {
      const room = db.rooms.get(data.roomId);
      if (!room) return;
      const otherSocketId = room.user1Socket === socket.id ? room.user2Socket : room.user1Socket;
      io.to(otherSocketId).emit("ice_candidate", { candidate: data.candidate, from: socket.id });
    });

    socket.on("send_message", (data: { roomId: string; message: string }) => {
      const room = db.rooms.get(data.roomId);
      if (!room) return;
      const otherSocketId = room.user1Socket === socket.id ? room.user2Socket : room.user1Socket;
      io.to(otherSocketId).emit("receive_message", { message: data.message, from: socket.id, timestamp: Date.now() });
    });

    socket.on("send_friend_request", (data: { roomId: string }) => {
      const room = db.rooms.get(data.roomId);
      if (!room) return;
      const senderId = onlineUsers.get(socket.id);
      const receiverSocketId = room.user1Socket === socket.id ? room.user2Socket : room.user1Socket;
      io.to(receiverSocketId).emit("friend_request_received", { fromUserId: senderId, fromSocketId: socket.id });
    });

    socket.on("call_request", (data: { toUserId: string; mode: "audio" | "video" }) => {
      const fromUserId = onlineUsers.get(socket.id);
      if (!fromUserId) return;
      const targetSocketId = [...onlineUsers.entries()].find(([_, uid]) => uid === data.toUserId)?.[0];
      if (!targetSocketId) return socket.emit("call_rejected", { reason: "User offline" });
      io.to(targetSocketId).emit("call_incoming", { fromUserId, mode: data.mode, fromSocketId: socket.id });
    });

    socket.on("call_accept", (data: { toSocketId: string }) => {
      io.to(data.toSocketId).emit("call_accepted", { fromSocketId: socket.id });
    });

    socket.on("call_reject", (data: { toSocketId: string }) => {
      io.to(data.toSocketId).emit("call_rejected", { reason: "Rejected" });
    });

    socket.on("call_end", (data: { toSocketId: string; duration: number; cost: number }) => {
      io.to(data.toSocketId).emit("call_ended", { duration: data.duration, cost: data.cost });
    });

    socket.on("accept_friend_request", async (data: { fromUserId: string }) => {
      const myUserId = onlineUsers.get(socket.id);
      if (!myUserId) return;
      await db.users.addFriend(myUserId, data.fromUserId);
      await db.users.addFriend(data.fromUserId, myUserId);
      const requesterSocketId = [...onlineUsers.entries()].find(([_, uid]) => uid === data.fromUserId)?.[0];
      if (requesterSocketId) {
        io.to(requesterSocketId).emit("friend_request_accepted", { userId: myUserId });
      }
    });

    socket.on("typing", (data: { roomId: string }) => {
      const room = db.rooms.get(data.roomId);
      if (!room) return;
      const otherSocketId = room.user1Socket === socket.id ? room.user2Socket : room.user1Socket;
      io.to(otherSocketId).emit("partner_typing");
    });

    socket.on("stop_typing", (data: { roomId: string }) => {
      const room = db.rooms.get(data.roomId);
      if (!room) return;
      const otherSocketId = room.user1Socket === socket.id ? room.user2Socket : room.user1Socket;
      io.to(otherSocketId).emit("partner_stop_typing");
    });

    socket.on("disconnect", () => {
      console.log(`🔌 User disconnected: ${socket.id}`);
      if (botTimers.has(socket.id)) {
        clearTimeout(botTimers.get(socket.id));
        botTimers.delete(socket.id);
      }
      handleDisconnect(io, socket, onlineUsers);
      onlineUsers.delete(socket.id);
    });
  });
}

async function tryMatch(io: Server, filters: any): Promise<boolean> {
  const allEntries = db.queue.getAll();
  if (allEntries.length < 2) return false;

  for (let i = 0; i < allEntries.length; i++) {
    for (let j = i + 1; j < allEntries.length; j++) {
      const a = allEntries[i];
      const b = allEntries[j];
      if (matchesFilters(a, b, filters) || matchesFilters(b, a, filters)) {
        db.queue.remove(a.socketId);
        db.queue.remove(b.socketId);

        if (botTimers.has(a.socketId)) { clearTimeout(botTimers.get(a.socketId)!); botTimers.delete(a.socketId); }
        if (botTimers.has(b.socketId)) { clearTimeout(botTimers.get(b.socketId)!); botTimers.delete(b.socketId); }

        const roomId = `room_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        db.rooms.create(roomId, { user1Socket: a.socketId, user1Id: a.userId, user2Socket: b.socketId, user2Id: b.userId });
        db.rooms.setClientRoom(a.socketId, roomId);
        db.rooms.setClientRoom(b.socketId, roomId);

        const userA = await db.users.findById(a.userId);
        const userB = await db.users.findById(b.userId);

        const safeUser = (u: any) => u ? { id: u._id, name: u.name, avatar: u.avatar, gender: u.gender, country: u.country, age: u.age, interests: u.interests } : null;

        io.to(a.socketId).emit("matched", { roomId, role: "caller", partner: safeUser(userB) });
        io.to(b.socketId).emit("matched", { roomId, role: "callee", partner: safeUser(userA) });
        return true;
      }
    }
  }
  return false;
}

function matchesFilters(a: any, b: any, filters: any): boolean {
  if (filters?.gender && filters.gender !== "all" && b.gender !== filters.gender) return false;
  if (filters?.country && filters.country !== "all" && b.country !== filters.country) return false;
  if (filters?.minAge && b.age < filters.minAge) return false;
  if (filters?.maxAge && b.age > filters.maxAge) return false;
  return a.socketId !== b.socketId;
}

function handleDisconnect(io: Server, socket: Socket, onlineUsers: Map<string, string>) {
  db.queue.remove(socket.id);
  const roomId = db.rooms.getBySocket(socket.id);
  if (roomId) {
    const room = db.rooms.get(roomId);
    if (room) {
      const otherSocketId = room.user1Socket === socket.id ? room.user2Socket : room.user1Socket;
      io.to(otherSocketId).emit("partner_disconnected");
    }
    db.rooms.delete(roomId);
  }
}
