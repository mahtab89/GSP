import { ScrollView, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import Svg, { Circle } from "react-native-svg";

import type { AttendanceData } from "../models/attendance";
import { formatBranchShort, formatRelativeTime } from "../utils/formatters";

import { useTheme } from "../theme/ThemeContext";
import type { AppTheme } from "../theme/theme";

interface Props {
  attendance: AttendanceData;
  lastFetched: number | null;
}

interface CircularProgressProps {
  percentage: number;
  size: number;
  strokeWidth: number;
  color: string;
  backgroundColor: string;
  label: string;
}

function CircularProgress({
  percentage,
  size,
  strokeWidth,
  color,
  backgroundColor,
  label,
}: CircularProgressProps) {
  const { theme } = useTheme();
  const styles = createProgressStyles(theme);

  const safePercentage = Math.min(Math.max(percentage, 0), 100);

  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;

  const dashOffset = circumference - (safePercentage / 100) * circumference;

  return (
    <View
      style={[
        styles.progressContainer,
        {
          width: size,
          height: size,
        },
      ]}
    >
      <Svg width={size} height={size} style={styles.progressSvg}>
        {/* Background circle */}
        <Circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={backgroundColor}
          strokeWidth={strokeWidth}
          fill="none"
        />

        {/* Progress circle */}
        <Circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={color}
          strokeWidth={strokeWidth}
          fill="none"
          strokeLinecap="round"
          strokeDasharray={`${circumference} ${circumference}`}
          strokeDashoffset={dashOffset}
          transform={`rotate(-90 ${size / 2} ${size / 2})`}
        />
      </Svg>

      <View style={styles.progressCenter}>
        <Text
          style={[
            styles.progressValue,
            {
              fontSize: size >= 130 ? 28 : 17,
              color,
            },
          ]}
        >
          {Math.round(safePercentage)}%
        </Text>

        <Text style={styles.progressLabel}>{label}</Text>
      </View>
    </View>
  );
}

export function HomeScreen({ attendance, lastFetched }: Props) {
  const { theme } = useTheme();
  const styles = createStyles(theme);

  const theorySubjects = attendance.subjects.filter(
    (subject) => subject.type === "THEORY",
  );

  const labSubjects = attendance.subjects.filter(
    (subject) => subject.type === "PRACTICAL/LAB",
  );

  const calculateAverage = (subjects: AttendanceData["subjects"]) => {
    if (subjects.length === 0) {
      return 0;
    }

    return (
      subjects.reduce((total, subject) => total + subject.percentage, 0) /
      subjects.length
    );
  };

  const theoryPercentage = calculateAverage(theorySubjects);
  const labPercentage = calculateAverage(labSubjects);
  const overallPercentage = calculateAverage(attendance.subjects);

  const goodSubjects = attendance.subjects.filter(
    (subject) => subject.percentage >= 75,
  ).length;

  const atRiskSubjects = attendance.subjects.filter(
    (subject) => subject.percentage < 75,
  ).length;

  const highestPercentage =
    attendance.subjects.length > 0
      ? Math.max(...attendance.subjects.map((subject) => subject.percentage))
      : 0;

  const isGoodAttendance = overallPercentage >= 75;

  const statusTitle = isGoodAttendance
    ? "You're in good standing"
    : "Attendance needs attention";

  const statusText = isGoodAttendance
    ? "Your overall attendance is above the 75% requirement."
    : "Your overall attendance is below the 75% requirement.";

  return (
    <SafeAreaView style={styles.safeArea} edges={["top", "left", "right"]}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.content}
      >
        <View style={styles.header}>
          <View>
            <Text style={styles.greeting}>Dashboard</Text>

            <Text style={styles.title}>
              Welcome, {attendance.name.split(" ")[0]}
            </Text>
          </View>

          <View style={styles.iconContainer}>
            <Ionicons
              name="home-outline"
              size={20}
              color={theme.colors.textSecondary}
            />
          </View>
        </View>

        <View style={styles.studentInfo}>
          <View style={styles.infoItem}>
            <Text style={styles.infoLabel}>Roll No</Text>

            <Text style={styles.infoValue}>{attendance.rollNo}</Text>
          </View>

          <View style={styles.infoDivider} />

          <View style={styles.infoItem}>
            <Text style={styles.infoLabel}>Semester</Text>

            <Text style={styles.infoValue}>{attendance.semester}</Text>
          </View>

          <View style={styles.infoDivider} />

          <View style={styles.infoItem}>
            <Text style={styles.infoLabel}>Branch</Text>

            <Text style={styles.infoValue}>
              {formatBranchShort(attendance.branch)}
            </Text>
          </View>
        </View>

        <View style={styles.attendanceCard}>
          <Text style={styles.cardTitle}>Attendance</Text>

          <Text style={styles.cardSubtitle}>Current semester overview</Text>

          <View style={styles.attendanceGraphs}>
            {/* Theory */}
            <View style={styles.smallGraph}>
              <CircularProgress
                percentage={theoryPercentage}
                size={82}
                strokeWidth={8}
                color={theme.colors.accent}
                backgroundColor={theme.colors.border}
                label="Theory"
              />

              <Text style={styles.graphCount}>
                {theorySubjects.length} subjects
              </Text>
            </View>

            {/* Overall */}
            <View style={styles.mainGraph}>
              <CircularProgress
                percentage={overallPercentage}
                size={130}
                strokeWidth={13}
                color={
                  overallPercentage >= 75
                    ? theme.colors.success
                    : theme.colors.warning
                }
                backgroundColor={theme.colors.border}
                label="Overall"
              />
            </View>

            {/* Lab */}
            <View style={styles.smallGraph}>
              <CircularProgress
                percentage={labPercentage}
                size={82}
                strokeWidth={8}
                color={theme.colors.accent}
                backgroundColor={theme.colors.border}
                label="Lab"
              />

              <Text style={styles.graphCount}>
                {labSubjects.length} subjects
              </Text>
            </View>
          </View>
        </View>

        <View style={styles.subjectSummary}>
          <View style={styles.summaryHeader}>
            <View>
              <Text style={styles.sectionTitle}>Subject Overview</Text>

              <Text style={styles.sectionSubtitle}>
                {attendance.subjects.length} subjects this semester
              </Text>
            </View>

            <View style={styles.summaryIcon}>
              <Ionicons
                name="book-outline"
                size={18}
                color={theme.colors.accent}
              />
            </View>
          </View>

          <View style={styles.summaryStats}>
            {/* Good */}
            <View style={styles.summaryStat}>
              <Text style={styles.summaryValue}>{goodSubjects}</Text>

              <Text style={styles.summaryLabel}>Good</Text>
            </View>

            <View style={styles.summaryDivider} />

            {/* At Risk */}
            <View style={styles.summaryStat}>
              <Text
                style={[
                  styles.summaryValue,
                  {
                    color:
                      atRiskSubjects > 0
                        ? theme.colors.warning
                        : theme.colors.success,
                  },
                ]}
              >
                {atRiskSubjects}
              </Text>

              <Text style={styles.summaryLabel}>At Risk</Text>
            </View>

            <View style={styles.summaryDivider} />

            {/* Highest */}
            <View style={styles.summaryStat}>
              <Text style={styles.summaryValue}>
                {Math.round(highestPercentage)}%
              </Text>

              <Text style={styles.summaryLabel}>Highest</Text>
            </View>
          </View>
        </View>

        <View
          style={[
            styles.statusCard,
            {
              backgroundColor: isGoodAttendance
                ? theme.colors.successSoft + "20"
                : theme.colors.warning + "15",
              borderColor: isGoodAttendance
                ? theme.colors.success + "30"
                : theme.colors.warning + "30",
            },
          ]}
        >
          <View
            style={[
              styles.statusIcon,
              {
                backgroundColor: isGoodAttendance
                  ? theme.colors.successSoft
                  : theme.colors.warning + "20",
              },
            ]}
          >
            <Ionicons
              name={isGoodAttendance ? "checkmark" : "alert-outline"}
              size={20}
              color={
                isGoodAttendance ? theme.colors.success : theme.colors.warning
              }
            />
          </View>

          <View style={styles.statusContent}>
            <Text style={styles.statusTitle}>{statusTitle}</Text>

            <Text style={styles.statusText}>{statusText}</Text>
          </View>
        </View>

        <View style={styles.quickInfo}>
          <View style={styles.quickInfoItem}>
            <Ionicons
              name="book-outline"
              size={17}
              color={theme.colors.textSecondary}
            />

            <Text style={styles.quickInfoText}>
              {theorySubjects.length} Theory
            </Text>
          </View>

          <View style={styles.quickInfoDivider} />

          <View style={styles.quickInfoItem}>
            <Ionicons
              name="flask-outline"
              size={17}
              color={theme.colors.textSecondary}
            />

            <Text style={styles.quickInfoText}>{labSubjects.length} Labs</Text>
          </View>

          <View style={styles.quickInfoDivider} />

          <View style={styles.quickInfoItem}>
            <Ionicons
              name="school-outline"
              size={17}
              color={theme.colors.textSecondary}
            />

            <Text style={styles.quickInfoText}>
              Semester {attendance.semester}
            </Text>
          </View>
        </View>

        {lastFetched && (
          <View style={styles.lastFetched}>
            <Text style={styles.lastFetchedText}>
              Last fetched: {formatRelativeTime(new Date(lastFetched))}
            </Text>
          </View>
        )}

      </ScrollView>
    </SafeAreaView>
  );
}

const createProgressStyles = (theme: AppTheme) =>
  StyleSheet.create({
    progressContainer: {
      alignItems: "center",
      justifyContent: "center",
    },

    progressSvg: {
      position: "absolute",
      top: 0,
      left: 0,
    },

    progressCenter: {
      position: "absolute",
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      alignItems: "center",
      justifyContent: "center",
    },

    progressValue: {
      fontFamily: theme.fonts.bold,
    },

    progressLabel: {
      fontFamily: theme.fonts.medium,
      fontSize: 10,
      color: theme.colors.textSecondary,
      marginTop: 2,
    },
  });

const createStyles = (theme: AppTheme) =>
  StyleSheet.create({
    safeArea: {
      flex: 1,
      backgroundColor: theme.colors.background,
    },

    content: {
      paddingHorizontal: theme.spacing.xl,
      paddingTop: theme.spacing.lg,
      paddingBottom: theme.spacing.xxxl,
    },

    header: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      marginBottom: theme.spacing.lg,
    },

    greeting: {
      fontFamily: theme.fonts.medium,
      fontSize: 12,
      color: theme.colors.textSecondary,
      marginBottom: 3,
    },

    title: {
      fontFamily: theme.fonts.bold,
      fontSize: 21,
      letterSpacing: -0.4,
      color: theme.colors.text,
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

    studentInfo: {
      flexDirection: "row",
      alignItems: "center",
      padding: theme.spacing.lg,
      backgroundColor: theme.colors.surface,
      borderWidth: 1,
      borderColor: theme.colors.border,
      borderRadius: theme.radius.medium,
      marginBottom: theme.spacing.lg,
    },

    infoItem: {
      flex: 1,
      alignItems: "center",
    },

    infoLabel: {
      fontFamily: theme.fonts.medium,
      fontSize: 11,
      color: theme.colors.textSecondary,
      marginBottom: theme.spacing.xs,
    },

    infoValue: {
      fontFamily: theme.fonts.semiBold,
      fontSize: 14,
      color: theme.colors.text,
    },

    infoDivider: {
      width: 1,
      height: 30,
      backgroundColor: theme.colors.border,
    },

    attendanceCard: {
      backgroundColor: theme.colors.surface,
      borderWidth: 1,
      borderColor: theme.colors.border,
      borderRadius: theme.radius.medium,
      padding: theme.spacing.lg,
      marginBottom: theme.spacing.lg,
    },

    cardTitle: {
      fontFamily: theme.fonts.semiBold,
      fontSize: 15,
      color: theme.colors.text,
    },

    cardSubtitle: {
      fontFamily: theme.fonts.medium,
      fontSize: 11,
      color: theme.colors.textSecondary,
      marginTop: 3,
    },

    attendanceGraphs: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      marginTop: theme.spacing.xl,
      paddingHorizontal: theme.spacing.sm,
    },

    smallGraph: {
      width: 78,
      alignItems: "center",
      justifyContent: "center",
    },

    mainGraph: {
      width: 130,
      height: 130,
      alignItems: "center",
      justifyContent: "center",
    },

    graphCount: {
      fontFamily: theme.fonts.medium,
      fontSize: 10,
      color: theme.colors.textSecondary,
      marginTop: theme.spacing.xs,
    },

    subjectSummary: {
      backgroundColor: theme.colors.surface,
      borderWidth: 1,
      borderColor: theme.colors.border,
      borderRadius: theme.radius.medium,
      padding: theme.spacing.lg,
      marginBottom: theme.spacing.lg,
    },

    summaryHeader: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      marginBottom: theme.spacing.lg,
    },

    sectionTitle: {
      fontFamily: theme.fonts.semiBold,
      fontSize: 15,
      color: theme.colors.text,
    },

    sectionSubtitle: {
      fontFamily: theme.fonts.medium,
      fontSize: 11,
      color: theme.colors.textSecondary,
      marginTop: 3,
    },

    summaryIcon: {
      width: 34,
      height: 34,
      borderRadius: 10,
      alignItems: "center",
      justifyContent: "center",
      backgroundColor: theme.colors.accent + "15",
    },

    summaryStats: {
      flexDirection: "row",
      alignItems: "center",
    },

    summaryStat: {
      flex: 1,
      alignItems: "center",
    },

    summaryValue: {
      fontFamily: theme.fonts.bold,
      fontSize: 18,
      color: theme.colors.text,
    },

    summaryLabel: {
      fontFamily: theme.fonts.medium,
      fontSize: 10,
      color: theme.colors.textSecondary,
      marginTop: 3,
    },

    summaryDivider: {
      width: 1,
      height: 30,
      backgroundColor: theme.colors.border,
    },

    statusCard: {
      flexDirection: "row",
      alignItems: "center",
      padding: theme.spacing.lg,
      borderWidth: 1,
      borderRadius: theme.radius.medium,
      marginBottom: theme.spacing.lg,
    },

    statusIcon: {
      width: 38,
      height: 38,
      borderRadius: 11,
      alignItems: "center",
      justifyContent: "center",
      marginRight: theme.spacing.md,
    },

    statusContent: {
      flex: 1,
    },

    statusTitle: {
      fontFamily: theme.fonts.semiBold,
      fontSize: 13,
      color: theme.colors.text,
      marginBottom: 3,
    },

    statusText: {
      fontFamily: theme.fonts.medium,
      fontSize: 11,
      lineHeight: 16,
      color: theme.colors.textSecondary,
    },

    quickInfo: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      paddingVertical: theme.spacing.md,
    },

    quickInfoItem: {
      flexDirection: "row",
      alignItems: "center",
      gap: 5,
    },

    quickInfoText: {
      fontFamily: theme.fonts.medium,
      fontSize: 10,
      color: theme.colors.textSecondary,
    },

    quickInfoDivider: {
      width: 1,
      height: 16,
      backgroundColor: theme.colors.border,
      marginHorizontal: theme.spacing.md,
    },

    lastFetched: {
      marginTop: theme.spacing.lg,
      paddingTop: theme.spacing.md,
      borderTopWidth: 1,
      borderTopColor: theme.colors.border,
      alignItems: "center",
    },

    lastFetchedText: {
      fontFamily: theme.fonts.medium,
      fontSize: 10,
      color: theme.colors.textSecondary,
    },
  });
