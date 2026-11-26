# `slimmcp-proxy` — Zero-Spam OSS Directory & PR Targets

**Verified Package Status:** `slimmcp-proxy@1.0.1` is **live on npm** (`npx -y slimmcp-proxy --help` / `npx -y slimmcp-proxy serve --config ...`) alongside source builds from `https://github.com/apexhive-hq/slimmcp-proxy` (MIT). `apexhive-mcp-doctor@1.0.0` is also live on npm (`npx -y apexhive-mcp-doctor status`).

---

## Target 1: `punkpeye/awesome-mcp-servers` (PR `#20646` Open)
- **Repository:** `https://github.com/punkpeye/awesome-mcp-servers`
- **Status:** PR `#20646` submitted (`state: "open"`, `mergeable_state: "clean"`), Glama backlink satisfied via `https://glama.ai/mcp/servers/apexhive-hq/slimmcp-proxy`.
- **Exact Plan:** See [`wave1-pr1-plan.md`](./wave1-pr1-plan.md).

---

## Target 2: `TensorBlock/awesome-mcp-servers` (Active Wave 1 PR #2 Target)
- **Repository:** `https://github.com/TensorBlock/awesome-mcp-servers` (`pushed_at: 2026-11-25`, actively merging community PRs)
- **Verified Rules:** Edit the matching category file under `docs/` (`docs/developer-productivity--utilities.md`), include `[owner/repo](url): ...`, `Install:`, `Transport:`, `Tools:`, `License:`.
- **Exact Diff & PR Plan:** See [`wave1-pr2-modelcontextprotocol-plan.md`](./wave1-pr2-modelcontextprotocol-plan.md).

---

## Target 3: `wong2/awesome-mcp-servers` & `modelcontextprotocol/servers` (Web / Registry Only — No PRs)
- **`modelcontextprotocol/servers` (`CONTRIBUTING.md` + `README.md`):** Removed its Community Servers list and **forbids external PRs** (*"We accept issues, not pull requests"*). Server listings must publish to the **Official MCP Registry** (`https://registry.modelcontextprotocol.io/`, `slimmcp-proxy/server.json` ready for Chairman `mcp-publisher login github`).
- **`wong2/awesome-mcp-servers` (`README.md`):** States *"We do not accept PRs. Please submit your MCP on the website: https://mcpservers.org/submit"* (GitHub OAuth web form).

---

## Secondary Web Directories (Submit After Optional npm Publish)
- **Glama (`https://glama.ai/mcp/servers`):** Use "Submit a Server" with GitHub URL `https://github.com/apexhive-hq/slimmcp-proxy`, category `Developer Tools`, and Showcase website URL.
- **Smithery (`https://smithery.ai/new`):** Paste `https://github.com/apexhive-hq/slimmcp-proxy` (`smithery.yaml` is already included at the repo root for stdio configuration).
