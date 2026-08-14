"use client";

import { useRef, useCallback, useState, useEffect } from "react";
import { getSocket } from "@/lib/socket";
import { api } from "@/lib/api";
import { Room, Partner, ChatMessage, ConnectionState, MatchFilters } from "@/types";

const DEFAULT_ICE_SERVERS: RTCConfiguration = {
  iceServers: [
    { urls: "stun:stun.l.google.com:19302" },
    { urls: "stun:stun1.l.google.com:19302" },
    { urls: "stun:stun2.l.google.com:19302" },
    { urls: "turn:openrelayproject.com:5349", username: "openrelayproject", credential: "openrelayproject" },
  ],
};

export function useWebRTC(userId: string | undefined) {
  const peerRef = useRef<RTCPeerConnection | null>(null);
  const localStreamRef = useRef<MediaStream | null>(null);
  const pendingCandidatesRef = useRef<RTCIceCandidateInit[]>([]);
  const remoteStreamRef = useRef<MediaStream | null>(null);
  const iceServersRef = useRef<RTCConfiguration>(DEFAULT_ICE_SERVERS);
  const roomRef = useRef<Room | null>(null);
  const filtersRef = useRef<MatchFilters>({ gender: "all", country: "all", minAge: 18, maxAge: 99 });
  const userIdRef = useRef<string | undefined>(userId);

  useEffect(() => {
    userIdRef.current = userId;
  }, [userId]);

  const [connectionState, setConnectionState] = useState<ConnectionState>("idle");
  const [room, setRoom] = useState<Room | null>(null);
  const [partner, setPartner] = useState<Partner | null>(null);
  const [remoteStream, setRemoteStream] = useState<MediaStream | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isPartnerTyping, setIsPartnerTyping] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!userId) return;
    api.turn
      .getCredentials()
      .then((data) => {
        if (data.iceServers && data.iceServers.length) {
          iceServersRef.current = { iceServers: data.iceServers };
        }
      })
      .catch(() => {});
  }, [userId]);

  useEffect(() => {
    roomRef.current = room;
  }, [room]);

  const createPeerConnection = useCallback((role: "caller" | "callee", localStream: MediaStream) => {
    if (peerRef.current) {
      peerRef.current.close();
    }

    const pc = new RTCPeerConnection(iceServersRef.current);
    peerRef.current = pc;

    localStream.getTracks().forEach((track) => {
      pc.addTrack(track, localStream);
    });

    const videoSender = pc.getSenders().find((s) => s.track && s.track.kind === "video");
    if (videoSender) {
      const params = videoSender.getParameters();
      if (!params.encodings || params.encodings.length === 0) {
        params.encodings = [{}];
      }
      params.encodings[0].maxBitrate = 4_000_000;
      params.encodings[0].maxFramerate = 30;
      videoSender.setParameters(params).catch(() => {});
    }

    pc.ontrack = (event) => {
      if (!event.track) return;
      if (!remoteStreamRef.current) {
        remoteStreamRef.current = new MediaStream();
      }
      remoteStreamRef.current.addTrack(event.track);
      setRemoteStream(remoteStreamRef.current);
    };

    pc.onicecandidate = (event) => {
      if (event.candidate && roomRef.current) {
        getSocket().emit("ice_candidate", {
          candidate: { candidate: event.candidate.candidate, sdpMid: event.candidate.sdpMid, sdpMLineIndex: event.candidate.sdpMLineIndex },
          roomId: roomRef.current.roomId,
        });
      }
    };

    pc.onconnectionstatechange = () => {
      const state = pc.connectionState;
      if (state === "connected") {
        setConnectionState("connected");
        setError(null);
      } else if (state === "disconnected" || state === "failed") {
        setConnectionState("disconnected");
        if (state === "failed") {
          setError("Connection failed - check firewall/antivirus or try again");
          if (roomRef.current) {
            getSocket().emit("skip", { roomId: roomRef.current.roomId });
            roomRef.current = null;
          }
        }
      }
    };

    return pc;
  }, []);

  const startChat = useCallback(
    async (localStream: MediaStream, filters?: MatchFilters) => {
      localStreamRef.current = localStream;
      if (filters) filtersRef.current = filters;
      setConnectionState("searching");
      setError(null);

      getSocket().emit("join_queue", {
        userId,
        filters: filtersRef.current,
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
    getSocket().emit("join_queue", {
      userId: userIdRef.current,
      filters: filtersRef.current,
    });
  }, [room, cleanup]);

  const leaveChat = useCallback(() => {
    if (roomRef.current) {
      getSocket().emit("skip", { roomId: roomRef.current.roomId });
    } else {
      getSocket().emit("leave_queue");
    }
    cleanup();
    setConnectionState("idle");
  }, [cleanup]);

  const cleanup = useCallback(() => {
    if (peerRef.current) {
      peerRef.current.close();
      peerRef.current = null;
    }
    setRemoteStream(null);
    remoteStreamRef.current = null;
    setRoom(null);
    setPartner(null);
    setMessages([]);
    pendingCandidatesRef.current = [];
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

    const flushPendingCandidates = async () => {
      const pc = peerRef.current;
      if (!pc || !pc.remoteDescription) return;
      const pending = pendingCandidatesRef.current.slice();
      pendingCandidatesRef.current = [];
      for (const candidate of pending) {
        try {
          await pc.addIceCandidate(new RTCIceCandidate(candidate));
        } catch (err) {
          console.error("Error adding buffered ICE candidate:", err);
        }
      }
    };

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
            socket.emit("webrtc_offer", { offer: { type: offer.type, sdp: offer.sdp }, roomId: data.roomId });
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
          await flushPendingCandidates();
          const answer = await peerRef.current.createAnswer();
          await peerRef.current.setLocalDescription(answer);
          socket.emit("webrtc_answer", {
            answer: { type: answer.type, sdp: answer.sdp },
            roomId: roomRef.current?.roomId,
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
          await flushPendingCandidates();
        } catch (err) {
          console.error("Error handling answer:", err);
        }
      }
    });

    socket.on("ice_candidate", async (data: { candidate: RTCIceCandidateInit }) => {
      if (peerRef.current) {
        if (!peerRef.current.remoteDescription) {
          pendingCandidatesRef.current.push(data.candidate);
          return;
        }
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
      if (roomRef.current) {
        getSocket().emit("skip", { roomId: roomRef.current.roomId });
        roomRef.current = null;
      }
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
  }, [createPeerConnection, cleanup]);

  return {
    connectionState,
    room,
    partner,
    remoteStream,
    messages,
    isPartnerTyping,
    error,
    startChat,
    skipPartner,
    leaveChat,
    cleanup,
    sendMessage,
    sendTyping,
    sendStopTyping,
    setConnectionState,
  };
}
