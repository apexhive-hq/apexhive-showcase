(function () {
  const FIXED_BYTES = 1286;
  const FIXED_TOKENS = Math.ceil(FIXED_BYTES / 4); // 322
  const RAW_ENVELOPE_BYTES = 5; // JSON tools/list envelope framing matching 60,185 B verified fixture
  const TURN_ONE_LOOKUP_OVERHEAD = 415; // 5 BM25 summaries (232 tok) + 1 lazy schema (183 tok)

  const elTools = document.getElementById("toolCount");
  const elBytes = document.getElementById("bytesPerTool");
  const elTurns = document.getElementById("turnsPerSession");
  const elPrice = document.getElementById("pricePerMillion");

  if (!elTools || !elBytes || !elTurns || !elPrice) return;

  function fmt(n) {
    return Number(n).toLocaleString("en-US");
  }

  function updateCalc() {
    const tools = Math.max(1, parseInt(elTools.value, 10) || 60);
    const bytesPerTool = Math.max(100, parseInt(elBytes.value, 10) || 1003);
    const turns = Math.max(1, parseInt(elTurns.value, 10) || 20);
    const pricePerM = parseFloat(elPrice.value) || 3;

    document.getElementById("toolCountLabel").textContent = String(tools);
    document.getElementById("bytesPerToolLabel").textContent = fmt(bytesPerTool) + " B";
    document.getElementById("turnsLabel").textContent = String(turns);

    const rawBytes = tools * bytesPerTool + RAW_ENVELOPE_BYTES;
    const rawTokens = Math.ceil(rawBytes / 4);
    const savedPerTurn = Math.max(0, rawTokens - FIXED_TOKENS);
    const reductionPct = rawBytes > 0 ? (1 - FIXED_BYTES / rawBytes) * 100 : 0;
    const turnOneTokens = FIXED_TOKENS + TURN_ONE_LOOKUP_OVERHEAD;
    const turnOneSaved = Math.max(0, rawTokens - turnOneTokens);
    const turnOneReductionPct = rawTokens > 0 ? (turnOneSaved / rawTokens) * 100 : 0;
    const savedPerSession = Math.max(0, savedPerTurn * turns - TURN_ONE_LOOKUP_OVERHEAD);
    const costSaved = (savedPerSession / 1_000_000) * pricePerM;

    document.getElementById("outRaw").textContent = fmt(rawBytes) + " B (~" + fmt(rawTokens) + " tokens)";
    document.getElementById("outReduction").textContent = reductionPct.toFixed(2) + "%";
    document.getElementById("outTurnOne").textContent =
      turnOneReductionPct.toFixed(2) + "% (~" + fmt(turnOneSaved) + " tok saved; ~" + fmt(turnOneTokens) + " tok spent)";
    document.getElementById("outPerTurn").textContent = fmt(savedPerTurn) + " tokens";
    document.getElementById("outPerSession").textContent = fmt(savedPerSession) + " tokens";
    document.getElementById("outCost").textContent = "$" + costSaved.toFixed(2);
    document.getElementById("outBreakEven").textContent =
      "100% Pure-Free MIT Proxy (slimmcp-proxy). Net " +
      fmt(turns) +
      "-turn session savings include the 1-turn lookup overhead (~415 tokens) and support stdio, Streamable-HTTP, and SSE upstreams.";
  }

  [elTools, elBytes, elTurns, elPrice].forEach(function (el) {
    el.addEventListener("input", updateCalc);
    el.addEventListener("change", updateCalc);
  });
  updateCalc();

  document.querySelectorAll(".copy-btn").forEach(function (btn) {
    btn.addEventListener("click", function () {
      const targetId = btn.getAttribute("data-copy");
      const pre = targetId ? document.getElementById(targetId) : null;
      if (!pre) return;
      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(pre.textContent || "").then(function () {
          btn.textContent = "Copied";
          setTimeout(function () {
            btn.textContent = "Copy";
          }, 1500);
        });
      }
    });
  });
})();
