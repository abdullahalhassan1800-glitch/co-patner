"use client";

import { useEffect, useCallback, useRef, useState } from "react";
import { getSocket } from "@/lib/socket";
import { api } from "@/lib/api";

  const DEFAULT_ICE_SERVERS: RTCConfiguration = {
    iceServers: [
      { urls: "stun:stun.l.google.com:19302" },
      { urls: "stun:stun1.l.google.com:19302" },
      { urls: "stun:stun2.l.google.com:19302" },
      { urls: "turn:openrelayproject.com:5349", username: "openrelayproject", credential: "openrelayproject" },
    ],
  };

interface IncomingCall {
  fromUserId: string;
  fromSocketId: string;
  mode: "audio" | "video";
}

export function useCallSocket(userId: string | undefined) {
  const [incomingCall, setIncomingCall] = useState<IncomingCall | null>(null);
  const [callAccepted, setCallAccepted] = useState(false);
  const [callRejected, setCallRejected] = useState(false);
  const [callEnded, setCallEnded] = useState(false);
  const [callError, setCallError] = useState<string | null>(null);
  const [remoteStream, setRemoteStream] = useState<MediaStream | null>(null);
  const [localStream, setLocalStream] = useState<MediaStream | null>(null);

  const targetSocketRef = useRef<string | null>(null);
  const peerRef = useRef<RTCPeerConnection | null>(null);
  const localStreamRef = useRef<MediaStream | null>(null);
  const isCallerRef = useRef<boolean>(false);
  const incomingCallModeRef = useRef<"audio" | "video">("video");
  const pendingCandidatesRef = useRef<RTCIceCandidateInit[]>([]);
  const mediaReadyRef = useRef<{ promise: Promise<void>; resolve: () => void } | null>(null);
  const remoteStreamRef = useRef<MediaStream | null>(null);
  const iceServersRef = useRef<RTCConfiguration>(DEFAULT_ICE_SERVERS);

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

  const acquireMedia = useCallback(async (mode: "audio" | "video"): Promise<MediaStream | null> => {
    try {
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        console.error("getUserMedia not available (need HTTPS or localhost)");
        setCallError("Camera/mic not available - use HTTPS or localhost");
        return null;
      }
      const constraints: MediaStreamConstraints = {
        audio: true,
        video: mode === "video" ? { width: { ideal: 640 }, height: { ideal: 480 }, facingMode: "user" } : false,
      };
      console.log("🎤 Requesting media:", constraints);
      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      console.log("🎤 Media acquired:", stream.getTracks().map(t => `${t.kind}:${t.label}`).join(", "));
      localStreamRef.current = stream;
      setLocalStream(stream);
      return stream;
    } catch (err: any) {
      console.error("Failed to acquire media:", err.message || err);
      // Try audio-only fallback if video fails
      if (mode === "video") {
        try {
          console.log("🎤 Retrying audio-only...");
          const stream = await navigator.mediaDevices.getUserMedia({ audio: true, video: false });
          console.log("🎤 Audio-only acquired:", stream.getTracks().map(t => `${t.kind}:${t.label}`).join(", "));
          localStreamRef.current = stream;
          setLocalStream(stream);
          setCallError("Camera not available, audio only");
          return stream;
        } catch (err2) {
          console.error("Audio-only also failed:", err2);
        }
      }
      setCallError("Camera/microphone access denied");
      return null;
    }
  }, []);

  const createPeerConnection = useCallback((stream: MediaStream): RTCPeerConnection => {
    if (peerRef.current) {
      peerRef.current.close();
    }

    const pc = new RTCPeerConnection(iceServersRef.current);
    peerRef.current = pc;

    stream.getTracks().forEach((track) => {
      pc.addTrack(track, stream);
    });

    pc.ontrack = (event) => {
      if (!event.track) return;
      if (!remoteStreamRef.current) {
        remoteStreamRef.current = new MediaStream();
      }
      remoteStreamRef.current.addTrack(event.track);
      setRemoteStream(remoteStreamRef.current);
    };

    pc.onicecandidate = (event) => {
      if (event.candidate && targetSocketRef.current) {
        getSocket().emit("call_ice_candidate", {
          candidate: { candidate: event.candidate.candidate, sdpMid: event.candidate.sdpMid, sdpMLineIndex: event.candidate.sdpMLineIndex },
          toSocketId: targetSocketRef.current,
        });
      }
    };

    pc.onconnectionstatechange = () => {
      const state = pc.connectionState;
      console.log("📞 ICE connection state:", state);
      if (state === "failed") {
        console.error("WebRTC connection failed");
        setCallError("Connection failed - check firewall/antivirus");
      }
    };

    pc.oniceconnectionstatechange = () => {
      console.log("📞 ICE gathering state:", pc.iceGatheringState, "connection:", pc.iceConnectionState);
    };

    return pc;
  }, []);

  const cleanupWebRTC = useCallback(() => {
    if (peerRef.current) {
      peerRef.current.close();
      peerRef.current = null;
    }
    if (localStreamRef.current) {
      localStreamRef.current.getTracks().forEach((t) => t.stop());
      localStreamRef.current = null;
    }
    setRemoteStream(null);
    setLocalStream(null);
    targetSocketRef.current = null;
    isCallerRef.current = false;
    pendingCandidatesRef.current = [];
    mediaReadyRef.current = null;
    remoteStreamRef.current = null;
  }, []);

  const flushPendingCandidates = useCallback(async () => {
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
  }, []);

  useEffect(() => {
    if (!userId) return;
    const socket = getSocket();

    const handleCallIncoming = (data: IncomingCall) => {
      console.log("📞📞📞 call_incoming RECEIVED:", JSON.stringify(data), "current callState check needed in dashboard");
      incomingCallModeRef.current = data.mode;
      setIncomingCall(data);
    };

    const handleCallAccepted = async (data: { fromSocketId: string }) => {
      console.log("📞 call_accepted received, from:", data.fromSocketId);
      targetSocketRef.current = data.fromSocketId;
      setCallAccepted(true);

      const mode = incomingCallModeRef.current || "video";
      console.log("📞 acquiring media for mode:", mode, "isCaller:", isCallerRef.current);
      const stream = await acquireMedia(mode);
      if (!stream) {
        console.error("📞 Failed to acquire media");
        return;
      }

      if (isCallerRef.current) {
        console.log("📞 Caller creating WebRTC offer");
        const pc = createPeerConnection(stream);
        try {
          const offer = await pc.createOffer();
          await pc.setLocalDescription(offer);
          socket.emit("call_webrtc_offer", {
            offer: { type: offer.type, sdp: offer.sdp },
            toSocketId: data.fromSocketId,
          });
          console.log("📞 WebRTC offer sent");
        } catch (err) {
          console.error("Error creating offer:", err);
        }
      }
    };

    const handleCallRejected = (data: { reason: string }) => {
      setCallRejected(true);
      setCallError(data.reason);
      cleanupWebRTC();
    };

    const handleCallEnded = (data: { duration: number; cost: number }) => {
      setCallEnded(true);
      cleanupWebRTC();
    };

    const handleCallOffer = async (data: { offer: any; from: string }) => {
      targetSocketRef.current = data.from;

      // Wait for media from acceptCall if it's still acquiring
      if (mediaReadyRef.current && !localStreamRef.current) {
        await mediaReadyRef.current.promise;
      }

      let stream = localStreamRef.current;
      if (!stream) {
        stream = await acquireMedia(incomingCallModeRef.current || "video");
      }
      if (!stream) return;

      const pc = createPeerConnection(stream);
      try {
        await pc.setRemoteDescription(new RTCSessionDescription(data.offer));
        await flushPendingCandidates();
        const answer = await pc.createAnswer();
        await pc.setLocalDescription(answer);
        socket.emit("call_webrtc_answer", {
          answer: { type: answer.type, sdp: answer.sdp },
          toSocketId: data.from,
        });
      } catch (err) {
        console.error("Error handling offer:", err);
      }
    };

    const handleCallAnswer = async (data: { answer: any; from: string }) => {
      if (peerRef.current) {
        try {
          await peerRef.current.setRemoteDescription(new RTCSessionDescription(data.answer));
          await flushPendingCandidates();
        } catch (err) {
          console.error("Error handling answer:", err);
        }
      }
    };

    const handleCallIceCandidate = async (data: { candidate: any; from: string }) => {
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
    };

    socket.on("call_incoming", handleCallIncoming);
    socket.on("call_accepted", handleCallAccepted);
    socket.on("call_rejected", handleCallRejected);
    socket.on("call_ended", handleCallEnded);
    socket.on("call_webrtc_offer", handleCallOffer);
    socket.on("call_webrtc_answer", handleCallAnswer);
    socket.on("call_ice_candidate", handleCallIceCandidate);

    return () => {
      socket.off("call_incoming", handleCallIncoming);
      socket.off("call_accepted", handleCallAccepted);
      socket.off("call_rejected", handleCallRejected);
      socket.off("call_ended", handleCallEnded);
      socket.off("call_webrtc_offer", handleCallOffer);
      socket.off("call_webrtc_answer", handleCallAnswer);
      socket.off("call_ice_candidate", handleCallIceCandidate);
    };
  }, [userId, acquireMedia, createPeerConnection, cleanupWebRTC, flushPendingCandidates]);

  const initiateCall = useCallback(async (toUserId: string, mode: "audio" | "video") => {
    const socket = getSocket();
    isCallerRef.current = true;
    incomingCallModeRef.current = mode;
    socket.emit("call_request", { toUserId, mode });
    setCallAccepted(false);
    setCallRejected(false);
    setCallEnded(false);
    setCallError(null);
  }, []);

  const acceptCall = useCallback(async (mode: "audio" | "video") => {
    if (!incomingCall) return;
    const socket = getSocket();
    targetSocketRef.current = incomingCall.fromSocketId;
    isCallerRef.current = false;

    // Create a promise that handleCallOffer can await
    let resolveMedia: () => void;
    mediaReadyRef.current = {
      promise: new Promise<void>((r) => { resolveMedia = r; }),
      resolve: () => {},
    };
    mediaReadyRef.current.resolve = resolveMedia!;

    // Emit accept FIRST so caller transitions to active
    socket.emit("call_accept", { toSocketId: incomingCall.fromSocketId });
    setCallAccepted(true);

    // Then acquire media (don't block signaling)
    await acquireMedia(mode);
    mediaReadyRef.current?.resolve();

    // Callee doesn't create offer - caller does
  }, [incomingCall, acquireMedia]);

  const rejectCall = useCallback(() => {
    if (!incomingCall) return;
    const socket = getSocket();
    socket.emit("call_reject", { toSocketId: incomingCall.fromSocketId });
    setIncomingCall(null);
    cleanupWebRTC();
  }, [incomingCall, cleanupWebRTC]);

  const endCall = useCallback((duration: number = 0, cost: number = 0) => {
    const socket = getSocket();
    if (targetSocketRef.current) {
      socket.emit("call_end", { toSocketId: targetSocketRef.current, duration, cost });
    }
    setCallEnded(true);
    cleanupWebRTC();
  }, [cleanupWebRTC]);

  const resetCallState = useCallback(() => {
    setIncomingCall(null);
    setCallAccepted(false);
    setCallRejected(false);
    setCallEnded(false);
    setCallError(null);
    cleanupWebRTC();
  }, [cleanupWebRTC]);

  return {
    incomingCall,
    callAccepted,
    callRejected,
    callEnded,
    callError,
    remoteStream,
    localStream,
    initiateCall,
    acceptCall,
    rejectCall,
    endCall,
    resetCallState,
  };
}
