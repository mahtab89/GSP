import AsyncStorage from "@react-native-async-storage/async-storage";

import type { StudentProfile } from "../models/profile";

const PROFILE_KEY = "@gsp/profile";

interface CachedProfile {
  profile: StudentProfile;
  cachedAt: number;
}

export interface CachedProfileResult {
  profile: StudentProfile | null;
  cachedAt: number | null;
}

export async function saveProfile(profile: StudentProfile): Promise<void> {
  try {
    const cached: CachedProfile = {
      profile,
      cachedAt: Date.now(),
    };
    await AsyncStorage.setItem(PROFILE_KEY, JSON.stringify(cached));
  } catch (error) {
    throw new Error("Failed to save profile");
  }
}

export async function getProfile(): Promise<CachedProfileResult> {
  try {
    const value = await AsyncStorage.getItem(PROFILE_KEY);

    if (!value) {
      return { profile: null, cachedAt: null };
    }

    const cached = JSON.parse(value) as CachedProfile;
    return { profile: cached.profile, cachedAt: cached.cachedAt };
  } catch (error) {
    return { profile: null, cachedAt: null };
  }
}

export async function clearProfile(): Promise<void> {
  try {
    await AsyncStorage.removeItem(PROFILE_KEY);
  } catch (error) {
    // Ignore
  }
}