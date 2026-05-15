# HR Dashboard API Connection & Sidebar Minimal Design Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Connect all HR Dashboard module APIs to dynamic data, make sidebar minimal for 6 modules, and fix HR and Admin Dashboard API endpoints.

**Architecture:** Simplify sidebar by removing sub-items for Leave, Recruitment, Payroll, Performance, Analytics, Resignation modules. Each module becomes a single menu item. Fix API connections in services and update page components to handle API responses correctly.

**Tech Stack:** React, Vite, axios, Recharts, Lucide React

---

## File Structure

### Files to Modify
- `infiApHRMS_Desktop/src/components/layout/Sidebar.jsx` - Remove subItems for 6 modules
- `infiApHRMS_Desktop/src/services/hr.service.js` - Fix API response mappings
- `infiApHRMS_Desktop/src/services/hrApi.js` - Fix API methods
- `infiApHRMS_Desktop/src/services/adminApi.js` - Add missing endpoints
- `infiApHRMS_Desktop/src/pages/hr-dashboard/leave-management/LeaveManagement.jsx` - Connect API
- `infiApHRMS_Desktop/src/pages/hr-dashboard/recruitment/RecruitmentHub.jsx` - Connect API
- `infiApHRMS_Desktop/src/pages/hr-dashboard/payroll-management/PayrollHub.jsx` - Connect API
- `infiApHRMS_Desktop/src/pages/hr-dashboard/performance-management/PerformanceManagement.jsx` - Connect API
- `infiApHRMS_Desktop/src/pages/hr-dashboard/analytics-management/AnalyticsHub.jsx` - Connect API
- `infiApHRMS_Desktop/src/pages/hr-dashboard/resignation-management/ResignationHub.jsx` - Connect API

---

### Task 1: Simplify Sidebar - Remove SubItems for 6 Modules

**Files:**
- Modify: `infiApHRMS_Desktop/src/components/layout/Sidebar.jsx:193-285`

- [ ] **Step 1: Modify leave menu item**

Replace the current Leave menu item (lines ~193-207) with a simplified version without subItems:

```jsx
{
  name: 'Leave',
  icon: Clock,
  path: '/leave',
  roles: ['HR']
},
```

- [ ] **Step 2: Modify recruitment menu item**

Replace recruitment menu item (lines ~209-222) with simplified version:

```jsx
{
  name: 'Recruitment',
  icon: Briefcase,
  path: '/recruitment',
  roles: ['HR']
},
```

- [ ] **Step 3: Modify payroll menu item**

Replace payroll menu item (lines ~224-235) with simplified version:

```jsx
{
  name: 'Payroll',
  icon: CreditCard,
  path: '/payroll',
  roles: ['HR']
},
```

- [ ] **Step 4: Modify performance menu item**

Replace performance menu item (lines ~249-260) with simplified version:

```jsx
{
  name: 'Performance',
  icon: BarChart3,
  path: '/performance',
  roles: ['HR']
},
```

- [ ] **Step 5: Modify analytics menu item**

Replace analytics menu item (lines ~262-273) with simplified version:

```jsx
{
  name: 'Analytics',
  icon: BarChart,
  path: '/analytics',
  roles: ['HR']
},
```

- [ ] **Step 6: Modify resignation menu item**

Replace resignation menu item (lines ~275-285) with simplified version:

```jsx
{
  name: 'Resignation',
  icon: DoorOpen,
  path: '/resignation',
  roles: ['HR']
},
```

- [ ] **Step 7: Commit**

```bash
git add infiApHRMS_Desktop/src/components/layout/Sidebar.jsx
git commit -m "refactor: simplify sidebar - remove subItems for 6 modules"
```

---

### Task 2: Fix Leave Module API Connection

**Files:**
- Modify: `infiApHRMS_Desktop/src/pages/hr-dashboard/leave-management/LeaveManagement.jsx:95-150`

- [ ] **Step 1: Read current API fetch code**

Check lines 95-150 for existing API calls.

- [ ] **Step 2: Update API response handling**

Replace the fetchStats function with corrected response mapping:

```jsx
useEffect(() => {
  const fetchStats = async () => {
    try {
      const res = await getLeaveStats();
      const data = res.data;
      
      if (data?.status === 'success' || data?.data) {
        const stats = data.data || data;
        setStatCards(prev => prev.map(card => {
          if (card.filter === 'Pending') return { ...card, value: stats.pendingCount || stats.pending || '0' };
          if (card.filter === 'Approved') return { ...card, value: stats.approvedCount || stats.approved || '0' };
          if (card.filter === 'Rejected') return { ...card, value: stats.rejectedCount || stats.rejected || '0' };
          if (card.filter === 'All Requests') return { ...card, value: stats.onLeaveToday || stats.today || '0' };
          return card;
        }));
      }
    } catch (error) {
      console.error('Error fetching leave stats:', error);
    }
  };
  fetchStats();
}, []);
```

- [ ] **Step 3: Commit**

```bash
git add infiApHRMS_Desktop/src/pages/hr-dashboard/leave-management/LeaveManagement.jsx
git commit -m "fix: connect LeaveManagement API - handle response format"
```

---

### Task 3: Fix Recruitment Module API Connection

**Files:**
- Modify: `infiApHRMS_Desktop/src/pages/hr-dashboard/recruitment/RecruitmentHub.jsx` (or main recruitment page)

- [ ] **Step 1: Find recruitment page**

List files in recruitment directory:
```bash
ls infiApHRMS_Desktop/src/pages/hr-dashboard/recruitment/
```

- [ ] **Step 2: Update API calls**

Add or update useEffect to fetch recruitment data:

```jsx
import { getRecruitmentDashboard, getCandidates } from '../../../services/hrApi';

useEffect(() => {
  const fetchData = async () => {
    try {
      const [dashboardRes, candidatesRes] = await Promise.all([
        getRecruitmentDashboard(),
        getCandidates()
      ]);
      
      // Process dashboard data
      const dashData = dashboardRes.data?.data || dashboardRes.data;
      // Process candidates data
      const candData = candidatesRes.data?.data || candidatesRes.data;
      
      // Update state with fetched data
    } catch (error) {
      console.error('Error fetching recruitment data:', error);
    }
  };
  fetchData();
}, []);
```

- [ ] **Step 3: Remove hardcoded data arrays**

Find hardcoded arrays like `pendingCandidates`, `scheduledInterviews` etc. and replace with state fetched from API.

- [ ] **Step 4: Commit**

```bash
git add infiApHRMS_Desktop/src/pages/hr-dashboard/recruitment/
git commit -m "fix: connect Recruitment API - dynamic data"
```

---

### Task 4: Fix Payroll Module API Connection

**Files:**
- Modify: `infiApHRMS_Desktop/src/pages/hr-dashboard/payroll-management/PayrollHub.jsx` (or main payroll page)

- [ ] **Step 1: Find payroll page**

List files:
```bash
ls infiApHRMS_Desktop/src/pages/hr-dashboard/payroll-management/
```

- [ ] **Step 2: Update API calls**

```jsx
import { getSalaryList, processSalary } from '../../../services/hrApi';

useEffect(() => {
  const fetchData = async () => {
    try {
      const res = await getSalaryList({ month: currentMonth, year: currentYear });
      const data = res.data?.data || res.data;
      // Update salary list state
    } catch (error) {
      console.error('Error fetching payroll data:', error);
    }
  };
  fetchData();
}, [currentMonth, currentYear]);
```

- [ ] **Step 3: Commit**

```bash
git add infiApHRMS_Desktop/src/pages/hr-dashboard/payroll-management/
git commit -m "fix: connect Payroll API - dynamic data"
```

---

### Task 5: Fix Performance Module API Connection

**Files:**
- Modify: `infiApHRMS_Desktop/src/pages/hr-dashboard/performance-management/PerformanceManagement.jsx`

- [ ] **Step 1: Read current file**

- [ ] **Step 2: Update API calls**

```jsx
import { getPerformanceDashboard, getPerformanceList } from '../../../services/hrApi';

useEffect(() => {
  const fetchData = async () => {
    try {
      const [dashboardRes, listRes] = await Promise.all([
        getPerformanceDashboard({ month: currentMonth, year: currentYear }),
        getPerformanceList({ month: currentMonth })
      ]);
      
      const dashData = dashboardRes.data?.data || dashboardRes.data;
      const listData = listRes.data?.data || listRes.data;
      // Update state
    } catch (error) {
      console.error('Error fetching performance data:', error);
    }
  };
  fetchData();
}, [currentMonth, currentYear]);
```

- [ ] **Step 3: Commit**

```bash
git add infiApHRMS_Desktop/src/pages/hr-dashboard/performance-management/
git commit -m "fix: connect Performance API - dynamic data"
```

---

### Task 6: Fix Analytics Module API Connection

**Files:**
- Modify: `infiApHRMS_Desktop/src/pages/hr-dashboard/analytics-management/AnalyticsHub.jsx`

- [ ] **Step 1: Find analytics page**

```bash
ls infiApHRMS_Desktop/src/pages/hr-dashboard/analytics-management/
```

- [ ] **Step 2: Update API calls**

```jsx
import { getAnalyticsReport, getAttendanceAnalytics, getPerformanceAnalytics } from '../../../services/hrApi';

useEffect(() => {
  const fetchData = async () => {
    try {
      const res = await getAnalyticsReport();
      const data = res.data?.data || res.data;
      // Update analytics state
    } catch (error) {
      console.error('Error fetching analytics:', error);
    }
  };
  fetchData();
}, []);
```

- [ ] **Step 3: Commit**

```bash
git add infiApHRMS_Desktop/src/pages/hr-dashboard/analytics-management/
git commit -m "fix: connect Analytics API - dynamic data"
```

---

### Task 7: Fix Resignation Module API Connection

**Files:**
- Modify: `infiApHRMS_Desktop/src/pages/hr-dashboard/resignation-management/ResignationHub.jsx`

- [ ] **Step 1: Find resignation page**

```bash
ls infiApHRMS_Desktop/src/pages/hr-dashboard/resignation-management/
```

- [ ] **Step 2: Update API calls**

```jsx
import { getResignationRegister, createResignation } from '../../../services/hrApi';

useEffect(() => {
  const fetchData = async () => {
    try {
      const res = await getResignationRegister();
      const data = res.data?.data || res.data;
      // Update resignation list state
    } catch (error) {
      console.error('Error fetching resignation data:', error);
    }
  };
  fetchData();
}, []);
```

- [ ] **Step 3: Commit**

```bash
git add infiApHRMS_Desktop/src/pages/hr-dashboard/resignation-management/
git commit -m "fix: connect Resignation API - dynamic data"
```

---

### Task 8: Fix Admin Dashboard API Endpoints

**Files:**
- Modify: `infiApHRMS_Desktop/src/services/adminApi.js`
- Modify: `infiApHRMS_Desktop/src/pages/admin-dashboard/` (relevant pages)

- [ ] **Step 1: Check current adminApi.js**

Read current file and identify missing endpoints.

- [ ] **Step 2: Add missing endpoints**

```javascript
import api from '../utils/axios';

export const getAdminProfile = () => api.get('/admin-dashboard/profile');
export const updateAdminProfile = (data) => api.patch('/admin-dashboard/profile', data);
export const getAdminDashboardStats = () => api.get('/admin-dashboard/stats');
export const getCompanyEmployees = (params) => api.get('/admin-dashboard/employees', { params });
export const getCompanyDepartments = () => api.get('/admin-dashboard/departments');

export default {
  getAdminProfile,
  updateAdminProfile,
  getAdminDashboardStats,
  getCompanyEmployees,
  getCompanyDepartments,
};
```

- [ ] **Step 3: Fix admin dashboard pages**

Update pages to use the new adminApi endpoints.

- [ ] **Step 4: Commit**

```bash
git add infiApHRMS_Desktop/src/services/adminApi.js
git add infiApHRMS_Desktop/src/pages/admin-dashboard/
git commit -m "fix: add Admin Dashboard API endpoints"
```

---

### Task 9: Verify All Modules Work

**Files:**
- All modified files

- [ ] **Step 1: Start development server**

```bash
cd infiApHRMS_Desktop && npm run dev
```

- [ ] **Step 2: Test each module**

Navigate to each URL and verify data loads:
- http://localhost:5173/leave
- http://localhost:5173/recruitment
- http://localhost:5173/payroll
- http://localhost:5173/performance
- http://localhost:5173/analytics
- http://localhost:5173/resignation
- http://localhost:5173/admin/dashboard

- [ ] **Step 3: Check console for errors**

Verify no API errors in browser console.



---

## Plan Summary

| Task | Description | Files |
|------|-------------|-------|
| 1 | Sidebar minimal | Sidebar.jsx |
| 2 | Leave API | LeaveManagement.jsx |
| 3 | Recruitment API | recruitment/*.jsx |
| 4 | Payroll API | payroll/*.jsx |
| 5 | Performance API | performance/*.jsx |
| 6 | Analytics API | analytics/*.jsx |
| 7 | Resignation API | resignation/*.jsx |
| 8 | Admin API | adminApi.js |
| 9 | Verify | All modules |

**Estimated Time:** 9 tasks, ~45 minutes total