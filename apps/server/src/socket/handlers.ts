import { Server, Socket } from "socket.io";
import { db } from "../utils/db";
import { sendToUser } from "../services/push";

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
  (io as any).__onlineUsers = onlineUsers; // expose for debug endpoint

  io.on("connection", (socket: Socket) => {
    console.log(`🔌 User connected: ${socket.id} | Total: ${io.sockets.sockets.size} | transport: ${socket.conn.transport.name}`);
    console.log(`🔌 Handshake headers:`, JSON.stringify({
      origin: socket.handshake.headers.origin,
      host: socket.handshake.headers.host,
      'user-agent': socket.handshake.headers['user-agent']?.substring(0, 50),
      'x-forwarded-for': socket.handshake.headers['x-forwarded-for'],
    }));

    socket.on("register", (userId: string) => {
      console.log(`📌 Register: socket ${socket.id} → userId ${userId} | onlineUsers now: ${[...onlineUsers.entries()].map(([s,u])=>`${u}@${s.substring(0,6)}`).join(", ")}`);
      onlineUsers.set(socket.id, userId);
    });

    socket.on("join_queue", async (data: { userId: string; filters: any }) => {
      try {
        const { userId, filters } = data;
        const user = await db.users.findById(userId);
        if (!user) return socket.emit("error", { message: "User not found" });
        if (user.isBanned) return socket.emit("error", { message: "Account banned" });

        if (botTimers.has(socket.id)) {
          clearTimeout(botTimers.get(socket.id));
          botTimers.delete(socket.id);
        }
        db.queue.remove(socket.id);

        const entry = {
          socketId: socket.id,
          userId,
          gender: user.gender,
          country: user.country,
          age: user.age,
          filters: filters || {},
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
    });    socket.on("webrtc_offer", (data: { offer: any; roomId: string }) => {
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
      const receiverOnline = io.sockets.sockets.has(receiverSocketId);
      io.to(receiverSocketId).emit("friend_request_received", { fromUserId: senderId, fromSocketId: socket.id });
      if (!receiverOnline && room.user2Id && senderId) {
        const receiverUserId = room.user2Socket === receiverSocketId ? room.user2Id : room.user1Id;
        if (receiverUserId && !receiverUserId.startsWith("bot_")) {
          sendToUser(receiverUserId, {
            title: "🤝 New friend request",
            body: "Someone sent you a friend request",
            url: "/friends",
            tag: `friend-${senderId}`,
          });
        }
      }
    });

    socket.on("call_request", (data: { toUserId: string; mode: "audio" | "video" }) => {
      const fromUserId = onlineUsers.get(socket.id);
      if (!fromUserId) {
        console.log(`📞 call_request: caller socket ${socket.id} not registered`);
        return socket.emit("call_rejected", { reason: "You are not registered. Please refresh." });
      }
      const allOnline = [...onlineUsers.entries()].map(([sid, uid]) => `${uid}@${sid.substring(0,6)}`);
      console.log(`📞 call_request: ${fromUserId} (${socket.id.substring(0,6)}) → ${data.toUserId} [${data.mode}]`);
      console.log(`📞 onlineUsers: [${allOnline.join(", ")}]`);
      const targetSocketIds = [...onlineUsers.entries()]
        .filter(([_, uid]) => uid === data.toUserId)
        .map(([sid]) => sid);
      if (targetSocketIds.length === 0) {
        console.log(`📞 call_request: target ${data.toUserId} offline`);
        socket.emit("call_rejected", { reason: "User offline" });
        sendToUser(data.toUserId, {
          title: "📞 Incoming call",
          body: `Someone is calling you${data.mode === "audio" ? " (audio)" : " (video)"}`,
          url: "/chat",
          tag: `call-${fromUserId}`,
        });
        return;
      }
      console.log(`📞 Sending call_incoming to ${targetSocketIds.length} socket(s): ${targetSocketIds.map(s => s.substring(0,6)).join(", ")}`);
      targetSocketIds.forEach((sid) => {
        io.to(sid).emit("call_incoming", { fromUserId, mode: data.mode, fromSocketId: socket.id });
      });
      console.log(`📞 call_incoming sent. rooms:`, io.sockets.adapter.rooms?.size || "N/A");
      socket.emit("call_requested", { toUserId: data.toUserId, socketId: targetSocketIds[0] });
    });

    socket.on("call_accept", (data: { toSocketId: string }) => {
      console.log(`📞 call_accept: ${socket.id} accepted, notifying ${data.toSocketId}`);
      io.to(data.toSocketId).emit("call_accepted", { fromSocketId: socket.id });
    });

    socket.on("call_reject", (data: { toSocketId: string }) => {
      io.to(data.toSocketId).emit("call_rejected", { reason: "Rejected" });
    });

    socket.on("call_end", (data: { toSocketId: string; duration: number; cost: number }) => {
      io.to(data.toSocketId).emit("call_ended", { duration: data.duration, cost: data.cost });
    });

    socket.on("call_webrtc_offer", (data: { offer: any; toSocketId: string }) => {
      io.to(data.toSocketId).emit("call_webrtc_offer", { offer: data.offer, from: socket.id });
    });

    socket.on("call_webrtc_answer", (data: { answer: any; toSocketId: string }) => {
      io.to(data.toSocketId).emit("call_webrtc_answer", { answer: data.answer, from: socket.id });
    });

    socket.on("call_ice_candidate", (data: { candidate: any; toSocketId: string }) => {
      io.to(data.toSocketId).emit("call_ice_candidate", { candidate: data.candidate, from: socket.id });
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

async function tryMatch(io: Server, _filters: any): Promise<boolean> {
  const allEntries = db.queue.getAll();
  if (allEntries.length < 2) return false;

  for (let i = 0; i < allEntries.length; i++) {
    for (let j = i + 1; j < allEntries.length; j++) {
      const a = allEntries[i];
      const b = allEntries[j];
      if (matchesFilters(b, a.filters) && matchesFilters(a, b.filters)) {
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

function matchesFilters(user: any, filters: any): boolean {
  if (!filters) return true;
  if (filters.gender && filters.gender !== "all" && user.gender !== filters.gender) return false;
  if (filters.country && filters.country !== "all" && user.country !== filters.country) return false;
  if (filters.minAge && user.age < filters.minAge) return false;
  if (filters.maxAge && user.age > filters.maxAge) return false;
  return true;
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
