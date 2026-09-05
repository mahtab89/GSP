import { StyleSheet, View } from "react-native";

import type { SubjectAttendance } from "../models/attendance";
import { AttendanceCard } from "./AttendanceCard";

interface Props {
  subjects: SubjectAttendance[];
}

export function SubjectList({ subjects }: Props) {
  return (
    <View style={styles.list}>
      {subjects.map((subject, index) => (
        <AttendanceCard key={`${subject.name}-${index}`} subject={subject} />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  list: {
    gap: 10,
  },
});
