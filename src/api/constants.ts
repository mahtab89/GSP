const PORTAL_BASE_URL = process.env.EXPO_PUBLIC_PORTAL_BASE_URL ?? "http://122.185.175.229/Student";

export const PORTAL_URLS = {
  login: `${PORTAL_BASE_URL}/Login.aspx`,
  attendance: `${PORTAL_BASE_URL}/AttendanceWebForm.aspx`,
  profile: `${PORTAL_BASE_URL}/MyProfileWebForm.aspx`,
} as const;

export const DEFAULT_HEADERS = {
  Accept: "*/*",
  "User-Agent":
    "Mozilla/5.0 (X11; Linux x86_64; rv:153.0) Gecko/20100101 Firefox/153.0",
} as const;