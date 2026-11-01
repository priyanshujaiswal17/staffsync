# StaffSync — Detailed Architecture Documentation

## System Overview

StaffSync is built on the **MERN stack** following MVC separation of concerns:

- **M** = Mongoose Models (`server/models/`)
- **V** = React Pages + Components (`client/src/pages/`, `client/src/components/`)
- **C** = Express Controllers (`server/controllers/`)

---

## Backend Architecture

### Request Lifecycle

```
HTTP Request
    |
    v
Express Router (routes/index.js)
    |
    v
Middleware Chain:
  1. CORS validation
  2. express.json() body parsing
  3. verifyToken (JWT decode + user lookup)
  4. authorize(roles) (role check)
  5. express-validator rules
  6. validate() (check validation result)
    |
    v
Controller Handler (business logic + DB query)
    |
    v
Mongoose Model (schema validation + index query)
    |
    v
MongoDB (real or in-memory)
    |
    v
JSON Response + Error Handler
```

### Middleware Details

#### `middleware/auth.js` - verifyToken
```js
const verifyToken = (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) return res.status(401).json({ message: 'No token' });
  req.user = jwt.verify(token, process.env.JWT_SECRET);
  next();
};

const authorize = (...roles) => (req, res, next) => {
  if (!roles.includes(req.user.role))
    return res.status(403).json({ message: 'Forbidden' });
  next();
};
```

#### `middleware/error.js` - Global Error Handler
```js
app.use((err, req, res, next) => {
  console.error('[ERROR]', err.message);
  res.status(err.status || 500).json({
    message: err.message || 'Internal Server Error'
  });
});
```

---

## Frontend Architecture

### State Management (Redux Toolkit)

Each slice follows this pattern:
```
slice/
  state    = { items: [], loading: false, error: null }
  thunks   = createAsyncThunk calling API (axios)
  reducers = pending/fulfilled/rejected handlers
```

### Component Hierarchy
```
App (BrowserRouter + Suspense)
  |
  +-- Route / (Home)
  +-- Route /login (Login)
  +-- Route /register (Register)
  |
  +-- Route element=<Layout>   <-- authenticated routes
       |
       +-- Outlet (page content)
       |
       Layout renders:
         Sidebar (role-based navigation links)
         Topbar (notifications bell, user menu)
         Main content area
```

### Role-Adaptive Pages

Several pages show different content based on user role:

**Attendance Page:**
- Employee: check-in/out button + own history table
- Manager: team attendance table (no check-in button)
- HR: org-wide attendance with pagination

**Leaves Page:**
- Employee: apply form + own requests
- Manager: team leave requests with approve/reject
- HR: all leave requests + management

---

## Database Design Decisions

### Why 8 Separate Collections?

1. **Users** - Credentials only. Separated for security (passwordHash select:false)
2. **Employees** - HR profile data. Separated from Users for cleaner RBAC
3. **Managers** - Team array. Kept separate to avoid Employee schema bloat
4. **Attendance** - High write volume (daily). Compound index employee+date
5. **Leaves** - Workflow state machine (Pending→Approved/Rejected)
6. **Announcements** - Content-heavy, audience-targeted
7. **Trainings** - N:M with embedded participants (denormalized for read speed)
8. **Notifications** - High write, per-user, short-lived. Index on user+read

### Indexing Strategy

| Collection | Index | Purpose |
|---|---|---|
| Users | email (unique) | Login lookup |
| Employees | user (unique) | Profile join |
| Employees | manager | Team queries |
| Employees | department | Department filter |
| Employees | status | Active filter |
| Attendance | employee+date (unique) | Prevent duplicates |
| Attendance | employee | History query |
| Leaves | employee | Own leaves |
| Leaves | status | Pending filter |
| Notifications | user+read | Unread count |

---

## Security Architecture

### JWT Flow
```
Login Request (email + password)
  → bcrypt.compare(password, passwordHash)
  → jwt.sign({ id, role }, JWT_SECRET, { expiresIn: '7d' })
  → Return { token, user }

Subsequent Requests
  → Authorization: Bearer <token>
  → jwt.verify(token, JWT_SECRET)
  → req.user = { id, role }
  → authorize(roles) checks req.user.role
```

### Data Security
- `passwordHash` field has `select: false` - never returned in queries
- Self-update endpoint strips role/employeeId to prevent privilege escalation
- All list endpoints are paginated to prevent data dumps
- CORS restricts API to frontend origin

---

## Performance Architecture

### API Response Time Targets
- Auth endpoints: < 200ms
- List endpoints: < 300ms (with pagination)
- Reports dashboard: < 300ms (uses MongoDB aggregation)
- Attendance check-in/out: < 150ms

### Optimization Techniques
1. **MongoDB indexes** on all foreign keys and filter fields
2. **Pagination** on all list endpoints (default limit: 10-20)
3. **select()** to exclude unused fields from queries
4. **populate()** only when needed (not on list endpoints by default)
5. **Aggregation pipeline** for reports (single query)
6. **Code splitting** - 14 React pages are lazy-loaded
7. **Request timing** logged for performance monitoring

---

## Development Workflow

### Local Setup
```
Clone → npm install (server + client) → node server.js → npm run dev
No MongoDB required — MongoMemoryServer auto-starts
Demo data auto-seeded on empty database
```

### Testing
```
node scripts/smoke.js    # 25 HTTP assertions against live server
Tests: auth, employees, managers, attendance, leaves,
       announcements, trainings, notifications, reports
```

### Commit Convention
```
feat:     New feature
fix:      Bug fix
docs:     Documentation only
refactor: Code change (no feature/fix)
test:     Tests only
```
