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
