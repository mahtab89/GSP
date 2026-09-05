import {
  Animated,
  Easing,
  Linking,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useEffect, useRef, useState } from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";

import { useTheme } from "../theme/ThemeContext";
import type { AppTheme } from "../theme/theme";

import * as Application from "expo-application";

interface Props {
  onLogout: () => Promise<void>;
}

type Dialog = "about" | "author" | "logout" | "support";

export function SettingsScreen({ onLogout }: Props) {
  const { theme, mode, setMode } = useTheme();
  const styles = createStyles(theme);
  const [themeNotice, setThemeNotice] = useState<"light" | "dark" | null>(null);
  const [dialog, setDialog] = useState<Dialog | null>(null);
  const noticeOpacity = useRef(new Animated.Value(0)).current;
  const noticeTranslateY = useRef(new Animated.Value(12)).current;

  useEffect(() => {
    if (!themeNotice) {
      return;
    }

    noticeOpacity.setValue(0);
    noticeTranslateY.setValue(12);

    Animated.parallel([
      Animated.timing(noticeOpacity, {
        toValue: 1,
        duration: 180,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
      Animated.timing(noticeTranslateY, {
        toValue: 0,
        duration: 180,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
    ]).start();

    const timeout = setTimeout(() => {
      Animated.parallel([
        Animated.timing(noticeOpacity, {
          toValue: 0,
          duration: 160,
          easing: Easing.in(Easing.cubic),
          useNativeDriver: true,
        }),
        Animated.timing(noticeTranslateY, {
          toValue: 8,
          duration: 160,
          easing: Easing.in(Easing.cubic),
          useNativeDriver: true,
        }),
      ]).start(({ finished }) => {
        if (finished) {
          setThemeNotice(null);
        }
      });
    }, 1700);

    return () => {
      clearTimeout(timeout);
      noticeOpacity.stopAnimation();
      noticeTranslateY.stopAnimation();
    };
  }, [themeNotice]);

  const toggleTheme = () => {
    const nextMode = mode === "light" ? "dark" : "light";
    setMode(nextMode);
    setThemeNotice(nextMode);
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={["top", "left", "right"]}>
      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.header}>
          <View>
            <Text style={styles.title}>Settings</Text>
            <Text style={styles.subtitle}>Manage your app preferences</Text>
          </View>
          <View style={styles.iconContainer}>
            <Ionicons
              name="settings-outline"
              size={20}
              color={theme.colors.textSecondary}
            />
          </View>
        </View>

        <Section title="Appearance">
          <Pressable style={styles.themeRow} onPress={toggleTheme}>
            <View style={styles.rowIcon}>
              <Ionicons
                name={mode === "dark" ? "moon-outline" : "sunny-outline"}
                size={19}
                color={theme.colors.accent}
              />
            </View>
            <View style={styles.rowContent}>
              <Text style={styles.rowTitle}>Theme</Text>
              <Text style={styles.rowDetail}>
                {mode === "light" ? "Light" : "Dark"}
              </Text>
            </View>
            <Ionicons
              name="chevron-forward"
              size={18}
              color={theme.colors.textMuted}
            />
          </Pressable>
        </Section>

        <Section title="Help">
          <SettingRow
            icon="help-circle-outline"
            title="Support"
            detail="Help and contact options"
            onPress={() => setDialog("support")}
          />
          <SettingRow
            icon="information-circle-outline"
            title="About GSP++"
            detail={`Version ${Application.nativeApplicationVersion ?? "unknown"}`}
            onPress={() => setDialog("about")}
            last
          />
        </Section>

        <Section title="Creator">
          <SettingRow
            icon="person-circle-outline"
            title="Author"
            detail="Mahtab Yasin"
            onPress={() => setDialog("author")}
            last
          />
        </Section>

        <Section title="Account">
          <SettingRow
            icon="log-out-outline"
            title="Log out"
            detail="Remove this account from this device"
            onPress={() => setDialog("logout")}
            destructive
            last
          />
        </Section>
      </ScrollView>

      {themeNotice && (
        <Animated.View
          style={[
            styles.themeNotice,
            {
              opacity: noticeOpacity,
              transform: [{ translateY: noticeTranslateY }],
            },
          ]}
          pointerEvents="none"
        >
          <Ionicons
            name={themeNotice === "dark" ? "moon" : "sunny"}
            size={17}
            color={theme.colors.accent}
          />
          <Text style={styles.themeNoticeText}>
            {themeNotice === "dark" ? "Dark" : "Light"} theme enabled
          </Text>
        </Animated.View>
      )}

      {dialog && (
        <SettingsDialog
          dialog={dialog}
          onClose={() => setDialog(null)}
          onLogout={onLogout}
        />
      )}
    </SafeAreaView>
  );
}

function SettingsDialog({
  dialog,
  onClose,
  onLogout,
}: {
  dialog: Dialog;
  onClose: () => void;
  onLogout: () => Promise<void>;
}) {
  const { theme } = useTheme();
  const styles = createStyles(theme);
  const openLink = (url: string) => {
    void Linking.openURL(url).catch((error) => {
      
    });
  };

  const isLogout = dialog === "logout";
  const title = {
    about: "About GSP++",
    author: "Made by Mahtab",
    logout: "Log out?",
    support: "Support GSP++",
  }[dialog];

  const description = {
    about: "Student Attendance Portal\nVersion 1.0.0",
    author: "Independent developer and creator of GSP++.",
    logout:
      "Your saved Roll No, password, and attendance data will be removed from this device.",
    support:
      "Enjoying GSP++? You can support its development or get in touch directly.",
  }[dialog];

  return (
    <Modal transparent animationType="fade" visible onRequestClose={onClose}>
      <View style={styles.dialogOverlay}>
        <Pressable style={styles.dialogBackdrop} onPress={onClose} />
        <View style={styles.dialogCard}>
          <View style={[styles.dialogIcon, isLogout && styles.destructiveIcon]}>
            <Ionicons
              name={
                isLogout
                  ? "log-out-outline"
                  : dialog === "author"
                    ? "person-outline"
                    : dialog === "support"
                      ? "heart-outline"
                      : "information-circle-outline"
              }
              size={24}
              color={isLogout ? theme.colors.danger : theme.colors.accent}
            />
          </View>
          <Text style={styles.dialogTitle}>{title}</Text>
          <Text style={styles.dialogText}>{description}</Text>

          {dialog === "author" && (
            <View style={styles.dialogActions}>
              <DialogAction
                icon="logo-github"
                label="GitHub"
                onPress={() => openLink("https://github.com/mahtab89")}
              />
              <DialogAction
                icon="logo-instagram"
                label="Instagram"
                onPress={() => openLink("https://instagram.com/_mahtab_yasin_")}
              />
              <DialogAction
                icon="mail-outline"
                label="Email"
                onPress={() => openLink("mailto:mdmahtabyasin@gmail.com")}
              />
            </View>
          )}

          {dialog === "support" && (
            <View style={styles.dialogActions}>
              <DialogAction
                icon="cafe-outline"
                label="Buy me a coffee"
                onPress={() =>
                  openLink(
                    "upi://pay?pa=9608896428@sbi&pn=Mahtab%20Yasin&cu=INR",
                  )
                }
              />
              <DialogAction
                icon="mail-outline"
                label="Email support"
                onPress={() => openLink("mailto:mdmahtabyasin@gmail.com")}
              />
            </View>
          )}

          <View style={styles.dialogFooter}>
            <Pressable style={styles.dialogButton} onPress={onClose}>
              <Text style={styles.dialogButtonText}>
                {isLogout ? "Cancel" : "Close"}
              </Text>
            </Pressable>
            {isLogout && (
              <Pressable
                style={[styles.dialogButton, styles.logoutButton]}
                onPress={() => void onLogout()}
              >
                <Text style={styles.logoutButtonText}>Log out</Text>
              </Pressable>
            )}
          </View>
        </View>
      </View>
    </Modal>
  );
}

function DialogAction({
  icon,
  label,
  onPress,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  onPress: () => void;
}) {
  const { theme } = useTheme();
  const styles = createStyles(theme);
  return (
    <Pressable style={styles.dialogAction} onPress={onPress}>
      <Ionicons name={icon} size={18} color={theme.colors.accent} />
      <Text style={styles.dialogActionText}>{label}</Text>
      <Ionicons name="open-outline" size={15} color={theme.colors.textMuted} />
    </Pressable>
  );
}

function Section({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  const { theme } = useTheme();
  const styles = createStyles(theme);
  return (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>{title}</Text>
      <View style={styles.group}>{children}</View>
    </View>
  );
}

function SettingRow({
  icon,
  title,
  detail,
  onPress,
  destructive = false,
  last = false,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  title: string;
  detail: string;
  onPress?: () => void;
  destructive?: boolean;
  last?: boolean;
}) {
  const { theme } = useTheme();
  const styles = createStyles(theme);
  const content = (
    <>
      <View style={[styles.rowIcon, destructive && styles.destructiveIcon]}>
        <Ionicons
          name={icon}
          size={19}
          color={destructive ? theme.colors.danger : theme.colors.accent}
        />
      </View>
      <View style={styles.rowContent}>
        <Text style={[styles.rowTitle, destructive && styles.destructiveText]}>
          {title}
        </Text>
        <Text style={styles.rowDetail}>{detail}</Text>
      </View>
      {onPress && (
        <Ionicons
          name="chevron-forward"
          size={18}
          color={theme.colors.textMuted}
        />
      )}
    </>
  );

  if (onPress) {
    return (
      <Pressable
        style={[styles.row, !last && styles.rowBorder]}
        onPress={onPress}
      >
        {content}
      </Pressable>
    );
  }

  return <View style={[styles.row, !last && styles.rowBorder]}>{content}</View>;
}

const createStyles = (theme: AppTheme) =>
  StyleSheet.create({
    safeArea: { flex: 1, backgroundColor: theme.colors.background },
    content: { padding: theme.spacing.xl, paddingBottom: theme.spacing.xxxl },
    header: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      marginBottom: theme.spacing.xxl,
    },
    title: {
      fontFamily: theme.fonts.bold,
      fontSize: 24,
      letterSpacing: -0.5,
      color: theme.colors.text,
    },
    subtitle: {
      fontFamily: theme.fonts.medium,
      fontSize: 12,
      color: theme.colors.textSecondary,
      marginTop: 4,
    },
    iconContainer: {
      width: 40,
      height: 40,
      borderRadius: 12,
      alignItems: "center",
      justifyContent: "center",
      backgroundColor: theme.colors.surface,
      borderWidth: 1,
      borderColor: theme.colors.border,
    },
    section: { marginBottom: theme.spacing.xl },
    sectionTitle: {
      fontFamily: theme.fonts.semiBold,
      fontSize: 12,
      color: theme.colors.textSecondary,
      marginBottom: theme.spacing.sm,
      marginLeft: theme.spacing.sm,
    },
    group: {
      backgroundColor: theme.colors.surface,
      borderWidth: 1,
      borderColor: theme.colors.border,
      borderRadius: theme.radius.medium,
    },
    row: {
      minHeight: 72,
      flexDirection: "row",
      alignItems: "center",
      paddingHorizontal: theme.spacing.lg,
    },
    themeRow: {
      minHeight: 92,
      flexDirection: "row",
      alignItems: "center",
      paddingHorizontal: theme.spacing.lg,
    },
    themeNotice: {
      position: "absolute",
      right: theme.spacing.xl,
      bottom: theme.spacing.xl,
      flexDirection: "row",
      alignItems: "center",
      gap: theme.spacing.sm,
      backgroundColor: theme.colors.surface,
      borderWidth: 1,
      borderColor: theme.colors.border,
      borderRadius: theme.radius.medium,
      paddingHorizontal: theme.spacing.lg,
      paddingVertical: theme.spacing.md,
      elevation: 4,
      shadowColor: theme.colors.black,
      shadowOpacity: 0.14,
      shadowOffset: { width: 0, height: 3 },
      shadowRadius: 8,
    },
    themeNoticeText: {
      fontFamily: theme.fonts.semiBold,
      fontSize: 12,
      color: theme.colors.text,
    },
    dialogOverlay: {
      flex: 1,
      justifyContent: "center",
      padding: theme.spacing.xl,
    },
    dialogBackdrop: {
      position: "absolute",
      top: 0,
      right: 0,
      bottom: 0,
      left: 0,
      backgroundColor: "rgba(0, 0, 0, 0.5)",
    },
    dialogCard: {
      backgroundColor: theme.colors.surface,
      borderRadius: theme.radius.large,
      borderWidth: 1,
      borderColor: theme.colors.border,
      padding: theme.spacing.xl,
      elevation: 8,
      shadowColor: theme.colors.black,
      shadowOpacity: 0.2,
      shadowOffset: { width: 0, height: 8 },
      shadowRadius: 20,
    },
    dialogIcon: {
      width: 48,
      height: 48,
      alignItems: "center",
      justifyContent: "center",
      borderRadius: 14,
      backgroundColor: theme.colors.accentSoft,
      marginBottom: theme.spacing.lg,
    },
    dialogTitle: {
      fontFamily: theme.fonts.bold,
      fontSize: 20,
      color: theme.colors.text,
    },
    dialogText: {
      fontFamily: theme.fonts.medium,
      fontSize: 13,
      lineHeight: 20,
      color: theme.colors.textSecondary,
      marginTop: theme.spacing.sm,
    },
    dialogActions: { gap: theme.spacing.sm, marginTop: theme.spacing.xl },
    dialogAction: {
      minHeight: 46,
      flexDirection: "row",
      alignItems: "center",
      gap: theme.spacing.sm,
      paddingHorizontal: theme.spacing.md,
      backgroundColor: theme.colors.surfaceMuted,
      borderRadius: theme.radius.small,
    },
    dialogActionText: {
      flex: 1,
      fontFamily: theme.fonts.semiBold,
      fontSize: 13,
      color: theme.colors.text,
    },
    dialogFooter: {
      flexDirection: "row",
      justifyContent: "flex-end",
      gap: theme.spacing.sm,
      marginTop: theme.spacing.xl,
    },
    dialogButton: {
      minHeight: 40,
      alignItems: "center",
      justifyContent: "center",
      paddingHorizontal: theme.spacing.lg,
      borderRadius: theme.radius.small,
      backgroundColor: theme.colors.surfaceMuted,
    },
    dialogButtonText: {
      fontFamily: theme.fonts.semiBold,
      fontSize: 13,
      color: theme.colors.text,
    },
    logoutButton: { backgroundColor: theme.colors.danger },
    logoutButtonText: {
      fontFamily: theme.fonts.semiBold,
      fontSize: 13,
      color: theme.colors.white,
    },
    rowBorder: { borderBottomWidth: 1, borderBottomColor: theme.colors.border },
    rowIcon: {
      width: 36,
      height: 36,
      alignItems: "center",
      justifyContent: "center",
      borderRadius: 10,
      backgroundColor: theme.colors.accentSoft,
      marginRight: theme.spacing.md,
    },
    destructiveIcon: { backgroundColor: theme.colors.dangerSoft },
    rowContent: { flex: 1 },
    rowTitle: {
      fontFamily: theme.fonts.semiBold,
      fontSize: 14,
      color: theme.colors.text,
    },
    destructiveText: { color: theme.colors.danger },
    rowDetail: {
      fontFamily: theme.fonts.medium,
      fontSize: 11,
      color: theme.colors.textSecondary,
      marginTop: 3,
    },
  });
