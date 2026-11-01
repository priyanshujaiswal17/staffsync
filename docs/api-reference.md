# API Reference — StaffSync

Base URL: `/api` (or `http://127.0.0.1:5000/api`)

All protected endpoints require: `Authorization: Bearer <JWT_TOKEN>`

---

## Authentication

### POST /api/auth/register
Register a new Employee account.

**Body:**
```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "Password123"
}
```

**Response 201:**
```json
{
  "token": "eyJ...",
  "user": { "id": "...", "name": "John Doe", "role": "Employee" }
}
```

---

### POST /api/auth/login
Login and receive JWT token.

**Body:**
```json
{ "email": "hr@staffsync.com", "password": "Password123" }
```

**Response 200:**
```json
{
  "token": "eyJ...",
  "user": { "id": "...", "name": "HR Director", "role": "HR" }
}
```

---

### GET /api/auth/me
Get current authenticated user's profile.

**Headers:** `Authorization: Bearer <token>`

**Response 200:**
```json
{
  "user": { "id": "...", "name": "...", "email": "...", "role": "HR" },
  "employee": { "employeeId": "EMP001", "department": "Engineering", ... }
}
```

---

## Employees

### GET /api/employees?page=1&limit=10
List all employees (HR only). Paginated.

**Response 200:**
```json
{
  "employees": [...],
  "total": 6,
  "page": 1,
  "pages": 1
}
```

---

### POST /api/employees
Create a new employee (HR only).

**Body:**
```json
{
  "name": "Jane Smith",
  "email": "jane@company.com",
  "password": "Temp1234!",
  "department": "Marketing",
  "designation": "Marketing Analyst",
  "managerId": "...",
  "joinDate": "2024-01-15"
}
```

---

### PUT /api/employees/profile/me
Employee self-updates allowed fields only.

**Body:**
```json
{ "phone": "+91-9876543210", "address": "Mumbai, India", "dateOfBirth": "1995-06-15" }
```

---

## Attendance

### POST /api/attendance/check-in
Employee checks in for the day.

**Response 201:**
```json
{
  "message": "Checked in successfully",
  "attendance": { "date": "2024-11-01", "checkIn": "09:15:00", "status": "Late" }
}
```

Status is `Late` if check-in is after 09:30.

---

### POST /api/attendance/check-out
Employee checks out (must have checked in first).

---

### GET /api/attendance/my?page=1&limit=30
Get own attendance history (Employee).

---

### GET /api/attendance?page=1&limit=20
Get all attendance records (HR only).

---

### GET /api/attendance/team
Get team attendance records (Manager only).

---

## Leaves

### POST /api/leaves/apply
Apply for leave (Employee).

**Body:**
```json
{
  "type": "Casual",
  "startDate": "2024-11-10",
  "endDate": "2024-11-12",
  "reason": "Personal work"
}
```

Validations: overlap check, balance check, dates must be future.

---

### GET /api/leaves/my
Get own leave requests (Employee).

---

### GET /api/leaves?status=Pending&page=1
Get all leave requests (HR).

---

### GET /api/leaves/team?status=Pending
Get team leave requests (Manager).

---

### PUT /api/leaves/:id/review
Approve or reject a leave (Manager or HR).

**Body:**
```json
{ "status": "Approved", "reviewNote": "Approved as requested" }
```

On Approval: leave balance is deducted automatically.
On Rejection: balance unchanged.

---

## Announcements

### POST /api/announcements
Create an announcement (HR only).

**Body:**
```json
{
  "title": "Office Closure Notice",
  "body": "The office will be closed on November 15th.",
  "audience": "All",
  "pinned": true
}
```

Audience options: `All`, `HR`, `Manager`, `Employee`

---

### GET /api/announcements?page=1
List announcements. Filtered by user's role automatically. Pinned first.

---

### DELETE /api/announcements/:id
Delete announcement (HR only).

---

## Trainings

### POST /api/trainings
Create a training program (Manager only).

**Body:**
```json
{
  "title": "React Advanced Patterns",
  "description": "Deep dive into React hooks and patterns",
  "trainer": "Senior Dev Team",
  "startDate": "2024-11-20",
  "endDate": "2024-11-22",
  "participantIds": ["emp_id_1", "emp_id_2"]
}
```

---

### GET /api/trainings
List training programs (all roles).

---

### PUT /api/trainings/:id
Update training (Manager only). Can update completion status and scores.

**Body:**
```json
{
  "participants": [
    { "employee": "emp_id_1", "status": "Completed", "score": 92 }
  ]
}
```

---

## Notifications

### GET /api/notifications?page=1
List own notifications.

---

### GET /api/notifications/unread-count
Get count of unread notifications.

**Response:** `{ "count": 3 }`

---

### PUT /api/notifications/mark-all-read
Mark all notifications as read.

---

## Reports

### GET /api/reports/dashboard
Full organization analytics (HR only).

**Response:**
```json
{
  "totalEmployees": 6,
  "activeEmployees": 6,
  "totalManagers": 2,
  "todayPresent": 4,
  "todayAbsent": 2,
  "pendingLeaves": 3,
  "approvedLeaves": 5,
  "totalTrainings": 3,
  "departments": [
    { "_id": "Engineering", "count": 3 },
    { "_id": "Marketing", "count": 2 }
  ]
}
```

---

## Error Responses

All endpoints return consistent error format:

```json
{ "message": "Error description here" }
```

| Status | Meaning |
|---|---|
| 400 | Bad Request / Validation error |
| 401 | Unauthenticated (missing/invalid token) |
| 403 | Forbidden (wrong role) |
| 404 | Resource not found |
| 409 | Conflict (duplicate, overlap) |
| 500 | Internal server error |
