"use client";

import React, { createContext, useContext, useEffect, useState, useCallback } from "react";
import { StudentProfile } from "@/lib/types";
import { useAuth } from "@/lib/auth-context";

const DEMO_PROFILE_KEY = "scholarlens-profile";

function getDefaultProfile(uid: string): StudentProfile {
  return {
    uid,
    course: null,
    year: null,
    state: null,
    institutionType: null,
    institutionName: null,
    institutionOwnership: null,
    percentage: null,
    incomeRange: null,
    casteCategory: null,
    gender: null,
    disabilityStatus: null,
    minorityStatus: null,
    isSingleGirlChild: null,
    isKashmirMigrant: null,
    completedSteps: [],
    profileComplete: false,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
}

function calculateReadiness(profile: StudentProfile): number {
  const fields = [
    { key: "course", weight: 2 },
    { key: "year", weight: 1.5 },
    { key: "state", weight: 1.5 },
    { key: "percentage", weight: 1.5 },
    { key: "incomeRange", weight: 2 },
    { key: "institutionType", weight: 1 },
    { key: "casteCategory", weight: 1 },
    { key: "gender", weight: 0.5 },
  ];

  let filled = 0;
  let total = 0;
  for (const f of fields) {
    total += f.weight;
    if ((profile as unknown as Record<string, unknown>)[f.key] !== null) {
      filled += f.weight;
    }
  }
  return Math.round((filled / total) * 100);
}

interface ProfileContextType {
  profile: StudentProfile | null;
  loading: boolean;
  updateProfile: (updates: Partial<StudentProfile>) => void;
  readiness: number;
  isComplete: boolean;
}

const ProfileContext = createContext<ProfileContextType>({
  profile: null,
  loading: true,
  updateProfile: () => {},
  readiness: 0,
  isComplete: false,
});

export function ProfileProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const [profile, setProfile] = useState<StudentProfile | null>(null);
  const [loading, setLoading] = useState(true);

  // Load profile from localStorage
  useEffect(() => {
    if (!user) {
      setProfile(null);
      setLoading(false);
      return;
    }

    const uid = user.uid;
    try {
      const stored = localStorage.getItem(DEMO_PROFILE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored) as StudentProfile;
        if (parsed.uid === uid) {
          setProfile(parsed);
          setLoading(false);
          return;
        }
      }
    } catch {
      // Ignore parse errors
    }

    // Create new profile
    const newProfile = getDefaultProfile(uid);
    localStorage.setItem(DEMO_PROFILE_KEY, JSON.stringify(newProfile));
    setProfile(newProfile);
    setLoading(false);
  }, [user]);

  const updateProfile = useCallback(
    (updates: Partial<StudentProfile>) => {
      if (!user || !profile) return;

      const updated: StudentProfile = {
        ...profile,
        ...updates,
        uid: user.uid,
        updatedAt: new Date().toISOString(),
      };

      // Check if profile is now complete enough
      const readiness = calculateReadiness(updated);
      updated.profileComplete = readiness >= 70;

      setProfile(updated);
      localStorage.setItem(DEMO_PROFILE_KEY, JSON.stringify(updated));
    },
    [user, profile]
  );

  const readiness = profile ? calculateReadiness(profile) : 0;
  const isComplete = readiness >= 70;

  return (
    <ProfileContext.Provider
      value={{ profile, loading, updateProfile, readiness, isComplete }}
    >
      {children}
    </ProfileContext.Provider>
  );
}

export function useProfile() {
  return useContext(ProfileContext);
}
