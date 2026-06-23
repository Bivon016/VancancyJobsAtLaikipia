export const APPLICATION_STATES = {
  SUBMITTED: "SUBMITTED",
  UNDER_REVIEW: "UNDER_REVIEW",
  REJECTED: "REJECTED",
  SHORTLISTED: "SHORTLISTED",
  INTERVIEW: "INTERVIEW",
  SELECTED: "SELECTED",
};

export const STATUS_STYLES = {
  SUBMITTED: "bg-slate-100 text-slate-700",
  UNDER_REVIEW: "bg-blue-100 text-blue-800",
  SHORTLISTED: "bg-indigo-100 text-indigo-800",
  INTERVIEW: "bg-amber-100 text-amber-900",
  SELECTED: "bg-green-100 text-green-800",
  REJECTED: "bg-red-100 text-red-800",
};

export const STATUS_LABELS = {
  SUBMITTED: "Submitted",
  UNDER_REVIEW: "Under Review",
  SHORTLISTED: "Shortlisted",
  INTERVIEW: "Interview",
  SELECTED: "Selected",
  REJECTED: "Rejected",
};

export const VACANCY_TYPES = [
  { value: "PERMANENT_AND_PENSIONABLE", label: "Permanent and Pensionable" },
  { value: "CONTRACT", label: "Contract" },
  { value: "TEMPORARY", label: "Temporary" },
  { value: "PART_TIME", label: "Part-time" },
  { value: "INTERNSHIP", label: "Internship" },
  { value: "CASUAL", label: "Casual" },
  { value: "CONSULTANCY", label: "Consultancy" },
  { value: "ATTACHMENT", label: "Attachment" },
];

export const getVacancyTypeLabel = (value) =>
  VACANCY_TYPES.find((item) => item.value === value)?.label || value || "—";

export const DOCUMENT_TYPES = [
  { value: "CV", label: "Curriculum Vitae (CV)" },
  { value: "DEGREE", label: "Degree Certificate" },
  { value: "KCSE", label: "KCSE Certificate" },
  { value: "ID_COPY", label: "National ID Copy" },
  { value: "CERTIFICATE", label: "Professional Certificate" },
  { value: "DRIVING_LICENSE", label: "Driving License" },
  { value: "COVER_LETTER", label: "Cover Letter" },
];

export const GENDERS = [
  { value: "MALE", label: "Male" },
  { value: "FEMALE", label: "Female" },
];

export const formatDate = (dateStr) => {
  if (!dateStr) return "—";
  return new Date(dateStr).toLocaleDateString("en-KE", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
};

export const formatDateTime = (dateStr) => {
  if (!dateStr) return "—";
  return new Date(dateStr).toLocaleString("en-KE", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

export const isProfileComplete = (profile) =>
  profile &&
  profile.nationalId &&
  profile.birthDate &&
  profile.gender &&
  profile.nationality &&
  profile.physicalAddress &&
  profile.countyOfBirth &&
  profile.countyOfResidence &&
  profile.educationalLevel &&
  profile.educationYearOfCompletion != null &&
  profile.yearsOfExperience != null &&
  (!profile.disabilityStatus || profile.disabilityType);

export const getApplicantName = (application) => {
  const user = application?.applicant?.user;
  if (!user) return "—";
  return `${user.fName || ""} ${user.lName || ""}`.trim() || user.email || "—";
};

export const getUserName = (user) => {
  if (!user) return "—";
  return `${user.fName || ""} ${user.lName || ""}`.trim() || user.email || "—";
};
