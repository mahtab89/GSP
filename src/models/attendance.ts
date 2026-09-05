export type AttendanceType = "THEORY" | "PRACTICAL/LAB";

export interface SubjectAttendance {
  name: string;
  type: AttendanceType;
  classesTaken: number;
  classesAttended: number;
  percentage: number;
}

export interface AttendanceSummary {
  overall: number;
  theory: number;
  lab: number;
}

export interface AttendanceData {
  rollNo: string;
  registrationNo: string;
  name: string;
  branch: string;

  batch: string;
  semester: number;
  section: string;
  group: string;

  availableSemesters: number[];

  subjects: SubjectAttendance[];
  summary: AttendanceSummary;

  fetchedAt: string;
}
