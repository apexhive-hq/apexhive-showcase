# apexhive-showcase

Static Cloudflare Pages showcase (`https://apexhive-showcase.pages.dev`) for **ApexHive Labs** — featuring **6 pure-free MIT developer & operations tools (`#1`–`#5` & `#7`)** and **1 commercial flagship (`#6 evalshield-copilot`)**.

## Included

- [`site/index.html`](./site/index.html) + [`site/app.js`](./site/app.js) + [`site/styles.css`](./site/styles.css) — Interactive `slimmcp-proxy` MCP Context Tax Calculator (`60,185 -> 1,286` bytes, `97.86%` initial schema reduction: `15,047 -> 322` tok; `~14,310` tok saved / `95.10%` net 1-turn; `~737` tok spent) + 6 pure-free MIT repos (`#1 slimmcp-proxy`, `#2 zerofiat-base-checkout-kit`, `#3 web3-ops-automation-pack`, `#4 mcp-doctor`, `#5 open-center-os`, `#7 dmarczero`) + `#6 evalshield-copilot` Commercial Flagship (`ApexHive Dual Source-Available License`)
- [`site/terms.html`](./site/terms.html), [`site/privacy.html`](./site/privacy.html), [`site/refund.html`](./site/refund.html) — Public Terms (`AS IS` MIT vs Dual License clarity), Privacy (Zero Telemetry / Zero Cookies), and Commercial Refund Policy (`#6 EvalShield`)
- [`site/_headers`](./site/_headers) — Strict Cloudflare Pages security headers (`Content-Security-Policy`, `X-Frame-Options: DENY`, `X-Content-Type-Options: nosniff`, `Referrer-Policy: no-referrer`, `Strict-Transport-Security: max-age=31536000; includeSubDomains`)
- [`site/llms.txt`](./site/llms.txt) — Machine-readable summary of all ApexHive Labs tools (`#1`–`#7`) and policies
- [`site/robots.txt`](./site/robots.txt) — Search & agent crawler rules

## Quickstart & Local Verification

```bash
pnpm install --ignore-scripts
pnpm exec playwright install chromium
pnpm run typecheck && pnpm test
```

Serve locally with Wrangler Pages:

```bash
pnpm exec wrangler pages dev site --port 8788
```

---

**ApexHive Labs** &bull; GitHub Portfolio: [github.com/apexhive-hq](https://github.com/apexhive-hq) &bull; Support: `apexhive.hq@proton.me`
