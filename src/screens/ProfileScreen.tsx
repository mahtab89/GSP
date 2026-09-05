import { useEffect } from "react";
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";

import type { Address, StudentProfile } from "../models/profile";
import { useTheme } from "../theme/ThemeContext";
import type { AppTheme } from "../theme/theme";

interface Props {
  profile: StudentProfile | null;
  loading: boolean;
  error: string | null;
  onLoad: () => Promise<void>;
}

export function ProfileScreen({ profile, loading, error, onLoad }: Props) {
  const { theme } = useTheme();
  const styles = createStyles(theme);

  useEffect(() => {
    if (!profile && !loading && !error) {
      void onLoad();
    }
  }, [error, loading, onLoad, profile]);

  if (loading || (!profile && !error)) {
    return (
      <SafeAreaView style={styles.safeArea} edges={["top", "left", "right"]}>
        <View style={styles.centeredState}>
          <ActivityIndicator size="small" color={theme.colors.accent} />
          <Text style={styles.stateText}>Loading profile details...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (!profile) {
    return (
      <SafeAreaView style={styles.safeArea} edges={["top", "left", "right"]}>
        <View style={styles.centeredState}>
          <View style={styles.stateIcon}>
            <Ionicons
              name="alert-circle-outline"
              size={24}
              color={theme.colors.danger}
            />
          </View>
          <Text style={styles.stateTitle}>Couldn't load profile</Text>
          <Text style={styles.stateText}>{error}</Text>
          <Pressable style={styles.retryButton} onPress={() => void onLoad()}>
            <Text style={styles.retryText}>Try again</Text>
          </Pressable>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea} edges={["top", "left", "right"]}>
      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.header}>
          <View>
            <Text style={styles.title}>Profile</Text>
            <Text style={styles.subtitle}>Your student information</Text>
          </View>
          <View style={styles.iconContainer}>
            <Ionicons
              name="person-outline"
              size={20}
              color={theme.colors.textSecondary}
            />
          </View>
        </View>

        <View style={styles.identityCard}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>{initials(profile.name)}</Text>
          </View>
          <View style={styles.identityText}>
            <Text style={styles.name}>{profile.name || "Student"}</Text>
            <Text style={styles.branch}>
              {profile.branch || "Branch unavailable"}
            </Text>
          </View>
          <View style={styles.rollBadge}>
            <Text style={styles.rollLabel}>ROLL NO</Text>
            <Text style={styles.rollValue}>{valueOrDash(profile.rollNo)}</Text>
          </View>
        </View>

        <ProfileSection title="Student details" icon="school-outline">
          <InfoRow label="Registration No" value={profile.registrationNo} />
          <InfoRow label="Date of birth" value={profile.dob} />
          <InfoRow label="Gender" value={profile.sex} last />
        </ProfileSection>

        <ProfileSection title="Contact" icon="call-outline">
          <InfoRow label="Mobile" value={profile.studentMobile} />
          <InfoRow label="Father's mobile" value={profile.fatherMobile} />
          <InfoRow label="WhatsApp" value={profile.whatsappNo} />
          <InfoRow label="Email" value={profile.email} last />
        </ProfileSection>

        <ProfileSection title="Family" icon="people-outline">
          <InfoRow label="Father" value={profile.fatherName} last />
          <InfoRow label="Mother" value={profile.motherName} last />
        </ProfileSection>

        <ProfileSection title="Admission" icon="document-text-outline">
          <InfoRow label="Category" value={profile.admissionCategory} />
          <InfoRow label="Admission date" value={profile.admissionDate} last />
        </ProfileSection>

        <ProfileSection title="Mailing address" icon="location-outline">
          <AddressDetails address={profile.mailingAddress} />
        </ProfileSection>

        <ProfileSection title="Permanent address" icon="home-outline">
          <AddressDetails address={profile.permanentAddress} />
        </ProfileSection>

        {(profile.hostel.hostel ||
          profile.hostel.block ||
          profile.hostel.roomNo) && (
          <ProfileSection title="Hostel" icon="bed-outline">
            <InfoRow label="Hostel" value={profile.hostel.hostel} />
            <InfoRow label="Block" value={profile.hostel.block} />
            <InfoRow label="Room" value={profile.hostel.roomNo} last />
          </ProfileSection>
        )}

        {profile.academicDetails.length > 0 && (
          <View style={styles.academicSection}>
            <Text style={styles.sectionTitle}>Academic history</Text>
            {profile.academicDetails.map((detail) => (
              <View
                key={`${detail.examination}-${detail.year}`}
                style={styles.academicCard}
              >
                <View style={styles.academicHeader}>
                  <Text style={styles.academicTitle}>{detail.examination}</Text>
                  {detail.percentage !== null && (
                    <Text style={styles.percentage}>{detail.percentage}%</Text>
                  )}
                </View>
                <Text style={styles.academicInstitution}>
                  {valueOrDash(detail.institution)}
                </Text>
                <Text style={styles.academicMeta}>
                  {[
                    detail.boardUniversity,
                    detail.stream,
                    detail.year,
                    detail.division,
                  ]
                    .filter(Boolean)
                    .join(" • ")}
                </Text>
              </View>
            ))}
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

function ProfileSection({
  title,
  icon,
  children,
}: {
  title: string;
  icon: keyof typeof Ionicons.glyphMap;
  children: React.ReactNode;
}) {
  const { theme } = useTheme();
  const styles = createStyles(theme);
  return (
    <View style={styles.section}>
      <View style={styles.sectionHeader}>
        <Ionicons name={icon} size={16} color={theme.colors.accent} />
        <Text style={styles.sectionTitle}>{title}</Text>
      </View>
      <View style={styles.group}>{children}</View>
    </View>
  );
}

function InfoRow({
  label,
  value,
  last = false,
}: {
  label: string;
  value: string;
  last?: boolean;
}) {
  const { theme } = useTheme();
  const styles = createStyles(theme);
  return (
    <View style={[styles.infoRow, !last && styles.rowBorder]}>
      <Text style={styles.infoLabel}>{label}</Text>
      <Text style={styles.infoValue}>{valueOrDash(value)}</Text>
    </View>
  );
}

function AddressDetails({ address }: { address: Address }) {
  const parts = [
    address.atPo,
    address.cityVia,
    address.district,
    address.state,
    address.pin,
  ].filter(Boolean);
  const { theme } = useTheme();
  const styles = createStyles(theme);
  return (
    <Text style={styles.addressText}>
      {parts.length > 0 ? parts.join(", ") : "Not available"}
    </Text>
  );
}

function initials(name: string) {
  return (
    name
      .split(" ")
      .filter(Boolean)
      .slice(0, 2)
      .map((part) => part[0])
      .join("")
      .toUpperCase() || "S"
  );
}

function valueOrDash(value: string) {
  return value || "-";
}

const createStyles = (theme: AppTheme) =>
  StyleSheet.create({
    safeArea: { flex: 1, backgroundColor: theme.colors.background },
    content: { padding: theme.spacing.xl, paddingBottom: theme.spacing.xxxl },
    header: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      marginBottom: theme.spacing.xl,
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
    identityCard: {
      flexDirection: "row",
      alignItems: "center",
      backgroundColor: theme.colors.surface,
      borderWidth: 1,
      borderColor: theme.colors.border,
      borderRadius: theme.radius.large,
      padding: theme.spacing.lg,
      marginBottom: theme.spacing.xxl,
    },
    avatar: {
      width: 52,
      height: 52,
      alignItems: "center",
      justifyContent: "center",
      borderRadius: 16,
      backgroundColor: theme.colors.accentSoft,
    },
    avatarText: {
      fontFamily: theme.fonts.bold,
      fontSize: 18,
      color: theme.colors.accent,
    },
    identityText: { flex: 1, marginLeft: theme.spacing.md },
    name: {
      fontFamily: theme.fonts.bold,
      fontSize: 16,
      color: theme.colors.text,
    },
    branch: {
      fontFamily: theme.fonts.medium,
      fontSize: 11,
      color: theme.colors.textSecondary,
      marginTop: 4,
    },
    rollBadge: { alignItems: "flex-end", marginLeft: theme.spacing.sm },
    rollLabel: {
      fontFamily: theme.fonts.semiBold,
      fontSize: 9,
      color: theme.colors.textMuted,
    },
    rollValue: {
      fontFamily: theme.fonts.bold,
      fontSize: 12,
      color: theme.colors.text,
      marginTop: 3,
    },
    section: { marginBottom: theme.spacing.xl },
    sectionHeader: {
      flexDirection: "row",
      alignItems: "center",
      gap: theme.spacing.sm,
      marginBottom: theme.spacing.sm,
      marginLeft: theme.spacing.xs,
    },
    sectionTitle: {
      fontFamily: theme.fonts.semiBold,
      fontSize: 12,
      color: theme.colors.textSecondary,
    },
    group: {
      overflow: "hidden",
      backgroundColor: theme.colors.surface,
      borderWidth: 1,
      borderColor: theme.colors.border,
      borderRadius: theme.radius.medium,
    },
    infoRow: {
      minHeight: 52,
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      gap: theme.spacing.md,
      paddingHorizontal: theme.spacing.lg,
    },
    rowBorder: { borderBottomWidth: 1, borderBottomColor: theme.colors.border },
    infoLabel: {
      flex: 1,
      fontFamily: theme.fonts.medium,
      fontSize: 12,
      color: theme.colors.textSecondary,
    },
    infoValue: {
      flex: 1.4,
      fontFamily: theme.fonts.semiBold,
      fontSize: 12,
      color: theme.colors.text,
      textAlign: "right",
    },
    addressText: {
      fontFamily: theme.fonts.medium,
      fontSize: 12,
      lineHeight: 19,
      color: theme.colors.text,
      padding: theme.spacing.lg,
    },
    academicSection: { marginBottom: theme.spacing.xl },
    academicCard: {
      backgroundColor: theme.colors.surface,
      borderWidth: 1,
      borderColor: theme.colors.border,
      borderRadius: theme.radius.medium,
      padding: theme.spacing.lg,
      marginTop: theme.spacing.sm,
    },
    academicHeader: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      gap: theme.spacing.md,
    },
    academicTitle: {
      flex: 1,
      fontFamily: theme.fonts.bold,
      fontSize: 14,
      color: theme.colors.text,
    },
    percentage: {
      fontFamily: theme.fonts.bold,
      fontSize: 13,
      color: theme.colors.success,
    },
    academicInstitution: {
      fontFamily: theme.fonts.medium,
      fontSize: 12,
      color: theme.colors.textSecondary,
      marginTop: 5,
    },
    academicMeta: {
      fontFamily: theme.fonts.medium,
      fontSize: 11,
      color: theme.colors.textMuted,
      marginTop: 4,
    },
    centeredState: {
      flex: 1,
      alignItems: "center",
      justifyContent: "center",
      paddingHorizontal: theme.spacing.xxxl,
    },
    stateIcon: {
      width: 48,
      height: 48,
      alignItems: "center",
      justifyContent: "center",
      borderRadius: 16,
      backgroundColor: theme.colors.dangerSoft,
      marginBottom: theme.spacing.lg,
    },
    stateTitle: {
      fontFamily: theme.fonts.bold,
      fontSize: 18,
      color: theme.colors.text,
    },
    stateText: {
      fontFamily: theme.fonts.medium,
      fontSize: 13,
      lineHeight: 20,
      color: theme.colors.textSecondary,
      textAlign: "center",
      marginTop: theme.spacing.sm,
    },
    retryButton: {
      marginTop: theme.spacing.xl,
      backgroundColor: theme.colors.accent,
      borderRadius: theme.radius.small,
      paddingHorizontal: theme.spacing.lg,
      paddingVertical: theme.spacing.md,
    },
    retryText: {
      fontFamily: theme.fonts.semiBold,
      fontSize: 13,
      color: theme.colors.white,
    },
  });
