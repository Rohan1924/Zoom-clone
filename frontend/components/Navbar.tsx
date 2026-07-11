"use client";

import { Video, Settings, Bell } from "lucide-react";

export default function Navbar() {
  return (
    <header
      style={{
        background: "var(--color-surface)",
        borderBottom: "1px solid var(--color-border)",
        position: "sticky",
        top: 0,
        zIndex: 50,
      }}
    >
      <div
        style={{
          maxWidth: 1200,
          margin: "0 auto",
          padding: "0 24px",
          height: 64,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        {/* Logo */}
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div
            style={{
              width: 36,
              height: 36,
              borderRadius: 10,
              background: "var(--color-primary)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <Video size={18} color="#fff" />
          </div>
          <span
            style={{
              fontWeight: 700,
              fontSize: 18,
              color: "var(--color-text)",
              letterSpacing: "-0.3px",
            }}
          >
            ZoomClone
          </span>
        </div>

        {/* Right side: settings + notifications + avatar */}
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          {/* Bell */}
          <button
            title="Notifications"
            style={{
              width: 36,
              height: 36,
              borderRadius: 8,
              background: "transparent",
              border: "1px solid var(--color-border)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              cursor: "pointer",
              color: "var(--color-text-muted)",
              transition: "background 0.15s",
            }}
            onMouseEnter={(e) =>
              ((e.currentTarget as HTMLButtonElement).style.background =
                "var(--color-surface-2)")
            }
            onMouseLeave={(e) =>
              ((e.currentTarget as HTMLButtonElement).style.background =
                "transparent")
            }
          >
            <Bell size={16} />
          </button>

          {/* Settings */}
          <button
            title="Settings"
            style={{
              width: 36,
              height: 36,
              borderRadius: 8,
              background: "transparent",
              border: "1px solid var(--color-border)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              cursor: "pointer",
              color: "var(--color-text-muted)",
              transition: "background 0.15s",
            }}
            onMouseEnter={(e) =>
              ((e.currentTarget as HTMLButtonElement).style.background =
                "var(--color-surface-2)")
            }
            onMouseLeave={(e) =>
              ((e.currentTarget as HTMLButtonElement).style.background =
                "transparent")
            }
          >
            <Settings size={16} />
          </button>

          {/* Avatar */}
          <div
            title="Guest User"
            style={{
              width: 36,
              height: 36,
              borderRadius: "50%",
              background: "linear-gradient(135deg, #2f5fff 0%, #7c3aed 100%)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "#fff",
              fontWeight: 700,
              fontSize: 13,
              cursor: "pointer",
              userSelect: "none",
              marginLeft: 4,
            }}
          >
            GU
          </div>
        </div>
      </div>
    </header>
  );
}
