import { parseDocument } from "htmlparser2";
import { findAll, getAttributeValue, textContent } from "domutils";

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

function normalizeText(value: string): string {
  return value
    .replace(/\u00a0/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function getElementText(element: any): string {
  return normalizeText(textContent(element));
}

function parseNumber(value: string): number {
  const match = value.match(/\d+(?:\.\d+)?/);
  if (!match) {
    return 0;
  }
  const number = Number.parseFloat(match[0]);
  return Number.isFinite(number) ? number : 0;
}

function parsePercentage(value: string): number {
  const match = value.match(/\d+(?:\.\d+)?/);
  if (!match) {
    return 0;
  }
  const percentage = Number.parseFloat(match[0]);
  return Number.isFinite(percentage) ? Number(percentage.toFixed(2)) : 0;
}

interface UpdatePanel {
  id: string;
  html: string;
}

function extractUpdatePanels(response: string): UpdatePanel[] {
  const panels: UpdatePanel[] = [];
  let position = 0;

  while (position < response.length) {
    const match = response
      .slice(position)
      .match(/\|(\d+)\|updatePanel\|([^|]+)\|/);

    if (!match || match.index === undefined) {
      break;
    }

    const matchStart = position + match.index;
    const contentLength = Number.parseInt(match[1], 10);
    const panelId = match[2];

    const contentStart = matchStart + match[0].length;

    if (
      !Number.isFinite(contentLength) ||
      contentLength < 0 ||
      contentStart > response.length
    ) {
      break;
    }

    const html = response.slice(contentStart, contentStart + contentLength);

    panels.push({
      id: panelId,
      html,
    });

    position = contentStart + contentLength;
  }

  return panels;
}

function findElementById(root: any, idSuffix: string): any | null {
  const elements = findAll(
    (element) =>
      element.type === "tag" &&
      !!getAttributeValue(element, "id")?.endsWith(idSuffix),
    root.children ?? [],
  );

  return elements[0] ?? null;
}

function findTextById(root: any, idSuffix: string): string {
  const element = findElementById(root, idSuffix);
  if (!element) {
    return "";
  }
  return getElementText(element).replace(/^:\s*/, "").trim();
}

function parseStudentInfo(document: any): {
  rollNo: string;
  registrationNo: string;
  name: string;
  branch: string;
  batch: string;
  semester: number;
  section: string;
  group: string;
} {
  const info = {
    rollNo: findTextById(document, "RollNoLabel"),
    registrationNo: findTextById(document, "RegdNoLabel"),
    name: findTextById(document, "NameLabel"),
    branch: findTextById(document, "BranchLabel"),
    batch: findTextById(document, "BatchLabel"),
    semester: parseNumber(findTextById(document, "SemesterLabel")),
    section: findTextById(document, "SectionLabel"),
    group: findTextById(document, "GroupLabel"),
  };
  return info;
}

function parseAttendanceType(value: string): AttendanceType {
  const normalized = normalizeText(value).toUpperCase();
  if (normalized.includes("PRACTICAL") || normalized.includes("LAB")) {
    return "PRACTICAL/LAB";
  }
  return "THEORY";
}

function findAttendanceGrid(document: any): any | null {
  const exactGrid = findAll(
    (element) =>
      element.type === "tag" &&
      element.name === "table" &&
      !!getAttributeValue(element, "id")?.endsWith("DataGrid1"),
    document.children ?? [],
  );

  if (exactGrid.length > 0) {
    return exactGrid[0];
  }

  const tables = findAll(
    (element) => element.type === "tag" && element.name === "table",
    document.children ?? [],
  );

  for (const table of tables) {
    const text = getElementText(table);
    if (
      text.includes("Subject") &&
      text.includes("Th/Lab") &&
      text.includes("TotClTaken") &&
      text.includes("TotClAtt") &&
      text.includes("Percentage")
    ) {
      return table;
    }
  }

  return null;
}

function parseAttendanceSubjects(document: any): SubjectAttendance[] {
  const table = findAttendanceGrid(document);
  if (!table) {
    return [];
  }

  const rows = findAll(
    (element) => element.type === "tag" && element.name === "tr",
    table.children ?? [],
  );

  const subjects: SubjectAttendance[] = [];

  for (const row of rows) {
    const cells = findAll(
      (element) => element.type === "tag" && element.name === "td",
      row.children ?? [],
    );

    if (cells.length < 5) {
      continue;
    }

    const values = cells.map(getElementText);
    const subjectName = values[0];
    const typeText = values[1];

    if (
      subjectName.toLowerCase() === "subject" ||
      typeText.toLowerCase() === "th/lab"
    ) {
      continue;
    }

    const classesTaken = parseNumber(values[2]);
    const classesAttended = parseNumber(values[3]);
    const percentage = parsePercentage(values[4]);

    if (
      !subjectName ||
      (classesTaken === 0 && classesAttended === 0 && percentage === 0)
    ) {
      continue;
    }

    subjects.push({
      name: subjectName,
      type: parseAttendanceType(typeText),
      classesTaken,
      classesAttended,
      percentage,
    });
  }

  return subjects;
}

function parseSummary(document: any): AttendanceSummary {
  const overall = parsePercentage(findTextById(document, "OveralPerLabel"));
  const theory = parsePercentage(findTextById(document, "ThPerLabel"));
  const lab = parsePercentage(findTextById(document, "PraPerLabel"));

  return {
    overall,
    theory,
    lab,
  };
}

export function parseAttendance(response: string): AttendanceData {
  if (!response || !response.trim()) {
    throw new Error("Attendance response is empty");
  }

  const availableSemesters = parseAvailableSemesters(response);
  const panels = extractUpdatePanels(response);

  let document: any;

  if (panels.length > 0) {
    const html = panels.map((panel) => panel.html).join("\n");
    document = parseDocument(html);
  } else {
    document = parseDocument(response);
  }

  const studentInfo = parseStudentInfo(document);
  const subjects = parseAttendanceSubjects(document);

  if (subjects.length === 0) {
    throw new Error("Attendance subjects not found");
  }

  const summary = parseSummary(document);

  const attendance: AttendanceData = {
    rollNo: studentInfo.rollNo,
    registrationNo: studentInfo.registrationNo,
    name: studentInfo.name,
    branch: studentInfo.branch,
    batch: studentInfo.batch,
    semester: studentInfo.semester,
    section: studentInfo.section,
    group: studentInfo.group,
    availableSemesters,
    subjects,
    summary,
    fetchedAt: new Date().toISOString(),
  };

  return attendance;
}

export function parseAvailableSemesters(response: string): number[] {
  if (!response || !response.trim()) {
    return [];
  }

  const document = parseDocument(response);

  const selects = findAll(
    (element) =>
      element.type === "tag" &&
      element.name === "select" &&
      !!getAttributeValue(element, "id")?.endsWith("SemesterDropDownList"),
    document.children ?? [],
  );

  if (selects.length === 0) {
    return [];
  }

  const options = findAll(
    (element) => element.type === "tag" && element.name === "option",
    selects[0].children ?? [],
  );

  const semesters = options
    .map((option) => {
      const value = getAttributeValue(option, "value") ?? "";
      const text = normalizeText(textContent(option));
      const number = Number.parseInt(value, 10);

      if (Number.isFinite(number) && number > 0) {
        return number;
      }

      const textMatch = text.match(/\d+/);
      return textMatch ? Number.parseInt(textMatch[0], 10) : 0;
    })
    .filter((semester) => semester > 0);

  const unique = [...new Set(semesters)].sort((a, b) => a - b);
  return unique;
}