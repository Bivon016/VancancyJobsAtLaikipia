import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const outputPath = path.resolve(__dirname, '../../docs/LaikipiaCounty_Project_Documentation.pdf');

const doc = new jsPDF({ unit: 'pt', format: 'a4' });
const pageWidth = doc.internal.pageSize.getWidth();
const pageHeight = doc.internal.pageSize.getHeight();
const margin = 48;
const contentWidth = pageWidth - margin * 2;
const bottomMargin = 52;
let y = 56;

function ensureSpace(heightNeeded = 20) {
  if (y + heightNeeded > pageHeight - bottomMargin) {
    doc.addPage();
    y = 56;
  }
}

function addTitle(text) {
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(20);
  const lines = doc.splitTextToSize(text, contentWidth);
  lines.forEach((line) => {
    ensureSpace(28);
    doc.text(line, margin, y);
    y += 26;
  });
  y += 6;
}

function addSubtitle(text) {
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(11);
  const lines = doc.splitTextToSize(text, contentWidth);
  lines.forEach((line) => {
    ensureSpace(16);
    doc.text(line, margin, y);
    y += 15;
  });
  y += 8;
}

function addSection(title) {
  ensureSpace(24);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(14);
  doc.text(title, margin, y);
  y += 18;
}

function addParagraph(text) {
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(10.5);
  const lines = doc.splitTextToSize(text, contentWidth);
  lines.forEach((line) => {
    ensureSpace(14);
    doc.text(line, margin, y);
    y += 14;
  });
  y += 6;
}

function addBullets(items) {
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(10.5);
  items.forEach((item) => {
    const lines = doc.splitTextToSize(item, contentWidth - 18);
    ensureSpace(lines.length * 14 + 2);
    doc.text('•', margin, y);
    lines.forEach((line, index) => {
      doc.text(line, margin + 14, y + index * 14);
    });
    y += lines.length * 14 + 2;
  });
  y += 4;
}

function addNumbered(items) {
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(10.5);
  items.forEach((item, idx) => {
    const label = `${idx + 1}.`;
    const lines = doc.splitTextToSize(item, contentWidth - 22);
    ensureSpace(lines.length * 14 + 2);
    doc.text(label, margin, y);
    lines.forEach((line, index) => {
      doc.text(line, margin + 18, y + index * 14);
    });
    y += lines.length * 14 + 2;
  });
  y += 4;
}

function addTable(head, body, columnStyles = {}) {
  autoTable(doc, {
    startY: y,
    margin: { left: margin, right: margin },
    head: [head],
    body,
    styles: {
      font: 'helvetica',
      fontSize: 9,
      cellPadding: 5,
      valign: 'top',
      overflow: 'linebreak',
      lineColor: [210, 210, 210],
      lineWidth: 0.5,
    },
    headStyles: {
      fillColor: [43, 73, 117],
      textColor: 255,
      fontStyle: 'bold',
    },
    columnStyles,
    theme: 'grid',
    didDrawPage: () => {},
  });
  y = doc.lastAutoTable.finalY + 14;
}

addTitle('Laikipia County Job Recruitment System');
addSubtitle('Full Project Documentation');
addSubtitle('Generated from the current frontend and backend codebase.');

addSection('1. Project Overview');
addParagraph('The Laikipia County Job Recruitment System is a web-based recruitment management platform built with a Spring Boot backend and a React/Vite frontend. It supports the full hiring lifecycle from department staffing requests through vacancy publication, applicant onboarding, application processing, shortlisting, interviews, final selection, notifications, and email communication.');
addBullets([
  'Active backend: cgl (Spring Boot, JPA, Security, Mail, JWT)',
  'Active frontend: frontend (React, Vite, Router, Axios, jsPDF)',
  'Persistence: MySQL database',
  'Supporting storage: local uploads directory for applicant documents',
  'Communication: in-app notifications and SMTP email delivery',
]);

addSection('2. Objectives');
addNumbered([
  'Digitize and centralize county recruitment workflows.',
  'Provide controlled role-based access for internal staff.',
  'Allow applicants to discover vacancies, apply online, and track progress.',
  'Maintain official records and printable reports for recruitment processes.',
  'Improve applicant communication using notifications and email.',
  'Secure system access through JWT-based authentication and email verification.',
]);

addSection('3. Technology Stack');
addTable(
  ['Layer', 'Technologies'],
  [
    ['Backend', 'Java 21, Spring Boot 4.1, Spring Web MVC, Spring Security, Spring Data JPA, Lombok, Spring Mail, JWT, OpenAPI/Swagger'],
    ['Frontend', 'React 19, Vite 8, React Router 7, Axios, Tailwind CSS, Lucide React, jsPDF, jsPDF-AutoTable'],
    ['Database', 'MySQL'],
    ['Storage', 'Local file storage under uploads/documents'],
    ['Authentication', 'JWT bearer tokens with role-based authorization'],
  ],
  { 0: { cellWidth: 100 }, 1: { cellWidth: 'auto' } },
);

addSection('4. Active Project Structure');
addBullets([
  'cgl/: active Spring Boot backend with controllers, services, models, repositories, security, and email verification logic.',
  'frontend/: active React frontend with public, applicant, and admin/staff pages.',
  'uploads/: storage for uploaded application documents.',
  'laikipiaJobs/: appears to be an extra frontend scaffold and is not the active integrated frontend in current use.',
]);

addSection('5. Architecture Overview');
addParagraph('The frontend issues REST requests to the backend through Axios. The backend validates authentication and role access, executes business logic in service classes, persists data via JPA repositories, and returns JSON responses. Uploaded files are stored on disk, while relational business data is stored in MySQL.');
addNumbered([
  'User interacts with frontend page or form.',
  'Frontend sends an HTTP request to a backend endpoint.',
  'Security layer validates token and role where required.',
  'Controller delegates work to a service.',
  'Service performs validation, workflow logic, persistence, and side effects such as notifications or email.',
  'Backend returns response payload for rendering or redirect decisions.',
]);

addSection('6. User Roles and Responsibilities');
addTable(
  ['Role', 'Main Responsibilities', 'Cannot Do'],
  [
    ['SUPER_ADMIN', 'Create staff users, manage departments, access most admin modules and reports, oversee system configuration areas through the UI.', 'Core hiring decisions such as approving recruitment requests, shortlisting, interview scheduling, or final candidate selection.'],
    ['CPSB_ADMIN', 'Approve or reject recruitment requests, create vacancies, oversee recruitment workflow, participate in shortlist/final selection functions.', 'General system administration reserved for superadmin.'],
    ['DEPT_HEAD', 'Submit departmental recruitment requests and monitor request records.', 'Approve requests or perform downstream hiring actions.'],
    ['HR_OFFICER', 'Review applications, update application states, shortlist candidates, schedule interviews, assign panel members, complete interviews.', 'Approve recruitment requests or finalize final appointment decisions.'],
    ['PANEL_MEMBER', 'View assigned interviews and submit interview scores.', 'Vacancy management, shortlisting, or final hiring decisions.'],
    ['APPLICANT', 'Register, verify email, build profile, apply for jobs, upload documents, view notifications and statuses.', 'Any staff or admin operation.'],
  ],
  { 0: { cellWidth: 80 }, 1: { cellWidth: 205 }, 2: { cellWidth: 170 } },
);

addSection('7. Authentication and Verification Flow');
addParagraph('Authentication is handled through JWTs, while email verification uses one-time 6-digit codes sent through SMTP. Verification is required for new applicants and newly created non-superadmin staff users before first login.');
addNumbered([
  'Applicant registration creates a Users record with role APPLICANT and emailVerified = false.',
  'Superadmin-created staff accounts are also created with emailVerified = false.',
  'A verification code is generated, stored in EmailVerificationToken, and sent by email.',
  'The user enters email and code on /verify-email.',
  'On successful verification, emailVerified becomes true and the code is marked used.',
  'User then logs in and receives a JWT token.',
]);
addParagraph('Current continuity rule: the codebase presently allows SUPER_ADMIN login even if emailVerified is false, so legacy superadmin access is not lost.');

addSection('8. Security Model');
addBullets([
  'Spring Security is configured as stateless using JWTs.',
  'Method-level security is enabled with @PreAuthorize.',
  'Public endpoints include /auth/**, GET /jobs/**, GET /departments/allDepartments, and Swagger docs.',
  'All other endpoints require authentication and role authorization.',
  'Frontend route guards separate public, applicant, and admin areas.',
]);

addSection('9. Core Functional Modules');
addTable(
  ['Module', 'Purpose', 'Primary Actors'],
  [
    ['Authentication', 'Registration, login, JWT issuance, email verification, resend verification code.', 'All users'],
    ['Applicant Profile', 'Capture personal and qualification details required for applications.', 'Applicant'],
    ['Vacancy Management', 'Create, open, close, and delete vacancies.', 'CPSB Admin, Super Admin (view/manage access)'],
    ['Applications', 'Submit, list, and update job applications.', 'Applicant, HR Officer, CPSB Admin, Super Admin (view)'],
    ['Documents', 'Upload and review supporting files attached to applications.', 'Applicant, HR Officer, CPSB Admin, Super Admin (view)'],
    ['Recruitment Requests', 'Initiate and approve staffing demand.', 'Dept Head, CPSB Admin, Super Admin (view)'],
    ['Shortlisting', 'Move candidates into shortlist stage and produce shortlist records.', 'HR Officer, CPSB Admin'],
    ['Interviews', 'Schedule interviews, assign panels, track interview status.', 'HR Officer, Panel Member, CPSB Admin, Super Admin (view)'],
    ['Interview Scoring', 'Submit and review interview score records.', 'Panel Member and relevant staff'],
    ['Final Selection', 'Record selected candidates and appointment progression.', 'CPSB Admin, HR Officer (view), Super Admin (view)'],
    ['Notifications', 'In-app communication of workflow events.', 'All users'],
    ['Email Messaging', 'Verification and applicant outcome messages.', 'Applicants and staff users'],
  ],
  { 0: { cellWidth: 95 }, 1: { cellWidth: 220 }, 2: { cellWidth: 150 } },
);

addSection('10. End-to-End Recruitment Workflow');
addNumbered([
  'Department Head submits a recruitment request.',
  'CPSB Admin reviews and approves or rejects the request.',
  'CPSB Admin creates a vacancy from approved staffing demand.',
  'Applicant registers, verifies email, and logs in.',
  'Applicant completes profile and applies for an open vacancy.',
  'Applicant uploads supporting documents if required.',
  'HR Officer or CPSB Admin reviews applications.',
  'Rejected applications trigger unsuccessful notification and email.',
  'Eligible candidates are shortlisted and receive shortlist communication.',
  'HR Officer schedules interviews and assigns panel members.',
  'Panel members score candidates.',
  'CPSB Admin records final selection and appointment progression.',
  'Selected applicants receive acceptance notification and email.',
]);

addSection('11. Applicant-Side Features');
addBullets([
  'Public vacancy browsing on / and /vacancies.',
  'Account creation on /register and verification on /verify-email.',
  'Applicant dashboard at /dashboard.',
  'Profile management via /profile.',
  'Document upload and management via /documents.',
  'Application history via /applications.',
  'Personal notifications via /notifications.',
]);

addSection('12. Staff/Admin-Side Features');
addBullets([
  'Admin dashboard at /admin with role-filtered navigation.',
  'User management for superadmin via /admin/users.',
  'Department management via /admin/departments.',
  'Recruitment request handling via /admin/recruitment.',
  'Vacancy management via /admin/vacancies.',
  'Application reporting via /admin/applications.',
  'Shortlist reporting and operations via /admin/shortlists.',
  'Interview scheduling and reporting via /admin/interviews.',
  'Final selection reporting and operations via /admin/selections.',
]);

addSection('13. Data Model Overview');
addTable(
  ['Entity', 'Purpose', 'Key Relationships'],
  [
    ['Users', 'Authentication identity, role, email verification state.', 'Referenced by applicant profiles, creators, approvers, notifications, and verification tokens.'],
    ['Applicant', 'Extended applicant profile including national ID, education, county, and experience.', 'One-to-one with Users.'],
    ['Departments', 'Organizational department master record.', 'Linked to recruitment requests and vacancies.'],
    ['RecruitmentRequest', 'Formal staffing demand request.', 'Belongs to a department and requesting user.'],
    ['JobVacancy', 'Published job opening.', 'Linked to department, creator, and optionally a recruitment request.'],
    ['Applications', 'Applicant submission for a vacancy.', 'Belongs to one applicant and one vacancy.'],
    ['ApplicationDocument', 'Uploaded file attached to an application.', 'Belongs to an application.'],
    ['Shortlist', 'Shortlisting decision record.', 'One application per shortlist record.'],
    ['Interview', 'Scheduled interview.', 'One-to-one with application.'],
    ['InterviewPanel', 'Assignment of panel members to interviews.', 'Links interview and staff users.'],
    ['InterviewScore', 'Panel evaluation record.', 'Linked to interview and scoring member.'],
    ['FinalSelection', 'Final candidate selection record.', 'One-to-one with application.'],
    ['Notification', 'In-app user notification.', 'Belongs to one user.'],
    ['EmailVerificationToken', 'One-time email verification code, expiry, and usage record.', 'One-to-one with user.'],
  ],
  { 0: { cellWidth: 98 }, 1: { cellWidth: 180 }, 2: { cellWidth: 190 } },
);

addSection('14. Important Domain States');
addBullets([
  'Roles: SUPER_ADMIN, CPSB_ADMIN, DEPT_HEAD, HR_OFFICER, PANEL_MEMBER, APPLICANT.',
  'Recruitment request status: PENDING, APPROVED, REJECTED.',
  'Vacancy status: OPEN, CLOSED, FILLED.',
  'Application state: SUBMITTED, UNDER_REVIEW, REJECTED, SHORTLISTED, INTERVIEW, SELECTED.',
  'Interview status: SCHEDULED, COMPLETED, CANCELLED.',
  'Appointment status: PENDING_APPOINTMENT, APPOINTED, DECLINED.',
  'Supported document types: CV, DEGREE, KCSE, ID_COPY, CERTIFICATE, DRIVING_LICENSE.',
]);

addSection('15. Backend API Summary');
addTable(
  ['Area', 'Representative Endpoints'],
  [
    ['Authentication', 'POST /auth/register, POST /auth/login, POST /auth/verify-email, POST /auth/resend-verification-code'],
    ['Applicant', 'POST/PUT/GET /applicant/profile'],
    ['Jobs', 'GET /jobs/allVacancies, GET /jobs/{id}, POST /jobs, PUT /jobs/{id}/open, PUT /jobs/{id}/close, DELETE /jobs/{id}'],
    ['Departments', 'GET /departments/allDepartments, POST /departments/create, PATCH /departments/{id}, DELETE /departments/{id}'],
    ['Applications', 'POST /applications/apply, GET /applications/my, GET /applications/vacancy/{vacancyId}, GET /applications/all, PUT /applications/{id}/status'],
    ['Documents', 'POST /documents/upload, GET /documents/application/{applicationId}, GET /documents/my/{applicationId}'],
    ['Notifications', 'GET /notifications/my, GET /notifications/unread, PUT /notifications/{id}/read'],
    ['Recruitment', 'POST /recruitment/submit, PUT /recruitment/{id}/approve, PUT /recruitment/{id}/reject, GET /recruitment/pending, GET /recruitment/all, GET /recruitment/department/{departmentId}'],
    ['Shortlist', 'POST /shortlist, GET /shortlist/vacancy/{vacancyId}'],
    ['Interviews', 'POST /interviews/schedule, POST /interviews/panel, GET /interviews/my, GET /interviews/status/{status}, PUT /interviews/{id}/complete'],
    ['Interview Scores', 'POST /scores, GET /scores/interview/{id}, GET /scores/interview/{id}/average'],
    ['Selections', 'POST /selections, PUT /selections/{id}/appoint, GET /selections/vacancy/{vacancyId}'],
    ['Admin', 'POST /admin/users/create'],
  ],
  { 0: { cellWidth: 90 }, 1: { cellWidth: 370 } },
);

addSection('16. Notifications and Email Behavior');
addBullets([
  'In-app notifications are used for application receipt, recruitment request decisions, shortlist events, interview invitations, and final selection outcomes.',
  'Email is used for verification codes, shortlist communication, acceptance communication, and unsuccessful application communication.',
  'Verification codes are single-use and time-bound.',
]);

addSection('17. Configuration Overview');
addBullets([
  'Datasource configured for MySQL with Hibernate schema update enabled.',
  'JWT secret and expiration configured in application.properties.',
  'Upload directory configured as ./uploads/documents.',
  'SMTP mail settings configured for email sending.',
  'Frontend base URL configured for auth-related flows.',
]);
addParagraph('Security recommendation: secrets and passwords currently appear in source configuration and should be externalized to environment variables or a secure secrets store.');

addSection('18. Operational Recommendations');
addNumbered([
  'Externalize secrets from application.properties.',
  'Introduce formal DB migrations such as Flyway or Liquibase.',
  'Add support tooling for resending verification codes from admin user management.',
  'Consider persistent auth strategy if login state should survive page refresh.',
  'Reduce frontend bundle size using route-level code splitting.',
  'Add automated tests around verification, login, and recruitment state transitions.',
]);

addSection('19. Conclusion');
addParagraph('The project implements a complete county recruitment workflow with clear separation between applicant operations, internal recruitment operations, and system administration. The current architecture is suitable for structured public-sector recruitment processes and can be strengthened further through improved secret management, formal migrations, and broader automated testing.');

const pageCount = doc.getNumberOfPages();
for (let i = 1; i <= pageCount; i += 1) {
  doc.setPage(i);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.setTextColor(120);
  doc.text(`Laikipia County Job Recruitment System Documentation`, margin, pageHeight - 24);
  doc.text(`Page ${i} of ${pageCount}`, pageWidth - margin - 60, pageHeight - 24);
}

fs.mkdirSync(path.dirname(outputPath), { recursive: true });
doc.save(outputPath);
console.log(`Generated PDF: ${outputPath}`);
