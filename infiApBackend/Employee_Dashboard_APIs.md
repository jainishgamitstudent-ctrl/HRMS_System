# Employee Dashboard API Documentation

This document lists all the API endpoints created for the Employee Dashboard functionality in the HRMS application.

## 1. Dashboard & Profile

### Get Home Dashboard Data
- **Endpoint:** `GET /api/v1/dashboard/home`
- **Description:** Fetches the main dashboard data, including the greeting message, new joiners for the day, and quick stats for the user's dashboard view.

### Get Employee of the Month
- **Endpoint:** `GET /api/v1/getemployeeofthemonth`
- **Description:** Retrieves the details of the current "Employee of the Month".

### Get Birthdays (DOB)
- **Endpoint:** `GET /api/v1/getDOB`
- **Description:** Fetches birthdays occurring today as well as those coming up within the current month.

---

## 2. Attendance & Punch Tracking

### Record Employee Punch
- **Endpoint:** `POST /api/v1/emp-punch`
- **Description:** Records an employee punch with location and work mode details.
- **Payload Parameters:**
    - `PunchType` (Number):
        - `1` = Check-In
        - `2` = Check-Out
        - `3` = Reset
        - `4` = Break Start
        - `5` = Break End
    - `WorkMode` (Number):
        - `1` = Office
        - `2` = WFH
        - `3` = Meeting mode
        - `4` = Offside
    - `Latitude` (Number): GPS Latitude
    - `Longitude` (Number): GPS Longitude
    - `IsAway` (Boolean): Current status of the user being away.

### Get Punch Status
- **Endpoint:** `GET /api/v1/punch-status`
- **Description:** Retrieves the user's most recent punch status and the recorded time (e.g., whether they are currently checked in or checked out).

### Late Check-in Count
- **Endpoint:** `GET /api/v1/late-checkin-count`
- **Description:** Gets the count of late check-ins for the current month.

### Early Check-out Count
- **Endpoint:** `GET /api/v1/early-checkout-count`
- **Description:** Gets the count of early check-outs for the current month.

### Half Day Count
- **Endpoint:** `GET /api/v1/Half_Day-count`
- **Description:** Retrieves the number of half-day leaves taken in the current month.

### Attendance Summary
- **Endpoint:** `GET /api/v1/attendance-summary`
- **Description:** Summarizes attendance statistics, including the number of present days, leaves taken, and holidays in the current month.

### Missed Punches
- **Endpoint:** `GET /api/v1/missed-punches`
- **Description:** Retrieves a list of missed check-in and check-out punches, evaluating missing "In" after a certain start time or missing "Out" at the end of the day.

---

## 3. Leave Management

### Get Employee Leave Balance
- **Endpoint:** `GET /api/v1/getemployeeleavebalance`
- **Description:** Gets the user's available leave balances across different leave types (CL, PL, SL, WFH).

### Apply for Leave
- **Endpoint:** `POST /api/v1/leaveapplications`
- **Description:** Allows an employee to submit a new leave application.

### Get User Leave Applications
- **Endpoint:** `GET /api/v1/leaveapplications`
- **Description:** Fetches the user's recent leave application details and their statuses.

### Get Pending Leave Approvals
- **Endpoint:** `GET /api/v1/leaveapprovals`
- **Description:** Fetches a list of pending leave approvals (typically used by HR or managerial roles).

### Approve Leave
- **Endpoint:** `POST /api/v1/allapprove`
- **Description:** Updates the status of an active leave application to approved.
---

## Day-2: New & Optimized Endpoints

### 4. Directors & Organization

#### Get Directors List
- **Endpoint:** `GET /api/v1/directors`
- **Description:** Fetches a list of company directors with their profile, role, and contact information (email/slack).

---

### 5. Optimized Profile Management (Granular APIs)

These endpoints split the profile data for better frontend performance and reusability.

#### Get Profile Header
- **Endpoint:** `GET /api/v1/profile/header`
- **Description:** Basic user info: Name, Role, Dept, Employee ID, Profile Image, and Online Status.

#### Get Personal Information
- **Endpoint:** `GET /api/v1/profile/personal`
- **Description:** Detailed personal info: DOB, Phone, Email, Address, and Emergency Contact.

#### Get Professional Information
- **Endpoint:** `GET /api/v1/profile/professional`
- **Description:** Employment details: Dept, Role, Manager, Joining Date, Employment Type, and Work Location.

#### Get Account Information
- **Endpoint:** `GET /api/v1/profile/account`
- **Description:** Internal account details: Employee ID, Status, Username, and Work Email.

#### Get Profile Documents
- **Endpoint:** `GET /api/v1/profile/documents`
- **Description:** Links to employee documents like Contracts, ID Verification, and Salary Slips.

#### Get Profile Activity Feed
- **Endpoint:** `GET /api/v1/profile/activity`
- **Description:** A feed of recent profile updates (e.g., "Address details updated").

#### Get Notification Settings
- **Endpoint:** `GET /api/v1/profile/notifications`
- **Description:** User notification preferences (Email, HR announcements, Payroll alerts).

---

### 6. Profile Updates

#### Edit Personal Profile
- **Endpoint:** `POST /api/v1/profile/edit`
- **Description:** Updates the user's personal details.
- **Payload:**
  ```json
  {
      "name": "Full Name",
      "phone": "Phone Number",
      "address": "Home Address",
      "profileImage": "Image URL or Path"
  }
  ```

---
 
## Day-4: Reusable Attendance, Schedule & Payroll APIs

### 7. Detailed Attendance View (Reusable)
 
#### Get Today's Attendance Stats
- **Endpoint:** `POST /api/v1/attendance/stats`
- **Description:** Basic attendance data (Status, Date, Check-In/Out times).

#### Get Work Hours Summary
- **Endpoint:** `POST /api/v1/attendance/work-summary`
- **Description:** Worked hours, break duration, and percentage calculations.

#### Get Shift & Schedule
- **Endpoint:** `POST /api/v1/attendance/shift`
- **Description:** Shift timings (9:00-6:00) and break schedules.

#### Get Attendance Timeline
- **Endpoint:** `POST /api/v1/attendance/timeline`
- **Description:** Chronological timeline of events (Punch IN/OUT, Break Start/End).

#### Get Attendance History / Logs
- **Endpoint:** `POST /api/v1/attendance/logs`
- **Description:** Retrieves attendance history for a specific date range.
- **Payload:**
    ```json
    {
        "fromDate": "2026-03-01",
        "toDate": "2026-03-31"
    }
    ```
- **Response includes:**
    - `summary`: Total working hours, present day count, late day count.
    - `logs`: Daily list of {Date, check-in, check-out, status, isLate}.

---

### 8. Working Schedule & Holidays

#### Get Current Schedule
- **Endpoint:** `POST /api/v1/schedule/current`
- **Description:** Details of current duty (Day/Night), shift category, and working hours.

#### Get Weekly Schedule
- **Endpoint:** `POST /api/v1/schedule/weekly`
- **Description:** 7-day view of the schedule including work days, holidays, and offs.

#### Get Upcoming Holidays
- **Endpoint:** `POST /api/v1/schedule/holidays`
- **Description:** List of the next few company holidays.

#### Request Shift Change
- **Endpoint:** `POST /api/v1/schedule/request-shift-change`
- **Description:** Allows an employee to request a change in their assigned shift.

#### Full Holiday Calendar
- **Endpoint:** `POST /api/v1/schedule/holiday-calendar`
- **Description:** Complete year-wise holiday list.

---

### 9. Reusable Leave Management (POST for GET)

#### Get Leave Balances
- **Endpoint:** `POST /api/v1/leave/balances`
- **Description:** Current balances for PL, CL, and SL.

#### Get Upcoming Leaves
- **Endpoint:** `POST /api/v1/leave/upcoming`
- **Description:** List of future leave requests with details (Date, Type, Days, Reason, Status).

#### Get Leave History
- **Endpoint:** `POST /api/v1/leave/history`
- **Description:** Historical record of all past leaves with from-to dates, type, and final status.

#### Apply for Leave (Granular)
- **Endpoint:** `POST /api/v1/leave/apply`
- **Description:** Submits a new leave request.
- **Payload:**
    ```json
    {
        "leaveType": "SL",
        "startDate": "2026-04-10",
        "endDate": "2026-04-12",
        "reason": "Family function"
    }
    ```
- **Leave Types:** `SL` (Sick Leave), `CL` (Casual Leave), `PL` (Privilege Leave).

---

### 10. Leave Request Management (Approver View)

#### Get All Employee Leave Requests
- **Endpoint:** `POST /api/v1/leave/requests/all`
- **Description:** Returns every leave application across the board (Used by HR/Manager).

#### Get Pending Leave Requests
- **Endpoint:** `POST /api/v1/leave/requests/pending`
- **Description:** Returns only the leave applications with status "Pending" (`ApprovalStatusID: 3`).

#### Get Leave Approval History
- **Endpoint:** `POST /api/v1/leave/requests/history`
- **Description:** Returns requests that have already been finalized (Approved or Rejected).

---

### 11. Payroll Management (POST for GET)

#### Get Current Month Salary
- **Endpoint:** `POST /api/v1/payroll/current`
- **Description:** Returns detailed earnings/deductions breakdown and action links (View, Download, Share).

#### Get Salary History
- **Endpoint:** `POST /api/v1/payroll/history`
- **Description:** Historical record of monthly salaries, statuses, and payment dates.

#### Get Payslip Detailed View
- **Endpoint:** `POST /api/v1/payroll/details`
- **Description:** Full breakdown of earnings (Basic + Bonus = Gross) and deductions (Tax + PF) for a specific month.
- **Includes:** Employee IDs, Department, Payroll Period, and Net Take Home Pay calculation.

---

### 12. Performance Management (POST for GET)

#### Get Employee Performance
- **Endpoint:** `POST /api/v1/performance/current`
- **Description:** Returns monthly performance score, core metrics (Efficiency, Quality, Reliability), goals tracking, feedback, and achievements.

#### Get Performance History
- **Endpoint:** `POST /api/v1/performance/history`
- **Description:** Historical record of monthly reviews, improvements, and performance metrics (Overall, Project, Work).

#### Get Department Performance Overview
- **Endpoint:** `POST /api/v1/performance/dept-overview`
- **Description:** Average team performance, top performer, pending tasks, and pending reviews.

#### Get Monthly Performance Overview
- **Endpoint:** `POST /api/v1/performance/monthly-overview`
- **Description:** High-level summary of the month's overall score and trends.

#### Get Recent Achievements
- **Endpoint:** `POST /api/v1/performance/recent-achievements`
- **Description:** List of recently earned rewards and recognitions across the team.

#### Get Employee Performance Breakdown
- **Endpoint:** `POST /api/v1/performance/breakdown`
- **Description:** Detailed list of employees with their performance scores, department, and joining info.

#### Get Monthly Metrics
- **Endpoint:** `POST /api/v1/performance/metrics`
- **Description:** Rates for task completion, goals achieved, and attendance.

#### Get Performance KPIs
- **Endpoint:** `POST /api/v1/performance/kpis`
- **Description:** Key performance indicators for the current month.

#### Submit Performance Review
- **Endpoint:** `POST /api/v1/performance/submit-review`
- **Description:** Submit a manager's performance evaluation for an employee.

#### Get Performance Review Details
- **Endpoint:** `POST /api/v1/performance/review-details`
- **Description:** Detailed view of an individual's performance review, including ratings and tips.

