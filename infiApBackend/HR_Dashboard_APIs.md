# HR Dashboard API Documentation

**Base URL**: `https://www.infiap.com/api/v1/hr`  
**Auth**: All routes require `Authorization: Bearer <token>` header.

---

## 1. Welcome Page Greeting

### `GET /dashboard/summary`
Returns total employees, present count for today, and holiday info.

**Response:**
```json
{
    "success": true,
    "data": {
        "totalEmployees": 150,
        "presentCount": 120,
        "isHoliday": false,
        "holidayDetails": null,
        "greeting": "Welcome to HR Dashboard"
    }
}
```

---

### `GET /profile` 🔒 HR/Admin only
Returns the detailed administration profile of the currently logged-in HR/Admin.
**Returns:**
```json
{
  "header": { "profileImage": "...", "name": "...", "post": "...", "hrId": "..." },
  "personalInfo": { "fullName": "...", "joiningDate": "...", "phoneNumber": "...", "emailId": "..." },
  "administrativeAccess": { "accessLevel": "hr", "complianceStatus": "Compliant" }
}
```

---

## 2. HR Operations — Employee

### `GET /employees`
List all employees with pagination, search & filters.

**Query Params:**
| Param | Type | Description |
|---|---|---|
| `department` | string | Filter by department |
| `role` | string | Filter by designation |
| `search` | string | Search by name, email, or employeeId |
| `page` | number | Page number (default: 1) |
| `limit` | number | Per page (default: 20) |

---

### `POST /employees` 🔒 HR/Admin only
Add a new employee.

**Body:**
```json
{
  "name": "Jane Doe",
  "email": "jane@example.com",
  "phone": "9876543210",
  "employeeId": "EMP012",
  "department": "Engineering",
  "designation": "Frontend Developer",
  "reportingManager": "<manager_user_id>",
  "annualSalary": 800000,
  "employmentType": "full-time"
}
```
> Default password is `Password@123`.

---

### `PUT /employees/:id` 🔒 HR/Admin only
Edit an employee (name, department, role, reporting manager, salary).

**Body:** Any fields to update (password changes are blocked).

---

### `GET /employees/:id/profile`
Full employee profile with attendance, performance & payroll.

**Response:**
```json
{
  "success": true,
  "data": {
    "profileInfo": { "profileImage": "...", "name": "Jane", "employeeId": "EMP012" },
    "attendanceSummary": { "present": 18, "absent": 2, "leave": 1 },
    "personalInfo": { "email": "jane@example.com", "phone": "9876543210" },
    "jobDetails": {
      "department": "Engineering",
      "role": "Frontend Developer",
      "manager": { "name": "John", "employeeId": "EMP001" },
      "joiningDate": "2023-01-15",
      "employeeType": "full-time",
      "status": "Active"
    },
    "performance": { "efficiencyScore": 85, "qualityScore": 90, "reliabilityScore": 88 },
    "financial": { 
        "currentBaseSalary": 6666, 
        "annualSalaryUSD": 80000, 
        "lastPayslip": { ... } 
    }
  }
}
```

---

## 3. HR Operations — Attendance

### `GET /attendance/daily-overview`
Daily metrics (Total, Present, Absent, Late, WFH).
**Query Params:** `date` (YYYY-MM-DD, default: today).

---

### `GET /attendance/records`
Employee-wise in/out times and status.
**Query Params:** `date`, `department`, `page`, `limit`.

---

### `POST /attendance/correction/submit`
Submit a correction request (Employee).
**Body:** `{ "correctionDate": "...", "correctionTime": "...", "reason": "...", "duration": "..." }`

---

### `GET /attendance/correction/requests`
List correction requests with status filters.
**Query Params:** `status` (Pending/Approved/Rejected), `page`, `limit`.

---

### `PUT /attendance/correction/review` 🔒 HR/Admin only
Approve or Reject a correction request.
**Body:** `{ "correctionId": "...", "status": "Approved/Rejected", "reviewRemarks": "..." }`

---

### `GET /attendance/notifications`
Alerts for Late check-ins today and Pending corrections.

---

### `GET /attendance/reports`
Aggregated attendance report (Daily/Weekly/Monthly).
**Query Params:** `filter` (daily/weekly/monthly), `department`, `date`.

---

### `POST /attendance/generate-report` 🔒 HR/Admin only
Generate a detailed report for a date range (Export logic).
**Body:** `{ "startDate": "...", "endDate": "...", "department": "..." }`

---

## 4. HR Operations — Leaves

### `GET /leaves/stats`
Returns counts for Pending, Approved, Rejected, and On Leave Today.

---

### `GET /leaves/applications`
List leave applications with status filters.
**Query Params:** `status` (Pending/Approved/Rejected), `page`, `limit`.

---
### `GET /leaves/today`
List all employees who are on approved leave today.

---

### `GET /leaves/pending-detailed`
List all pending leaves with full employee details and calculated duration.
**Returns:** `employeeProfile`, `employeeName`, `leaveType`, `durationDays`, `startDate`, `endDate`, `appliedAt`.

---

### `GET /leaves/applications`
List leave applications with status filters.
**Query Params:** `status` (Pending/Approved/Rejected), `page`, `limit`.

---

### `GET /leaves/requests`
List all pending leave requests ("Awaiting Approve" status).

---

### `PUT /leaves/approve` 🔒 HR/Admin/Manager only
Approve or reject a leave request.

**Body:**
```json
{ "leaveId": "<leave_id>", "status": "Approved" }
```
> `status` can be `"Approved"` or `"Rejected"`.

### `GET /leaves/history`
Leave history with optional filters.

**Query Params:**
| Param | Type | Description |
|---|---|---|
| `employeeId` | string | Filter by employee ObjectId |
| `status` | string | Filter by ApprovalStatus |

---

### `POST /leaves/generate-report` 🔒 HR/Admin only
Generates structured data of past leave records (e.g. Approved/Rejected) so the client can export it as a PDF or Excel file.

**Body:**
```json
{
  "startDate": "2023-10-01",
  "endDate": "2023-10-31",
  "department": "Engineering",
  "status": "Approved",
  "format": "pdf" 
}
```
> Returns a clean `reportData` array detailing `employeeName`, `leaveType`, `status`, and `reviewedBy` (e.g. Approved or Rejected). Client-side handles file conversion.

---

## 5. HR Operations — Recruitment

### `GET /recruitment/dashboard`
Summary counts: `openJobs`, `totalCandidates`, `interviewCount` (Technical round), `filledRoles`.

### `GET /recruitment/candidates/review`
List only new applications (`status: Applied`).
**Returns:** `applicantName`, `profileImage`, `appliedDate`, `jobTitle`, `jobId.department` (Team), `jobId.type` (Work mode).

---

### `GET /recruitment/candidates/tracking`
List all candidates in the system for general tracking.
**Query Params:** `status`, `page`, `limit`.

---

### `PUT /recruitment/candidates/:id/schedule-interview` 🔒 HR/Admin only
Action to move candidate to "Technical Interview" stage and set date/interviewer.
**Body:** `{ "date": "...", "interviewer": "..." }`

---

### `GET /recruitment/candidates/:id/profile`
Detailed profile of a candidate.
**Returns:** Profile, Contact, Portfolio, Summary, Experience list, Skills, Education, and `recruitmentProgress` (Stepper data).

---

### `PUT /recruitment/candidates/:id/shortlist` 🔒 HR/Admin only
Action to shortlist a candidate.

---

### `PUT /recruitment/candidates/:id/reject` 🔒 HR/Admin only
Action to reject a candidate.
**Body:** `{ "reason": "..." }`

---

### `PUT /recruitment/candidates/:id/interview` 🔒 HR/Admin only
Update technical interview stage.
**Body:** `{ "date": "...", "interviewer": "...", "score": 85, "feedback": "...", "passed": true }`

---

### `PUT /recruitment/candidates/:id/select` 🔒 HR/Admin only
Move candidate to "Selected" status.

---

### `POST /recruitment/candidates/:id/offer` 🔒 HR/Admin only
Trigger offer letter generation/notification.

---

### `GET /recruitment/jobs`
List all job postings.

---

### `POST /recruitment/jobs` 🔒 HR/Admin only
Post a new job.
**Body:** `{ "title": "...", "department": "...", "type": "Full-time", "status": "Open" }`

---

## 6. HR Operations — Performance

### `GET /performance/dashboard`
Monthly high-level metrics.
**Query Params:** `month` (YYYY-MM), `year`.
**Returns:** `averageScore`, `topPerformer` (Name, Dept, Score), `onTarget` count, `belowTarget` count.

---

### `GET /performance/feedback/stats`
Summary for the Feedback section.
**Returns:** `avgRating` (e.g. 4.2), `completedReviews` (total count).

---

### `GET /performance/feedback/recent`
List of recent reviews for the activity feed.
**Returns:** `profileImage`, `name`, `department`, `status` (Completed), `reviewName`, `jobRole`, `description` (feedback text), `rating`, `reviewer` (Name, Role).

---

### `GET /performance/report/summary`
Report overview.
**Returns:** `avgScore` (overall average score), `totalReports` (count of evaluations).

---

### `GET /performance/report/trends`
Evaluation trends over time (dataset for charts).
**Returns:** Array of `{ month: "2023-10", avgScore: 84.5 }`.

---

### `POST /performance/report/generate` 🔒 HR/Admin only
Generate a detailed performance report.
**Body:** `{ "type": "PDF" | "EXCEL", "month": "optional", "department": "optional" }`

---

### `POST /performance/feedback` 🔒 HR/Admin/Manager only
Add performance feedback/scores. (Auto-calculates status and rating on save).
**Body:**
```json
{
  "userId": "<user_id>",
  "month": "2023-10",
  "year": 2023,
  "efficiencyScore": 90,
  "qualityScore": 85,
  "reliabilityScore": 88,
  "rating": 4,
  "reviewTitle": "Monthly Review",
  "feedback": "Great work this month"
}
```

---

## 7. HR Operations — Finance (Salary Processing)

### `GET /finance/salary-list` 🔒 HR/Admin only
Get the list of employees for the month to process salary.
**Query Params:** `month` (e.g. "October"), `year` (2023).
**Returns:** Array of `{ userId (with profile/name/dept), basicSalary, bonus, deductions, netPay, status }`.

---

### `POST /finance/salary/process` 🔒 HR/Admin only
Update or create a salary record for a specific employee for the month.
**Body:**
```json
{
  "userId": "<user_id>",
  "month": "October",
  "year": 2023,
  "basicSalary": 50000,
  "bonus": 2000,
  "deductions": 500,
  "status": "Processed"
}
```
*(Net Pay is auto-calculated on the server: base + bonus - deductions).*

---

### `GET /finance/payslip/:id`
Fetch detailed payslip for a specific payroll record.

---

## 8. HR Operations — Resignation

### `POST /resignation`
Submit a resignation.

**Body:**
```json
{ "userId": "<user_id>", "reason": "Better opportunity", "noticePeriodDays": 30 }
```

### `GET /resignation/register`
List all resignations.

### `PUT /resignation/exit-process` 🔒 HR/Admin only
Process exit (approve/reject resignation).

**Body:**
```json
{ "resignationId": "<id>", "status": "Approved", "managerRemarks": "Good luck!" }
```
> Status options: `Submitted`, `Under Review`, `Approved`, `Rejected`, `Withdrawn`

---

## 9. Analytics

### `GET /analytics/report`
Department-wise employee count + average performance scores.

### `GET /analytics/attendance`
Attendance breakdown by department with daily present counts.

**Query Params:**
| Param | Type | Description |
|---|---|---|
| `department` | string | Filter by department |
| `startDate` | date | Start date (default: 1st of current month) |
| `endDate` | date | End date (default: today) |

### `GET /analytics/performance`
Performance scores aggregated by department.

**Query Params:**
| Param | Type | Description |
|---|---|---|
| `department` | string | Filter by department |
| `month` | string | e.g. "2023-10" |
| `year` | number | e.g. 2023 |

---

## Files Created / Modified

### New Models
| File | Purpose |
|---|---|
| `models/holiday.model.js` | Holiday dates |
| `models/candidate.model.js` | Recruitment candidates |
| `models/performance.model.js` | Monthly performance scores |
| `models/payroll.model.js` | Payroll / salary records |
| `models/resignation.model.js` | Resignation tracking |
| `models/attendanceCorrection.model.js` | Correction requests |

### Modified Models
| File | Fields Added |
|---|---|
| `models/user.model.js` | `employeeId`, `department`, `designation`, `reportingManager`, `annualSalary`, `employmentType` |

### New Controller & Routes
| File | Purpose |
|---|---|
| `controllers/hr.controller.js` | All 22 HR dashboard API handlers |
| `routes/hr.routes.js` | Route definitions with auth + role middleware |

### Modified
| File | Change |
|---|---|
| `app.js` | Registered `hrRouter` at `/api/v1/hr` |
