---
name: hr-dashboard-api-connection-design
description: Connect APIs for HR modules, minimal sidebar, fix endpoints
type: project
---

# HR Dashboard API Connection & Sidebar Minimal Design

## Overview
Connect all HR Dashboard module APIs (Leave, Recruitment, Payroll, Performance, Analytics, Resignation) to dynamic data, make sidebar minimal, and fix HR and Admin Dashboard API endpoints.

## Problem Statement
- All 6 modules have hardcoded mock data OR return errors/wrong format
- Sidebar has too many sub-items (3-5 per module)
- HR and Admin Dashboard endpoints broken

## Solution

### 1. Sidebar Minimal Design
- Each module becomes ONE menu item (no sub-items)
- Modules: Leave, Recruitment, Payroll, Performance, Analytics, Resignation → single items
- Submenu removed, content moves to tabs within each page

### 2. API Connection
- Fix existing API calls in hr.service.js / hrApi.js
- Map API response format correctly
- Remove hardcoded mock data
- Add error handling for all API calls

### 3. Module-by-Module Fixes
| Module | Current State | Fix |
|--------|--------------|-----|
| Leave | Hardcoded + API | Connect getLeaveStats, getLeaveApplications |
| Recruitment | Hardcoded + API | Connect getCandidateTracking, getRecruitmentDashboard |
| Payroll | Hardcoded + API | Connect getSalaryList, processSalary |
| Performance | Hardcoded + API | Connect getPerformanceDashboard, getPerformanceList |
| Analytics | Hardcoded + API | Connect getAnalyticsReport |
| Resignation | Hardcoded + API | Connect getResignationRegister |

### 4. Admin Dashboard Fixes
- Connect adminApi.js endpoints properly
- Fix profile endpoints
- Add missing endpoints

## UI Changes
- Sidebar: Remove subItems array for these modules
- Pages: Add tab-based navigation inside each module page

## Success Criteria
- [ ] Sidebar minimal with single items per module
- [ ] All modules load dynamic data from API
- [ ] No console errors on page load
- [ ] Admin Dashboard endpoints working