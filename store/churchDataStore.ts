import { create } from 'zustand';
import { getDataPublic } from '../services/ApiHandler';
import { getUserId } from '../services/authService';
import Api from '../services/Api';

export type ChurchData = {
  _id: string;
  name: string;
  patron: string;
  diocese: string;
  address: string;
  barangay: string;
  city: string;
  province: string;
  zipCode: string;
  phone: string;
  email: string;
  website: string;
  pastor: string;
  assistantPastor: string;
  officeHours: string;
  feastDay: string;
  founded: string;
  ministries: string;
  bankName: string;
  bankAccountName: string;
  bankAccountNumber: string;
  facebook: string;
  churchimg: string | null;
};

// Fallback so screens never crash before data loads
export const CHURCH_FALLBACK: ChurchData = {
  _id: '',
  name: 'Saint Joseph Parish Church',
  patron: 'Saint Joseph',
  diocese: '',
  address: '',
  barangay: '',
  city: '',
  province: '',
  zipCode: '',
  phone: '',
  email: '',
  website: '',
  pastor: '',
  assistantPastor: '',
  officeHours: '',
  feastDay: 'March 19',
  founded: '',
  ministries: '',
  bankName: '',
  bankAccountName: '',
  bankAccountNumber: '',
  facebook: '',
  churchimg: null,
};

type ChurchDataState = {
  church: ChurchData;
  loading: boolean;
  fetched: boolean;
  fetchChurch: () => Promise<void>;
};

export const useChurchDataStore = create<ChurchDataState>((set, get) => ({
  church:  CHURCH_FALLBACK,
  loading: false,
  fetched: false,

  fetchChurch: async () => {
    if (get().fetched) return; // only fetch once per session
    set({ loading: true });

    try {
      // Step 1 — get churchId from appuser
      const userId = await getUserId();
      const userRes = await getDataPublic({
        appName: Api.appName, moduleName: 'appuser',
        query: userId ? { _id: userId } : {},
        limit: 1, skip: 0, sortBy: 'createdAt', order: 'descending',
      });

      const churchId: string | null = userRes?.data?.[0]?.churchId ?? null;
      console.log('[CHURCH] churchId from appuser:', churchId);

      if (!churchId) {
        console.log('[CHURCH] No churchId found, using fallback');
        set({ loading: false, fetched: true });
        return;
      }

      // Step 2 — fetch church by _id
      const churchRes = await getDataPublic({
        appName: Api.appName, moduleName: 'church',
        query: { _id: churchId },
        limit: 1, skip: 0, sortBy: 'createdAt', order: 'descending',
      });

      if (churchRes?.success === true && churchRes.data?.length > 0) {
        console.log('[CHURCH] Response:', churchRes.data[0]);
        set({ church: churchRes.data[0], loading: false, fetched: true });
      } else {
        console.log('[CHURCH] No church data found');
        set({ loading: false, fetched: true });
      }
    } catch (e: any) {
      console.log('[CHURCH] Error:', e?.message);
      set({ loading: false, fetched: true });
    }
  },
}));
