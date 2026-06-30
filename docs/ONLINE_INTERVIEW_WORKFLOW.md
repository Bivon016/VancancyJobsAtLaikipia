# 📋 Online Interview Q&A System - Complete Workflow

## **🎯 Overview**
This online exam system helps **HR Officers shortlist candidates** by having them take timed, auto-graded online interviews before coming in for physical exams.

---

## **👥 Actors & Roles**

| Role | Responsibilities |
|------|-----------------|
| **HR Officer / SUPER_ADMIN** | Creates/schedules interviews, assigns panel members, reviews results |
| **Panel Member** | Adds questions to assigned interviews, views exam transcripts |
| **Applicant** | Takes the timed online exam, answers questions |

---

## **🔄 Complete Setup & Execution Flow**

### **STEP 1️⃣ : HR Officer Shortlists Candidates**
- Applicants apply for a vacancy
- HR reviews applications and marks them **SHORTLISTED** in the Shortlist view
- ✅ See: Shortlist page in admin dashboard

---

### **STEP 2️⃣ : HR Officer Creates Interviews**
**Route:** `/admin/interview-setup`  
**Component:** `InterviewSetupPage.jsx`

**Sub-steps:**
1. **Select Candidates** → Choose shortlisted applicants who'll take the exam
2. **Schedule Exam** → Set:
   - Date
   - Time
   - Venue (or virtual link)
   - **Duration** (e.g., 60 minutes)
   - ✅ Creates `Interview` records with status `SCHEDULED`

3. **Assign Panel Members** → Select which panel members will create questions
   - ✅ Calls `POST /interviews/panel` to assign panel members
   - Multiple panel members can work on the same interview

---

### **STEP 3️⃣ : Panel Members Add Questions**
**Route:** `/panel/my-interviews`  
**Component:** `PanelInterviewsPage.jsx`

Panel members see their assigned interviews:
- Shows candidate name, position, interview date/time
- Button: **"+ Questions"** → Opens `PanelQuestionComposer`
- ✅ See [PanelQuestionComposer Component](#panelquestioncomposer)

#### **PanelQuestionComposer**
Panel members can:
- Create questions with:
  - **Question Text** (visible to applicant)
  - **Model Answer** (NOT visible to applicant - for grading reference)
  - **Marking Rubric** (NOT visible to applicant - tells LLM how to score)
  - **Max Score** (e.g., 100)
- View posted questions with status badges (OPEN, ANSWERED, CLOSED)
- Delete unanswered questions

**Endpoint:** `POST /api/interview-questions`

---

### **STEP 4️⃣ : Applicants Receive Notifications**
- Email notification: "Your online exam is scheduled for [date]"
- Applicants see exam in their dashboard
- Link: `/interview/{interviewId}/exam`

---

### **STEP 5️⃣ : Applicant Takes the Exam** 🎯 **Core Feature**
**Route:** `/interview/{interviewId}?view=exam`  
**Component:** `ApplicantExamSession.jsx`

#### **Three States:**

**A) LANDING STATE** — Before Starting
- Shows interview details (vacancy, duration, question count)
- "Start Exam" button
- Once clicked → calls `POST /api/exam-session/{id}/start`
- Returns: `{ deadline, durationMinutes, examStartedAt }`

**B) ACTIVE STATE** — During Exam
- **Countdown Timer** (updates every second):
  - Recalculates from server `deadline` (survives page refresh)
  - Turns red when < 5 minutes left
  
- **Questions Display:**
  - Shows question text only (NOT model answer/rubric)
  - Textarea for applicant's answer
  - "Submit Answer" button
  
- **Scoring** (happens automatically on submit):
  - While scoring: "Grading your response..." spinner
  - LLM scores based on model answer + rubric
  - Shows: `score/100`, feedback, status (SCORED/FAILED/PENDING)
  - If FAILED: "Automated scoring failed — please notify the panel."
  
- **Answer States:**
  - Unanswered: text input
  - Submitted: read-only with score/feedback
  - Can't answer twice

- **Auto-Submit on Timeout:**
  - When timer hits 0:00
    1. Any drafted (but unsubmitted) answers are auto-sent
    2. Calls `POST /api/exam-session/{id}/auto-submit`
    3. Redirects to completion screen

**Endpoints:**
- `POST /api/exam-session/{interviewId}/start`
- `POST /api/interview-answers` (submit individual answer)
- `POST /api/exam-session/{interviewId}/auto-submit` (auto-submit at timeout)

**C) COMPLETED STATE**
- "Time's Up!" message
- Summary: answered count, scored count, average score
- Redirects to applicant dashboard

---

### **STEP 6️⃣ : Panel/Admin Reviews Results**
**Route:** `/interview/{interviewId}?view=transcript`  
**Component:** `InterviewTranscriptView.jsx`

Shows read-only Q&A transcript:
- Full question text
- Applicant's submitted answer
- **Score** (e.g., "78/100")
- **LLM Feedback** explaining the score
- Status badges (SCORED, FAILED, PENDING)

**Stats Dashboard:**
- Total answers received
- Scored: [count]
- Failed: [count]
- Pending: [count]
- Average score

**Endpoints:**
- `GET /api/interview-answers/interview/{id}`

---

### **STEP 7️⃣ : HR Officer Makes Shortlist Decisions**
Based on exam scores:
- ✅ **High scorers** → Invite to physical interview
- ❌ **Low scorers** → Send rejection
- ⏳ **Borderline** → Send for additional assessment

---

## **🗂️ Files & Components**

### **Backend (Java)**
- **New Controller:** `ExamSessionController.java`
  - `POST /api/exam-session/{id}/start` — Start exam
  - `POST /api/exam-session/{id}/auto-submit` — Auto-submit answers

- **Existing Controllers:**
  - `InterviewController.java` — Schedule interviews, assign panels
  - `InterviewQuestionController.java` — Post/manage questions
  - `InterviewAnswerController.java` — Submit/view answers

### **Frontend (React)**
- **Design System:** `src/utils/designSystem.js` — Reusable components & colors
- **API Layer:** `src/api/index.js` — Endpoints for interviews, questions, answers, exams
- **Admin Pages:**
  - `src/pages/admin/InterviewSetupPage.jsx` — HR: schedule & assign panel
  - `src/pages/admin/InterviewsPage.jsx` — Existing interviews dashboard
- **Panel Pages:**
  - `src/pages/panel/PanelInterviewsPage.jsx` — Panel: my interviews & questions
- **Components:**
  - `src/components/interview/PanelQuestionComposer.jsx` — Create questions
  - `src/components/interview/ApplicantExamSession.jsx` — Take exam
  - `src/components/interview/InterviewTranscriptView.jsx` — Review results
- **Router:**
  - `src/pages/applicant/Interviewexamsystem.jsx` — Main router with role-gating

---

## **📡 API Routes**

### **Interview Management** (HR Officer)
```
POST   /interviews/schedule                     Create interview
POST   /interviews/panel                        Assign panel member
GET    /interviews/my                           Panel: my interviews
GET    /interviews/status/{status}              Filter by status
PUT    /interviews/{id}/complete                Mark as complete
```

### **Questions** (Panel Member)
```
POST   /api/interview-questions                 Create question
GET    /api/interview-questions/interview/{id}  List questions
PATCH  /api/interview-questions/{id}/status     Update status (OPEN→ANSWERED→CLOSED)
DELETE /api/interview-questions/{id}            Delete unanswered question
```

### **Answers** (Applicant & Viewer)
```
POST   /api/interview-answers                   Submit answer (LLM scores)
GET    /api/interview-answers/interview/{id}    Transcript (all Q&A)
GET    /api/interview-answers/question/{id}     Single answer
```

### **Exam Session** (Applicant)
```
POST   /api/exam-session/{id}/start             Start timed exam
POST   /api/exam-session/{id}/auto-submit       Auto-submit remaining
```

---

## **🎨 Design System**

All components use the **Laikipia County Register** design:

| Element | Color | Usage |
|---------|-------|-------|
| Background (ink) | `#0F1B2A` | Page background |
| Panel | `#15233A` | Cards & containers |
| Gold (accent) | `#C9A24B` | County seal, CTA buttons |
| Green (success) | `#2E6B4F` | SCORED, ANSWERED |
| Red (alert) | `#B3491F` | FAILED, EXPIRED, errors |
| Parchment (text) | `#EDE6D6` | Primary text |
| Slate (muted) | `#93A1B8` | Secondary text |

Typography:
- **Display** (headers): Source Serif 4
- **Body** (content): Inter
- **Mono** (timer, scores): IBM Plex Mono

---

## **✅ Key Features**

✔️ **Timer Resilience** — Survives page refresh (recalculates from server deadline)  
✔️ **Auto-Scoring** — LLM-powered based on rubric (few seconds wait)  
✔️ **Auto-Submit** — Drafts submitted automatically when time expires  
✔️ **Role-Gating** — Only appropriate views shown to each role  
✔️ **Loading States** — "Grading…" vs "Submitting…" clearly distinguished  
✔️ **Error Handling** — Scoring failures show user-friendly messages  
✔️ **Transcript View** — Full Q&A history with scores & feedback  
✔️ **Accessibility** — Focus states, semantic HTML, error messages  

---

## **🚀 Next Steps**

1. **Update Router Config** — Add routes to main app:
   ```jsx
   <Route path="/admin/interview-setup" element={<InterviewSetupPage />} />
   <Route path="/panel/my-interviews" element={<PanelInterviewsPage />} />
   <Route path="/interview/:interviewId/:view" element={<Interviewexamsystem />} />
   ```

2. **Load Real Data** — Replace mock `interview` object in Interviewexamsystem.jsx

3. **Configure LLM** — Backend calls LLM scorer; ensure API key + prompts are set

4. **Test Full Flow** — HR creates → Panel adds questions → Applicant takes exam → Review results

---

## **📞 Support**

Each component is self-contained and well-documented. Reach out with questions!
