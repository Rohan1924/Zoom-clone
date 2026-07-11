"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Home,
  Video,
  MessageSquare,
  Calendar,
  LayoutGrid,
  MoreHorizontal,
  Settings,
  Bell,
  ChevronDown,
  Plus,
  ChevronLeft,
  ChevronRight,
  Monitor,
  Sparkles,
  LogOut,
} from "lucide-react";
import { useStore } from "@/lib/store";
import type { Meeting } from "@/lib/types";
import NewMeetingModal from "@/components/NewMeetingModal";
import JoinMeetingModal from "@/components/JoinMeetingModal";
import ScheduleMeetingModal from "@/components/ScheduleMeetingModal";

/* ── Live clock ──────────────────────────────────────────── */
function LiveClock() {
  const [now, setNow] = useState<Date | null>(null);
  useEffect(() => {
    setNow(new Date());
    const id = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(id);
  }, []);
  if (!now) return null;
  return (
    <div style={{ textAlign: "center", marginBottom: 32 }}>
      <p
        style={{
          margin: 0,
          fontSize: 56,
          fontWeight: 300,
          color: "#fff",
          letterSpacing: "-2px",
          lineHeight: 1,
        }}
      >
        {now.toLocaleTimeString("en-US", {
          hour: "2-digit",
          minute: "2-digit",
          hour12: false,
        })}
      </p>
      <p style={{ margin: "8px 0 0", fontSize: 14, color: "rgba(255,255,255,0.55)" }}>
        {now.toLocaleDateString("en-US", {
          weekday: "long",
          day: "numeric",
          month: "long",
        })}
      </p>
    </div>
  );
}

/* ── Zoom-style round action button ──────────────────────── */
function ActionBtn({
  icon,
  label,
  sublabel,
  bg,
  onClick,
}: {
  icon: React.ReactNode;
  label: string;
  sublabel?: string;
  bg: string;
  onClick: () => void;
}) {
  const [hovered, setHovered] = useState(false);
  return (
    <button
      onClick={onClick}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: 10,
        background: "none",
        border: "none",
        cursor: "pointer",
        padding: "0 4px",
      }}
    >
      <div
        style={{
          width: 68,
          height: 68,
          borderRadius: "50%",
          background: bg,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          transition: "transform 0.15s, filter 0.15s",
          transform: hovered ? "scale(1.06)" : "scale(1)",
          filter: hovered ? "brightness(1.1)" : "brightness(1)",
        }}
      >
        {icon}
      </div>
      <div style={{ textAlign: "center" }}>
        <p style={{ margin: 0, fontSize: 13, fontWeight: 500, color: "#fff" }}>
          {label}
        </p>
        {sublabel && (
          <p style={{ margin: 0, fontSize: 11, color: "rgba(255,255,255,0.45)" }}>
            {sublabel}
          </p>
        )}
      </div>
    </button>
  );
}

/* ── Meeting row in calendar panel ──────────────────────── */
function MeetingRow({
  meeting,
  onJoin,
}: {
  meeting: Meeting;
  onJoin: (m: Meeting) => void;
}) {
  const time = meeting.scheduled_time
    ? new Date(meeting.scheduled_time).toLocaleTimeString("en-US", {
        hour: "2-digit",
        minute: "2-digit",
        hour12: true,
      })
    : "Now";

  const isPast = meeting.status === "recent";

  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: 14,
        padding: "12px 16px",
        borderBottom: "1px solid rgba(255,255,255,0.06)",
        transition: "background 0.15s",
        cursor: "default",
      }}
      onMouseEnter={(e) =>
        ((e.currentTarget as HTMLDivElement).style.background =
          "rgba(255,255,255,0.04)")
      }
      onMouseLeave={(e) =>
        ((e.currentTarget as HTMLDivElement).style.background = "transparent")
      }
    >
      {/* Time */}
      <div style={{ minWidth: 64, textAlign: "right" }}>
        <p
          style={{
            margin: 0,
            fontSize: 12,
            color: isPast
              ? "rgba(255,255,255,0.3)"
              : "rgba(255,255,255,0.6)",
          }}
        >
          {time}
        </p>
      </div>

      {/* Dot */}
      <div
        style={{
          width: 8,
          height: 8,
          borderRadius: "50%",
          background: isPast ? "rgba(255,255,255,0.2)" : "#1a6fe0",
          flexShrink: 0,
        }}
      />

      {/* Info */}
      <div style={{ flex: 1, minWidth: 0 }}>
        <p
          style={{
            margin: 0,
            fontSize: 14,
            fontWeight: 500,
            color: isPast ? "rgba(255,255,255,0.4)" : "#fff",
            whiteSpace: "nowrap",
            overflow: "hidden",
            textOverflow: "ellipsis",
          }}
        >
          {meeting.title}
        </p>
        {meeting.duration_minutes && (
          <p
            style={{
              margin: "2px 0 0",
              fontSize: 12,
              color: "rgba(255,255,255,0.4)",
            }}
          >
            {meeting.duration_minutes} min · {meeting.meeting_id}
          </p>
        )}
      </div>

      {/* Join button */}
      {!isPast && (
        <button
          onClick={() => onJoin(meeting)}
          style={{
            padding: "6px 16px",
            borderRadius: 6,
            background: "#1a6fe0",
            color: "#fff",
            fontSize: 13,
            fontWeight: 600,
            border: "none",
            cursor: "pointer",
            flexShrink: 0,
            transition: "background 0.15s",
          }}
          onMouseEnter={(e) =>
            ((e.currentTarget as HTMLButtonElement).style.background = "#1560c8")
          }
          onMouseLeave={(e) =>
            ((e.currentTarget as HTMLButtonElement).style.background = "#1a6fe0")
          }
        >
          Join
        </button>
      )}
    </div>
  );
}

/* ── Left sidebar nav item ───────────────────────────────── */
function NavItem({
  icon,
  label,
  active,
}: {
  icon: React.ReactNode;
  label: string;
  active?: boolean;
}) {
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: 4,
        padding: "10px 6px",
        borderRadius: 8,
        cursor: "pointer",
        background: active ? "rgba(255,255,255,0.1)" : "transparent",
        transition: "background 0.15s",
        width: "100%",
      }}
      onMouseEnter={(e) => {
        if (!active)
          (e.currentTarget as HTMLDivElement).style.background =
            "rgba(255,255,255,0.06)";
      }}
      onMouseLeave={(e) => {
        if (!active)
          (e.currentTarget as HTMLDivElement).style.background = "transparent";
      }}
    >
      <div style={{ color: active ? "#fff" : "rgba(255,255,255,0.5)" }}>
        {icon}
      </div>
      <span
        style={{
          fontSize: 10,
          color: active ? "#fff" : "rgba(255,255,255,0.45)",
          fontWeight: active ? 600 : 400,
          textAlign: "center",
          lineHeight: 1.2,
        }}
      >
        {label}
      </span>
    </div>
  );
}

/* ── Main dashboard page ─────────────────────────────────── */
export default function DashboardPage() {
  const router = useRouter();
  const {
    isAuthenticated,
    displayName,
    userAvatar,
    logout,
    upcomingMeetings,
    recentMeetings,
    meetingsLoading,
    fetchMeetings,
  } = useStore();

  const [showNew, setShowNew] = useState(false);
  const [showJoin, setShowJoin] = useState(false);
  const [showSchedule, setShowSchedule] = useState(false);
  const [tab, setTab] = useState<"upcoming" | "recent">("upcoming");
  const [showProfileMenu, setShowProfileMenu] = useState(false);

  // Auth guard — redirect to login if not authenticated
  useEffect(() => {
    if (!isAuthenticated) router.replace("/login");
  }, [isAuthenticated, router]);

  useEffect(() => {
    fetchMeetings();
  }, [fetchMeetings]);

  const handleJoin = (meeting: Meeting) => {
    router.push(`/meeting/${meeting.meeting_id}`);
  };

  const handleLogout = () => {
    logout();
    router.replace("/login");
  };

  if (!isAuthenticated) return null; // avoid flash before redirect

  const allMeetings =
    tab === "upcoming" ? upcomingMeetings : recentMeetings;

  const todayLabel = new Date().toLocaleDateString("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
  });

  return (
    <div style={{ display: "flex", height: "100vh", overflow: "hidden", background: "var(--z-bg)" }}>
      {/* ── Left Sidebar ─────────────────────────────────── */}
      <div
        style={{
          width: 72,
          background: "var(--z-sidebar)",
          borderRight: "1px solid var(--z-border)",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          padding: "16px 8px",
          gap: 4,
          flexShrink: 0,
        }}
      >
        {/* Logo */}
        <div style={{ marginBottom: 16, paddingBottom: 12, borderBottom: "1px solid var(--z-border)", width: "100%" }}>
          <div
            style={{
              width: 40,
              height: 40,
              borderRadius: 10,
              background: "linear-gradient(135deg, #1a6fe0 0%, #1249a3 100%)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              margin: "0 auto",
            }}
          >
            <Video size={20} color="#fff" />
          </div>
        </div>

        <NavItem icon={<Home size={20} />} label="Home" active />
        <NavItem icon={<Video size={20} />} label="Meetings" />
        <NavItem icon={<MessageSquare size={20} />} label="Chat" />
        <NavItem icon={<Calendar size={20} />} label="Scheduler" />
        <NavItem icon={<LayoutGrid size={20} />} label="Hub" />
        <NavItem icon={<MoreHorizontal size={20} />} label="More" />

        {/* Bottom settings */}
        <div style={{ marginTop: "auto" }}>
          <NavItem icon={<Settings size={20} />} label="Settings" />
        </div>
      </div>

      {/* ── Main content ─────────────────────────────────── */}
      <div style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden" }}>
        {/* Top bar */}
        <div
          style={{
            height: 52,
            borderBottom: "1px solid var(--z-border)",
            display: "flex",
            alignItems: "center",
            padding: "0 20px",
            justifyContent: "flex-end",
            gap: 8,
            flexShrink: 0,
          }}
        >
          <button
            title="Notifications"
            style={{
              width: 32,
              height: 32,
              borderRadius: 8,
              background: "transparent",
              border: "none",
              cursor: "pointer",
              color: "rgba(255,255,255,0.55)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <Bell size={18} />
          </button>

          {/* Profile avatar + dropdown */}
          <div style={{ position: "relative" }}>
            <div
              onClick={() => setShowProfileMenu(p => !p)}
              title={displayName}
              style={{
                width: 32,
                height: 32,
                borderRadius: "50%",
                background: "linear-gradient(135deg, #1a6fe0 0%, #7c3aed 100%)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "#fff",
                fontWeight: 700,
                fontSize: 13,
                cursor: "pointer",
                userSelect: "none",
              }}
            >
              {userAvatar}
            </div>
            {showProfileMenu && (
              <div
                style={{
                  position: "absolute",
                  right: 0,
                  top: 40,
                  background: "#232328",
                  border: "1px solid rgba(255,255,255,0.12)",
                  borderRadius: 10,
                  boxShadow: "0 12px 36px rgba(0,0,0,0.5)",
                  minWidth: 200,
                  zIndex: 100,
                  overflow: "hidden",
                }}
              >
                <div style={{ padding: "14px 16px", borderBottom: "1px solid rgba(255,255,255,0.08)" }}>
                  <p style={{ margin: 0, fontWeight: 600, color: "#fff", fontSize: 14 }}>{displayName}</p>
                  <p style={{ margin: "2px 0 0", color: "rgba(255,255,255,0.4)", fontSize: 12 }}>Free Plan</p>
                </div>
                <button
                  onClick={handleLogout}
                  style={{
                    width: "100%",
                    padding: "10px 16px",
                    display: "flex",
                    alignItems: "center",
                    gap: 10,
                    background: "none",
                    border: "none",
                    color: "#ff8a8d",
                    fontSize: 13,
                    cursor: "pointer",
                    fontFamily: "var(--font-sans)",
                    textAlign: "left",
                  }}
                >
                  <LogOut size={14} /> Sign Out
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Scrollable body */}
        <div style={{ flex: 1, overflow: "auto", padding: "28px 32px" }}>
          {/* Clock */}
          <LiveClock />

          {/* Action buttons row — Zoom-style circular icons */}
          <div
            style={{
              display: "flex",
              justifyContent: "center",
              gap: 28,
              marginBottom: 40,
              flexWrap: "wrap",
            }}
          >
            <ActionBtn
              icon={<Video size={28} color="#fff" />}
              label="New meeting"
              sublabel="▾"
              bg="#e86c2b"
              onClick={() => setShowNew(true)}
            />
            <ActionBtn
              icon={<Plus size={28} color="#fff" />}
              label="Join"
              bg="#1a6fe0"
              onClick={() => setShowJoin(true)}
            />
            <ActionBtn
              icon={<Calendar size={28} color="#fff" />}
              label="Schedule"
              bg="#1a6fe0"
              onClick={() => setShowSchedule(true)}
            />
            <ActionBtn
              icon={<Monitor size={28} color="#fff" />}
              label="Share screen"
              bg="#1a6fe0"
              onClick={() => {}}
            />
            <ActionBtn
              icon={<Sparkles size={28} color="#fff" />}
              label="My notes"
              bg="#1a6fe0"
              onClick={() => {}}
            />
          </div>

          {/* Meeting calendar panel */}
          <div
            style={{
              maxWidth: 560,
              margin: "0 auto",
              background: "var(--z-surface)",
              borderRadius: 12,
              border: "1px solid var(--z-border)",
              overflow: "hidden",
            }}
          >
            {/* Panel header */}
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                padding: "12px 16px",
                borderBottom: "1px solid var(--z-border)",
              }}
            >
              <button
                onClick={() => setShowSchedule(true)}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 6,
                  background: "rgba(255,255,255,0.08)",
                  border: "1px solid var(--z-border-strong)",
                  borderRadius: 6,
                  padding: "4px 12px",
                  color: "#fff",
                  fontSize: 13,
                  fontWeight: 500,
                  cursor: "pointer",
                  fontFamily: "var(--font-sans)",
                  transition: "background 0.15s",
                }}
                onMouseEnter={e => ((e.currentTarget as HTMLButtonElement).style.background = "rgba(255,255,255,0.14)")}
                onMouseLeave={e => ((e.currentTarget as HTMLButtonElement).style.background = "rgba(255,255,255,0.08)")}
              >
                <Plus size={14} /> Schedule a meeting
              </button>

              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 6,
                    padding: "4px 10px",
                    borderRadius: 6,
                    background: "rgba(255,255,255,0.06)",
                    cursor: "pointer",
                  }}
                >
                  <Calendar size={13} color="rgba(255,255,255,0.6)" />
                  <span style={{ fontSize: 13, color: "rgba(255,255,255,0.75)" }}>
                    Today, {todayLabel.split(",")[1]?.trim() ?? todayLabel}
                  </span>
                  <ChevronDown size={13} color="rgba(255,255,255,0.6)" />
                </div>
                <button
                  style={{
                    background: "none",
                    border: "1px solid var(--z-border-strong)",
                    borderRadius: 6,
                    width: 28,
                    height: 28,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    cursor: "pointer",
                    color: "rgba(255,255,255,0.6)",
                  }}
                >
                  <ChevronLeft size={14} />
                </button>
                <button
                  style={{
                    background: "none",
                    border: "1px solid var(--z-border-strong)",
                    borderRadius: 6,
                    width: 28,
                    height: 28,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    cursor: "pointer",
                    color: "rgba(255,255,255,0.6)",
                  }}
                >
                  <ChevronRight size={14} />
                </button>
              </div>
            </div>

            {/* Tabs */}
            <div
              style={{
                display: "flex",
                borderBottom: "1px solid var(--z-border)",
              }}
            >
              {(["upcoming", "recent"] as const).map((t) => (
                <button
                  key={t}
                  onClick={() => setTab(t)}
                  style={{
                    flex: 1,
                    padding: "10px",
                    background: "none",
                    border: "none",
                    cursor: "pointer",
                    fontSize: 13,
                    fontWeight: tab === t ? 600 : 400,
                    color: tab === t ? "#fff" : "rgba(255,255,255,0.45)",
                    borderBottom: tab === t ? "2px solid #1a6fe0" : "2px solid transparent",
                    fontFamily: "var(--font-sans)",
                    transition: "color 0.15s",
                    textTransform: "capitalize",
                  }}
                >
                  {t === "upcoming" ? "Upcoming" : "Recent"}
                </button>
              ))}
            </div>

            {/* Meeting list */}
            {meetingsLoading ? (
              <div
                style={{
                  padding: 40,
                  textAlign: "center",
                  color: "rgba(255,255,255,0.3)",
                  fontSize: 13,
                }}
              >
                Loading…
              </div>
            ) : allMeetings.length === 0 ? (
              <div
                style={{
                  padding: "48px 24px",
                  textAlign: "center",
                }}
              >
                <div style={{ fontSize: 40, marginBottom: 12 }}>📭</div>
                <p
                  style={{
                    margin: 0,
                    color: "rgba(255,255,255,0.4)",
                    fontSize: 14,
                  }}
                >
                  No {tab} meetings
                </p>
                {tab === "upcoming" && (
                  <button
                    onClick={() => setShowSchedule(true)}
                    style={{
                      marginTop: 14,
                      padding: "6px 16px",
                      borderRadius: 6,
                      background: "none",
                      border: "1px solid rgba(255,255,255,0.2)",
                      color: "rgba(255,255,255,0.7)",
                      fontSize: 13,
                      cursor: "pointer",
                      fontFamily: "var(--font-sans)",
                    }}
                  >
                    + Schedule a meeting
                  </button>
                )}
              </div>
            ) : (
              <div>
                {allMeetings.map((m) => (
                  <MeetingRow key={m.id} meeting={m} onJoin={handleJoin} />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Modals */}
      <NewMeetingModal open={showNew} onClose={() => setShowNew(false)} />
      <JoinMeetingModal open={showJoin} onClose={() => setShowJoin(false)} />
      <ScheduleMeetingModal
        open={showSchedule}
        onClose={() => setShowSchedule(false)}
        onScheduled={fetchMeetings}
      />
    </div>
  );
}
