# Laikipia County Job Recruitment System Documentation

## 1. Project Overview

The Laikipia County Job Recruitment System is a two-tier web application used to manage public recruitment from staffing request through final selection. It consists of:

- a **Spring Boot backend** in `cgl`
- a **React + Vite frontend** in `frontend`
- a **MySQL database** for persistence
- **JWT-based authentication** with role-based access control
- **email and in-system notifications** for verification and recruitment events

The system serves two broad categories of users:

- **Applicants**, who register, verify email, maintain profiles, apply for jobs, upload documents, and track outcomes
- **Internal staff**, who manage recruitment workflows according to role-specific permissions

## 2. Main Objectives

The system is designed to:

1. digitize the county recruitment process
2. centralize vacancy publication and application intake
3. enforce role-based workflow approvals and responsibilities
4. maintain official records through PDF-style reporting views
5. notify applicants promptly at major recruitment stages
6. secure access using authentication, authorization, and email verification

## 3. Active Project Structure

### Backend
- `cgl/` — active Spring Boot backend
  - controllers for REST APIs
  - services for business logic
  - JPA models and repositories
  - JWT security configuration
  - email verification and notification services

### Frontend
- `frontend/` — active React/Vite frontend
  - public pages for vacancy browsing and authentication
  - applicant pages for profile, documents, applications, notifications
  - admin/staff pages for recruitment operations and reporting

### Storage
- `uploads/` — uploaded applicant documents

### Note
- `laikipiaJobs/` appears to be an extra Vite app scaffold and is not the active production frontend based on the routing and API integration currently used.

## 4. Technology Stack

### Backend
- Java 21
- Spring Boot 4.1
- Spring Web MVC
- Spring Security
- Spring Data JPA
- MySQL Connector/J
- Spring Mail
- Lombok
- JWT (`jjwt`)
- OpenAPI / Swagger (`springdoc-openapi`)

### Frontend
- React 19
- Vite 8
- React Router 7
- Axios
- jsPDF / jsPDF-AutoTable
- Tailwind CSS
- Lucide React

### Infrastructure
- MySQL database
- SMTP email delivery
- local file storage for uploaded documents

## 5. Architecture Overview

The frontend communicates with the backend using REST APIs. The backend applies authentication and role authorization, persists records to MySQL, sends notifications, and stores uploaded files.

### Request flow
1. user interacts with frontend page
2. frontend sends API request using Axios
3. backend validates token and role where required
4. service layer executes business logic
5. JPA repositories persist or retrieve data
6. backend returns JSON response
7. frontend renders data or redirects user based on role and result

## 6. User Roles and Responsibilities

| Role | Purpose | Main capabilities | Restrictions |
|---|---|---|---|
| `SUPER_ADMIN` | Overall system administrator | Create staff users, manage departments, access most admin modules and reports | Does not perform core hiring decisions such as shortlisting, interview scheduling, and final selection |
| `CPSB_ADMIN` | Recruitment governance and approvals | Review recruitment requests, approve/reject requests, create vacancies, view applications, participate in shortlist/final selection workflows | Not a substitute for superadmin-level system administration |
| `DEPT_HEAD` | Department staffing requester | Submit recruitment requests and review department request records | Cannot approve requests or perform downstream hiring actions |
| `HR_OFFICER` | Recruitment operations handler | Review applications, update statuses, shortlist, schedule interviews, assign panel members, complete interviews | Cannot approve recruitment requests or finalize appointments |
| `PANEL_MEMBER` | Interview evaluator | View assigned interviews and submit interview scores | Cannot manage vacancies, shortlist, or make final hiring decisions |
| `APPLICANT` | External job seeker | Register, verify email, build profile, apply, upload documents, monitor status and notifications | No staff/admin privileges |

## 7. Authentication and Email Verification Flow

### Applicant registration flow
1. applicant opens `/register`
2. submits personal details and password
3. backend creates a `Users` record with role `APPLICANT`
4. account is stored with `emailVerified = false`
5. backend generates a 6-digit verification code
6. system emails the code to the applicant
7. applicant enters the code on `/verify-email`
8. backend marks email as verified
9. applicant can then log in

### Staff account creation flow
1. superadmin opens `/admin/users`
2. creates a new internal user such as `HR_OFFICER`
3. backend stores the user with `emailVerified = false`
4. system emails a 6-digit verification code to the staff user
5. the new user must verify on `/verify-email` before first login

### Current implementation note
To avoid locking out administration, the current code allows existing `SUPER_ADMIN` accounts to log in even if `emailVerified = false`. Newly created non-superadmin staff users still require verification.

### Login flow
1. user submits email and password to `/auth/login`
2. backend loads the user and checks verification rules
3. backend authenticates using Spring Security
4. JWT token is returned on success
5. frontend stores token in memory for the session
6. user is routed to applicant or admin area depending on role

## 8. Security Model

The backend uses:

- stateless JWT authentication
- Spring Security filter chain
- method-level authorization with `@PreAuthorize`
- role-based page protection on the frontend

### Publicly accessible backend endpoints
- `/auth/**`
- `GET /jobs/**`
- `GET /departments/allDepartments`
- Swagger/OpenAPI endpoints

### Protected resources
All other backend endpoints require authentication and role authorization.

## 9. Core Functional Modules

| Module | Purpose | Main actors |
|---|---|---|
| Authentication | Login, registration, email verification | All users |
| Applicant Profile | Maintain applicant biodata and qualifications | Applicant |
| Vacancy Management | Create, open, close, and remove job vacancies | CPSB Admin, Super Admin (view/manage UI access) |
| Applications | Submit and manage job applications | Applicant, HR, CPSB Admin, Super Admin (view) |
| Documents | Upload and review supporting application documents | Applicant, HR, CPSB Admin, Super Admin (view) |
| Recruitment Requests | Initiate and approve staffing demand | Dept Head, CPSB Admin, Super Admin (view) |
| Shortlisting | Move eligible candidates into shortlist stage | HR Officer, CPSB Admin |
| Interviews | Schedule interviews and panel participation | HR Officer, Panel Member, CPSB Admin, Super Admin (view) |
| Interview Scoring | Submit and review interview scores | Panel Member, relevant staff |
| Final Selection | Record selected candidates and appointment progression | CPSB Admin, HR (view), Super Admin (view) |
| Notifications | In-app communication for workflow events | All users |
| Email Messaging | Verification and applicant outcome emails | Applicants and staff users |

## 10. End-to-End Recruitment Workflow

### Phase 1: Demand initiation
1. `DEPT_HEAD` submits a recruitment request
2. request enters `PENDING` state
3. `CPSB_ADMIN` reviews request
4. request is either `APPROVED` or `REJECTED`
5. requester receives in-app notification

### Phase 2: Vacancy publication
1. approved staffing demand is used to create a vacancy
2. vacancy status starts as `OPEN`
3. vacancy becomes visible on the public frontend
4. applicants can browse and apply

### Phase 3: Applicant onboarding
1. applicant registers
2. applicant verifies email using code
3. applicant logs in
4. applicant fills profile details
5. applicant uploads required documents if needed

### Phase 4: Application intake
1. applicant submits job application
2. system creates `Applications` record with status `SUBMITTED`
3. duplicate application to same vacancy is blocked
4. applicant receives “Application Received” notification

### Phase 5: Application review
1. HR or CPSB views vacancy applications or all applications
2. application may remain `SUBMITTED`, move to `UNDER_REVIEW`, or be `REJECTED`
3. rejected applicants receive:
   - in-app notification
   - email saying the application was unsuccessful

### Phase 6: Shortlisting
1. eligible applications are shortlisted by authorized staff
2. application status becomes `SHORTLISTED`
3. shortlist record is created
4. applicant receives shortlist notification and email

### Phase 7: Interviewing
1. HR schedules interview for a shortlisted application
2. panel members are assigned
3. panel members log in and view assigned interviews
4. panel members submit interview scores
5. HR completes interview process

### Phase 8: Final selection and appointment
1. CPSB Admin selects a candidate from interviewed applicants
2. application status becomes `SELECTED`
3. final selection record is created
4. applicant receives acceptance notification and email
5. appointment status may progress to:
   - `PENDING_APPOINTMENT`
   - `APPOINTED`
   - `DECLINED`
6. vacancy may become `FILLED` when positions are exhausted

## 11. Applicant-Side Features

Applicants can:

- browse vacancies
- register and verify email
- log in to `/dashboard`
- create and update profile data
- apply for vacancies
- upload supporting files
- track applications
- read notifications

### Applicant pages
- `DashboardPage.jsx`
- `ProfilePage.jsx`
- `DocumentsPage.jsx`
- `ApplicationsPage.jsx`
- `NotificationsPage.jsx`

## 12. Staff/Admin-Side Features

### Super Admin
- user management
- department management
- view access across most staff modules
- reporting access

### CPSB Admin
- recruitment request approvals
- vacancy creation and management
- application oversight
- final selection process

### HR Officer
- application review
- shortlist creation
- interview scheduling
- panel assignment
- interview completion

### Panel Member
- assigned interviews
- score submission

### Admin pages
- `AdminDashboard.jsx`
- `UsersPage.jsx`
- `DepartmentsPage.jsx`
- `RecruitmentPage.jsx`
- `VacanciesPage.jsx`
- `AdminApplicationsPage.jsx`
- `ShortlistsPage.jsx`
- `InterviewsPage.jsx`
- `SelectionsPage.jsx`

## 13. Data Model Overview

| Entity | Purpose | Key relationships |
|---|---|---|
| `Users` | Core authentication and role record | referenced by applicant, creator/approver fields, notifications |
| `Applicant` | Extended applicant profile | one-to-one with `Users` |
| `Departments` | County department master data | linked to recruitment requests and vacancies |
| `RecruitmentRequest` | Staffing demand request | belongs to department and requesting user |
| `JobVacancy` | Published job opening | linked to department, creator, and optionally recruitment request |
| `Applications` | Applicant submission for a vacancy | many-to-one to applicant and vacancy |
| `ApplicationDocument` | Uploaded supporting file | linked to application |
| `Shortlist` | Shortlisting decision record | one application per shortlist record |
| `Interview` | Scheduled interview record | one-to-one with application |
| `InterviewPanel` | Mapping of interviews to panel members | links interview and assigned user |
| `InterviewScore` | Scoring record from panel members | linked to interview and panel member |
| `FinalSelection` | Final selection decision | one-to-one with application |
| `Notification` | In-app event message | linked to user |
| `EmailVerificationToken` | Stores verification code and expiry | one-to-one with user |

## 14. Important Domain States

### Roles
- `SUPER_ADMIN`
- `CPSB_ADMIN`
- `DEPT_HEAD`
- `HR_OFFICER`
- `PANEL_MEMBER`
- `APPLICANT`

### Recruitment request status
- `PENDING`
- `APPROVED`
- `REJECTED`

### Vacancy / application status
- vacancy status: `OPEN`, `CLOSED`, `FILLED`
- application state: `SUBMITTED`, `UNDER_REVIEW`, `REJECTED`, `SHORTLISTED`, `INTERVIEW`, `SELECTED`
- interview status: `SCHEDULED`, `COMPLETED`, `CANCELLED`
- appointment status: `PENDING_APPOINTMENT`, `APPOINTED`, `DECLINED`

### Supported document types
- `CV`
- `DEGREE`
- `KCSE`
- `ID_COPY`
- `CERTIFICATE`
- `DRIVING_LICENSE`

## 15. Backend API Summary

### Authentication and verification
- `POST /auth/register`
- `POST /auth/login`
- `POST /auth/verify-email`
- `POST /auth/resend-verification-code`

### Applicant
- `POST /applicant/profile`
- `PUT /applicant/profile`
- `GET /applicant/profile`

### Jobs and departments
- `GET /jobs/allVacancies`
- `GET /jobs/{id}`
- `POST /jobs`
- `PUT /jobs/{id}/open`
- `PUT /jobs/{id}/close`
- `DELETE /jobs/{id}`
- `GET /departments/allDepartments`
- `POST /departments/create`
- `PATCH /departments/{id}`
- `DELETE /departments/{id}`

### Applications and documents
- `POST /applications/apply`
- `GET /applications/my`
- `GET /applications/vacancy/{vacancyId}`
- `GET /applications/all`
- `PUT /applications/{id}/status`
- `POST /documents/upload`
- `GET /documents/application/{applicationId}`
- `GET /documents/my/{applicationId}`

### Notifications
- `GET /notifications/my`
- `GET /notifications/unread`
- `PUT /notifications/{id}/read`

### Recruitment workflow
- `POST /recruitment/submit`
- `PUT /recruitment/{id}/approve`
- `PUT /recruitment/{id}/reject`
- `GET /recruitment/pending`
- `GET /recruitment/all`
- `GET /recruitment/department/{departmentId}`

### Shortlist, interview, and selection
- `POST /shortlist`
- `GET /shortlist/vacancy/{vacancyId}`
- `POST /interviews/schedule`
- `POST /interviews/panel`
- `GET /interviews/my`
- `GET /interviews/status/{status}`
- `PUT /interviews/{id}/complete`
- `POST /scores`
- `GET /scores/interview/{id}`
- `GET /scores/interview/{id}/average`
- `POST /selections`
- `PUT /selections/{id}/appoint`
- `GET /selections/vacancy/{vacancyId}`

### Admin
- `POST /admin/users/create`

## 16. Notification and Email Behavior

### In-app notifications currently support events such as:
- application received
- recruitment request approved or rejected
- shortlisted
- interview invitation
- final selection outcome

### Emails currently support:
- account verification code
- shortlisted outcome
- accepted / selected outcome
- unsuccessful / rejected outcome

## 17. Frontend Routing Summary

### Public routes
- `/`
- `/vacancies`
- `/vacancies/:id`
- `/login`
- `/register`
- `/verify-email`

### Applicant routes
- `/dashboard`
- `/profile`
- `/documents`
- `/applications`
- `/notifications`

### Admin routes
- `/admin`
- `/admin/users`
- `/admin/departments`
- `/admin/recruitment`
- `/admin/vacancies`
- `/admin/applications`
- `/admin/shortlists`
- `/admin/interviews`
- `/admin/selections`

## 18. File Storage and Reporting

### File storage
Uploaded application documents are stored under the configured upload directory:
- `file.upload-dir=./uploads/documents`

### Reporting
The frontend includes PDF-oriented report views for:
- applications
- shortlists
- interviews
- final selections

These are used for official viewing, downloading, and printing.

## 19. Configuration Overview

Key backend configuration currently includes:

- MySQL datasource settings
- Hibernate schema update mode
- JWT secret and expiration
- file upload path and size limits
- frontend base URL for auth-related flows
- SMTP mail settings

### Security recommendation
The current `application.properties` contains live-looking credentials and secrets. In production, these should be externalized into environment variables or a secure secrets manager instead of being stored in source-controlled configuration files.

## 20. Known Business Rules and Constraints

1. a user cannot apply twice for the same vacancy
2. applicants must have a profile before applying
3. only open vacancies can accept applications
4. only eligible application states can be shortlisted
5. final selection only happens after interview stage
6. verification codes are time-bound and single-use
7. non-superadmin newly created staff accounts require email verification before first login
8. superadmin has broad system visibility but is intentionally restricted from core hiring actions

## 21. Operational Recommendations

1. move secrets from `application.properties` to environment variables
2. introduce formal database migrations such as Flyway or Liquibase instead of relying solely on `ddl-auto=update`
3. persist auth tokens more intentionally if cross-refresh login persistence is required on the frontend
4. add a resend-verification-code action directly in user management for staff support
5. consider code splitting on the frontend to reduce bundle size warnings during build
6. add automated tests for registration, verification, login, and recruitment transitions

## 22. Conclusion

The project is a full recruitment workflow system covering staffing requests, vacancy publication, applicant onboarding, document handling, shortlisting, interviews, final selection, and communication. Its architecture is suitable for county-level internal recruitment administration, with a clear separation between applicant functions, operational staff functions, and top-level system administration.
