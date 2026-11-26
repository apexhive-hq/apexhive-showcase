# Wave 1 Interactive Directory Submission Checklist (Chairman / `/ego-lite-browser` Handoff)

All fields below are **copy-paste ready** and verified against live directory requirements. Where a portal requires browser login, OAuth, or CAPTCHA, use `ego-browser nodejs` (`taskSpace`) and call `await task.handOff()` for Chairman completion—never bypass auth or CAPTCHAs.

---

## 1. Glama MCP Directory (`https://glama.ai/mcp/servers`)
- **Priority:** **Submit FIRST** (required by `punkpeye/awesome-mcp-servers` `CONTRIBUTING.md` backlink check!).
- **Auth / Gate:** Web form (`Submit a Server` / `Add Server`); may require GitHub/Google login -> `await task.handOff()`.
- **Copy-Paste Fields:**
  - **Server Name:** `slimmcp-proxy`
  - **GitHub Repository URL:** `https://github.com/apexhive-hq/slimmcp-proxy`
  - **Category:** `Developer Tools` / `Aggregators`
  - **Website / Documentation URL:** `https://apexhive-showcase.pages.dev`
  - **Config File Present:** `glama.json` at repo root (`https://glama.ai/mcp/schemas/server.json`, maintainer `apexhive-hq`).

---

## 2. Smithery (`https://smithery.ai/new`)
- **Auth / Gate:** GitHub OAuth login -> `await task.handOff()`.
- **Copy-Paste Fields:**
  - **GitHub Repository URL:** `https://github.com/apexhive-hq/slimmcp-proxy`
  - **Config File Present:** `smithery.yaml` already at repo root (`node cli/dist/src/cli.js serve`).

---

## 3. PulseMCP (`https://www.pulsemcp.com/submit`)
- **Auth / Gate:** Public submission form (note: manual submissions may occasionally pause in favor of automated GitHub/Official MCP Registry crawling).
- **Copy-Paste Fields:**
  - **Server Name:** `slimmcp-proxy`
  - **Repository URL:** `https://github.com/apexhive-hq/slimmcp-proxy`
  - **Website URL:** `https://apexhive-showcase.pages.dev`
  - **Short Description:** `Progressive-disclosure Meta-MCP proxy in pure Node.js (>=24) that cuts upstream tools/list schema context by up to 97.87% using deterministic BM25 discovery, lazy schema loading, and secret redaction.`

---

## 4. MCP.so (`https://mcp.so/submit`)
- **Auth / Gate:** Web account / GitHub login; free standard review queue (optional paid fast-track — **use free standard queue only**).
- **Copy-Paste Fields:**
  - **Type:** `Local / stdio` (GitHub Repo)
  - **Name:** `slimmcp-proxy`
  - **GitHub URL:** `https://github.com/apexhive-hq/slimmcp-proxy`
  - **Homepage:** `https://apexhive-showcase.pages.dev`
  - **Tags:** `mcp`, `proxy`, `context-window`, `bm25`, `nodejs`, `typescript`
  - **Description:** `MIT-licensed Meta-MCP proxy in pure Node.js (>=24) reducing initial tool-schema context by up to 97.87% (60 tools -> 3 meta-tools) with built-in secret redaction.`

---

## 5. Historical Archive — Deprecated Storefront `x402scan` Entry
- **Status:** **DEPRECATED / ARCHIVED** (`slimmcp-proxy` storefront and `$0.005` commercial endpoints were retired in `v1.0.2`; `#1 slimmcp-proxy` is now **100% pure-free MIT**). Do NOT submit deprecated store URLs to `x402scan`. If any hosted `x402` endpoint is registered in the future, route only live Flagship endpoints (`https://evalshield-copilot.apexhive-hq.workers.dev/`).
