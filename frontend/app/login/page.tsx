"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Video, Mail, User, Eye, EyeOff, Loader2 } from "lucide-react";
import { useStore } from "@/lib/store";

export default function LoginPage() {
  const router = useRouter();
  const { isAuthenticated, login } = useStore();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [guestLoading, setGuestLoading] = useState(false);
  const [error, setError] = useState("");
  const [tab, setTab] = useState<"signin" | "signup">("signin");

  const [mounted, setMounted] = useState(false);
  useEffect(() => { setMounted(true); }, []);

  // Already logged in → redirect to dashboard
  useEffect(() => {
    if (mounted && isAuthenticated) router.replace("/");
  }, [mounted, isAuthenticated, router]);

  if (!mounted) return null; // Avoid hydration mismatch on initial render

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!email.trim()) { setError("Email is required"); return; }
    if (!email.includes("@")) { setError("Enter a valid email"); return; }
    if (!password) { setError("Password is required"); return; }
    if (tab === "signup" && !name.trim()) { setError("Full name is required"); return; }
    if (password.length < 6) { setError("Password must be at least 6 characters"); return; }

    setLoading(true);
    await new Promise((r) => setTimeout(r, 600));

    const CREDS_KEY = "zoomclone-credentials";

    if (tab === "signup") {
      // Store credentials keyed by email
      const existing: Record<string, { name: string; password: string }> =
        JSON.parse(localStorage.getItem(CREDS_KEY) || "{}");
      if (existing[email.toLowerCase()]) {
        setError("An account with this email already exists. Please sign in.");
        setLoading(false);
        return;
      }
      existing[email.toLowerCase()] = { name: name.trim(), password };
      localStorage.setItem(CREDS_KEY, JSON.stringify(existing));
      login(name.trim(), email.trim());
    } else {
      // Validate against stored credentials
      const existing: Record<string, { name: string; password: string }> =
        JSON.parse(localStorage.getItem(CREDS_KEY) || "{}");
      const record = existing[email.toLowerCase()];
      if (!record) {
        setError("No account found. Please sign up first.");
        setLoading(false);
        return;
      }
      if (record.password !== password) {
        setError("Incorrect password. Please try again.");
        setLoading(false);
        return;
      }
      login(record.name, email.trim());
    }
    router.replace("/");
  };


  const handleGuestContinue = async () => {
    setGuestLoading(true);
    // Generate a unique guest name
    const guestNumber = Math.floor(1000 + Math.random() * 9000);
    const guestName = `Guest ${guestNumber}`;
    await new Promise((r) => setTimeout(r, 400));
    login(guestName, `guest${guestNumber}@guest.local`);
    router.replace("/");
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "#111216",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: 24,
        fontFamily: "var(--font-sans)",
      }}
    >
      <div
        style={{
          width: "100%",
          maxWidth: 400,
          display: "flex",
          flexDirection: "column",
          gap: 28,
        }}
      >
        {/* Logo */}
        <div style={{ textAlign: "center" }}>
          <div
            style={{
              width: 56,
              height: 56,
              borderRadius: 14,
              background: "linear-gradient(135deg, #1a6fe0 0%, #0f4ba8 100%)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              margin: "0 auto 14px",
              boxShadow: "0 8px 24px rgba(26,111,224,0.4)",
            }}
          >
            <Video size={28} color="#fff" />
          </div>
          <h1 style={{ margin: 0, fontSize: 24, fontWeight: 700, color: "#fff" }}>
            Sign in to ZoomClone
          </h1>
          <p style={{ margin: "6px 0 0", fontSize: 14, color: "rgba(255,255,255,0.45)" }}>
            {tab === "signin" ? "Welcome back!" : "Create your account to get started"}
          </p>
        </div>

        {/* Card */}
        <div
          style={{
            background: "#1e1e22",
            border: "1px solid rgba(255,255,255,0.1)",
            borderRadius: 14,
            padding: "28px 28px",
            boxShadow: "0 16px 48px rgba(0,0,0,0.5)",
          }}
        >
          {/* Tabs */}
          <div
            style={{
              display: "flex",
              background: "#141418",
              borderRadius: 8,
              padding: 3,
              marginBottom: 24,
            }}
          >
            {(["signin", "signup"] as const).map((t) => (
              <button
                key={t}
                onClick={() => { setTab(t); setError(""); }}
                style={{
                  flex: 1,
                  padding: "8px 0",
                  borderRadius: 6,
                  border: "none",
                  background: tab === t ? "#2a2a30" : "transparent",
                  color: tab === t ? "#fff" : "rgba(255,255,255,0.4)",
                  fontSize: 13,
                  fontWeight: tab === t ? 600 : 400,
                  cursor: "pointer",
                  fontFamily: "var(--font-sans)",
                  transition: "all 0.15s",
                }}
              >
                {t === "signin" ? "Sign In" : "Sign Up"}
              </button>
            ))}
          </div>

          <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            {/* Full name — signup only */}
            {tab === "signup" && (
              <div>
                <label style={{ display: "block", fontSize: 12, fontWeight: 500, color: "rgba(255,255,255,0.55)", marginBottom: 6 }}>
                  Full Name
                </label>
                <div style={{ position: "relative" }}>
                  <User size={15} color="rgba(255,255,255,0.3)" style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)" }} />
                  <input
                    type="text"
                    placeholder="Rohan Rupesh"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    autoFocus={tab === "signup"}
                    style={{
                      width: "100%",
                      padding: "10px 14px 10px 38px",
                      background: "#111216",
                      border: "1px solid rgba(255,255,255,0.12)",
                      borderRadius: 8,
                      color: "#fff",
                      fontSize: 14,
                      fontFamily: "var(--font-sans)",
                      outline: "none",
                      boxSizing: "border-box",
                    }}
                    onFocus={e => (e.target.style.borderColor = "#1a6fe0")}
                    onBlur={e => (e.target.style.borderColor = "rgba(255,255,255,0.12)")}
                  />
                </div>
              </div>
            )}

            {/* Email */}
            <div>
              <label style={{ display: "block", fontSize: 12, fontWeight: 500, color: "rgba(255,255,255,0.55)", marginBottom: 6 }}>
                Email Address
              </label>
              <div style={{ position: "relative" }}>
                <Mail size={15} color="rgba(255,255,255,0.3)" style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)" }} />
                <input
                  type="email"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  autoFocus={tab === "signin"}
                  style={{
                    width: "100%",
                    padding: "10px 14px 10px 38px",
                    background: "#111216",
                    border: "1px solid rgba(255,255,255,0.12)",
                    borderRadius: 8,
                    color: "#fff",
                    fontSize: 14,
                    fontFamily: "var(--font-sans)",
                    outline: "none",
                    boxSizing: "border-box",
                  }}
                  onFocus={e => (e.target.style.borderColor = "#1a6fe0")}
                  onBlur={e => (e.target.style.borderColor = "rgba(255,255,255,0.12)")}
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <label style={{ display: "block", fontSize: 12, fontWeight: 500, color: "rgba(255,255,255,0.55)", marginBottom: 6 }}>
                Password
              </label>
              <div style={{ position: "relative" }}>
                <input
                  type={showPassword ? "text" : "password"}
                  placeholder={tab === "signup" ? "At least 6 characters" : "••••••••"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  style={{
                    width: "100%",
                    padding: "10px 40px 10px 14px",
                    background: "#111216",
                    border: "1px solid rgba(255,255,255,0.12)",
                    borderRadius: 8,
                    color: "#fff",
                    fontSize: 14,
                    fontFamily: "var(--font-sans)",
                    outline: "none",
                    boxSizing: "border-box",
                  }}
                  onFocus={e => (e.target.style.borderColor = "#1a6fe0")}
                  onBlur={e => (e.target.style.borderColor = "rgba(255,255,255,0.12)")}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(p => !p)}
                  style={{
                    position: "absolute", right: 12, top: "50%", transform: "translateY(-50%)",
                    background: "none", border: "none", cursor: "pointer",
                    color: "rgba(255,255,255,0.35)", padding: 0, display: "flex",
                  }}
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            {/* Error */}
            {error && (
              <p style={{ margin: 0, fontSize: 12, color: "#ff8a8d", background: "rgba(229,72,77,0.1)", border: "1px solid rgba(229,72,77,0.3)", borderRadius: 6, padding: "8px 12px" }}>
                {error}
              </p>
            )}

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              style={{
                marginTop: 4,
                width: "100%",
                padding: "12px",
                borderRadius: 8,
                background: "#1a6fe0",
                border: "none",
                color: "#fff",
                fontSize: 15,
                fontWeight: 600,
                cursor: loading ? "not-allowed" : "pointer",
                fontFamily: "var(--font-sans)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: 8,
                opacity: loading ? 0.7 : 1,
                transition: "background 0.15s",
              }}
              onMouseEnter={e => { if (!loading) (e.currentTarget as HTMLButtonElement).style.background = "#1560c8"; }}
              onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.background = "#1a6fe0"; }}
            >
              {loading && <Loader2 size={16} className="animate-spin" />}
              {tab === "signin" ? "Sign In" : "Create Account"}
            </button>
          </form>

          {/* Divider */}
          <div style={{ display: "flex", alignItems: "center", gap: 12, margin: "20px 0" }}>
            <div style={{ flex: 1, height: 1, background: "rgba(255,255,255,0.08)" }} />
            <span style={{ fontSize: 12, color: "rgba(255,255,255,0.25)" }}>or</span>
            <div style={{ flex: 1, height: 1, background: "rgba(255,255,255,0.08)" }} />
          </div>

          {/* Google SSO (decorative) */}
          <button
            type="button"
            style={{
              width: "100%",
              padding: "10px",
              borderRadius: 8,
              background: "transparent",
              border: "1px solid rgba(255,255,255,0.15)",
              color: "rgba(255,255,255,0.7)",
              fontSize: 14,
              fontWeight: 500,
              cursor: "pointer",
              fontFamily: "var(--font-sans)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: 10,
            }}
          >
            {/* Google logo */}
            <svg width="18" height="18" viewBox="0 0 48 48">
              <path fill="#FFC107" d="M43.6 20H24v8h11.3C33.6 32.9 29.3 36 24 36c-6.6 0-12-5.4-12-12s5.4-12 12-12c2.8 0 5.4 1 7.4 2.6L37 9C33.5 5.9 29 4 24 4 12.9 4 4 12.9 4 24s8.9 20 20 20c11 0 19.7-8 19.7-20 0-1.3-.1-2.7-.1-4z"/>
              <path fill="#FF3D00" d="M6.3 14.7l6.6 4.8C14.7 16.1 19 13 24 13c2.8 0 5.4 1 7.4 2.6L37 9C33.5 5.9 29 4 24 4 16.3 4 9.7 8.3 6.3 14.7z"/>
              <path fill="#4CAF50" d="M24 44c5 0 9.5-1.8 12.9-4.8l-6-5.2C29.2 35.6 26.7 36 24 36c-5.2 0-9.5-3-11.3-7.3L6 33.3C9.3 39.6 16.1 44 24 44z"/>
              <path fill="#1976D2" d="M43.6 20H24v8h11.3c-.8 2.3-2.3 4.3-4.3 5.8l6 5.2C40.8 35.5 44 30.2 44 24c0-1.3-.1-2.7-.4-4z"/>
            </svg>
            Continue with Google
          </button>

          {/* Divider */}
          <div style={{ display: "flex", alignItems: "center", gap: 12, margin: "16px 0 4px" }}>
            <div style={{ flex: 1, height: 1, background: "rgba(255,255,255,0.08)" }} />
            <span style={{ fontSize: 12, color: "rgba(255,255,255,0.25)" }}>or</span>
            <div style={{ flex: 1, height: 1, background: "rgba(255,255,255,0.08)" }} />
          </div>

          {/* Guest — Continue without login */}
          <button
            type="button"
            onClick={handleGuestContinue}
            disabled={guestLoading}
            style={{
              width: "100%",
              padding: "10px",
              borderRadius: 8,
              background: "transparent",
              border: "none",
              color: "rgba(255,255,255,0.45)",
              fontSize: 13,
              cursor: guestLoading ? "not-allowed" : "pointer",
              fontFamily: "var(--font-sans)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: 6,
              transition: "color 0.15s",
            }}
            onMouseEnter={e => (e.currentTarget.style.color = "rgba(255,255,255,0.75)")}
            onMouseLeave={e => (e.currentTarget.style.color = "rgba(255,255,255,0.45)")}
          >
            {guestLoading ? <Loader2 size={14} className="animate-spin" /> : null}
            Continue without signing in →
          </button>
        </div>

        <p style={{ textAlign: "center", fontSize: 12, color: "rgba(255,255,255,0.25)", margin: 0 }}>
          By signing in, you agree to our Terms of Service and Privacy Policy
        </p>
      </div>
    </div>
  );
}
