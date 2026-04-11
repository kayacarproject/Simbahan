import { create } from 'zustand';

export type Dependent = {
  id: string;
  name: string;
  relationship: string;
  birthday: string;
  familyId: string;
};

type FamilyState = {
  dependents: Dependent[];
  addDependent: (dep: Dependent) => void;
};

export const useFamilyStore = create<FamilyState>((set, get) => ({
  dependents: [],
  addDependent: (dep) => set({ dependents: [dep, ...get().dependents] }),
}));
