import { parseDocument } from "htmlparser2";
import { findAll, getAttributeValue, textContent } from "domutils";

export interface Address {
  atPo: string;
  cityVia: string;
  district: string;
  state: string;
  pin: string;
}

export interface AcademicDetail {
  examination: string;
  institution: string;
  boardUniversity: string;
  stream: string;
  year: string;
  division: string;
  percentage: number | null;
}

export interface HostelDetail {
  hostel: string;
  block: string;
  roomNo: string;
}

export interface StudentProfile {
  rollNo: string;
  registrationNo: string;
  name: string;
  branch: string;
  fatherName: string;
  motherName: string;
  studentMobile: string;
  whatsappNo: string;
  fatherMobile: string;
  email: string;
  dob: string;
  admissionCategory: string;
  admissionDate: string;
  category: string;
  sex: string;
  photoPath: string | null;
  hostel: HostelDetail;
  mailingAddress: Address;
  permanentAddress: Address;
  academicDetails: AcademicDetail[];
  fetchedAt: string;
}

function clean(value: string): string {
  return value.replace(/\s+/g, " ").trim();
}

function getLabelValue(html: string, suffix: string): string {
  const document = parseDocument(html);

  const elements = findAll(
    (element) =>
      element.type === "tag" &&
      element.name === "span" &&
      getAttributeValue(element, "id")?.endsWith(suffix) === true,
    document.children,
  );

  if (elements.length === 0) {
    return "";
  }

  return clean(textContent(elements[0]));
}

function getPhotoPath(html: string): string | null {
  const document = parseDocument(html);

  const images = findAll(
    (element) =>
      element.type === "tag" &&
      element.name === "img" &&
      getAttributeValue(element, "id")?.endsWith("Image1") === true,
    document.children,
  );

  if (images.length === 0) {
    return null;
  }

  return getAttributeValue(images[0], "src") ?? null;
}

function getProfileTable(html: string) {
  const document = parseDocument(html);

  const tables = findAll(
    (element) => element.type === "tag" && element.name === "table",
    document.children,
  );

  return tables.find(
    (table) =>
      clean(textContent(table)).includes("Profile:") &&
      clean(textContent(table)).includes("RollNo."),
  );
}

function getRows(table: any) {
  return findAll(
    (element) => element.type === "tag" && element.name === "tr",
    [table],
  );
}

function getCells(row: any) {
  return findAll(
    (element) =>
      element.type === "tag" &&
      (element.name === "td" || element.name === "th"),
    [row],
  );
}

function parseAddress(html: string, rows: any[], startIndex: number): Address {
  const address: Address = {
    atPo:
      getLabelValue(html, "MAtPoLabel") ||
      getLabelValue(html, "AtPoLabel") ||
      "",
    cityVia:
      getLabelValue(html, "MCityLabel") ||
      getLabelValue(html, "CityViaLabel") ||
      "",
    district:
      getLabelValue(html, "MDistLabel") ||
      getLabelValue(html, "DistrictLabel") ||
      "",
    state:
      getLabelValue(html, "MStateLabel") ||
      getLabelValue(html, "StateLabel") ||
      "",
    pin:
      getLabelValue(html, "MPinLabel") || getLabelValue(html, "PinLabel") || "",
  };

  return address;
}

function parseHostel(rows: any[], startIndex: number): HostelDetail {
  const hostel: HostelDetail = {
    hostel: "",
    block: "",
    roomNo: "",
  };

  for (let i = startIndex; i < rows.length; i++) {
    const cells = getCells(rows[i]);

    if (cells.length < 2) {
      continue;
    }

    const label = clean(textContent(cells[0]));
    const value = clean(textContent(cells[cells.length - 1]));

    if (label === "Hostel") {
      hostel.hostel = value;
    } else if (label === "Block") {
      hostel.block = value;
    } else if (label === "Room No.") {
      hostel.roomNo = value;
      break;
    }
  }

  return hostel;
}

function parseAcademicDetails(html: string): AcademicDetail[] {
  const document = parseDocument(html);

  const tables = findAll(
    (element) => element.type === "tag" && element.name === "table",
    document.children,
  );

  const academicTable = tables.find((table) => {
    const text = clean(textContent(table));

    return (
      text.includes("Examination") &&
      text.includes("Institution") &&
      text.includes("Percentage") &&
      /(\b10th\b|\bmatric\b|\bsecondary\b|\bclass\s*[xx]?\s*10\b)/i.test(text)
    );
  });

  if (!academicTable) {
    return [];
  }

  const rows = getRows(academicTable);
  const details: AcademicDetail[] = [];

  for (const row of rows) {
    const cells = getCells(row);

    const values = cells
      .map((cell) => clean(textContent(cell)))
      .filter(Boolean);

    if (values.length !== 7) {
      continue;
    }

    const [
      examination,
      institution,
      boardUniversity,
      stream,
      year,
      division,
      percentageText,
    ] = values;

    if (examination === "Examination" || examination === "Institution") {
      continue;
    }

    let exam = examination;
    const examLower = exam.trim().toLowerCase();

    const tenthPatterns = [
      "10th",
      "matric",
      "secondary",
      "class x",
      "class 10",
    ];
    if (tenthPatterns.some((p) => examLower.includes(p))) {
      exam = "matric";
    }

    const interPatterns = [
      "+2",
      "inter",
      "intermediate",
      "12th",
      "higher secondary",
    ];
    if (interPatterns.some((p) => examLower.includes(p))) {
      exam = "inter";
    }

    const percentage = Number.parseFloat(percentageText.replace("%", ""));

    details.push({
      examination: exam,
      institution,
      boardUniversity,
      stream,
      year,
      division,
      percentage: Number.isFinite(percentage) ? percentage : null,
    });
  }

  return details;
}

export function parseStudentProfile(html: string): StudentProfile {
  const table = getProfileTable(html);

  if (!table) {
    throw new Error("Profile table not found");
  }

  const rows = getRows(table);

  let hostelStart = -1;
  let mailingStart = -1;
  let permanentStart = -1;

  rows.forEach((row, index) => {
    const text = clean(textContent(row));

    if (text.includes("Hostel Detail:")) {
      hostelStart = index + 1;
    }

    if (text.includes("Mailing Address")) {
      mailingStart = index + 1;
    }

    if (text.includes("Permanent Address")) {
      permanentStart = index + 1;
    }
  });

  return {
    rollNo: getLabelValue(html, "RollNoLabel"),
    registrationNo: getLabelValue(html, "RegdNoLabel"),
    name: getLabelValue(html, "SNameLabel"),
    branch: getLabelValue(html, "BranchLabel"),
    fatherName: getLabelValue(html, "FatherLabel"),
    motherName: getLabelValue(html, "MotherLabel"),
    studentMobile: getLabelValue(html, "SMobileLabel"),
    whatsappNo: getLabelValue(html, "WhatsAppNoLabel"),
    fatherMobile: getLabelValue(html, "FMobileLabel"),
    email: getLabelValue(html, "EmailLabel"),
    dob: getLabelValue(html, "DOBLabel"),
    admissionCategory:
      getLabelValue(html, "AmdCategoryLabel") ||
      getLabelValue(html, "AdmCategoryLabel") ||
      getLabelValue(html, "AdmissionCategory") ||
      "Not available",
    admissionDate:
      getLabelValue(html, "AmdDateLabel") ||
      getLabelValue(html, "AdmissionDateLabel") ||
      getLabelValue(html, "AdmissionDate") ||
      getLabelValue(html, "Admission date") ||
      "Not available",
    category: getLabelValue(html, "CategoryLabel"),
    sex: getLabelValue(html, "SexLabel"),
    photoPath: getPhotoPath(html),
    hostel:
      hostelStart >= 0
        ? parseHostel(rows, hostelStart)
        : {
            hostel: "",
            block: "",
            roomNo: "",
          },
    mailingAddress:
      mailingStart >= 0
        ? parseAddress(html, rows, mailingStart)
        : {
            atPo: "",
            cityVia: "",
            district: "",
            state: "",
            pin: "",
          },
    permanentAddress:
      permanentStart >= 0
        ? parseAddress(html, rows, permanentStart)
        : {
            atPo: "",
            cityVia: "",
            district: "",
            state: "",
            pin: "",
          },
    academicDetails: parseAcademicDetails(html),
    fetchedAt: new Date().toISOString(),
  };
}