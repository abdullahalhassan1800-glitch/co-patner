"use client";

import { useEffect, useRef, useState } from "react";
import { getSocket, connectSocket, disconnectSocket } from "@/lib/socket";
import { Socket } from "socket.io-client";

export function useSocket(userId: string | undefined) {
  const socketRef = useRef<Socket | null>(null);
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    if (!userId) return;

    const socket = connectSocket(userId);
    socketRef.current = socket;

    socket.on("connect", () => setIsConnected(true));
    socket.on("disconnect", () => setIsConnected(false));

    return () => {
      disconnectSocket();
      setIsConnected(false);
    };
  }, [userId]);

  return { socket: socketRef.current, isConnected };
}
