# apexhive-showcase

Static Cloudflare Pages showcase (`https://apexhive-showcase.pages.dev`) for **ApexHive Labs** — featuring **5 pure-free MIT developer & operations tools (`#1`–`#5`)** and **1 hosted cloud flagship (`#6 evalshield-copilot`)**.

## Included

- [`site/index.html`](./site/index.html) — Interactive `slimmcp-proxy` MCP Context Tax Calculator (models both `97.86%` initial schema reduction and `~95.1%` net 1-turn lookup savings) + 5 pure-free MIT repos + `evalshield-copilot` Cloud Flagship + `polymarket-paper` R&D note
- [`site/llms.txt`](./site/llms.txt) — Machine-readable summary of all ApexHive Labs tools and links
- [`site/robots.txt`](./site/robots.txt) — Search & agent crawler rules
- [`launch-pack/`](./launch-pack/) — Directory submission checklists and verified PR plans

## Quickstart & Local Verification

```bash
pnpm install --ignore-scripts
pnpm exec playwright install chromium
pnpm test
```

Serve locally with Wrangler Pages:

```bash
pnpm exec wrangler pages dev site --port 8788
```

---

If our open-source tools saved you time or tokens, Base USDC tips are welcome at `0x32eceaC45DBED9E555dAb80346aBd4Ab9C676206`. Support: `apexhive.hq@proton.me`.
