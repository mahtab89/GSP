import { useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  Animated,
  Easing,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { useFonts } from "expo-font";

import {
  PlusJakartaSans_400Regular,
  PlusJakartaSans_500Medium,
  PlusJakartaSans_600SemiBold,
  PlusJakartaSans_700Bold,
  PlusJakartaSans_800ExtraBold,
} from "@expo-google-fonts/plus-jakarta-sans";

import { PortalClient } from "./src/api/portalClient";
import type { AttendanceData } from "./src/models/attendance";
import type { Credentials } from "./src/models/auth";
import type { StudentProfile } from "./src/models/profile";
import {
  saveCredentials,
  getCredentials,
  clearCredentials,
} from "./src/storage/credentialStore";
import { getAttendance, type CachedAttendanceResult } from "./src/storage/attendanceStore";
import { getProfile, type CachedProfileResult } from "./src/storage/profileStore";
import { BlockedError, isBlockedError } from "./src/errors/BlockedError";
import { withTimeout, TimeoutError } from "./src/utils/timeout";

import { LoginScreen } from "./src/screens/LoginScreen";
import { HomeScreen } from "./src/screens/HomeScreen";
import { AttendanceScreen } from "./src/screens/AttendanceScreen";
import { ProfileScreen } from "./src/screens/ProfileScreen";
import { SettingsScreen } from "./src/screens/SettingsScreen";
import { BlockedScreen } from "./src/screens/BlockedScreen";

import { BottomNav } from "./src/components/BottomNav";

import { ThemeProvider, useTheme } from "./src/theme/ThemeContext";
import type { AppTheme } from "./src/theme/theme";

type Tab = "home" | "attendance" | "profile" | "settings";
type AppState = "loading" | "login" | "app";

const CURRENT_SEMESTER = 3;
const CURRENT_SEMESTER_CACHE_EXPIRY_MS = 24 * 60 * 60 * 1000;

export default function App() {
  return (
    <ThemeProvider>
      <AppContent />
    </ThemeProvider>
  );
}

function AppContent() {
  const { theme } = useTheme();
  const styles = createStyles(theme);
  const [fontsLoaded] = useFonts({
    PlusJakartaSans_400Regular,
    PlusJakartaSans_500Medium,
    PlusJakartaSans_600SemiBold,
    PlusJakartaSans_700Bold,
    PlusJakartaSans_800ExtraBold,
  });

  const [appState, setAppState] = useState<AppState>("loading");
  const [activeTab, setActiveTab] = useState<Tab>("home");
  const screenOpacity = useRef(new Animated.Value(1)).current;

  const [attendance, setAttendance] = useState<AttendanceData | null>(null);
  const [profile, setProfile] = useState<StudentProfile | null>(null);
  const [attendanceBySemester, setAttendanceBySemester] = useState<
    Record<number, AttendanceData>
  >({});
  const [credentials, setCredentials] = useState<Credentials | null>(null);
  const [isBlocked, setIsBlocked] = useState(false);

  const [loading, setLoading] = useState(true);
  const [loginError, setLoginError] = useState<string | null>(null);
  const [loginLoading, setLoginLoading] = useState(false);

  const [attendanceRefreshing, setAttendanceRefreshing] = useState(false);
  const [profileLoading, setProfileLoading] = useState(false);
  const [profileError, setProfileError] = useState<string | null>(null);
  const [lastFetched, setLastFetched] = useState<number | null>(null);

  useEffect(() => {
    if (!fontsLoaded) {
      return;
    }

    initializeApp();
  }, [fontsLoaded]);

  const initializeApp = async () => {
    // Check if credentials are stored
    const storedCredentials = await getCredentials();

    if (!storedCredentials) {
      setAppState("login");
      setLoading(false);
      return;
    }

    setCredentials(storedCredentials);

    // Wrap entire initialization in 10s timeout
    const initWithTimeout = async () => {
      // Login and get all data at once
      const client = new PortalClient();
      const { profile, attendance, availableSemesters } = await client.login(storedCredentials);
      
      // Fetch remaining semesters attendance
      const allAttendance: Record<number, AttendanceData> = { [attendance.semester]: attendance };
      for (const sem of availableSemesters) {
        if (sem !== attendance.semester) {
          const data = await client.getAttendance(sem);
          allAttendance[sem] = data;
        }
      }
      
      if (attendance) {
        setAttendance(attendance);
        setAttendanceBySemester(allAttendance);
      }
      setProfile(profile);
      setAppState("app");
    };

    try {
      await withTimeout(initWithTimeout(), 10000);
      setLoading(false);
      return;
    } catch (err: unknown) {
      if (err instanceof TimeoutError) {
        // Timeout - fall back to cached data silently
        try {
          const [cachedAttendanceResult, cachedProfileResult] = await Promise.all([
            getAttendance(CURRENT_SEMESTER),
            getProfile(),
          ]);
          if (cachedAttendanceResult.attendance) {
            setAttendance(cachedAttendanceResult.attendance);
            setLastFetched(cachedAttendanceResult.cachedAt);
          }
          if (cachedProfileResult.profile) setProfile(cachedProfileResult.profile);
        } catch {
          // Ignore cache errors
        }
        setAppState("app");
        setLoading(false);
        return;
      }
      if (isBlockedError(err)) {
        setIsBlocked(true);
        setAppState("app");
      } else if (storedCredentials) {
        // Load cached data before showing app
        try {
          const [cachedAttendanceResult, cachedProfileResult] = await Promise.all([
            getAttendance(CURRENT_SEMESTER),
            getProfile(),
          ]);
          if (cachedAttendanceResult.attendance) {
            setAttendance(cachedAttendanceResult.attendance);
            setLastFetched(cachedAttendanceResult.cachedAt);
          }
          if (cachedProfileResult.profile) setProfile(cachedProfileResult.profile);
        } catch {
          // Ignore cache errors
        }
        setAppState("app");
      } else {
        setAppState("login");
      }
    } finally {
      setLoading(false);
    }
  };

  const fetchAttendanceData = async (creds: Credentials) => {
    try {
      const client = new PortalClient();

      await client.login(creds);

      const data = await client.getAttendance(CURRENT_SEMESTER);

      setAttendance(data);
      setAttendanceBySemester((current) => ({
        ...current,
        [data.semester]: data,
      }));
      setLastFetched(Date.now());
    } catch (err: unknown) {
      console.error("[GSP++]", err);
      if (isBlockedError(err)) {
        setIsBlocked(true);
      }
      throw err;
    }
  };

  const handleLogin = async (rollNo: string, password: string) => {
    setLoginLoading(true);
    setLoginError(null);

    try {
      const creds: Credentials = { username: rollNo, password };

      // Test credentials by fetching data
      const client = new PortalClient();

      const { profile, attendance, availableSemesters } = await client.login(creds);

      // Fetch remaining semesters attendance
      const allAttendance: Record<number, AttendanceData> = { [attendance.semester]: attendance };
      for (const sem of availableSemesters) {
        if (sem !== attendance.semester) {
          const data = await client.getAttendance(sem);
          allAttendance[sem] = data;
        }
      }

      // Save credentials securely
      await saveCredentials(creds);

      setCredentials(creds);
      setAttendance(attendance);
      setAttendanceBySemester(allAttendance);
      setProfile(profile);
      setLastFetched(Date.now());
      setAppState("app");
    } catch (err: unknown) {
      if (isBlockedError(err)) {
        setIsBlocked(true);
        setAppState("app");
      } else {
        const errorMessage =
          err instanceof Error ? err.message : "Login failed. Please try again.";

        setLoginError(errorMessage);
      }
    } finally {
      setLoginLoading(false);
    }
  };

  const handleAttendanceRefresh = async () => {
    if (!credentials || !attendance) {
      return;
    }

    setAttendanceRefreshing(true);

    try {
      const client = new PortalClient();

      await client.login(credentials);

      // Only refresh the current semester
      const currentSemester = attendance.semester;
      const data = await client.getAttendance(currentSemester);

      // Update state
      setAttendance(data);
      setAttendanceBySemester((current) => ({
        ...current,
        [data.semester]: data,
      }));
      setLastFetched(Date.now());
    } catch (err: unknown) {
      if (isBlockedError(err)) {
        setIsBlocked(true);
      } else {
        // Load cached attendance on refresh failure
        try {
          const cached = await getAttendance(CURRENT_SEMESTER);
          if (cached.attendance) setAttendance(cached.attendance);
        } catch {
          // Ignore cache errors
        }
        const errorMessage =
          err instanceof Error ? err.message : "Failed to load attendance";
        setLoginError(errorMessage);
      }
    } finally {
      setAttendanceRefreshing(false);
    }
  };

  const handleLogout = async () => {
    await clearCredentials();
    setCredentials(null);
    setAttendance(null);
    setAttendanceBySemester({});
    setProfile(null);
    setIsBlocked(false);
    setActiveTab("home");
    setAppState("login");
  };

  const handleProfileLoad = async () => {
    if (profile || profileLoading || !credentials) {
      return;
    }

    setProfileLoading(true);
    setProfileError(null);

    try {
      const client = new PortalClient();
      await client.login(credentials);
      const data = await client.getProfile();
      setProfile(data);
    } catch (err: unknown) {
      if (isBlockedError(err)) {
        setIsBlocked(true);
      } else {
        // Load cached profile on failure
        try {
          const cached = await getProfile();
          if (cached.profile) setProfile(cached.profile);
        } catch {
          // Ignore cache errors
        }
        setProfileError(
          err instanceof Error ? err.message : "Couldn't load profile details.",
        );
      }
    } finally {
      setProfileLoading(false);
    }
  };

  const handleTabChange = (tab: Tab) => {
    if (tab === activeTab) {
      return;
    }

    screenOpacity.stopAnimation();
    Animated.timing(screenOpacity, {
      toValue: 0,
      duration: 80,
      easing: Easing.out(Easing.ease),
      useNativeDriver: true,
    }).start(({ finished }) => {
      if (!finished) {
        return;
      }

      setActiveTab(tab);
      requestAnimationFrame(() => {
        Animated.timing(screenOpacity, {
          toValue: 1,
          duration: 120,
          easing: Easing.out(Easing.ease),
          useNativeDriver: true,
        }).start();
      });
    });
  };

  if (!fontsLoaded || loading) {
    return (
      <SafeAreaProvider>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="small" color={theme.colors.accent} />

          <Text style={styles.loadingText}>Loading GSP++...</Text>
        </View>
      </SafeAreaProvider>
    );
  }

  if (isBlocked) {
    return <BlockedScreen />;
  }

  if (appState === "login") {
    return (
      <SafeAreaProvider>
        <LoginScreen
          onLogin={handleLogin}
          loading={loginLoading}
          error={loginError}
        />
      </SafeAreaProvider>
    );
  }

  if (!attendance) {
    return (
      <SafeAreaProvider>
        <View style={styles.errorContainer}>
          <View style={styles.errorIcon}>
            <Text style={styles.errorIconText}>!</Text>
          </View>

          <Text style={styles.errorTitle}>Couldn't load attendance</Text>

          <Text style={styles.errorText}>
            Please try refreshing the Attendance tab.
          </Text>
        </View>
      </SafeAreaProvider>
    );
  }

  return (
    <SafeAreaProvider>
      <View style={styles.app}>
        <Animated.View style={[styles.screen, { opacity: screenOpacity }]}>
          {activeTab === "home" && <HomeScreen attendance={attendance} lastFetched={lastFetched} />}

          {activeTab === "attendance" && (
            <AttendanceScreen
              attendance={attendance}
              attendanceBySemester={attendanceBySemester}
              onRefresh={handleAttendanceRefresh}
              refreshing={attendanceRefreshing}
              onSemesterChange={(semester) => {
                const semData = attendanceBySemester[semester];
                if (semData) {
                  setAttendance(semData);
                }
              }}
            />
          )}

          {activeTab === "profile" && (
            <ProfileScreen
              profile={profile}
              loading={profileLoading}
              error={profileError}
              onLoad={handleProfileLoad}
            />
          )}

          {activeTab === "settings" && (
            <SettingsScreen onLogout={handleLogout} />
          )}
        </Animated.View>

        <BottomNav activeTab={activeTab} onChange={handleTabChange} />
      </View>
    </SafeAreaProvider>
  );
}

const createStyles = (theme: AppTheme) =>
  StyleSheet.create({
    app: {
      flex: 1,
      backgroundColor: theme.colors.background,
    },

    screen: {
      flex: 1,
    },

    loadingContainer: {
      flex: 1,
      alignItems: "center",
      justifyContent: "center",
      backgroundColor: theme.colors.background,
    },

    loadingText: {
      fontFamily: theme.fonts.medium,
      fontSize: 13,
      color: theme.colors.textSecondary,
      marginTop: 12,
    },

    errorContainer: {
      flex: 1,
      alignItems: "center",
      justifyContent: "center",
      paddingHorizontal: 32,
      backgroundColor: theme.colors.background,
    },

    errorIcon: {
      width: 48,
      height: 48,
      borderRadius: 16,
      alignItems: "center",
      justifyContent: "center",
      backgroundColor: theme.colors.dangerSoft,
      marginBottom: 16,
    },

    errorIconText: {
      fontFamily: theme.fonts.bold,
      fontSize: 20,
      color: theme.colors.danger,
    },

    errorTitle: {
      fontFamily: theme.fonts.bold,
      fontSize: 19,
      color: theme.colors.text,
      textAlign: "center",
    },

    errorText: {
      fontFamily: theme.fonts.medium,
      fontSize: 13,
      lineHeight: 20,
      color: theme.colors.textSecondary,
      textAlign: "center",
      marginTop: 8,
    },
  });
