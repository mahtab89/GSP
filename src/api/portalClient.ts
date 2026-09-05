import { PORTAL_URLS } from "./constants";
import { PortalHttpClient } from "./http";
import { extractHiddenFields } from "../parsers/aspnet";
import { parseStudentProfile } from "../parsers/profile";
import { parseAttendance, parseAvailableSemesters } from "../parsers/attendance";

import type { Credentials, SessionState } from "../models/auth";
import type { StudentProfile } from "../models/profile";
import type { AttendanceData } from "../models/attendance";

import { BlockedError } from "../errors/BlockedError";
import { saveAttendance, getAttendance, clearAttendance } from "../storage/attendanceStore";
import { saveProfile, getProfile, clearProfile } from "../storage/profileStore";

export interface LoginResult {
  profile: StudentProfile;
  attendance: AttendanceData;
  availableSemesters: number[];
}

export class PortalClient {
  private readonly http = new PortalHttpClient();

  private session: SessionState = {
    authenticated: false,
    createdAt: "",
  };

  async login(credentials: Credentials): Promise<{ profile: StudentProfile; attendance: AttendanceData; availableSemesters: number[] }> {
    // Step 1: GET login page from university
    const loginPage = await this.http.get<string>(`${PORTAL_URLS.login.replace("/Login.aspx", "")}/Login.aspx`, { timeout: 10000 });

    if (loginPage.status === 403) {
      throw new BlockedError();
    }

    if (!loginPage.ok) {
      throw new Error(`Login page request failed: HTTP ${loginPage.status}`);
    }

    // Step 2: Extract hidden fields
    const hiddenFields = extractHiddenFields(loginPage.body ?? "");

    // Step 3: Build form data
    const formData: Record<string, string> = {
      ...hiddenFields,
      ScriptManager1: "UpdatePanel1|LoginButton",
      __EVENTTARGET: "",
      __EVENTARGUMENT: "",
      username: credentials.username,
      password: credentials.password,
      __ASYNCPOST: "true",
      LoginButton: "Login",
    };

    // Step 4: POST to university (form-urlencoded with required headers)
    const cookiesFromGet = loginPage.setCookie?.join("; ") ?? "";
    const loginPost = await this.http.postForm<string>(`${PORTAL_URLS.login.replace("/Login.aspx", "")}/Login.aspx`, formData, {
      referer: `${PORTAL_URLS.login.replace("/Login.aspx", "")}/Login.aspx`,
      origin: PORTAL_URLS.login.replace("/Login.aspx", ""),
      cookies: cookiesFromGet,
      headers: {
        "X-MicrosoftAjax": "Delta=true",
      },
      timeout: 10000,
    });

    if (loginPost.status === 403) {
      throw new BlockedError();
    }

    if (!loginPost.ok) {
      throw new Error(`Login request failed: HTTP ${loginPost.status}`);
    }

    if (!loginPost.body?.includes("pageRedirect")) {
      throw new Error("Login failed: redirect was not returned");
    }

    // Step 5: Get session cookies from university
    const universityCookies = loginPost.setCookie?.join("; ") ?? "";

    // Step 6: Fetch all semesters attendance and profile from university
    const [profile, availableSemesters] = await Promise.all([
      this.fetchProfile(universityCookies),
      this.fetchAvailableSemesters(universityCookies),
    ]);

    // Fetch all semesters attendance
    const attendanceMap: Record<number, AttendanceData> = {};
    for (const sem of availableSemesters) {
      const attendance = await this.fetchAttendance(universityCookies, sem);
      attendanceMap[sem] = attendance;
    }

    // Save to local storage
    await saveProfile(profile);
    for (const [, attendance] of Object.entries(attendanceMap)) {
      await saveAttendance(attendance);
    }

    const currentAttendance = attendanceMap[3] ?? Object.values(attendanceMap)[0];

    this.session = {
      authenticated: true,
      createdAt: new Date().toISOString(),
    };

    return {
      profile,
      attendance: currentAttendance,
      availableSemesters,
    };
  }

  private async fetchProfile(cookies: string): Promise<StudentProfile> {
    const response = await this.http.get<string>(`${PORTAL_URLS.login.replace("/Login.aspx", "")}/MyProfileWebForm.aspx`, { cookies, timeout: 10000 });

    if (response.status === 403) {
      throw new BlockedError();
    }

    if (!response.ok) {
      throw new Error(`Profile request failed: HTTP ${response.status}`);
    }

    return parseStudentProfile(response.body ?? "");
  }

  private async fetchAvailableSemesters(cookies: string): Promise<number[]> {
    const response = await this.http.get<string>(`${PORTAL_URLS.login.replace("/Login.aspx", "")}/AttendanceWebForm.aspx`, { cookies, timeout: 10000 });

    if (response.status === 403) {
      throw new BlockedError();
    }

    if (!response.ok) {
      throw new Error(`Attendance page request failed: HTTP ${response.status}`);
    }

    return parseAvailableSemesters(response.body ?? "");
  }

  private async fetchAttendance(cookies: string, semester: number): Promise<AttendanceData> {
    const page = await this.http.get<string>(`${PORTAL_URLS.login.replace("/Login.aspx", "")}/AttendanceWebForm.aspx`, { cookies, timeout: 10000 });

    if (page.status === 403) {
      throw new BlockedError();
    }

    if (!page.ok) {
      throw new Error(`Attendance page request failed: HTTP ${page.status}`);
    }

    const hiddenFields = extractHiddenFields(page.body ?? "");

    const formData: Record<string, string> = {
      ...hiddenFields,
      "ctl00$ContentPlaceHolder1$AttendanceUserControl1$SemesterDropDownList": String(semester),
      "ctl00$ContentPlaceHolder1$AttendanceUserControl1$ViewButton": "View",
      "__EVENTTARGET": "ctl00$ContentPlaceHolder1$AttendanceUserControl1$ViewButton",
      "__EVENTARGUMENT": "",
      "__ASYNCPOST": "true",
    };

    const response = await this.http.postForm<string>(`${PORTAL_URLS.login.replace("/Login.aspx", "")}/AttendanceWebForm.aspx`, formData, {
      referer: `${PORTAL_URLS.login.replace("/Login.aspx", "")}/AttendanceWebForm.aspx`,
      origin: PORTAL_URLS.login.replace("/Login.aspx", ""),
      cookies,
      headers: {
        "X-MicrosoftAjax": "Delta=true",
      },
      timeout: 10000,
    });

    if (response.status === 403) {
      throw new BlockedError();
    }

    if (!response.ok) {
      throw new Error(`Attendance request failed: HTTP ${response.status}`);
    }

    if (!response.body?.includes("DataGrid1")) {
      throw new Error(`Attendance data not returned for semester ${semester}`);
    }

    const attendance = parseAttendance(response.body ?? "");
    attendance.semester = semester;
    return attendance;
  }

  async getProfile(): Promise<StudentProfile> {
    if (!this.session.authenticated) {
      throw new Error("Not authenticated");
    }

    // Try to get from local storage first
    const cachedProfileResult = await getProfile();
    if (cachedProfileResult.profile) {
      return cachedProfileResult.profile;
    }

    // Fallback: fetch from university (shouldn't normally happen)
    const cookies = this.http.getCookieNames().join("; ");
    const profile = await this.fetchProfile(cookies);
    await saveProfile(profile);
    return profile;
  }

  async getAttendance(semester: number): Promise<AttendanceData> {
    if (!this.session.authenticated) {
      throw new Error("Not authenticated");
    }

    // Try to get from local storage first
    const cachedAttendanceResult = await getAttendance(semester);
    if (cachedAttendanceResult.attendance) {
      return cachedAttendanceResult.attendance;
    }

    // Fallback: fetch from university
    const cookies = this.http.getCookieNames().join("; ");
    const attendance = await this.fetchAttendance(cookies, semester);
    await saveAttendance(attendance);
    return attendance;
  }

  async getAvailableSemesters(): Promise<number[]> {
    if (!this.session.authenticated) {
      throw new Error("Not authenticated");
    }

    // Get semesters from cached attendance
    const cached = await getAttendance(3); // Use semester 3 as reference
    if (cached.attendance) {
      return cached.attendance.availableSemesters;
    }

    // Fallback: fetch from university
    const cookies = this.http.getCookieNames().join("; ");
    return this.fetchAvailableSemesters(cookies);
  }

  getSession(): SessionState {
    return this.session;
  }

  logout(): void {
    this.http.clearCookies();
    clearAttendance();
    clearProfile();

    this.session = {
      authenticated: false,
      createdAt: "",
    };
  }
}