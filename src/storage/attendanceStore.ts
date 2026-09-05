import AsyncStorage from "@react-native-async-storage/async-storage";

import type { AttendanceData } from "../models/attendance";

const ATTENDANCE_CACHE_KEY = "@gsp/attendance_cache";

interface CachedAttendance {
  attendance: AttendanceData;
  cachedAt: number;
}

type AttendanceCache = Record<number, CachedAttendance>;

export interface CachedAttendanceResult {
  attendance: AttendanceData | null;
  cachedAt: number | null;
}

export async function saveAttendance(
  attendance: AttendanceData,
): Promise<void> {
  try {
    const cache = await getCache();

    cache[attendance.semester] = {
      attendance,
      cachedAt: Date.now(),
    };

    await AsyncStorage.setItem(ATTENDANCE_CACHE_KEY, JSON.stringify(cache));
  } catch (error) {
    throw new Error("Failed to cache attendance data");
  }
}

export async function getAttendance(
  semester: number,
): Promise<CachedAttendanceResult> {
  try {
    const cachedAttendance = (await getCache())[semester];

    if (!cachedAttendance) {
      return { attendance: null, cachedAt: null };
    }

    return { attendance: cachedAttendance.attendance, cachedAt: cachedAttendance.cachedAt };
  } catch (error) {
    return { attendance: null, cachedAt: null };
  }
}

export async function clearAttendance(): Promise<void> {
  try {
    await AsyncStorage.removeItem(ATTENDANCE_CACHE_KEY);
  } catch (error) {
    // Ignore
  }
}

async function getCache(): Promise<AttendanceCache> {
  const data = await AsyncStorage.getItem(ATTENDANCE_CACHE_KEY);

  if (!data) {
    return {};
  }

  const parsed = JSON.parse(data) as AttendanceCache | AttendanceData;

  // Migrate the former single-semester cache without discarding saved data.
  if ("subjects" in parsed) {
    return {
      [parsed.semester]: {
        attendance: parsed,
        cachedAt: Date.now(),
      },
    };
  }

  return parsed;
}