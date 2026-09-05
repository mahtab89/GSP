import { StyleSheet, Text, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";

import type { AttendanceData } from "../models/attendance";
import { useTheme } from "../theme/ThemeContext";
import type { AppTheme } from "../theme/theme";

interface Props {
  attendance: AttendanceData;
}

function getStatus(percentage: number, theme: AppTheme) {
  if (percentage >= 75) {
    return {
      label: "Good standing",
      icon: "checkmark-circle" as const,
      color: theme.colors.success,
      background: theme.colors.successSoft,
    };
  }

  if (percentage >= 60) {
    return {
      label: "Needs attention",
      icon: "alert-circle" as const,
      color: theme.colors.warning,
      background: theme.colors.warningSoft,
    };
  }

  return {
    label: "Low attendance",
    icon: "warning" as const,
    color: theme.colors.danger,
    background: theme.colors.dangerSoft,
  };
}

export function AttendanceOverview({ attendance }: Props) {
  const { theme } = useTheme();
  const styles = createStyles(theme);
  const status = getStatus(attendance.summary.overall, theme);

  return (
    <View style={styles.container}>
      <View style={styles.topRow}>
        <View>
          <Text style={styles.label}>OVERALL ATTENDANCE</Text>

          <View style={styles.percentageRow}>
            <Text style={styles.percentage}>
              {attendance.summary.overall.toFixed(1)}
            </Text>
            <Text style={styles.percentSymbol}>%</Text>
          </View>
        </View>

        <View
          style={[styles.statusBadge, { backgroundColor: status.background }]}
        >
          <Ionicons name={status.icon} size={15} color={status.color} />
          <Text style={[styles.statusText, { color: status.color }]}>
            {status.label}
          </Text>
        </View>
      </View>

      <View style={styles.divider} />

      <View style={styles.breakdown}>
        <Breakdown label="Theory" value={attendance.summary.theory} />

        <View style={styles.verticalDivider} />

        <Breakdown label="Lab" value={attendance.summary.lab} />
      </View>
    </View>
  );
}

function Breakdown({ label, value }: { label: string; value: number }) {
  const { theme } = useTheme();
  const styles = createStyles(theme);
  return (
    <View style={styles.breakdownItem}>
      <Text style={styles.breakdownLabel}>{label}</Text>

      <Text style={styles.breakdownValue}>{value.toFixed(2)}%</Text>
    </View>
  );
}

const createStyles = (theme: AppTheme) =>
  StyleSheet.create({
    container: {
      backgroundColor: theme.colors.surface,
      borderRadius: theme.radius.large,
      borderWidth: 1,
      borderColor: theme.colors.border,
      padding: theme.spacing.xxl,
      marginBottom: theme.spacing.xxl,
    },

    topRow: {
      flexDirection: "row",
      alignItems: "flex-start",
      justifyContent: "space-between",
    },

    label: {
      fontFamily: theme.fonts.semiBold,
      fontSize: 11,
      letterSpacing: 0.8,
      color: theme.colors.textMuted,
      marginBottom: 5,
    },

    percentageRow: {
      flexDirection: "row",
      alignItems: "baseline",
    },

    percentage: {
      fontFamily: theme.fonts.extraBold,
      fontSize: 48,
      lineHeight: 56,
      letterSpacing: -1.5,
      color: theme.colors.text,
    },

    percentSymbol: {
      fontFamily: theme.fonts.bold,
      fontSize: 22,
      color: theme.colors.textSecondary,
      marginLeft: 3,
    },

    statusBadge: {
      flexDirection: "row",
      alignItems: "center",
      gap: 5,
      borderRadius: theme.radius.pill,
      paddingHorizontal: 10,
      paddingVertical: 7,
    },

    statusText: {
      fontFamily: theme.fonts.semiBold,
      fontSize: 11,
    },

    divider: {
      height: 1,
      backgroundColor: theme.colors.border,
      marginVertical: theme.spacing.xl,
    },

    breakdown: {
      flexDirection: "row",
      alignItems: "center",
    },

    breakdownItem: {
      flex: 1,
    },

    breakdownLabel: {
      fontFamily: theme.fonts.medium,
      fontSize: 12,
      color: theme.colors.textSecondary,
      marginBottom: 4,
    },

    breakdownValue: {
      fontFamily: theme.fonts.bold,
      fontSize: 18,
      color: theme.colors.text,
    },

    verticalDivider: {
      width: 1,
      height: 34,
      backgroundColor: theme.colors.border,
      marginHorizontal: theme.spacing.xl,
    },
  });
