"use client";

interface VideoControlsProps {
  isMicOn: boolean;
  isCamOn: boolean;
  onToggleMic: () => void;
  onToggleCam: () => void;
  onSkip: () => void;
  onStop: () => void;
  connectionState: string;
}

export default function VideoControls({ isMicOn, isCamOn, onToggleMic, onToggleCam, onSkip, onStop, connectionState }: VideoControlsProps) {
  const ControlBtn = ({ active, danger, children, onClick, title }: { active?: boolean; danger?: boolean; children: React.ReactNode; onClick: () => void; title: string }) => (
    <button
      onClick={onClick}
      title={title}
      className={`relative w-14 h-14 rounded-2xl flex items-center justify-center transition-all duration-300 active:scale-90 ${
        danger
          ? "bg-accent/15 border border-accent/25 text-accent hover:bg-accent/25"
          : active
            ? "glass hover:bg-white/[0.06] text-white"
            : "bg-white/[0.06] border border-white/[0.08] text-gray-400 hover:text-white hover:bg-white/[0.08]"
      }`}
    >
      {children}
    </button>
  );

  return (
    <div className="flex items-center justify-center gap-4 py-4 px-6">
      <ControlBtn active={isMicOn} onClick={onToggleMic} title={isMicOn ? "Mute" : "Unmute"}>
        {isMicOn ? (
          <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z" /><path d="M19 10v2a7 7 0 0 1-14 0v-2" /><line x1="12" y1="19" x2="12" y2="23" /><line x1="8" y1="23" x2="16" y2="23" /></svg>
        ) : (
          <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><line x1="1" y1="1" x2="23" y2="23" /><path d="M9 9v3a3 3 0 0 0 5.12 2.12M15 9.34V4a3 3 0 0 0-5.94-.6" /><path d="M17 16.95A7 7 0 0 1 5 12v-2m14 0v2c0 .28-.02.56-.05.83" /><line x1="12" y1="19" x2="12" y2="23" /><line x1="8" y1="23" x2="16" y2="23" /></svg>
        )}
      </ControlBtn>

      <ControlBtn active={isCamOn} onClick={onToggleCam} title={isCamOn ? "Camera Off" : "Camera On"}>
        {isCamOn ? (
          <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><polygon points="23 7 16 12 23 17 23 7" /><rect x="1" y="5" width="15" height="14" rx="2" ry="2" /></svg>
        ) : (
          <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><line x1="1" y1="1" x2="23" y2="23" /><path d="M21 21H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h3m3-3h6l2 3h4a2 2 0 0 1 2 2v9.34m-7.72-2.06l4.56-3.52" /></svg>
        )}
      </ControlBtn>

      {connectionState === "connected" && (
        <ControlBtn onClick={onSkip} title="Next person">
          <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polygon points="5 4 15 12 5 20 5 4" /><line x1="19" y1="5" x2="19" y2="19" /></svg>
        </ControlBtn>
      )}

      <ControlBtn danger={connectionState === "searching"} onClick={onStop} title="End">
        {connectionState === "searching" ? (
          <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><rect x="6" y="6" width="12" height="12" rx="2" /></svg>
        ) : (
          <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" /></svg>
        )}
      </ControlBtn>
    </div>
  );
}
