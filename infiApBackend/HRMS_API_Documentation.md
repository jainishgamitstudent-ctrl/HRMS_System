# InfiAP HRMS Backend API Documentation

Base URL: `https://api.yourdomain.com/api/v1`

---

## 1️⃣ Authentication APIs (Used by all users)

### ➤ Register User
**POST** `/auth/signup`
**Body:**
```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "123456",
  "role": "employee"
}
```

### ➤ Login
**POST** `/auth/login`
**Body:**
```json
{
  "email": "john@example.com",
  "password": "123456"
}
```
**Response:**
```json
{
  "message": "OTP sent to your email for 2FA verification",
  "require2FA": true,
  "userId": "user_id_here"
}
```

### ➤ Verify Login 2FA OTP
**POST** `/auth/verify-2fa`
**Body:**
```json
{
  "userId": "user_id_here",
  "otp": "123456"
}
```
**Response:**
```json
{
  "message": "2FA verified successfully",
  "token": "JWT_TOKEN",
  "role": "employee",
  "user": { ... }
}
```

### ➤ Forgot Password
**POST** `/auth/forgot-password`
**Body:**
```json
{
  "email": "john@example.com"
}
```

### ➤ Reset Password
**POST** `/auth/reset-password`
**Body:**
```json
{
  "token": "RESET_TOKEN",
  "newPassword": "newpassword123"
}
```

---

## 2️⃣ Main Admin APIs (With Request Body)

### Company Setup

#### ➤ Create Company
**POST** `/main-admin/company`
**Body:**
```json
{
  "companyName": "InfiAP Pvt Ltd",
  "email": "info@infiap.com",
  "phone": "9876543210",
  "address": "Mumbai, India",
  "industry": "IT Services",
  "totalEmployees": 50
}
```

#### ➤ Update Company
**PUT** `/main-admin/company/:id`
**Body:**
```json
{
  "companyName": "InfiAP Technologies",
  "phone": "9999999999",
  "address": "Bangalore, India"
}
```

### Global User Management

#### ➤ Create Admin
**POST** `/main-admin/admin`
**Body:**
```json
{
  "name": "Admin User",
  "email": "admin@company.com",
  "password": "123456",
  "role": "admin",
  "companyId": "company_id"
}
```

#### ➤ Create HR
**POST** `/main-admin/hr`
**Body:**
```json
{
  "name": "HR Manager",
  "email": "hr@company.com",
  "password": "123456",
  "role": "hr",
  "companyId": "company_id"
}
```

#### ➤ Update User Permissions
**PUT** `/main-admin/user-permission/:id`
**Body:**
```json
{
  "permissions": [
    "manage_employees",
    "manage_payroll",
    "view_reports"
  ]
}
```

### Platform Configuration

#### ➤ Update Config
**PUT** `/main-admin/config`
**Body:**
```json
{
  "maintenanceMode": false,
  "maxUsersPerCompany": 500,
  "defaultLeaveDays": 20
}
```

### System Integrations

#### ➤ Cloud Integration
**POST** `/main-admin/integration/cloud`
**Body:**
```json
{
  "provider": "aws",
  "accessKey": "ACCESS_KEY",
  "secretKey": "SECRET_KEY",
  "region": "ap-south-1"
}
```

#### ➤ Email Integration
**POST** `/main-admin/integration/email`
**Body:**
```json
{
  "provider": "smtp",
  "host": "smtp.gmail.com",
  "port": 587,
  "email": "noreply@company.com",
  "password": "email_password"
}
```

#### ➤ Security Settings
**POST** `/main-admin/integration/security`
**Body:**
```json
{
  "enable2FA": true,
  "sessionTimeout": 30,
  "ipWhitelist": ["192.168.1.1"]
}
```

### OTP Approval System

#### ➤ Generate OTP
**POST** `/main-admin/security/generate-otp`
**Body:**
```json
{
  "action": "update_company_settings",
  "requestedBy": "admin_id"
}
```

#### ➤ Verify OTP
**POST** `/main-admin/security/verify-otp`
**Body:**
```json
{
  "otp": "123456",
  "requestId": "request_id"
}
```

#### ➤ Approve Change
**POST** `/main-admin/security/approve-change`
**Body:**
```json
{
  "requestId": "request_id",
  "approvedBy": "main_admin_id"
}
```

#### ➤ Reject Change
**POST** `/main-admin/security/reject-change`
**Body:**
```json
{
  "requestId": "request_id",
  "reason": "Invalid request"
}
```

---

## 2️⃣ Main Admin Dashboard APIs (Protected: `main_admin`)

All endpoints in this section require a valid JWT token and `main_admin` role.
Base path: `/main-admin-dashboard`

### ➤ Home Summary
**GET** `/main-admin-dashboard/home-summary`

**Response:**
```json
{
  "success": true,
  "data": {
    "totalCompanies": 12,
    "totalEmployees": 420,
    "totalHRManagers": 15,
    "activeUsers": 188,
    "pendingRegistration": {
      "total": 9,
      "users": 6,
      "companies": 3
    },
    "systemHealth": {
      "status": "healthy",
      "maintenanceMode": false,
      "uptimePercentage": 99.9,
      "processUptimeSeconds": 12450,
      "integrationsConnected": 3,
      "integrationsExpected": 3,
      "checkedAt": "2026-04-15T11:10:00.000Z"
    },
    "criticalAlerts": 0
  }
}
```

### ➤ Platform Activity Graph
**GET** `/main-admin-dashboard/platform-activity?period=7d`

Supported periods: `7d`, `30d`, `90d`

### ➤ Registered Companies List
**GET** `/main-admin-dashboard/registered-companies?page=1&limit=20&search=infi&sortBy=createdAt&sortOrder=desc`

Returns paginated list with per-company user stats and registration status.

### ➤ System Integrations Status
**GET** `/main-admin-dashboard/system-integrations/status`

Returns cloud, email, and security integration connectivity summary.

### ➤ System Alerts
**GET** `/main-admin-dashboard/system-alerts?page=1&limit=20&type=WARNING&status=active`

Includes generated core alerts:
- API Latency Spike
- System Maintenance
- Security Audit Passed

### ➤ Acknowledge Alert
**POST** `/main-admin-dashboard/system-alerts/:id/acknowledge`

**Body:**
```json
{
  "notes": "Investigating with infra team"
}
```

### ➤ Quick Action: Add Company
**POST** `/main-admin-dashboard/quick-actions/add-company`

**Body:**
```json
{
  "companyName": "Acme Labs",
  "email": "hello@acmelabs.com",
  "phone": "9999999999",
  "address": "Pune, India",
  "industry": "SaaS",
  "totalEmployees": 45,
  "admin": {
    "name": "Acme Admin",
    "email": "admin@acmelabs.com",
    "password": "StrongPass@123"
  }
}
```

### ➤ Quick Action: Previous Users Info
**GET** `/main-admin-dashboard/quick-actions/previous-users?page=1&limit=20&role=hr&search=john`

### ➤ Quick Action: Deep Audit
**POST** `/main-admin-dashboard/quick-actions/deep-audit`

Returns risk score and categorized findings (`critical`, `warning`, `info`).

### ➤ Quick Action: Broadcast
**POST** `/main-admin-dashboard/quick-actions/broadcast`

**Body:**
```json
{
  "category": "announcement",
  "headline": "Planned maintenance",
  "details": "Maintenance window at 11:00 PM IST",
  "targetedAudience": "all_employee",
  "targetDepartments": []
}
```

---

## 3️⃣ Employee Dashboard APIs

### Dashboard Data

#### ➤ Get Home Dashboard
**GET** `/dashboard/home`
**Response:**
```json
{
  "status": "Success",
  "data": {
    "greeting": {
      "message": "Welcome, Sneha Desai!",
      "subMessage": "Sneha Desai joined the Engineering team on Jan 20, 2026. Let's give her a warm welcome!"
    },
    "joiningToday": [
      {
        "name": "Sneha Desai",
        "role": "Engineering",
        "joinedAt": "Jan 20, 2026"
      }
    ],
    "checkInInfo": {
      "lastCheck": "09:02 AM",
      "location": "Mumbai Office"
    },
    ...
  }
}
```

### Attendance / Punch

#### ➤ Employee Punch
**POST** `/emp-punch`
**Body:**
```json
{
  "PunchType": 1,
  "Latitude": 21.1702,
  "Longitude": 72.8311,
  "IsAway": false
}
```
*Note: PunchType -> 1 = in, 2 = out, 3 = reset*

**Response:**
```json
{
  "status": "Success",
  "message": "Punch recorded successfully",
  "PunchTime": "2025-12-24 11:49:46 AM"
}
```

#### ➤ Get Punch Status
**GET** `/punch-status`
*Note: PunchType -> 1 = IN, 2 = OUT, 3 = NOT IN / NOT OUT*

**Response:**
```json
{
  "status": "Success",
  "statusCode": 200,
  "data": {
    "PunchType": 1,
    "PunchDateTime": "25-12-2025 06:31:15 AM"
  }
}
```

### Leave Balance

#### ➤ Get Employee Leave Balance
**GET** `/getemployeeleavebalance`
**Response:**
```json
{
  "status": "Success",
  "statusCode": 200,
  "message": "Leave balance retrieved successfully.",
  "data": [
    {
      "Leavename": "CL",
      "count": 15
    },
    {
      "Leavename": "PL",
      "count": 15
    },
    {
      "Leavename": "SL",
      "count": 13
    },
    {
      "Leavename": "WFH",
      "count": "7 day's"
    }
  ]
}
```

### Attendance Analytics

#### ➤ Late Check-in Count
**GET** `/late-checkin-count`
**Response:**
```json
{
  "status": "Success",
  "statusCode": 200,
  "data": {
    "late_checkin_count": 1
  }
}
```

#### ➤ Early Check-out Count
**GET** `/early-checkout-count`
**Response:**
```json
{
  "status": "Success",
  "statusCode": 200,
  "data": {
    "early_checkout_count": 1
  }
}
```

#### ➤ Half Day Count
**GET** `/Half_Day-count`
**Response:**
```json
{
  "status": "Success",
  "statusCode": 200,
  "data": {
    "Half_Day_count": 1
  }
}
```

#### ➤ Attendance Summary 
**GET** `/attendance-summary`
**Response:**
```json
{
  "status": "Success",
  "statusCode": 200,
  "data": {
    "present": 22,
    "leaves": 2,
    "holiday": 1
  }
}
```

#### ➤ Missed Punches
**GET** `/missed-punches`
*Note: Evaluates check-ins missed after 10 AM*
**Response:**
```json
{
  "status": "Success",
  "statusCode": 200,
  "data": [
    {
      "date": "Mar 2, 2026",
      "type": "Missing In"
    },
    {
      "date": "Mar 3, 2026",
      "type": "Missing Out"
    }
  ]
}
```

### Awards / Recognition

#### ➤ Get Employee of the Month
**GET** `/getemployeeofthemonth`
**Response:**
```json
{
    "status": "Success",
    "statusCode": 200,
    "data": [
        {
            "EmployeeOfTheMonthID": 1,
            "EmployeeID": 1,
            "Name": "Durgesh Jadav",
            "MonthOfYear": "2026-01",
            "CreatedDate": "2026-01-06 09:11:32",
            "UpdatedDate": "2026-01-06 09:11:32"
        }
    ]
}
```

### Events / Birthdays

#### ➤ Get DOB (Birthdays)
**GET** `/getDOB`
**Response:**
```json
{
    "status": "Success",
    "data": {
        "todays_birthdays": [
            {
                "name": "Jainish Gamit",
                "dob": "06-01-2026"
            }
        ],
        "current_month_birthdays": []
    }
}
```

### Leave Management

#### ➤ Apply for Leave
**POST** `/leaveapplications`
**Body:**
```json
{
     "LeaveType": "SL",
     "Reason": "Family function 111111..",
     "StartDate": "2026-01-18",
     "EndDate": "2026-01-18",
     "IsHalfDay": false,
     "IsFirstHalf": false
}
```
**Response:**
```json
{
     "status": "Success",
     "message": "Leave application submitted successfully."
}
```

#### ➤ Get User Leave Application
**GET** `/leaveapplications`
**Response:**
```json
{
     "status": "Success",
     "statusCode": 200,
     "data": {
         "LeaveApplicationMasterID": 9,
         "EmployeeID": 1,
         "LeaveType": "Sick Leave",
         "ApprovalStatusID": 3,
         "ApprovalStatus": "Awaiting Approve",
         "ApprovalUsername": "Jainish Gamit",
         "Reason": "Family function 111111..",
         "StartDate": "2026-01-18",
         "EndDate": "2026-01-18",
         "IsHalfDay": false,
         "IsFirstHalf": false,
         "CreatedBy": 7,
         "UpdatedBy": 7,
         "CreatedDate": "2026-01-16T09:03:45.804918Z",
         "UpdatedDate": "2026-01-16T09:03:45.804935Z"
     }
}
```

#### ➤ Get Pending Approvals (For HR/Manager)
**GET** `/leaveapprovals`
**Response:**
```json
{
     "status": "Success",
     "total_pending_approvals": 1,
     "pending_approvals": [
         {
             "Leave_ID": 9,
             "employee_name": "Riya mishra",
             "leave_type": "Sick Leave",
             "start_date": "2026-01-18",
             "end_date": "2026-01-18",
             "reason": "Family function 111111..",
             "profile_image": "/img/StoreGoogle_Play_TypeLight_LanguageEnglish3x.png",
             "applied_on": "2026-01-16",
             "IsHalfDay": false,
             "IsFirstHalf": false
         }
     ]
}
```

#### ➤ Approve Leave
**POST** `/allapprove`
**Body:**
```json
{
     "ProgramID": 2,
     "TranID": 9,
     "Reason": "done chal se"
}
```
**Response:**
```json
{
     "status": "Success",
     "statusCode": 200,
     "message": "Approval updated successfully."
}
```

