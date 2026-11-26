# Wave 1 PR #1 Plan — `punkpeye/awesome-mcp-servers`

**Target Repository:** `https://github.com/punkpeye/awesome-mcp-servers`  
**Target File:** `README.md`  
**Branch Name:** `feat/add-slimmcp-proxy`  
**Pacing Rule:** Submit **ONLY 1 PR** in this 24-hour window (`1 PR / 24h`).

---

## Verified `CONTRIBUTING.md` Rules & Pre-Flight Prerequisite

1. **Glama Backlink Requirement (CRITICAL — Verified in `CONTRIBUTING.md`):**
   > *"PRs must include a backlink to your `https://glama.ai/mcp/servers` MCP server listing. It can be a backlink from your website or badge included in the `README.md`... Make a note of the backlink in the PR description. Backlinks are checked before merging the PR."*
   - **Pre-Flight Gate (PASSED):** `https://github.com/apexhive-hq/slimmcp-proxy` is live on Glama at `https://glama.ai/mcp/servers/apexhive-hq/slimmcp-proxy` (`HTTP 200`), and backlinks are included in both `slimmcp-proxy/README.md` and `https://apexhive-showcase.pages.dev` (`site/index.html` + `site/llms.txt`).
2. **Scope:** Public GitHub repository that users install and run locally (MIT open-source).
3. **Format:** One server per line, `[owner/repo](url)` + platform/language legend emojis (`📇` TypeScript/JS, `🏠` Local service, `🍎` macOS, `🪟` Windows, `🐧` Linux) + ` - <concise factual description>`.
4. **Category:** `### 🔗 <a name="aggregators"></a>Aggregators` (matches existing MCP meta-proxies like `Alepha188838884/context-firewall` and `api7/aisix` listed under Aggregators). Alphabetical placement in the `A*` block (immediately after `api7/aisix`).

---

## Exact Prepared `README.md` Entry Diff

Under `### 🔗 <a name="aggregators"></a>Aggregators` (immediately after `- [api7/aisix](...)`):

```markdown
- [apexhive-hq/slimmcp-proxy](https://github.com/apexhive-hq/slimmcp-proxy) 📇 🏠 🍎 🪟 🐧 - Progressive-disclosure Meta-MCP proxy in pure Node.js (`>=24`) that reduces upstream `tools/list` schema context by up to 97.87% via deterministic BM25 tool discovery, lazy schema loading, and secret redaction.
```

*(Note: Once `glama.ai/mcp/servers` indexes `apexhive-hq/slimmcp-proxy`, optionally include the standard Glama score badge right after the repo link matching sibling entries.)*

---

## Exact PR Title & Body

**PR Title:**
```text
Add apexhive-hq/slimmcp-proxy under Aggregators
```

**PR Body:**
```markdown
## Summary
Adds **[apexhive-hq/slimmcp-proxy](https://github.com/apexhive-hq/slimmcp-proxy)** (MIT, open-source) under **Aggregators**.

`slimmcp-proxy` sits in front of upstream `stdio` MCP servers and exposes 3 meta-tools (`discover_tools`, `inspect_tool_schema`, `invoke_tool`) using deterministic BM25 search, lazy schema loading, and secret redaction (AWS keys, GitHub PATs, Stripe keys, OpenAI tokens, PEM, JWT) in pure Node.js `>=24` (`node:sqlite`, zero native C++ addons).

## Verification & Backlink
- Public GitHub repository with local source install instructions (`git clone ... && pnpm install --ignore-scripts && pnpm run build`).
- Glama backlink: Live listing at https://glama.ai/mcp/servers/apexhive-hq/slimmcp-proxy, linked from both `https://github.com/apexhive-hq/slimmcp-proxy#readme` and `https://apexhive-showcase.pages.dev`.
```
