import assert from 'node:assert/strict';
import { spawn } from 'node:child_process';
import { existsSync, mkdtempSync, readdirSync, readFileSync, rmSync } from 'node:fs';
import net from 'node:net';
import os from 'node:os';
import { join, resolve } from 'node:path';
import test from 'node:test';
import { fileURLToPath } from 'node:url';
import { chromium } from 'playwright';

const ROOT_DIR = resolve(fileURLToPath(new URL('..', import.meta.url)));
const SITE_DIR = join(ROOT_DIR, 'site');
const HQ_ROOT = resolve(ROOT_DIR, '..', '..');
const PROFILE_README = resolve(ROOT_DIR, '..', 'apexhive-profile', 'README.md');
const BASE_USDC_TREASURY = '0x32eceaC45DBED9E555dAb80346aBd4Ab9C676206';

/**
 * Reserve an ephemeral free loopback TCP port for Wrangler Pages dev.
 * @returns {Promise<number>}
 */
function getFreePort() {
  return new Promise((resolvePort, reject) => {
    const srv = net.createServer();
    srv.unref();
    srv.on('error', reject);
    srv.listen(0, '127.0.0.1', () => {
      const addr = srv.address();
      if (!addr || typeof addr === 'string') {
        srv.close(() => reject(new Error('Failed to bind ephemeral loopback port')));
        return;
      }
      const port = addr.port;
      srv.close((err) => {
        if (err) reject(err);
        else resolvePort(port);
      });
    });
  });
}

/**
 * Resolve Playwright Chromium executable cleanly for both CI and Windows HQ clean shells.
 * @returns {string | undefined}
 */
function resolveChromiumExecutable() {
  try {
    const defaultExe = chromium.executablePath();
    if (defaultExe && existsSync(defaultExe)) {
      return defaultExe;
    }
  } catch {
    // Fall back to monorepo cache scan below when PLAYWRIGHT_BROWSERS_PATH is unset.
  }

  const candidateRoots = [
    join(HQ_ROOT, '.caches', 'ms-playwright'),
    join(HQ_ROOT, 'departments', 'infra', '.caches', 'ms-playwright'),
  ];
  for (const cacheRoot of candidateRoots) {
    if (!existsSync(cacheRoot)) continue;
    const dirs = readdirSync(cacheRoot).filter((d) => d.startsWith('chromium-')).sort().reverse();
    for (const dir of dirs) {
      const winExe = join(cacheRoot, dir, 'chrome-win64', 'chrome.exe');
      if (existsSync(winExe)) return winExe;
      const winLegacyExe = join(cacheRoot, dir, 'chrome-win', 'chrome.exe');
      if (existsSync(winLegacyExe)) return winLegacyExe;
      const linuxExe = join(cacheRoot, dir, 'chrome-linux', 'chrome');
      if (existsSync(linuxExe)) return linuxExe;
    }
  }
  return undefined;
}

/**
 * Poll HTTP URL until a 2xx response returns or child exits early.
 * @param {string} url
 * @param {import('node:child_process').ChildProcess} proc
 * @param {() => string} getLogs
 * @param {number} [timeoutMs]
 * @returns {Promise<void>}
 */
async function waitForWranglerReady(url, proc, getLogs, timeoutMs = 45000) {
  const deadline = Date.now() + timeoutMs;
  while (Date.now() < deadline) {
    if (proc.exitCode !== null) {
      throw new Error(`wrangler pages dev exited early (${proc.exitCode}):\n${getLogs()}`);
    }
    try {
      const res = await fetch(url);
      if (res.ok) return;
    } catch {
      // Retry until ready
    }
    await new Promise((r) => setTimeout(r, 300));
  }
  throw new Error(`Timed out waiting for ${url}:\n${getLogs()}`);
}

/**
 * Check markdown/html doc strings for zero deprecated paywalls, zero sinks, and required portfolio alignment.
 * @param {string} content
 * @param {string} label
 * @param {boolean} [requireFullCatalog]
 */
function assertPortfolioHygiene(content, label, requireFullCatalog = true) {
  assert.doesNotMatch(
    content,
    /[a-z0-9-]+-store\.apexhive-hq\.workers\.dev/i,
    `${label} must not contain deprecated *-store.workers.dev URLs`,
  );
  assert.doesNotMatch(
    content,
    /Founding Pro|499 USDC|999 USDC|3-Branch|Unlimited Chain|Storefront &amp; Sim|api\/x402\/compress/i,
    `${label} must not contain legacy paywall tiers on pure-free MIT tools`,
  );
  assert.doesNotMatch(
    content,
    /autonomous AI profit|autonomous income|passive income|guaranteed profit|risk-free|0\.00%/i,
    `${label} must not contain banned marketing claims`,
  );
  const requiredTokens = requireFullCatalog
    ? [
        'slimmcp-proxy',
        'zerofiat-base-checkout-kit',
        'web3-ops-automation-pack',
        'mcp-doctor',
        'open-center-os',
        'evalshield-copilot',
        'https://evalshield-copilot.apexhive-hq.workers.dev/',
        'polymarket-paper',
        '97.86%',
        '~95.1%',
        BASE_USDC_TREASURY,
      ]
    : ['slimmcp-proxy', 'evalshield-copilot', 'polymarket-paper', '97.86%', '~95.1%', BASE_USDC_TREASURY];
  for (const required of requiredTokens) {
    assert.ok(content.includes(required), `${label} is missing required token: ${required}`);
  }
}

test('Static portfolio files satisfy free-MIT + Cloud Flagship hygiene and XSS rules', () => {
  const indexHtml = readFileSync(join(SITE_DIR, 'index.html'), 'utf8');
  const llmsTxt = readFileSync(join(SITE_DIR, 'llms.txt'), 'utf8');
  const readmeMd = readFileSync(join(ROOT_DIR, 'README.md'), 'utf8');
  const robotsTxt = readFileSync(join(SITE_DIR, 'robots.txt'), 'utf8');

  assertPortfolioHygiene(indexHtml, 'site/index.html', true);
  assertPortfolioHygiene(llmsTxt, 'site/llms.txt', true);
  assertPortfolioHygiene(readmeMd, 'README.md', false);

  if (existsSync(PROFILE_README)) {
    const profileMd = readFileSync(PROFILE_README, 'utf8');
    assertPortfolioHygiene(profileMd, 'apexhive-profile/README.md', true);
  }

  assert.doesNotMatch(
    indexHtml,
    /\.(innerHTML|outerHTML|insertAdjacentHTML)\b|document\.write\(|eval\(/,
    'site/index.html must not use unsafe DOM/eval sinks',
  );
  assert.match(robotsTxt, /Allow:\s*\//);
});

test('Wrangler Pages dev serves showcase cleanly and Playwright verifies desktop/mobile UI & calculator', async () => {
  const port = await getFreePort();
  const baseUrl = `http://127.0.0.1:${port}`;
  const wranglerBin = join(ROOT_DIR, 'node_modules', 'wrangler', 'bin', 'wrangler.js');
  assert.ok(existsSync(wranglerBin), `Expected wrangler entrypoint at ${wranglerBin}`);

  const tempHome = mkdtempSync(join(os.tmpdir(), 'apexhive-showcase-wrangler-'));
  let logs = '';
  const proc = spawn(
    process.execPath,
    [wranglerBin, 'pages', 'dev', SITE_DIR, '--ip', '127.0.0.1', '--port', String(port)],
    {
      cwd: ROOT_DIR,
      shell: false,
      stdio: ['ignore', 'pipe', 'pipe'],
      env: {
        ...process.env,
        HOME: tempHome,
        USERPROFILE: tempHome,
        XDG_CONFIG_HOME: join(tempHome, 'xdg-config'),
        WRANGLER_SEND_METRICS: 'false',
        CI: 'true',
      },
    },
  );
  proc.stdout.on('data', (chunk) => {
    logs += chunk.toString('utf8');
  });
  proc.stderr.on('data', (chunk) => {
    logs += chunk.toString('utf8');
  });

  /** @type {import('playwright').Browser | undefined} */
  let browser;
  try {
    await waitForWranglerReady(`${baseUrl}/`, proc, () => logs);

    // 1. HTTP endpoint verification via Wrangler Pages
    const [homeRes, llmsRes, robotsRes] = await Promise.all([
      fetch(`${baseUrl}/`),
      fetch(`${baseUrl}/llms.txt`),
      fetch(`${baseUrl}/robots.txt`),
    ]);
    assert.equal(homeRes.status, 200);
    assert.match(homeRes.headers.get('content-type') ?? '', /text\/html/i);
    assert.equal(llmsRes.status, 200);
    const llmsBody = await llmsRes.text();
    assert.match(llmsBody, /5 Pure-Free MIT Tools/i);
    assert.match(llmsBody, /evalshield-copilot\.apexhive-hq\.workers\.dev/);
    assert.equal(robotsRes.status, 200);

    // 2. Playwright headless Chromium verification
    const executablePath = resolveChromiumExecutable();
    browser = await chromium.launch({
      headless: true,
      ...(executablePath ? { executablePath } : {}),
    });

    const context = await browser.newContext({ viewport: { width: 1440, height: 900 } });
    const page = await context.newPage();
    /** @type {string[]} */
    const consoleErrors = [];
    /** @type {string[]} */
    const pageErrors = [];
    page.on('console', (msg) => {
      if (msg.type() === 'error') consoleErrors.push(msg.text());
    });
    page.on('pageerror', (err) => {
      pageErrors.push(err.message);
    });

    await page.goto(baseUrl, { waitUntil: 'networkidle' });

    const heading = await page.locator('h1').textContent();
    assert.match(heading ?? '', /Pure-Free MIT agent tools/i);

    for (const id of ['ecosystem', 'flagship', 'calculator', 'architecture', 'install']) {
      assert.equal(await page.locator(`#${id}`).isVisible(), true, `Section #${id} must be visible`);
    }

    // Verify all href links are clean
    const hrefs = await page.locator('a[href]').evaluateAll((els) =>
      els.map((el) => el.getAttribute('href') ?? ''),
    );
    assert.ok(hrefs.length >= 12, 'Expected showcase navigation and product links');
    for (const href of hrefs) {
      assert.doesNotMatch(href, /-store\.apexhive-hq\.workers\.dev/i, `Deprecated storefront link: ${href}`);
    }
    assert.ok(
      hrefs.includes('https://evalshield-copilot.apexhive-hq.workers.dev/'),
      'Expected EvalShield Cloud flagship link',
    );

    // Desktop zero horizontal overflow
    const desktopOverflow = await page.evaluate(() => ({
      scrollWidth: document.documentElement.scrollWidth,
      innerWidth: window.innerWidth,
    }));
    assert.ok(
      desktopOverflow.scrollWidth <= desktopOverflow.innerWidth,
      `Desktop overflow detected: scrollWidth=${desktopOverflow.scrollWidth} > innerWidth=${desktopOverflow.innerWidth}`,
    );

    // Initial calculator defaults (60 tools * 1003 B = 60,180 B -> 97.86% reduction, 20 turns, $3/1M -> $0.88)
    assert.match((await page.locator('#outRaw').textContent()) ?? '', /60,180 B/);
    assert.equal(await page.locator('#outReduction').textContent(), '97.86%');
    assert.match((await page.locator('#outTurnOne').textContent()) ?? '', /~95\.1% \(~737 tok\)/);
    assert.equal(await page.locator('#outCost').textContent(), '$0.88');
    assert.match((await page.locator('#outBreakEven').textContent()) ?? '', /100% Free MIT Proxy/i);

    // Interactive calculator update (120 tools, 40 turns, $15/1M)
    await page.locator('#toolCount').fill('120');
    await page.locator('#toolCount').dispatchEvent('input');
    await page.locator('#turnsPerSession').fill('40');
    await page.locator('#turnsPerSession').dispatchEvent('input');
    await page.locator('#pricePerMillion').selectOption('15');

    assert.equal(await page.locator('#toolCountLabel').textContent(), '120');
    assert.match((await page.locator('#outRaw').textContent()) ?? '', /120,360 B/);
    assert.equal(await page.locator('#outReduction').textContent(), '98.93%');
    assert.match((await page.locator('#outBreakEven').textContent()) ?? '', /Net 40-turn session savings/i);
    const updatedCostText = (await page.locator('#outCost').textContent()) ?? '$0.00';
    const updatedCost = Number.parseFloat(updatedCostText.replace('$', ''));
    assert.ok(updatedCost > 10, `Expected updated session savings > $10, got ${updatedCostText}`);

    // Mobile 375x812 viewport zero horizontal overflow
    await page.setViewportSize({ width: 375, height: 812 });
    await page.goto(baseUrl, { waitUntil: 'networkidle' });
    const mobileOverflow = await page.evaluate(() => ({
      scrollWidth: document.documentElement.scrollWidth,
      innerWidth: window.innerWidth,
    }));
    assert.ok(
      mobileOverflow.scrollWidth <= mobileOverflow.innerWidth,
      `Mobile overflow detected: scrollWidth=${mobileOverflow.scrollWidth} > innerWidth=${mobileOverflow.innerWidth}`,
    );

    assert.deepEqual(consoleErrors, [], `Unexpected browser console errors: ${consoleErrors.join('; ')}`);
    assert.deepEqual(pageErrors, [], `Unexpected browser page errors: ${pageErrors.join('; ')}`);
  } finally {
    await browser?.close().catch(() => {});
    if (proc.exitCode === null) {
      proc.kill('SIGTERM');
      await new Promise((resolveExit) => {
        const timer = setTimeout(() => {
          if (proc.exitCode === null) proc.kill('SIGKILL');
          resolveExit(undefined);
        }, 3000);
        proc.once('exit', () => {
          clearTimeout(timer);
          resolveExit(undefined);
        });
      });
    }
    rmSync(tempHome, { recursive: true, force: true });
  }
});
