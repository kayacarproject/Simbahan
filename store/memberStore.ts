import { create } from 'zustand';
import membersData from '../data/members.json';
import familiesData from '../data/families.json';
import novenasData from '../data/novenas.json';
import sacramentRequestsData from '../data/sacramentRequests.json';

type Member = typeof membersData[number];
type Family = typeof familiesData[number];
type Novena = typeof novenasData[number];
type SacramentRequest = typeof sacramentRequestsData[number];

type MemberState = {
  members: Member[];
  families: Family[];
  novenas: Novena[];
  sacramentRequests: SacramentRequest[];
  submitSacramentRequest: (request: SacramentRequest) => void;
};

export const useMemberStore = create<MemberState>((set, get) => ({
  members: membersData,
  families: familiesData,
  novenas: novenasData,
  sacramentRequests: sacramentRequestsData,

  submitSacramentRequest: (request) =>
    set({ sacramentRequests: [request, ...get().sacramentRequests] }),
}));
