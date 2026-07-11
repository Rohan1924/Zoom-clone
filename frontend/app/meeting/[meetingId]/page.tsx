"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import toast from "react-hot-toast";
import {
  Mic, MicOff, Video, VideoOff, Users, MessageSquare,
  SmilePlus, MonitorUp, Wrench, MoreHorizontal,
  ChevronUp, Loader2, AlertCircle, LogIn, PhoneOff, Link,
  VolumeX, UserMinus, Copy
} from "lucide-react";
import { useWebcam } from "@/hooks/useWebcam";
import { useStore } from "@/lib/store";
import { getMeeting, joinMeeting, getMeetingParticipants, muteAllParticipants, removeParticipant } from "@/lib/api";
import type { Meeting, Participant } from "@/lib/types";

/* ─── Join Prompt ────────────────────────────────────────── */
function JoinPrompt({ meetingId, onJoined }: { meetingId: string; onJoined: (name: string) => void }) {
  const { displayName, setDisplayName } = useStore();
  const [name, setName] = useState(displayName || "");
  const [loading, setLoading] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [videoOn, setVideoOn] = useState(true);

  useEffect(() => {
    navigator.mediaDevices?.getUserMedia({ video: true, audio: true })
      .then(s => setStream(s))
      .catch(() => {});
    return () => { stream?.getTracks().forEach(t => t.stop()); };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (videoRef.current && stream) videoRef.current.srcObject = stream;
  }, [stream]);

  const handleJoin = async () => {
    const nm = name.trim();
    if (!nm) { toast.error("Please enter your name"); return; }
    setLoading(true);
    try {
      await joinMeeting(meetingId, { display_name: nm });
      setDisplayName(nm);
      stream?.getTracks().forEach(t => t.stop());
      onJoined(nm);
    } catch {
      toast.error("Failed to join meeting.");
    } finally {
      setLoading(false);
    }
  };

  const initials = name.trim().split(" ").map(w => w[0]).join("").slice(0, 2).toUpperCase() || "?";

  return (
    <div style={{ minHeight: "100vh", background: "#111216", display: "flex", alignItems: "center", justifyContent: "center", padding: 24 }}>
      <div style={{ width: "100%", maxWidth: 480, background: "#1a1a1e", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 12, overflow: "hidden", boxShadow: "0 32px 80px rgba(0,0,0,0.7)" }}>
        {/* Title bar */}
        <div style={{ padding: "10px 16px", background: "#232328", borderBottom: "1px solid rgba(255,255,255,0.08)" }}>
          <span style={{ fontSize: 13, color: "rgba(255,255,255,0.7)", fontWeight: 500 }}>
            Join Meeting — {meetingId}
          </span>
        </div>

        {/* Video preview */}
        <div style={{ position: "relative", aspectRatio: "16/9", background: "#111", display: "flex", alignItems: "center", justifyContent: "center" }}>
          <video ref={videoRef} autoPlay muted playsInline style={{ width: "100%", height: "100%", objectFit: "cover", display: stream && videoOn ? "block" : "none", transform: "scaleX(-1)" }} />
          {(!stream || !videoOn) && (
            <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center", background: "#1a1a1e" }}>
              <div style={{ width: 72, height: 72, borderRadius: "50%", background: "#1a6fe0", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 24, fontWeight: 700, color: "#fff" }}>{initials}</div>
            </div>
          )}
          <div style={{ position: "absolute", bottom: 14, left: "50%", transform: "translateX(-50%)", display: "flex", gap: 10 }}>
            <button onClick={() => { stream?.getVideoTracks().forEach(t => t.enabled = !videoOn); setVideoOn(p => !p); }} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 4, padding: "8px 18px", borderRadius: 8, background: videoOn ? "rgba(30,30,40,0.85)" : "rgba(229,72,77,0.85)", border: "1px solid rgba(255,255,255,0.15)", color: "#fff", cursor: "pointer", fontSize: 11, fontFamily: "var(--font-sans)", backdropFilter: "blur(4px)" }}>
              {videoOn ? <Video size={18} /> : <VideoOff size={18} />}
              Video
            </button>
          </div>
        </div>

        {/* Name + Join */}
        <div style={{ padding: "14px 16px 16px", display: "flex", flexDirection: "column", gap: 12 }}>
          <input type="text" placeholder="Your name" value={name} onChange={e => setName(e.target.value)} onKeyDown={e => e.key === "Enter" && handleJoin()} autoFocus style={{ background: "#111216", border: "1px solid rgba(255,255,255,0.15)", borderRadius: 6, padding: "9px 14px", color: "#fff", fontSize: 14, fontFamily: "var(--font-sans)", outline: "none", width: "100%" }} />
          <button onClick={handleJoin} disabled={loading || !name.trim()} style={{ alignSelf: "flex-end", padding: "9px 32px", borderRadius: 6, background: !name.trim() ? "rgba(26,111,224,0.4)" : "#1a6fe0", border: "none", color: "#fff", fontSize: 14, fontWeight: 600, cursor: name.trim() ? "pointer" : "not-allowed", fontFamily: "var(--font-sans)", display: "flex", alignItems: "center", gap: 8 }}>
            {loading ? <Loader2 size={14} className="animate-spin" /> : <LogIn size={14} />}
            Join
          </button>
        </div>
      </div>
    </div>
  );
}

/* ─── Not Found ──────────────────────────────────────────── */
function MeetingNotFound({ meetingId }: { meetingId: string }) {
  const router = useRouter();
  return (
    <div style={{ minHeight: "100vh", background: "#111216", display: "flex", alignItems: "center", justifyContent: "center", flexDirection: "column", gap: 16, padding: 24 }}>
      <AlertCircle size={56} color="#e5484d" />
      <h1 style={{ color: "#fff", fontSize: 22, fontWeight: 700, margin: 0 }}>Meeting Not Found</h1>
      <p style={{ color: "rgba(255,255,255,0.4)", fontSize: 14, margin: 0, fontFamily: "monospace" }}>{meetingId}</p>
      <button onClick={() => router.push("/")} style={{ marginTop: 8, padding: "10px 28px", borderRadius: 6, background: "#1a6fe0", border: "none", color: "#fff", fontSize: 14, fontWeight: 600, cursor: "pointer" }}>Back to Home</button>
    </div>
  );
}

/* ─── Toolbar Button ─────────────────────────────────────── */
function TBtn({ icon, label, onClick, danger, active, withCaret, disabled }: { icon: React.ReactNode; label: string; onClick?: () => void; danger?: boolean; active?: boolean; withCaret?: boolean; disabled?: boolean; }) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      style={{
        display: "flex", flexDirection: "column", alignItems: "center", gap: 3,
        padding: "6px 14px", borderRadius: 8, background: "transparent",
        border: "none", cursor: disabled ? "not-allowed" : "pointer",
        color: danger ? "#ff6b6b" : active === false ? "#ff6b6b" : "rgba(255,255,255,0.9)",
        fontFamily: "var(--font-sans)", fontSize: 11, fontWeight: 400,
        position: "relative", transition: "background 0.15s",
      }}
      onMouseEnter={e => !disabled && ((e.currentTarget as HTMLButtonElement).style.background = "rgba(255,255,255,0.08)")}
      onMouseLeave={e => ((e.currentTarget as HTMLButtonElement).style.background = "transparent")}
    >
      <div style={{ display: "flex", alignItems: "center", gap: 2 }}>
        {icon}
        {withCaret && <ChevronUp size={10} style={{ marginTop: -2, opacity: 0.6 }} />}
      </div>
      <span>{label}</span>
    </button>
  );
}

/* ─── Participants Panel ───────────────────────────────────── */
function ParticipantsPanel({
  participants, loading, meetingId, isHost, currentUser, onClose, onMutedAll, onRemoved,
}: {
  participants: Participant[];
  loading: boolean;
  meetingId: string;
  isHost: boolean;
  currentUser: string;
  onClose: () => void;
  onMutedAll: () => void;
  onRemoved: (id: string) => void;
}) {
  const [muteLoading, setMuteLoading] = useState(false);

  const handleMuteAll = async () => {
    setMuteLoading(true);
    try {
      const res = await muteAllParticipants(meetingId);
      toast.success(`Muted ${res.muted_count} participant${res.muted_count !== 1 ? "s" : ""}`);
      onMutedAll();
    } catch {
      toast.error("Failed to mute all");
    } finally {
      setMuteLoading(false);
    }
  };

  const handleRemove = async (p: Participant) => {
    try {
      await removeParticipant(meetingId, p.id);
      toast.success(`Removed ${p.display_name}`);
      onRemoved(p.id);
    } catch {
      toast.error("Failed to remove participant");
    }
  };

  return (
    <div style={{
      position: "absolute", right: 0, top: 0, bottom: 0, width: 300,
      background: "#1e1e22", borderLeft: "1px solid rgba(255,255,255,0.1)",
      display: "flex", flexDirection: "column", zIndex: 10,
    }}>
      {/* Header */}
      <div style={{ padding: "14px 16px", borderBottom: "1px solid rgba(255,255,255,0.08)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <span style={{ fontWeight: 600, color: "#fff", fontSize: 14 }}>Participants ({participants.length})</span>
        <button onClick={onClose} style={{ background: "none", border: "none", color: "rgba(255,255,255,0.4)", cursor: "pointer", fontSize: 18, lineHeight: 1 }}>×</button>
      </div>

      {/* Mute All (Host Only) */}
      {isHost && (
        <div style={{ padding: "10px 16px", borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
          <button
            onClick={handleMuteAll}
            disabled={muteLoading}
            style={{
              width: "100%", padding: "8px 0", borderRadius: 6,
              background: "rgba(255,255,255,0.07)", border: "1px solid rgba(255,255,255,0.12)",
              color: "#fff", fontSize: 13, fontWeight: 500, cursor: muteLoading ? "not-allowed" : "pointer",
              display: "flex", alignItems: "center", justifyContent: "center", gap: 6,
              fontFamily: "var(--font-sans)",
            }}
          >
            <VolumeX size={14} />
            {muteLoading ? "Muting…" : "Mute All"}
          </button>
        </div>
      )}

      {/* List */}
      <div style={{ flex: 1, overflowY: "auto", padding: "8px 0" }}>
        {loading ? (
          <p style={{ color: "rgba(255,255,255,0.3)", fontSize: 13, textAlign: "center", padding: 20 }}>Loading…</p>
        ) : participants.map(p => {
          const init = p.display_name.split(" ").map(w => w[0]).join("").slice(0, 2).toUpperCase();
          return (
            <div
              key={p.id}
              style={{ display: "flex", alignItems: "center", gap: 10, padding: "8px 16px" }}
              onMouseEnter={e => (e.currentTarget.style.background = "rgba(255,255,255,0.04)")}
              onMouseLeave={e => (e.currentTarget.style.background = "transparent")}
            >
              <div style={{ width: 32, height: 32, borderRadius: "50%", background: p.is_host ? "#e86c2b" : "#1a6fe0", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12, fontWeight: 700, color: "#fff", flexShrink: 0 }}>{init}</div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <p style={{ margin: 0, fontSize: 13, color: "#fff", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                  {p.display_name}{p.is_host ? " ★" : ""}
                </p>
                {p.is_muted && <p style={{ margin: 0, fontSize: 11, color: "#e5484d" }}>Muted</p>}
              </div>
              {/* Remove Participant (Host Only, can't remove self) */}
              {isHost && p.display_name !== currentUser && (
                <button
                  onClick={() => handleRemove(p)}
                  title="Remove participant"
                  style={{ background: "none", border: "none", color: "rgba(255,80,80,0.6)", cursor: "pointer", padding: 4, display: "flex", borderRadius: 4 }}
                  onMouseEnter={e => ((e.currentTarget as HTMLButtonElement).style.color = "#ff6b6b")}
                  onMouseLeave={e => ((e.currentTarget as HTMLButtonElement).style.color = "rgba(255,80,80,0.6)")}
                >
                  <UserMinus size={14} />
                </button>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

/* ─── Host Tools Panel ─────────────────────────────────────── */
function HostToolsPanel({
  meetingId, participants, currentUser, onClose, onMutedAll, onRemoved,
}: {
  meetingId: string;
  participants: Participant[];
  currentUser: string;
  onClose: () => void;
  onMutedAll: () => void;
  onRemoved: (id: string) => void;
}) {
  const [muteLoading, setMuteLoading] = useState(false);
  const [locked, setLocked] = useState(false);

  const handleMuteAll = async () => {
    setMuteLoading(true);
    try {
      const res = await muteAllParticipants(meetingId);
      toast.success(`🔇 Muted ${res.muted_count} participant${res.muted_count !== 1 ? "s" : ""}`);
      onMutedAll();
    } catch {
      toast.error("Failed to mute all");
    } finally {
      setMuteLoading(false);
    }
  };

  const handleRemove = async (p: Participant) => {
    try {
      await removeParticipant(meetingId, p.id);
      toast.success(`Removed ${p.display_name}`);
      onRemoved(p.id);
    } catch {
      toast.error("Failed to remove participant");
    }
  };

  const hostActions = [
    {
      icon: <VolumeX size={16} />,
      label: "Mute All Participants",
      desc: "Mute everyone except yourself",
      onClick: handleMuteAll,
      loading: muteLoading,
      color: "#fff",
    },
    {
      icon: <span style={{ fontSize: 16 }}>{locked ? "🔒" : "🔓"}</span>,
      label: locked ? "Unlock Meeting" : "Lock Meeting",
      desc: locked ? "Allow new participants to join" : "Prevent new participants from joining",
      onClick: () => { setLocked(l => !l); toast.success(locked ? "Meeting unlocked" : "Meeting locked"); },
      loading: false,
      color: locked ? "#e5484d" : "#fff",
    },
    {
      icon: <Copy size={16} />,
      label: "Copy Invite Link",
      desc: `Meeting ID: ${meetingId}`,
      onClick: async () => {
        const link = `${window.location.origin}/meeting/${meetingId}`;
        await navigator.clipboard.writeText(link);
        toast.success("Invite link copied!");
      },
      loading: false,
      color: "#fff",
    },
  ];

  return (
    <div style={{
      position: "absolute", right: 0, top: 0, bottom: 0, width: 320,
      background: "#1e1e22", borderLeft: "1px solid rgba(255,255,255,0.1)",
      display: "flex", flexDirection: "column", zIndex: 12,
    }}>
      {/* Header */}
      <div style={{ padding: "14px 16px", borderBottom: "1px solid rgba(255,255,255,0.08)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <span style={{ fontWeight: 600, color: "#fff", fontSize: 14 }}>Host Tools</span>
        <button onClick={onClose} style={{ background: "none", border: "none", color: "rgba(255,255,255,0.4)", cursor: "pointer", fontSize: 18, lineHeight: 1 }}>×</button>
      </div>

      {/* Quick actions */}
      <div style={{ padding: 16, borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
        <p style={{ margin: "0 0 10px", fontSize: 11, fontWeight: 600, color: "rgba(255,255,255,0.35)", textTransform: "uppercase", letterSpacing: "0.08em" }}>Meeting Controls</p>
        <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
          {hostActions.map((a, i) => (
            <button
              key={i}
              onClick={a.onClick}
              disabled={a.loading}
              style={{
                padding: "10px 14px",
                borderRadius: 8,
                background: "rgba(255,255,255,0.05)",
                border: "1px solid rgba(255,255,255,0.1)",
                color: a.color,
                fontSize: 13,
                fontWeight: 500,
                cursor: a.loading ? "not-allowed" : "pointer",
                display: "flex",
                alignItems: "center",
                gap: 10,
                textAlign: "left",
                fontFamily: "var(--font-sans)",
                transition: "background 0.15s",
              }}
              onMouseEnter={e => !a.loading && ((e.currentTarget as HTMLButtonElement).style.background = "rgba(255,255,255,0.1)")}
              onMouseLeave={e => ((e.currentTarget as HTMLButtonElement).style.background = "rgba(255,255,255,0.05)")}
            >
              {a.icon}
              <div>
                <div>{a.loading ? "Working…" : a.label}</div>
                <div style={{ fontSize: 11, color: "rgba(255,255,255,0.35)", marginTop: 1 }}>{a.desc}</div>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Participant list with remove */}
      <div style={{ padding: "10px 16px 6px" }}>
        <p style={{ margin: "0 0 8px", fontSize: 11, fontWeight: 600, color: "rgba(255,255,255,0.35)", textTransform: "uppercase", letterSpacing: "0.08em" }}>Participants ({participants.length})</p>
      </div>
      <div style={{ flex: 1, overflowY: "auto", padding: "0 0 8px" }}>
        {participants.map(p => {
          const init = p.display_name.split(" ").map(w => w[0]).join("").slice(0, 2).toUpperCase();
          return (
            <div key={p.id} style={{ display: "flex", alignItems: "center", gap: 10, padding: "7px 16px" }}
              onMouseEnter={e => (e.currentTarget.style.background = "rgba(255,255,255,0.04)")}
              onMouseLeave={e => (e.currentTarget.style.background = "transparent")}
            >
              <div style={{ width: 28, height: 28, borderRadius: "50%", background: p.is_host ? "#e86c2b" : "#1a6fe0", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 11, fontWeight: 700, color: "#fff", flexShrink: 0 }}>{init}</div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <p style={{ margin: 0, fontSize: 13, color: "#fff" }}>{p.display_name}{p.is_host ? " ★" : ""}</p>
                {p.is_muted && <p style={{ margin: 0, fontSize: 10, color: "#e5484d" }}>Muted</p>}
              </div>
              {p.display_name !== currentUser && (
                <button
                  onClick={() => handleRemove(p)}
                  title="Remove"
                  style={{ background: "none", border: "none", color: "rgba(255,80,80,0.5)", cursor: "pointer", padding: 4, display: "flex", borderRadius: 4 }}
                  onMouseEnter={e => ((e.currentTarget as HTMLButtonElement).style.color = "#ff6b6b")}
                  onMouseLeave={e => ((e.currentTarget as HTMLButtonElement).style.color = "rgba(255,80,80,0.5)")}
                >
                  <UserMinus size={13} />
                </button>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

/* ─── Meeting Room ──────────────────────────────────────────────── */
function MeetingRoom({ meeting, joinedName }: { meeting: Meeting; joinedName: string }) {
  const router = useRouter();
  const { stream, videoRef, micOn, cameraOn, toggleMic, toggleCamera, isLoading } = useWebcam();
  const [participants, setParticipants] = useState<Participant[]>([]);
  const currentUserData = participants.find(p => p.display_name === joinedName);
  const isHost = currentUserData?.is_host ?? false;

  const [participantsLoading, setParticipantsLoading] = useState(true);
  const [showParticipants, setShowParticipants] = useState(false);
  const [showHostTools, setShowHostTools] = useState(false);
  const [showToolbar, setShowToolbar] = useState(true);
  const hideTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const fetchParticipants = useCallback(async () => {
    try {
      const list = await getMeetingParticipants(meeting.meeting_id);
      setParticipants(list);
      
      // If we successfully fetched the list, and our name is no longer in it, we were kicked out by the host!
      if (list.length > 0 && !list.some(p => p.display_name === joinedName)) {
        toast.error("You were removed by the host.");
        router.push("/");
      }
    } catch { /* ignore */ }
    finally { setParticipantsLoading(false); }
  }, [meeting.meeting_id, joinedName, router]);

  useEffect(() => {
    fetchParticipants();
    const id = setInterval(fetchParticipants, 5000);
    return () => clearInterval(id);
  }, [fetchParticipants]);

  // Auto-hide toolbar
  const resetTimer = useCallback(() => {
    setShowToolbar(true);
    if (hideTimer.current) clearTimeout(hideTimer.current);
    hideTimer.current = setTimeout(() => setShowToolbar(false), 4000);
  }, []);

  useEffect(() => {
    resetTimer();
    return () => { if (hideTimer.current) clearTimeout(hideTimer.current); };
  }, [resetTimer]);

  const inviteLink = meeting.invite_link || `${window.location.origin}/meeting/${meeting.meeting_id}`;

  const copyLink = async () => {
    try { await navigator.clipboard.writeText(inviteLink); toast.success("Invite link copied!"); }
    catch { toast.error("Failed to copy"); }
  };

  const handleLeave = () => {
    router.push("/");
    toast.success("You left the meeting");
  };

  const initials = joinedName.split(" ").map(w => w[0]).join("").slice(0, 2).toUpperCase();

  return (
    <div
      onMouseMove={resetTimer}
      style={{ width: "100vw", height: "100vh", background: "#111216", position: "relative", overflow: "hidden", cursor: showToolbar ? "default" : "none" }}
    >
      {/* ── Full-screen video ── */}
      <div style={{ position: "absolute", inset: 0 }}>
        {/* Live video */}
        <video
          ref={videoRef}
          autoPlay
          muted
          playsInline
          style={{
            width: "100%", height: "100%", objectFit: "cover",
            display: stream && cameraOn ? "block" : "none",
            transform: "scaleX(-1)",
          }}
        />

        {/* Avatar fallback */}
        {(!stream || !cameraOn) && (
          <div style={{ position: "absolute", inset: 0, background: "#1a1a1e", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <div style={{ width: 120, height: 120, borderRadius: "50%", background: "#e86c2b", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 42, fontWeight: 700, color: "#fff" }}>
              {isLoading ? "…" : initials}
            </div>
          </div>
        )}

        {/* Name tag — bottom left like Zoom */}
        <div style={{
          position: "absolute", bottom: 72, left: 14,
          background: "rgba(0,0,0,0.55)", backdropFilter: "blur(4px)",
          borderRadius: 4, padding: "3px 10px",
          color: "#fff", fontSize: 13, fontWeight: 400,
        }}>
          {joinedName}
        </div>
      </div>

      {/* ── Participants side panel ── */}
      {showParticipants && (
        <div style={{ position: "absolute", inset: 0 }}>
          <ParticipantsPanel
            participants={participants}
            loading={participantsLoading}
            meetingId={meeting.meeting_id}
            isHost={isHost}
            currentUser={joinedName}
            onClose={() => setShowParticipants(false)}
            onMutedAll={fetchParticipants}
            onRemoved={(id) => setParticipants(ps => ps.filter(p => p.id !== id))}
          />
        </div>
      )}

      {/* ── Host tools panel ── */}
      {showHostTools && (
        <div style={{ position: "absolute", inset: 0 }}>
          <HostToolsPanel
            meetingId={meeting.meeting_id}
            participants={participants}
            currentUser={joinedName}
            onClose={() => setShowHostTools(false)}
            onMutedAll={fetchParticipants}
            onRemoved={(id) => setParticipants(ps => ps.filter(p => p.id !== id))}
          />
        </div>
      )}

      {/* ── Invite link — ALWAYS visible top-left ── */}
      <div style={{
        position: "absolute", top: 12, left: 16,
        display: "flex", alignItems: "center", gap: 8,
        zIndex: 20,
      }}>
        <button
          onClick={copyLink}
          style={{
            display: "flex", alignItems: "center", gap: 6,
            padding: "5px 12px", borderRadius: 6,
            background: "rgba(0,0,0,0.55)", backdropFilter: "blur(6px)",
            border: "1px solid rgba(255,255,255,0.15)",
            color: "rgba(255,255,255,0.85)", fontSize: 12, cursor: "pointer",
            fontFamily: "var(--font-sans)",
          }}
        >
          <Link size={12} /> Copy invite link
        </button>
        <span style={{ color: "rgba(255,255,255,0.45)", fontSize: 12, fontFamily: "monospace", background: "rgba(0,0,0,0.45)", padding: "3px 8px", borderRadius: 4 }}>{meeting.meeting_id}</span>
      </div>

      {/* ── Bottom Toolbar — Zoom-faithful ── */}
      <div
        style={{
          position: "absolute", bottom: 0, left: 0, right: 0,
          height: 64,
          background: "rgba(20,20,25,0.95)",
          backdropFilter: "blur(12px)",
          borderTop: "1px solid rgba(255,255,255,0.08)",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "0 16px",
          opacity: showToolbar ? 1 : 0,
          transition: "opacity 0.3s",
          pointerEvents: showToolbar ? "auto" : "none",
        }}
      >
        {/* Left group: Audio + Video */}
        <div style={{ display: "flex", gap: 2 }}>
          <TBtn
            icon={micOn ? <Mic size={20} /> : <MicOff size={20} />}
            label={micOn ? "Mute" : "Unmute"}
            onClick={toggleMic}
            active={micOn}
            withCaret
          />
          <TBtn
            icon={cameraOn ? <Video size={20} /> : <VideoOff size={20} />}
            label={cameraOn ? "Stop Video" : "Start Video"}
            onClick={toggleCamera}
            active={cameraOn}
            withCaret
          />
        </div>

        {/* Center group: Participants Chat React Share Host tools More */}
        <div style={{ display: "flex", gap: 2 }}>
          <TBtn
            icon={<Users size={20} />}
            label={`Participants${participants.length > 0 ? ` ${participants.length}` : ""}`}
            onClick={() => { setShowParticipants(p => !p); setShowHostTools(false); }}
            withCaret
          />
          <TBtn icon={<MessageSquare size={20} />} label="Chat" withCaret />
          <TBtn icon={<SmilePlus size={20} />} label="React" withCaret />
          <TBtn icon={<MonitorUp size={20} />} label="Share" withCaret />
          {isHost && (
            <TBtn icon={<Wrench size={20} />} label="Host tools" withCaret onClick={() => { setShowHostTools(p => !p); setShowParticipants(false); }} />
          )}
          <TBtn icon={<MoreHorizontal size={20} />} label="More" withCaret />
        </div>

        {/* Right: End button */}
        <button
          onClick={handleLeave}
          style={{
            padding: "8px 20px", borderRadius: 6,
            background: "#e5484d", border: "none",
            color: "#fff", fontSize: 14, fontWeight: 600,
            cursor: "pointer", display: "flex", alignItems: "center", gap: 6,
            fontFamily: "var(--font-sans)",
          }}
        >
          <PhoneOff size={16} />
          End
        </button>
      </div>
    </div>
  );
}

/* ─── Page orchestrator ──────────────────────────────────── */
export default function MeetingPage() {
  const { meetingId } = useParams<{ meetingId: string }>();
  const searchParams = useSearchParams();
  const { displayName } = useStore();

  const [meeting, setMeeting] = useState<Meeting | null>(null);
  const [notFound, setNotFound] = useState(false);
  const [loadingMeeting, setLoadingMeeting] = useState(true);
  const [joined, setJoined] = useState(false);
  const [joinedName, setJoinedName] = useState(displayName || "");

  useEffect(() => {
    (async () => {
      try {
        const m = await getMeeting(meetingId);
        setMeeting(m);

        if (displayName.trim()) {
          // Came from "New Meeting" flow — auto-join and skip prompt
          try { await joinMeeting(meetingId, { display_name: displayName.trim() }); } catch { /* ignore if already joined */ }
          setJoinedName(displayName.trim());
          setJoined(true);
        }
      } catch {
        setNotFound(true);
      } finally {
        setLoadingMeeting(false);
      }
    })();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [meetingId]);

  // Suppress unused warning — noVideo param reserved for future use
  void searchParams;

  if (loadingMeeting) {
    return (
      <div style={{ minHeight: "100vh", background: "#111216", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <Loader2 size={32} color="rgba(255,255,255,0.3)" className="animate-spin" />
      </div>
    );
  }

  if (notFound || !meeting) return <MeetingNotFound meetingId={meetingId} />;

  if (!joined) {
    return (
      <JoinPrompt
        meetingId={meetingId}
        onJoined={name => { setJoinedName(name); setJoined(true); }}
      />
    );
  }

  return <MeetingRoom meeting={meeting} joinedName={joinedName} />;
}
