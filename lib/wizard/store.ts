"use client";

import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import type {
  AgeRange,
  ArtStyle,
  Color,
  Genre,
  Theme,
  UploadedPhoto,
  WizardState,
} from "./types";
import { CONSENT_TEXT_VERSION } from "./types";

type WizardActions = {
  setStep: (n: number) => void;
  next: () => void;
  prev: () => void;
  setTheme: (v: Theme) => void;
  setGenre: (v: Genre) => void;
  setArtStyle: (v: ArtStyle) => void;
  setColor: (v: Color) => void;
  setAgeRange: (v: AgeRange) => void;
  setChildName: (v: string) => void;
  setDedication: (v: string) => void;
  addPhoto: (p: UploadedPhoto) => void;
  removePhoto: (fileKey: string) => void;
  acceptConsent: () => void;
  revokeConsent: () => void;
  reset: () => void;
};

const INITIAL: WizardState = {
  step: 1,
  theme: null,
  genre: null,
  artStyle: null,
  favoriteColor: null,
  ageRange: null,
  childName: "",
  dedication: "",
  photos: [],
  consentAcceptedAt: null,
  consentTextVersion: CONSENT_TEXT_VERSION,
};

export const useWizardStore = create<WizardState & WizardActions>()(
  persist(
    (set, get) => ({
      ...INITIAL,

      setStep: (n) => set({ step: Math.min(Math.max(n, 1), 7) }),
      next: () => set({ step: Math.min(get().step + 1, 7) }),
      prev: () => set({ step: Math.max(get().step - 1, 1) }),

      setTheme: (v) => set({ theme: v }),
      setGenre: (v) => set({ genre: v }),
      setArtStyle: (v) => set({ artStyle: v }),
      setColor: (v) => set({ favoriteColor: v }),
      setAgeRange: (v) => set({ ageRange: v }),
      setChildName: (v) => set({ childName: v }),
      setDedication: (v) => set({ dedication: v }),

      addPhoto: (p) =>
        set((s) => ({
          photos: s.photos.some((x) => x.fileKey === p.fileKey)
            ? s.photos
            : [...s.photos, p].slice(0, 4),
        })),
      removePhoto: (fileKey) =>
        set((s) => ({ photos: s.photos.filter((p) => p.fileKey !== fileKey) })),

      acceptConsent: () =>
        set({
          consentAcceptedAt: new Date().toISOString(),
          consentTextVersion: CONSENT_TEXT_VERSION,
        }),
      revokeConsent: () => set({ consentAcceptedAt: null }),

      reset: () => set({ ...INITIAL }),
    }),
    {
      name: "eraumavezeu-wizard",
      version: 1,
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        step: state.step,
        theme: state.theme,
        genre: state.genre,
        artStyle: state.artStyle,
        favoriteColor: state.favoriteColor,
        ageRange: state.ageRange,
        childName: state.childName,
        dedication: state.dedication,
        // store only fileKey + url — NEVER base64 (LGPD + localStorage quota)
        photos: state.photos.map((p) => ({
          fileKey: p.fileKey,
          url: p.url,
          name: p.name,
        })),
        consentAcceptedAt: state.consentAcceptedAt,
        consentTextVersion: state.consentTextVersion,
      }),
    },
  ),
);
