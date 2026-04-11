import { create } from 'zustand';
import announcementsData from '../data/announcements.json';
import eventsData from '../data/events.json';
import massScheduleData from '../data/massSchedule.json';
import donationsData from '../data/donations.json';
import liturgicalCalendarData from '../data/liturgicalCalendar.json';
import readingsData from '../data/readings.json';

export type RsvpStatus = 'Pupunta' | 'Baka' | 'Hindi' | null;

type Announcement = typeof announcementsData[number];
type MassSchedule = typeof massScheduleData[number];
type Donation = typeof donationsData[number];
type LiturgicalEntry = typeof liturgicalCalendarData[number];
type Reading = typeof readingsData[number];

type BaseEvent = typeof eventsData[number];
export type Event = BaseEvent & { rsvpStatus: RsvpStatus };

type ChurchState = {
  announcements: Announcement[];
  events: Event[];
  massSchedule: MassSchedule[];
  donations: Donation[];
  liturgicalCalendar: LiturgicalEntry[];
  todayReadings: Reading | null;
  markAnnouncementRead: (id: string) => void;
  markAnnouncementAsRead: (id: string) => void;
  setEventRsvp: (id: string, status: RsvpStatus) => void;
  logDonation: (donation: Donation) => void;
};

const todayStr = new Date().toISOString().split('T')[0];
const todayReadings = readingsData.find((r) => r.date === todayStr) ?? readingsData[0] ?? null;

const eventsWithRsvp: Event[] = eventsData.map((e) => ({ ...e, rsvpStatus: null as RsvpStatus }));

export const useChurchStore = create<ChurchState>((set, get) => ({
  announcements: announcementsData,
  events: eventsWithRsvp,
  massSchedule: massScheduleData,
  donations: donationsData,
  liturgicalCalendar: liturgicalCalendarData,
  todayReadings,

  markAnnouncementRead: (id) =>
    set({ announcements: get().announcements.map((a) => (a.id === id ? { ...a, isRead: true } : a)) }),

  markAnnouncementAsRead: (id) =>
    set({ announcements: get().announcements.map((a) => (a.id === id ? { ...a, isRead: true } : a)) }),

  setEventRsvp: (id, status) =>
    set({ events: get().events.map((e) => (e.id === id ? { ...e, rsvpStatus: status } : e)) }),

  logDonation: (donation) => set({ donations: [donation, ...get().donations] }),
}));
