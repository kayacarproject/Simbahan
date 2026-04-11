import { create } from 'zustand';
import sacramentRequestsData from '../data/sacramentRequests.json';

export type SacramentType = 'baptism' | 'marriage' | 'confirmation' | 'anointing' | 'funeral' | 'other';
export type RequestStatus = 'submitted' | 'pending' | 'approved' | 'confirmed';

export type SacramentRequest = {
  id: string;
  type: SacramentType;
  memberId: string;
  memberName: string;
  status: RequestStatus;
  preferredDate: string;
  notes: string;
  submittedAt: string;
  updatedAt: string;
  // dynamic fields
  childName?: string;
  parentNames?: string;
  spouseName?: string;
  patientName?: string;
  location?: string;
  urgency?: string;
  deceasedName?: string;
  contact?: string;
};

type NovenaProgress = {
  novenaId: string;
  completedDays: number[];
  startedAt: string;
};

type SimbangGabiState = {
  attendedDays: number[]; // 1–9
};

type Module09State = {
  novenaProgress: NovenaProgress[];
  sacramentRequests: SacramentRequest[];
  simbangGabi: SimbangGabiState;

  markPrayed: (novenaId: string, day: number) => void;
  submitSacramentRequest: (req: SacramentRequest) => void;
  checkInSimbangGabi: (day: number) => void;
};

const seedRequests = sacramentRequestsData.map((r) => ({
  ...r,
  status: r.status as RequestStatus,
  type: r.type as SacramentType,
}));

export const useModule09Store = create<Module09State>((set, get) => ({
  novenaProgress: [],
  sacramentRequests: seedRequests,
  simbangGabi: { attendedDays: [] },

  markPrayed: (novenaId, day) => {
    const existing = get().novenaProgress.find((p) => p.novenaId === novenaId);
    if (existing) {
      if (existing.completedDays.includes(day)) return;
      set({
        novenaProgress: get().novenaProgress.map((p) =>
          p.novenaId === novenaId
            ? { ...p, completedDays: [...p.completedDays, day] }
            : p
        ),
      });
    } else {
      set({
        novenaProgress: [
          ...get().novenaProgress,
          { novenaId, completedDays: [day], startedAt: new Date().toISOString() },
        ],
      });
    }
  },

  submitSacramentRequest: (req) =>
    set({ sacramentRequests: [req, ...get().sacramentRequests] }),

  checkInSimbangGabi: (day) => {
    const { attendedDays } = get().simbangGabi;
    if (attendedDays.includes(day)) return;
    set({ simbangGabi: { attendedDays: [...attendedDays, day] } });
  },
}));
