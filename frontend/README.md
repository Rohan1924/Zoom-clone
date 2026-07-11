# ZoomClone — Frontend (Next.js)

A pixel-faithful Zoom clone built with Next.js, featuring instant meetings, scheduling, joining, and a live webcam meeting room.

## Tech Stack

| Layer | Technology | Why |
|---|---|---|
| Framework | Next.js 15 (App Router) + TypeScript | Assignment requirement; SSR + client components |
| Styling | Tailwind CSS + CSS custom properties | Rapid UI matching Zoom's design language |
| State | Zustand (with localStorage persistence) | Lightweight, no boilerplate vs Redux |
| API Client | Axios | Cleaner interceptors/error handling than fetch |
| Forms | React Hook Form + Zod | Type-safe validation, great UX (inline errors) |
| Icons | Lucide React | Closest icon set to Zoom's iconography |
| Notifications | react-hot-toast | Non-intrusive, styled toast feedback |
| Media | Browser `getUserMedia` API | Local webcam preview — no WebRTC server needed |

## Features

### Dashboard
- Sticky navbar with logo and profile avatar
- Live clock (current time + date)
- **New Meeting** — creates instant meeting on backend, redirects to room
- **Join** — validates meeting ID against backend, enters room
- **Schedule** — form with title, description, date/time, duration (Zod-validated)
- Upcoming meetings list (fetched from backend, auto-refreshes after scheduling)
- Recent meetings list with status badges

### Meeting Room (`/meeting/[meetingId]`)
- **Join prompt** — shown when landing on a direct invite link (asks for display name)
- **Meeting Not Found** — shown for invalid IDs
- **Live webcam** via `navigator.mediaDevices.getUserMedia` with mirror flip
- Avatar fallback when camera is off or permission denied
- **Participants sidebar** — polls backend every 5s, shows host crown badge
- **Bottom toolbar:** Mic toggle, Camera toggle (actually stops the track), Copy invite link, Leave
- Meeting ID displayed in the toolbar

## Project Structure

```
frontend/
├── app/
│   ├── layout.tsx                  # Root layout + toast provider
│   ├── globals.css                 # Design tokens + utility classes
│   ├── page.tsx                    # Dashboard page
│   └── meeting/[meetingId]/
│       └── page.tsx                # Meeting room page
├── components/
│   ├── Navbar.tsx
│   ├── Modal.tsx                   # Reusable accessible modal
│   ├── MeetingCard.tsx             # Card with status badge + join button
│   ├── NewMeetingModal.tsx
│   ├── JoinMeetingModal.tsx
│   ├── ScheduleMeetingModal.tsx
│   ├── VideoTile.tsx               # Webcam preview with overlays
│   ├── ParticipantsSidebar.tsx
│   └── BottomToolbar.tsx
├── hooks/
│   └── useWebcam.ts                # getUserMedia + mic/camera toggle hook
└── lib/
    ├── types.ts                    # TypeScript types (mirrors backend Pydantic schemas)
    ├── api.ts                      # Axios service layer (one function per endpoint)
    └── store.ts                    # Zustand store (displayName + meetings)
```

## Local Setup

```bash
# 1. Install dependencies
npm install

# 2. Configure backend URL (already set for local dev)
# .env.local contains: NEXT_PUBLIC_API_URL=http://localhost:8000

# 3. Start dev server
npm run dev
```

Open: http://localhost:3000

> **Note:** The backend must be running on port 8000. See backend README for setup.

## Environment Variables

| Variable | Default | Description |
|---|---|---|
| `NEXT_PUBLIC_API_URL` | `http://localhost:8000` | FastAPI backend base URL |

## Assumptions

- No login required — user identity is a display name stored in localStorage (per assignment spec: "Assume a default user is logged in")
- Meeting room video is local webcam only (no multi-party WebRTC); the assignment does not require live video calls
- `invite_link` is computed by the backend using `FRONTEND_URL` env var (default: `http://localhost:3000`)
