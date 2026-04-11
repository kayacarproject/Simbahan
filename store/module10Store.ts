import { create } from 'zustand';

export type NotifType = 'announcement' | 'event' | 'sacrament' | 'reading' | 'general';

export type Notification = {
  id: string;
  type: NotifType;
  title: string;
  body: string;
  time: string;
  isRead: boolean;
};

export type NotifSettings = {
  announcements: boolean;
  events: boolean;
  sacraments: boolean;
  dailyReadings: boolean;
  fastingReminders: boolean;
};

export type AppSettings = {
  language: 'Filipino' | 'English';
  textSize: 'Small' | 'Normal' | 'Large';
  directoryVisible: boolean;
  notif: NotifSettings;
};

export type ProfileEdits = {
  firstName?: string;
  lastName?: string;
  phone?: string;
  email?: string;
  barangay?: string;
  birthday?: string;
  civilStatus?: string;
  directoryVisible?: boolean;
};

const DEMO_NOTIFS: Notification[] = [
  { id: 'n1', type: 'announcement', title: 'Simbang Gabi Simula na!', body: 'Magsisimula na ang Simbang Gabi ngayong Disyembre 16 sa 4:30 AM.', time: '2 oras na ang nakalipas', isRead: false },
  { id: 'n2', type: 'event',        title: 'Parish Fiesta — Abril 19', body: 'Huwag palampasin ang taunang kapistahan ng ating parokya.', time: '1 araw na ang nakalipas', isRead: false },
  { id: 'n3', type: 'sacrament',    title: 'Kumpirmasyon ng Binyag', body: 'Ang inyong kahilingan sa binyag ay naaprubahan na.', time: '3 araw na ang nakalipas', isRead: true },
  { id: 'n4', type: 'reading',      title: 'Pang-araw-araw na Pagbasa', body: 'Juan 3:16 — Sapagkat gayon na lamang ang pagmamahal ng Diyos sa sanlibutan...', time: '5 araw na ang nakalipas', isRead: true },
  { id: 'n5', type: 'general',      title: 'Bagong Anunsyo', body: 'Ang opisina ng parokya ay sarado ngayong Lunes.', time: '1 linggo na ang nakalipas', isRead: true },
];

type Module10State = {
  notifications: Notification[];
  settings: AppSettings;
  profileEdits: ProfileEdits;
  markNotifRead: (id: string) => void;
  markAllRead: () => void;
  updateSettings: (patch: Partial<AppSettings>) => void;
  updateNotifSettings: (patch: Partial<NotifSettings>) => void;
  saveProfileEdits: (edits: ProfileEdits) => void;
};

export const useModule10Store = create<Module10State>((set, get) => ({
  notifications: DEMO_NOTIFS,
  settings: {
    language: 'Filipino',
    textSize: 'Normal',
    directoryVisible: true,
    notif: { announcements: true, events: true, sacraments: true, dailyReadings: true, fastingReminders: false },
  },
  profileEdits: {},

  markNotifRead: (id) =>
    set({ notifications: get().notifications.map((n) => n.id === id ? { ...n, isRead: true } : n) }),

  markAllRead: () =>
    set({ notifications: get().notifications.map((n) => ({ ...n, isRead: true })) }),

  updateSettings: (patch) =>
    set({ settings: { ...get().settings, ...patch } }),

  updateNotifSettings: (patch) =>
    set({ settings: { ...get().settings, notif: { ...get().settings.notif, ...patch } } }),

  saveProfileEdits: (edits) =>
    set({ profileEdits: { ...get().profileEdits, ...edits } }),
}));
