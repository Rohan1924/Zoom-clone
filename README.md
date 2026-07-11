# Zoom Clone — Video Conferencing Platform

A full-stack, pixel-perfect clone of the Zoom web application, featuring instant meetings, scheduling, host controls, and guest authentication. Built as a Single Page Application (SPA) with Next.js and powered by a FastAPI backend using a SQLite database.

## 🚀 Live Demo
- **Frontend (Vercel)**: *(https://zoom-clone-rohan-sc.vercel.app/)*
- **Backend (Render)**: *(https://zoom-clone-nqi2.onrender.com)*

---

## 🛠 Technical Stack

### Frontend
- **Framework**: Next.js 15 (App Router, Single Page Application style)
- **Language**: TypeScript
- **State Management**: Zustand (for global state and auth)
- **Styling**: Tailwind CSS + Custom CSS properties (pixel-perfect Zoom UI)
- **Icons**: Lucide React
- **Media**: Native Browser `getUserMedia` API (Webcam/Mic simulation)

### Backend
- **Framework**: Python FastAPI
- **Database**: SQLite
- **ORM**: SQLAlchemy
- **Schema Management**: Auto-generation via SQLAlchemy `Base.metadata.create_all()`

---

## ✨ Features Implemented (All Must-Haves & Bonus)

1. **Landing Dashboard**
   - Clean, professional Zoom UI replication.
   - Interactive buttons for New Meeting, Join, and Schedule.
   - Live clock and dynamic Upcoming/Recent meeting lists.
2. **Instant Meeting Creation**
   - One-click instant meetings with unique 9-digit Meeting IDs.
   - Auto-generated shareable invite links.
3. **Join Meeting**
   - Join by pasting an ID or via direct URL link.
   - Validates if a meeting exists before entering.
4. **Schedule Meetings**
   - Full date & time picker with description and duration.
   - Synchronized seamlessly with the Upcoming Meetings dashboard.
5. **Bonus: User Authentication (Hybrid)**
   - Sign up / Sign in flow using `localStorage` to persist users.
   - **"Continue without signing in" (Guest Auth)** — automatically assigns a guest name and UUID to satisfy the "No Login Required" grading constraint while maintaining a personalized experience.
6. **Bonus: Host Controls**
   - The creator of a meeting receives a "Host tools" dashboard.
   - **Mute All**: Instantly flags all participants as muted in the backend.
   - **Remove**: Kicks participants out of the database session.
   - **Lock Meeting**: Prevents new users from joining.

---

## 🗄 Database Design (SQLite)

The database follows a clean, normalized relational structure using SQLAlchemy:

### 1. `meetings` Table
Stores the core data for scheduled and instant meetings.
- `id` (Integer, Primary Key)
- `meeting_id` (String, Unique) — *Formatted 9-digit string (e.g., "422-160-861")*
- `title` (String)
- `description` (String, nullable)
- `start_time` (DateTime)
- `duration` (Integer) — *Minutes*
- `host_id` (String) — *Matches the user who created it to grant host controls*

### 2. `participants` Table
Manages active users currently inside a meeting session.
- `id` (String, Primary Key) — *UUID*
- `meeting_id` (String, Foreign Key) — *References `meetings.meeting_id`*
- `display_name` (String)
- `joined_at` (DateTime)
- `is_host` (Boolean) — *True if the participant created the meeting*
- `is_muted` (Boolean) — *Toggled by the Host via the "Mute All" control*

---

## 🚦 Local Setup Instructions

### Prerequisites
- Node.js (v18+)
- Python (v3.10+)

### 1. Backend Setup
```bash
cd backend
python3 -m venv .venv
source .venv/bin/activate  # Or .venv\Scripts\activate on Windows
pip install -r requirements.txt

# Seed the database with sample data
python seed.py

# Start the FastAPI server
uvicorn main:app --reload --port 8000
```
*The backend will run on `http://localhost:8000`*

### 2. Frontend Setup
```bash
cd frontend
npm install

# Start the Next.js development server
npm run dev
```
*The frontend will run on `http://localhost:3000`*

---

## 🧠 Assumptions Made
1. **No active WebRTC Server**: Because a WebRTC signaling server (like Socket.io or LiveKit) is extremely complex and outside the scope of a standard Full-Stack CRUD assignment, the meeting room utilizes the browser's local `getUserMedia` API to turn on the local camera/microphone for visual fidelity, and polls the FastAPI backend to keep the Participants list and Host Controls (like "Muted" state) globally synchronized.
2. **Auth Persistence**: Because the assignment emphasized a "default logged-in state" but also listed "User Authentication" as a bonus feature, a hybrid approach was chosen. Users can create a real account or just click "Continue as Guest" to instantly access the dashboard without friction.
