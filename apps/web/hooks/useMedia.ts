"use client";

import { useState, useRef, useCallback, useEffect } from "react";

interface UseMediaReturn {
  localStream: MediaStream | null;
  isMicOn: boolean;
  isCamOn: boolean;
  error: string | null;
  startMedia: () => Promise<MediaStream | null>;
  stopMedia: () => void;
  toggleMic: () => void;
  toggleCam: () => void;
}

export function useMedia(): UseMediaReturn {
  const [localStream, setLocalStream] = useState<MediaStream | null>(null);
  const [isMicOn, setIsMicOn] = useState(true);
  const [isCamOn, setIsCamOn] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const startMedia = useCallback(async (): Promise<MediaStream | null> => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { width: { ideal: 1280 }, height: { ideal: 720 }, facingMode: "user" },
        audio: { echoCancellation: true, noiseSuppression: true },
      });
      setLocalStream(stream);
      setIsMicOn(true);
      setIsCamOn(true);
      setError(null);
      return stream;
    } catch (err: any) {
      const message = err.name === "NotAllowedError"
        ? "Camera/Microphone access denied"
        : err.name === "NotFoundError"
        ? "No camera/microphone found"
        : "Failed to access media devices";
      setError(message);
      return null;
    }
  }, []);

  const stopMedia = useCallback(() => {
    if (localStream) {
      localStream.getTracks().forEach((track) => track.stop());
      setLocalStream(null);
    }
  }, [localStream]);

  const toggleMic = useCallback(() => {
    if (localStream) {
      localStream.getAudioTracks().forEach((track) => {
        track.enabled = !track.enabled;
      });
      setIsMicOn((prev) => !prev);
    }
  }, [localStream]);

  const toggleCam = useCallback(() => {
    if (localStream) {
      localStream.getVideoTracks().forEach((track) => {
        track.enabled = !track.enabled;
      });
      setIsCamOn((prev) => !prev);
    }
  }, [localStream]);

  useEffect(() => {
    return () => {
      if (localStream) {
        localStream.getTracks().forEach((track) => track.stop());
      }
    };
  }, []);

  return { localStream, isMicOn, isCamOn, error, startMedia, stopMedia, toggleMic, toggleCam };
}
