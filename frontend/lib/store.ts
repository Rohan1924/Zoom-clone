import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { Meeting } from "./types";
import { getUpcomingMeetings, getRecentMeetings } from "./api";

interface AppState {
  // ── Auth ─────────────────────────────────────────────────────
  isAuthenticated: boolean;
  displayName: string;
  userEmail: string;
  userAvatar: string; // initials
  login: (name: string, email: string) => void;
  logout: () => void;
  setDisplayName: (name: string) => void;

  // ── Dashboard meeting lists ───────────────────────────────────
  upcomingMeetings: Meeting[];
  recentMeetings: Meeting[];
  meetingsLoading: boolean;
  fetchMeetings: () => Promise<void>;

  // ── Host Tracking ─────────────────────────────────────────────
  hostedMeetings: string[];
  addHostedMeeting: (meetingId: string) => void;
}

export const useStore = create<AppState>()(
  persist(
    (set) => ({
      // Auth defaults
      isAuthenticated: false,
      displayName: "",
      userEmail: "",
      userAvatar: "GU",

      login: (name, email) => {
        const initials = name
          .split(" ")
          .map((w) => w[0])
          .join("")
          .slice(0, 2)
          .toUpperCase();
        set({
          isAuthenticated: true,
          displayName: name,
          userEmail: email,
          userAvatar: initials,
        });
      },

      logout: () =>
        set({
          isAuthenticated: false,
          displayName: "",
          userEmail: "",
          userAvatar: "GU",
        }),

      setDisplayName: (name) => set({ displayName: name }),

      // Meeting lists
      upcomingMeetings: [],
      recentMeetings: [],
      meetingsLoading: false,

      fetchMeetings: async () => {
        set({ meetingsLoading: true });
        try {
          const [u, r] = await Promise.all([getUpcomingMeetings(), getRecentMeetings()]);
          set({ upcomingMeetings: u, recentMeetings: r });
        } catch {
          // ignore error for now
        } finally {
          set({ meetingsLoading: false });
        }
      },

      hostedMeetings: [],
      addHostedMeeting: (meetingId) =>
        set((state) => ({
          hostedMeetings: [...state.hostedMeetings, meetingId],
        })),
    }),
    {
      name: "zoomclone-storage",
      partialize: (state) => ({
        isAuthenticated: state.isAuthenticated,
        displayName: state.displayName,
        userEmail: state.userEmail,
        userAvatar: state.userAvatar,
      }),
    }
  )
);
