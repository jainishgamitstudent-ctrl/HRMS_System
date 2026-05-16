# HRMS API Summary

**Base URL**: `https://www.infiap.com/api/v1/hr`

| Feature | Endpoints |
|---|---|
| **Welcome** | `GET /dashboard/summary`, `GET /profile` |
| **Employee** | `GET /employees`, `POST /employees`, `PUT /employees/:id`, `GET /employees/:id/profile` |
| **Attendance** | `GET /attendance/daily-overview`, `GET /attendance/records`, `POST /attendance/correction/submit`, `GET /attendance/correction/requests`, `PUT /attendance/correction/review`, `GET /attendance/notifications`, `GET /attendance/reports`, `POST /attendance/generate-report` |
| **Leaves** | `GET /leaves/stats`, `GET /leaves/pending-detailed`, `GET /leaves/applications`, `GET /leaves/today`, `GET /leaves/requests`, `PUT /leaves/approve`, `GET /leaves/history`, `POST /leaves/generate-report` |
| **Recruitment** | `GET /recruitment/dashboard`, `GET /recruitment/candidates/tracking`, `GET /recruitment/candidates/review`, `GET /recruitment/candidates/:id/profile`, `PUT /.../schedule-interview`, `PUT /.../shortlist`, `PUT /.../reject`, `PUT /.../interview`, `PUT /.../select`, `POST /.../offer`, `GET /recruitment/jobs` |
| **Performance** | `GET /performance/dashboard`, `GET /performance/list`, `GET /performance/feedback/stats`, `GET /performance/feedback/recent`, `GET /performance/report/summary`, `GET /performance/report/trends`, `POST /performance/report/generate`, `POST /performance/feedback` |
| **Finance** | `GET /finance/salary-list`, `POST /finance/salary/process`, `GET /finance/payslip/:id` |
| **Resignation** | `POST /resignation`, `GET /resignation/register`, `PUT /resignation/exit-process` |
| **Analytics** | `GET /analytics/report`, `GET /analytics/attendance`, `GET /analytics/performance` |

---

## Main Admin Dashboard API Summary

**Base URL**: `https://www.infiap.com/api/v1/main-admin-dashboard`

| Feature | Endpoints |
|---|---|
| **Home** | `GET /home-summary` |
| **Platform Activity** | `GET /platform-activity?period=7d|30d|90d` |
| **Companies** | `GET /registered-companies?page=&limit=&search=&sortBy=&sortOrder=` |
| **Integrations** | `GET /system-integrations/status` |
| **System Alerts** | `GET /system-alerts?page=&limit=&type=&status=&search=`, `POST /system-alerts/:id/acknowledge` |
| **Quick Actions** | `POST /quick-actions/add-company`, `GET /quick-actions/previous-users`, `POST /quick-actions/deep-audit`, `POST /quick-actions/broadcast` |

> Access Control: All routes require JWT and `main_admin` role.
