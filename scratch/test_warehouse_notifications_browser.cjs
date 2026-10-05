const puppeteer = require('puppeteer');
const { execSync } = require('child_process');

function runSql(query) {
  try {
    const singleLine = query.replace(/"/g, '`"').replace(/\r?\n/g, ' ');
    const cmd = `powershell -Command "$env:PGPASSWORD='postgres123'; & 'C:\\Program Files\\PostgreSQL\\18\\bin\\psql.exe' -U postgres -d primeroute_db -h localhost -p 5432 -c \\"${singleLine}\\" -t -A"`;
    return execSync(cmd, { encoding: 'utf8' }).trim();
  } catch (e) {
    console.error('SQL Execution Error:', e.message);
    return null;
  }
}

async function run() {
  console.log('=== RUNNING BROWSER E2E NOTIFICATION TEST ===');

  // Insert 2 fresh notifications for Priya in DB
  const priyaId = runSql(`SELECT id FROM users WHERE email = 'priya@primeroute.com';`);
  runSql(`
    INSERT INTO notifications (user_id, title, message, type, is_read, created_at)
    VALUES 
      (${priyaId}, 'Pallet Relocation Urgent', 'Relocate Pallet 45 to Zone C', 'WARNING', false, NOW()),
      (${priyaId}, 'Inbound Dock Arrival', 'Carrier Trailer TRK-882 docked', 'INFO', false, NOW());
  `);

  const browser = await puppeteer.launch({
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--window-size=1280,800'],
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 1280, height: 800 });

  const consoleErrors = [];
  const networkErrors = [];

  page.on('console', (msg) => {
    if (msg.type() === 'error') {
      const text = msg.text();
      if (!text.includes('favicon') && !text.includes('tile.openstreetmap.org')) {
        consoleErrors.push(text);
      }
    }
  });

  page.on('response', (res) => {
    if (res.status() >= 400) {
      const url = res.url();
      if (!url.includes('favicon.ico')) {
        networkErrors.push(`[${res.status()}] ${url}`);
      }
    }
  });

  try {
    // 1. Login
    console.log('1. Logging in as Warehouse Manager...');
    await page.goto('http://localhost:5173/login', { waitUntil: 'networkidle2' });

    await page.waitForSelector('input[type="email"], input[name="email"]');
    const emailInput = await page.$('input[type="email"], input[name="email"]');
    const passInput = await page.$('input[type="password"], input[name="password"]');

    await emailInput.click({ clickCount: 3 });
    await emailInput.type('priya@primeroute.com');
    await passInput.click({ clickCount: 3 });
    await passInput.type('Manager@2026!');

    const submitBtn = await page.$('button[type="submit"]');
    await submitBtn.click();

    await page.waitForNavigation({ waitUntil: 'networkidle2', timeout: 10000 }).catch(() => {});
    await new Promise((r) => setTimeout(r, 1500));

    console.log('Current URL:', page.url());

    // 2. Locate and click notification bell
    console.log('2. Clicking Notification Bell...');
    const bellBtn = await page.$('button[aria-label*="notification" i], button[aria-label*="Notification" i], button:has(svg.lucide-bell), button:has(svg.lucide-bell-ring), header button:has(svg)');
    if (bellBtn) {
      await bellBtn.click();
      await new Promise((r) => setTimeout(r, 1000));
      console.log('Bell clicked.');
    } else {
      console.log('Looking for bell button by class or svg...');
      const headerBtns = await page.$$('header button');
      for (const btn of headerBtns) {
        const text = await page.evaluate(el => el.innerHTML, btn);
        if (text.includes('bell') || text.includes('Bell') || text.includes('svg')) {
          await btn.click();
          break;
        }
      }
      await new Promise((r) => setTimeout(r, 1000));
    }

    // Check if dropdown or modal is visible
    const dropdown = await page.$('.notification-dropdown, [role="dialog"], [aria-label*="notification" i], .z-50, div.fixed, div.absolute');
    console.log('Dropdown visible:', !!dropdown);

    // 3. Mark all as read button
    console.log('3. Searching for "Mark all as read" button...');
    const markAllBtns = await page.$$('button');
    let markAllFound = false;
    for (const b of markAllBtns) {
      const text = await page.evaluate(el => el.textContent, b);
      if (text && text.toLowerCase().includes('mark all')) {
        console.log('Found Mark All as Read button, clicking...');
        await b.click();
        markAllFound = true;
        await new Promise((r) => setTimeout(r, 1500));
        break;
      }
    }
    console.log('Mark all clicked:', markAllFound);

    // 4. Test responsiveness at 1280px, 1024px, 768px
    const viewports = [
      { width: 1280, height: 800 },
      { width: 1024, height: 768 },
      { width: 768, height: 1024 },
    ];

    for (const vp of viewports) {
      console.log(`4. Testing viewport ${vp.width}x${vp.height}...`);
      await page.setViewport(vp);
      await new Promise((r) => setTimeout(r, 500));

      const hasHorizontalScroll = await page.evaluate(() => {
        return document.documentElement.scrollWidth > window.innerWidth;
      });
      console.log(`   Viewport ${vp.width}x${vp.height} horizontal overflow: ${hasHorizontalScroll}`);
    }

    console.log('\n--- BROWSER TEST AUDIT SUMMARY ---');
    console.log('Console Errors count:', consoleErrors.length);
    if (consoleErrors.length > 0) {
      console.log('Errors:', consoleErrors);
    }
    console.log('Network >= 400 count:', networkErrors.length);
    if (networkErrors.length > 0) {
      console.log('Network errors:', networkErrors);
    }

    console.log('Browser E2E test finished successfully!');
  } catch (err) {
    console.error('Browser Test Error:', err);
  } finally {
    await browser.close();
  }
}

run();
