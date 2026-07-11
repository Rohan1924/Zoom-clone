"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import toast from "react-hot-toast";
import { Loader2, X, ChevronDown } from "lucide-react";
import { createScheduledMeeting } from "@/lib/api";
import { useStore } from "@/lib/store";
import { useEffect, useRef } from "react";

const schema = z.object({
  title: z.string().min(1, "Title is required"),
  description: z.string().optional(),
  date: z.string().min(1, "Date is required"),
  time: z.string().min(1, "Time is required"),
  duration_minutes: z.coerce.number().min(5).max(480),
  host_name: z.string().min(1, "Your name is required"),
});

type FormData = z.infer<typeof schema>;

interface Props {
  open: boolean;
  onClose: () => void;
  onScheduled?: () => void;
}

const today = new Date().toISOString().split("T")[0];
const nowTime = new Date().toTimeString().slice(0, 5);

function addMinutes(time: string, mins: number) {
  const [h, m] = time.split(":").map(Number);
  const total = h * 60 + m + mins;
  const hh = Math.floor(total / 60) % 24;
  const mm = total % 60;
  return `${String(hh).padStart(2, "0")}:${String(mm).padStart(2, "0")}`;
}

export default function ScheduleMeetingModal({ open, onClose, onScheduled }: Props) {
  const { displayName, setDisplayName, addHostedMeeting } = useStore();
  const [loading, setLoading] = useState(false);
  const [invitee, setInvitee] = useState("");
  const overlayRef = useRef<HTMLDivElement>(null);

  const {
    register,
    handleSubmit,
    reset,
    watch,
    formState: { errors },
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } = useForm<FormData, any, FormData>({
    resolver: zodResolver(schema) as any,
    defaultValues: {
      host_name: displayName || "",
      duration_minutes: 60,
      date: today,
      time: nowTime,
    },
  });

  useEffect(() => {
    if (!open) return;
    const handleKey = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    document.addEventListener("keydown", handleKey);
    return () => document.removeEventListener("keydown", handleKey);
  }, [open, onClose]);

  const watchTime = watch("time", nowTime);
  const endTime = addMinutes(watchTime, watch("duration_minutes", 60));

  const onSubmit = async (data: FormData) => {
    setLoading(true);
    try {
      const scheduled_time = new Date(`${data.date}T${data.time}`).toISOString();
      setDisplayName(data.host_name);
      const meeting = await createScheduledMeeting({
        title: data.title,
        description: data.description,
        scheduled_time,
        duration_minutes: data.duration_minutes,
        host_name: data.host_name,
      });
      addHostedMeeting(meeting.meeting_id);
      toast.success("Meeting scheduled!");
      reset();
      onClose();
      onScheduled?.();
    } catch {
      toast.error("Failed to schedule meeting.");
    } finally {
      setLoading(false);
    }
  };

  if (!open) return null;

  return (
    <div
      ref={overlayRef}
      onClick={(e) => e.target === overlayRef.current && onClose()}
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 200,
        background: "rgba(0,0,0,0.65)",
        backdropFilter: "blur(6px)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: 24,
      }}
    >
      {/* Floating panel — matches Zoom's schedule dialog */}
      <div
        style={{
          width: "100%",
          maxWidth: 520,
          background: "#232328",
          border: "1px solid rgba(255,255,255,0.12)",
          borderRadius: 12,
          boxShadow: "0 32px 80px rgba(0,0,0,0.7)",
          overflow: "hidden",
        }}
      >
        {/* Title bar */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            padding: "14px 20px",
            borderBottom: "1px solid rgba(255,255,255,0.08)",
          }}
        >
          <span style={{ fontSize: 15, fontWeight: 600, color: "#fff" }}>Schedule Meeting</span>
          <button
            onClick={onClose}
            style={{
              background: "none",
              border: "none",
              cursor: "pointer",
              color: "rgba(255,255,255,0.5)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              padding: 4,
            }}
          >
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit(onSubmit)}>
          <div style={{ padding: "18px 20px", display: "flex", flexDirection: "column", gap: 16, maxHeight: "70vh", overflowY: "auto" }}>

            {/* Topic / Title */}
            <input
              {...register("title")}
              placeholder="Topic (e.g. Rohan's Zoom Meeting)"
              style={{
                background: "var(--z-bg)",
                border: errors.title ? "2px solid #e5484d" : "1px solid rgba(255,255,255,0.15)",
                borderRadius: 6,
                padding: "10px 14px",
                color: "#fff",
                fontSize: 14,
                fontFamily: "var(--font-sans)",
                outline: "none",
                width: "100%",
              }}
            />

            {/* Date + Time row */}
            <div style={{ display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap" }}>
              <input
                type="date"
                min={today}
                {...register("date")}
                style={{
                  background: "var(--z-bg)",
                  border: "1px solid rgba(255,255,255,0.15)",
                  borderRadius: 6,
                  padding: "8px 12px",
                  color: "#fff",
                  fontSize: 13,
                  fontFamily: "var(--font-sans)",
                  outline: "none",
                  cursor: "pointer",
                }}
              />
              <input
                type="time"
                {...register("time")}
                style={{
                  background: "var(--z-bg)",
                  border: "1px solid rgba(255,255,255,0.15)",
                  borderRadius: 6,
                  padding: "8px 12px",
                  color: "#fff",
                  fontSize: 13,
                  fontFamily: "var(--font-sans)",
                  outline: "none",
                  cursor: "pointer",
                }}
              />
              <span style={{ color: "rgba(255,255,255,0.4)", fontSize: 13 }}>–</span>
              <div
                style={{
                  background: "var(--z-bg)",
                  border: "1px solid rgba(255,255,255,0.15)",
                  borderRadius: 6,
                  padding: "8px 12px",
                  color: "rgba(255,255,255,0.5)",
                  fontSize: 13,
                  minWidth: 80,
                }}
              >
                {endTime}
              </div>
            </div>

            {/* Duration */}
            <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
              <label style={{ fontSize: 13, color: "rgba(255,255,255,0.6)", minWidth: 64 }}>Duration</label>
              <div style={{ position: "relative", display: "flex", alignItems: "center" }}>
                <input
                  type="number"
                  min={5}
                  max={480}
                  {...register("duration_minutes")}
                  style={{
                    background: "var(--z-bg)",
                    border: "1px solid rgba(255,255,255,0.15)",
                    borderRadius: 6,
                    padding: "8px 32px 8px 12px",
                    color: "#fff",
                    fontSize: 13,
                    fontFamily: "var(--font-sans)",
                    outline: "none",
                    width: 100,
                    appearance: "none" as const,
                  }}
                />
                <span style={{ position: "absolute", right: 10, color: "rgba(255,255,255,0.4)", fontSize: 12, pointerEvents: "none" }}>min</span>
              </div>
            </div>

            {/* Timezone placeholder */}
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 6,
                color: "rgba(255,255,255,0.5)",
                fontSize: 13,
                cursor: "pointer",
              }}
            >
              (GMT+05:30) Mumbai, Kolkata, Chennai, New Delhi
              <ChevronDown size={14} />
            </div>

            <div style={{ height: 1, background: "rgba(255,255,255,0.08)" }} />

            {/* Invitees */}
            <div>
              <p style={{ margin: "0 0 8px", fontSize: 13, fontWeight: 600, color: "rgba(255,255,255,0.7)" }}>Invitees</p>
              <input
                type="text"
                placeholder="Add invitees"
                value={invitee}
                onChange={(e) => setInvitee(e.target.value)}
                style={{
                  background: "var(--z-bg)",
                  border: "1px solid rgba(255,255,255,0.15)",
                  borderRadius: 6,
                  padding: "8px 14px",
                  color: "#fff",
                  fontSize: 13,
                  fontFamily: "var(--font-sans)",
                  outline: "none",
                  width: "100%",
                }}
              />
            </div>

            {/* Meeting ID */}
            <div>
              <p style={{ margin: "0 0 10px", fontSize: 13, fontWeight: 600, color: "rgba(255,255,255,0.7)" }}>Meeting ID</p>
              <div style={{ display: "flex", gap: 24 }}>
                <label style={{ display: "flex", alignItems: "center", gap: 8, cursor: "pointer", fontSize: 13, color: "rgba(255,255,255,0.6)" }}>
                  <div
                    style={{
                      width: 16,
                      height: 16,
                      borderRadius: "50%",
                      border: "2px solid var(--z-blue)",
                      background: "var(--z-blue)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    <div style={{ width: 6, height: 6, borderRadius: "50%", background: "#fff" }} />
                  </div>
                  Generate Automatically
                </label>
              </div>
            </div>

            {/* Description / Agenda */}
            <div>
              <p style={{ margin: "0 0 8px", fontSize: 13, fontWeight: 600, color: "rgba(255,255,255,0.7)" }}>Meeting agenda</p>
              <textarea
                {...register("description")}
                placeholder="Add meeting agenda..."
                rows={2}
                style={{
                  background: "var(--z-bg)",
                  border: "1px solid rgba(255,255,255,0.15)",
                  borderRadius: 6,
                  padding: "8px 14px",
                  color: "#fff",
                  fontSize: 13,
                  fontFamily: "var(--font-sans)",
                  outline: "none",
                  width: "100%",
                  resize: "vertical",
                }}
              />
            </div>

            {/* Host name */}
            <div>
              <p style={{ margin: "0 0 8px", fontSize: 13, fontWeight: 600, color: "rgba(255,255,255,0.7)" }}>Your Name</p>
              <input
                {...register("host_name")}
                placeholder="e.g. Rohan R"
                style={{
                  background: "var(--z-bg)",
                  border: errors.host_name ? "2px solid #e5484d" : "1px solid rgba(255,255,255,0.15)",
                  borderRadius: 6,
                  padding: "8px 14px",
                  color: "#fff",
                  fontSize: 13,
                  fontFamily: "var(--font-sans)",
                  outline: "none",
                  width: "100%",
                }}
              />
            </div>
          </div>

          {/* Footer */}
          <div
            style={{
              display: "flex",
              justifyContent: "flex-end",
              alignItems: "center",
              gap: 10,
              padding: "14px 20px",
              borderTop: "1px solid rgba(255,255,255,0.08)",
            }}
          >
            <button
              type="button"
              onClick={onClose}
              style={{
                padding: "8px 20px",
                borderRadius: 6,
                background: "none",
                border: "1px solid rgba(255,255,255,0.2)",
                color: "rgba(255,255,255,0.6)",
                fontSize: 14,
                cursor: "pointer",
                fontFamily: "var(--font-sans)",
              }}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              style={{
                padding: "8px 28px",
                borderRadius: 6,
                background: "var(--z-blue)",
                border: "none",
                color: "#fff",
                fontSize: 14,
                fontWeight: 600,
                cursor: "pointer",
                fontFamily: "var(--font-sans)",
                display: "flex",
                alignItems: "center",
                gap: 6,
                opacity: loading ? 0.7 : 1,
              }}
            >
              {loading && <Loader2 size={14} className="animate-spin" />}
              Save
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
