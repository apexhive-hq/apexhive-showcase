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
 * Check markdown/html doc strings for zero contradictions, zero promo hype, zero tip wallets, zero internal IDs, and portfolio alignment.
 * @param {string} content
 * @param {string} label
 * @param {'full' | 'profile' | 'readme' | 'legal'} [mode]
 */
function assertPortfolioHygiene(content, label, mode = 'full') {
  assert.doesNotMatch(
    content,
    /[a-z0-9-]+-store\.apexhive-hq\.workers\.dev/i,
    `${label} must not contain deprecated *-store.workers.dev URLs`,
  );
  assert.doesNotMatch(
    content,
    /Founding Pro|499 USDC 3-Branch|999 USDC|3-Branch|Unlimited Chain|Storefront &amp; Sim|api\/x402\/compress|free-until-\$10k|\$10k\b|\$19\b|19000000/i,
    `${label} must not contain legacy paywall tiers or stale pricing examples`,
  );
  assert.doesNotMatch(
    content,
    /GitHub Org|ApexHive Holdings|MIT Core|polymarket-paper|10,000-run|10k Monte Carlo|300-point|SVG badge|x402 API|0x32eceaC45DBED9E555dAb80346aBd4Ab9C676206|\.lic\b/i,
    `${label} must not contain contradicted entity/license/metric/tip-wallet/.lic strings`,
  );
  assert.doesNotMatch(
    content,
    /Pure-Free|100% Free|Unlimited free|Zero Paywalls|Sole Commercial Flagship|Commercial Flagship|Hosted Cloud Flagship|Early-Bird|Forever\b/i,
    `${label} must not contain banned promotional hype wording`,
  );
  assert.doesNotMatch(
    content,
    /#[1-7](?![0-9a-fA-F])|Tools\s+#[1-7]|<strong>[1-7]\.\s*<a|SME ERP Module/i,
    `${label} must not contain internal #1-#7 jump numbers or legacy SME ERP Module wording`,
  );
  assert.doesNotMatch(
    content,
    new RegExp('win' + 'rar', 'i'),
    `${label} must not contain banned internal brand metaphors`,
  );
  assert.doesNotMatch(
    content,
    /autonomous AI profit|autonomous income|passive income|guaranteed profit|risk-free|0\.00%/i,
    `${label} must not contain banned marketing claims`,
  );
  assert.doesNotMatch(
    content,
    /60,180|97\.87%|Node (?:>=|&ge;)22 LTS/,
    `${label} must use verified 60,185 B -> 1,286 B (97.86%) and Node >=22.18 LTS figures`,
  );

  const requiredTokens =
    mode === 'full'
      ? [
          'slimmcp-proxy',
          'zerofiat-base-checkout-kit',
          'web3-ops-automation-pack',
          'mcp-doctor',
          'open-center-os',
          'dmarczero',
          'evalshield-copilot',
          'https://evalshield-copilot.apexhive-hq.workers.dev/',
          'ApexHive Dual Source-Available License',
          '25,000',
          'SOL-PERP',
          '60,185',
          '1,286',
          '97.86%',
          '95.10%',
          '14,310',
          '737',
          'bilingual EN/ZH receipts',
          '@apexhive-hq',
          'apexhive.hq@proton.me',
          'terms.html',
          'privacy.html',
          'refund.html',
        ]
      : mode === 'profile'
        ? [
            'slimmcp-proxy',
            'zerofiat-base-checkout-kit',
            'web3-ops-automation-pack',
            'mcp-doctor',
            'open-center-os',
            'dmarczero',
            'evalshield-copilot',
            'https://evalshield-copilot.apexhive-hq.workers.dev/',
            'ApexHive Dual Source-Available License',
            'Drawdown Guard',
            'BM25',
            '@apexhive-hq',
            'apexhive.hq@proton.me',
            'terms.html',
            'privacy.html',
            'refund.html',
          ]
      : mode === 'readme'
        ? [
            'slimmcp-proxy',
            'dmarczero',
            'evalshield-copilot',
            'ApexHive Dual Source-Available License',
            '60,185',
            '1,286',
            '97.86%',
            '95.10%',
            '14,310',
            '737',
            'apexhive.hq@proton.me',
          ]
        : ['evalshield-copilot', 'apexhive.hq@proton.me'];
  for (const required of requiredTokens) {
    assert.ok(content.includes(required), `${label} is missing required token: ${required}`);
  }
}

test('Static portfolio files satisfy 4-domain feature-first hygiene, security headers, LICENSE, and XSS rules', () => {
  const indexHtml = readFileSync(join(SITE_DIR, 'index.html'), 'utf8');
  const termsHtml = readFileSync(join(SITE_DIR, 'terms.html'), 'utf8');
  const privacyHtml = readFileSync(join(SITE_DIR, 'privacy.html'), 'utf8');
  const refundHtml = readFileSync(join(SITE_DIR, 'refund.html'), 'utf8');
  const appJs = readFileSync(join(SITE_DIR, 'app.js'), 'utf8');
  const llmsTxt = readFileSync(join(SITE_DIR, 'llms.txt'), 'utf8');
  const readmeMd = readFileSync(join(ROOT_DIR, 'README.md'), 'utf8');
  const robotsTxt = readFileSync(join(SITE_DIR, 'robots.txt'), 'utf8');
  const headersTxt = readFileSync(join(SITE_DIR, '_headers'), 'utf8');
  const licenseTxt = readFileSync(join(ROOT_DIR, 'LICENSE'), 'utf8');

  assert.match(licenseTxt, /MIT License/);
  assert.match(licenseTxt, /Copyright \(c\) 2026 ApexHive Labs/);

  assert.equal(existsSync(join(ROOT_DIR, '.github', 'FUNDING.yml')), false, 'Showcase FUNDING.yml must be removed');
  assert.equal(
    existsSync(resolve(ROOT_DIR, '..', 'apexhive-profile', '.github', 'FUNDING.yml')),
    false,
    'Profile FUNDING.yml must be removed',
  );

  assertPortfolioHygiene(indexHtml, 'site/index.html', 'full');
  assertPortfolioHygiene(termsHtml, 'site/terms.html', 'legal');
  assertPortfolioHygiene(privacyHtml, 'site/privacy.html', 'legal');
  assertPortfolioHygiene(refundHtml, 'site/refund.html', 'legal');
  assertPortfolioHygiene(llmsTxt, 'site/llms.txt', 'full');
  assertPortfolioHygiene(readmeMd, 'README.md', 'readme');
  assert.match(indexHtml, /EVALSHIELD-PRO-v1/);
  assert.match(indexHtml, /evalshield-copilot-entitlement\.json/);
  assert.match(termsHtml, /EVALSHIELD-PRO-v1/);
  assert.match(refundHtml, /evalshield-copilot-entitlement\.json/);

  if (existsSync(PROFILE_README)) {
    const profileMd = readFileSync(PROFILE_README, 'utf8');
    assertPortfolioHygiene(profileMd, 'apexhive-profile/README.md', 'profile');
  }

  for (const [name, src] of [
    ['site/index.html', indexHtml],
    ['site/terms.html', termsHtml],
    ['site/privacy.html', privacyHtml],
    ['site/refund.html', refundHtml],
    ['site/app.js', appJs],
  ]) {
    assert.doesNotMatch(
      src,
      /\.(innerHTML|outerHTML|insertAdjacentHTML)\b|document\.write\(|eval\(/,
      `${name} must not use unsafe DOM/eval sinks`,
    );
  }

  assert.match(robotsTxt, /Allow:\s*\//);
  assert.match(headersTxt, /Content-Security-Policy:\s*default-src 'self'/i);
  assert.match(headersTxt, /X-Frame-Options:\s*DENY/i);
  assert.match(headersTxt, /X-Content-Type-Options:\s*nosniff/i);
  assert.match(headersTxt, /Referrer-Policy:\s*no-referrer/i);
  assert.match(headersTxt, /Strict-Transport-Security:\s*max-age=31536000;\s*includeSubDomains/i);
});

test('Wrangler Pages dev serves showcase + legal pages with security headers and Playwright verifies #1-#7 & calculator', async () => {
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

    // 1. HTTP endpoint & security header verification via Wrangler Pages
    const [homeRes, termsRes, privacyRes, refundRes, llmsRes, robotsRes] = await Promise.all([
      fetch(`${baseUrl}/`),
      fetch(`${baseUrl}/terms.html`),
      fetch(`${baseUrl}/privacy.html`),
      fetch(`${baseUrl}/refund.html`),
      fetch(`${baseUrl}/llms.txt`),
      fetch(`${baseUrl}/robots.txt`),
    ]);

    /** @type {Array<[string, Response]>} */
    const htmlChecks = [
      ['/', homeRes],
      ['/terms.html', termsRes],
      ['/privacy.html', privacyRes],
      ['/refund.html', refundRes],
    ];
    for (const [pathLabel, res] of htmlChecks) {
      assert.equal(res.status, 200, `${pathLabel} must return 200`);
      assert.match(res.headers.get('content-type') ?? '', /text\/html/i);
      assert.match(res.headers.get('content-security-policy') ?? '', /frame-ancestors 'none'/i, `${pathLabel} CSP`);
      assert.equal(res.headers.get('x-frame-options'), 'DENY', `${pathLabel} XFO`);
      assert.equal(res.headers.get('x-content-type-options'), 'nosniff', `${pathLabel} nosniff`);
      assert.equal(res.headers.get('referrer-policy'), 'no-referrer', `${pathLabel} referrer-policy`);
      assert.equal(
        res.headers.get('strict-transport-security'),
        'max-age=31536000; includeSubDomains',
        `${pathLabel} HSTS`,
      );
    }

    assert.equal(llmsRes.status, 200);
    const llmsBody = await llmsRes.text();
    assert.match(llmsBody, /AI Agent & MCP Tools/i);
    assert.match(llmsBody, /dmarczero/);
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
    assert.match(heading ?? '', /Practical infrastructure for AI agents, Web3 payments, operations, and trading risk/i);

    for (const id of ['ecosystem', 'evalshield', 'calculator', 'architecture', 'install']) {
      assert.equal(await page.locator(`#${id}`).isVisible(), true, `Section #${id} must be visible`);
    }

    const bodyText = (await page.locator('body').textContent()) ?? '';
    for (const expectedText of [
      'slimmcp-proxy',
      'zerofiat-base-checkout-kit',
      'web3-ops-automation-pack',
      'mcp-doctor',
      'open-center-os',
      'dmarczero',
      'evalshield-copilot',
      'EvalShield Copilot — Read-Only Prop-Firm & Futures Risk Shield',
      'Solo local use: Free · Team: $99 USDC · Enterprise: $499 USDC',
    ]) {
      assert.ok(bodyText.includes(expectedText), `Showcase body must include: ${expectedText}`);
    }

    // Verify all href links are clean
    const hrefs = await page.locator('a[href]').evaluateAll((els) =>
      els.map((el) => el.getAttribute('href') ?? ''),
    );
    assert.ok(hrefs.length >= 16, 'Expected showcase navigation, #1-#7 product, and legal links');
    for (const href of hrefs) {
      assert.doesNotMatch(href, /-store\.apexhive-hq\.workers\.dev/i, `Deprecated storefront link: ${href}`);
    }
    assert.ok(hrefs.includes('https://evalshield-copilot.apexhive-hq.workers.dev/'));
    assert.ok(hrefs.includes('https://github.com/apexhive-hq/dmarczero'));
    assert.ok(hrefs.includes('/terms.html'));
    assert.ok(hrefs.includes('/privacy.html'));
    assert.ok(hrefs.includes('/refund.html'));

    // Desktop zero horizontal overflow
    const desktopOverflow = await page.evaluate(() => ({
      scrollWidth: document.documentElement.scrollWidth,
      innerWidth: window.innerWidth,
    }));
    assert.ok(
      desktopOverflow.scrollWidth <= desktopOverflow.innerWidth,
      `Desktop overflow detected: scrollWidth=${desktopOverflow.scrollWidth} > innerWidth=${desktopOverflow.innerWidth}`,
    );

    // Initial calculator defaults (60 tools * 1003 B + 5 B = 60,185 B -> 1,286 B = 97.86% reduction, 20 turns, $3/1M -> $0.88)
    assert.match((await page.locator('#outRaw').textContent()) ?? '', /60,185 B \(~15,047 tokens\)/);
    assert.equal(await page.locator('#outReduction').textContent(), '97.86%');
    assert.match((await page.locator('#outTurnOne').textContent()) ?? '', /95\.10% \(~14,310 tok saved; ~737 tok spent\)/);
    assert.equal(await page.locator('#outPerTurn').textContent(), '14,725 tokens');
    assert.equal(await page.locator('#outPerSession').textContent(), '294,085 tokens');
    assert.equal(await page.locator('#outCost').textContent(), '$0.88');
    assert.match((await page.locator('#outBreakEven').textContent()) ?? '', /slimmcp-proxy \(MIT\)/i);

    // Interactive calculator update (120 tools, 40 turns, $15/1M)
    await page.locator('#toolCount').fill('120');
    await page.locator('#toolCount').dispatchEvent('input');
    await page.locator('#turnsPerSession').fill('40');
    await page.locator('#turnsPerSession').dispatchEvent('input');
    await page.locator('#pricePerMillion').selectOption('15');

    assert.equal(await page.locator('#toolCountLabel').textContent(), '120');
    assert.match((await page.locator('#outRaw').textContent()) ?? '', /120,365 B/);
    assert.equal(await page.locator('#outReduction').textContent(), '98.93%');
    assert.match((await page.locator('#outBreakEven').textContent()) ?? '', /Net 40-turn session savings/i);
    const updatedCostText = (await page.locator('#outCost').textContent()) ?? '$0.00';
    const updatedCost = Number.parseFloat(updatedCostText.replace('$', ''));
    assert.ok(updatedCost > 10, `Expected updated session savings > $10, got ${updatedCostText}`);

    // Legal pages render cleanly
    await page.goto(`${baseUrl}/terms.html`, { waitUntil: 'networkidle' });
    assert.match((await page.locator('body').textContent()) ?? '', /AS IS.*ApexHive Dual Source-Available License/s);
    await page.goto(`${baseUrl}/privacy.html`, { waitUntil: 'networkidle' });
    assert.match((await page.locator('body').textContent()) ?? '', /Zero Cookies/i);
    await page.goto(`${baseUrl}/refund.html`, { waitUntil: 'networkidle' });
    assert.match((await page.locator('body').textContent()) ?? '', /7 days/i);

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
