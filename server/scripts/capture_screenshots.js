const puppeteer = require('puppeteer-core');
const path = require('path');
const fs = require('fs');

const EDGE_PATH = 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe';
const OUT_DIR = path.resolve(__dirname, '../../docs/screenshots');

if (!fs.existsSync(OUT_DIR)) {
  fs.mkdirSync(OUT_DIR, { recursive: true });
}

async function run() {
  console.log('Launching Edge browser...');
  const browser = await puppeteer.launch({
    executablePath: EDGE_PATH,
    headless: 'new',
    defaultViewport: { width: 1440, height: 900 },
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  const page = await browser.newPage();

  // 1. Home Landing Page
  console.log('1. Capturing Home landing page...');
  await page.goto('http://localhost:5173/', { waitUntil: 'networkidle0' });
  await new Promise(r => setTimeout(r, 1000));
  await page.screenshot({ path: path.join(OUT_DIR, 'home.png'), fullPage: false });
  console.log('Saved home.png (size: ' + fs.statSync(path.join(OUT_DIR, 'home.png')).size + ')');

  // 2. Login Page
  console.log('2. Capturing Login page...');
  await page.goto('http://localhost:5173/login', { waitUntil: 'networkidle0' });
  await new Promise(r => setTimeout(r, 1000));
  await page.screenshot({ path: path.join(OUT_DIR, 'login.png'), fullPage: false });
  console.log('Saved login.png (size: ' + fs.statSync(path.join(OUT_DIR, 'login.png')).size + ')');

  // 3. Register Page
  console.log('3. Capturing Register page...');
  await page.goto('http://localhost:5173/register', { waitUntil: 'networkidle0' });
  await new Promise(r => setTimeout(r, 1000));
  await page.screenshot({ path: path.join(OUT_DIR, 'register.png'), fullPage: false });
  console.log('Saved register.png (size: ' + fs.statSync(path.join(OUT_DIR, 'register.png')).size + ')');

  // 4. HR Dashboard
  console.log('4. Logging in as HR and capturing HR dashboard...');
  await page.goto('http://localhost:5173/login?demo=hr', { waitUntil: 'networkidle0' });
  await page.waitForFunction(() => window.location.pathname === '/hr/dashboard', { timeout: 10000 });
  await new Promise(r => setTimeout(r, 2000));
  await page.screenshot({ path: path.join(OUT_DIR, 'hr-dashboard.png'), fullPage: false });
  console.log('Saved hr-dashboard.png (size: ' + fs.statSync(path.join(OUT_DIR, 'hr-dashboard.png')).size + ')');

  // 5. Manager Dashboard
  console.log('5. Logging in as Manager and capturing Manager dashboard...');
  await page.evaluate(() => localStorage.clear());
  await page.goto('http://localhost:5173/login?demo=manager', { waitUntil: 'networkidle0' });
  await page.waitForFunction(() => window.location.pathname === '/manager/dashboard', { timeout: 10000 });
  await new Promise(r => setTimeout(r, 2000));
  await page.screenshot({ path: path.join(OUT_DIR, 'manager-dashboard.png'), fullPage: false });
  console.log('Saved manager-dashboard.png (size: ' + fs.statSync(path.join(OUT_DIR, 'manager-dashboard.png')).size + ')');

  // 6. Employee Dashboard
  console.log('6. Logging in as Employee and capturing Employee dashboard...');
  await page.evaluate(() => localStorage.clear());
  await page.goto('http://localhost:5173/login?demo=employee', { waitUntil: 'networkidle0' });
  await page.waitForFunction(() => window.location.pathname === '/employee/dashboard', { timeout: 10000 });
  await new Promise(r => setTimeout(r, 2000));
  await page.screenshot({ path: path.join(OUT_DIR, 'employee-dashboard.png'), fullPage: false });
  console.log('Saved employee-dashboard.png (size: ' + fs.statSync(path.join(OUT_DIR, 'employee-dashboard.png')).size + ')');

  // 7. Attendance Page (as Employee)
  console.log('7. Navigating to Attendance page...');
  await page.goto('http://localhost:5173/attendance', { waitUntil: 'networkidle0' });
  await new Promise(r => setTimeout(r, 2000));
  await page.screenshot({ path: path.join(OUT_DIR, 'attendance.png'), fullPage: false });
  console.log('Saved attendance.png (size: ' + fs.statSync(path.join(OUT_DIR, 'attendance.png')).size + ')');

  // 8. Leaves Page (as Employee)
  console.log('8. Navigating to Leaves page...');
  await page.goto('http://localhost:5173/leaves', { waitUntil: 'networkidle0' });
  await new Promise(r => setTimeout(r, 2000));
  await page.screenshot({ path: path.join(OUT_DIR, 'leaves.png'), fullPage: false });
  console.log('Saved leaves.png (size: ' + fs.statSync(path.join(OUT_DIR, 'leaves.png')).size + ')');

  await browser.close();
  console.log('All screenshots captured successfully with distinct views!');
}

run().catch(err => {
  console.error('Error during screenshot capture:', err);
  process.exit(1);
});
