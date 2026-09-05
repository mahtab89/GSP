import { StyleSheet, Text, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";

import type { SubjectAttendance } from "../models/attendance";
import { useTheme } from "../theme/ThemeContext";
import type { AppTheme } from "../theme/theme";

interface Props {
  subject: SubjectAttendance;
}

function getStatus(percentage: number, theme: AppTheme) {
  if (percentage >= 75) {
    return theme.colors.success;
  }

  if (percentage >= 60) {
    return theme.colors.warning;
  }

  return theme.colors.danger;
}

export function AttendanceCard({ subject }: Props) {
  const { theme } = useTheme();
  const styles = createStyles(theme);

  const isLab = subject.type === "PRACTICAL/LAB";
  const statusColor = getStatus(subject.percentage, theme);

  return (
    <View style={styles.container}>
      <View style={styles.iconContainer}>
        <Ionicons
          name={isLab ? "flask-outline" : "book-outline"}
          size={17}
          color={theme.colors.textSecondary}
        />
      </View>

      <View style={styles.content}>
        <View style={styles.topRow}>
          <Text style={styles.name} numberOfLines={1}>
            {subject.name}
          </Text>

          <Text style={[styles.percentage, { color: statusColor }]}>
            {subject.percentage}%
          </Text>
        </View>

        <View style={styles.bottomRow}>
          <Text style={styles.type}>{isLab ? "LAB" : "THEORY"}</Text>

          <View style={styles.dot} />

          <Text style={styles.classes}>
            {subject.classesAttended}/{subject.classesTaken} classes
          </Text>
        </View>
      </View>
    </View>
  );
}

const createStyles = (theme: AppTheme) =>
  StyleSheet.create({
    container: {
      flexDirection: "row",
      alignItems: "center",
      backgroundColor: theme.colors.surface,
      borderWidth: 1,
      borderColor: theme.colors.border,
      borderRadius: theme.radius.medium,
      paddingHorizontal: theme.spacing.md,
      paddingVertical: theme.spacing.md,
      marginBottom: theme.spacing.sm,
    },

    iconContainer: {
      width: 34,
      height: 34,
      borderRadius: 10,
      alignItems: "center",
      justifyContent: "center",
      backgroundColor: theme.colors.surfaceMuted,
      marginRight: theme.spacing.md,
    },

    content: {
      flex: 1,
      minWidth: 0,
    },

    topRow: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
    },

    name: {
      flex: 1,
      fontFamily: theme.fonts.semiBold,
      fontSize: 13,
      color: theme.colors.text,
      marginRight: theme.spacing.md,
    },

    percentage: {
      fontFamily: theme.fonts.bold,
      fontSize: 13,
    },

    bottomRow: {
      flexDirection: "row",
      alignItems: "center",
      marginTop: 5,
    },

    type: {
      fontFamily: theme.fonts.semiBold,
      fontSize: 8,
      letterSpacing: 0.7,
      color: theme.colors.textMuted,
    },

    dot: {
      width: 3,
      height: 3,
      borderRadius: 2,
      backgroundColor: theme.colors.textMuted,
      marginHorizontal: 7,
    },

    classes: {
      fontFamily: theme.fonts.medium,
      fontSize: 10,
      color: theme.colors.textSecondary,
    },
  });
