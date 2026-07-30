"use client";

import { io, Socket } from "socket.io-client";
import { getServerUrl } from "@/lib/url";

const SOCKET_URL = getServerUrl();

let socket: Socket | null = null;
let registeredUserId: string | null = null;

export function getSocket(): Socket {
  if (!socket) {
    socket = io(SOCKET_URL, {
      transports: ["polling", "websocket"],
      autoConnect: false,
    });
  }
  return socket;
}

export function connectSocket(userId: string): Socket {
  const s = getSocket();
  if (!s.connected) {
    s.connect();
  }
  if (registeredUserId !== userId) {
    s.emit("register", userId);
    registeredUserId = userId;
  }
  return s;
}
