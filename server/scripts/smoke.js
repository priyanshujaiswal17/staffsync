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
