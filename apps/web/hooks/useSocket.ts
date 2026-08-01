"use client";

import { useEffect, useRef, useState } from "react";
import { getSocket, connectSocket } from "@/lib/socket";
import { Socket } from "socket.io-client";

export function useSocket(userId: string | undefined) {
  const socketRef = useRef<Socket | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const lastSocketIdRef = useRef<string | null>(null);

  useEffect(() => {
    if (!userId) return;

    const socket = connectSocket(userId);
    socketRef.current = socket;

    if (socket.connected) {
      setIsConnected(true);
      socket.emit("register", userId);
      lastSocketIdRef.current = socket.id ?? null;
    }

    const onConnect = () => {
      setIsConnected(true);
      if (lastSocketIdRef.current !== socket.id) {
        console.log("🔄 Socket reconnected with new ID, re-registering:", userId);
        socket.emit("register", userId);
      lastSocketIdRef.current = socket.id ?? null;
      }
    };
    const onDisconnect = () => setIsConnected(false);

    socket.on("connect", onConnect);
    socket.on("disconnect", onDisconnect);

    return () => {
      socket.off("connect", onConnect);
      socket.off("disconnect", onDisconnect);
      setIsConnected(false);
    };
  }, [userId]);

  return { socket: socketRef.current, isConnected };
}
