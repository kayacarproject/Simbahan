import { create } from "zustand";
import AsyncStorage from "@react-native-async-storage/async-storage";
import membersData from "../data/members.json";
import { apiLogout } from "../services/authService";

type Member = (typeof membersData)[number];

type AuthState = {
  currentUser: Member | null;
  isOnboarded: boolean;
  isAuthenticated: boolean;
  isHydrated: boolean;
  planExpiry: string | null;
  login: (memberId?: string) => Promise<void>;
  logout: () => Promise<void>;
  setOnboarded: () => Promise<void>;
  setPlan: (expiryDate: string) => Promise<void>;
  isPlanActive: () => boolean;
  hydrate: () => Promise<void>;
};

const DEMO_USER = membersData[0];
const KEY_AUTH = "@simbahan_auth";
const KEY_WELCOME = "@simbahan_welcome"; // only set by setOnboarded(), never by login()
const KEY_PLAN = "@simbahan_plan_expiry";

export const useAuthStore = create<AuthState>((set, get) => ({
  currentUser: null,
  isOnboarded: false,
  isAuthenticated: false,
  isHydrated: false,
  planExpiry: null,

  login: async (memberId) => {
    const user = memberId
      ? (membersData.find((m) => m.id === memberId) ?? DEMO_USER)
      : DEMO_USER;
    await AsyncStorage.setItem(KEY_AUTH, JSON.stringify({ userId: user.id }));
    // NOTE: intentionally does NOT set KEY_WELCOME here
    set({ currentUser: user, isAuthenticated: true });
  },

  logout: async () => {
    await Promise.all([AsyncStorage.multiRemove([KEY_AUTH, KEY_PLAN]), apiLogout()]);
    const welcomed = await AsyncStorage.getItem(KEY_WELCOME);
    set({
      currentUser: null,
      isAuthenticated: false,
      planExpiry: null,
      isOnboarded: welcomed === "true",
    });
  },

  setOnboarded: async () => {
    await AsyncStorage.setItem(KEY_WELCOME, "true");
    set({ isOnboarded: true });
  },

  setPlan: async (expiryDate) => {
    await AsyncStorage.setItem(KEY_PLAN, expiryDate);
    set({ planExpiry: expiryDate });
  },

  isPlanActive: () => {
    const { planExpiry } = get();
    if (!planExpiry) return false;
    return new Date(planExpiry) > new Date();
  },

  hydrate: async () => {
    const [authRaw, welcomed, planExpiry] = await Promise.all([
      AsyncStorage.getItem(KEY_AUTH),
      AsyncStorage.getItem(KEY_WELCOME),
      AsyncStorage.getItem(KEY_PLAN),
    ]);

    if (authRaw) {
      try {
        const parsed = JSON.parse(authRaw);
        const userId =
          typeof parsed === "object" &&
          parsed !== null &&
          typeof parsed.userId === "string"
            ? parsed.userId
            : null;
        const user = userId
          ? (membersData.find((m) => m.id === userId) ?? DEMO_USER)
          : DEMO_USER;
        set({
          currentUser: user,
          isAuthenticated: true,
          isOnboarded: true, // logged-in users always skip welcome
          isHydrated: true,
          planExpiry: planExpiry ?? null,
        });
      } catch {
        // Corrupted auth data — treat as logged out
        await AsyncStorage.removeItem(KEY_AUTH);
        set({
          currentUser: null,
          isAuthenticated: false,
          isOnboarded: welcomed === "true",
          isHydrated: true,
          planExpiry: null,
        });
      }
    } else {
      set({
        currentUser: null,
        isAuthenticated: false,
        isOnboarded: welcomed === "true", // false on fresh install
        isHydrated: true,
        planExpiry: planExpiry ?? null,
      });
    }
  },
}));
