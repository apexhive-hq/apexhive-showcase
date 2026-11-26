# `slimmcp-proxy` — Zero-Hype Technical Launch Posts & Execution Checklist

---

## 1. Hacker News (`Show HN`) Draft

**Title:** `Show HN: slimmcp-proxy – Cut MCP tool-schema context by 97.86% initial (~95.1% 1-turn) in pure Node.js`

**URL:** `https://github.com/apexhive-hq/slimmcp-proxy`

**Text (optional companion comment):**
> Connecting multiple MCP servers to Claude Desktop, Claude Code, or Cursor injects every tool's full JSON schema into `tools/list` on every turn.
>
> We built `slimmcp-proxy` (100% Free MIT, pure Node.js >=24 using built-in `node:sqlite` and `node:crypto`—no Docker, no native C++ addons) to sit in front of upstream `stdio`, `Streamable-HTTP`, and `SSE` MCP servers and expose just 3 meta-tools:
> 1. `discover_tools(query, server?, limit?)` — deterministic BM25 search returning compact tool summaries.
> 2. `inspect_tool_schema(server, tool)` — lazy-loads the JSON schema for only the one tool you intend to call.
> 3. `invoke_tool(server, tool, arguments)` — redacts common secret patterns (AWS keys, GitHub PATs, Stripe keys, OpenAI tokens, PEM, JWT), enforces free RBAC/budget policy rules, and proxies execution.
>
> Measured on our reproducible 60-tool fixture (`node dist/src/cli.js benchmark --config slimmcp.config.example.json`):
> - Raw upstream `tools/list`: 60,185 bytes (~15,047 tokens)
> - `slimmcp-proxy` initial `tools/list`: 1,286 bytes (~322 tokens) — 97.86% initial schema reduction
> - Net 1-turn lookup cost (meta-tools + 5 BM25 matches + 1 lazy schema load): ~737 tokens — ~95.1% net 1-turn savings
>
> Run directly via `npx -y slimmcp-proxy --help` or build from source (`git clone https://github.com/apexhive-hq/slimmcp-proxy.git && cd slimmcp-proxy/cli && pnpm install --ignore-scripts && pnpm run build`). Feedback on BM25 ranking edge cases and multi-server startup latency is welcome.

---

## 2. Technical Article Draft (Dev.to / Paragraph.xyz)

**Title:** `Cutting MCP Context-Window Tax with Progressive Tool Discovery (97.86% Initial / ~95.1% 1-Turn)`

### The Problem: Schema Bloat on Every Turn
Every Model Context Protocol (MCP) server you attach to an AI client registers its full tool catalog up front. Attach 60 tools across 3–5 servers and your model receives ~15,000 tokens of JSON schemas before you ask a single question. You pay for those tokens in latency, input cost, and attention dilution on every turn.

### The Architecture: 3 Meta-Tools + Deterministic BM25 (`stdio`, `Streamable-HTTP`, `SSE`)
`slimmcp-proxy` (`github.com/apexhive-hq/slimmcp-proxy`, 100% Free MIT) aggregates both local `stdio` child servers and remote `Streamable-HTTP` / `SSE` MCP servers behind three meta-tools:

- **`discover_tools(query, server?, limit?)`**: Runs deterministic BM25 ranking over tool names, descriptions, and argument names—returning compact summaries without full parameter schemas.
- **`inspect_tool_schema(server, tool)`**: Fetches the exact JSON schema for the one tool the agent decides to use.
- **`invoke_tool(server, tool, arguments)`**: Masks accidental secret leaks (AWS keys, GitHub PATs, Stripe keys, OpenAI tokens, PEM blocks, JWTs), checks optional local policy rules (`--policy`), and proxies execution.

### Reproducible Benchmark (60-Tool Fixture)
Running the included benchmark against real `stdio` child processes:
- **Upstream `tools/list`:** `60,185` UTF-8 bytes (`~15,047` tokens at `Math.ceil(bytes / 4)`)
- **`slimmcp-proxy` initial `tools/list`:** `1,286` UTF-8 bytes (`~322` tokens, **`97.86%` initial schema reduction**)
- **Net 1-turn lookup cost** *(meta-tools + 5 BM25 results + 1 lazy schema)*: **`~737` tokens** (**`~95.1%` net 1-turn savings**)

### Run Directly via npm or Build Locally (Node.js >= 24)
```bash
# Instant run via npm:
npx -y slimmcp-proxy --help
npx -y slimmcp-proxy serve --config /abs/path/to/mcp-servers.json

# Or build from GitHub source:
git clone https://github.com/apexhive-hq/slimmcp-proxy.git
cd slimmcp-proxy/cli
pnpm install --ignore-scripts
pnpm run build
node dist/src/cli.js benchmark --config slimmcp.config.example.json
```

All core tools across **ApexHive Labs** (`slimmcp-proxy`, `zerofiat-base-checkout-kit`, `web3-ops-automation-pack`, `mcp-doctor`, `open-center-os`) are **100% free MIT** with zero pay-gated features, paired with our hosted cloud futures risk flagship [`evalshield-copilot`](https://evalshield-copilot.apexhive-hq.workers.dev/).

---

## 3. Staggered Execution & `/ego-lite-browser` `handOff()` Checklist (Chairman-Gated)

Per **ApexHive Holdings** Anti-Ban Pacing & Privacy Isolation rules, **do NOT auto-submit** PRs or posts concurrently:
1. **Showcase Deploy (`infra-ops`):** Deploy `products/apexhive-showcase/site/` to Cloudflare Pages via `wrangler` using `infra-ops` sandboxed credentials.
2. **OSS Directory Tracking (`1 PR / 24h`):**
   - `punkpeye/awesome-mcp-servers` PR `#20646` (open, `has-glama` verified).
   - `TensorBlock/awesome-mcp-servers` PR `#6876` (open, `mergeable_state: clean`).
   - Official MCP Registry (`io.github.apexhive-hq/slimmcp-proxy`) live at `registry.modelcontextprotocol.io`.
   - `mcpservers.org` (`wong2`) submission `#21379` pending free queue review.
3. **Technical Post (Staggered):**
   - Publish Dev.to / Paragraph article first (`await task.handOff()` for login/wallet signature), then submit `Show HN` cleanly without vote solicitation or automated replies.
