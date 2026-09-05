import { useState } from "react";
import {
  ActivityIndicator,
  Modal,
  Pressable,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { SafeAreaView } from "react-native-safe-area-context";

import type { AttendanceData } from "../models/attendance";
import { formatBranchShort } from "../utils/formatters";

import { AttendanceOverview } from "../components/AttendanceOverview";
import { SubjectList } from "../components/SubjectList";

import { useTheme } from "../theme/ThemeContext";
import type { AppTheme } from "../theme/theme";

interface Props {
  attendance: AttendanceData | null;
  attendanceBySemester: Record<number, AttendanceData>;
  onRefresh: () => Promise<void>;
  refreshing: boolean;
  onSemesterChange: (semester: number) => void;
}

export function AttendanceScreen({ attendance, attendanceBySemester, onRefresh, refreshing, onSemesterChange }: Props) {
  const { theme } = useTheme();
  const styles = createStyles(theme);

  const [selectedSemester, setSelectedSemester] = useState(
    attendance?.semester ?? 3,
  );

  const [semesterModalVisible, setSemesterModalVisible] = useState(false);

  const handleRefresh = async () => {
    await onRefresh();
  };

  const handleSemesterChange = (semester: number) => {
    if (semester === selectedSemester) {
      setSemesterModalVisible(false);
      return;
    }

    setSelectedSemester(semester);
    setSemesterModalVisible(false);
    onSemesterChange(semester);
  };

  if (!attendance) {
    return (
      <SafeAreaView style={styles.safeArea} edges={["top", "left", "right"]}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="small" color={theme.colors.accent} />

          <Text style={styles.loadingText}>Loading attendance...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea} edges={["top", "left", "right"]}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.content}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            tintColor={theme.colors.accent}
            progressBackgroundColor={theme.colors.surface}
          />
        }
      >
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.headerText}>
            <Text style={styles.title}>Attendance</Text>

            <Text style={styles.subtitle}>
              {attendance.name} • {formatBranchShort(attendance.branch)}
            </Text>
          </View>

          {/* Semester selector */}
          {attendance.availableSemesters.length > 0 && (
            <Pressable
              style={styles.semesterButton}
              onPress={() => setSemesterModalVisible(true)}
            >
              <>
                <Text style={styles.semesterText}>
                  Sem {selectedSemester}
                </Text>

                <Ionicons
                  name="chevron-down"
                  size={14}
                  color={theme.colors.textSecondary}
                />
              </>
            </Pressable>
          )}
        </View>

        {/* Overall attendance */}
        <AttendanceOverview attendance={attendance} />

        {/* Subjects */}
        <View style={styles.subjectsHeader}>
          <View>
            <Text style={styles.subjectsTitle}>Subjects</Text>

            <Text style={styles.subjectsSubtitle}>
              {attendance.subjects.length} subjects this semester
            </Text>
          </View>
        </View>

        <SubjectList subjects={attendance.subjects} />
      </ScrollView>

      {/* Semester modal */}
      <Modal
        visible={semesterModalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setSemesterModalVisible(false)}
      >
        <Pressable
          style={styles.overlay}
          onPress={() => setSemesterModalVisible(false)}
        >
          <Pressable
            style={styles.dropdown}
            onPress={(event) => event.stopPropagation()}
          >
            <Text style={styles.dropdownTitle}>Select Semester</Text>

            {attendance.availableSemesters.map((semester) => {
              const selected = semester === selectedSemester;

              return (
                <Pressable
                  key={semester}
                  style={[styles.option, selected && styles.selectedOption]}
                  onPress={() => handleSemesterChange(semester)}
                >
                  <Text
                    style={[
                      styles.optionText,
                      selected && styles.selectedOptionText,
                    ]}
                  >
                    Semester {semester}
                  </Text>

                  {selected && (
                    <Ionicons
                      name="checkmark"
                      size={17}
                      color={theme.colors.text}
                    />
                  )}
                </Pressable>
              );
            })}
          </Pressable>
        </Pressable>
      </Modal>
    </SafeAreaView>
  );
}

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

    headerText: {
      flex: 1,
      minWidth: 0,
      paddingRight: theme.spacing.md,
    },

    title: {
      fontFamily: theme.fonts.bold,
      fontSize: 22,
      letterSpacing: -0.5,
      color: theme.colors.text,
    },

    subtitle: {
      fontFamily: theme.fonts.medium,
      fontSize: 12,
      color: theme.colors.textSecondary,
      marginTop: 4,
    },

    semesterButton: {
      height: 38,
      minWidth: 76,
      paddingHorizontal: 10,
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      borderRadius: 10,
      backgroundColor: theme.colors.surface,
      borderWidth: 1,
      borderColor: theme.colors.border,
    },

    semesterText: {
      fontFamily: theme.fonts.semiBold,
      fontSize: 11,
      color: theme.colors.text,
      marginRight: 4,
    },

    disabled: {
      opacity: 0.5,
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
      marginTop: theme.spacing.md,
    },

    subjectsHeader: {
      marginTop: theme.spacing.lg,
      marginBottom: theme.spacing.md,
    },

    subjectsTitle: {
      fontFamily: theme.fonts.bold,
      fontSize: 17,
      color: theme.colors.text,
    },

    subjectsSubtitle: {
      fontFamily: theme.fonts.medium,
      fontSize: 11,
      color: theme.colors.textSecondary,
      marginTop: 3,
    },

    overlay: {
      flex: 1,
      backgroundColor: "rgba(0, 0, 0, 0.18)",
      justifyContent: "flex-start",
      alignItems: "flex-end",
      paddingTop: 80,
      paddingRight: 20,
    },

    dropdown: {
      width: 170,
      backgroundColor: theme.colors.surface,
      borderRadius: 12,
      borderWidth: 1,
      borderColor: theme.colors.border,
      padding: 6,

      elevation: 5,

      shadowOffset: {
        width: 0,
        height: 3,
      },

      shadowOpacity: 0.12,
      shadowRadius: 8,
    },

    dropdownTitle: {
      fontFamily: theme.fonts.bold,
      fontSize: 12,
      color: theme.colors.textSecondary,
      paddingHorizontal: 10,
      paddingVertical: 8,
    },

    option: {
      minHeight: 38,
      borderRadius: 8,
      paddingHorizontal: 10,
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
    },

    selectedOption: {
      backgroundColor: theme.colors.background,
    },

    optionText: {
      fontFamily: theme.fonts.medium,
      fontSize: 13,
      color: theme.colors.text,
    },

    selectedOptionText: {
      fontFamily: theme.fonts.bold,
    },
  });
