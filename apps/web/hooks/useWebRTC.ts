"use client";

import { useRef, useCallback, useState, useEffect } from "react";
import { getSocket } from "@/lib/socket";
import { Room, Partner, ChatMessage, ConnectionState } from "@/types";

const ICE_SERVERS: RTCConfiguration = {
  iceServers: [
    { urls: "stun:stun.l.google.com:19302" },
    { urls: "stun:stun1.l.google.com:19302" },
    { urls: "stun:stun2.l.google.com:19302" },
  ],
};

export function useWebRTC(userId: string | undefined) {
  const peerRef = useRef<RTCPeerConnection | null>(null);
  const localStreamRef = useRef<MediaStream | null>(null);

  const [connectionState, setConnectionState] = useState<ConnectionState>("idle");
  const [room, setRoom] = useState<Room | null>(null);
  const [partner, setPartner] = useState<Partner | null>(null);
  const [remoteStream, setRemoteStream] = useState<MediaStream | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isPartnerTyping, setIsPartnerTyping] = useState(false);

  const createPeerConnection = useCallback((role: "caller" | "callee", localStream: MediaStream) => {
    if (peerRef.current) {
      peerRef.current.close();
    }

    const pc = new RTCPeerConnection(ICE_SERVERS);
    peerRef.current = pc;

    localStream.getTracks().forEach((track) => {
      pc.addTrack(track, localStream);
    });

    pc.ontrack = (event) => {
      setRemoteStream(event.streams[0]);
    };

    pc.onicecandidate = (event) => {
      if (event.candidate && room) {
        getSocket().emit("ice_candidate", {
          candidate: event.candidate.toJSON(),
          roomId: room.roomId,
        });
      }
    };

    pc.onconnectionstatechange = () => {
      const state = pc.connectionState;
      if (state === "connected") {
        setConnectionState("connected");
      } else if (state === "disconnected" || state === "failed") {
        setConnectionState("disconnected");
      }
    };

    return pc;
  }, [room]);

  const startChat = useCallback(
    async (localStream: MediaStream) => {
      localStreamRef.current = localStream;
      setConnectionState("searching");

      getSocket().emit("join_queue", {
        userId,
        filters: { gender: "all", country: "all", minAge: 18, maxAge: 99 },
      });
    },
    [userId]
  );

  const skipPartner = useCallback(() => {
    if (room) {
      getSocket().emit("skip", { roomId: room.roomId });
    }
    cleanup();
    setConnectionState("searching");
  }, [room]);

  const cleanup = useCallback(() => {
    if (peerRef.current) {
      peerRef.current.close();
      peerRef.current = null;
    }
    setRemoteStream(null);
    setRoom(null);
    setPartner(null);
    setMessages([]);
  }, []);

  const sendMessage = useCallback(
    (message: string) => {
      if (room) {
        getSocket().emit("send_message", { roomId: room.roomId, message });
        setMessages((prev) => [
          ...prev,
          { id: Date.now().toString(), message, from: "me", timestamp: Date.now() },
        ]);
      }
    },
    [room]
  );

  const sendTyping = useCallback(() => {
    if (room) getSocket().emit("typing", { roomId: room.roomId });
  }, [room]);

  const sendStopTyping = useCallback(() => {
    if (room) getSocket().emit("stop_typing", { roomId: room.roomId });
  }, [room]);

  useEffect(() => {
    const socket = getSocket();

    socket.on("matched", async (data: { roomId: string; role: "caller" | "callee"; partner: Partner }) => {
      setRoom({ roomId: data.roomId, role: data.role, partner: data.partner });
      setPartner(data.partner);
      setConnectionState("connecting");

      if (localStreamRef.current) {
        const pc = createPeerConnection(data.role, localStreamRef.current);

        if (data.role === "caller") {
          try {
            const offer = await pc.createOffer();
            await pc.setLocalDescription(offer);
            socket.emit("webrtc_offer", { offer: offer.toJSON(), roomId: data.roomId });
          } catch (err) {
            console.error("Error creating offer:", err);
          }
        }
      }
    });

    socket.on("webrtc_offer", async (data: { offer: RTCSessionDescriptionInit }) => {
      if (peerRef.current && localStreamRef.current) {
        try {
          await peerRef.current.setRemoteDescription(new RTCSessionDescription(data.offer));
          const answer = await peerRef.current.createAnswer();
          await peerRef.current.setLocalDescription(answer);
          socket.emit("webrtc_answer", {
            answer: answer.toJSON(),
            roomId: room?.roomId,
          });
        } catch (err) {
          console.error("Error handling offer:", err);
        }
      }
    });

    socket.on("webrtc_answer", async (data: { answer: RTCSessionDescriptionInit }) => {
      if (peerRef.current) {
        try {
          await peerRef.current.setRemoteDescription(new RTCSessionDescription(data.answer));
        } catch (err) {
          console.error("Error handling answer:", err);
        }
      }
    });

    socket.on("ice_candidate", async (data: { candidate: RTCIceCandidateInit }) => {
      if (peerRef.current) {
        try {
          await peerRef.current.addIceCandidate(new RTCIceCandidate(data.candidate));
        } catch (err) {
          console.error("Error adding ICE candidate:", err);
        }
      }
    });

    socket.on("receive_message", (data: { message: string; timestamp: number }) => {
      setMessages((prev) => [
        ...prev,
        { id: Date.now().toString(), message: data.message, from: "partner", timestamp: data.timestamp },
      ]);
    });

    socket.on("partner_disconnected", () => {
      setConnectionState("disconnected");
      cleanup();
    });

    socket.on("skipped", () => {
      cleanup();
    });

    socket.on("partner_typing", () => setIsPartnerTyping(true));
    socket.on("partner_stop_typing", () => setIsPartnerTyping(false));

    return () => {
      socket.off("matched");
      socket.off("webrtc_offer");
      socket.off("webrtc_answer");
      socket.off("ice_candidate");
      socket.off("receive_message");
      socket.off("partner_disconnected");
      socket.off("skipped");
      socket.off("partner_typing");
      socket.off("partner_stop_typing");
    };
  }, [createPeerConnection, cleanup, room?.roomId]);

  return {
    connectionState,
    room,
    partner,
    remoteStream,
    messages,
    isPartnerTyping,
    startChat,
    skipPartner,
    cleanup,
    sendMessage,
    sendTyping,
    sendStopTyping,
    setConnectionState,
  };
}
