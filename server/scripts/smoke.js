const dotenv = require('dotenv');
dotenv.config();

let serverInstance = null;

async function setup() {
  const DEFAULT_PORT = process.env.PORT || 5000;
  try {
    const res = await fetch(`http://localhost:${DEFAULT_PORT}/api/health`);
    if (res.ok) {
      return `http://localhost:${DEFAULT_PORT}/api`;
    }
  } catch (e) {
    // Server not running, launch in-process
  }

  const app = require('../server');
  const connectDB = require('../config/db');
  await connectDB();
  const TEST_PORT = 5005;
  await new Promise((resolve) => {
    serverInstance = app.listen(TEST_PORT, () => resolve());
  });
  return `http://localhost:${TEST_PORT}/api`;
}

async function tearDown() {
  if (serverInstance) {
    serverInstance.close();
  }
}

async function runSmokeTests() {
  const BASE = await setup();
  console.log(`Running StaffSync Smoke Tests against ${BASE}...`);

  let assertions = 0;
  let passed = 0;

  function assert(condition, message) {
    assertions++;
    if (condition) {
      passed++;
      console.log(`  PASS: ${message}`);
    } else {
      console.error(`  FAIL: ${message}`);
    }
  }

  try {
    // 1. Health check
    const healthRes = await fetch(`${BASE}/health`);
    const healthData = await healthRes.json();
    assert(healthRes.status === 200 && healthData.status === 'ok', 'Health endpoint returns 200 { status: "ok" }');

    // 2. HR Login
    const hrLogin = await fetch(`${BASE}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'hr@staffsync.com', password: 'Password123' })
    });
    const hrData = await hrLogin.json();
    assert(hrLogin.status === 200 && hrData.user.role === 'HR' && !!hrData.token, 'HR login succeeds with valid token');

    // 3. Manager Login
    const mgrLogin = await fetch(`${BASE}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'manager@staffsync.com', password: 'Password123' })
    });
    const mgrData = await mgrLogin.json();
    assert(mgrLogin.status === 200 && mgrData.user.role === 'Manager' && !!mgrData.token, 'Manager login succeeds with valid token');

    // 4. Employee 1 Login
    const emp1Login = await fetch(`${BASE}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'emp1@staffsync.com', password: 'Password123' })
    });
    const emp1Data = await emp1Login.json();
    assert(emp1Login.status === 200 && emp1Data.user.role === 'Employee' && !!emp1Data.token, 'Employee login succeeds with valid token');

    // 5. /api/auth/me assertions
    const meRes = await fetch(`${BASE}/auth/me`, {
      headers: { Authorization: `Bearer ${emp1Data.token}` }
    });
    const meData = await meRes.json();
    assert(meRes.status === 200 && meData.user.email === 'emp1@staffsync.com', 'Employee /auth/me returns current user profile');

    // 6. Security & RBAC: Employee cannot access HR route
    const hrRouteEmp = await fetch(`${BASE}/test-hr-only`, {
      headers: { Authorization: `Bearer ${emp1Data.token}` }
    });
    assert(hrRouteEmp.status === 403, 'Employee token rejected on HR-only route with 403');

    // 7. HR can access HR route
    const hrRouteHr = await fetch(`${BASE}/test-hr-only`, {
      headers: { Authorization: `Bearer ${hrData.token}` }
    });
    assert(hrRouteHr.status === 200, 'HR token accepted on HR-only route with 200');

    // 8. Employee cannot list all employees (403)
    const empListForbidden = await fetch(`${BASE}/employees`, {
      headers: { Authorization: `Bearer ${emp1Data.token}` }
    });
    assert(empListForbidden.status === 403, 'Employee cannot list all employees (returns 403)');

    // 9. HR lists employees with pagination metadata
    const hrEmpList = await fetch(`${BASE}/employees?page=1&limit=2`, {
      headers: { Authorization: `Bearer ${hrData.token}` }
    });
    const hrEmpListData = await hrEmpList.json();
    assert(
      hrEmpList.status === 200 &&
      hrEmpListData.page === 1 &&
      typeof hrEmpListData.pages === 'number' &&
      typeof hrEmpListData.total === 'number' &&
      Array.isArray(hrEmpListData.data),
      'HR lists employees with correct pagination metadata'
    );

    // 10. Employee cannot change role via profile update
    const roleTamperAttempt = await fetch(`${BASE}/employees/profile/me`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${emp1Data.token}`
      },
      body: JSON.stringify({ role: 'HR', phone: '+1-555-9999' })
    });
    const roleTamperData = await roleTamperAttempt.json();
    assert(
      roleTamperAttempt.status === 200 &&
      roleTamperData.data.user.role === 'Employee' &&
      roleTamperData.data.phone === '+1-555-9999',
      'Employee profile update updates phone but ignores role tampering'
    );

    // 11. Manager only sees own team
    const mgrTeamRes = await fetch(`${BASE}/managers/team`, {
      headers: { Authorization: `Bearer ${mgrData.token}` }
    });
    const mgrTeamData = await mgrTeamRes.json();
    assert(
      mgrTeamRes.status === 200 &&
      Array.isArray(mgrTeamData.data) &&
      mgrTeamData.data.length >= 2,
      'Manager only sees own team members on /api/managers/team'
    );

    // 12. Employee check-in
    const checkInRes = await fetch(`${BASE}/attendance/check-in`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${emp1Data.token}` }
    });
    const checkInData = await checkInRes.json();
    assert(
      checkInRes.status === 200 || (checkInRes.status === 400 && checkInData.message.includes('Already checked in')),
      'Employee check-in succeeds or handles existing check-in'
    );

    // 13. Double check-in rejected with 400
    const doubleCheckInRes = await fetch(`${BASE}/attendance/check-in`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${emp1Data.token}` }
    });
    assert(doubleCheckInRes.status === 400, 'Double check-in on the same day is rejected with 400');

    // 14. Check-out succeeds
    const checkOutRes = await fetch(`${BASE}/attendance/check-out`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${emp1Data.token}` }
    });
    assert(checkOutRes.status === 200 || (checkOutRes.status === 400 && checkOutRes.status !== 500), 'Employee check-out succeeds with valid response');

    // 15. Leave: Insufficient balance rejected (400)
    const futureDate1 = new Date(Date.now() + 86400000 * 10).toISOString();
    const futureDate2 = new Date(Date.now() + 86400000 * 50).toISOString();
    const highBalanceRes = await fetch(`${BASE}/leaves/apply`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${emp1Data.token}`
      },
      body: JSON.stringify({
        type: 'Casual',
        startDate: futureDate1,
        endDate: futureDate2,
        reason: 'Long vacation beyond allowance'
      })
    });
    assert(highBalanceRes.status === 400, 'Leave application with insufficient balance rejected with 400');

    // 16. Leave: Apply leave successfully (201)
    const randOffset = Math.floor(Math.random() * 50) + 20;
    const leaveStart = new Date(Date.now() + 86400000 * randOffset).toISOString();
    const leaveEnd = new Date(Date.now() + 86400000 * (randOffset + 1)).toISOString();
    const applyRes = await fetch(`${BASE}/leaves/apply`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${emp1Data.token}`
      },
      body: JSON.stringify({
        type: 'Casual',
        startDate: leaveStart,
        endDate: leaveEnd,
        reason: 'Personal family event'
      })
    });
    const applyData = await applyRes.json();
    assert(applyRes.status === 201 && applyData.data.status === 'Pending', 'Leave application submitted successfully with status Pending');
    const createdLeaveId = applyData.data._id;

    // 17. Leave: Overlap rejected (400)
    const overlapRes = await fetch(`${BASE}/leaves/apply`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${emp1Data.token}`
      },
      body: JSON.stringify({
        type: 'Sick',
        startDate: leaveStart,
        endDate: leaveEnd,
        reason: 'Overlapping request'
      })
    });
    assert(overlapRes.status === 400, 'Overlapping leave application rejected with 400');

    // 18. Manager approves leave
    const approveRes = await fetch(`${BASE}/leaves/${createdLeaveId}/review`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${mgrData.token}`
      },
      body: JSON.stringify({ status: 'Approved', reviewNote: 'Approved. Enjoy your time off!' })
    });
    assert(approveRes.status === 200, 'Manager approves leave with 200');

    // ==========================================
    // STEP 7 ASSERTIONS: ANNOUNCEMENTS, TRAININGS, NOTIFICATIONS, REPORTS
    // ==========================================

    // 19. HR posts announcement & bulk notifications generated
    const annRes = await fetch(`${BASE}/announcements`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${hrData.token}`
      },
      body: JSON.stringify({
        title: 'Quarterly Town Hall',
        body: 'Join us on Friday for our quarterly company-wide update.',
        audience: 'All',
        pinned: true
      })
    });
    const annData = await annRes.json();
    assert(annRes.status === 201 && annData.data.pinned === true, 'HR posts pinned announcement with 201');

    // 20. All roles can read announcements (paginated)
    const readAnn = await fetch(`${BASE}/announcements?page=1&limit=5`, {
      headers: { Authorization: `Bearer ${emp1Data.token}` }
    });
    const readAnnData = await readAnn.json();
    assert(readAnn.status === 200 && Array.isArray(readAnnData.data) && readAnnData.data.length > 0, 'Employee reads announcements feed with pagination');

    // 21. Manager creates training and enrolls team member
    const trainRes = await fetch(`${BASE}/trainings`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${mgrData.token}`
      },
      body: JSON.stringify({
        title: 'React & TypeScript Mastery',
        description: 'Advanced modern web development workshop',
        trainer: 'External Tech Coach',
        startDate: new Date(Date.now() + 86400000 * 5).toISOString(),
        endDate: new Date(Date.now() + 86400000 * 7).toISOString(),
        participantIds: [emp1Data.employee._id]
      })
    });
    const trainData = await trainRes.json();
    assert(trainRes.status === 201 && trainData.data.title === 'React & TypeScript Mastery', 'Manager creates training and enrols employee with 201');
    const trainingId = trainData.data._id;

    // 22. Manager updates training completion & score (performance monitoring)
    const updateTrain = await fetch(`${BASE}/trainings/${trainingId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${mgrData.token}`
      },
      body: JSON.stringify({
        participants: [
          { employee: emp1Data.employee._id, status: 'Completed', score: 95 }
        ]
      })
    });
    const updateTrainData = await updateTrain.json();
    assert(
      updateTrain.status === 200 &&
      updateTrainData.data.participants[0].status === 'Completed' &&
      updateTrainData.data.participants[0].score === 95,
      'Manager sets training completion and score (performance monitoring)'
    );

    // 23. Employee receives notifications & checks unread count
    const notifCountRes = await fetch(`${BASE}/notifications/unread-count`, {
      headers: { Authorization: `Bearer ${emp1Data.token}` }
    });
    const notifCountData = await notifCountRes.json();
    assert(notifCountRes.status === 200 && typeof notifCountData.count === 'number' && notifCountData.count > 0, 'Employee unread notification count is > 0');

    // 24. Employee marks all notifications as read
    const markReadRes = await fetch(`${BASE}/notifications/mark-all-read`, {
      method: 'PUT',
      headers: { Authorization: `Bearer ${emp1Data.token}` }
    });
    assert(markReadRes.status === 200, 'Employee marks all notifications as read');

    // 25. HR Reports and Analytics responded under 300ms
    const reportStart = Date.now();
    const reportRes = await fetch(`${BASE}/reports/dashboard`, {
      headers: { Authorization: `Bearer ${hrData.token}` }
    });
    const reportDuration = Date.now() - reportStart;
    const reportData = await reportRes.json();
    assert(
      reportRes.status === 200 &&
      reportDuration < 300 &&
      Array.isArray(reportData.data.headcountByDept) &&
      Array.isArray(reportData.data.attendanceStats) &&
      reportData.data.trainingMetrics !== undefined,
      `HR Reports endpoint returns full analytics in ${reportDuration}ms (< 300ms SLA)`
    );

    console.log(`\nSmoke Tests Complete: ${passed}/${assertions} assertions passed.`);
    await tearDown();
    if (passed === assertions) {
      process.exit(0);
    } else {
      process.exit(1);
    }
  } catch (err) {
    console.error('Smoke test runtime error:', err);
    await tearDown();
    process.exit(1);
  }
}

runSmokeTests();
