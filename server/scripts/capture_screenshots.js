const puppeteer = require('puppeteer-core');
const path = require('path');
const fs = require('fs');

const EDGE_PATH = 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe';
const OUT_DIR = path.resolve(__dirname, '../../docs/screenshots');

if (!fs.existsSync(OUT_DIR)) {
  fs.mkdirSync(OUT_DIR, { recursive: true });
}

async function run() {
  console.log('Launching browser...');
  const browser = await puppeteer.launch({
    executablePath: EDGE_PATH,
    headless: 'new',
    defaultViewport: { width: 1440, height: 900 },
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  const page = await browser.newPage();

  // 1. Home Page
  console.log('Capturing home page...');
  await page.goto('http://localhost:5173/', { waitUntil: 'networkidle0' });
  await page.screenshot({ path: path.join(OUT_DIR, 'home.png'), fullPage: false });

  // 2. Login Page
  console.log('Capturing login page...');
  await page.goto('http://localhost:5173/login', { waitUntil: 'networkidle0' });
  await page.screenshot({ path: path.join(OUT_DIR, 'login.png'), fullPage: false });

  // 3. Register Page
  console.log('Capturing register page...');
  await page.goto('http://localhost:5173/register', { waitUntil: 'networkidle0' });
  await new Promise(r => setTimeout(r, 1000));
  await page.screenshot({ path: path.join(OUT_DIR, 'register.png'), fullPage: false });

  // 4. HR Dashboard
  console.log('Capturing HR dashboard...');
  await page.goto('http://localhost:5173/login', { waitUntil: 'networkidle0' });
  // Find HR quick demo button
  const buttons = await page.$$('button');
  for (const btn of buttons) {
    const text = await page.evaluate(el => el.textContent, btn);
    if (text.includes('HR Director')) {
      await btn.click();
      break;
    }
  }
  await page.waitForNavigation({ waitUntil: 'networkidle0', timeout: 5000 }).catch(() => {});
  await new Promise(r => setTimeout(r, 1500));
  await page.screenshot({ path: path.join(OUT_DIR, 'hr-dashboard.png'), fullPage: false });

  // 5. Manager Dashboard
  console.log('Capturing Manager dashboard...');
  await page.evaluate(() => localStorage.clear());
  await page.goto('http://localhost:5173/login', { waitUntil: 'networkidle0' });
  const mgrButtons = await page.$$('button');
  for (const btn of mgrButtons) {
    const text = await page.evaluate(el => el.textContent, btn);
    if (text.includes('Manager (Engineering)')) {
      await btn.click();
      break;
    }
  }
  await page.waitForNavigation({ waitUntil: 'networkidle0', timeout: 5000 }).catch(() => {});
  await new Promise(r => setTimeout(r, 1500));
  await page.screenshot({ path: path.join(OUT_DIR, 'manager-dashboard.png'), fullPage: false });

  // 6. Employee Dashboard
  console.log('Capturing Employee dashboard...');
  await page.evaluate(() => localStorage.clear());
  await page.goto('http://localhost:5173/login', { waitUntil: 'networkidle0' });
  const empButtons = await page.$$('button');
  for (const btn of empButtons) {
    const text = await page.evaluate(el => el.textContent, btn);
    if (text.includes('Employee (Frontend)')) {
      await btn.click();
      break;
    }
  }
  await page.waitForNavigation({ waitUntil: 'networkidle0', timeout: 5000 }).catch(() => {});
  await new Promise(r => setTimeout(r, 1500));
  await page.screenshot({ path: path.join(OUT_DIR, 'employee-dashboard.png'), fullPage: false });

  // 7. Attendance page
  console.log('Capturing Attendance page...');
  await page.goto('http://localhost:5173/attendance', { waitUntil: 'networkidle0' });
  await new Promise(r => setTimeout(r, 1500));
  await page.screenshot({ path: path.join(OUT_DIR, 'attendance.png'), fullPage: false });

  // 8. Leaves page
  console.log('Capturing Leaves page...');
  await page.goto('http://localhost:5173/leaves', { waitUntil: 'networkidle0' });
  await new Promise(r => setTimeout(r, 1500));
  await page.screenshot({ path: path.join(OUT_DIR, 'leaves.png'), fullPage: false });

  await browser.close();
  console.log('All screenshots captured successfully in ' + OUT_DIR);
}

run().catch(err => {
  console.error('Error capturing screenshots:', err);
  process.exit(1);
});
