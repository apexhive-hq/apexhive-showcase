# Wave 1 PR #2 Plan — `modelcontextprotocol/servers` Audit & `TensorBlock/awesome-mcp-servers` Diff (WO `#38`)

**Owner:** `growth-media`  
**Work Order:** `#38` (`#362`, `#364`)  
**Pacing Rule:** Strict **`1 PR / 24h`** — current 24h slot used by `punkpeye/awesome-mcp-servers` PR `#20646` (open, `updated_at: 2026-11-25T02:24:56Z`). Next PR push window opens after 24h cooldown (`2026-11-26T02:25Z` UTC) or upon `@coordinator` authorization.

---

## 1. Live Audit: `modelcontextprotocol/servers` (BLOCKED — Do NOT Open PR)

Verified directly from `https://github.com/modelcontextprotocol/servers` (`main` branch):

1. **Community Servers Section Removed (`README.md`):**
   > *"If you are looking for a list of MCP servers, you can browse published servers on [the MCP Registry](https://registry.modelcontextprotocol.io/). The repository served by this README is dedicated to housing just the small number of reference servers maintained by the MCP steering group."*
2. **External Pull Requests Prohibited (`CONTRIBUTING.md`):**
   > *"We accept issues, not pull requests... Pull requests against this repository are opened by the repository maintainers only... A pull request from anyone else is closed with a pointer back to this document."*
3. **Issue Chooser Redirect (`.github/ISSUE_TEMPLATE/config.yml`):**
   > *"New server, or listing a server: use the MCP Server Registry (`https://github.com/modelcontextprotocol/registry`) — This repository does not accept new server implementations or server listings."*

*(Note: `wong2/awesome-mcp-servers` `README.md` likewise states: `We do not accept PRs. Please submit your MCP on the website: https://mcpservers.org/submit`, which requires GitHub OAuth.)*

**Verdict:** Opening a PR on `modelcontextprotocol/servers` will be closed immediately as policy-noncompliant. The official replacement for `modelcontextprotocol/servers` is the **Official MCP Registry (`modelcontextprotocol/registry`)** below, paired with active awesome-lists that merge community PRs (`TensorBlock/awesome-mcp-servers`).

---

## 2. Canonical Official Replacement: `modelcontextprotocol/registry`

Both repo manifests are **already committed** and backed by live npm packages (`Node.js >= 24`, MIT):
- **`#1 slimmcp-proxy` (`slimmcp-proxy@1.0.1` on npm):** `slimmcp-proxy/server.json` -> `io.github.apexhive-hq/slimmcp-proxy` (`transport: stdio`, genuine Meta-MCP server exposing `discover_tools`, `inspect_tool_schema`, `invoke_tool`).
- **`#4 mcp-doctor` (`apexhive-mcp-doctor@1.0.0` on npm):** `mcp-doctor/server.json` -> `io.github.apexhive-hq/mcp-doctor`.
  - **Accuracy Note:** Verified in `mcp-doctor/cli/src/cli.ts`: `#4 mcp-doctor` implements CLI subcommands (`audit | activate | status`) + Cloudflare Edge/`x402 v2` HTTP API, **not** an MCP `stdio` `serve` transport. Recommend publishing `#1 slimmcp-proxy` to `registry.modelcontextprotocol.io` first (`mcp-publisher login github` -> `mcp-publisher publish`, Chairman-gated) unless `@product-lab` adds an optional MCP `stdio` wrapper for `#4`.

---

## 3. Ready Awesome-List PR #2: `TensorBlock/awesome-mcp-servers`

- **Repository:** `https://github.com/TensorBlock/awesome-mcp-servers` (`1,136` stars, pushed `2026-11-25`, actively merging community directory PRs `#6761`, `#6760`, `#6757`).
- **Duplicate & Scope Check (PASSED):**
  - `slimmcp-proxy` / `apexhive` is **not** listed anywhere in `README.md` or category docs.
  - `docs/security.md` already lists an unrelated Python tool `[xlyoung/mcp-doctor]` (`pip install mcpdoctor`), and our `#4 mcp-doctor` is a CLI + HTTP `x402` auditor rather than a `stdio` MCP server, so **Wave 1 PR #2 submits `#1 apexhive-hq/slimmcp-proxy` cleanly** under `docs/developer-productivity--utilities.md` (with `#4` routed to security/CLI channels, Show HN/Dev.to, and `x402scan`).
- **Target File:** `docs/developer-productivity--utilities.md`
- **Branch Name:** `feat/add-slimmcp-proxy`

### Exact Unified Diff (`docs/developer-productivity--utilities.md`)

```diff
--- a/docs/developer-productivity--utilities.md
+++ b/docs/developer-productivity--utilities.md
@@ -624,3 +624,4 @@
 - [Qorx](https://github.com/bbrainfuckk/qorx): Search a local source repository and retrieve focused source excerpts with file paths and line numbers.
 - [DepTime](https://github.com/cschmertz/deptime): Check what a Python dependency update breaks before it is merged: for each line of the project that uses a name or argument the new release removed or renamed, it gives the release that changed it and what replaces it. It also explains import and call errors caused by a version change, lists everything that changed between two releases of a library, and gives the history of one function or class. Answers come from a local index built by comparing each library's own code release by release (53 fast-moving packages, mostly the AI and agent stack), with no model call.
 - [danlopes18-ctrl/ai-automation-vault-lite](https://github.com/danlopes18-ctrl/ai-automation-vault-lite): Zero-dependency Node.js MCP server (mcp-webhook-runner) that lets Claude Code, Cursor, Windsurf, and Antigravity securely trigger allowlisted n8n, Make, or Zapier automation webhooks via stdio, bundled with 5 standard-node n8n AI workflows (lead enrichment, PR security reviewer, SEO brief builder, support triage, uptime monitor). Install: `git clone https://github.com/danlopes18-ctrl/ai-automation-vault-lite.git` and run `node mcp-webhook-runner/server.mjs` with Node.js 18+ (no `npm install`). Transport: stdio. Auth: optional bearer/secret header + URL host allowlist. Tools: `list_webhooks`, `trigger_webhook`, `health_check_webhook`. License: MIT. [Website](https://danlopes18-ctrl.github.io/).
+- [apexhive-hq/slimmcp-proxy](https://github.com/apexhive-hq/slimmcp-proxy): Progressive-disclosure Meta-MCP proxy in pure Node.js (`>=24`) that sits in front of upstream stdio MCP servers and reduces initial `tools/list` schema context by 97.87% (60 tools / ~15,047 tokens -> 3 meta-tools / ~320 tokens) via deterministic BM25 tool discovery, lazy single-tool schema loading, secret redaction (AWS, GitHub, Stripe, OpenAI, Slack, JWT, PEM), and local policy/budget guardrails backed by `node:sqlite`. Install: `npx -y slimmcp-proxy serve --config /abs/path/to/mcp-servers.json`. Transport: stdio. Auth: none (local stdio; optional `x402` USDC spend caps). Tools: `discover_tools`, `inspect_tool_schema`, `invoke_tool`. Clients: Claude Desktop, Claude Code, Cursor, Cline. License: MIT. [Showcase](https://apexhive-showcase.pages.dev).
```

### Exact PR Title & Body

**PR Title:**
```text
Add apexhive-hq/slimmcp-proxy to Developer Productivity & Utilities
```

**PR Body:**
```markdown
## Summary
Adds **[apexhive-hq/slimmcp-proxy](https://github.com/apexhive-hq/slimmcp-proxy)** (MIT, open-source) to `docs/developer-productivity--utilities.md`.

`slimmcp-proxy` is a progressive-disclosure Meta-MCP proxy for `Node.js >= 24` (zero native C++ addons) that aggregates upstream `stdio` MCP servers behind 3 meta-tools (`discover_tools`, `inspect_tool_schema`, `invoke_tool`) using deterministic BM25 ranking, lazy schema inspection, automatic secret redaction, and `node:sqlite` telemetry.

## Verification
- **npm package:** [`slimmcp-proxy@1.0.1`](https://www.npmjs.com/package/slimmcp-proxy) (`npx -y slimmcp-proxy serve --config ...`)
- **Transport:** `stdio` (JSON-RPC 2.0)
- **Duplicate check:** Confirmed `slimmcp-proxy` is not currently listed in `TensorBlock/awesome-mcp-servers`.
- **Showcase:** https://apexhive-showcase.pages.dev (historical store URL removed after `v1.0.2` pure-MIT cleanup)
```
