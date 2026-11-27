# apexhive-showcase

Static Cloudflare Pages showcase (`https://apexhive-showcase.pages.dev`) for **ApexHive Labs** — organizing our engineering portfolio across four areas: **AI Agent & MCP Tools**, **Payments & Web3 Ops**, **Operations & Email Defense**, and **Trading Risk Control**.

## Included

- [`site/index.html`](./site/index.html) + [`site/app.js`](./site/app.js) + [`site/styles.css`](./site/styles.css) — Plain-English overview of all seven repositories (`slimmcp-proxy`, `mcp-doctor`, `zerofiat-base-checkout-kit`, `web3-ops-automation-pack`, `open-center-os`, `dmarczero`, and `evalshield-copilot` under the `ApexHive Dual Source-Available License`) plus an interactive `slimmcp-proxy` MCP Context Tax Calculator (`60,185 -> 1,286` bytes, `97.86%` initial reduction: `15,047 -> 322` tok; `~14,310` tok saved / `95.10%` net 1-turn; `~737` tok spent)
- [`site/terms.html`](./site/terms.html), [`site/privacy.html`](./site/privacy.html), [`site/refund.html`](./site/refund.html) — Terms (`AS IS` MIT vs Dual License clarity), Privacy (Zero Telemetry / Zero Cookies), and Refund Policy (`evalshield-copilot`)
- [`site/_headers`](./site/_headers) — Strict Cloudflare Pages security headers (`Content-Security-Policy`, `X-Frame-Options: DENY`, `X-Content-Type-Options: nosniff`, `Referrer-Policy: no-referrer`, `Strict-Transport-Security: max-age=31536000; includeSubDomains`)
- [`site/llms.txt`](./site/llms.txt) — Machine-readable summary of all ApexHive Labs tools and policies
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
